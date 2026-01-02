import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "../../db/schema";
import type { ServiceDatabase } from "../../db/types";

/**
 * 認証オプションの型
 */
type AuthEnvOptions = {
  googleClientId: string;
  googleClientSecret: string;
  secret: string;
};

/**
 * 認証設定を生成
 */
function createAuthOptions(envOptions: AuthEnvOptions) {
  return {
    secret: envOptions.secret,
    emailAndPassword: {
      enabled: false,
    },
    socialProviders: {
      google: {
        clientId: envOptions.googleClientId,
        clientSecret: envOptions.googleClientSecret,
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
}

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
 * Cloudflare Workers の env から認証情報を取得
 */
export function createAuth(db: ServiceDatabase, envOptions?: AuthEnvOptions) {
  const options = envOptions ?? {
    googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    secret: process.env.BETTER_AUTH_SECRET ?? "",
  };

  return betterAuth({
    database: drizzleAdapter(db, drizzleSchema),
    ...createAuthOptions(options),
  });
}

/**
 * better-auth の型
 */
export type Auth = ReturnType<typeof createAuth>;
