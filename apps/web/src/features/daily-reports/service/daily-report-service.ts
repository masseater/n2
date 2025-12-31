import { eq, and, gte, lte, inArray } from "drizzle-orm";
import type { ServiceDatabase } from "../../../db/types";
import { dailyReports, dailyReportTasks, tasks, statuses, tags, taskTags } from "../../../db/schema";
import { generateId } from "../../../lib/api-utils";
import type {
  DailyReport,
  DailyReportWithTasks,
  CreateDailyReportInput,
  UpdateDailyReportInput,
  AddTaskToDailyReportInput,
  DailyReportSection,
} from "../types";
import type { TaskWithRelations } from "../../tasks/types";

/**
 * 日報サービス
 * 日報の CRUD 操作とビジネスロジックを提供
 */
export class DailyReportService {
  constructor(
    private db: ServiceDatabase,
    private userId: string
  ) {}

  /**
   * 日報一覧を取得（日付範囲指定）
   */
  async list(from: string, to: string): Promise<DailyReportWithTasks[]> {
    const reports = await this.db
      .select()
      .from(dailyReports)
      .where(
        and(
          eq(dailyReports.userId, this.userId),
          gte(dailyReports.date, from),
          lte(dailyReports.date, to)
        )
      )
      .orderBy(dailyReports.date);

    return Promise.all(reports.map((r) => this.attachTasks(r)));
  }

  /**
   * 特定日の日報を取得（存在しない場合は作成）
   */
  async getOrCreate(date: string): Promise<DailyReportWithTasks> {
    let report = await this.getByDate(date);

    if (!report) {
      report = await this.create({ date });
    }

    return this.attachTasks(report);
  }

  /**
   * 日付で日報を取得
   */
  async getByDate(date: string): Promise<DailyReport | null> {
    const [report] = await this.db
      .select()
      .from(dailyReports)
      .where(and(eq(dailyReports.userId, this.userId), eq(dailyReports.date, date)));

    return report ? this.toReport(report) : null;
  }

  /**
   * 日報を作成
   */
  async create(input: CreateDailyReportInput): Promise<DailyReport> {
    const id = generateId();
    const now = new Date();

    await this.db.insert(dailyReports).values({
      id,
      userId: this.userId,
      date: input.date,
      notes: input.notes ?? null,
      createdAt: now,
      updatedAt: now,
    });

    const created = await this.getByDate(input.date);
    if (!created) {
      throw new Error("日報の作成に失敗しました");
    }
    return created;
  }

  /**
   * 日報を更新
   */
  async update(date: string, input: UpdateDailyReportInput): Promise<DailyReportWithTasks> {
    const existing = await this.getByDate(date);
    if (!existing) {
      throw new Error("日報が見つかりません");
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.notes !== undefined) updateData.notes = input.notes;

    await this.db
      .update(dailyReports)
      .set(updateData)
      .where(and(eq(dailyReports.userId, this.userId), eq(dailyReports.date, date)));

    const updated = await this.getByDate(date);
    if (!updated) {
      throw new Error("日報の更新に失敗しました");
    }
    return this.attachTasks(updated);
  }

  /**
   * 日報にタスクを追加
   */
  async addTask(date: string, input: AddTaskToDailyReportInput): Promise<void> {
    const report = await this.getOrCreate(date);

    // 同セクションの最後の position を取得
    const existingTasks = await this.db
      .select()
      .from(dailyReportTasks)
      .where(
        and(
          eq(dailyReportTasks.dailyReportId, report.id),
          eq(dailyReportTasks.section, input.section)
        )
      );

    const maxPosition = existingTasks.reduce((max, t) => Math.max(max, t.position), -1);
    const position = input.position ?? maxPosition + 1;

    await this.db
      .insert(dailyReportTasks)
      .values({
        dailyReportId: report.id,
        taskId: input.taskId,
        section: input.section,
        position,
      })
      .onConflictDoUpdate({
        target: [dailyReportTasks.dailyReportId, dailyReportTasks.taskId],
        set: { section: input.section, position },
      });
  }

  /**
   * 日報からタスクを削除
   */
  async removeTask(date: string, taskId: string): Promise<void> {
    const report = await this.getByDate(date);
    if (!report) {
      throw new Error("日報が見つかりません");
    }

    await this.db
      .delete(dailyReportTasks)
      .where(
        and(
          eq(dailyReportTasks.dailyReportId, report.id),
          eq(dailyReportTasks.taskId, taskId)
        )
      );
  }

  /**
   * 日報内タスクの並べ替え
   */
  async reorderTask(
    date: string,
    taskId: string,
    section: DailyReportSection,
    newPosition: number
  ): Promise<void> {
    const report = await this.getByDate(date);
    if (!report) {
      throw new Error("日報が見つかりません");
    }

    await this.db
      .update(dailyReportTasks)
      .set({ section, position: newPosition })
      .where(
        and(
          eq(dailyReportTasks.dailyReportId, report.id),
          eq(dailyReportTasks.taskId, taskId)
        )
      );
  }

  /**
   * 日報にタスク情報を付与
   */
  private async attachTasks(report: DailyReport): Promise<DailyReportWithTasks> {
    // 日報に紐づくタスク参照を取得
    const taskRelations = await this.db
      .select()
      .from(dailyReportTasks)
      .where(eq(dailyReportTasks.dailyReportId, report.id))
      .orderBy(dailyReportTasks.position);

    if (taskRelations.length === 0) {
      return {
        ...report,
        yesterdayTasks: [],
        todayTasks: [],
      };
    }

    const taskIds = taskRelations.map((r) => r.taskId);

    // タスク詳細を取得
    const taskList = await this.db
      .select()
      .from(tasks)
      .where(inArray(tasks.id, taskIds));

    // リレーションを付与
    const tasksWithRelations = await this.attachTaskRelations(taskList);
    const taskMap = new Map(tasksWithRelations.map((t) => [t.id, t]));

    // セクションごとに分類
    const yesterdayTasks: TaskWithRelations[] = [];
    const todayTasks: TaskWithRelations[] = [];

    for (const relation of taskRelations) {
      const task = taskMap.get(relation.taskId);
      if (task) {
        if (relation.section === "yesterday") {
          yesterdayTasks.push(task);
        } else {
          todayTasks.push(task);
        }
      }
    }

    return {
      ...report,
      yesterdayTasks,
      todayTasks,
    };
  }

  /**
   * タスクにリレーション（status, tags）を付与
   */
  private async attachTaskRelations(
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

  /**
   * DB レコードを DailyReport 型に変換
   */
  private toReport(record: typeof dailyReports.$inferSelect): DailyReport {
    return {
      id: record.id,
      userId: record.userId,
      date: record.date,
      notes: record.notes,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
