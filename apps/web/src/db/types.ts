/**
 * データベース型定義
 *
 * D1とbetter-sqlite3の両方で動作するサービス層のために
 * 共通のデータベース型を提供する。
 */

import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type * as schema from "./schema";

/**
 * サービス層で使用するデータベース型
 *
 * D1 と SQLite の共通部分のみを抽出した型。
 * 両者の intersection を取ることで、共通のメソッドのみを公開する。
 */
export type ServiceDatabase = DrizzleD1Database<typeof schema> &
  BetterSQLite3Database<typeof schema>;
