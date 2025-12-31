/**
 * 日報 feature 固有の型定義
 * 共通型は @n2/shared から import
 */
export type {
  DailyReport,
  DailyReportTask,
  DailyReportSection,
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
 * 日報にタスクを追加する入力型
 */
export type AddTaskToDailyReportInput = {
  taskId: string;
  section: "yesterday" | "today";
  position?: number;
};

/**
 * 日報からタスクを削除する入力型
 */
export type RemoveTaskFromDailyReportInput = {
  taskId: string;
};

/**
 * 日報内タスクの並べ替え入力型
 */
export type ReorderDailyReportTaskInput = {
  taskId: string;
  section: "yesterday" | "today";
  newPosition: number;
};
