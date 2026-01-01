/**
 * データベース型定義
 *
 * D1とbetter-sqlite3の両方で動作するサービス層のために
 * 共通のデータベース型を提供する。
 */

import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import type * as schema from "./schema";

/**
 * サービス層で使用するデータベース型
 *
 * BaseSQLiteDatabase は D1 と better-sqlite3 の共通基底型。
 * 型引数: TResultKind, TRunResult, TFullSchema, TSchema
 */
export type ServiceDatabase = BaseSQLiteDatabase<"async" | "sync", unknown, typeof schema>;
