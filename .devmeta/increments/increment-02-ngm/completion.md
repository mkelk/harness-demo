# Increment 02-ngm — Organise: completion report

**Reached checkpoint:** 2026-09-17 · **Base branch:** `2026-09-17-increment-02` · **Project tick:** `2xs` (open, awaiting human)
**Tags:** `02-ngm.due-dates-and-priority`, `02-ngm.lists-and-filtering`

## Features delivered

| Feature                                                                                 | Where                                                                                                   | Proven by                                                                              |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Due date and priority on every task, shared form fields                                 | migration 0002, `src/lib/tasks/`, `components/task-fields.tsx`                                          | `validate.test.ts`, `repository.integration.test.ts`, `task-fields.test.tsx`           |
| Open list ordered by due date, priority, age; badges and Overdue mark                   | `repository.ts` (`listTasks`, `isOverdue`), `task-list.tsx`                                             | `repository.integration.test.ts`, `task-list.test.tsx`, `e2e/scheduling.spec.ts`       |
| Filter bar: Open / Done / All and title search, on both pages                           | `components/filter-bar.tsx`, `parseFilterQuery`                                                         | `filter-bar.test.tsx`, `e2e/scheduling.spec.ts`                                        |
| Lists: sidebar with counts, create, delete (tasks kept), scoped `/lists/<id>` page, 404 | migration 0003, `src/lib/lists/`, `components/lists-nav.tsx`, `lists/[id]/page.tsx`, `lists/actions.ts` | `lists/*.test.ts`, `lists-nav.test.tsx`, `new-list-form.test.tsx`, `e2e/lists.spec.ts` |
| List select on both forms; list link in rows on `/`                                     | `task-fields.tsx`, `task-list.tsx`                                                                      | `task-fields.test.tsx`, `task-list.test.tsx`, `e2e/lists.spec.ts`                      |
| One page body for both routes; one revalidation helper for every write                  | `components/task-page.tsx`, `src/app/revalidate.ts`                                                     | review `wej`, e2e                                                                      |
| Living docs: scheduling, lists, data model re-drawn, task flow re-drawn                 | `docs/current/`                                                                                         | `pnpm docs:check --strict`                                                             |

## Gate status on the base branch (run at checkpoint)

| Gate                                                                   | Result                                                        |
| ---------------------------------------------------------------------- | ------------------------------------------------------------- |
| A1 `pnpm check` (typecheck, lint, 165 Vitest tests, docs check, build) | green                                                         |
| A2 `pnpm test:e2e`                                                     | green, 21 passed (lists, scheduling, smoke, tasks)            |
| A3 `pnpm docs:check --strict`                                          | green, 6 diagrams stamped                                     |
| A4 `pnpm test:coverage` on `src/lib/**`                                | 96.5 lines / 94.7 branches / 97.1 functions / 96.8 statements |

## Outstanding human items

1. Smoke-test in a browser: create a list, add a task with a due date in the past and High
   priority, see it first and marked Overdue, filter, search, delete the list.
2. Decide on shipping: merge `2026-09-17-increment-02` into `main` (`git merge --no-ff`), close
   the project tick (`tk close 2xs --reason "Shipped: ..."`).
3. `rm -f data/e2e-*.db*` to clear per-run e2e databases.

## Postmortems

- **Specs must state default views, not only filters.** The repository's `show` default
  ("open") and the page's default view (both sections) differed; the spec did not say which
  wins on `/`, so the wave-1 implementer flagged it and the chain decided and documented it.
  Increment 03's spec should state the default rendering of every page explicitly.
- **The review keeps finding "consistency" defects, not behaviour defects.** Both epics'
  should-fixes were of the form "path A does X, path B does not" (revalidation, LIKE escaping in
  one query, inventory rows). A guard test for "every write action calls
  `revalidateTaskPages`" would be cheap; consider it in 03 if a third write path appears.
- **Chains that self-verify on a scratch dev server land green.** Both UI chains in this
  increment reported a manual flow check; both post-merge e2e runs passed first time, unlike
  increment 01's first chain. The habit belongs in the chain prompt template.
- **Diagram re-rendering is the one orchestrator-only chore that shows up every epic** (five
  renders this increment, three of them re-renders). It stayed correct because `--strict` gates
  the close-out; it costs about five minutes per diagram by hand. A future increment could
  spend a tick on a scripted skill invocation if the plugin exposes one.
- **UTC `today`** is documented as a failure mode; increment 03 (Today view) must decide on a
  local date source before building on it.

## Integration status

Awaiting human: the base branch is complete and green; nothing has been merged to `main`.
