import { defineConfig, devices } from "@playwright/test";

// e2e tier: drives the real Next.js app against a throwaway SQLite database.
// The DB path is set per run so e2e never touches data/dev.db.
const port = Number(process.env.PORT ?? 3100);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm exec next dev --port ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    env: { DATABASE_PATH: process.env.DATABASE_PATH ?? "data/e2e.db" },
    timeout: 120_000,
  },
});
