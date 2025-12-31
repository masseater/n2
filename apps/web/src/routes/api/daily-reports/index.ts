/**
 * 日報一覧取得・作成 API
 * パス: /api/daily-reports
 */
import { createFileRoute } from "@tanstack/react-router";
import { DailyReportService } from "@/features/daily-reports/service/daily-report-service";
import type { CreateDailyReportInput } from "@/features/daily-reports/types";
import { errorResponse, jsonResponse, withAuth } from "@/lib/api-utils";

export const Route = createFileRoute("/api/daily-reports/")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return withAuth(request, async (ctx) => {
          const url = new URL(request.url);
          const from = url.searchParams.get("from");
          const to = url.searchParams.get("to");

          if (!from || !to) {
            return errorResponse("from and to parameters are required", 400);
          }

          const service = new DailyReportService(ctx.db, ctx.userId);
          const reports = await service.list(from, to);
          return jsonResponse(reports);
        });
      },
      POST: async ({ request }: { request: Request }) => {
        return withAuth(request, async (ctx) => {
          const body = (await request.json()) as CreateDailyReportInput;
          const service = new DailyReportService(ctx.db, ctx.userId);
          const report = await service.create(body);
          return jsonResponse(report, 201);
        });
      },
    },
  },
});
