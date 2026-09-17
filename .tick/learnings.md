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
