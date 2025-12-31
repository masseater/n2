/**
 * タグ一覧取得・作成 API
 * パス: /api/tags
 */
import { createFileRoute } from "@tanstack/react-router";
import { TagService } from "@/features/tasks/service/tag-service";
import type { CreateTagInput } from "@/features/tasks/types";
import { jsonResponse, withAuth } from "@/lib/api-utils";

export const Route = createFileRoute("/api/tags/")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return withAuth(request, async (ctx) => {
          const tagService = new TagService(ctx.db, ctx.userId);
          const tags = await tagService.list();
          return jsonResponse(tags);
        });
      },
      POST: async ({ request }: { request: Request }) => {
        return withAuth(request, async (ctx) => {
          const body = (await request.json()) as CreateTagInput;
          const tagService = new TagService(ctx.db, ctx.userId);
          const tag = await tagService.create(body);
          return jsonResponse(tag, 201);
        });
      },
    },
  },
});
