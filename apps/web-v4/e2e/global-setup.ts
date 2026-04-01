import { execSync } from "child_process";
import path from "path";

/**
 * Đảm bảo 3 tác nhân E2E có trong DB (startup / investor / admin).
 * Bỏ qua: E2E_SKIP_DB_SEED=1
 */
export default async function globalSetup() {
  if (process.env.E2E_SKIP_DB_SEED === "1") {
    console.log("[e2e] Skipping DB seed (E2E_SKIP_DB_SEED=1)");
    return;
  }

  const root = path.resolve(__dirname, "../..", "..");
  console.log("[e2e] Running db:seed:e2e-actors from monorepo root:", root);
  execSync("pnpm --filter api db:seed:e2e-actors", {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
}
