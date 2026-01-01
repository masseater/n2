import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "../../db/schema";
import type { ServiceDatabase } from "../../db/types";

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
 * better-auth インスタンスを作成
 */
export function createAuth(db: ServiceDatabase) {
  return betterAuth({
    database: drizzleAdapter(db, drizzleSchema),
    ...authOptions,
  });
}

/**
 * better-auth の型
 */
export type Auth = ReturnType<typeof createAuth>;
