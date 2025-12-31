import { signOut } from "../auth-client";

type LogoutButtonProps = {
  className?: string;
};

/**
 * ログアウトボタン
 *
 * クリック時にセッションを終了し、ログインページにリダイレクト
 */
export function LogoutButton({ className }: LogoutButtonProps) {
  const handleLogout = () => {
    signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/login";
        },
      },
    });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={className}
    >
      ログアウト
    </button>
  );
}
