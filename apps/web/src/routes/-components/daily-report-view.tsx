/**
 * 日報ビューコンポーネント
 * 昨日やったこと・今日やることを表示
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DailyReportWithTasks } from "@/features/daily-reports/types";
import type { TaskWithRelations } from "@/features/tasks/types";

type DailyReportViewProps = {
  report: DailyReportWithTasks;
  onNotesChange?: (notes: string) => void;
  onTaskStatusChange?: (taskId: string, completed: boolean) => void;
  onAddTask?: (section: "yesterday" | "today") => void;
};

function TaskSection({
  title,
  tasks,
  section,
  onTaskStatusChange,
  onAddTask,
}: {
  title: string;
  tasks: TaskWithRelations[];
  section: "yesterday" | "today";
  onTaskStatusChange?: (taskId: string, completed: boolean) => void;
  onAddTask?: (section: "yesterday" | "today") => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => onAddTask?.(section)}
        >
          + 追加
        </Button>
      </div>
      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">
          タスクがありません
        </p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const isDone = task.status.type === "done";
            return (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  checked={isDone}
                  onCheckedChange={(checked) => {
                    onTaskStatusChange?.(task.id, !!checked);
                  }}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${isDone ? "line-through text-muted-foreground" : ""}`}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {task.status.name}
                    </Badge>
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
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DailyReportView({
  report,
  onNotesChange,
  onTaskStatusChange,
  onAddTask,
}: DailyReportViewProps) {
  const dateObj = new Date(report.date);
  const formattedDate = dateObj.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span>日報</span>
          <span className="text-base font-normal text-muted-foreground">
            {formattedDate}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            <TaskSection
              title="昨日やったこと"
              tasks={report.yesterdayTasks}
              section="yesterday"
              onTaskStatusChange={onTaskStatusChange}
              onAddTask={onAddTask}
            />

            <Separator />

            <TaskSection
              title="今日やること"
              tasks={report.todayTasks}
              section="today"
              onTaskStatusChange={onTaskStatusChange}
              onAddTask={onAddTask}
            />

            <Separator />

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                メモ
              </h3>
              <Textarea
                placeholder="自由記述欄（Markdown対応）"
                value={report.notes ?? ""}
                onChange={(e) => onNotesChange?.(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
