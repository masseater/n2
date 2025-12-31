import { and, eq } from "drizzle-orm";
import { statuses } from "../../../db/schema";
import type { ServiceDatabase } from "../../../db/types";
import { generateId } from "../../../lib/api-utils";
import type { CreateStatusInput, Status, StatusType } from "../types";

/**
 * ステータスサービス
 * ステータスの CRUD 操作を提供
 */
export class StatusService {
  constructor(
    private db: ServiceDatabase,
    private userId: string,
  ) {}

  /**
   * ステータス一覧を取得
   */
  async list(): Promise<Status[]> {
    const statusList = await this.db
      .select()
      .from(statuses)
      .where(eq(statuses.userId, this.userId))
      .orderBy(statuses.position);

    return statusList.map(this.toStatus);
  }

  /**
   * 単一ステータスを取得
   */
  async get(statusId: string): Promise<Status | null> {
    const [status] = await this.db
      .select()
      .from(statuses)
      .where(and(eq(statuses.id, statusId), eq(statuses.userId, this.userId)));

    return status ? this.toStatus(status) : null;
  }

  /**
   * ステータスを作成
   */
  async create(input: CreateStatusInput): Promise<Status> {
    const id = generateId();
    const now = new Date();

    await this.db.insert(statuses).values({
      id,
      userId: this.userId,
      name: input.name,
      position: input.position,
      isDefault: false,
      type: input.type,
      createdAt: now,
      updatedAt: now,
    });

    const created = await this.get(id);
    if (!created) {
      throw new Error("ステータスの作成に失敗しました");
    }
    return created;
  }

  /**
   * ステータスを更新
   */
  async update(
    statusId: string,
    input: Partial<Pick<CreateStatusInput, "name" | "position">>,
  ): Promise<Status> {
    const existing = await this.get(statusId);
    if (!existing) {
      throw new Error("ステータスが見つかりません");
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.position !== undefined) updateData.position = input.position;

    await this.db
      .update(statuses)
      .set(updateData)
      .where(and(eq(statuses.id, statusId), eq(statuses.userId, this.userId)));

    const updated = await this.get(statusId);
    if (!updated) {
      throw new Error("ステータスの更新に失敗しました");
    }
    return updated;
  }

  /**
   * ステータスを削除
   * デフォルトステータスは削除不可
   */
  async delete(statusId: string): Promise<void> {
    const existing = await this.get(statusId);
    if (!existing) {
      throw new Error("ステータスが見つかりません");
    }

    if (existing.isDefault) {
      throw new Error("デフォルトステータスは削除できません");
    }

    await this.db
      .delete(statuses)
      .where(and(eq(statuses.id, statusId), eq(statuses.userId, this.userId)));
  }

  /**
   * デフォルトステータスを初期化
   * 新規ユーザー作成時に呼び出す
   */
  async initializeDefaults(): Promise<void> {
    const existing = await this.list();
    if (existing.length > 0) return;

    const now = new Date();
    const defaults: { name: string; type: StatusType; position: number }[] = [
      { name: "TODO", type: "todo", position: 0 },
      { name: "In Progress", type: "in_progress", position: 1 },
      { name: "Done", type: "done", position: 2 },
    ];

    for (const def of defaults) {
      await this.db.insert(statuses).values({
        id: generateId(),
        userId: this.userId,
        name: def.name,
        position: def.position,
        isDefault: true,
        type: def.type,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  /**
   * DB レコードを Status 型に変換
   */
  private toStatus(record: typeof statuses.$inferSelect): Status {
    return {
      id: record.id,
      userId: record.userId,
      name: record.name,
      position: record.position,
      isDefault: record.isDefault,
      type: record.type,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
