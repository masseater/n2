# Technology Stack

## Architecture

**フルスタック SSR アプリケーション**
- TanStack Start による Server-Side Rendering
- Cloudflare Workers へのエッジデプロイ
- PWA によるオフライン対応

## Core Technologies

### Primary Language
- **Language**: TypeScript (strict mode)
- **Runtime**: Cloudflare Workers（JavaScript/WebAssembly ランタイム、Node.js API の一部互換）
- **Framework**: TanStack Start

### Frontend
| Category | Technology | Purpose |
|----------|------------|---------|
| Routing | TanStack Router | ファイルベースルーティング |
| State | TanStack Query + TanStack Store | サーバー状態 + クライアント状態 |
| Form | TanStack Form + Zod | フォーム管理 + バリデーション |
| UI | shadcn/ui + Tailwind CSS v4 | コンポーネントライブラリ |
| D&D | @dnd-kit | ドラッグ&ドロップ |
| Markdown | react-markdown + DOMPurify | Markdown レンダリング + XSS 対策 |
| RRULE | rrule | 繰り返しタスク (RFC 5545) |

### Backend
| Category | Technology | Purpose |
|----------|------------|---------|
| Auth | better-auth | Google OAuth 2.0 認証 |
| DI | awilix | 依存性注入 |
| DB | Drizzle ORM + Cloudflare D1 | ORM + SQLite |
| Storage | Cloudflare R2 | オブジェクトストレージ |

### Infrastructure
| Category | Technology | Purpose |
|----------|------------|---------|
| Monorepo | Turborepo + pnpm | モノレポ管理 |
| Build | Vite | ビルドツール |
| Deploy | Cloudflare Workers | エッジデプロイ |
| PWA | Workbox | Service Worker 管理 |

### Development
| Category | Technology | Purpose |
|----------|------------|---------|
| Lint/Format | Biome | コード品質 |
| Test | Vitest | ユニットテスト |
| Type Check | tsgo (TypeScript v7+) | 型チェック |

## Development Standards

### Type Safety
- TypeScript strict mode 必須
- `any` 型の使用は絶対禁止
- `interface` より `type` を優先（既存ライブラリ拡張時のみ `interface`）
- 型推論を活用し、必要最小限の型注釈

### Code Quality
- Biome による lint/format
- ダブルクォート、セミコロン必須
- 未使用 import/変数はエラー
- barrel import/export は禁止

### Testing
- Vitest によるユニットテスト
- TDD (Red-Green-Refactor) サイクル推奨

## Development Environment

### Required Tools
- Node.js >= 24
- pnpm (workspace 管理)
- Wrangler (Cloudflare CLI)

### Common Commands
```bash
# Dev
pnpm dev              # 開発サーバー起動 (port 13000)

# Build
pnpm build            # 全パッケージビルド

# Quality
pnpm lint             # Biome lint
pnpm lint:fix         # Biome lint (自動修正)
pnpm format           # Biome format
pnpm check-types      # 型チェック (tsgo)

# Test
pnpm test             # テスト実行

# Database
pnpm db:generate      # Drizzle マイグレーション生成
pnpm db:migrate       # マイグレーション適用
pnpm db:studio        # Drizzle Studio (DB ブラウザ)
```

## Key Technical Decisions

1. **TanStack Start**:
   - **理由**: フルスタック React + SSR + ファイルベースルーティング
   - **トレードオフ**: 比較的新しいフレームワークだが、TanStack エコシステムとの親和性が高い

2. **Cloudflare D1 (SQLite)**:
   - **理由**: エッジでの低レイテンシ、サーバーレス、コスト効率
   - **トレードオフ**: PostgreSQL より機能制限があるが、個人向けアプリには十分

3. **better-auth**:
   - **理由**: シンプルな認証ライブラリ
   - **トレードオフ**: Google OAuth のみ対応（複数プロバイダーは対応しない）

4. **Last-Write-Wins 同期**:
   - **理由**: シンプルな実装、個人利用なのでコンフリクトリスクが低い
   - **トレードオフ**: CRDT より単純だが、マルチデバイス同時編集には不向き

5. **Materialized Path**:
   - **理由**: 無限階層タスクを効率的にクエリ
   - **トレードオフ**: 移動時のパス更新が必要だが、読み取りが多いユースケースに最適
