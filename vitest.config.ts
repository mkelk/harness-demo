import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

// Tiers (see docs/current/testing.md):
//   unit          src/**/*.test.ts        pure functions, node environment
//   component     src/**/*.test.tsx       React components, jsdom environment
//   integration   src/**/*.integration.test.ts   real SQLite in a temp file (node)
//   guards        scripts/**/*.test.ts    the repo's own checks (docs shape, diagrams)
// e2e (Playwright) lives in e2e/ and is configured in playwright.config.ts.
const alias = { "@": path.resolve(__dirname, "src") };

export default defineConfig({
  plugins: [react()],
  resolve: { alias },
  test: {
    coverage: {
      provider: "v8",
      include: ["src/lib/**"],
      exclude: ["src/lib/**/*.test.*"],
      thresholds: { lines: 80, functions: 80, branches: 70, statements: 80 },
    },
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          include: ["src/**/*.test.ts", "scripts/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "jsdom",
          environment: "jsdom",
          include: ["src/**/*.test.tsx"],
          setupFiles: ["./vitest.setup.ts"],
        },
      },
    ],
  },
});
