# Project Structure

## Directory Organization

```
n2/
├── apps/
│   └── web/                        # TanStack Start Web アプリ
│       ├── src/
│       │   ├── routes/             # TanStack Router (file-based)
│       │   │   ├── api/            # API エンドポイント
│       │   │   └── -components/    # ルート共有 UI
│       │   ├── features/           # ドメイン別モジュール
│       │   │   ├── auth/           # 認証
│       │   │   ├── tasks/          # タスク管理
│       │   │   └── daily-reports/  # 日報管理
│       │   ├── db/                 # Drizzle スキーマ & クライアント
│       │   └── components/ui/      # shadcn/ui コンポーネント
│       ├── drizzle/                # マイグレーションファイル
│       └── public/                 # 静的アセット
├── packages/
│   ├── shared/                     # 共通型定義・ユーティリティ
│   └── tsconfig/                   # 共通 TypeScript 設定
├── specs/
│   ├── _steering/                  # ステアリングドキュメント
│   └── [taskname]/                 # タスク別仕様書
└── .agents/                        # AI エージェント用ディレクトリ
```

**組織化の原則**:
- **ドメイン優先**: 機能単位でディレクトリを分割（features/）
- **コロケーション**: 関連するコード（コンポーネント、hooks、型定義）は同じ場所に配置
- **パッケージ分離**: 共通コードは packages/ に抽出

## Naming Conventions

### ファイル名
| パターン | 用途 | 例 |
|----------|------|-----|
| kebab-case.ts | 一般的な TypeScript ファイル | `task-service.ts` |
| kebab-case.tsx | React コンポーネント | `task-list.tsx` |
| *.test.ts | テストファイル | `task-service.test.ts` |
| *.d.ts | 型定義ファイル | `env.d.ts` |

### ディレクトリ名
- **kebab-case**: 全ディレクトリ名は kebab-case
- **単数形**: `feature/task/` ではなく `features/tasks/`（features は複数形だが、中身は単数形で可）

### コード命名
| 種類 | パターン | 例 |
|------|----------|-----|
| 型 | PascalCase | `Task`, `DailyReport` |
| 関数 | camelCase | `createTask`, `getDailyReport` |
| 定数 | UPPER_SNAKE_CASE | `DEFAULT_STATUS`, `MAX_PRIORITY` |
| コンポーネント | PascalCase | `TaskList`, `DailyReportView` |

## Code Organization Principles

1. **単一責任**: 各ファイル・モジュールは1つの責任のみを持つ
2. **コロケーション**: 関連するコードは物理的に近くに配置（機能単位で分けない）
3. **明示的インポート**: barrel export 禁止、直接インポート
4. **循環参照禁止**: モジュール間の循環依存を避ける

## Module Boundaries

```
features/
├── auth/           # 認証ドメイン
│   ├── components/ # 認証 UI
│   ├── hooks/      # 認証フック
│   ├── api/        # 認証 API クライアント
│   └── types.ts    # 認証型定義
├── tasks/          # タスクドメイン
│   ├── components/ # タスク UI
│   ├── hooks/      # タスクフック
│   ├── api/        # タスク API クライアント
│   └── types.ts    # タスク型定義
└── daily-reports/  # 日報ドメイン
    ├── components/ # 日報 UI
    ├── hooks/      # 日報フック
    ├── api/        # 日報 API クライアント
    └── types.ts    # 日報型定義
```

**ドメイン間の依存ルール**:
- `auth` は他のドメインに依存しない
- `tasks` は `auth` に依存可能
- `daily-reports` は `auth`, `tasks` に依存可能

## File Size Guidelines

- **推奨サイズ**: 200行以下
- **最大サイズ**: 400行（超える場合は分割を検討）
- **コンポーネント**: 150行以下を推奨

## Documentation Standards

### プロジェクトレベル
- **README.md**: プロジェクト概要、セットアップ手順
- **AGENTS.md**: Claude Code 用ガイドライン
- **specs/overview.md**: プロダクト仕様
- **specs/_steering/**: ステアリングドキュメント

### コードレベル
- **TSDoc**: 公開 API には日本語で TSDoc を記述
- **コメント**: 複雑なロジックには日本語コメント
- **型定義**: 自己文書化する型名を使用

## Data Model

### ER Diagram

```
users ─────────────────────────────────────────────────────────────
├── id (PK)
├── email
├── name
├── avatarUrl
├── timezone
└── createdAt

tasks ─────────────────────────────────────────────────────────────
├── id (PK)
├── userId (FK → users)
├── title
├── statusId (FK → statuses)
├── parentId (FK → tasks, nullable)    # 親タスク
├── path (materialized path)            # 階層パス
├── position                            # 同階層内順序
├── priority (1-10, nullable)
├── dueDate (nullable)
├── estimatedMinutes (nullable)
├── rrule (nullable)                    # 繰り返しルール
├── createdAt
└── updatedAt

tasks_archive ─────────────────────────────────────────────────────
├── (tasks と同一構造)
└── archivedAt

statuses ──────────────────────────────────────────────────────────
├── id (PK)
├── userId (FK → users)
├── name
├── position
├── isDefault
└── type (todo/in_progress/done/custom)

tags ──────────────────────────────────────────────────────────────
├── id (PK)
├── userId (FK → users)
├── name
└── color

task_tags ─────────────────────────────────────────────────────────
├── taskId (FK → tasks)
└── tagId (FK → tags)

daily_reports ─────────────────────────────────────────────────────
├── id (PK)
├── userId (FK → users)
├── date (unique per user)
├── notes (Markdown)
└── updatedAt

daily_report_tasks ────────────────────────────────────────────────
├── dailyReportId (FK → daily_reports)
├── taskId (FK → tasks)
├── section (yesterday/today)
└── position
```

### Indexes
- `tasks`: (userId, path), (userId, statusId), (userId, dueDate)
- `daily_reports`: (userId, date)
