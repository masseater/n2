import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "./use-auth";

/**
 * 認証を必須とするページで使用するフック
 * 未認証の場合はログインページにリダイレクト
 *
 * @param redirectTo - リダイレクト先（デフォルト: /login）
 *
 * 使用例:
 * ```tsx
 * function DashboardPage() {
 *   const { user, isLoading } = useRequireAuth();
 *
 *   if (isLoading) return <Loading />;
 *   return <Dashboard user={user} />;
 * }
 * ```
 */
export function useRequireAuth(redirectTo = "/login") {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: redirectTo });
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  return { user, isLoading, isAuthenticated };
}
