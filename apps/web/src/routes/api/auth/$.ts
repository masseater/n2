/**
 * better-auth のすべてのルートを処理するキャッチオールルート
 * パス: /api/auth/*
 */
import { createFileRoute } from "@tanstack/react-router";
import { createDatabase } from "@/db";
import { createAuth } from "@/features/auth/auth";
import { getCloudflareEnv } from "@/lib/get-env";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const env = getCloudflareEnv(request);
        if (!env) {
          return new Response("Database not configured", { status: 500 });
        }
        const db = createDatabase(env.DB);
        const auth = createAuth(db);
        return auth.handler(request);
      },
      POST: async ({ request }: { request: Request }) => {
        const env = getCloudflareEnv(request);
        if (!env) {
          return new Response("Database not configured", { status: 500 });
        }
        const db = createDatabase(env.DB);
        const auth = createAuth(db);
        return auth.handler(request);
      },
    },
  },
});
