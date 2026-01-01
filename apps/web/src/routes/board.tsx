/**
 * カンバンボードページ
 * タスクをステータス別のカラムで表示
 */

import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { initializeAppData, taskApi } from "@/stores/api-actions";
import { appActions, appStore } from "@/stores/app-store";
import { KanbanBoard } from "./-components/kanban-board";
import { TaskDetailDialog } from "./-components/task-detail-dialog";
import { TaskDialog } from "./-components/task-dialog";
import { ViewSwitcher } from "./-components/view-switcher";

export const Route = createFileRoute("/board")({
  component: BoardPage,
});

function BoardPage() {
  const tasks = useStore(appStore, (s) => s.tasks);
  const statuses = useStore(appStore, (s) => s.statuses);
  const tags = useStore(appStore, (s) => s.tags);
  const selectedTask = useStore(appStore, (s) => s.selectedTask);
  const loading = useStore(appStore, (s) => s.loading.tasks);

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  useEffect(() => {
    initializeAppData();
  }, []);

  const handleTaskMove = async (taskId: string, newStatusId: string) => {
    await taskApi.updateStatus(taskId, newStatusId);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">NippoNikki</h1>
          <p className="text-muted-foreground mt-1">カンバンボード</p>
        </div>
        <div className="flex items-center gap-4">
          <ViewSwitcher currentPath="/board" />
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
        <KanbanBoard
          tasks={tasks}
          statuses={statuses}
          onTaskClick={appActions.setSelectedTask}
          onTaskMove={handleTaskMove}
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
