/**
 * 日報タスクエントリコンポーネント
 * 各タスクに対して昨日/今日のノートを入力し、ステータス変更も可能
 */

import { ChevronRight, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { Status, Tag, UpdateTaskInput } from "@/features/tasks/types";
import type { DailyReportTaskWithNotes } from "../types";

type TaskEntryProps = {
  task: DailyReportTaskWithNotes;
  statuses: Status[];
  availableTags: Tag[];
  onNoteChange?: (field: "yesterdayNote" | "todayNote", value: string) => void;
  onTaskUpdate?: (input: UpdateTaskInput) => void;
  onNextStatusChange?: (nextStatusId: string | null) => void;
};

export function TaskEntry({
  task,
  statuses,
  availableTags,
  onNoteChange,
  onTaskUpdate,
  onNextStatusChange,
}: TaskEntryProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState(task.priority?.toString() ?? "");
  const [yesterdayNote, setYesterdayNote] = useState(task.yesterdayNote ?? "");
  const [todayNote, setTodayNote] = useState(task.todayNote ?? "");

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
    const newPriority = priority ? Number.parseInt(priority, 10) : undefined;
    if (Number.isNaN(newPriority)) {
      setPriority(task.priority?.toString() ?? "");
      return;
    }
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

  const sortedStatuses = [...statuses].sort((a, b) => a.position - b.position);
  const nextStatus = task.nextStatusId ? statuses.find((s) => s.id === task.nextStatusId) : null;
  const effectiveStatusId = task.nextStatusId ?? task.statusId;

  const handleStatusSelect = (statusId: string) => {
    if (statusId === effectiveStatusId) {
      return;
    }
    if (statusId === task.statusId) {
      onNextStatusChange?.(null);
    } else {
      onNextStatusChange?.(statusId);
    }
  };

  const addableTags = availableTags.filter((tag) => !task.tags.some((t) => t.id === tag.id));

  return (
    <div className="p-4 rounded-lg border bg-card space-y-3">
      <div className="space-y-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          className="font-medium border-0 px-0 h-auto focus-visible:ring-0"
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
              variant={nextStatus ? "default" : "secondary"}
              size="sm"
              className="h-6 px-2 text-xs gap-1"
            >
              {task.status.name}
              {nextStatus && <span className="text-xs opacity-70">→ {nextStatus.name}</span>}
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {sortedStatuses.map((status) => (
              <DropdownMenuItem
                key={status.id}
                onClick={() => handleStatusSelect(status.id)}
                className={status.id === effectiveStatusId ? "bg-accent" : ""}
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
            {addableTags.map((tag) => (
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
            {addableTags.length === 0 && (
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
