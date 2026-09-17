# Setup

Tier 2. Installing, running, testing and resetting harness-demo on a development
machine. No external services are needed.

## Prerequisites

| Tool                    | Version                                              | Why                                                                                  |
| ----------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Node.js                 | 24 or newer (26 on the dev machines)                 | `node:sqlite` is built in from 22.13; the scripts use `readdirSync` with `recursive` |
| pnpm                    | 10 or newer                                          | package manager (`packageManager` in `package.json` pins the exact version)          |
| Chromium for Playwright | installed by `pnpm exec playwright install chromium` | the e2e tier                                                                         |
| `tk`                    | 0.29 or newer                                        | only if you run the dmtix method, not to run the app                                 |

## Install and run

```bash
git clone git@github.com:mkelk/harness-demo.git
cd harness-demo
pnpm install
pnpm dev            # http://localhost:3000
```

The database file and its parent directory are created on first use at `DATABASE_PATH`
(default `data/dev.db`, gitignored). Pending migrations (`MIGRATIONS` in
`src/lib/db/migrate.ts`, recorded in the `schema_migrations` table) run automatically
when the app opens the database; see `how/persistence.md`.

## Test

```bash
pnpm typecheck      # tsc --noEmit
pnpm lint           # eslint
pnpm test           # vitest: unit + component + integration + repo guards
pnpm test:e2e       # playwright; starts its own dev server on 3100 against a fresh data/e2e-<timestamp>.db
pnpm docs:check     # documentation shape and diagram stamps
pnpm check          # everything above except e2e, then `next build`
```

See `testing.md` for what each tier covers.

## Reset the database

```bash
rm -f data/dev.db data/dev.db-wal data/dev.db-shm data/e2e-*.db*
```

The next `pnpm dev` recreates `data/dev.db` and applies every migration. `pnpm test:e2e`
creates a new `data/e2e-<timestamp>.db` on every run (`playwright.config.ts`), so the
second pattern only clears files left by earlier runs.

## Environment variables

| Variable        | Default       | Meaning                                                      |
| --------------- | ------------- | ------------------------------------------------------------ |
| `DATABASE_PATH` | `data/dev.db` | path of the SQLite file; read only in `src/lib/env.ts`       |
| `PORT`          | `3100`        | port the Playwright web server uses (`playwright.config.ts`) |
