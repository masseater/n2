import type { CreateTaskInput, MoveTaskInput, UpdateTaskInput } from "../types";

const API_BASE = "/api/tasks";

/**
 * タスク作成 API を呼び出す
 *
 * @param input - タスク作成データ
 * @returns 作成されたタスク
 */
export async function createTask(input: CreateTaskInput) {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("タスクの作成に失敗しました");
  }
  return response.json();
}

/**
 * タスク更新 API を呼び出す
 *
 * @param taskId - 更新対象のタスクID
 * @param input - 更新データ
 * @returns 更新されたタスク
 */
export async function updateTask(taskId: string, input: UpdateTaskInput) {
  const response = await fetch(`${API_BASE}/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("タスクの更新に失敗しました");
  }
  return response.json();
}

/**
 * タスク削除（アーカイブ）API を呼び出す
 *
 * @param taskId - 削除対象のタスクID
 */
export async function deleteTask(taskId: string) {
  const response = await fetch(`${API_BASE}/${taskId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("タスクの削除に失敗しました");
  }
}

/**
 * タスク移動 API を呼び出す
 *
 * @param input - 移動データ（taskId, newParentId, newPosition）
 * @returns 更新されたタスク
 */
export async function moveTask(input: MoveTaskInput) {
  const response = await fetch(`${API_BASE}/${input.taskId}/move`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      parentId: input.newParentId,
      position: input.newPosition,
    }),
  });
  if (!response.ok) {
    throw new Error("タスクの移動に失敗しました");
  }
  return response.json();
}

/**
 * タスク復元 API を呼び出す
 *
 * @param taskId - 復元対象のタスクID
 * @returns 復元されたタスク
 */
export async function restoreTask(taskId: string) {
  const response = await fetch(`${API_BASE}/${taskId}/restore`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("タスクの復元に失敗しました");
  }
  return response.json();
}
