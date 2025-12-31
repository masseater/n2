/**
 * 日報表示粒度切り替えコンポーネント
 * 日/週/月の表示粒度を切り替える
 */
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type ReportGranularity = "day" | "week" | "month";

type ReportGranularitySwitcherProps = {
  value: ReportGranularity;
  onChange: (value: ReportGranularity) => void;
};

export function ReportGranularitySwitcher({ value, onChange }: ReportGranularitySwitcherProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as ReportGranularity)}>
      <TabsList>
        <TabsTrigger value="day">日</TabsTrigger>
        <TabsTrigger value="week">週</TabsTrigger>
        <TabsTrigger value="month">月</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
