# @n2/shared

モノレポ共通の型定義・ユーティリティ。

## Commands

```bash
pnpm check-types   # 型チェック (tsgo)
```

## Exports

```typescript
import { Task, DailyReport, ViewMode } from "@n2/shared";
import type { TaskStatus } from "@n2/shared/types";
```

## Structure

```
src/
  index.ts          # メインエクスポート
  types/
    index.ts        # 型定義 (Task, DailyReport, ViewMode, TaskStatus)
```

## 型定義

- `Task` - タスクの基本型 (id, title, description, status, date)
- `TaskStatus` - "todo" | "in_progress" | "done"
- `DailyReport` - 日報型 (date, summary, tasks)
- `ViewMode` - "task" | "daily"
