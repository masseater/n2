/**
 * 環境変数を取得するためのユーティリティ
 * Cloudflare Workers とローカル開発の両方に対応
 *
 * NOTE: Vite + Cloudflare プラグインを使用しているため、
 * ローカル開発時も Cloudflare Workers 環境でエミュレートされる。
 * そのため better-sqlite3 は使用せず、常に D1 を使用する。
 */

/**
 * Cloudflare Workers 環境変数の型定義
 * wrangler types で生成された Env 型を再エクスポート
 */
export type CloudflareEnv = Env;

/**
 * ローカル開発かどうかを判定
 * Vite + Cloudflare プラグイン環境では、ローカルでも Workers として動作する
 */
export function isLocalDevelopment(): boolean {
  // Vite + Cloudflare プラグインでは、ローカルでも D1 エミュレータを使用するため
  // 実質的にこの判定は使用しない（常に false を返す）
  return false;
}

/**
 * Cloudflare Workers 環境変数を取得
 * cloudflare:workers モジュールから取得
 */
export { getCloudflareEnv } from "./cloudflare-env";
