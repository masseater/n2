import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask, deleteTask, moveTask, restoreTask, updateTask } from "../api/task-mutations";
import type { CreateTaskInput, MoveTaskInput, UpdateTaskInput } from "../types";

/**
 * タスク作成のミューテーションフック
 *
 * 使用例:
 * ```tsx
 * const { mutate: create, isPending } = useCreateTask();
 * create({ title: "新しいタスク", statusId: "todo-id" });
 * ```
 */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

/**
 * タスク更新のミューテーションフック
 *
 * 使用例:
 * ```tsx
 * const { mutate: update } = useUpdateTask();
 * update({ taskId: "task-id", input: { title: "更新後のタイトル" } });
 * ```
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: UpdateTaskInput }) =>
      updateTask(taskId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

/**
 * タスク削除（アーカイブ）のミューテーションフック
 *
 * 使用例:
 * ```tsx
 * const { mutate: remove } = useDeleteTask();
 * remove("task-id");
 * ```
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

/**
 * タスク移動のミューテーションフック
 *
 * 使用例:
 * ```tsx
 * const { mutate: move } = useMoveTask();
 * move({ taskId: "task-id", newParentId: "parent-id", newPosition: 0 });
 * ```
 */
export function useMoveTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MoveTaskInput) => moveTask(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

/**
 * タスク復元のミューテーションフック
 *
 * 使用例:
 * ```tsx
 * const { mutate: restore } = useRestoreTask();
 * restore("archived-task-id");
 * ```
 */
export function useRestoreTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => restoreTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
