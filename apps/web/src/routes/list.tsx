/**
 * リストビューページ
 * タスクを階層リストで表示
 */

import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { initializeAppData, taskApi } from "@/stores/api-actions";
import { appActions, appStore } from "@/stores/app-store";
import { TaskDetailDialog } from "./-components/task-detail-dialog";
import { TaskDialog } from "./-components/task-dialog";
import { TaskList } from "./-components/task-list";
import { ViewSwitcher } from "./-components/view-switcher";

export const Route = createFileRoute("/list")({
  component: ListPage,
});

function ListPage() {
  const tasks = useStore(appStore, (s) => s.tasks);
  const statuses = useStore(appStore, (s) => s.statuses);
  const tags = useStore(appStore, (s) => s.tags);
  const selectedTask = useStore(appStore, (s) => s.selectedTask);
  const loading = useStore(appStore, (s) => s.loading.tasks);

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  useEffect(() => {
    initializeAppData();
  }, []);

  const rootTasks = tasks.filter((t) => !t.parentId);

  const handleStatusChange = async (taskId: string, completed: boolean) => {
    const targetStatus = completed
      ? statuses.find((s) => s.type === "done")
      : statuses.find((s) => s.type === "todo");
    if (targetStatus) {
      await taskApi.updateStatus(taskId, targetStatus.id);
    }
  };

  const handleQuickCreate = async (title: string) => {
    const todoStatus = statuses.find((s) => s.type === "todo");
    if (todoStatus) {
      await taskApi.create({ title, statusId: todoStatus.id });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">NippoNikki</h1>
          <p className="text-muted-foreground mt-1">リストビュー</p>
        </div>
        <div className="flex items-center gap-4">
          <ViewSwitcher currentPath="/list" />
          <Button onClick={() => setTaskDialogOpen(true)}>新規タスク</Button>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">読み込み中...</p>
          </CardContent>
        </Card>
      ) : (
        <TaskList
          tasks={rootTasks}
          onTaskClick={appActions.setSelectedTask}
          onStatusChange={handleStatusChange}
          onQuickCreate={handleQuickCreate}
        />
      )}

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onSubmit={async (input) => {
          await taskApi.create(input);
          setTaskDialogOpen(false);
        }}
        statuses={statuses}
        tags={tags}
      />

      <TaskDetailDialog
        task={selectedTask}
        open={selectedTask !== null}
        onOpenChange={(open) => {
          if (!open) appActions.setSelectedTask(null);
        }}
        onUpdate={async (input) => {
          if (selectedTask) {
            await taskApi.update(selectedTask.id, input);
          }
        }}
        onDelete={async () => {
          if (selectedTask) {
            await taskApi.delete(selectedTask.id);
          }
        }}
        statuses={statuses}
        tags={tags}
      />
    </div>
  );
}
