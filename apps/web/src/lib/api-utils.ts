import { createDatabase } from "../db";
import type { ServiceDatabase } from "../db/types";
import { type Auth, createAuth } from "../features/auth/auth";
import { getCloudflareEnv } from "./get-env";

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
 * D1 エミュレータ使用時、認証をスキップして開発を行う
 */
const LOCAL_DEV_USER_ID = "local-dev-user";

/**
 * 認証済み API ハンドラーのラッパー
 * Cloudflare Workers 環境（ローカル D1 エミュレータを含む）に対応
 */
export async function withAuth(
  request: Request,
  handler: (ctx: ApiContext) => Promise<Response>,
): Promise<Response> {
  try {
    const env = getCloudflareEnv();
    if (!env?.DB) {
      console.error("[withAuth] DB binding not found in env:", Object.keys(env ?? {}));
      return errorResponse("Database not configured", 500);
    }

    const db = createDatabase(env.DB);
    const auth = createAuth(db, {
      googleClientId: env.GOOGLE_CLIENT_ID,
      googleClientSecret: env.GOOGLE_CLIENT_SECRET,
      secret: env.BETTER_AUTH_SECRET,
    });

    // ローカル開発時（secrets が設定されていない場合）は認証スキップ
    if (!env.BETTER_AUTH_SECRET) {
      return handler({ db, auth, userId: LOCAL_DEV_USER_ID });
    }

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return errorResponse("Unauthorized", 401);
    }

    return handler({ db, auth, userId: session.user.id });
  } catch (error) {
    console.error("[withAuth] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(`Internal error: ${message}`, 500);
  }
}

/**
 * UUID を生成
 */
export function generateId(): string {
  return crypto.randomUUID();
}
