import { createAuthClient } from "better-auth/react";

/**
 * クライアントサイド用の better-auth クライアント
 *
 * React hooks を提供:
 * - useSession: 現在のセッション情報を取得
 * - signIn: ソーシャルログイン
 * - signOut: ログアウト
 */
export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
});

export const { useSession, signIn, signOut } = authClient;
