/**
 * ステータス一覧取得・作成 API
 * パス: /api/statuses
 */
import { createFileRoute } from "@tanstack/react-router";
import { withAuth, jsonResponse } from "@/lib/api-utils";
import { StatusService } from "@/features/tasks/service/status-service";
import type { CreateStatusInput } from "@/features/tasks/types";

export const Route = createFileRoute("/api/statuses/")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return withAuth(request, async (ctx) => {
          const statusService = new StatusService(ctx.db, ctx.userId);
          const statuses = await statusService.list();
          return jsonResponse(statuses);
        });
      },
      POST: async ({ request }: { request: Request }) => {
        return withAuth(request, async (ctx) => {
          const body = (await request.json()) as CreateStatusInput;
          const statusService = new StatusService(ctx.db, ctx.userId);
          const status = await statusService.create(body);
          return jsonResponse(status, 201);
        });
      },
    },
  },
});
