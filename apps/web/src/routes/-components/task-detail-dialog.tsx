/**
 * タスク詳細・編集ダイアログ
 * クリック時に即編集可能な状態で表示
 * 日報ノート履歴と説明バージョン履歴は折りたたみで閲覧可能
 */
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Trash2, X, Check, ChevronDown, ChevronRight, Calendar, History } from "lucide-react";
import type { TaskWithRelations, Status, Tag, UpdateTaskInput } from "@/features/tasks/types";
import type { TaskDetailWithHistory } from "@n2/shared";

type TaskDetailDialogProps = {
  task: TaskWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (input: UpdateTaskInput) => void;
  onDelete: () => void;
  statuses: Status[];
  tags: Tag[];
};

/**
 * 日付を読みやすい形式にフォーマット
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
  });
}

/**
 * タイムスタンプを読みやすい形式にフォーマット
 */
function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
  statuses,
  tags,
}: TaskDetailDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [statusId, setStatusId] = useState("");
  const [priority, setPriority] = useState<number | undefined>(undefined);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);

  // タスク詳細（履歴付き）を取得
  const { data: taskDetail } = useQuery<TaskDetailWithHistory>({
    queryKey: ["task-detail", task?.id],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${task?.id}/detail`);
      if (!res.ok) throw new Error("タスク詳細の取得に失敗");
      return res.json();
    },
    enabled: open && !!task?.id,
  });

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setStatusId(task.statusId);
      setPriority(task.priority ?? undefined);
      setSelectedTags(task.tags.map((t) => t.id));
      setConfirmDelete(false);
      setHasChanges(false);
    }
  }, [task]);

  const markChanged = () => {
    if (!hasChanges) setHasChanges(true);
  };

  const handleSave = () => {
    if (!title.trim()) return;

    onUpdate({
      title: title.trim(),
      description: description.trim() || undefined,
      statusId,
      priority,
      tagIds: selectedTags,
    });
    setHasChanges(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    if (hasChanges) {
      handleSave();
    } else {
      onOpenChange(false);
    }
  };

  const toggleTag = (tagId: string) => {
    markChanged();
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  if (!task) return null;

  const noteCount = taskDetail?.noteHistory?.length ?? 0;
  const versionCount = taskDetail?.descriptionVersions?.length ?? 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] p-0 gap-0 flex flex-col">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="sr-only">タスク編集</DialogTitle>
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              markChanged();
            }}
            className="text-lg font-semibold border-0 px-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="タスクタイトル"
          />
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            <Textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                markChanged();
              }}
              className="min-h-[100px] resize-none border-dashed"
              placeholder="説明を追加..."
            />

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground w-16">状態:</span>
              {statuses.map((status) => (
                <Button
                  key={status.id}
                  type="button"
                  variant={statusId === status.id ? "default" : "ghost"}
                  size="sm"
                  className="h-7"
                  onClick={() => {
                    setStatusId(status.id);
                    markChanged();
                  }}
                >
                  {status.name}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-16">優先度:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                  <Button
                    key={p}
                    type="button"
                    variant={priority === p ? "default" : "ghost"}
                    size="sm"
                    className="h-7 w-7 text-xs"
                    onClick={() => {
                      setPriority(priority === p ? undefined : p);
                      markChanged();
                    }}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground w-16">タグ:</span>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      style={
                        selectedTags.includes(tag.id)
                          ? { backgroundColor: tag.color }
                          : { borderColor: tag.color, color: tag.color }
                      }
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-4" />

            {/* 日報履歴 */}
            <Collapsible open={notesOpen} onOpenChange={setNotesOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between h-8 px-2">
                  <span className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    日報履歴
                    {noteCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {noteCount}
                      </Badge>
                    )}
                  </span>
                  {notesOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                {noteCount > 0 ? (
                  <div className="space-y-3 pl-2">
                    {taskDetail?.noteHistory?.map((entry) => (
                      <div key={entry.date} className="space-y-1 text-sm">
                        <div className="font-medium text-muted-foreground">
                          {formatDate(entry.date)}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 bg-muted rounded text-xs">
                            <div className="text-muted-foreground mb-1">昨日</div>
                            <div className="whitespace-pre-wrap">{entry.yesterdayNote || "-"}</div>
                          </div>
                          <div className="p-2 bg-muted rounded text-xs">
                            <div className="text-muted-foreground mb-1">今日</div>
                            <div className="whitespace-pre-wrap">{entry.todayNote || "-"}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground pl-2">履歴がありません</p>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* 編集履歴 */}
            <Collapsible open={versionsOpen} onOpenChange={setVersionsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between h-8 px-2">
                  <span className="flex items-center gap-2 text-sm">
                    <History className="h-4 w-4" />
                    編集履歴
                    {versionCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {versionCount}
                      </Badge>
                    )}
                  </span>
                  {versionsOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                {versionCount > 0 ? (
                  <div className="space-y-3 pl-2">
                    {taskDetail?.descriptionVersions?.map((version) => (
                      <div key={version.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">v{version.version}</span>
                          <span className="text-muted-foreground">
                            {formatDateTime(version.createdAt)}
                          </span>
                        </div>
                        <div className="p-2 bg-muted rounded text-xs whitespace-pre-wrap">
                          {version.description}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground pl-2">履歴がありません</p>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>

        <div className="p-4 pt-2 flex items-center justify-between border-t">
          <div>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-destructive">削除しますか?</span>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-7"
                  onClick={() => {
                    onDelete();
                    onOpenChange(false);
                  }}
                >
                  <Check className="h-3 w-3 mr-1" />
                  はい
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7"
                  onClick={() => setConfirmDelete(false)}
                >
                  <X className="h-3 w-3 mr-1" />
                  いいえ
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-muted-foreground hover:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                削除
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {hasChanges ? "変更あり" : ""}
            </span>
            <Button
              size="sm"
              className="h-7"
              onClick={handleSave}
              disabled={!title.trim()}
            >
              {hasChanges ? "保存して閉じる" : "閉じる"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
