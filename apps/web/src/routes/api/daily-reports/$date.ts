/**
 * 特定日の日報操作 API
 * パス: /api/daily-reports/:date
 */
import { createFileRoute } from "@tanstack/react-router";
import { withAuth, jsonResponse } from "@/lib/api-utils";
import { DailyReportService } from "@/features/daily-reports/service/daily-report-service";
import type { UpdateDailyReportInput } from "@/features/daily-reports/types";

type RouteParams = { date: string };

export const Route = createFileRoute("/api/daily-reports/$date")({
  server: {
    handlers: {
      GET: async ({ request, params }: { request: Request; params: RouteParams }) => {
        return withAuth(request, async (ctx) => {
          const service = new DailyReportService(ctx.db, ctx.userId);
          const report = await service.getOrCreate(params.date);
          return jsonResponse(report);
        });
      },
      PUT: async ({ request, params }: { request: Request; params: RouteParams }) => {
        return withAuth(request, async (ctx) => {
          const body = (await request.json()) as UpdateDailyReportInput;
          const service = new DailyReportService(ctx.db, ctx.userId);
          const report = await service.update(params.date, body);
          return jsonResponse(report);
        });
      },
    },
  },
});
