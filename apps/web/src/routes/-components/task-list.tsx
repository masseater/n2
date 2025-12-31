/**
 * タスクリストコンポーネント
 * 階層構造でタスクを表示、インラインでタスク作成可能
 */
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import type { TaskWithRelations } from "@/features/tasks/types";

type TaskListProps = {
  tasks: TaskWithRelations[];
  onTaskClick?: (task: TaskWithRelations) => void;
  onStatusChange?: (taskId: string, completed: boolean) => void;
  onQuickCreate?: (title: string) => void;
};

function TaskItem({
  task,
  depth = 0,
  onTaskClick,
  onStatusChange,
}: {
  task: TaskWithRelations;
  depth?: number;
  onTaskClick?: (task: TaskWithRelations) => void;
  onStatusChange?: (taskId: string, completed: boolean) => void;
}) {
  const isDone = task.status.type === "done";
  const paddingLeft = depth * 24;

  return (
    <div className="border-b border-border last:border-b-0">
      <div
        className="flex items-center gap-3 py-3 px-4 hover:bg-muted/50 cursor-pointer transition-colors"
        style={{ paddingLeft: paddingLeft + 16 }}
        onClick={() => onTaskClick?.(task)}
      >
        <Checkbox
          checked={isDone}
          onCheckedChange={(checked) => {
            onStatusChange?.(task.id, !!checked);
          }}
          onClick={(e) => e.stopPropagation()}
        />
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium truncate ${isDone ? "line-through text-muted-foreground" : ""}`}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {task.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
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
          <Badge
            variant="secondary"
            className="text-xs"
          >
            {task.status.name}
          </Badge>
        </div>
      </div>
      {task.children?.map((child) => (
        <TaskItem
          key={child.id}
          task={child}
          depth={depth + 1}
          onTaskClick={onTaskClick}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}

function QuickAddInput({ onSubmit }: { onSubmit: (title: string) => void }) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onSubmit(trimmed);
      setValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/30">
      <Plus className="h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSubmit}
        placeholder="タスクを入力してEnter..."
        className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-8 text-sm"
      />
    </div>
  );
}

export function TaskList({ tasks, onTaskClick, onStatusChange, onQuickCreate }: TaskListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">タスク一覧</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {onQuickCreate && <QuickAddInput onSubmit={onQuickCreate} />}
        {tasks.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">タスクがありません</p>
            <p className="text-sm text-muted-foreground mt-2">上の入力欄からタスクを追加</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onTaskClick={onTaskClick}
                onStatusChange={onStatusChange}
              />
            ))}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
