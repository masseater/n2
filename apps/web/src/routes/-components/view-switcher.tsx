/**
 * ビュー切り替えコンポーネント
 * リスト・カンバン・日報の3ビューをURL遷移で切り替え
 */

import { Link } from "@tanstack/react-router";
import { getTodayString } from "@/lib/date";
import { cn } from "@/lib/utils";

type ViewSwitcherProps = {
  currentPath: string;
};

type ViewOption = {
  label: string;
  path: string;
  matchPattern: string;
};

const views: ViewOption[] = [
  { label: "日報", path: `/daily/${getTodayString()}`, matchPattern: "/daily" },
  { label: "リスト", path: "/list", matchPattern: "/list" },
  { label: "ボード", path: "/board", matchPattern: "/board" },
];

export function ViewSwitcher({ currentPath }: ViewSwitcherProps) {
  const isActive = (pattern: string) => currentPath.startsWith(pattern);

  return (
    <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
      {views.map((view) => (
        <Link
          key={view.matchPattern}
          to={view.path}
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            isActive(view.matchPattern)
              ? "bg-background text-foreground shadow"
              : "hover:bg-background/50 hover:text-foreground",
          )}
        >
          {view.label}
        </Link>
      ))}
    </div>
  );
}
