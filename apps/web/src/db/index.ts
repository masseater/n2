import SqliteDatabase from "better-sqlite3";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import * as schema from "./schema";
import type { ServiceDatabase } from "./types";

/**
 * Cloudflare D1 からデータベース接続を作成
 */
export function createDatabase(d1: D1Database): ServiceDatabase {
  return drizzleD1(d1, { schema });
}

/**
 * ローカル開発用のSQLite接続を作成
 */
export function createLocalDatabase(dbPath: string): ServiceDatabase {
  const sqlite = new SqliteDatabase(dbPath);
  sqlite.pragma("journal_mode = WAL");
  return drizzleSqlite(sqlite, { schema });
}
