#!/usr/bin/env node
/**
 * ローカル開発用DB初期化スクリプト
 * デモユーザーとデフォルトステータスを作成
 */
import { eq } from "drizzle-orm";
import { createSqliteDatabase } from "../src/db";
import { users } from "../src/db/schema";
import { StatusService } from "../src/features/tasks/service/status-service";
import type { ServiceDatabase } from "../src/db/types";

const LOCAL_DEV_USER_ID = "local-dev-user";
const DB_PATH = process.env.LOCAL_DB_PATH ?? "./data/n2.db";

async function main() {
  console.log("Initializing local database...");
  console.log(`DB Path: ${DB_PATH}`);

  const rawDb = createSqliteDatabase(DB_PATH);
  const db = rawDb as ServiceDatabase;

  // デモユーザーが存在しなければ作成
  const existingUser = await db.select().from(users).where(eq(users.id, LOCAL_DEV_USER_ID));
  if (existingUser.length === 0) {
    await db.insert(users).values({
      id: LOCAL_DEV_USER_ID,
      name: "Local Dev User",
      email: "local@example.com",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("✓ Demo user created");
  } else {
    console.log("✓ Demo user already exists");
  }

  // デフォルトステータス初期化
  const statusService = new StatusService(db, LOCAL_DEV_USER_ID);
  await statusService.initializeDefaults();

  console.log("✓ Default statuses initialized");
  console.log("Done!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
