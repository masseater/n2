/**
 * 日報ビューコンポーネント
 * タスク主軸: 各タスクに対して昨日/今日のノートを入力
 * タスクの内容もインライン編集可能
 *
 * ステータス表示:
 * - 現在のステータス: その日時点のスナップショット（読み取り専用）
 * - 次のステータス: 矢印で選択可能（今日以降に反映）
 */

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { TaskEntry } from "@/features/daily-reports/components/TaskEntry";
import type { DailyReportWithTasks } from "@/features/daily-reports/types";
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
  // ソートはサービス層で実施済み
  const tasks = report.tasks;

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
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">タスクがありません</p>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <TaskEntry
                      key={task.id}
                      task={task}
                      statuses={statuses}
                      availableTags={tags}
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
