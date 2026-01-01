# 状態管理

## 基本方針

TanStack Store で UI 状態を集中管理する。個別の hooks ではなく `stores/` から操作する。

## 構成

- `stores/app-store.ts` - ストア定義（tasks, statuses, tags, selectedTask, loading）
- `stores/api-actions.ts` - API 呼び出し + ストア更新を統合

## 使用パターン

```typescript
import { taskApi, statusApi } from "@/stores/api-actions";
import { appStore } from "@/stores/app-store";
import { useStore } from "@tanstack/react-store";

// 読み取り（selector で必要な部分のみ購読）
const tasks = useStore(appStore, (s) => s.tasks);
const loading = useStore(appStore, (s) => s.loading.tasks);

// 更新（api-actions 経由）
await taskApi.create({ title: "New Task" });
await taskApi.update(taskId, { statusId: newStatusId });
```

## 禁止事項

- コンポーネント内で直接 `fetch` を呼ばない
- `appStore.setState()` を直接呼ばない（api-actions 経由で操作）
- 個別の状態管理 hooks を新規作成しない
