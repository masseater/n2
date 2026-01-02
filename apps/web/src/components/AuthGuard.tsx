/**
 * 認証ガードコンポーネント
 * 未ログイン時は /login にリダイレクト
 * CSR のみで動作（SSR 時は children をそのまま表示）
 */
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSession } from "@/features/auth/auth-client";

type AuthGuardProps = {
  children: React.ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isPending && !session?.user) {
      navigate({ to: "/login" });
    }
  }, [isMounted, isPending, session, navigate]);

  // SSR 時はローディング表示
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">読み込み中...</div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">読み込み中...</div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return <>{children}</>;
}
