/**
 * 日報タスク関連付け API
 * パス: /api/daily-reports/:date/tasks
 */
import { createFileRoute } from "@tanstack/react-router";
import { withAuth, errorResponse } from "@/lib/api-utils";
import { DailyReportService } from "@/features/daily-reports/service/daily-report-service";
import type { AddTaskToDailyReportInput } from "@/features/daily-reports/types";

type RouteParams = { date: string };

export const Route = createFileRoute("/api/daily-reports/$date/tasks")({
  server: {
    handlers: {
      POST: async ({ request, params }: { request: Request; params: RouteParams }) => {
        return withAuth(request, async (ctx) => {
          const body = (await request.json()) as AddTaskToDailyReportInput;

          if (!body.taskId || !body.section) {
            return errorResponse("taskId and section are required", 400);
          }

          const service = new DailyReportService(ctx.db, ctx.userId);
          await service.addTask(params.date, body);
          return new Response(null, { status: 201 });
        });
      },
      DELETE: async ({ request, params }: { request: Request; params: RouteParams }) => {
        return withAuth(request, async (ctx) => {
          const url = new URL(request.url);
          const taskId = url.searchParams.get("taskId");

          if (!taskId) {
            return errorResponse("taskId is required", 400);
          }

          const service = new DailyReportService(ctx.db, ctx.userId);
          await service.removeTask(params.date, taskId);
          return new Response(null, { status: 204 });
        });
      },
    },
  },
});
