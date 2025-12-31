/**
 * ダッシュボードページ
 * タスク管理のメインビュー
 */
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ViewSwitcher } from "./-components/view-switcher";
import { TaskList } from "./-components/task-list";
import { KanbanBoard } from "./-components/kanban-board";
import { DailyReportView } from "./-components/daily-report-view";
import { TaskDialog } from "./-components/task-dialog";
import type { ViewMode } from "@n2/shared";
import type { TaskWithRelations, Status, Tag, CreateTaskInput } from "@/features/tasks/types";
import type { DailyReportWithTasks } from "@/features/daily-reports/types";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
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

  // 今日の日報取得
  const today = new Date().toISOString().slice(0, 10);
  const { data: todayReport } = useQuery<DailyReportWithTasks>({
    queryKey: ["daily-reports", today],
    queryFn: async () => {
      const res = await fetch(`/api/daily-reports/${today}`);
      if (!res.ok) throw new Error("日報の取得に失敗");
      return res.json();
    },
    enabled: viewMode === "daily",
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

  const handleTaskClick = (task: TaskWithRelations) => {
    // TODO: タスク詳細ダイアログを表示
    console.log("Task clicked:", task);
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
          <Button onClick={() => setTaskDialogOpen(true)}>
            新規タスク
          </Button>
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
            />
          )}

          {viewMode === "daily" && todayReport && (
            <DailyReportView
              report={todayReport}
              onTaskStatusChange={handleStatusChange}
            />
          )}

          {viewMode === "daily" && !todayReport && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">日報を読み込み中...</p>
              </CardContent>
            </Card>
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
    </div>
  );
}
