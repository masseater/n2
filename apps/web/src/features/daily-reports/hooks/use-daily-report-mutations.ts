import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createDailyReport,
  updateDailyReport,
  addTaskToDailyReport,
  removeTaskFromDailyReport,
  reorderDailyReportTask,
} from "../api/daily-report-mutations";
import type {
  CreateDailyReportInput,
  UpdateDailyReportInput,
  AddTaskToDailyReportInput,
  RemoveTaskFromDailyReportInput,
  ReorderDailyReportTaskInput,
} from "../types";

/**
 * 日報作成のミューテーションフック
 */
export function useCreateDailyReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDailyReportInput) => createDailyReport(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["daily-reports", variables.date] });
    },
  });
}

/**
 * 日報更新のミューテーションフック
 */
export function useUpdateDailyReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ date, input }: { date: string; input: UpdateDailyReportInput }) =>
      updateDailyReport(date, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["daily-reports", variables.date] });
    },
  });
}

/**
 * 日報にタスク追加のミューテーションフック
 */
export function useAddTaskToDailyReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ date, input }: { date: string; input: AddTaskToDailyReportInput }) =>
      addTaskToDailyReport(date, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["daily-reports", variables.date] });
    },
  });
}

/**
 * 日報からタスク削除のミューテーションフック
 */
export function useRemoveTaskFromDailyReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ date, input }: { date: string; input: RemoveTaskFromDailyReportInput }) =>
      removeTaskFromDailyReport(date, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["daily-reports", variables.date] });
    },
  });
}

/**
 * 日報内タスク並べ替えのミューテーションフック
 */
export function useReorderDailyReportTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ date, input }: { date: string; input: ReorderDailyReportTaskInput }) =>
      reorderDailyReportTask(date, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["daily-reports", variables.date] });
    },
  });
}
