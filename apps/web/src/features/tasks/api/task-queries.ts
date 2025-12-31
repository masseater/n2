import { queryOptions } from "@tanstack/react-query";
import type { TaskFilter, TaskWithRelations } from "../types";

const API_BASE = "/api/tasks";

/**
 * タスク一覧取得のクエリオプション
 *
 * @param filter - フィルター条件（任意）
 */
export function tasksQueryOptions(filter?: TaskFilter) {
  return queryOptions({
    queryKey: ["tasks", filter],
    queryFn: async (): Promise<TaskWithRelations[]> => {
      const params = new URLSearchParams();
      if (filter?.statusIds) params.set("statusIds", filter.statusIds.join(","));
      if (filter?.tagIds) params.set("tagIds", filter.tagIds.join(","));
      if (filter?.priorityMin) params.set("priorityMin", String(filter.priorityMin));
      if (filter?.priorityMax) params.set("priorityMax", String(filter.priorityMax));
      if (filter?.dueDateFrom) params.set("dueDateFrom", filter.dueDateFrom.toISOString());
      if (filter?.dueDateTo) params.set("dueDateTo", filter.dueDateTo.toISOString());
      if (filter?.parentId !== undefined) params.set("parentId", filter.parentId ?? "null");
      if (filter?.search) params.set("search", filter.search);

      const url = params.toString() ? `${API_BASE}?${params}` : API_BASE;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("タスクの取得に失敗しました");
      }
      return response.json();
    },
  });
}

/**
 * 単一タスク取得のクエリオプション
 *
 * @param taskId - タスクID
 */
export function taskQueryOptions(taskId: string) {
  return queryOptions({
    queryKey: ["tasks", taskId],
    queryFn: async (): Promise<TaskWithRelations> => {
      const response = await fetch(`${API_BASE}/${taskId}`);
      if (!response.ok) {
        throw new Error("タスクの取得に失敗しました");
      }
      return response.json();
    },
    enabled: !!taskId,
  });
}

/**
 * ルートタスク（プロジェクト）一覧取得のクエリオプション
 */
export function projectsQueryOptions() {
  return tasksQueryOptions({ parentId: null });
}

/**
 * 子タスク一覧取得のクエリオプション
 *
 * @param parentId - 親タスクID
 */
export function childTasksQueryOptions(parentId: string) {
  return tasksQueryOptions({ parentId });
}
