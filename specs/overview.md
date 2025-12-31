# N2 (NippoNikki) - Product Specification

## 1. Overview

**N2** は日報粒度とタスク粒度を切り替え可能な個人向けタスク管理ツール。

### 1.1 Target Users
- 個人開発者・フリーランサー
- 自己管理目的のユーザー
- シンプルなUI、チーム機能不要

### 1.2 Core Concept
**ビュー切り替え型**: 同一データを日報ビュー/タスクビュー（リスト/カンバン）で表示

---

## 2. Functional Requirements

### 2.1 Task Management

#### 2.1.1 Task Structure
- **無限階層** (Workflowy的ネスト)
- ルートレベルのタスク = プロジェクト
- materialized path でデータ管理

#### 2.1.2 Task Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | ✓ | 一意識別子 |
| title | string | ✓ | タスク名 |
| status | enum | ✓ | ステータス (カスタム可能) |
| parentId | UUID | - | 親タスクID (null=ルート/プロジェクト) |
| path | string | ✓ | materialized path |
| position | number | ✓ | 同階層内の順序 |
| priority | number(1-10) | - | 優先度 |
| dueDate | datetime | - | 締切日時 (任意) |
| estimatedMinutes | number | - | 見積時間 (分) |
| rrule | string | - | 繰り返しルール (RFC 5545) |
| createdAt | datetime | ✓ | 作成日時 |
| updatedAt | datetime | ✓ | 更新日時 |

#### 2.1.3 Status Management
- **デフォルト3状態**: TODO, In Progress, Done
- **ユーザー拡張可能**: カスタムステータス追加
- ステータスは別テーブルで管理

#### 2.1.4 Tags
- 多対多関係 (task_tags中間テーブル)
- フリー入力 + マスタ管理
- オートコンプリートUI

#### 2.1.5 Recurring Tasks
- **RRULE形式** (RFC 5545 / iCalendar互換)
- `rrule` ライブラリで実装
- 次回発生日の自動計算

### 2.2 Daily Report (日報)

#### 2.2.1 Structure
```
日報 = {
  date: YYYY-MM-DD,
  yesterday: [タスク進捗の自動取得 + 編集可能],
  today: [未完了タスクの自動表示 + 選択追加 + 新規作成],
  notes: Markdown形式の自由記述欄
}
```

#### 2.2.2 Yesterday Section
- 前日に完了/進捗があったタスクを **自動取得**
- ユーザーが **編集・追加可能**

#### 2.2.3 Today Section
- 以下を **自動表示**:
  - 前日から継続中 (in_progress) のタスク
  - 締切が今日以前の未完了タスク
- 既存タスクの **選択追加** 可能
- 日報UIから **新規タスク作成** 可能

#### 2.2.4 Notes
- **Markdown形式**
- react-markdown + DOMPurify でXSS対策
- プレビュー機能

### 2.3 Views

#### 2.3.1 List View
- インデント付き階層表示 (Workflowy/Todoist風)
- ドラッグ&ドロップで並べ替え・階層変更
- @dnd-kit ライブラリ使用

#### 2.3.2 Board View (Kanban)
- ステータス別カラム表示 (Trello/Linear風)
- ドラッグ&ドロップでステータス変更
- 階層は折りたたみで表現

#### 2.3.3 Daily Report View
- 1日単位
- 昨日/今日/メモのセクション

### 2.4 Search & Filter

#### 2.4.1 Search
- キーワード検索 (タイトル)
- インクリメンタルサーチ

#### 2.4.2 Filters
- ステータス
- タグ
- 優先度範囲
- 日付範囲 (締切)
- プロジェクト (ルートタスク)

### 2.5 Archive & Delete

- **アーカイブ**: tasks_archive テーブルに移動
- **復元可能**: アーカイブから復元
- **完全削除**: アーカイブから削除 (定期クリーンアップ)

---

## 3. Non-Functional Requirements

### 3.1 Priority
**拡張性重視** - 将来の機能追加を見据えたアーキテクチャ

### 3.2 Performance
- フルPWA対応
- Service Worker でオフライン動作
- バンドルサイズ最適化

### 3.3 PWA & Offline

#### 3.3.1 Sync Strategy
- **Last-Write-Wins** (シンプル)
- `updatedAt` タイムスタンプで判定
- コンフリクト時は新しい方を採用

#### 3.3.2 Offline Capabilities
- IndexedDB でローカルデータ保持
- オンライン復帰時に同期
- Workbox で Service Worker 管理

### 3.4 Accessibility
- キーボードショートカット
  - `n`: 新規タスク
  - `/`: 検索
  - `Esc`: 閉じる
- 基本的なARIAラベル

---

## 4. UI/UX

### 4.1 Layout
**レスポンシブ**:
- モバイル (< 768px): ボトムナビ + ページ切り替え
- デスクトップ (>= 768px): サイドバー + メインエリア

### 4.2 Theme
- ライト/ダーク切り替え
- システム設定追従 (デフォルト)
- shadcn/ui のテーマシステム使用

### 4.3 Components
- shadcn/ui ベース
- Tailwind CSS v4

---

## 5. Authentication

### 5.1 Method
- **better-auth** + **Google OAuth 2.0**
- 将来的に複数プロバイダー対応可能な設計

### 5.2 Session
- better-auth のセッション管理
- JWT or セッショントークン

---

## 6. Data Model

### 6.1 ER Diagram (Simplified)

```
users
├── id (PK)
├── email
├── name
├── avatarUrl
├── timezone
└── createdAt

tasks
├── id (PK)
├── userId (FK → users)
├── title
├── statusId (FK → statuses)
├── parentId (FK → tasks, nullable)
├── path (materialized path)
├── position
├── priority
├── dueDate (nullable)
├── estimatedMinutes (nullable)
├── rrule (nullable)
├── createdAt
└── updatedAt

tasks_archive
├── (same as tasks)
└── archivedAt

statuses
├── id (PK)
├── userId (FK → users)
├── name
├── position
├── isDefault
└── type (todo/in_progress/done/custom)

tags
├── id (PK)
├── userId (FK → users)
├── name
└── color

task_tags
├── taskId (FK → tasks)
└── tagId (FK → tags)

daily_reports
├── id (PK)
├── userId (FK → users)
├── date (unique per user)
├── notes (Markdown)
└── updatedAt

daily_report_tasks
├── dailyReportId (FK → daily_reports)
├── taskId (FK → tasks)
├── section (yesterday/today)
└── position
```

### 6.2 Indexes
- tasks: (userId, path), (userId, statusId), (userId, dueDate)
- daily_reports: (userId, date)

---

## 7. Tech Stack

| Layer | Technology |
|-------|------------|
| Monorepo | Turborepo + pnpm |
| Framework | TanStack Start |
| Routing | TanStack Router (file-based) |
| State | TanStack Query + TanStack Store |
| Form | TanStack Form + Zod |
| UI | shadcn/ui + Tailwind CSS v4 |
| D&D | @dnd-kit |
| Markdown | react-markdown + DOMPurify |
| RRULE | rrule |
| Auth | better-auth (Google OAuth) |
| DI | awilix |
| DB | Cloudflare D1 (SQLite via Drizzle ORM) |
| Storage | Cloudflare R2 |
| Deploy | Cloudflare Workers |
| PWA | Workbox |
| Lint/Format | Biome |
| Test | Vitest |

---

## 8. MVP Scope

MVP には以下の全機能を含める:

### 8.1 Core Features
- [x] タスクCRUD (無限階層)
- [x] ステータス管理 (カスタム可能)
- [x] タグ管理
- [x] 優先度 (1-10)
- [x] 締切 (日時、任意)
- [x] 繰り返し (RRULE)

### 8.2 Views
- [x] リストビュー (D&D対応)
- [x] カンバンボード
- [x] 日報ビュー

### 8.3 Search & Filter
- [x] キーワード検索
- [x] 高度なフィルタ (ステータス/タグ/優先度/日付)

### 8.4 PWA
- [x] オフライン編集
- [x] Last-Write-Wins 同期

### 8.5 UI
- [x] レスポンシブレイアウト
- [x] ダーク/ライトテーマ
- [x] 基本キーボードショートカット

### 8.6 Auth
- [x] Google OAuth

### 8.7 Post-MVP (Phase 2)
- [ ] データエクスポート (JSON/Markdown)
- [ ] 通知・リマインダー
- [ ] タイムトラッキング
- [ ] 複数OAuth (GitHub等)

---

## 9. Development Phases

### Phase 1: Foundation
1. プロジェクト構造整理
2. DB スキーマ設計・マイグレーション
3. 認証 (better-auth + Google OAuth)
4. 基本API (tasks CRUD)

### Phase 2: Core Features
5. タスク階層・D&D
6. ステータス・タグ管理
7. 繰り返し (RRULE)

### Phase 3: Views
8. リストビュー
9. カンバンボード
10. 日報ビュー

### Phase 4: PWA & Polish
11. Service Worker・オフライン対応
12. 検索・フィルタ
13. テーマ・キーボードショートカット

### Phase 5: Testing & Deploy
14. E2Eテスト
15. パフォーマンス最適化
16. Cloudflare Workers デプロイ

---

## 10. Decisions Log

| # | Item | Decision | Rationale |
|---|------|----------|-----------|
| 1 | Target User | 個人開発者・フリーランサー | シンプルUI優先、チーム機能不要 |
| 2 | Core Concept | ビュー切り替え型 | 同一データを複数ビューで表示 |
| 3 | Task Status | シンプル + ユーザー拡張 | 柔軟性と簡潔さの両立 |
| 4 | Task Hierarchy | 無限階層 | Workflowy的な柔軟性 |
| 5 | Daily Report | タスク + 自由記述 (Markdown) | バランス良い形式 |
| 6 | Auth | Google OAuth (拡張可能) | シンプルスタート |
| 7 | PWA | フルPWA | オフライン編集可能 |
| 8 | Sync Strategy | Last-Write-Wins | シンプル実装優先 |
| 9 | UI Layout | レスポンシブ | PC/モバイル両対応 |
| 10 | Task View | ハイブリッド (リスト + ボード) | ビュー切り替えコンセプト |
| 11 | Due Date | 日時 (任意) | 柔軟な締切設定 |
| 12 | Priority | 数値 1-10 | 細かい優先度設定 |
| 13 | Tags | フリー入力 + マスタ | オートコンプリート |
| 14 | Delete | アーカイブテーブル移動 | 履歴保持 + 軽量化 |
| 15 | Project | ルートタスク = プロジェクト | 統一データモデル |
| 16 | Recurring | RRULE (RFC 5545) | iCalendar互換 |
| 17 | App Name | N2 | シンプルで覚えやすい |
| 18 | NFR | 拡張性重視 | 将来の機能追加対応 |
| 19 | MVP Scope | 全機能含める | フル機能でリリース |
