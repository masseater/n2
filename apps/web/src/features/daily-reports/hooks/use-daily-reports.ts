import { useQuery } from "@tanstack/react-query";
import {
  dailyReportQueryOptions,
  dailyReportsQueryOptions,
  todayReportQueryOptions,
} from "../api/daily-report-queries";

/**
 * 特定日の日報を取得するフック
 *
 * @param date - 対象日付
 *
 * 使用例:
 * ```tsx
 * const { data: report, isLoading } = useDailyReport(new Date());
 * ```
 */
export function useDailyReport(date: Date) {
  return useQuery(dailyReportQueryOptions(date));
}

/**
 * 今日の日報を取得するフック
 */
export function useTodayReport() {
  return useQuery(todayReportQueryOptions());
}

/**
 * 日報一覧を取得するフック
 *
 * @param from - 開始日
 * @param to - 終了日
 */
export function useDailyReports(from: Date, to: Date) {
  return useQuery(dailyReportsQueryOptions(from, to));
}
