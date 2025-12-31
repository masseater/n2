import { drizzle as drizzleD1, type DrizzleD1Database } from "drizzle-orm/d1";
import { drizzle as drizzleSqlite, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import SqliteDatabase from "better-sqlite3";
import * as schema from "./schema";

/**
 * Cloudflare D1 用の型
 */
export type D1DatabaseType = DrizzleD1Database<typeof schema>;

/**
 * ローカル開発用の型
 */
export type SqliteDatabaseType = BetterSQLite3Database<typeof schema>;

/**
 * 共通のデータベース型（Union型）
 */
export type AppDatabase = D1DatabaseType | SqliteDatabaseType;

/**
 * Cloudflare D1 用のデータベース接続を作成
 * 本番環境およびCloudflare Workers環境で使用
 */
export function createD1Database(d1: D1Database): D1DatabaseType {
  return drizzleD1(d1, { schema });
}

/**
 * ローカル開発用のSQLite接続を作成
 * better-sqlite3を使用したファイルベースのSQLite
 */
export function createSqliteDatabase(dbPath: string): SqliteDatabaseType {
  const sqlite = new SqliteDatabase(dbPath);
  sqlite.pragma("journal_mode = WAL");
  return drizzleSqlite(sqlite, { schema });
}

// 後方互換性のためのエイリアス
export const createDatabase = createD1Database;
export const createLocalDatabase = createSqliteDatabase;
export type Database = D1DatabaseType;
export type LocalDatabase = SqliteDatabaseType;

export { schema };
