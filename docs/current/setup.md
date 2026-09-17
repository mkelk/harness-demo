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

The database file is created on first use at `DATABASE_PATH` (default `data/dev.db`,
gitignored). Migrations run automatically when the app opens the database.

## Test

```bash
pnpm typecheck      # tsc --noEmit
pnpm lint           # eslint
pnpm test           # vitest: unit + component + integration + repo guards
pnpm test:e2e       # playwright; starts its own dev server on 3100 against data/e2e.db
pnpm docs:check     # documentation shape and diagram stamps
pnpm check          # everything above except e2e, then `next build`
```

See `testing.md` for what each tier covers.

## Reset the database

```bash
rm -f data/dev.db data/e2e.db
```

The next `pnpm dev` or `pnpm test:e2e` recreates the file and applies every migration.

## Environment variables

| Variable        | Default       | Meaning                                                      |
| --------------- | ------------- | ------------------------------------------------------------ |
| `DATABASE_PATH` | `data/dev.db` | path of the SQLite file; read only in `src/lib/env.ts`       |
| `PORT`          | `3100`        | port the Playwright web server uses (`playwright.config.ts`) |
