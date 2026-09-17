# Epic close retro: Persistence foundation (`azj`)

**Increment:** 01-rxx Task basics · **Closed:** 2026-09-17 · **Tag:** `01-rxx.persistence-foundation`

## What landed

`src/lib/db/` (openDatabase with WAL and foreign keys, applyMigrations with a
`schema_migrations` ledger and per-migration transactions, migration 0001 `tasks`, `getDb`
singleton on `globalThis`, `createTestDb` temp-file helper, `DatabaseSync` re-export),
`src/lib/tasks/` (types, `parseTaskInput` + `formDataToRaw`, six repository functions),
`scripts/check-rules.test.ts`, `docs/current/how/persistence.md`, `docs/current/data-model.md`,
two rendered diagrams. 40 Vitest tests, coverage 91.9 / 83.3 / 88.9 / 92.4 on `src/lib/**`.

## Dispatch-mode ledger

| Wave   | Ticks        | Mode                                          | Tier (model)      | Why                                                              |
| ------ | ------------ | --------------------------------------------- | ----------------- | ---------------------------------------------------------------- |
| 1      | `w74`        | solo-tick, orchestrator-created worktree      | strong (opus)     | foundation and contract; also discovered the provisioning recipe |
| 2      | `4ny`, `86w` | parallel-wave, 2 worktrees                    | balanced (sonnet) | file-disjoint, both consuming `types.ts`                         |
| review | `me4`        | read-only reviewer in the controller checkout | frontier (opus)   | epic final review                                                |
| repair | `29n`        | solo-tick                                     | balanced (sonnet) | four should-fixes and five nits from the review                  |

Never degraded below the graph's width. Warm/cold ratio not measurable yet: three
implementer dispatches of 3.5, 3.3 and 1.4 minutes; the repair (8 files) took 3.3 minutes.
Provisioning is ~1 s, so worktree cost is negligible in this repo.

## Review-depth ledger

- Foundation review of `types.ts`, `index.ts`, `migrate.ts` by the orchestrator before wave 2 (inline).
- No per-tick review for `4ny` / `86w` (well-specified; the epic review covered them).
- Epic final review at frontier tier, six axes: 0 blockers, 4 should-fix, 9 nits. All should-fixes
  and five nits repaired in `29n`; accepted as-is: `notes` CHECK constraint (spec did not ask, docs
  match), extra exports from `validate.ts` (`formDataToRaw`, limits: used by epic 2), redundant
  module-level slot in `client.ts`.

## Verification (outside-in, against the definition of done)

| Item                                               | Verified | Evidence                                                                  |
| -------------------------------------------------- | -------- | ------------------------------------------------------------------------- |
| A1 `pnpm check` green                              | yes      | run at close-out, exit 0 (40 tests, docs clean, build compiled)           |
| A4 coverage floor on `src/lib/**`                  | yes      | 91.86 / 83.33 / 88.88 / 92.4 vs 80 / 70 / 80 / 80                         |
| open/migrate/test-db integration cases             | yes      | `src/lib/db/open.integration.test.ts` (rollback now proves table absent)  |
| repository integration cases                       | yes      | `src/lib/tasks/repository.integration.test.ts`, fake-timer ordering tests |
| validation unit cases                              | yes      | `src/lib/tasks/validate.test.ts`, 11 cases                                |
| `scripts/check-rules.test.ts`                      | yes      | passes; also caught a type-only import                                    |
| persistence + data-model pages listed and rendered | yes      | A3 `pnpm docs:check --strict` clean, 3 diagrams stamped                   |

## Drift review

Reviewer swept the diff: no `|| true`, no empty catches, no TODO/HACK, no skipped tests,
thresholds untouched. One pre-existing gap surfaced (eslint not ignoring `coverage/`) and was
fixed in `29n`. No cleanup ticks needed.

## Learnings promoted

- `.tick/learnings.md` (new file, 6 entries): DatabaseSync via the barrel; node:sqlite row typing;
  guarded ROLLBACK; fake timers for timestamp tests; generated dirs in eslint ignores; prettier
  and Markdown tables; grep docs for moved paths.
- `docs/current/`: fixed `testing.md` file names, extended `persistence.md` public-surface row.
- Skill-level (runner-neutral, proposed for `ticks` `references/tk-commands.md`, not edited here):
  `tk update` has no `--blocked-by`; add a blocker to an existing tick with `tk block <tick> <blocker>`.
  `tk` 0.29 accepts `--base-branch` on epics only; record it as a note on the project tick.
- Harness-level (proposed for `claude-runner.md`): a plugin enabled with `claude plugin install
--scope project` is not loaded in the running session; a skill such as `diagram-design` is then
  followed by hand from its `references/` until the next session.

## Proposed roadmap adjustments

None. Epic 2 (Task list) proceeds as scoped; its chain can rely on `formDataToRaw` and
`import type { DatabaseSync } from "@/lib/db"`.
