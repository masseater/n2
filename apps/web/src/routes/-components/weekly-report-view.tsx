/**
 * 週間日報ビュー
 * 1週間分の日報を縦に並べて概要表示
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DailyReportWithTasks } from "@/features/daily-reports/types";
import type { TaskWithRelations } from "@/features/tasks/types";

type WeeklyReportViewProps = {
  /** 週の開始日（月曜日） */
  weekStart: Date;
  /** 週間の日報データ（日付順） */
  reports: DailyReportWithTasks[];
  /** 日報クリック時のコールバック */
  onDayClick: (date: Date) => void;
  /** タスククリック時のコールバック */
  onTaskClick?: (task: TaskWithRelations) => void;
};

/**
 * 日付を YYYY-MM-DD 形式に変換
 */
function formatDateToString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * 週の7日間を生成
 */
function getWeekDays(weekStart: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    days.push(day);
  }
  return days;
}

/**
 * 今日かどうか判定
 */
function isToday(date: Date): boolean {
  return formatDateToString(date) === formatDateToString(new Date());
}

/**
 * 曜日の日本語表示
 */
function getDayOfWeekJapanese(date: Date): string {
  const days = ["日", "月", "火", "水", "木", "金", "土"] as const;
  return days[date.getDay()] ?? "日";
}

type DaySummaryProps = {
  date: Date;
  report: DailyReportWithTasks | undefined;
  onClick: () => void;
  onTaskClick?: (task: TaskWithRelations) => void;
};

function DaySummary({ date, report, onClick, onTaskClick }: DaySummaryProps) {
  const dayOfWeek = getDayOfWeekJapanese(date);
  const isCurrentDay = isToday(date);
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  const tasks = report?.tasks ?? [];
  const completedCount = tasks.filter((t) => t.status.type === "done").length;
  const inProgressCount = tasks.filter((t) => t.status.type !== "done").length;
  const totalTasks = tasks.length;

  return (
    <Card
      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
        isCurrentDay ? "ring-2 ring-primary" : ""
      }`}
      onClick={onClick}
    >
      <CardHeader className="py-3 px-4">
        <CardTitle className="flex items-center justify-between text-sm">
          <span
            className={`font-medium ${
              isWeekend ? "text-muted-foreground" : ""
            } ${isCurrentDay ? "text-primary" : ""}`}
          >
            {date.getDate()}日 ({dayOfWeek})
          </span>
          {isCurrentDay && (
            <Badge variant="default" className="text-xs">
              今日
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2 px-4">
        {report ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">完了</span>
              <span className="font-medium">
                {completedCount}/{totalTasks}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">進行中</span>
              <span className="font-medium">{inProgressCount}件</span>
            </div>
            {tasks.slice(0, 3).map((task) => (
              <button
                type="button"
                key={task.id}
                className="text-xs truncate text-muted-foreground hover:text-foreground cursor-pointer block w-full text-left"
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskClick?.(task);
                }}
              >
                {task.status.type === "done" ? "✓ " : "○ "}
                {task.title}
              </button>
            ))}
            {totalTasks > 3 && (
              <div className="text-xs text-muted-foreground">他 {totalTasks - 3} 件</div>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground py-2">記録なし</p>
        )}
      </CardContent>
    </Card>
  );
}

export function WeeklyReportView({
  weekStart,
  reports,
  onDayClick,
  onTaskClick,
}: WeeklyReportViewProps) {
  const weekDays = getWeekDays(weekStart);

  // 日付文字列をキーにした日報マップを作成
  const reportMap = new Map<string, DailyReportWithTasks>();
  for (const report of reports) {
    reportMap.set(report.date, report);
  }

  // 週の開始日と終了日を表示用にフォーマット
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const weekRangeText = `${weekStart.getMonth() + 1}/${weekStart.getDate()} - ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;

  // 週間サマリー
  const totalCompleted = reports.reduce(
    (sum, r) => sum + r.tasks.filter((t) => t.status.type === "done").length,
    0,
  );
  const weeklyTotalTasks = reports.reduce((sum, r) => sum + r.tasks.length, 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span>週間レポート</span>
          <span className="text-base font-normal text-muted-foreground">{weekRangeText}</span>
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            完了タスク: <strong className="text-foreground">{totalCompleted}</strong>/
            {weeklyTotalTasks}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const dateStr = formatDateToString(day);
              const report = reportMap.get(dateStr);
              return (
                <DaySummary
                  key={dateStr}
                  date={day}
                  report={report}
                  onClick={() => onDayClick(day)}
                  onTaskClick={onTaskClick}
                />
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
