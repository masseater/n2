#!/usr/bin/env npx tsx
/**
 * 開発用シードスクリプト
 * ローカルDBにデモユーザーとデフォルトデータを作成
 */
import Database from "better-sqlite3";
import { format, subDays } from "date-fns";
import { drizzle } from "drizzle-orm/better-sqlite3";
import {
  dailyReports,
  dailyReportTasks,
  statuses,
  tags,
  tasks,
  taskTags,
  users,
} from "../src/db/schema";

const LOCAL_DEV_USER_ID = "local-dev-user";
const DATE_FORMAT = "yyyy-MM-dd";

const db = drizzle(new Database("./data/n2.db"));

async function seed() {
  console.log("🌱 Seeding database...");

  // デモユーザー作成
  console.log("  Creating demo user...");
  await db
    .insert(users)
    .values({
      id: LOCAL_DEV_USER_ID,
      name: "Demo User",
      email: "demo@example.com",
      emailVerified: true,
    })
    .onConflictDoNothing();

  // デフォルトステータス作成
  console.log("  Creating default statuses...");
  const defaultStatuses = [
    { id: "status-todo", name: "TODO", position: 0, isDefault: true, type: "todo" as const },
    {
      id: "status-in-progress",
      name: "In Progress",
      position: 1,
      isDefault: true,
      type: "in_progress" as const,
    },
    { id: "status-done", name: "Done", position: 2, isDefault: true, type: "done" as const },
  ];

  for (const status of defaultStatuses) {
    await db
      .insert(statuses)
      .values({
        ...status,
        userId: LOCAL_DEV_USER_ID,
      })
      .onConflictDoNothing();
  }

  // サンプルタグ作成
  console.log("  Creating sample tags...");
  const sampleTags = [
    { id: "tag-work", name: "仕事", color: "#3b82f6" },
    { id: "tag-personal", name: "個人", color: "#22c55e" },
    { id: "tag-urgent", name: "緊急", color: "#ef4444" },
  ];

  for (const tag of sampleTags) {
    await db
      .insert(tags)
      .values({
        ...tag,
        userId: LOCAL_DEV_USER_ID,
      })
      .onConflictDoNothing();
  }

  // サンプルタスク作成
  // 日報表示条件: TODO / In Progress → 自動表示、Done → 表示しない（手動追加で表示可）
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
      title: "デプロイパイプライン構築",
      description: "GitHub ActionsでCI/CDを構築。",
      statusId: "status-todo",
      position: 3,
      priority: 7,
    },
    {
      id: "task-5",
      title: "パフォーマンス改善",
      description: "ボトルネック調査と最適化。",
      statusId: "status-in-progress",
      position: 4,
      priority: 5,
    },
  ];

  for (const task of sampleTasks) {
    await db
      .insert(tasks)
      .values({
        ...task,
        userId: LOCAL_DEV_USER_ID,
        path: "",
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing();
  }

  // タスクにタグを紐付け
  console.log("  Attaching tags to tasks...");
  const taskTagRelations = [
    { taskId: "task-1", tagId: "tag-work" },
    { taskId: "task-1", tagId: "tag-urgent" },
    { taskId: "task-2", tagId: "tag-work" },
    { taskId: "task-3", tagId: "tag-work" },
    { taskId: "task-4", tagId: "tag-personal" },
    { taskId: "task-5", tagId: "tag-work" },
  ];

  for (const relation of taskTagRelations) {
    await db.insert(taskTags).values(relation).onConflictDoNothing();
  }

  // 日報作成（今日と昨日）
  // 日報表示ロジック:
  // - yesterdayNote がない場合、昨日の todayNote が自動引き継ぎ
  // - statusId: その日時点のスナップショット（変更前ステータス）
  // - nextStatusId: 今日変更したステータス（履歴用）
  console.log("  Creating daily reports...");
  const today = format(now, DATE_FORMAT);
  const yesterday = format(subDays(now, 1), DATE_FORMAT);

  console.log(`    Today: ${today}, Yesterday: ${yesterday}`);

  const reports = [
    {
      id: `report-${today}`,
      date: today,
      notes: "今日の振り返り\n\n- 朝会で進捗共有\n- レビュー対応完了",
    },
    {
      id: `report-${yesterday}`,
      date: yesterday,
      notes: "昨日の振り返り\n\n- 設計レビュー実施\n- 実装方針決定",
    },
  ];

  for (const report of reports) {
    await db
      .insert(dailyReports)
      .values({
        ...report,
        userId: LOCAL_DEV_USER_ID,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing();
  }

  // 日報タスクエントリ作成
  // 全タスクは TODO/In Progress なので日報に自動表示される
  // ここでは追加情報（ノート）を持つエントリのみ作成
  console.log("  Creating daily report task entries...");
  const todayReportId = `report-${today}`;
  const yesterdayReportId = `report-${yesterday}`;

  const reportTaskEntries = [
    // 今日の日報エントリ
    {
      dailyReportId: todayReportId,
      taskId: "task-1",
      statusId: "status-in-progress",
      nextStatusId: null,
      yesterdayNote: null, // 昨日の todayNote が自動引き継ぎされる
      todayNote: "実装を進める。エラーハンドリング追加予定",
      position: 0,
    },
    {
      dailyReportId: todayReportId,
      taskId: "task-2",
      statusId: "status-in-progress",
      nextStatusId: null,
      yesterdayNote: null,
      todayNote: "Buttonコンポーネントの共通化",
      position: 1,
    },
    // 昨日の日報エントリ
    {
      dailyReportId: yesterdayReportId,
      taskId: "task-1",
      statusId: "status-in-progress",
      nextStatusId: null,
      yesterdayNote: "要件確認",
      todayNote: "認証フローの設計完了", // 今日の yesterdayNote として自動引き継ぎ
      position: 0,
    },
    {
      dailyReportId: yesterdayReportId,
      taskId: "task-5",
      statusId: "status-in-progress",
      nextStatusId: null,
      yesterdayNote: "ボトルネック調査",
      todayNote: "プロファイリング実施",
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
