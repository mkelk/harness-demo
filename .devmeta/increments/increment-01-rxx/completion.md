# Increment 01-rxx — Task basics: completion report

**Reached checkpoint:** 2026-09-17 · **Base branch:** `2026-09-17-increment-01` · **Project tick:** `m2h` (open, awaiting human)
**Tags:** `01-rxx.persistence-foundation`, `01-rxx.task-list`

## Features delivered

| Feature                                                                          | Where                                                      | Proven by                                            |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------- |
| Persistent SQLite store with migrations on open                                  | `src/lib/db/`                                              | `open.integration.test.ts`                           |
| Tasks domain: validation and repository                                          | `src/lib/tasks/`                                           | `validate.test.ts`, `repository.integration.test.ts` |
| Task list at `/`: add, open list newest first, done section, empty state, counts | `src/app/page.tsx`, `actions.ts`, `components/`            | `e2e/tasks.spec.ts` tests 1-3                        |
| Mark done, reopen, delete from the list                                          | `actions.ts` (`toggleTask`, `removeTask`), `task-list.tsx` | `e2e/tasks.spec.ts` tests 4-6                        |
| Edit page with redirect after save and 404 for unknown ids                       | `src/app/tasks/[id]/edit/`                                 | `e2e/tasks.spec.ts` tests 7-9                        |
| Rules guard (env reader, sqlite import boundary)                                 | `scripts/check-rules.test.ts`                              | itself                                               |
| Living docs: persistence, data model, tasks, each with a rendered diagram        | `docs/current/`                                            | `pnpm docs:check --strict`                           |

## Gate status on the base branch (run at checkpoint)

| Gate                                                                  | Result                                                        |
| --------------------------------------------------------------------- | ------------------------------------------------------------- |
| A1 `pnpm check` (typecheck, lint, 55 Vitest tests, docs check, build) | green                                                         |
| A2 `pnpm test:e2e`                                                    | green, 10 passed                                              |
| A3 `pnpm docs:check --strict`                                         | green, 4 diagrams stamped                                     |
| A4 `pnpm test:coverage` on `src/lib/**`                               | 92.6 lines / 86.0 branches / 90.0 functions / 93.0 statements |

## Outstanding human items

1. Smoke-test in a browser: `pnpm dev`, add a task, tick it, edit it, delete it.
2. Decide on shipping: merge `2026-09-17-increment-01` into `main` (`git merge --no-ff`), then close
   the project tick: `tk close m2h --reason "Shipped: ..."`.
3. Optional: `rm -f data/e2e-*.db*` to clear the per-run e2e databases the gate runs left behind.

## Postmortems (what the increment taught, beyond the learnings file)

- **A chain beats a wave when the seam is the page.** Epic 2's three tickets all edited
  `actions.ts`, `task-list.tsx` and `tasks.md`; one warm-chain produced zero merge conflicts,
  where a parallel wave would have produced three. Epic 1's two-wide wave was the right call for
  file-disjoint work. The graph width is feasibility; the seam decides the dispatch.
- **The post-merge tier earns its place.** The one failure the implementers could not see
  (Next's route announcer sharing `role="alert"`) surfaced only in the orchestrator's e2e run.
- **Reviews found tests that could not fail, twice.** Timestamp ties in epic 1, a single-item
  ordering assertion in epic 2. The Definition of Ready now asks for a discriminating case; the
  learnings file carries the fake-timer rule.
- **Rendering diagrams is orchestrator work and it stayed that way.** Implementers wrote Mermaid,
  the orchestrator rendered three SVGs by following the skill's references (the plugin was not
  loaded in-session), stamped them, and `--strict` held the close-out.
- **Proposed for increment 02:** name the shared `TaskFields` component up front; add
  `parseTaskId` to the spec's domain table; keep the e2e flow serial but split it per feature
  file so a failure localises.

## Integration status

Awaiting human: the base branch is complete and green; nothing has been merged to `main`.
