# Project execution profile (inferred by the runner; do not hand-edit)

Characterized 2026-09-17 at run start of increment 01-rxx by claude:orchestrator.
Re-characterize when the recorded inputs change or the runtime tripwire fires.

## Recorded inputs
- `pnpm-lock.yaml` md5 prefix: `2f09aade2c2b`
- test harness: `vitest.config.ts` (projects `node`, `jsdom`), `playwright.config.ts` (port 3100, `data/e2e.db`)
- package manager: pnpm 12 (`packageManager` pinned), Node 26.5

## Provisioning recipe (fresh worktree → runnable)
```bash
pnpm install --frozen-lockfile --prefer-offline   # ~1 s from the pnpm store; private node_modules per worktree
```
Evidence: probed on a throwaway worktree at commit 60d3353; install 0.7 s, typecheck + vitest 2.8 s.
Confidence: high. Private node_modules per worktree, so the shared-deps no-install boundary
does not apply; dependency-adding ticks still serialize on the lockfile.

## Test-tier → venue map
| Tier | Command | Venue | Evidence |
|---|---|---|---|
| typecheck | `pnpm typecheck` | in-worktree | pure |
| lint | `pnpm lint` | in-worktree | pure |
| unit + component + guards | `pnpm test` (projects node, jsdom) | in-worktree | no shared resource; guards use temp dirs |
| integration | part of `pnpm test` | in-worktree | positive isolation: `createTestDb()` makes a temp file per test (spec); until it exists, no integration tests run |
| docs shape + stamps | `pnpm docs:check` | in-worktree (missing renders = warning) | pure |
| e2e | `pnpm test:e2e` | **post-merge** | binds port 3100 and writes `data/e2e.db`: a shared singleton |
| build | `pnpm build` | **post-merge** | writes `.next/`; slow; not needed per tick |

Safety bias applied: e2e and build routed post-merge. Runtime tripwire: if in-worktree
vitest runs turn flaky, downgrade the flaky tier here and note why.

## Services
None. No Docker, no external APIs.

## Dispatch economics
- Warm/cold ratio: not yet measured (first epic). Heuristic: ticks here are ≲20 min and
  same-subsystem, so warm-chains are the expected default; go wide only for file-disjoint
  ticks of substance.
- Worktree mode: orchestrator-created (`git worktree add ../.ticks-worktrees/<unit> -b tick/<epic>/<unit> <commit>`)
  and dispatch without harness isolation, per the Claude adapter's field note for
  non-default base branches.
