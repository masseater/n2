import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { D1DatabaseType, SqliteDatabaseType } from "../../db";
import * as schema from "../../db/schema";

/**
 * 認証設定の共通オプション
 */
const authOptions = {
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      timezone: {
        type: "string" as const,
        required: false,
        defaultValue: "Asia/Tokyo",
      },
    },
  },
};

const drizzleSchema = {
  provider: "sqlite" as const,
  schema: {
    user: schema.users,
    session: schema.sessions,
    account: schema.accounts,
    verification: schema.verifications,
  },
};

/**
 * Cloudflare D1 用の better-auth インスタンスを作成
 *
 * @param db - Drizzle D1 データベースインスタンス
 * @returns better-auth インスタンス
 *
 * 注意: このファイルはサーバーサイドでのみ使用される
 */
export function createAuth(db: D1DatabaseType) {
  return betterAuth({
    database: drizzleAdapter(db, drizzleSchema),
    ...authOptions,
  });
}

/**
 * ローカル開発用の better-auth インスタンスを作成
 *
 * @param db - Drizzle better-sqlite3 データベースインスタンス
 * @returns better-auth インスタンス
 */
export function createLocalAuth(db: SqliteDatabaseType) {
  return betterAuth({
    database: drizzleAdapter(db, drizzleSchema),
    ...authOptions,
  });
}

/**
 * better-auth の型
 */
export type Auth = ReturnType<typeof createAuth>;
