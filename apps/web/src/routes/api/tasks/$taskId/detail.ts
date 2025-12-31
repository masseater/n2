/**
 * タスク詳細（履歴付き）API
 * パス: /api/tasks/:taskId/detail
 * 日報ノート履歴と説明バージョン履歴を含む
 */
import { createFileRoute } from "@tanstack/react-router";
import { withAuth, jsonResponse, errorResponse } from "@/lib/api-utils";
import { TaskService } from "@/features/tasks/service/task-service";

type RouteParams = { taskId: string };

export const Route = createFileRoute("/api/tasks/$taskId/detail")({
  server: {
    handlers: {
      GET: async ({ request, params }: { request: Request; params: RouteParams }) => {
        return withAuth(request, async (ctx) => {
          const taskService = new TaskService(ctx.db, ctx.userId);
          const taskDetail = await taskService.getWithHistory(params.taskId);
          if (!taskDetail) {
            return errorResponse("Task not found", 404);
          }
          return jsonResponse(taskDetail);
        });
      },
    },
  },
});
