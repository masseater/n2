/**
 * 認証クライアント
 * ブラウザ側で使用する認証操作用のクライアント
 */
import { createAuthClient } from "better-auth/react";

/**
 * 認証用 baseURL を取得
 * SSR 時は localhost の絶対 URL、CSR 時は相対 URL を使用
 */
function getAuthBaseURL(): string {
  if (typeof window === "undefined") {
    // SSR 時: 環境変数から取得、なければ localhost
    return process.env.AUTH_BASE_URL ?? "http://localhost:12000/api/auth";
  }
  // CSR 時: 現在のオリジンを使用
  return `${window.location.origin}/api/auth`;
}

/**
 * 認証クライアントインスタンス
 * Google OAuth ログイン、ログアウト、セッション取得に使用
 */
export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
});

/**
 * セッション取得フック
 */
export const useSession = authClient.useSession;

/**
 * Google OAuth でサインイン
 */
export async function signInWithGoogle() {
  return authClient.signIn.social({
    provider: "google",
    callbackURL: "/",
  });
}

/**
 * サインアウト
 */
export async function signOut() {
  return authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        window.location.href = "/login";
      },
    },
  });
}
