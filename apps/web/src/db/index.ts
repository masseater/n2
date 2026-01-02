import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import * as schema from "./schema";
import type { ServiceDatabase } from "./types";

/**
 * Cloudflare D1 からデータベース接続を作成
 * ローカル開発時も Vite + Cloudflare プラグインにより D1 エミュレータを使用
 */
export function createDatabase(d1: D1Database): ServiceDatabase {
  return drizzleD1(d1, { schema });
}
