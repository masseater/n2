import { eq, and, like, inArray, gte, lte, sql } from "drizzle-orm";
import type { ServiceDatabase } from "../../../db/types";
import { tasks, statuses, tags, taskTags, tasksArchive } from "../../../db/schema";
import { generateId } from "../../../lib/api-utils";
import type { CreateTaskInput, UpdateTaskInput, TaskFilter, TaskWithRelations } from "../types";

/**
 * タスクサービス
 * タスクの CRUD 操作とビジネスロジックを提供
 */
export class TaskService {
  constructor(
    private db: ServiceDatabase,
    private userId: string
  ) {}

  /**
   * タスク一覧を取得
   */
  async list(filter?: TaskFilter): Promise<TaskWithRelations[]> {
    let query = this.db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, this.userId))
      .$dynamic();

    // フィルター適用
    if (filter?.statusIds && filter.statusIds.length > 0) {
      query = query.where(inArray(tasks.statusId, filter.statusIds));
    }
    if (filter?.parentId !== undefined) {
      if (filter.parentId === null) {
        query = query.where(sql`${tasks.parentId} IS NULL`);
      } else {
        query = query.where(eq(tasks.parentId, filter.parentId));
      }
    }
    if (filter?.priorityMin !== undefined) {
      query = query.where(gte(tasks.priority, filter.priorityMin));
    }
    if (filter?.priorityMax !== undefined) {
      query = query.where(lte(tasks.priority, filter.priorityMax));
    }
    if (filter?.dueDateFrom) {
      query = query.where(gte(tasks.dueDate, filter.dueDateFrom));
    }
    if (filter?.dueDateTo) {
      query = query.where(lte(tasks.dueDate, filter.dueDateTo));
    }
    if (filter?.search) {
      query = query.where(like(tasks.title, `%${filter.search}%`));
    }

    const taskList = await query;

    // リレーションを取得
    return this.attachRelations(taskList);
  }

  /**
   * 単一タスクを取得
   */
  async get(taskId: string): Promise<TaskWithRelations | null> {
    const [task] = await this.db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, this.userId)));

    if (!task) return null;

    const [result] = await this.attachRelations([task]);
    return result ?? null;
  }

  /**
   * タスクを作成
   */
  async create(input: CreateTaskInput): Promise<TaskWithRelations> {
    const id = generateId();
    const now = new Date();

    // 親タスクの path を取得
    let path = "";
    if (input.parentId) {
      const [parent] = await this.db
        .select({ path: tasks.path })
        .from(tasks)
        .where(eq(tasks.id, input.parentId));
      if (parent) {
        path = parent.path ? `${parent.path}/${input.parentId}` : `/${input.parentId}`;
      }
    }

    // position を計算（同階層の末尾）
    const position =
      input.position ??
      (await this.getNextPosition(input.parentId ?? null));

    await this.db.insert(tasks).values({
      id,
      userId: this.userId,
      title: input.title,
      description: input.description ?? null,
      statusId: input.statusId,
      parentId: input.parentId ?? null,
      path,
      position,
      priority: input.priority ?? null,
      dueDate: input.dueDate ?? null,
      estimatedMinutes: input.estimatedMinutes ?? null,
      rrule: input.rrule ?? null,
      createdAt: now,
      updatedAt: now,
    });

    const created = await this.get(id);
    if (!created) {
      throw new Error("タスクの作成に失敗しました");
    }
    return created;
  }

  /**
   * タスクを更新
   */
  async update(taskId: string, input: UpdateTaskInput): Promise<TaskWithRelations> {
    const existing = await this.get(taskId);
    if (!existing) {
      throw new Error("タスクが見つかりません");
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.statusId !== undefined) updateData.statusId = input.statusId;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.dueDate !== undefined) updateData.dueDate = input.dueDate;
    if (input.estimatedMinutes !== undefined) updateData.estimatedMinutes = input.estimatedMinutes;
    if (input.rrule !== undefined) updateData.rrule = input.rrule;
    if (input.position !== undefined) updateData.position = input.position;

    await this.db
      .update(tasks)
      .set(updateData)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, this.userId)));

    const updated = await this.get(taskId);
    if (!updated) {
      throw new Error("タスクの更新に失敗しました");
    }
    return updated;
  }

  /**
   * タスクを削除（アーカイブ）
   */
  async delete(taskId: string): Promise<void> {
    const existing = await this.get(taskId);
    if (!existing) {
      throw new Error("タスクが見つかりません");
    }

    // 子タスクも含めてアーカイブ
    const childTasks = await this.db
      .select()
      .from(tasks)
      .where(
        and(eq(tasks.userId, this.userId), like(tasks.path, `%/${taskId}%`))
      );

    const allTasks = [existing, ...childTasks];
    const now = new Date();

    // アーカイブテーブルに移動
    for (const task of allTasks) {
      await this.db.insert(tasksArchive).values({
        id: task.id,
        userId: task.userId,
        title: task.title,
        description: task.description,
        statusId: task.statusId,
        parentId: task.parentId,
        path: task.path,
        position: task.position,
        priority: task.priority,
        dueDate: task.dueDate,
        estimatedMinutes: task.estimatedMinutes,
        rrule: task.rrule,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        archivedAt: now,
      });
    }

    // タスクテーブルから削除
    const taskIds = allTasks.map((t) => t.id);
    await this.db.delete(tasks).where(inArray(tasks.id, taskIds));
  }

  /**
   * タスクを移動（親変更・並べ替え）
   */
  async move(
    taskId: string,
    newParentId: string | null,
    newPosition: number
  ): Promise<TaskWithRelations> {
    const existing = await this.get(taskId);
    if (!existing) {
      throw new Error("タスクが見つかりません");
    }

    // 新しい path を計算
    let newPath = "";
    if (newParentId) {
      const [parent] = await this.db
        .select({ path: tasks.path })
        .from(tasks)
        .where(eq(tasks.id, newParentId));
      if (parent) {
        newPath = parent.path ? `${parent.path}/${newParentId}` : `/${newParentId}`;
      }
    }

    const oldPath = existing.path;
    const oldPathPrefix = oldPath ? `${oldPath}/${taskId}` : `/${taskId}`;
    const newPathPrefix = newPath ? `${newPath}/${taskId}` : `/${taskId}`;

    // 子タスクの path も更新
    if (oldPathPrefix !== newPathPrefix) {
      const childTasks = await this.db
        .select()
        .from(tasks)
        .where(
          and(eq(tasks.userId, this.userId), like(tasks.path, `${oldPathPrefix}%`))
        );

      for (const child of childTasks) {
        const updatedChildPath = child.path.replace(oldPathPrefix, newPathPrefix);
        await this.db
          .update(tasks)
          .set({ path: updatedChildPath, updatedAt: new Date() })
          .where(eq(tasks.id, child.id));
      }
    }

    // タスク自体を更新
    await this.db
      .update(tasks)
      .set({
        parentId: newParentId,
        path: newPath,
        position: newPosition,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId));

    const moved = await this.get(taskId);
    if (!moved) {
      throw new Error("タスクの移動に失敗しました");
    }
    return moved;
  }

  /**
   * アーカイブからタスクを復元
   */
  async restore(taskId: string): Promise<TaskWithRelations> {
    const [archived] = await this.db
      .select()
      .from(tasksArchive)
      .where(and(eq(tasksArchive.id, taskId), eq(tasksArchive.userId, this.userId)));

    if (!archived) {
      throw new Error("アーカイブされたタスクが見つかりません");
    }

    const now = new Date();

    // タスクテーブルに復元
    await this.db.insert(tasks).values({
      id: archived.id,
      userId: archived.userId,
      title: archived.title,
      description: archived.description,
      statusId: archived.statusId,
      parentId: archived.parentId,
      path: archived.path,
      position: archived.position,
      priority: archived.priority,
      dueDate: archived.dueDate,
      estimatedMinutes: archived.estimatedMinutes,
      rrule: archived.rrule,
      createdAt: archived.createdAt,
      updatedAt: now,
    });

    // アーカイブから削除
    await this.db.delete(tasksArchive).where(eq(tasksArchive.id, taskId));

    const restored = await this.get(taskId);
    if (!restored) {
      throw new Error("タスクの復元に失敗しました");
    }
    return restored;
  }

  /**
   * 同階層の次の position を取得
   */
  private async getNextPosition(parentId: string | null): Promise<number> {
    const condition = parentId
      ? and(eq(tasks.userId, this.userId), eq(tasks.parentId, parentId))
      : and(eq(tasks.userId, this.userId), sql`${tasks.parentId} IS NULL`);

    const [result] = await this.db
      .select({ maxPosition: sql<number>`MAX(${tasks.position})` })
      .from(tasks)
      .where(condition);

    return (result?.maxPosition ?? -1) + 1;
  }

  /**
   * タスクにリレーション（status, tags）を付与
   */
  private async attachRelations(
    taskList: (typeof tasks.$inferSelect)[]
  ): Promise<TaskWithRelations[]> {
    if (taskList.length === 0) return [];

    const taskIds = taskList.map((t) => t.id);

    // ステータス取得
    const statusList = await this.db
      .select()
      .from(statuses)
      .where(eq(statuses.userId, this.userId));
    const statusMap = new Map(statusList.map((s) => [s.id, s]));

    // タグ取得
    const tagRelations = await this.db
      .select()
      .from(taskTags)
      .where(inArray(taskTags.taskId, taskIds));

    const tagIds = [...new Set(tagRelations.map((r) => r.tagId))];
    const tagList =
      tagIds.length > 0
        ? await this.db.select().from(tags).where(inArray(tags.id, tagIds))
        : [];
    const tagMap = new Map(tagList.map((t) => [t.id, t]));

    // タスクごとのタグをマップ
    const taskTagMap = new Map<string, typeof tagList>();
    for (const relation of tagRelations) {
      const tag = tagMap.get(relation.tagId);
      if (tag) {
        const existing = taskTagMap.get(relation.taskId) ?? [];
        existing.push(tag);
        taskTagMap.set(relation.taskId, existing);
      }
    }

    return taskList.map((task) => {
      const status = statusMap.get(task.statusId);
      if (!status) {
        throw new Error(`ステータスが見つかりません: ${task.statusId}`);
      }

      return {
        ...task,
        status: {
          id: status.id,
          userId: status.userId,
          name: status.name,
          position: status.position,
          isDefault: status.isDefault,
          type: status.type,
          createdAt: status.createdAt,
          updatedAt: status.updatedAt,
        },
        tags: (taskTagMap.get(task.id) ?? []).map((tag) => ({
          id: tag.id,
          userId: tag.userId,
          name: tag.name,
          color: tag.color,
          createdAt: tag.createdAt,
          updatedAt: tag.updatedAt,
        })),
      };
    });
  }
}
