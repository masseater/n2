import type {
  CreateDailyReportInput,
  UpdateDailyReportInput,
  AddTaskToDailyReportInput,
  RemoveTaskFromDailyReportInput,
  ReorderDailyReportTaskInput,
} from "../types";

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
 * 日報にタスクを追加 API を呼び出す
 *
 * @param date - 対象日付（YYYY-MM-DD）
 * @param input - 追加データ
 */
export async function addTaskToDailyReport(date: string, input: AddTaskToDailyReportInput) {
  const response = await fetch(`${API_BASE}/${date}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("タスクの追加に失敗しました");
  }
  return response.json();
}

/**
 * 日報からタスクを削除 API を呼び出す
 *
 * @param date - 対象日付（YYYY-MM-DD）
 * @param input - 削除データ
 */
export async function removeTaskFromDailyReport(
  date: string,
  input: RemoveTaskFromDailyReportInput
) {
  const response = await fetch(`${API_BASE}/${date}/tasks/${input.taskId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("タスクの削除に失敗しました");
  }
}

/**
 * 日報内タスクの並べ替え API を呼び出す
 *
 * @param date - 対象日付（YYYY-MM-DD）
 * @param input - 並べ替えデータ
 */
export async function reorderDailyReportTask(date: string, input: ReorderDailyReportTaskInput) {
  const response = await fetch(`${API_BASE}/${date}/tasks/${input.taskId}/reorder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      section: input.section,
      position: input.newPosition,
    }),
  });
  if (!response.ok) {
    throw new Error("タスクの並べ替えに失敗しました");
  }
  return response.json();
}
