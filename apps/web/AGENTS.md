# @n2/web

TanStack Start による Web アプリケーション。

## Commands

```bash
pnpm dev           # 開発サーバー (port 13000)
pnpm build         # ビルド
pnpm test          # テスト実行
pnpm check-types   # 型チェック (tsgo)

# 単一テストファイル
pnpm exec vitest run src/path/to/file.test.ts

# ローカル DB
pnpm db:migrate:local
pnpm db:studio:local
```

## URL Structure

| Path | Description |
|------|-------------|
| `/` | `/daily/{today}` へリダイレクト |
| `/list` | リストビュー |
| `/board` | カンバンボード |
| `/daily/$date` | 日報ビュー（日/週/月切替可能） |

## Architecture

```
src/
├── routes/                   # TanStack file-based routing
│   ├── -components/          # ビュー共通コンポーネント
│   ├── api/                  # HTTP endpoints
│   ├── list.tsx
│   ├── board.tsx
│   └── daily/$date.tsx
├── stores/                   # TanStack Store
│   ├── app-store.ts          # アプリ状態
│   └── api-actions.ts        # API + ストア更新
├── features/                 # ドメイン別モジュール
│   ├── tasks/
│   ├── daily-reports/
│   └── tags/
├── lib/
│   └── date.ts               # date-fns ユーティリティ
├── db/                       # Drizzle schema & client
└── components/ui/            # shadcn/ui
```

## Routing

- `src/routes/` 配下のファイルが自動的にルートになる
- `routeTree.gen.ts` は自動生成（編集禁止）
- `-components/` プレフィックスのディレクトリはルート対象外

## Database

- Cloudflare D1 (SQLite)
- Drizzle ORM
- 環境変数: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_D1_DATABASE_ID`, `CLOUDFLARE_API_TOKEN`
