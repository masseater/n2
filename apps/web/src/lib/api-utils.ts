import { createD1Database } from "../db";
import type { ServiceDatabase } from "../db/types";
import { type Auth, createAuth, createLocalAuth } from "../features/auth/auth";
import { getCloudflareEnv, getLocalDatabase, isLocalDevelopment } from "./get-env";

/**
 * API レスポンスを JSON で返すヘルパー
 */
export function jsonResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * エラーレスポンスを返すヘルパー
 */
export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

/**
 * API コンテキストの型
 */
export type ApiContext = {
  db: ServiceDatabase;
  auth: Auth;
  userId: string;
};

/**
 * 認証済み API ハンドラーのラッパー
 * ローカル開発とCloudflare Workers の両方に対応
 *
 * @param request - HTTP リクエスト
 * @param handler - 認証済みコンテキストを受け取るハンドラー関数
 * @returns Response
 */
/**
 * ローカル開発用のデモユーザーID
 */
const LOCAL_DEV_USER_ID = "local-dev-user";

export async function withAuth(
  request: Request,
  handler: (ctx: ApiContext) => Promise<Response>,
): Promise<Response> {
  // ローカル開発環境
  if (isLocalDevelopment()) {
    const rawDb = getLocalDatabase();
    // SqliteDatabaseType は runtime で ServiceDatabase と互換
    const db = rawDb as ServiceDatabase;
    const auth = createLocalAuth(rawDb);

    // ローカル開発ではデモユーザーを使用（認証バイパス）
    return handler({ db, auth, userId: LOCAL_DEV_USER_ID });
  }

  // Cloudflare Workers 環境
  const env = getCloudflareEnv(request);
  if (!env) {
    return errorResponse("Database not configured", 500);
  }

  const rawDb = createD1Database(env.DB);
  const db = rawDb as ServiceDatabase;
  const auth = createAuth(rawDb);

  // セッション検証
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return errorResponse("Unauthorized", 401);
  }

  return handler({ db, auth, userId: session.user.id });
}

/**
 * UUID を生成
 */
export function generateId(): string {
  return crypto.randomUUID();
}
