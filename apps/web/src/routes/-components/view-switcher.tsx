/**
 * ビュー切り替えコンポーネント
 * リスト・カンバン・日報の3ビューを切り替え
 */

import type { ViewMode } from "@n2/shared";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ViewSwitcherProps = {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
};

export function ViewSwitcher({ value, onChange }: ViewSwitcherProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as ViewMode)}>
      <TabsList className="grid w-full max-w-[300px] grid-cols-3">
        <TabsTrigger value="daily" className="text-sm">
          日報
        </TabsTrigger>
        <TabsTrigger value="list" className="text-sm">
          リスト
        </TabsTrigger>
        <TabsTrigger value="board" className="text-sm">
          ボード
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
