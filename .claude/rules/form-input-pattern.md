# フォーム入力パターン

## 基本方針

フォーム入力は **ローカルステート + onBlur保存パターン** を使用する。

## 実装パターン

```typescript
const [value, setValue] = useState(initialValue);

// 外部propsの変更に追従
useEffect(() => {
  setValue(initialValue);
}, [initialValue]);

const handleBlur = () => {
  if (value !== initialValue) {
    onSave(value);
  }
};

<Input
  value={value}
  onChange={(e) => setValue(e.target.value)}
  onBlur={handleBlur}
/>
```

## 理由

- 入力中の毎キーストロークでAPIを叩かない
- フォーカスが外れた時点で差分があれば保存
- UXとパフォーマンスの両立

## 注意点

- 数値入力で「未設定」を許容する場合、空文字を許容し保存時に `null` 変換する
- 外部からのprops変更（別レコードへの切り替え等）に追従するため `useEffect` で同期する
