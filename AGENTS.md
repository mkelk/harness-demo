# harness-demo — agent instructions

A small task manager (Next.js 16, App Router, SQLite through `node:sqlite`) that exists to
show how a repository run with the **dmtix** delivery method is set up and structured.
Read `README.md` for the project and the method, `docs/current/` for how the app works.

## Standing rules

- **Never run on `main`.** Increments run on a dated base branch (`YYYY-MM-DD-increment-NN`);
  merging that branch to `main` is a human decision at the increment checkpoint.
- **Definition of done for any change:** typecheck, lint, unit, component and integration
  tests green in the worktree; e2e green post-merge; `docs/current/` updated in the same
  piece of work for anything a user or operator would need to know. Not "later".
- **Test-first.** Write the failing test, then make it pass. Every tick names its test
  cases and its test command; a tick without a test is not ready.
- **One env reader.** `process.env` is read only in `src/lib/env.ts`.
- **Database access only through `src/lib/db/`.** Tests use a temp-file database created
  per test (`createTestDb()` once it exists); never touch `data/dev.db` from a test.
- **Commit as `tick <id>: <summary>`** inside a run. Never touch `.tick/` from an
  implementer; the orchestrator owns tick state.
- **Prose rules for docs:** no em-dashes, exact values over narrative, tables for lists of
  values, fenced blocks for commands. See `docs/current/_documentation_principles.md`.

## Where things live

| Concern                               | Where                                                                                                                |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Method (how we work)                  | `.tick/config.md` (engine contract), `README.md` → "How dmtix is used here"; skills vendored under `.claude/skills/` |
| Live state of the work                | `tk roadmap`, `tk board`, `.devmeta/current-increment.md`                                                            |
| Narrative records                     | `.devmeta/increments/<id>/`, `.devmeta/project-history.md`                                                           |
| Operational gotchas for agents        | `.tick/learnings.md` (read in full, hard cap 150 lines)                                                              |
| Living docs (current truth)           | `docs/current/` (index: `docs/current/_overview.md`)                                                                 |
| Dated exploration and increment specs | `docs/thoughts/YYYY-MM-DD-slug.md`                                                                                   |

## Commands

```bash
pnpm dev              # http://localhost:3000
pnpm typecheck        # tsc --noEmit
pnpm lint             # eslint
pnpm test             # vitest: unit + component + integration + repo guards
pnpm test:e2e         # playwright against a throwaway SQLite db on port 3100
pnpm docs:check       # docs shape + diagram stamps (--strict at close-out, --stamp after rendering)
pnpm check            # typecheck, lint, test, docs:check, build
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
