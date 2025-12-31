# @n2/tsconfig

モノレポ共通の TypeScript 設定。

## 設定ファイル

- `base.json` - 基本設定（すべてのパッケージ向け）
- `react.json` - React アプリ向け（base.json を継承）

## 使用方法

```json
// tsconfig.json
{
  "extends": "@n2/tsconfig/react.json"
}
```

## 主要設定

- `target`: ES2022
- `moduleResolution`: bundler
- `strict`: true
- `noUncheckedIndexedAccess`: true
- `noUnusedLocals` / `noUnusedParameters`: true
