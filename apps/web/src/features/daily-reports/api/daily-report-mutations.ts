import type { CreateDailyReportInput, UpdateDailyReportInput, UpdateTaskNoteInput } from "../types";

const API_BASE = "/api/daily-reports";

/**
 * 日報作成 API を呼び出す
 *
 * @param input - 日報作成データ
 * @returns 作成された日報
 */
export async function createDailyReport(input: CreateDailyReportInput) {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("日報の作成に失敗しました");
  }
  return response.json();
}

/**
 * 日報更新 API を呼び出す
 *
 * @param date - 対象日付（YYYY-MM-DD）
 * @param input - 更新データ
 * @returns 更新された日報
 */
export async function updateDailyReport(date: string, input: UpdateDailyReportInput) {
  const response = await fetch(`${API_BASE}/${date}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("日報の更新に失敗しました");
  }
  return response.json();
}

/**
 * タスクノート更新 API を呼び出す
 *
 * @param date - 対象日付（YYYY-MM-DD）
 * @param input - 更新データ
 */
export async function updateTaskNote(date: string, input: UpdateTaskNoteInput) {
  const response = await fetch(`${API_BASE}/${date}/tasks`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("タスクノートの更新に失敗しました");
  }
}

/**
 * 日報からタスクを削除 API を呼び出す
 *
 * @param date - 対象日付（YYYY-MM-DD）
 * @param taskId - 削除するタスクID
 */
export async function removeTaskFromDailyReport(date: string, taskId: string) {
  const response = await fetch(`${API_BASE}/${date}/tasks?taskId=${taskId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("タスクの削除に失敗しました");
  }
}
