import { eq, and, inArray } from "drizzle-orm";
import type { ServiceDatabase } from "../../../db/types";
import { tags, taskTags } from "../../../db/schema";
import { generateId } from "../../../lib/api-utils";
import type { Tag, CreateTagInput } from "../types";

/**
 * タグサービス
 * タグの CRUD 操作を提供
 */
export class TagService {
  constructor(
    private db: ServiceDatabase,
    private userId: string
  ) {}

  /**
   * タグ一覧を取得
   */
  async list(): Promise<Tag[]> {
    const tagList = await this.db
      .select()
      .from(tags)
      .where(eq(tags.userId, this.userId))
      .orderBy(tags.name);

    return tagList.map(this.toTag);
  }

  /**
   * 単一タグを取得
   */
  async get(tagId: string): Promise<Tag | null> {
    const [tag] = await this.db
      .select()
      .from(tags)
      .where(and(eq(tags.id, tagId), eq(tags.userId, this.userId)));

    return tag ? this.toTag(tag) : null;
  }

  /**
   * タグを作成
   */
  async create(input: CreateTagInput): Promise<Tag> {
    const id = generateId();
    const now = new Date();

    await this.db.insert(tags).values({
      id,
      userId: this.userId,
      name: input.name,
      color: input.color ?? "#6b7280",
      createdAt: now,
      updatedAt: now,
    });

    const created = await this.get(id);
    if (!created) {
      throw new Error("タグの作成に失敗しました");
    }
    return created;
  }

  /**
   * タグを更新
   */
  async update(
    tagId: string,
    input: Partial<CreateTagInput>
  ): Promise<Tag> {
    const existing = await this.get(tagId);
    if (!existing) {
      throw new Error("タグが見つかりません");
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.color !== undefined) updateData.color = input.color;

    await this.db
      .update(tags)
      .set(updateData)
      .where(and(eq(tags.id, tagId), eq(tags.userId, this.userId)));

    const updated = await this.get(tagId);
    if (!updated) {
      throw new Error("タグの更新に失敗しました");
    }
    return updated;
  }

  /**
   * タグを削除
   */
  async delete(tagId: string): Promise<void> {
    const existing = await this.get(tagId);
    if (!existing) {
      throw new Error("タグが見つかりません");
    }

    await this.db
      .delete(tags)
      .where(and(eq(tags.id, tagId), eq(tags.userId, this.userId)));
  }

  /**
   * タスクにタグを追加
   */
  async addToTask(taskId: string, tagId: string): Promise<void> {
    const tag = await this.get(tagId);
    if (!tag) {
      throw new Error("タグが見つかりません");
    }

    await this.db
      .insert(taskTags)
      .values({ taskId, tagId })
      .onConflictDoNothing();
  }

  /**
   * タスクからタグを削除
   */
  async removeFromTask(taskId: string, tagId: string): Promise<void> {
    await this.db
      .delete(taskTags)
      .where(and(eq(taskTags.taskId, taskId), eq(taskTags.tagId, tagId)));
  }

  /**
   * タスクのタグを一括設定
   */
  async setTaskTags(taskId: string, tagIds: string[]): Promise<void> {
    // 既存のタグを削除
    await this.db.delete(taskTags).where(eq(taskTags.taskId, taskId));

    // 新しいタグを追加
    if (tagIds.length > 0) {
      // タグの存在確認
      const existingTags = await this.db
        .select({ id: tags.id })
        .from(tags)
        .where(and(eq(tags.userId, this.userId), inArray(tags.id, tagIds)));

      const validTagIds = existingTags.map((t) => t.id);
      const values = validTagIds.map((tagId) => ({ taskId, tagId }));

      if (values.length > 0) {
        await this.db.insert(taskTags).values(values);
      }
    }
  }

  /**
   * DB レコードを Tag 型に変換
   */
  private toTag(record: typeof tags.$inferSelect): Tag {
    return {
      id: record.id,
      userId: record.userId,
      name: record.name,
      color: record.color,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
