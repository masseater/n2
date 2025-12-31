/**
 * ダッシュボードページ
 * タスク管理のメインビュー
 */

import type { ViewMode } from "@n2/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DailyReportWithTasks } from "@/features/daily-reports/types";
import type {
  CreateTaskInput,
  Status,
  Tag,
  TaskWithRelations,
  UpdateTaskInput,
} from "@/features/tasks/types";
import { DailyReportView } from "./-components/daily-report-view";
import { KanbanBoard } from "./-components/kanban-board";
import { MonthlyReportView } from "./-components/monthly-report-view";
import type { ReportGranularity } from "./-components/report-granularity-switcher";
import { TaskDetailDialog } from "./-components/task-detail-dialog";
import { TaskDialog } from "./-components/task-dialog";
import { TaskList } from "./-components/task-list";
import { ViewSwitcher } from "./-components/view-switcher";
import { WeeklyReportView } from "./-components/weekly-report-view";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

/**
 * 日付を YYYY-MM-DD 形式に変換
 */
function formatDateToString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * 週の開始日（月曜日）を取得
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 月の開始日を取得
 */
function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * 月の終了日を取得
 */
function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function Dashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [reportGranularity, setReportGranularity] = useState<ReportGranularity>("day");
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const queryClient = useQueryClient();

  // タスク一覧取得
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<TaskWithRelations[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await fetch("/api/tasks/");
      if (!res.ok) throw new Error("タスクの取得に失敗");
      return res.json();
    },
  });

  // ステータス一覧取得
  const { data: statuses = [] } = useQuery<Status[]>({
    queryKey: ["statuses"],
    queryFn: async () => {
      const res = await fetch("/api/statuses/");
      if (!res.ok) throw new Error("ステータスの取得に失敗");
      return res.json();
    },
  });

  // タグ一覧取得
  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: async () => {
      const res = await fetch("/api/tags/");
      if (!res.ok) throw new Error("タグの取得に失敗");
      return res.json();
    },
  });

  // 日報取得（日別）
  const dateStr = formatDateToString(selectedDate);
  const { data: dayReport } = useQuery<DailyReportWithTasks>({
    queryKey: ["daily-reports", dateStr],
    queryFn: async () => {
      const res = await fetch(`/api/daily-reports/${dateStr}`);
      if (!res.ok) throw new Error("日報の取得に失敗");
      return res.json();
    },
    enabled: viewMode === "daily" && reportGranularity === "day",
  });

  // 週間日報取得
  const weekStart = getWeekStart(selectedDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekStartStr = formatDateToString(weekStart);
  const weekEndStr = formatDateToString(weekEnd);

  const { data: weekReports = [] } = useQuery<DailyReportWithTasks[]>({
    queryKey: ["daily-reports", "range", weekStartStr, weekEndStr],
    queryFn: async () => {
      const res = await fetch(`/api/daily-reports/?from=${weekStartStr}&to=${weekEndStr}`);
      if (!res.ok) throw new Error("週間日報の取得に失敗");
      return res.json();
    },
    enabled: viewMode === "daily" && reportGranularity === "week",
  });

  // 月間日報取得
  const monthStart = getMonthStart(selectedDate);
  const monthEnd = getMonthEnd(selectedDate);
  const monthStartStr = formatDateToString(monthStart);
  const monthEndStr = formatDateToString(monthEnd);

  const { data: monthReports = [] } = useQuery<DailyReportWithTasks[]>({
    queryKey: ["daily-reports", "range", monthStartStr, monthEndStr],
    queryFn: async () => {
      const res = await fetch(`/api/daily-reports/?from=${monthStartStr}&to=${monthEndStr}`);
      if (!res.ok) throw new Error("月間日報の取得に失敗");
      return res.json();
    },
    enabled: viewMode === "daily" && reportGranularity === "month",
  });

  // 日報メモ更新
  const updateReportNotesMutation = useMutation({
    mutationFn: async ({ date, notes }: { date: string; notes: string }) => {
      const res = await fetch(`/api/daily-reports/${date}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error("日報の更新に失敗");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-reports"] });
    },
  });

  // タスクノート更新
  const updateTaskNoteMutation = useMutation({
    mutationFn: async ({
      date,
      taskId,
      field,
      value,
    }: {
      date: string;
      taskId: string;
      field: "yesterdayNote" | "todayNote";
      value: string;
    }) => {
      const res = await fetch(`/api/daily-reports/${date}/tasks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, field, value: value || null }),
      });
      if (!res.ok) throw new Error("タスクノートの更新に失敗");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-reports"] });
    },
  });

  // 次のステータス更新
  const updateNextStatusMutation = useMutation({
    mutationFn: async ({
      date,
      taskId,
      nextStatusId,
    }: {
      date: string;
      taskId: string;
      nextStatusId: string | null;
    }) => {
      const res = await fetch(`/api/daily-reports/${date}/tasks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, field: "nextStatus", value: nextStatusId }),
      });
      if (!res.ok) throw new Error("次のステータスの更新に失敗");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-reports"] });
    },
  });

  // タスク作成
  const createTaskMutation = useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const res = await fetch("/api/tasks/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("タスクの作成に失敗");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["daily-reports"] });
    },
  });

  // タスクステータス更新
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, statusId }: { taskId: string; statusId: string }) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusId }),
      });
      if (!res.ok) throw new Error("タスクの更新に失敗");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["daily-reports"] });
    },
  });

  const handleStatusChange = (taskId: string, completed: boolean) => {
    const doneStatus = statuses.find((s) => s.type === "done");
    const todoStatus = statuses.find((s) => s.type === "todo");
    const newStatusId = completed ? doneStatus?.id : todoStatus?.id;
    if (newStatusId) {
      updateTaskMutation.mutate({ taskId, statusId: newStatusId });
    }
  };

  // タスク更新
  const updateTaskMutationFull = useMutation({
    mutationFn: async ({ taskId, input }: { taskId: string; input: UpdateTaskInput }) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("タスクの更新に失敗");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["daily-reports"] });
    },
  });

  // タスク削除
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("タスクの削除に失敗");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["daily-reports"] });
      setSelectedTask(null);
    },
  });

  const handleTaskClick = (task: TaskWithRelations) => {
    setSelectedTask(task);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setReportGranularity("day");
  };

  const handleMonthChange = (date: Date) => {
    setSelectedDate(date);
  };

  // ルートレベルのタスクのみ表示（階層構造は children で持つ）
  const rootTasks = tasks.filter((t) => !t.parentId);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">NippoNikki</h1>
          <p className="text-muted-foreground mt-1">
            日報粒度とタスク粒度を切り替え可能なタスク管理ツール
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ViewSwitcher value={viewMode} onChange={setViewMode} />
          <Button onClick={() => setTaskDialogOpen(true)}>新規タスク</Button>
        </div>
      </div>

      {tasksLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">読み込み中...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === "list" && (
            <TaskList
              tasks={rootTasks}
              onTaskClick={handleTaskClick}
              onStatusChange={handleStatusChange}
              onQuickCreate={(title) => {
                const todoStatus = statuses.find((s) => s.type === "todo");
                if (todoStatus) {
                  createTaskMutation.mutate({ title, statusId: todoStatus.id });
                }
              }}
            />
          )}

          {viewMode === "board" && (
            <KanbanBoard
              tasks={tasks}
              statuses={statuses}
              onTaskClick={handleTaskClick}
              onTaskMove={(taskId, newStatusId) => {
                updateTaskMutation.mutate({ taskId, statusId: newStatusId });
              }}
            />
          )}

          {viewMode === "daily" && reportGranularity === "day" && dayReport && (
            <DailyReportView
              report={dayReport}
              statuses={statuses}
              tags={tags}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              granularity={reportGranularity}
              onGranularityChange={setReportGranularity}
              onNotesChange={(notes) => {
                updateReportNotesMutation.mutate({ date: dateStr, notes });
              }}
              onTaskNoteChange={(taskId, field, value) => {
                updateTaskNoteMutation.mutate({ date: dateStr, taskId, field, value });
              }}
              onTaskUpdate={(taskId, input) => {
                updateTaskMutationFull.mutate({ taskId, input });
              }}
              onNextStatusChange={(taskId, nextStatusId) => {
                updateNextStatusMutation.mutate({ date: dateStr, taskId, nextStatusId });
              }}
              onAddTask={() => {
                setTaskDialogOpen(true);
              }}
            />
          )}

          {viewMode === "daily" && reportGranularity === "day" && !dayReport && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">日報を読み込み中...</p>
              </CardContent>
            </Card>
          )}

          {viewMode === "daily" && reportGranularity === "week" && (
            <WeeklyReportView
              weekStart={weekStart}
              reports={weekReports}
              onDayClick={handleDayClick}
              onTaskClick={handleTaskClick}
            />
          )}

          {viewMode === "daily" && reportGranularity === "month" && (
            <MonthlyReportView
              month={selectedDate}
              reports={monthReports}
              onDayClick={handleDayClick}
              onMonthChange={handleMonthChange}
            />
          )}
        </>
      )}

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onSubmit={(input) => createTaskMutation.mutate(input)}
        statuses={statuses}
        tags={tags}
      />

      <TaskDetailDialog
        task={selectedTask}
        open={selectedTask !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTask(null);
        }}
        onUpdate={(input) => {
          if (selectedTask) {
            updateTaskMutationFull.mutate({ taskId: selectedTask.id, input });
          }
        }}
        onDelete={() => {
          if (selectedTask) {
            deleteTaskMutation.mutate(selectedTask.id);
          }
        }}
        statuses={statuses}
        tags={tags}
      />
    </div>
  );
}
