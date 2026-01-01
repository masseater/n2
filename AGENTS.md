# NippoNikki (N2)

日報粒度とタスク粒度を切り替え可能な個人向けタスク管理ツール

## Tech Stack

- Monorepo: Turborepo + pnpm workspace
- Framework: TanStack Start
- DB: Cloudflare D1 (Drizzle ORM)
- Deploy: Cloudflare Workers

## Commands

```bash
pnpm dev          # 開発サーバー
pnpm build        # ビルド
pnpm lint         # Biome lint
pnpm lint:fix     # Biome lint (自動修正)
pnpm check-types  # 型チェック (tsgo)
pnpm test         # テスト実行
```

## Packages

| Package | Description |
|---------|-------------|
| @n2/web | TanStack Start Web アプリ |
| @n2/shared | 共通型定義 |
