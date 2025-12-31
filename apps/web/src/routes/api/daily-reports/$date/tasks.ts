/**
 * 日報タスクノート API
 * パス: /api/daily-reports/:date/tasks
 */
import { createFileRoute } from "@tanstack/react-router";
import { withAuth, errorResponse } from "@/lib/api-utils";
import { DailyReportService } from "@/features/daily-reports/service/daily-report-service";
import type { UpdateTaskNoteInput, UpdateNextStatusInput } from "@/features/daily-reports/types";

type RouteParams = { date: string };

export const Route = createFileRoute("/api/daily-reports/$date/tasks")({
  server: {
    handlers: {
      /**
       * タスクノートまたは次のステータスを更新
       * PUT /api/daily-reports/:date/tasks
       * Body:
       *   - ノート更新: { taskId, field: "yesterdayNote" | "todayNote", value }
       *   - 次ステータス更新: { taskId, field: "nextStatus", value: statusId | null }
       */
      PUT: async ({ request, params }: { request: Request; params: RouteParams }) => {
        return withAuth(request, async (ctx) => {
          const body = (await request.json()) as UpdateTaskNoteInput | UpdateNextStatusInput;

          if (!body.taskId || !body.field) {
            return errorResponse("taskId and field are required", 400);
          }

          const service = new DailyReportService(ctx.db, ctx.userId);

          if (body.field === "nextStatus") {
            await service.updateNextStatus(params.date, body.taskId, body.value);
            return new Response(null, { status: 204 });
          }

          if (body.field !== "yesterdayNote" && body.field !== "todayNote") {
            return errorResponse("field must be 'yesterdayNote', 'todayNote', or 'nextStatus'", 400);
          }

          await service.updateTaskNote(params.date, body.taskId, body.field, body.value);
          return new Response(null, { status: 204 });
        });
      },
      /**
       * タスクを日報から削除（手動追加分のみ）
       * DELETE /api/daily-reports/:date/tasks?taskId=xxx
       */
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
