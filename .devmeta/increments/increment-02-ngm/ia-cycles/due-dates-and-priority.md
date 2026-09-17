# Epic close retro: Due dates and priority (`9jr`)

**Increment:** 02-ngm Organise · **Closed:** 2026-09-17 · **Tag:** `02-ngm.due-dates-and-priority`

## What landed

Migration 0002 (`due_on`, `priority`, `tasks_due_idx`), `Priority` and the two fields on
`Task` / `TaskInput`, `parseDueOn` / `parsePriority` / `PRIORITY_LABELS`, `listTasks` with
`show` / `q` filters (escaped `LIKE`) and the due-then-priority-then-newest ordering,
`isOverdue`, the shared `TaskFields` component on both forms, badges, due dates and the
Overdue mark in rows, the filter bar, `e2e/scheduling.spec.ts`, `how/scheduling.md` with its
diagram, `data-model.md` re-rendered. 113 Vitest tests, 15 e2e, coverage
95.5 / 92.9 / 96.0 / 95.8 on `src/lib/**`.

## Dispatch-mode ledger

| Unit   | Ticks         | Mode                           | Tier              | Why                                                       |
| ------ | ------------- | ------------------------------ | ----------------- | --------------------------------------------------------- |
| wave 1 | `1ti`         | solo-tick                      | strong (opus)     | migration + ordering correctness; the contract for the UI |
| chain  | `0qq` → `irc` | warm-chain, one worktree       | strong (opus)     | both edit the forms, `page.tsx`, `tasks.md`               |
| review | `58o`         | read-only, controller checkout | frontier (opus)   | epic final review                                         |
| repair | `x7s`         | solo-tick                      | balanced (sonnet) | 3 should-fix + 4 nits                                     |

Timings: `1ti` 5.0 min; the two-tick chain 9.1 min (4.5 per tick, the second tick being the
larger); repair 6.4 min. Still no measurable warm saving at this tick size; the chain again
avoided seam conflicts on `page.tsx` and the forms. No degradation below graph width.

## Review-depth ledger

- Wave-1 report carried `DONE_WITH_CONCERNS`: the repository default `show: "open"` would have
  emptied the Done section on `/`; the implementer passed `show: "all"` from the page and the
  chain tick then made a missing `show` mean "both sections" and documented it.
- Epic final review, six axes: 0 blockers, 3 should-fix, 7 nits. Repaired in `x7s`: unescaped
  `LIKE` wildcards, misleading empty state under `show=open`, a Markdown table broken by `||`,
  duplicated field types, two non-discriminating tests, cleanup-on-failure in e2e. Accepted:
  `parsePriority` treating an empty value as Normal (documented), `parseShow` living in
  `page.tsx`, `today` as the UTC date (spec-mandated; revisit in increment 03).

## Verification (outside-in, against the definition of done)

| Item                                                                                  | Verified | Evidence                                                                               |
| ------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------- |
| A1 `pnpm check`                                                                       | yes      | exit 0 at close-out                                                                    |
| A3 `pnpm docs:check --strict`                                                         | yes      | 5 diagrams stamped (scheduling rendered, data-model re-rendered)                       |
| A4 coverage floor                                                                     | yes      | 95.45 / 92.85 / 96 / 95.76                                                             |
| migration 0002 fresh and on a 0001 db                                                 | yes      | `open.integration.test.ts`, incl. default `priority = 2` on an existing row            |
| ordering for the five-task set, show/q, isOverdue                                     | yes      | `repository.integration.test.ts` (fake timers, tie-break discriminated, LIKE escaping) |
| due / priority rules and messages incl. `2026-02-30`                                  | yes      | `validate.test.ts`                                                                     |
| e2e: High + 2000-01-01 first with badges; edit clears; Done filter; `zzqx` → Open (0) | yes      | `e2e/scheduling.spec.ts`, 15 e2e green post-merge                                      |
| `how/scheduling.md` + `data-model.md` listed and rendered                             | yes      | inventory and diagrams tables                                                          |

## Drift review

No workaround flags, no empty catches, no TODO markers. Duplication removed (`TaskFields`,
shared field types). No cleanup ticks carried forward.

## Learnings promoted

- `.tick/learnings.md` (+3 entries, 67 lines): `LIKE` escaping; exact label lookups in
  Playwright; per-file `afterAll` cleanup.
- `docs/current/`: `how/scheduling.md` corrected (table, empty-state rule, case folding).
- Method note for the increment spec: a "default view" rule that differs from a filter's default
  must be written in the spec, not discovered by an implementer; increment 02's spec left it
  implicit and the chain had to decide.

## Proposed roadmap adjustments

None. Epic 2 (Lists and filtering) proceeds; its `TaskFields` gains the List select in one place
now that the field types are shared.
