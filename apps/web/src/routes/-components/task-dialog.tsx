/**
 * タスク作成・編集ダイアログ
 */
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CreateTaskInput, Status, Tag } from "@/features/tasks/types";

type TaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateTaskInput) => void;
  statuses: Status[];
  tags: Tag[];
  parentId?: string;
  initialData?: Partial<CreateTaskInput>;
  mode?: "create" | "edit";
};

export function TaskDialog({
  open,
  onOpenChange,
  onSubmit,
  statuses,
  tags,
  parentId,
  initialData,
  mode = "create",
}: TaskDialogProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [statusId, setStatusId] = useState(
    initialData?.statusId ?? statuses.find((s) => s.type === "todo")?.id ?? "",
  );
  const [priority, setPriority] = useState<number | undefined>(initialData?.priority);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !statusId) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      statusId,
      parentId,
      priority,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setPriority(undefined);
    setSelectedTags([]);
    onOpenChange(false);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "タスクを作成" : "タスクを編集"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <span className="text-sm font-medium">タイトル</span>
              <Input
                placeholder="タスクのタイトル"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">説明</span>
              <Textarea
                placeholder="タスクの詳細（任意）"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">ステータス</span>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <Button
                    key={status.id}
                    type="button"
                    variant={statusId === status.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusId(status.id)}
                  >
                    {status.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">優先度 (1-10)</span>
              <Input
                type="number"
                min={1}
                max={10}
                placeholder="優先度"
                value={priority ?? ""}
                onChange={(e) => setPriority(e.target.value ? Number(e.target.value) : undefined)}
                className="w-24"
              />
            </div>

            {tags.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-medium">タグ</span>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                      className="cursor-pointer"
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={!title.trim() || !statusId}>
              {mode === "create" ? "作成" : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
