import type { DailyReportTaskWithNotes } from "@n2/shared";
import { format, parse, subDays } from "date-fns";
import { and, eq, gte, inArray, lte } from "drizzle-orm";
import {
  dailyReports,
  dailyReportTasks,
  statuses,
  tags,
  tasks,
  taskTags,
} from "../../../db/schema";
import type { ServiceDatabase } from "../../../db/types";
import { generateId } from "../../../lib/api-utils";
import { TaskService } from "../../tasks/service/task-service";
import type { TaskWithRelations } from "../../tasks/types";
import type {
  CreateDailyReportInput,
  DailyReport,
  DailyReportWithTasks,
  UpdateDailyReportInput,
} from "../types";

const DATE_FORMAT = "yyyy-MM-dd";

/**
 * YYYY-MM-DD 文字列をDateに変換
 */
function parseDate(dateStr: string): Date {
  return parse(dateStr, DATE_FORMAT, new Date());
}

/**
 * DateをYYYY-MM-DD文字列に変換
 */
function formatDate(date: Date): string {
  return format(date, DATE_FORMAT);
}

/**
 * 1日前の日付文字列を取得
 */
function getYesterdayDateString(dateStr: string): string {
  return formatDate(subDays(parseDate(dateStr), 1));
}

/**
 * 日報サービス
 * タスク主軸の日報管理
 *
 * 表示条件:
 * 1. In Progress のタスク → 常に表示
 * 2. 昨日 Done になったタスク → 表示
 * 3. 今日 Done になったタスク → 表示
 * 4. 2日以上前に Done になったタスク → 表示しない
 */
export class DailyReportService {
  private taskService: TaskService;

  constructor(
    private db: ServiceDatabase,
    private userId: string,
  ) {
    this.taskService = new TaskService(db, userId);
  }

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
          lte(dailyReports.date, to),
        ),
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
   * タスクのノートを更新
   */
  async updateTaskNote(
    date: string,
    taskId: string,
    field: "yesterdayNote" | "todayNote",
    value: string | null,
  ): Promise<void> {
    const report = await this.getOrCreate(date);

    // 既存エントリを確認
    const [existing] = await this.db
      .select()
      .from(dailyReportTasks)
      .where(
        and(eq(dailyReportTasks.dailyReportId, report.id), eq(dailyReportTasks.taskId, taskId)),
      );

    if (existing) {
      // 更新
      await this.db
        .update(dailyReportTasks)
        .set({ [field]: value })
        .where(
          and(eq(dailyReportTasks.dailyReportId, report.id), eq(dailyReportTasks.taskId, taskId)),
        );
    } else {
      // 新規作成: タスクの現在のステータスをスナップショット
      const [task] = await this.db.select().from(tasks).where(eq(tasks.id, taskId));

      if (!task) {
        throw new Error("タスクが見つかりません");
      }

      const maxPosition = await this.getMaxPosition(report.id);
      await this.db.insert(dailyReportTasks).values({
        dailyReportId: report.id,
        taskId,
        statusId: task.statusId,
        yesterdayNote: field === "yesterdayNote" ? value : null,
        todayNote: field === "todayNote" ? value : null,
        position: maxPosition + 1,
      });
    }
  }

  /**
   * 日報からタスクのステータスを更新
   * タスク本体の statusId を即座に更新し、日報エントリに履歴として記録
   *
   * @param date 日報の日付
   * @param taskId 対象タスクID
   * @param statusId 新しいステータスID（null の場合は何もしない）
   */
  async updateNextStatus(date: string, taskId: string, statusId: string | null): Promise<void> {
    const report = await this.getOrCreate(date);

    // 既存エントリを確認
    const [existing] = await this.db
      .select()
      .from(dailyReportTasks)
      .where(
        and(eq(dailyReportTasks.dailyReportId, report.id), eq(dailyReportTasks.taskId, taskId)),
      );

    // null の場合: 元のステータスに戻す（変更取り消し）
    if (statusId === null) {
      if (existing) {
        // スナップショット（元のステータス）に戻す
        await this.taskService.update(taskId, { statusId: existing.statusId });
        // nextStatusId をクリア
        await this.db
          .update(dailyReportTasks)
          .set({ nextStatusId: null })
          .where(
            and(eq(dailyReportTasks.dailyReportId, report.id), eq(dailyReportTasks.taskId, taskId)),
          );
      }
      return;
    }

    // タスク本体のステータスを即座に更新（completedAt も自動設定される）
    await this.taskService.update(taskId, { statusId });

    if (existing) {
      // 履歴として nextStatusId に記録
      await this.db
        .update(dailyReportTasks)
        .set({ nextStatusId: statusId })
        .where(
          and(eq(dailyReportTasks.dailyReportId, report.id), eq(dailyReportTasks.taskId, taskId)),
        );
    } else {
      // 新規作成: タスクの変更前ステータスをスナップショット、変更後を nextStatusId に記録
      const [task] = await this.db.select().from(tasks).where(eq(tasks.id, taskId));

      if (!task) {
        throw new Error("タスクが見つかりません");
      }

      const maxPosition = await this.getMaxPosition(report.id);
      await this.db.insert(dailyReportTasks).values({
        dailyReportId: report.id,
        taskId,
        statusId: task.statusId, // 変更後のステータス（既に更新済み）
        nextStatusId: statusId, // 履歴として記録
        position: maxPosition + 1,
      });
    }
  }

  /**
   * 日報からタスクを削除（手動追加分のみ）
   */
  async removeTask(date: string, taskId: string): Promise<void> {
    const report = await this.getByDate(date);
    if (!report) {
      throw new Error("日報が見つかりません");
    }

    await this.db
      .delete(dailyReportTasks)
      .where(
        and(eq(dailyReportTasks.dailyReportId, report.id), eq(dailyReportTasks.taskId, taskId)),
      );
  }

  /**
   * 日報にタスク情報を付与
   * 表示条件に基づいてタスクを自動収集
   */
  private async attachTasks(report: DailyReport): Promise<DailyReportWithTasks> {
    const yesterdayDateStr = getYesterdayDateString(report.date);

    // 全タスクを取得
    const allTasks = await this.db.select().from(tasks).where(eq(tasks.userId, this.userId));

    // ステータス一覧を取得
    const statusList = await this.db
      .select()
      .from(statuses)
      .where(eq(statuses.userId, this.userId));
    const statusMap = new Map(statusList.map((s) => [s.id, s]));

    // 表示対象のタスクを抽出
    // 表示条件:
    // 1. In Progress / TODO のタスク → 表示
    // 2. 昨日 Done になったタスク → 表示（completedAt が昨日）
    // 3. 今日 Done になったタスク → 表示（completedAt が今日）
    // 4. 2日以上前に Done になったタスク → 表示しない
    const displayTaskIds = new Set<string>();
    const reportDate = parseDate(report.date);
    const yesterdayDate = subDays(reportDate, 1);

    for (const task of allTasks) {
      const status = statusMap.get(task.statusId);
      if (!status) continue;

      if (status.type === "done") {
        // Done タスクは completedAt で判定
        if (task.completedAt) {
          const completedDate = new Date(task.completedAt);
          const completedDateStr = formatDate(completedDate);
          const reportDateStr = report.date;
          const yesterdayDateStr = formatDate(yesterdayDate);

          // 今日または昨日に完了したタスクは表示
          if (completedDateStr === reportDateStr || completedDateStr === yesterdayDateStr) {
            displayTaskIds.add(task.id);
          }
        }
        continue;
      }

      // In Progress / TODO タスク → 表示
      displayTaskIds.add(task.id);
    }

    // 手動追加されたタスクも含める
    const manualEntries = await this.db
      .select()
      .from(dailyReportTasks)
      .where(eq(dailyReportTasks.dailyReportId, report.id))
      .orderBy(dailyReportTasks.position);

    for (const entry of manualEntries) {
      displayTaskIds.add(entry.taskId);
    }

    // エントリマップを作成（statusId, nextStatusId も含む）
    const entryMap = new Map(manualEntries.map((e) => [e.taskId, e]));

    // 昨日の日報から todayNote と nextStatusId を取得
    // - todayNote: 今日の yesterdayNote のデフォルト値として使用
    // - nextStatusId: 今日のステータススナップショットの初期値として使用
    const [yesterdayReport] = await this.db
      .select()
      .from(dailyReports)
      .where(and(eq(dailyReports.userId, this.userId), eq(dailyReports.date, yesterdayDateStr)));

    const yesterdayEntryMap = new Map<
      string,
      { todayNote: string | null; nextStatusId: string | null }
    >();
    if (yesterdayReport) {
      const yesterdayEntries = await this.db
        .select()
        .from(dailyReportTasks)
        .where(eq(dailyReportTasks.dailyReportId, yesterdayReport.id));
      for (const entry of yesterdayEntries) {
        yesterdayEntryMap.set(entry.taskId, {
          todayNote: entry.todayNote,
          nextStatusId: entry.nextStatusId,
        });
      }
    }

    // 対象タスクを取得してリレーションを付与
    const targetTasks = allTasks.filter((t) => displayTaskIds.has(t.id));
    const tasksWithRelations = await this.attachTaskRelations(targetTasks);

    // 結果を構築
    // 日報表示用: スナップショット（変更前）のステータスを使用
    // nextStatusId: 今日変更したステータス（変更後）
    // yesterdayNote がない場合は昨日の todayNote を使用
    const resultTasks: DailyReportTaskWithNotes[] = tasksWithRelations.map((task) => {
      const entry = entryMap.get(task.id);
      const yesterdayEntry = yesterdayEntryMap.get(task.id);

      // 日報表示用のステータス: スナップショット（変更前）を使用
      const snapshotStatusId = entry?.statusId ?? task.statusId;
      const snapshotStatus = statusMap.get(snapshotStatusId);
      if (!snapshotStatus) {
        throw new Error(`ステータスが見つかりません: ${snapshotStatusId}`);
      }

      return {
        ...task,
        statusId: snapshotStatusId,
        status: {
          id: snapshotStatus.id,
          userId: snapshotStatus.userId,
          name: snapshotStatus.name,
          position: snapshotStatus.position,
          isDefault: snapshotStatus.isDefault,
          type: snapshotStatus.type,
          createdAt: snapshotStatus.createdAt,
          updatedAt: snapshotStatus.updatedAt,
        },
        nextStatusId: entry?.nextStatusId ?? null,
        yesterdayNote: entry?.yesterdayNote ?? yesterdayEntry?.todayNote ?? null,
        todayNote: entry?.todayNote ?? null,
      };
    });

    // In Progress を先に、Done を後にソート
    resultTasks.sort((a, b) => {
      const aIsDone = a.status.type === "done";
      const bIsDone = b.status.type === "done";
      if (aIsDone !== bIsDone) return aIsDone ? 1 : -1;
      return 0;
    });

    return {
      ...report,
      tasks: resultTasks,
    };
  }

  /**
   * タスクにリレーション（status, tags）を付与
   */
  private async attachTaskRelations(
    taskList: (typeof tasks.$inferSelect)[],
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
      tagIds.length > 0 ? await this.db.select().from(tags).where(inArray(tags.id, tagIds)) : [];
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
   * 日報内の最大 position を取得
   */
  private async getMaxPosition(reportId: string): Promise<number> {
    const entries = await this.db
      .select()
      .from(dailyReportTasks)
      .where(eq(dailyReportTasks.dailyReportId, reportId));

    return entries.reduce((max, e) => Math.max(max, e.position), -1);
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
