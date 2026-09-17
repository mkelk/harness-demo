# Increment 01-rxx — Task basics

**Status:** IN PROGRESS (epic 1 DONE 2026-09-17, epic 2 next) · **Target:** 2026-09-18
**Engine:** synthesized ticks skill (user-level `~/.claude/skills/ticks/`, shared mode; not vendored)
**Spec:** `docs/thoughts/2026-09-17-increment-01-task-basics.md` (source of truth for every epic)

## Goal

The user keeps a persistent list of tasks in the browser: add one, see the open ones,
tick one off, reopen it, edit its title and notes, delete it. Restarting the server
changes nothing.

## Produces

### On screen

- `/`: add form (title, notes), open tasks newest first with done checkbox, edit link and
  delete button; Done section with reopen; counts in headings; empty state.
- `/tasks/<id>/edit`: prefilled edit form, Save redirects to `/`, Cancel, validation
  errors, 404 for an unknown id.
- Validation: title 1 to 200 chars trimmed, notes up to 2000; messages per the spec.

### Under the hood

- `src/lib/db/`: `openDatabase` (node:sqlite, WAL, migrations on open), `applyMigrations`
  with `schema_migrations`, migration 0001 (`tasks`), `getDb` singleton, `createTestDb`.
- `src/lib/tasks/`: `Task`/`TaskInput` types, `parseTaskInput`, repository functions
  taking the db handle first.
- `src/app/`: server actions, client form components, edit route.
- `scripts/check-rules.test.ts`: env and sqlite import boundaries.
- Docs: `how/persistence.md`, `data-model.md`, `how/tasks.md`, each with a diagram.

## Not included

| Deferred                           | Why                                                    |
| ---------------------------------- | ------------------------------------------------------ |
| Due dates, priority, lists, search | increment 02                                           |
| Drag ordering                      | needs a position column and a client interaction model |
| Undo after delete                  | UX nicety, no new structure                            |
| Pagination                         | not needed at demo scale                               |

## Roadmap (tk)

Project `m2h` — the checkpoint boundary; the run stops there for human review.

| Epic                                                                                                                       | tk id | Scope                                                                                         | Dep              |
| -------------------------------------------------------------------------------------------------------------------------- | ----- | --------------------------------------------------------------------------------------------- | ---------------- |
| Persistence foundation (DONE 2026-09-17, tag `01-rxx.persistence-foundation`, retro `ia-cycles/persistence-foundation.md`) | `azj` | db open/migrate/test db, tasks table, domain layer, guard test, persistence + data-model docs |                  |
| Task list                                                                                                                  | `5qb` | list and edit pages, server actions, components, e2e, tasks doc                               | blocked by `azj` |

## Definitions of done

### Persistence foundation

See the spec → "Definitions of done → Epic 1" (also stored as the epic's `--acceptance`).
In short: A1 and A4 green; integration tests for open/migrate/test-db and for every
repository function per the listed cases; validation unit tests per the table; the guard
test; `how/persistence.md` and `data-model.md` listed and rendered (A3).

### Task list

See the spec → "Definitions of done → Epic 2". In short: A1, A2, A4 green;
`e2e/tasks.spec.ts` covering the nine listed user paths; `how/tasks.md` with the
`task-flow` diagram listed and rendered (A3); guard test still passing.

## Exit criteria (verification gates)

- [ ] A1 `pnpm check` green on the base branch
- [ ] A2 `pnpm test:e2e` green on the base branch
- [ ] A3 `pnpm docs:check --strict` green
- [ ] A4 `pnpm test:coverage` meets the floor on `src/lib/**`
- [ ] `completion.md` written; human smoke test; merge to `main` is the human's act

## How to run

`/dmtix go` on branch `2026-09-17-increment-01` (no services needed beyond Node, pnpm
and Playwright's Chromium). Resume: `/dmtix go` again.
