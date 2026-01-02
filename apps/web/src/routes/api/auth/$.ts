/**
 * better-auth のすべてのルートを処理するキャッチオールルート
 * パス: /api/auth/*
 */
import { createFileRoute } from "@tanstack/react-router";
import { createDatabase } from "@/db";
import { createAuth } from "@/features/auth/auth";
import { getCloudflareEnv } from "@/lib/get-env";

/**
 * env から認証オプションを生成
 */
function getAuthOptions(env: ReturnType<typeof getCloudflareEnv>) {
  return {
    googleClientId: env.GOOGLE_CLIENT_ID,
    googleClientSecret: env.GOOGLE_CLIENT_SECRET,
    secret: env.BETTER_AUTH_SECRET,
  };
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const env = getCloudflareEnv();
        if (!env?.DB) {
          return new Response("Database not configured", { status: 500 });
        }
        const db = createDatabase(env.DB);
        const auth = createAuth(db, getAuthOptions(env));
        return auth.handler(request);
      },
      POST: async ({ request }: { request: Request }) => {
        const env = getCloudflareEnv();
        if (!env?.DB) {
          return new Response("Database not configured", { status: 500 });
        }
        const db = createDatabase(env.DB);
        const auth = createAuth(db, getAuthOptions(env));
        return auth.handler(request);
      },
    },
  },
});
