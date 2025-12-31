/**
 * 日付ナビゲーションコンポーネント
 * 前日/翌日ボタンとカレンダーピッカーで日付を選択
 */
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DateNavigatorProps = {
  date: Date;
  onChange: (date: Date) => void;
};

/**
 * 日付を YYYY-MM-DD 形式の文字列に変換
 */
function formatDateToString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * 日付を日本語形式で表示
 */
function formatDateJapanese(date: Date): string {
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

/**
 * 今日かどうかを判定
 */
function isToday(date: Date): boolean {
  const today = new Date();
  return formatDateToString(date) === formatDateToString(today);
}

export function DateNavigator({ date, onChange }: DateNavigatorProps) {
  const goToPreviousDay = () => {
    const prev = new Date(date);
    prev.setDate(prev.getDate() - 1);
    onChange(prev);
  };

  const goToNextDay = () => {
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    onChange(next);
  };

  const goToToday = () => {
    onChange(new Date());
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={goToPreviousDay}
        aria-label="前日"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="min-w-[200px] justify-center font-medium"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateJapanese(date)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selected) => {
              if (selected) {
                onChange(selected);
              }
            }}
            defaultMonth={date}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="icon"
        onClick={goToNextDay}
        aria-label="翌日"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {!isToday(date) && (
        <Button variant="ghost" size="sm" onClick={goToToday}>
          今日
        </Button>
      )}
    </div>
  );
}
