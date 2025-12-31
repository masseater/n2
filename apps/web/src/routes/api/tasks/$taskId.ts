/**
 * 個別タスク操作 API
 * パス: /api/tasks/:taskId
 */
import { createFileRoute } from "@tanstack/react-router";
import { TaskService } from "@/features/tasks/service/task-service";
import type { UpdateTaskInput } from "@/features/tasks/types";
import { errorResponse, jsonResponse, withAuth } from "@/lib/api-utils";

type RouteParams = { taskId: string };

export const Route = createFileRoute("/api/tasks/$taskId")({
  server: {
    handlers: {
      GET: async ({ request, params }: { request: Request; params: RouteParams }) => {
        return withAuth(request, async (ctx) => {
          const taskService = new TaskService(ctx.db, ctx.userId);
          const task = await taskService.get(params.taskId);
          if (!task) {
            return errorResponse("Task not found", 404);
          }
          return jsonResponse(task);
        });
      },
      PUT: async ({ request, params }: { request: Request; params: RouteParams }) => {
        return withAuth(request, async (ctx) => {
          const body = (await request.json()) as UpdateTaskInput;
          const taskService = new TaskService(ctx.db, ctx.userId);
          const task = await taskService.update(params.taskId, body);
          return jsonResponse(task);
        });
      },
      DELETE: async ({ request, params }: { request: Request; params: RouteParams }) => {
        return withAuth(request, async (ctx) => {
          const taskService = new TaskService(ctx.db, ctx.userId);
          await taskService.delete(params.taskId);
          return new Response(null, { status: 204 });
        });
      },
    },
  },
});
