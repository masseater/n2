# ルーティング規約

## TanStack Router ファイル命名

動的パラメータを含むルートは、ドット区切りではなくディレクトリ構造を使用する。

NG:
```
routes/daily.$date.tsx
routes/tasks.$taskId.tsx
```

OK:
```
routes/daily/
  index.tsx       # /daily
  $date.tsx       # /daily/:date
routes/tasks/
  index.tsx       # /tasks
  $taskId.tsx     # /tasks/:taskId
```

## 理由

- ディレクトリ構造の方が関連ファイルをまとめやすい
- レイアウトファイルを追加しやすい
- IDE のファイルツリーで視認性が高い
