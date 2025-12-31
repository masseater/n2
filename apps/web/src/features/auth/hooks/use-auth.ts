import { useSession } from "../auth-client";
import type { AuthState } from "../types";

/**
 * 認証状態を取得するカスタムフック
 *
 * @returns 認証状態（isAuthenticated, isLoading, user）
 *
 * 使用例:
 * ```tsx
 * const { isAuthenticated, isLoading, user } = useAuth();
 *
 * if (isLoading) return <Loading />;
 * if (!isAuthenticated) return <LoginPage />;
 * return <Dashboard user={user} />;
 * ```
 */
export function useAuth(): AuthState {
  const { data: session, isPending } = useSession();

  return {
    isAuthenticated: !!session?.user,
    isLoading: isPending,
    user: session?.user
      ? {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          emailVerified: session.user.emailVerified,
          image: session.user.image ?? null,
          timezone: (session.user as { timezone?: string }).timezone ?? null,
          createdAt: new Date(session.user.createdAt),
          updatedAt: new Date(session.user.updatedAt),
        }
      : null,
  };
}
