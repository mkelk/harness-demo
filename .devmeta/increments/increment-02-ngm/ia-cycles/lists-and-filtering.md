# Epic close retro: Lists and filtering (`isl`)

**Increment:** 02-ngm Organise · **Closed:** 2026-09-17 · **Tag:** `02-ngm.lists-and-filtering`

## What landed

Migration 0003 (`lists`, `tasks.list_id` with `ON DELETE SET NULL`, index), the lists domain
(`List` with `openCount`, `parseListName`, `listLists` / `getList` / `createList` /
`deleteList`, `isDuplicateListError`), `Task.listId` with `parseTaskInput({ listIds })`
validation, `listTasks({ listId })`, the sidebar (`ListsNav`, `NewListForm`), the `/lists/[id]`
page with Delete list, `TaskPage` shared by both routes, the List select in `TaskFields`, list
links in rows, `parseFilterQuery`, `revalidateTaskPages`, `e2e/lists.spec.ts`,
`how/lists.md` with its diagram, `data-model.md` and `task-flow` re-rendered.
165 Vitest tests, 21 e2e, coverage 96.5 / 94.7 / 97.1 / 96.8 on `src/lib/**`.

## Dispatch-mode ledger

| Unit   | Ticks         | Mode                           | Tier              | Why                                                          |
| ------ | ------------- | ------------------------------ | ----------------- | ------------------------------------------------------------ |
| wave 1 | `c05`         | solo-tick                      | strong (opus)     | migration with a foreign key; the contract for the UI        |
| chain  | `3e9` → `sxg` | warm-chain, one worktree       | strong (opus)     | both edit the forms, `page.tsx`, `task-list.tsx`, `lists.md` |
| review | `wej`         | read-only, controller checkout | frontier (opus)   | epic final review                                            |
| repair | `j4m`         | solo-tick                      | balanced (sonnet) | 2 should-fix + 3 nits                                        |

Timings: `c05` 5.0 min; chain 13.0 min for two large ticks (6.5 per tick); repair 6.3 min.
The chain implementer drove the whole lists flow against a scratch `next dev` before
committing, which is why the post-merge e2e run passed first time (21 of 21). No degradation
below graph width.

## Review-depth ledger

- Epic final review, six axes: 0 blockers, 2 should-fix, 6 nits. Repaired in `j4m`: list
  actions revalidating only `/` (now one shared `revalidateTaskPages`), stale `_overview.md`
  descriptions, UI coverage of `ON DELETE SET NULL`, a wrong comment, the `task-flow` diagram.
  Accepted: `today` computed in both pages (spec says per page), `parseTaskId` used for list
  ids, the theoretical FK race when a list is deleted between validation and insert.
- Note recorded, no action: `lists.name` is `UNIQUE` with binary collation while the sidebar
  sorts `COLLATE NOCASE`, so "Groceries" and "groceries" can coexist. Matches the spec DDL; a
  candidate for increment 03's spec if list renaming lands.

## Verification (outside-in, against the definition of done)

| Item                                                                                                                                   | Verified | Evidence                                                                                            |
| -------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| A1 `pnpm check`                                                                                                                        | yes      | exit 0 at close-out                                                                                 |
| A2 `pnpm test:e2e`                                                                                                                     | yes      | 21 passed across lists, scheduling, smoke, tasks                                                    |
| A3 `pnpm docs:check --strict`                                                                                                          | yes      | 6 diagrams stamped (lists-and-filters rendered; data-model and task-flow re-rendered)               |
| A4 coverage floor                                                                                                                      | yes      | 96.53 / 94.65 / 97.14 / 96.81                                                                       |
| migration 0003; createList/listLists/openCount; duplicate throws; deleteList nulls listId; listTasks({listId}); parseTaskInput listIds | yes      | `lists/*.test.ts`, `repository.integration.test.ts`, `validate.test.ts`, `open.integration.test.ts` |
| e2e: Groceries (0) → (1) → link on / → No list → duplicate message → delete keeps tasks → 404                                          | yes      | `e2e/lists.spec.ts`                                                                                 |
| `how/lists.md` + `data-model.md` listed and rendered                                                                                   | yes      | inventory and diagrams tables                                                                       |

## Drift review

No workaround flags, empty catches or TODO markers. The hidden `listId` input from tick `3e9`
was fully replaced by the select in `sxg` (no dead code). Query parsing consolidated into
`parseFilterQuery`. No cleanup ticks carried forward.

## Learnings promoted

- `.tick/learnings.md` (+1 entry, 74 lines): one shared revalidation helper in a plain module.
- `docs/current/`: `_overview.md` descriptions refreshed; `how/tasks.md` corrected after the
  `TaskPage` extraction.
- Method note: a chain implementer verifying the flow on a scratch dev server before committing
  is the cheapest way to get a first-time-green post-merge e2e; worth writing into the chain
  prompt template for UI chains.

## Proposed roadmap adjustments

For increment 03 (Focus): decide list-name case sensitivity when renaming lands; consider a
local-date `today` for the Today view (UTC is documented as a failure mode now).
