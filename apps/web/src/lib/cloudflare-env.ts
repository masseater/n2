/**
 * Cloudflare Workers 環境変数へのアクセス
 * cloudflare:workers モジュールから env をインポート
 */

import { env } from "cloudflare:workers";

/**
 * Cloudflare Workers の secrets を含む環境変数の型
 * wrangler secret で設定した値は wrangler types に含まれないため手動で定義
 */
export type CloudflareEnvWithSecrets = Env & {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET: string;
};

/**
 * Cloudflare Workers 環境変数を取得
 */
export function getCloudflareEnv(): CloudflareEnvWithSecrets {
  return env as CloudflareEnvWithSecrets;
}
