/**
 * 個別タグ操作 API
 * パス: /api/tags/:tagId
 */
import { createFileRoute } from "@tanstack/react-router";
import { TagService } from "@/features/tasks/service/tag-service";
import type { CreateTagInput } from "@/features/tasks/types";
import { errorResponse, jsonResponse, withAuth } from "@/lib/api-utils";

type RouteParams = { tagId: string };
type UpdateTagInput = Partial<CreateTagInput>;

export const Route = createFileRoute("/api/tags/$tagId")({
  server: {
    handlers: {
      PUT: async ({ request, params }: { request: Request; params: RouteParams }) => {
        return withAuth(request, async (ctx) => {
          const body = (await request.json()) as UpdateTagInput;
          const tagService = new TagService(ctx.db, ctx.userId);
          const tag = await tagService.update(params.tagId, body);
          if (!tag) {
            return errorResponse("Tag not found", 404);
          }
          return jsonResponse(tag);
        });
      },
      DELETE: async ({ request, params }: { request: Request; params: RouteParams }) => {
        return withAuth(request, async (ctx) => {
          const tagService = new TagService(ctx.db, ctx.userId);
          await tagService.delete(params.tagId);
          return new Response(null, { status: 204 });
        });
      },
    },
  },
});
