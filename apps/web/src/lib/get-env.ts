/**
 * 環境変数を取得するためのユーティリティ
 * Cloudflare Workers とローカル開発の両方に対応
 */

import { createLocalDatabase } from "@/db";
import type { ServiceDatabase } from "@/db/types";

/**
 * Cloudflare Workers 環境変数の型定義
 */
export type CloudflareEnv = {
  DB: D1Database;
};

/**
 * ローカル開発かどうかを判定
 */
export function isLocalDevelopment(): boolean {
  return process.env.NODE_ENV === "development" && !process.env.CLOUDFLARE_WORKERS;
}

/**
 * ローカル開発用のDBパスを取得
 */
function getLocalDbPath(): string {
  return process.env.LOCAL_DB_PATH ?? "./data/n2.db";
}

let localDbInstance: ServiceDatabase | null = null;

/**
 * ローカル開発用のDB接続を取得（シングルトン）
 */
export function getLocalDatabase(): ServiceDatabase {
  if (!localDbInstance) {
    localDbInstance = createLocalDatabase(getLocalDbPath());
  }
  return localDbInstance;
}

/**
 * Request から Cloudflare 環境変数を取得
 *
 * @param request - HTTP リクエスト
 * @returns 環境変数オブジェクト、または undefined
 */
export function getCloudflareEnv(request: Request): CloudflareEnv | undefined {
  // Cloudflare Workers では request.cf.env に環境変数が格納される
  // TanStack Start では getRequestContext() を使用することも可能
  const cfProperty = Object.getOwnPropertyDescriptor(request, "cf");
  if (!cfProperty?.value) {
    return undefined;
  }

  const cf = cfProperty.value;
  if (typeof cf !== "object" || cf === null) {
    return undefined;
  }

  const envProperty = Object.getOwnPropertyDescriptor(cf, "env");
  if (!envProperty?.value) {
    return undefined;
  }

  const env = envProperty.value;
  if (typeof env !== "object" || env === null) {
    return undefined;
  }

  // D1Database の存在確認
  if (!("DB" in env)) {
    return undefined;
  }

  return env as CloudflareEnv;
}
