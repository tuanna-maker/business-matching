import { defineConfig, devices } from "@playwright/test";
import path from "path";

const WEB_BASE =
  process.env.PLAYWRIGHT_WEB_BASE_URL || "http://localhost:3001";
const API_BASE =
  process.env.PLAYWRIGHT_API_BASE_URL || "http://localhost:3000/api";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 120_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: WEB_BASE,
    navigationTimeout: 60_000,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  globalSetup: path.join(__dirname, "e2e/global-setup.ts"),
});
