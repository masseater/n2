import { queryOptions } from "@tanstack/react-query";
import type { DailyReportWithTasks } from "../types";

const API_BASE = "/api/daily-reports";

/**
 * 日付を YYYY-MM-DD 形式にフォーマット
 */
function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * 特定日の日報取得のクエリオプション
 *
 * @param date - 対象日付
 */
export function dailyReportQueryOptions(date: Date) {
  const dateStr = formatDate(date);
  return queryOptions({
    queryKey: ["daily-reports", dateStr],
    queryFn: async (): Promise<DailyReportWithTasks> => {
      const response = await fetch(`${API_BASE}/${dateStr}`);
      if (!response.ok) {
        throw new Error("日報の取得に失敗しました");
      }
      return response.json();
    },
  });
}

/**
 * 今日の日報取得のクエリオプション
 */
export function todayReportQueryOptions() {
  return dailyReportQueryOptions(new Date());
}

/**
 * 日報一覧取得のクエリオプション
 *
 * @param from - 開始日
 * @param to - 終了日
 */
export function dailyReportsQueryOptions(from: Date, to: Date) {
  return queryOptions({
    queryKey: ["daily-reports", { from: formatDate(from), to: formatDate(to) }],
    queryFn: async (): Promise<DailyReportWithTasks[]> => {
      const params = new URLSearchParams({
        from: formatDate(from),
        to: formatDate(to),
      });
      const response = await fetch(`${API_BASE}?${params}`);
      if (!response.ok) {
        throw new Error("日報一覧の取得に失敗しました");
      }
      return response.json();
    },
  });
}
