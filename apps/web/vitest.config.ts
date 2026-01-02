import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

/**
 * Vitest 専用設定
 * Cloudflare プラグインを除外して Node.js 環境でテストを実行
 */
export default defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    viteReact(),
  ],
  test: {
    environment: "node",
    globals: true,
    // テストファイルがない場合でもエラーにしない
    passWithNoTests: true,
  },
});
