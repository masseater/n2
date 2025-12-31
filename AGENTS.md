# NippoNikki (N2) - Claude Code 設定

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**NippoNikki (N2)** - 日報粒度とタスク粒度を切り替え可能なタスク管理ツール

## Tech Stack

- **Monorepo**: Turborepo + pnpm workspace
- **Framework**: TanStack Start (fullstack React with SSR)
- **Routing**: TanStack Router (file-based)
- **State**: TanStack Query + TanStack Store
- **Form**: TanStack Form + Zod
- **UI**: shadcn/ui + Tailwind CSS v4
- **Auth**: better-auth (Google OAuth 2.0)
- **DI**: awilix
- **DB**: Cloudflare D1 (SQLite via Drizzle ORM)
- **Storage**: Cloudflare R2
- **Deploy**: Cloudflare Workers
- **Lint/Format**: Biome
- **Test**: Vitest

## Directory Structure

```
apps/
  web/                          # TanStack Start Web アプリ
    src/
      routes/                   # TanStack file-based routing
        -components/            # Route-shared UI (Header, etc.)
        api/                    # HTTP endpoints
      features/                 # Domain-first modules
        auth/                   # Authentication
        tasks/                  # タスク管理
        daily-reports/          # 日報管理
      db/                       # Drizzle schema & client
      components/ui/            # shadcn/ui components

packages/
  shared/                       # 共通型定義・ユーティリティ
  tsconfig/                     # 共通 TypeScript 設定
```

## Development

- **ポート**: 13000以降を使用（他プロセスとの競合回避）
- **開発URL**: http://localhost:13000/

## Commands

```bash
pnpm dev          # 開発サーバー起動
pnpm build        # ビルド
pnpm lint         # Biome lint
pnpm lint:fix     # Biome lint (自動修正)
pnpm format       # Biome format
pnpm check-types  # 型チェック (tsgo)
pnpm test         # テスト実行
pnpm db:generate  # Drizzle マイグレーション生成
pnpm db:migrate   # マイグレーション適用
pnpm db:studio    # Drizzle Studio (DB ブラウザ)

# 単一テストファイル実行
pnpm --filter @n2/web exec vitest run src/path/to/file.test.ts

# テスト watch モード
pnpm --filter @n2/web exec vitest

# 特定パッケージのみ対象
pnpm --filter @n2/web dev
pnpm --filter @n2/shared build
```

## Packages

| Package | Description |
|---------|-------------|
| `@n2/web` | TanStack Start Web アプリケーション |
| `@n2/shared` | 共通型定義・ユーティリティ |
| `@n2/tsconfig` | 共通 TypeScript 設定 |
