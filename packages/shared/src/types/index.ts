// ============================================================================
// Status Types
// ============================================================================

/**
 * ステータス種別
 * - todo: 未着手
 * - in_progress: 作業中
 * - done: 完了
 * - custom: ユーザー定義のカスタムステータス
 */
export type StatusType = "todo" | "in_progress" | "done" | "custom";

/**
 * ステータス
 * ユーザーごとにカスタマイズ可能なタスクステータス
 */
export type Status = {
  id: string;
  userId: string;
  name: string;
  position: number;
  isDefault: boolean;
  type: StatusType;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * ステータス作成用の入力型
 */
export type CreateStatusInput = {
  name: string;
  position: number;
  type: StatusType;
};

// ============================================================================
// Tag Types
// ============================================================================

/**
 * タグ
 * タスクに付与できる色付きラベル
 */
export type Tag = {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * タグ作成用の入力型
 */
export type CreateTagInput = {
  name: string;
  color?: string;
};

// ============================================================================
// Task Types
// ============================================================================

/**
 * タスク
 * 無限階層対応（materialized path パターン）
 */
export type Task = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  statusId: string;
  parentId: string | null;
  path: string;
  position: number;
  priority: number | null;
  dueDate: Date | null;
  estimatedMinutes: number | null;
  rrule: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * タスク作成用の入力型
 */
export type CreateTaskInput = {
  title: string;
  description?: string;
  statusId: string;
  parentId?: string;
  position?: number;
  priority?: number;
  dueDate?: Date;
  estimatedMinutes?: number;
  rrule?: string;
};

/**
 * タスク更新用の入力型
 */
export type UpdateTaskInput = Partial<Omit<CreateTaskInput, "parentId">> & {
  parentId?: string | null;
};

/**
 * タスクとリレーション（タグ、ステータス）を含む型
 */
export type TaskWithRelations = Task & {
  status: Status;
  tags: Tag[];
  children?: TaskWithRelations[];
};

/**
 * アーカイブされたタスク
 */
export type ArchivedTask = Task & {
  archivedAt: Date;
};

// ============================================================================
// Daily Report Types
// ============================================================================

/**
 * 日報セクション種別
 * - yesterday: 昨日やったこと
 * - today: 今日やること
 */
export type DailyReportSection = "yesterday" | "today";

/**
 * 日報
 * 1日1レコード（ユーザーごと）
 */
export type DailyReport = {
  id: string;
  userId: string;
  date: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * 日報内のタスク参照
 */
export type DailyReportTask = {
  dailyReportId: string;
  taskId: string;
  section: DailyReportSection;
  position: number;
};

/**
 * 日報作成用の入力型
 */
export type CreateDailyReportInput = {
  date: string;
  notes?: string;
};

/**
 * 日報とタスクを含む型
 */
export type DailyReportWithTasks = DailyReport & {
  yesterdayTasks: TaskWithRelations[];
  todayTasks: TaskWithRelations[];
};

// ============================================================================
// View Types
// ============================================================================

/**
 * 表示モード
 * - list: リストビュー（階層表示）
 * - board: カンバンボード（ステータス別）
 * - daily: 日報ビュー
 */
export type ViewMode = "list" | "board" | "daily";

// ============================================================================
// Filter Types
// ============================================================================

/**
 * タスクフィルター条件
 */
export type TaskFilter = {
  statusIds?: string[];
  tagIds?: string[];
  priorityMin?: number;
  priorityMax?: number;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  parentId?: string | null;
  search?: string;
};

// ============================================================================
// User Types
// ============================================================================

/**
 * ユーザー
 */
export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  timezone: string | null;
  createdAt: Date;
  updatedAt: Date;
};
