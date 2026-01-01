/**
 * 日報ページ（当日リダイレクト）
 * /daily → /daily/{今日の日付} へリダイレクト
 */

import { createFileRoute, redirect } from "@tanstack/react-router";
import { getTodayString } from "@/lib/date";

export const Route = createFileRoute("/daily/")({
  beforeLoad: () => {
    throw redirect({
      to: "/daily/$date",
      params: { date: getTodayString() },
    });
  },
});
