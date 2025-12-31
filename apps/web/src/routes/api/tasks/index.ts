/**
 * タスク一覧取得・作成 API
 * パス: /api/tasks
 */
import { createFileRoute } from "@tanstack/react-router";
import { withAuth, jsonResponse } from "@/lib/api-utils";
import { TaskService } from "@/features/tasks/service/task-service";
import type { CreateTaskInput } from "@/features/tasks/types";

export const Route = createFileRoute("/api/tasks/")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return withAuth(request, async (ctx) => {
          const url = new URL(request.url);
          const parentId = url.searchParams.get("parentId");
          const statusIds = url.searchParams.get("statusIds")?.split(",").filter(Boolean);
          const tagIds = url.searchParams.get("tagIds")?.split(",").filter(Boolean);
          const priorityMin = url.searchParams.get("priorityMin");
          const priorityMax = url.searchParams.get("priorityMax");
          const dueDateFrom = url.searchParams.get("dueDateFrom");
          const dueDateTo = url.searchParams.get("dueDateTo");
          const search = url.searchParams.get("search");

          const taskService = new TaskService(ctx.db, ctx.userId);
          const tasks = await taskService.list({
            parentId: parentId === "null" ? null : parentId ?? undefined,
            statusIds,
            tagIds,
            priorityMin: priorityMin ? Number.parseInt(priorityMin, 10) : undefined,
            priorityMax: priorityMax ? Number.parseInt(priorityMax, 10) : undefined,
            dueDateFrom: dueDateFrom ? new Date(dueDateFrom) : undefined,
            dueDateTo: dueDateTo ? new Date(dueDateTo) : undefined,
            search: search ?? undefined,
          });

          return jsonResponse(tasks);
        });
      },
      POST: async ({ request }: { request: Request }) => {
        return withAuth(request, async (ctx) => {
          const body = (await request.json()) as CreateTaskInput;
          const taskService = new TaskService(ctx.db, ctx.userId);
          const task = await taskService.create(body);
          return jsonResponse(task, 201);
        });
      },
    },
  },
});
