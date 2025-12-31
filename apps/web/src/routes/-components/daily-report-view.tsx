/**
 * 日報ビューコンポーネント
 * タスク主軸: 各タスクに対して昨日/今日のノートを入力
 * タスクの内容もインライン編集可能
 *
 * ステータス表示:
 * - 現在のステータス: その日時点のスナップショット（読み取り専用）
 * - 次のステータス: 矢印で選択可能（今日以降に反映）
 */

import { ChevronRight, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type {
  DailyReportTaskWithNotes,
  DailyReportWithTasks,
} from "@/features/daily-reports/types";
import type { Status, Tag, UpdateTaskInput } from "@/features/tasks/types";
import { DateNavigator } from "./date-navigator";
import { type ReportGranularity, ReportGranularitySwitcher } from "./report-granularity-switcher";

type DailyReportViewProps = {
  report: DailyReportWithTasks;
  statuses: Status[];
  tags: Tag[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  granularity: ReportGranularity;
  onGranularityChange: (granularity: ReportGranularity) => void;
  onNotesChange?: (notes: string) => void;
  onTaskNoteChange?: (taskId: string, field: "yesterdayNote" | "todayNote", value: string) => void;
  onTaskUpdate?: (taskId: string, input: UpdateTaskInput) => void;
  onNextStatusChange?: (taskId: string, nextStatusId: string | null) => void;
  onAddTask?: () => void;
};

function TaskEntry({
  task,
  statuses,
  allTags,
  onNoteChange,
  onTaskUpdate,
  onNextStatusChange,
}: {
  task: DailyReportTaskWithNotes;
  statuses: Status[];
  allTags: Tag[];
  onNoteChange?: (field: "yesterdayNote" | "todayNote", value: string) => void;
  onTaskUpdate?: (input: UpdateTaskInput) => void;
  onNextStatusChange?: (nextStatusId: string | null) => void;
}) {
  const isDone = task.status.type === "done";

  // ローカルステートでバッファリングし、blur時に保存
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState(task.priority?.toString() ?? "");
  const [yesterdayNote, setYesterdayNote] = useState(task.yesterdayNote ?? "");
  const [todayNote, setTodayNote] = useState(task.todayNote ?? "");

  // 外部からのprops変更に追従（別日への移動時など）
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? "");
    setPriority(task.priority?.toString() ?? "");
    setYesterdayNote(task.yesterdayNote ?? "");
    setTodayNote(task.todayNote ?? "");
  }, [task.title, task.description, task.priority, task.yesterdayNote, task.todayNote]);

  const handleTitleBlur = () => {
    if (title !== task.title) {
      onTaskUpdate?.({ title });
    }
  };

  const handleDescriptionBlur = () => {
    const newDesc = description || undefined;
    if (newDesc !== task.description) {
      onTaskUpdate?.({ description: newDesc });
    }
  };

  const handlePriorityBlur = () => {
    const newPriority = priority ? parseInt(priority, 10) : undefined;
    if (newPriority !== task.priority) {
      onTaskUpdate?.({ priority: newPriority });
    }
  };

  const handleYesterdayNoteBlur = () => {
    if (yesterdayNote !== (task.yesterdayNote ?? "")) {
      onNoteChange?.("yesterdayNote", yesterdayNote);
    }
  };

  const handleTodayNoteBlur = () => {
    if (todayNote !== (task.todayNote ?? "")) {
      onNoteChange?.("todayNote", todayNote);
    }
  };

  // ステータス一覧（position順でソート）
  const sortedStatuses = [...statuses].sort((a, b) => a.position - b.position);

  // 今日変更したステータス（履歴）
  const changedStatus = task.nextStatusId ? statuses.find((s) => s.id === task.nextStatusId) : null;

  // 現在の実際のステータス（nextStatusIdがあれば変更後、なければスナップショット）
  const currentActualStatusId = task.nextStatusId ?? task.statusId;

  const handleStatusSelect = (statusId: string) => {
    // 現在の実際のステータスと同じ場合は何もしない
    if (statusId === currentActualStatusId) {
      return;
    }
    // スナップショット（元のステータス）と同じ場合はnull（変更取り消し）
    if (statusId === task.statusId) {
      onNextStatusChange?.(null);
    } else {
      onNextStatusChange?.(statusId);
    }
  };

  return (
    <div className="p-4 rounded-lg border bg-card space-y-3">
      <div className="space-y-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          className={`font-medium border-0 px-0 h-auto focus-visible:ring-0 ${isDone ? "line-through text-muted-foreground" : ""}`}
          placeholder="タスクタイトル"
        />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleDescriptionBlur}
          className="text-sm min-h-[40px] resize-none border-dashed"
          placeholder="説明..."
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">優先度:</span>
        <Input
          type="number"
          min="1"
          max="10"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          onBlur={handlePriorityBlur}
          className="w-14 h-6 text-xs text-center px-1"
          placeholder="-"
        />
        <span className="text-xs text-muted-foreground">状態:</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={changedStatus ? "default" : "secondary"}
              size="sm"
              className="h-6 px-2 text-xs gap-1"
            >
              {task.status.name}
              {changedStatus && <span className="text-xs opacity-70">→ {changedStatus.name}</span>}
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {sortedStatuses.map((status) => (
              <DropdownMenuItem
                key={status.id}
                onClick={() => handleStatusSelect(status.id)}
                className={status.id === currentActualStatusId ? "bg-accent" : ""}
              >
                {status.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="text-xs text-muted-foreground ml-2">タグ:</span>
        {task.tags.map((tag) => (
          <Badge
            key={tag.id}
            variant="outline"
            className="text-xs cursor-pointer hover:opacity-70"
            style={{ borderColor: tag.color, color: tag.color }}
            onClick={() => {
              const newTagIds = task.tags.filter((t) => t.id !== tag.id).map((t) => t.id);
              onTaskUpdate?.({ tagIds: newTagIds });
            }}
          >
            {tag.name} ×
          </Badge>
        ))}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {allTags
              .filter((tag) => !task.tags.some((t) => t.id === tag.id))
              .map((tag) => (
                <DropdownMenuItem
                  key={tag.id}
                  onClick={() => {
                    const newTagIds = [...task.tags.map((t) => t.id), tag.id];
                    onTaskUpdate?.({ tagIds: newTagIds });
                  }}
                >
                  <span
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </DropdownMenuItem>
              ))}
            {allTags.filter((tag) => !task.tags.some((t) => t.id === tag.id)).length === 0 && (
              <DropdownMenuItem disabled>追加可能なタグがありません</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">昨日やったこと</span>
          <Textarea
            placeholder="昨日の進捗..."
            value={yesterdayNote}
            onChange={(e) => setYesterdayNote(e.target.value)}
            onBlur={handleYesterdayNoteBlur}
            className="text-sm min-h-[60px] resize-none"
          />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">今日やること</span>
          <Textarea
            placeholder="今日の予定..."
            value={todayNote}
            onChange={(e) => setTodayNote(e.target.value)}
            onBlur={handleTodayNoteBlur}
            className="text-sm min-h-[60px] resize-none"
          />
        </div>
      </div>
    </div>
  );
}

export function DailyReportView({
  report,
  statuses,
  tags,
  selectedDate,
  onDateChange,
  granularity,
  onGranularityChange,
  onNotesChange,
  onTaskNoteChange,
  onTaskUpdate,
  onNextStatusChange,
  onAddTask,
}: DailyReportViewProps) {
  // 優先度（降順） > ID でソート
  const sortedTasks = [...report.tasks].sort((a, b) => {
    const priorityA = a.priority ?? 0;
    const priorityB = b.priority ?? 0;
    if (priorityA !== priorityB) return priorityB - priorityA;
    return a.id.localeCompare(b.id);
  });

  return (
    <div>
      <div className="sticky top-0 bg-background z-10 py-6 mb-8">
        <div className="flex items-center justify-between">
          <DateNavigator date={selectedDate} onChange={onDateChange} />
          <ReportGranularitySwitcher value={granularity} onChange={onGranularityChange} />
        </div>
      </div>
      <Card className="h-full">
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                タスク
              </h3>
              {sortedTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">タスクがありません</p>
              ) : (
                <div className="space-y-3">
                  {sortedTasks.map((task) => (
                    <TaskEntry
                      key={task.id}
                      task={task}
                      statuses={statuses}
                      allTags={tags}
                      onNoteChange={(field, value) => onTaskNoteChange?.(task.id, field, value)}
                      onTaskUpdate={(input) => onTaskUpdate?.(task.id, input)}
                      onNextStatusChange={(nextStatusId) =>
                        onNextStatusChange?.(task.id, nextStatusId)
                      }
                    />
                  ))}
                </div>
              )}
              <Button variant="outline" className="w-full" onClick={onAddTask}>
                <Plus className="h-4 w-4 mr-2" />
                タスクを追加
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                振り返り・所感
              </h3>
              <Textarea
                placeholder="今日の振り返りや気づきなど"
                value={report.notes ?? ""}
                onChange={(e) => onNotesChange?.(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
