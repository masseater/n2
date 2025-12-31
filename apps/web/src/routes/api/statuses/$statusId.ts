/**
 * 個別ステータス操作 API
 * パス: /api/statuses/:statusId
 */
import { createFileRoute } from "@tanstack/react-router";
import { StatusService } from "@/features/tasks/service/status-service";
import type { CreateStatusInput } from "@/features/tasks/types";
import { errorResponse, jsonResponse, withAuth } from "@/lib/api-utils";

type RouteParams = { statusId: string };
type UpdateStatusInput = Partial<Pick<CreateStatusInput, "name" | "position">>;

export const Route = createFileRoute("/api/statuses/$statusId")({
  server: {
    handlers: {
      PUT: async ({ request, params }: { request: Request; params: RouteParams }) => {
        return withAuth(request, async (ctx) => {
          const body = (await request.json()) as UpdateStatusInput;
          const statusService = new StatusService(ctx.db, ctx.userId);
          const status = await statusService.update(params.statusId, body);
          if (!status) {
            return errorResponse("Status not found", 404);
          }
          return jsonResponse(status);
        });
      },
      DELETE: async ({ request, params }: { request: Request; params: RouteParams }) => {
        return withAuth(request, async (ctx) => {
          const statusService = new StatusService(ctx.db, ctx.userId);
          await statusService.delete(params.statusId);
          return new Response(null, { status: 204 });
        });
      },
    },
  },
});
