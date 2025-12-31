/**
 * better-auth のすべてのルートを処理するキャッチオールルート
 * パス: /api/auth/*
 */
import { createFileRoute } from "@tanstack/react-router";
import { getCloudflareEnv } from "@/lib/get-env";
import { createDatabase } from "@/db";
import { createAuth } from "@/features/auth/auth";

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
