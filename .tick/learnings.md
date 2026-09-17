# Learnings (read in full each run; hard cap 150 lines; Problem → Cause → Rule)

## Persistence and node:sqlite

**Problem:** The rules guard fails on a type-only `import type { DatabaseSync } from "node:sqlite"` outside `src/lib/db/`.
**Cause:** `scripts/check-rules.test.ts` matches the module string, not the import kind.
**Rule:** Import the handle type from the barrel: `import type { DatabaseSync } from "@/lib/db"`. Never reach through `TestDb["db"]`.

**Problem:** `prepare().all()` / `.get()` results do not type as your row shape; `.get()` is `undefined` for no row.
**Cause:** node:sqlite returns loosely typed row objects.
**Rule:** Cast rows at one place (`row as TaskRow`) and map to the domain type in a single `toRow`-style helper; treat `undefined` as "not found".

**Problem:** A migration's SQL failure can leave SQLite with the transaction already aborted, so an unconditional `ROLLBACK` throws and masks the real error.
**Cause:** Some SQLite errors auto-rollback.
**Rule:** `if (db.isTransaction) db.exec("ROLLBACK")` (Node 26 exposes `isTransaction`). Migration SQL must not contain its own BEGIN/COMMIT.

## Tests

**Problem:** Ordering and "bumps updated_at" tests passed even when the behaviour would be wrong.
**Cause:** Rows created in the same millisecond share timestamps; ordering by id gives the same answer as ordering by time.
**Rule:** Any test about timestamp ordering or bumping uses `vi.useFakeTimers()` + `vi.setSystemTime()` and advances the clock between writes, then asserts a strict relation. Restore real timers in `afterEach`.

**Problem:** `pnpm lint` warned about `coverage/` after a coverage run.
**Cause:** Generated files were not in eslint's ignores.
**Rule:** Anything a script generates into the tree (`coverage/`, `.next/`, `playwright-report/`) is listed in `eslint.config.mjs` ignores and `.gitignore` in the same tick that introduces the generator.

## Docs

**Problem:** Prettier rewrites Markdown tables (column padding) in pages you touch.
**Cause:** `pnpm exec prettier --write` covers `docs/`.
**Rule:** Harmless; do not hand-align tables, and do not try to revert the padding. Mermaid blocks are untouched, so stamps stay valid.

**Problem:** A prose line in `testing.md` pointed at a file that never existed (`src/lib/tasks.test.ts`).
**Cause:** The docs guard validates paths only in `## Key entry points` tables.
**Rule:** When a tick creates or moves files, grep `docs/current` for the old and new paths, not just the how-page you are editing.

## E2E and Next.js

**Problem:** `page.getByRole("alert")` failed in strict mode: two elements matched.
**Cause:** Next.js renders `#__next-route-announcer__` with `role="alert"` on every page.
**Rule:** Scope alert lookups: `page.getByRole("alert").filter({ hasText: "<message>" })` or `getByText`.

**Problem:** A retry of the serial e2e flow cannot pass: the first test expects an empty database.
**Cause:** Playwright reruns a serial group from its first test but keeps the web server and its per-run `DATABASE_PATH`.
**Rule:** Serial e2e flows run with `retries: 0`; a flaky serial test is fixed, not retried.

**Problem:** React Testing Library left the previous test's DOM in place, so a second component test read stale markup.
**Cause:** Auto-cleanup needs Vitest globals, which are off.
**Rule:** `vitest.setup.ts` calls `afterEach(cleanup)`; do not add `globals: true` just for this.

**Problem:** Three private copies of the same id-parsing rule appeared across two action files and a page.
**Cause:** Each chain tick added what it needed locally.
**Rule:** Any parsing of user input, including ids from hidden fields, lives in `src/lib/tasks/validate.ts` with unit tests; server actions only import it.

## Filters and query parameters

**Problem:** A search for `100%` matched every task.
**Cause:** `LIKE` treats `%` and `_` as wildcards; the search term was bound unescaped.
**Rule:** User text reaching `LIKE` goes through `escapeLike()` in the repository and the query carries `ESCAPE '\'`. Test with a title containing `%` and one containing `_`.

**Problem:** `getByLabel("Due")` in Playwright matched the "Delete: …" buttons.
**Cause:** Label lookup is a substring match by default.
**Rule:** Use `getByLabel(name, { exact: true })` whenever another accessible name contains the word.

**Problem:** A failing mid-flow serial e2e test left rows behind and broke the next spec file.
**Cause:** Cleanup lived in the last test of the serial group, which Playwright skips after a failure.
**Rule:** Per-file cleanup goes in `test.afterAll` with its own page; spec files never assume another file's state.
