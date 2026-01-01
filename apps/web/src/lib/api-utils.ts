import { createDatabase } from "../db";
import type { ServiceDatabase } from "../db/types";
import { type Auth, createAuth } from "../features/auth/auth";
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
 * ローカル開発用のデモユーザーID
 */
const LOCAL_DEV_USER_ID = "local-dev-user";

/**
 * 認証済み API ハンドラーのラッパー
 * ローカル開発とCloudflare Workers の両方に対応
 */
export async function withAuth(
  request: Request,
  handler: (ctx: ApiContext) => Promise<Response>,
): Promise<Response> {
  // ローカル開発環境
  if (isLocalDevelopment()) {
    const db = getLocalDatabase();
    const auth = createAuth(db);
    return handler({ db, auth, userId: LOCAL_DEV_USER_ID });
  }

  // Cloudflare Workers 環境
  const env = getCloudflareEnv(request);
  if (!env) {
    return errorResponse("Database not configured", 500);
  }

  const db = createDatabase(env.DB);
  const auth = createAuth(db);

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
