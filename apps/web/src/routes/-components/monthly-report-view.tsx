/**
 * 月間日報ビュー
 * カレンダー形式で月を俯瞰、タスクがある日をマーク
 */

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyReportWithTasks } from "@/features/daily-reports/types";

type MonthlyReportViewProps = {
  /** 表示する月（その月の任意の日付） */
  month: Date;
  /** 月間の日報データ */
  reports: DailyReportWithTasks[];
  /** 日付クリック時のコールバック */
  onDayClick: (date: Date) => void;
  /** 月変更時のコールバック */
  onMonthChange: (date: Date) => void;
};

/**
 * 日付を YYYY-MM-DD 形式に変換
 */
function formatDateToString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * 今日かどうか判定
 */
function isToday(date: Date): boolean {
  return formatDateToString(date) === formatDateToString(new Date());
}

/**
 * 月の全日を取得（カレンダー表示用に前後の日も含む）
 */
function getCalendarDays(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];

  // 月の最初の週の空白を埋める（日曜始まり）
  const firstDayOfWeek = firstDay.getDay();
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }

  // 月の日付を追加
  for (let day = 1; day <= lastDay.getDate(); day++) {
    currentWeek.push(new Date(year, month, day));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // 最後の週の空白を埋める
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

type DayCellProps = {
  date: Date | null;
  report: DailyReportWithTasks | undefined;
  isCurrentMonth: boolean;
  onClick: () => void;
};

function DayCell({ date, report, isCurrentMonth, onClick }: DayCellProps) {
  if (!date) {
    return <div className="h-24 bg-muted/20" />;
  }

  const isCurrentDay = isToday(date);
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  const tasks = report?.tasks ?? [];
  const completedCount = tasks.filter((t) => t.status.type === "done").length;
  const totalTasks = tasks.length;
  const hasNotes = report?.notes && report.notes.trim().length > 0;

  return (
    <button
      type="button"
      className={`h-24 p-1 border cursor-pointer transition-colors hover:bg-muted/50 text-left ${
        isCurrentDay ? "ring-2 ring-primary ring-inset" : ""
      } ${!isCurrentMonth ? "opacity-50" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <span
          className={`text-sm font-medium ${
            isWeekend ? "text-muted-foreground" : ""
          } ${isCurrentDay ? "text-primary" : ""}`}
        >
          {date.getDate()}
        </span>
        {isCurrentDay && (
          <Badge variant="default" className="text-[10px] px-1 py-0">
            今日
          </Badge>
        )}
      </div>

      {report && totalTasks > 0 && (
        <div className="mt-1 space-y-1">
          <div className="flex items-center gap-1">
            <div
              className="h-1.5 rounded-full bg-primary"
              style={{
                width: `${(completedCount / totalTasks) * 100}%`,
                minWidth: completedCount > 0 ? "8px" : "0",
              }}
            />
            <span className="text-[10px] text-muted-foreground">
              {completedCount}/{totalTasks}
            </span>
          </div>
          {tasks.slice(0, 2).map((task) => (
            <div key={task.id} className="text-[10px] truncate text-muted-foreground">
              {task.status.type === "done" ? "✓" : "○"} {task.title}
            </div>
          ))}
          {totalTasks > 2 && (
            <div className="text-[10px] text-muted-foreground">+{totalTasks - 2}</div>
          )}
        </div>
      )}

      {hasNotes && (
        <div className="mt-1">
          <Badge variant="outline" className="text-[10px] px-1 py-0">
            メモ
          </Badge>
        </div>
      )}
    </button>
  );
}

export function MonthlyReportView({
  month,
  reports,
  onDayClick,
  onMonthChange,
}: MonthlyReportViewProps) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const weeks = getCalendarDays(year, monthIndex);

  // 日付文字列をキーにした日報マップを作成
  const reportMap = new Map<string, DailyReportWithTasks>();
  for (const report of reports) {
    reportMap.set(report.date, report);
  }

  const goToPreviousMonth = () => {
    const prev = new Date(year, monthIndex - 1, 1);
    onMonthChange(prev);
  };

  const goToNextMonth = () => {
    const next = new Date(year, monthIndex + 1, 1);
    onMonthChange(next);
  };

  const goToCurrentMonth = () => {
    onMonthChange(new Date());
  };

  const monthLabel = `${year}年${monthIndex + 1}月`;
  const isCurrentMonth = year === new Date().getFullYear() && monthIndex === new Date().getMonth();

  // 月間サマリー
  const monthlyCompleted = reports.reduce(
    (sum, r) => sum + r.tasks.filter((t) => t.status.type === "done").length,
    0,
  );
  const monthlyTotalTasks = reports.reduce((sum, r) => sum + r.tasks.length, 0);
  const daysWithReports = reports.filter((r) => r.tasks.length > 0).length;

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[120px] text-center">{monthLabel}</span>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            {!isCurrentMonth && (
              <Button variant="ghost" size="sm" onClick={goToCurrentMonth}>
                今月
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground font-normal">
            <span>
              記録日数: <strong className="text-foreground">{daysWithReports}</strong>日
            </span>
            <span>
              完了: <strong className="text-foreground">{monthlyCompleted}</strong>/
              {monthlyTotalTasks}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-px bg-border">
          {WEEKDAY_LABELS.map((label, i) => (
            <div
              key={label}
              className={`text-center text-sm font-medium py-2 bg-muted ${
                i === 0 || i === 6 ? "text-muted-foreground" : ""
              }`}
            >
              {label}
            </div>
          ))}
          {weeks.flat().map((date, index) => {
            const dateStr = date ? formatDateToString(date) : "";
            const report = date ? reportMap.get(dateStr) : undefined;
            const cellKey = date ? formatDateToString(date) : `empty-${index}`;
            return (
              <DayCell
                key={cellKey}
                date={date}
                report={report}
                isCurrentMonth={date?.getMonth() === monthIndex}
                onClick={() => {
                  if (date) {
                    onDayClick(date);
                  }
                }}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
