/**
 * カンバンボードコンポーネント
 * ステータス別のカラム表示
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TaskWithRelations, Status } from "@/features/tasks/types";

type KanbanBoardProps = {
  tasks: TaskWithRelations[];
  statuses: Status[];
  onTaskClick?: (task: TaskWithRelations) => void;
  onTaskMove?: (taskId: string, newStatusId: string) => void;
};

function KanbanCard({
  task,
  onClick,
}: {
  task: TaskWithRelations;
  onClick?: () => void;
}) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow mb-3"
      onClick={onClick}
    >
      <CardContent className="p-3">
        <p className="text-sm font-medium mb-2">{task.title}</p>
        {task.description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {task.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-1.5">
          {task.priority && task.priority >= 7 && (
            <Badge variant="destructive" className="text-xs">
              優先
            </Badge>
          )}
          {task.tags.map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="text-xs"
              style={{ borderColor: tag.color, color: tag.color }}
            >
              {tag.name}
            </Badge>
          ))}
          {task.dueDate && (
            <Badge variant="secondary" className="text-xs">
              {new Date(task.dueDate).toLocaleDateString("ja-JP", {
                month: "short",
                day: "numeric",
              })}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function KanbanColumn({
  status,
  tasks,
  onTaskClick,
}: {
  status: Status;
  tasks: TaskWithRelations[];
  onTaskClick?: (task: TaskWithRelations) => void;
}) {
  const columnTasks = tasks.filter((task) => task.statusId === status.id);

  return (
    <div className="flex-shrink-0 w-[300px]">
      <Card className="h-full bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <span>{status.name}</span>
            <Badge variant="secondary" className="text-xs">
              {columnTasks.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <ScrollArea className="h-[500px]">
            {columnTasks.length === 0 ? (
              <div className="flex items-center justify-center h-20 border-2 border-dashed border-muted rounded-lg">
                <p className="text-sm text-muted-foreground">タスクなし</p>
              </div>
            ) : (
              columnTasks.map((task) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick?.(task)}
                />
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export function KanbanBoard({
  tasks,
  statuses,
  onTaskClick,
}: KanbanBoardProps) {
  const sortedStatuses = [...statuses].sort((a, b) => a.position - b.position);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {sortedStatuses.map((status) => (
        <KanbanColumn
          key={status.id}
          status={status}
          tasks={tasks}
          onTaskClick={onTaskClick}
        />
      ))}
    </div>
  );
}
