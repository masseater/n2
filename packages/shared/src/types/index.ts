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
 * completedAt: Done ステータスになった日時（日報表示判定に使用）
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
  completedAt: Date | null;
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
  tagIds?: string[];
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
 * 日報セクション種別（後方互換性のため残す）
 * @deprecated 新設計ではタスク主軸のため section は使用しない
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
 * 日報内のタスクエントリー
 * タスク主軸: 各タスクに対して昨日/今日のノートを入力
 */
export type DailyReportTaskEntry = {
  dailyReportId: string;
  taskId: string;
  yesterdayNote: string | null;
  todayNote: string | null;
  position: number;
};

/**
 * @deprecated 新設計では DailyReportTaskEntry を使用
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
 * 日報用タスク（タスク情報 + 日報ノート + ステータススナップショット）
 *
 * statusId/status: その日時点のステータス（スナップショット）
 * nextStatusId: 日報から設定する次のステータス（今日以降に反映）
 */
export type DailyReportTaskWithNotes = TaskWithRelations & {
  nextStatusId: string | null;
  yesterdayNote: string | null;
  todayNote: string | null;
};

/**
 * 日報とタスクを含む型（タスク主軸）
 */
export type DailyReportWithTasks = DailyReport & {
  tasks: DailyReportTaskWithNotes[];
};

/**
 * タスクの日報ノート履歴エントリー
 * 特定タスクの特定日の日報ノート
 */
export type TaskNoteHistoryEntry = {
  date: string;
  yesterdayNote: string | null;
  todayNote: string | null;
};

/**
 * タスク説明のバージョン
 * description 保存時に自動的に作成されるバージョン
 */
export type TaskDescriptionVersion = {
  id: string;
  taskId: string;
  description: string;
  version: number;
  createdAt: Date;
};

/**
 * タスク詳細ページ用の拡張情報
 * タスク基本情報 + 日報ノート履歴 + 説明バージョン履歴
 */
export type TaskDetailWithHistory = TaskWithRelations & {
  noteHistory: TaskNoteHistoryEntry[];
  descriptionVersions: TaskDescriptionVersion[];
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
