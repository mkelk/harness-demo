# Epic close retro: Task list (`5qb`)

**Increment:** 01-rxx Task basics · **Closed:** 2026-09-17 · **Tag:** `01-rxx.task-list`

## What landed

The task list at `/` (add form, open list newest first, done section, empty state, counts),
done / reopen / delete through row forms with exact accessible names, the edit page at
`/tasks/[id]/edit` with redirect after save and 404 for unknown ids, three server actions in
two files, four client components, ten Playwright tests in one serial flow on a per-run database,
four component tests, `parseTaskId` / `submittedValues` in the validation module,
`docs/current/how/tasks.md` with the `task-flow` diagram. 55 Vitest tests, 10 e2e,
coverage 92.6 / 86.0 / 90.0 / 93.0 on `src/lib/**`.

## Dispatch-mode ledger

| Unit   | Ticks                 | Mode                                                           | Tier              | Why                                                                                                            |
| ------ | --------------------- | -------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------- |
| chain  | `swe` → `76z` → `xgu` | warm-chain, one worktree, one implementer, one commit per tick | strong (opus)     | same subsystem, shared seam files (`actions.ts`, `task-list.tsx`, `tasks.md`); Next 16 specifics need judgment |
| review | `6vt`                 | read-only reviewer, controller checkout                        | frontier (opus)   | epic final review                                                                                              |
| repair | `jwj`                 | solo-tick                                                      | balanced (sonnet) | four should-fixes, two nits                                                                                    |

The chain took 9.9 minutes for three ticks against 3.5, 3.3 and 1.4 minutes for the three
fresh dispatches of epic 1: roughly 3.3 min per tick warm versus 2.7 cold on smaller ticks, so
no warm/cold saving is measurable yet at this tick size; the chain's real win was zero merge
conflicts on the seam files. Recorded in `.tick/profile.md`.

## Review-depth ledger

- No per-tick review inside the chain (the implementer self-verified each tick on a scratch
  `next dev`).
- Post-merge gate caught one e2e failure (`getByRole("alert")` also matching Next's route
  announcer); fixed by the orchestrator as a mechanical selector change and promoted to learnings.
- Epic final review, six axes: 0 blockers, 4 should-fix, 5 nits. Repaired: duplicated id parsing
  (moved to `validate.ts` with tests), dishonest e2e retries (now 0, documented), a broken doc
  sentence, an unused state field, a missing reset test. Accepted as-is: a shared `TaskFields`
  component (two forms only), per-run e2e database files left under `data/` (gitignored,
  documented cleanup), the single-item ordering assertion (ordering is proven in the repository tier).

## Verification (outside-in, against the definition of done)

| Item                                    | Verified | Evidence                                                  |
| --------------------------------------- | -------- | --------------------------------------------------------- |
| A1 `pnpm check`                         | yes      | exit 0 at close-out: 55 tests, docs clean, build compiled |
| A2 `pnpm test:e2e`, nine user paths     | yes      | 10 passed (smoke + nine paths from the spec)              |
| A4 coverage floor                       | yes      | 92.55 / 86 / 90 / 93.02                                   |
| `how/tasks.md` with `task-flow`, listed | yes      | A3 `pnpm docs:check --strict` clean, 4 diagrams stamped   |
| guard test still passing                | yes      | `scripts/check-rules.test.ts` in `pnpm test`              |

## Drift review

No workaround flags, empty catches or TODO markers. Duplication found by the review was
removed in `jwj`. No cleanup ticks carried forward.

## Learnings promoted

- `.tick/learnings.md` (+4 entries, 53 lines): Next's route announcer and `role="alert"`;
  serial e2e flows and retries; RTL cleanup without Vitest globals; input parsing lives in
  `validate.ts`.
- `docs/current/`: `testing.md` describes the serial e2e flow and the per-run database;
  `how/tasks.md` corrected and extended; `setup.md` reset command covers `data/e2e-*.db*`.
- Skill-level (proposed, not edited here): the chain implementer's habit of verifying on a
  scratch `next dev` on a private port is worth naming in `claude-runner.md` as the cheap
  substitute for the post-merge e2e tier inside a worktree.

## Proposed roadmap adjustments

None for this increment. For increment 02 the spec should say up front that a shared
`TaskFields` component is expected once the forms gain due date and priority fields, so the
review's accepted duplication does not grow.
