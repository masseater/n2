# 日付処理ルール

## 基本方針

日付の計算・比較・フォーマットには **date-fns** を使用する。自前で日付計算しない。

## 使用例

```typescript
import { format, parse, subDays, addDays, isAfter, isBefore } from "date-fns";

const DATE_FORMAT = "yyyy-MM-dd";

// 文字列 → Date
const date = parse("2026-01-01", DATE_FORMAT, new Date());

// Date → 文字列
const dateStr = format(new Date(), DATE_FORMAT);

// 1日前
const yesterday = subDays(date, 1);

// 比較
if (isAfter(dateA, dateB)) { ... }
```

## 禁止事項

- `toISOString().slice(0, 10)` での日付文字列生成（UTCずれ）
- `split("-").map(Number)` での手動パース
- `setHours(0, 0, 0, 0)` での日付正規化
- `getFullYear() / getMonth() / getDate()` での手動フォーマット
