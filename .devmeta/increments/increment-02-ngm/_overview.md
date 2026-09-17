# Increment 02-ngm — Organise

**Status:** SHIPPED 2026-09-17 (merged to main)
**Engine:** synthesized ticks skill (user-level `~/.claude/skills/ticks/`, shared mode; not vendored)
**Spec:** `docs/thoughts/2026-09-17-increment-02-organise.md` (source of truth for every epic)
**Builds on:** increment 01-rxx (`../increment-01-rxx/completion.md`); its postmortem items are applied in the spec's first section.

## Goal

The user can give a task a due date and a priority, see what is overdue, put tasks into
lists, look at one list at a time, and narrow the list by state or by a search word.

## Produces

### On screen

- Due date and priority fields on both forms (shared `TaskFields`), priority badge, due
  date and "Overdue" mark in rows, open ordering by due then priority then newest.
- Filter bar: Open / Done / All and title search (`show`, `q` query params).
- Lists sidebar with counts and a New list form; `/lists/<id>` scoped page with Delete list;
  List select on both forms; list link on `/`.

### Under the hood

- Migrations 0002 (`due_on`, `priority`, index) and 0003 (`lists`, `tasks.list_id`, index).
- Domain: `parseDueOn`, `parsePriority`, `PRIORITY_LABELS`, `isOverdue`, `listTasks` filters
  and ordering; `src/lib/lists/` (types, `parseListName`, repository).
- App: `task-fields.tsx`, `filter-bar.tsx`, `lists-nav.tsx`, `lists/[id]/page.tsx`, `lists/actions.ts`.
- Docs: `how/scheduling.md`, `how/lists.md`, `data-model.md` updated, each diagrammed.

## Not included

| Deferred                                             | Why                                |
| ---------------------------------------------------- | ---------------------------------- |
| Today / upcoming views, recurrence, keyboard capture | increment 03                       |
| Renaming a list                                      | one more form for no new structure |
| Sorting controls                                     | ordering is fixed by rule          |
| Full-text search                                     | substring on the title suffices    |

## Roadmap (tk)

Project `2xs` — the checkpoint boundary; the run stops there for human review.

| Epic                                                                                                                       | tk id | Scope                                                                                       | Dep              |
| -------------------------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------- | ---------------- |
| Due dates and priority (DONE 2026-09-17, tag `02-ngm.due-dates-and-priority`, retro `ia-cycles/due-dates-and-priority.md`) | `9jr` | migration 0002, domain fields and ordering, TaskFields, badges, filter bar, scheduling docs |                  |
| Lists and filtering                                                                                                        | `isl` | migration 0003, lists domain, sidebar, list pages, list select, lists docs                  | blocked by `9jr` |

## Definitions of done

### Due dates and priority

Spec → "Definitions of done → Epic 1" (also the epic's `--acceptance`).

### Lists and filtering

Spec → "Definitions of done → Epic 2" (also the epic's `--acceptance`).

## Exit criteria (verification gates)

- [ ] A1 `pnpm check` green on the base branch
- [ ] A2 `pnpm test:e2e` green (tasks, scheduling, lists spec files)
- [ ] A3 `pnpm docs:check --strict` green
- [ ] A4 `pnpm test:coverage` meets the floor
- [ ] `completion.md` written; human smoke test; merge to `main` is the human's act

## How to run

`/dmtix go` on branch `2026-09-17-increment-02`. Resume: `/dmtix go` again.
