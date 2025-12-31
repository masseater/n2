# @n2/web

TanStack Start による Web アプリケーション。

## Commands

```bash
pnpm dev           # 開発サーバー (port 13000)
pnpm build         # ビルド
pnpm test          # テスト実行
pnpm check-types   # 型チェック (tsgo)
pnpm lint          # Biome lint

# Drizzle
pnpm db:generate   # マイグレーション生成
pnpm db:migrate    # マイグレーション適用
pnpm db:studio     # DB ブラウザ
```

## Structure

```
src/
  routes/           # TanStack file-based routing
    __root.tsx      # ルートレイアウト
    index.tsx       # / ページ
    api/            # API エンドポイント
  features/         # ドメイン別モジュール
    auth/           # 認証
    tasks/          # タスク管理
    daily-reports/  # 日報管理
  db/
    schema.ts       # Drizzle スキーマ定義
    index.ts        # DB クライアント
  components/
    ui/             # shadcn/ui コンポーネント
```

## Routing

- `src/routes/` 配下のファイルが自動的にルートになる
- `routeTree.gen.ts` は自動生成 - 編集禁止
- ルートファイルは `createFileRoute()` をエクスポート
- `-components/` プレフィックスのディレクトリはルート対象外

## Database

- Cloudflare D1 (SQLite)
- Drizzle ORM でスキーマ定義
- 環境変数: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_D1_DATABASE_ID`, `CLOUDFLARE_API_TOKEN`
