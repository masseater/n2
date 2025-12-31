import { signIn } from "../auth-client";

type LoginButtonProps = {
  className?: string;
};

/**
 * Google OAuth ログインボタン
 *
 * クリック時に Google OAuth フローを開始
 * ログイン成功後はコールバック URL にリダイレクト
 */
export function LoginButton({ className }: LoginButtonProps) {
  const handleLogin = () => {
    signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  return (
    <button type="button" onClick={handleLogin} className={className}>
      Google でログイン
    </button>
  );
}
