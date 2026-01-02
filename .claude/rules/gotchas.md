# Gotchas

プロジェクト全体で注意すべき事項。

## Cloudflare Workers 型定義

- `wrangler types` で生成される `worker-configuration.d.ts` を `tsconfig.json` の `include` に追加する必要がある
- `worker-configuration.d.ts` は自動生成ファイルなので `biome.json` の `overrides` で lint 対象外にする

## SVG アクセシビリティ

- Biome の `noSvgWithoutTitle` ルールに対応するため、SVG には `role="img"` と `aria-label` の両方を指定する

## TanStack Router 認証ガード

- `__root.tsx` の `component` で認証ガードを適用
- `PUBLIC_PATHS` 配列でパス単位で認証を除外
- `useRouterState` で現在のパスを取得して条件分岐

## Better Auth SSR 対応

- `createAuthClient` の `baseURL` は SSR 時に絶対 URL が必要
- 相対 URL `/api/auth` は SSR 時に `Invalid base URL` エラーになる
- 解決策: `typeof window === "undefined"` で分岐し、SSR 時は絶対 URL を使用
- CSR 時は `window.location.origin` から動的に生成

## TanStack Router ヘッダー制御

- 共通コンポーネントの条件付き表示は `shellComponent` ではなく `component` で行う
- `shellComponent` は HTML シェル全体、`component` はルートコンテンツを担当
- `HEADERLESS_PATHS` 配列でパス単位でヘッダーを非表示にできる
- `useRouterState` でパスを取得し、完全一致（`===`）で判定

## Vite + Cloudflare プラグイン環境

- ローカル開発時も Cloudflare Workers 環境としてエミュレートされる
- `better-sqlite3` などの Node.js ネイティブモジュールは使用不可（`__filename is not defined` エラー）
- ローカル DB 接続には D1 エミュレータを使用する（Wrangler が自動提供）
- ローカル開発用の secrets は `apps/web/.dev.vars` に設定する

## Tailwind ボタンスタイル

- カスタムスタイルを適用した `<button>` には `cursor-pointer` を明示的に指定する
- `bg-white/5` 等のカスタム背景でブラウザデフォルトのカーソルスタイルがリセットされる場合がある
- Biome/ESLint では CSS クラスの欠落は検出されない

## TanStack Start + Vitest テスト環境

TanStack Start + Cloudflare Workers + Vitest の組み合わせには複合的な制約がある:

1. **Server Functions の制約**: `'use server'` pragma と Vite プラグインが必要。Vitest で直接テストすると `Invariant failed` エラー
2. **Cloudflare プラグインの制約**: workerd 環境を強制し、CJS モジュール（`tiny-warning` 等）で `module is not defined` エラー
3. **公式サポートなし**: TanStack Start にテストの公式ドキュメントがない（2025年1月時点）

### 解決策

`vitest.config.ts` を別ファイルで作成し:
- Cloudflare プラグインを除外
- `createServerFn` をモックする setup ファイルを使用
- ビジネスロジックのみをテスト対象にする

参考: [TanStack/router Discussion #2701](https://github.com/TanStack/router/discussions/2701)
