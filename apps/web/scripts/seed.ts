#!/usr/bin/env npx tsx
/**
 * 開発用シードスクリプト
 * ローカルDBにデモユーザーとデフォルトデータを作成
 */
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { users, statuses, tags, tasks, taskTags, dailyReports, dailyReportTasks } from "../src/db/schema";

const LOCAL_DEV_USER_ID = "local-dev-user";

const db = drizzle(new Database("./data/n2.db"));

/**
 * 現在時刻（UTC考慮）
 */
const now = new Date();

/**
 * 日付を YYYY-MM-DD 形式に変換
 */
function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * n日前の日付を取得
 */
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function seed() {
  console.log("🌱 Seeding database...");

  // デモユーザー作成
  console.log("  Creating demo user...");
  await db.insert(users).values({
    id: LOCAL_DEV_USER_ID,
    name: "Demo User",
    email: "demo@example.com",
    emailVerified: true,
  }).onConflictDoNothing();

  // デフォルトステータス作成
  console.log("  Creating default statuses...");
  const defaultStatuses = [
    { id: "status-todo", name: "TODO", position: 0, isDefault: true, type: "todo" as const },
    { id: "status-in-progress", name: "In Progress", position: 1, isDefault: true, type: "in_progress" as const },
    { id: "status-done", name: "Done", position: 2, isDefault: true, type: "done" as const },
  ];

  for (const status of defaultStatuses) {
    await db.insert(statuses).values({
      ...status,
      userId: LOCAL_DEV_USER_ID,
    }).onConflictDoNothing();
  }

  // サンプルタグ作成
  console.log("  Creating sample tags...");
  const sampleTags = [
    { id: "tag-work", name: "仕事", color: "#3b82f6" },
    { id: "tag-personal", name: "個人", color: "#22c55e" },
    { id: "tag-urgent", name: "緊急", color: "#ef4444" },
  ];

  for (const tag of sampleTags) {
    await db.insert(tags).values({
      ...tag,
      userId: LOCAL_DEV_USER_ID,
    }).onConflictDoNothing();
  }

  // サンプルタスク作成
  console.log("  Creating sample tasks...");
  const now = new Date();
  const sampleTasks = [
    {
      id: "task-1",
      title: "APIエンドポイントの実装",
      description: "ユーザー認証APIを実装する。OAuth2.0対応。",
      statusId: "status-in-progress",
      position: 0,
      priority: 8,
    },
    {
      id: "task-2",
      title: "フロントエンドのリファクタリング",
      description: "コンポーネントの分割と共通化を行う。",
      statusId: "status-in-progress",
      position: 1,
      priority: 6,
    },
    {
      id: "task-3",
      title: "ドキュメント作成",
      description: "API仕様書とセットアップガイドを作成。",
      statusId: "status-todo",
      position: 2,
      priority: 4,
    },
    {
      id: "task-4",
      title: "バグ修正: ログイン画面",
      description: "パスワードリセット時のエラーハンドリング修正。",
      statusId: "status-done",
      position: 3,
      priority: 9,
      completedAt: daysAgo(0),
    },
    {
      id: "task-5",
      title: "テストカバレッジ向上",
      description: "ユニットテストを追加して80%以上を目指す。",
      statusId: "status-done",
      position: 4,
      priority: 5,
      completedAt: daysAgo(1),
    },
    {
      id: "task-6",
      title: "デプロイパイプライン構築",
      description: "GitHub ActionsでCI/CDを構築。",
      statusId: "status-todo",
      position: 5,
      priority: 7,
    },
  ];

  for (const task of sampleTasks) {
    await db.insert(tasks).values({
      ...task,
      userId: LOCAL_DEV_USER_ID,
      path: "",
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing();
  }

  // タスクにタグを紐付け
  console.log("  Attaching tags to tasks...");
  const taskTagRelations = [
    { taskId: "task-1", tagId: "tag-work" },
    { taskId: "task-1", tagId: "tag-urgent" },
    { taskId: "task-2", tagId: "tag-work" },
    { taskId: "task-3", tagId: "tag-work" },
    { taskId: "task-4", tagId: "tag-work" },
    { taskId: "task-4", tagId: "tag-urgent" },
    { taskId: "task-5", tagId: "tag-work" },
    { taskId: "task-6", tagId: "tag-personal" },
  ];

  for (const relation of taskTagRelations) {
    await db.insert(taskTags).values(relation).onConflictDoNothing();
  }

  // 日報作成（今日と昨日）
  console.log("  Creating daily reports...");
  const today = formatDate(now);
  const yesterday = formatDate(daysAgo(1));

  console.log(`    Today: ${today}, Yesterday: ${yesterday}`);

  const reports = [
    { id: `report-${today}`, date: today, notes: "今日の作業メモ\n\n- 朝会で進捗共有\n- レビュー対応" },
    { id: `report-${yesterday}`, date: yesterday, notes: "昨日の振り返り\n\n- テスト完了\n- ドキュメント下書き" },
  ];

  for (const report of reports) {
    await db.insert(dailyReports).values({
      ...report,
      userId: LOCAL_DEV_USER_ID,
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing();
  }

  // 日報タスクエントリ作成
  console.log("  Creating daily report task entries...");
  const todayReportId = `report-${today}`;
  const yesterdayReportId = `report-${yesterday}`;

  const reportTaskEntries = [
    {
      dailyReportId: todayReportId,
      taskId: "task-1",
      statusId: "status-in-progress",
      yesterdayNote: "認証フローの設計完了",
      todayNote: "実装を進める",
      position: 0,
    },
    {
      dailyReportId: todayReportId,
      taskId: "task-2",
      statusId: "status-in-progress",
      yesterdayNote: null,
      todayNote: "Buttonコンポーネントの共通化",
      position: 1,
    },
    {
      dailyReportId: todayReportId,
      taskId: "task-4",
      statusId: "status-done",
      yesterdayNote: null,
      todayNote: "修正完了、マージ済み",
      position: 2,
    },
    {
      dailyReportId: yesterdayReportId,
      taskId: "task-1",
      statusId: "status-in-progress",
      yesterdayNote: "要件確認",
      todayNote: "認証フローの設計",
      position: 0,
    },
    {
      dailyReportId: yesterdayReportId,
      taskId: "task-5",
      statusId: "status-done",
      yesterdayNote: "テスト追加中",
      todayNote: "テスト完了、カバレッジ82%達成",
      position: 1,
    },
  ];

  for (const entry of reportTaskEntries) {
    await db.insert(dailyReportTasks).values(entry).onConflictDoNothing();
  }

  console.log("✅ Seed completed!");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
