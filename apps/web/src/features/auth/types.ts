import type { User } from "@n2/shared";

/**
 * 認証済みセッション情報
 */
export type AuthSession = {
  user: User;
  session: {
    id: string;
    expiresAt: Date;
  };
};

/**
 * 認証状態
 */
export type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
};

/**
 * OAuth プロバイダー
 */
export type OAuthProvider = "google";
