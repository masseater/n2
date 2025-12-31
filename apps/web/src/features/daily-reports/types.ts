/**
 * 日報 feature 固有の型定義
 * 共通型は @n2/shared から import
 */
export type {
  DailyReport,
  DailyReportTaskEntry,
  DailyReportTaskWithNotes,
  DailyReportWithTasks,
  CreateDailyReportInput,
} from "@n2/shared";

/**
 * 日報更新用の入力型
 */
export type UpdateDailyReportInput = {
  notes?: string;
};

/**
 * タスクノート更新用の入力型
 */
export type UpdateTaskNoteInput = {
  taskId: string;
  field: "yesterdayNote" | "todayNote";
  value: string | null;
};

/**
 * 次のステータス更新用の入力型
 * 日報から設定する次のステータス（今日以降に反映）
 */
export type UpdateNextStatusInput = {
  taskId: string;
  field: "nextStatus";
  value: string | null;
};
