/**
 * カンバンボードコンポーネント
 * ステータス別のカラム表示 + ドラッグ&ドロップ
 * オプティミスティックUIで即座に移動を反映
 */
import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

function SortableKanbanCard({
  task,
  onClick,
}: {
  task: TaskWithRelations;
  onClick?: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task, type: "task" } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleClick = (e: React.MouseEvent) => {
    // ドラッグ中はクリックイベントを発火しない
    if (isDragging) {
      e.preventDefault();
      return;
    }
    onClick?.();
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow touch-none"
      onClick={handleClick}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-3">
        <p className="text-sm font-medium mb-1">{task.title}</p>
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

function KanbanCardOverlay({ task }: { task: TaskWithRelations }) {
  return (
    <Card className="shadow-lg rotate-3 cursor-grabbing">
      <CardContent className="p-3">
        <p className="text-sm font-medium">{task.title}</p>
      </CardContent>
    </Card>
  );
}

function DroppableColumn({
  status,
  tasks,
  onTaskClick,
}: {
  status: Status;
  tasks: TaskWithRelations[];
  onTaskClick?: (task: TaskWithRelations) => void;
}) {
  const columnTasks = tasks.filter((task) => task.statusId === status.id);
  const taskIds = columnTasks.map((t) => t.id);

  // カラム自体をドロップ可能にする
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status.id}`,
    data: { type: "column", statusId: status.id },
  });

  return (
    <div className="flex-shrink-0 w-[300px]">
      <Card className={`h-full transition-colors ${isOver ? "bg-accent/50" : "bg-muted/30"}`}>
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
            <div
              ref={setNodeRef}
              className="min-h-[400px]"
            >
              <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                {columnTasks.length === 0 ? (
                  <div className={`flex items-center justify-center h-20 border-2 border-dashed rounded-lg transition-colors ${isOver ? "border-primary bg-primary/10" : "border-muted"}`}>
                    <p className="text-sm text-muted-foreground">
                      ここにドロップ
                    </p>
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <SortableKanbanCard
                      key={task.id}
                      task={task}
                      onClick={() => onTaskClick?.(task)}
                    />
                  ))
                )}
              </SortableContext>
            </div>
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
  onTaskMove,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<TaskWithRelations | null>(null);
  /** オプティミスティックUI用: ローカルでステータスを即座に反映 */
  const [optimisticMoves, setOptimisticMoves] = useState<Map<string, string>>(new Map());
  const sortedStatuses = [...statuses].sort((a, b) => a.position - b.position);

  /** オプティミスティックUIを適用したタスク一覧 */
  const displayTasks = useMemo(() => {
    if (optimisticMoves.size === 0) return tasks;
    return tasks.map((task) => {
      const newStatusId = optimisticMoves.get(task.id);
      if (newStatusId && newStatusId !== task.statusId) {
        const newStatus = statuses.find((s) => s.id === newStatusId);
        if (newStatus) {
          return { ...task, statusId: newStatusId, status: newStatus };
        }
      }
      return task;
    });
  }, [tasks, optimisticMoves, statuses]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = displayTasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const activeTaskData = displayTasks.find((t) => t.id === activeTaskId);

    if (!activeTaskData) return;

    let newStatusId: string | null = null;
    const overData = over.data.current;

    if (overData?.type === "column") {
      newStatusId = overData.statusId;
    } else if (overData?.type === "task") {
      newStatusId = overData.task.statusId;
    } else {
      const overTask = displayTasks.find((t) => t.id === over.id);
      if (overTask) {
        newStatusId = overTask.statusId;
      }
    }

    if (newStatusId && newStatusId !== activeTaskData.statusId) {
      // オプティミスティックUIで即座に反映
      setOptimisticMoves((prev) => {
        const next = new Map(prev);
        next.set(activeTaskId, newStatusId);
        return next;
      });
      // API呼び出し
      onTaskMove?.(activeTaskId, newStatusId);
      // APIレスポンス後にクリア（propsのtasksが更新されるため）
      setTimeout(() => {
        setOptimisticMoves((prev) => {
          const next = new Map(prev);
          next.delete(activeTaskId);
          return next;
        });
      }, 2000);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {sortedStatuses.map((status) => (
          <DroppableColumn
            key={status.id}
            status={status}
            tasks={displayTasks}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask && <KanbanCardOverlay task={activeTask} />}
      </DragOverlay>
    </DndContext>
  );
}
