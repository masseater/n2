import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createDailyReport,
  updateDailyReport,
  updateTaskNote,
  removeTaskFromDailyReport,
} from "../api/daily-report-mutations";
import type {
  CreateDailyReportInput,
  UpdateDailyReportInput,
  UpdateTaskNoteInput,
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
 * タスクノート更新のミューテーションフック
 */
export function useUpdateTaskNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ date, input }: { date: string; input: UpdateTaskNoteInput }) =>
      updateTaskNote(date, input),
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
    mutationFn: ({ date, taskId }: { date: string; taskId: string }) =>
      removeTaskFromDailyReport(date, taskId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["daily-reports", variables.date] });
    },
  });
}
