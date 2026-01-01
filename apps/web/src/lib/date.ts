/**
 * 日付ユーティリティ
 * date-fns を使用した日付計算・フォーマット関数群
 */

import { addDays, endOfMonth, format, getDay, parse, startOfMonth } from "date-fns";

/**
 * 日付フォーマット定数
 */
const DATE_FORMAT = "yyyy-MM-dd";

/**
 * Date を YYYY-MM-DD 形式の文字列に変換
 */
export function formatDateToString(date: Date): string {
  return format(date, DATE_FORMAT);
}

/**
 * YYYY-MM-DD 形式の文字列を Date に変換
 */
export function parseDateString(dateString: string): Date {
  return parse(dateString, DATE_FORMAT, new Date());
}

/**
 * 週の開始日（月曜日）を取得
 */
export function getWeekStart(date: Date): Date {
  const day = getDay(date);
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(date, diff);
}

/**
 * 週の終了日（日曜日）を取得
 */
export function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date);
  return addDays(weekStart, 6);
}

/**
 * 月の開始日を取得
 */
export function getMonthStart(date: Date): Date {
  return startOfMonth(date);
}

/**
 * 月の終了日を取得
 */
export function getMonthEnd(date: Date): Date {
  return endOfMonth(date);
}

/**
 * 今日の日付を YYYY-MM-DD 形式で取得
 */
export function getTodayString(): string {
  return formatDateToString(new Date());
}
