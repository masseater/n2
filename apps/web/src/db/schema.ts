import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

// ============================================================================
// Authentication Tables (for better-auth)
// ============================================================================

/**
 * ユーザー情報テーブル
 * better-auth が使用する基本的なユーザー情報を保持
 */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  timezone: text("timezone").default("Asia/Tokyo"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

/**
 * セッション管理テーブル
 * better-auth のセッショントークンを管理
 */
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

/**
 * OAuth アカウント連携テーブル
 * Google OAuth などの外部プロバイダーとの連携情報
 */
export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

/**
 * メール検証テーブル
 * メールアドレス検証用のトークンを管理
 */
export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// ============================================================================
// Application Tables
// ============================================================================

/**
 * ステータス種別の列挙型
 * - todo: 未着手
 * - in_progress: 作業中
 * - done: 完了
 * - custom: ユーザー定義のカスタムステータス
 */
export const STATUS_TYPES = ["todo", "in_progress", "done", "custom"] as const;

/**
 * ステータス管理テーブル
 * デフォルト3状態（TODO/In Progress/Done）+ ユーザー拡張可能
 */
export const statuses = sqliteTable(
  "statuses",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    position: integer("position").notNull(),
    isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
    type: text("type", { enum: STATUS_TYPES }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [index("statuses_user_id_idx").on(table.userId)],
);

/**
 * タグ管理テーブル
 * タスクに付与できるラベル（色付き）
 */
export const tags = sqliteTable(
  "tags",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color").notNull().default("#6b7280"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [index("tags_user_id_idx").on(table.userId)],
);

/**
 * タスク管理テーブル
 * 無限階層対応（materialized path パターン）
 *
 * path の形式: /parentId1/parentId2/... (ルートタスクは空文字列)
 * position: 同階層内での表示順序
 * completedAt: Done ステータスに変更された日時（日報表示の判定に使用）
 */
export const tasks = sqliteTable(
  "tasks",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    statusId: text("status_id")
      .notNull()
      .references(() => statuses.id),
    parentId: text("parent_id").references((): ReturnType<typeof text> => tasks.id, {
      onDelete: "cascade",
    }),
    path: text("path").notNull().default(""),
    position: integer("position").notNull().default(0),
    priority: integer("priority"),
    dueDate: integer("due_date", { mode: "timestamp" }),
    estimatedMinutes: integer("estimated_minutes"),
    rrule: text("rrule"),
    completedAt: integer("completed_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    index("tasks_user_id_path_idx").on(table.userId, table.path),
    index("tasks_user_id_status_idx").on(table.userId, table.statusId),
    index("tasks_user_id_due_date_idx").on(table.userId, table.dueDate),
    index("tasks_user_id_completed_at_idx").on(table.userId, table.completedAt),
    index("tasks_parent_id_idx").on(table.parentId),
  ],
);

/**
 * タスクアーカイブテーブル
 * 削除されたタスクを保持（ソフトデリート）
 * 復元可能、定期的にクリーンアップ
 */
export const tasksArchive = sqliteTable(
  "tasks_archive",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    statusId: text("status_id").notNull(),
    parentId: text("parent_id"),
    path: text("path").notNull(),
    position: integer("position").notNull(),
    priority: integer("priority"),
    dueDate: integer("due_date", { mode: "timestamp" }),
    estimatedMinutes: integer("estimated_minutes"),
    rrule: text("rrule"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
    archivedAt: integer("archived_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [index("tasks_archive_user_id_idx").on(table.userId)],
);

/**
 * タスク-タグ中間テーブル
 * 多対多のリレーション
 */
export const taskTags = sqliteTable(
  "task_tags",
  {
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.taskId, table.tagId] })],
);

/**
 * 日報テーブル
 * 1日1レコード（ユーザーごと）
 * notes: Markdown形式の自由記述欄
 */
export const dailyReports = sqliteTable(
  "daily_reports",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [index("daily_reports_user_id_date_idx").on(table.userId, table.date)],
);

/**
 * 日報-タスク中間テーブル
 * 各タスクに対する日報エントリー（昨日やったこと・今日やること）
 *
 * タスク主軸の設計:
 *   タスクA → yesterdayNote: "○○を実装", todayNote: "テストを書く"
 *   タスクB → yesterdayNote: "調査完了", todayNote: "実装開始"
 *
 * statusId: その日時点のステータスをスナップショット保持
 * nextStatusId: 日報から変更する次のステータス（今日以降に反映）
 */
export const dailyReportTasks = sqliteTable(
  "daily_report_tasks",
  {
    dailyReportId: text("daily_report_id")
      .notNull()
      .references(() => dailyReports.id, { onDelete: "cascade" }),
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    statusId: text("status_id")
      .notNull()
      .references(() => statuses.id),
    nextStatusId: text("next_status_id").references(() => statuses.id),
    yesterdayNote: text("yesterday_note"),
    todayNote: text("today_note"),
    position: integer("position").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.dailyReportId, table.taskId] })],
);

/**
 * タスク説明のバージョン履歴テーブル
 * description 保存時に自動的にバージョンを作成
 */
export const taskDescriptionVersions = sqliteTable(
  "task_description_versions",
  {
    id: text("id").primaryKey(),
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    version: integer("version").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    index("task_description_versions_task_id_idx").on(table.taskId),
    index("task_description_versions_task_id_version_idx").on(table.taskId, table.version),
  ],
);
