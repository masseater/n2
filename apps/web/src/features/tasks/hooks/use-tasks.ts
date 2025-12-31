import { useQuery } from "@tanstack/react-query";
import { tasksQueryOptions, taskQueryOptions, projectsQueryOptions } from "../api/task-queries";
import type { TaskFilter } from "../types";

/**
 * タスク一覧を取得するフック
 *
 * @param filter - フィルター条件（任意）
 *
 * 使用例:
 * ```tsx
 * const { data: tasks, isLoading } = useTasks({ statusIds: ["todo"] });
 * ```
 */
export function useTasks(filter?: TaskFilter) {
  return useQuery(tasksQueryOptions(filter));
}

/**
 * 単一タスクを取得するフック
 *
 * @param taskId - タスクID
 */
export function useTask(taskId: string) {
  return useQuery(taskQueryOptions(taskId));
}

/**
 * ルートタスク（プロジェクト）一覧を取得するフック
 */
export function useProjects() {
  return useQuery(projectsQueryOptions());
}
