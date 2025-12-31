/**
 * タスクの基本型
 */
export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  date: string; // YYYY-MM-DD format for daily view
  createdAt: Date;
  updatedAt: Date;
};

export type TaskStatus = "todo" | "in_progress" | "done";

/**
 * 日報の基本型
 */
export type DailyReport = {
  id: string;
  date: string; // YYYY-MM-DD
  summary: string | null;
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
};

/**
 * 表示モード
 */
export type ViewMode = "task" | "daily";
