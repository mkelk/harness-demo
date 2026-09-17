# Testing

Tier 2. The test tiers, how to run each, and where each runs during a dmtix run.
The rules behind them are `standards/testing-strategy.md`.

## Tiers

| Tier        | Files                          | Runner, environment                               | Command                 | Runs where in a dmtix run     |
| ----------- | ------------------------------ | ------------------------------------------------- | ----------------------- | ----------------------------- |
| unit        | `src/**/*.test.ts`             | Vitest, node                                      | `pnpm test:unit`        | in-worktree, per tick         |
| component   | `src/**/*.test.tsx`            | Vitest, jsdom, Testing Library                    | `pnpm test:component`   | in-worktree, per tick         |
| integration | `src/**/*.integration.test.ts` | Vitest, node, a temp-file SQLite per test         | `pnpm test:integration` | in-worktree, per tick         |
| guards      | `scripts/**/*.test.ts`         | Vitest, node                                      | part of `pnpm test`     | in-worktree, per tick         |
| e2e         | `e2e/*.spec.ts`                | Playwright, Chromium, own `next dev` on port 3100 | `pnpm test:e2e`         | post-merge, orchestrator only |

`pnpm test` runs the four Vitest tiers together (they are Vitest projects `node` and
`jsdom` in `vitest.config.ts`). Coverage is measured on `src/lib/**` with
`pnpm test:coverage` and fails under 80% lines and functions or 70% branches.

## Why e2e is post-merge

Playwright starts a real `next dev` on a fixed port and writes a real database file.
Two worktrees running it at once would fight over port 3100. The engine's execution
profile (`.tick/profile.md`) therefore routes e2e post-merge: implementers do not run it;
the orchestrator runs it on the integrated tree before a wave closes.

## Writing a test

- Unit and component tests sit next to the code they test (`src/lib/tasks/validate.test.ts`
  beside `src/lib/tasks/validate.ts`).
- Integration tests open a fresh database with `createTestDb()` from `src/lib/db/`: a
  temp file per test, migrated, removed by `close()`. Never `data/dev.db`.
- E2E tests use `page.getByRole`, `getByLabel` and visible text, not CSS selectors.
  Each spec file is one serial flow (`test.describe.configure({ mode: "serial" })`)
  on a fresh per-run database (`data/e2e-<timestamp>.db`): later tests build on rows
  earlier tests created, so `playwright.config.ts` sets `retries: 0` (a retry cannot
  start from a fresh database, and would repeat later steps against rows earlier steps
  already changed). Files run alphabetically; only `e2e/tasks.spec.ts` may assume an
  empty database, so every other file (`e2e/scheduling.spec.ts`) creates rows with its
  own title prefix and deletes them in its last test.
- The repo guards (`scripts/check-docs.test.ts`) test the checker against temp
  directories, never against the real `docs/current/`; `scripts/check-rules.test.ts`
  walks the real `src/` for `process.env` outside `src/lib/env.ts` and `node:sqlite`
  outside `src/lib/db/`.

## Failure modes

| Symptom                                                 | Fix                                                                        |
| ------------------------------------------------------- | -------------------------------------------------------------------------- |
| `pnpm test:e2e` fails with `EADDRINUSE` on 3100         | another Playwright run or dev server holds the port; stop it or set `PORT` |
| Playwright cannot find Chromium                         | `pnpm exec playwright install chromium`                                    |
| Coverage threshold fails after adding code to `src/lib` | add the missing tests; do not lower the threshold in a tick                |
