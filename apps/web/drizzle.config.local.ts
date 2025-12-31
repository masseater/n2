import { defineConfig } from "drizzle-kit";

/**
 * ローカル開発用のDrizzle設定
 * better-sqlite3を使用したファイルベースのSQLite
 */
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./data/n2.db",
  },
});
