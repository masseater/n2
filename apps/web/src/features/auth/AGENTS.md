# auth feature

Google OAuth 2.0 によるユーザー認証を担当。

better-auth ライブラリを使用し、サーバー側でのセッション管理とクライアント側での認証状態取得を提供する。

認証フロー:
1. ログインボタンクリック → Google OAuth 認証画面へリダイレクト
2. 認証成功 → better-auth がセッション作成
3. React hooks で認証状態・ユーザー情報を取得
4. 認証必須ページの保護
