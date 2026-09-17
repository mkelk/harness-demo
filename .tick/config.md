# Runner config — standing method contract (devmeta adaptation)

## For implementers
- Your tick description names the source-of-truth spec. Do not add scope beyond it.
- Follow CLAUDE.md / AGENTS.md and existing code patterns.
- Documentation is part of the work, not follow-up: see `## Documentation` below. A tick
  that changes behaviour, commands, config, tables or the test setup is not done until
  `docs/current/` says so (in the same commit).

## At run start
- Branch guard (verify, don't ask): `git rev-parse --abbrev-ref HEAD` must not be
  `main`/`master` — devmeta runs only on an increment base branch. On main/master, stop
  and tell the human (or switch to the active increment's branch per
  `.devmeta/current-increment.md` → its `_overview.md` "How to run").

## At epic close-out
Resolve the ACTIVE increment from `.devmeta/current-increment.md`: its directory
is <DIR>, its id is <ID>. Then:
1. Write the full epic-close retro report to `<DIR>/ia-cycles/<epic-title>.md`
   (one-line summary as the tk close --reason). Include the dispatch-mode and
   review-depth ledgers.
2. Append a narrative entry to `.devmeta/project-history.md`.
3. Update `<DIR>/_overview.md` (mark this epic DONE).
4. Living-docs audit: fix any doc the epic proved wrong. In this repo the audit is the
   procedure in `## Documentation` below: pass over `docs/current/` against what the
   epic built, render and stamp every missing or stale diagram, refresh `_overview.md`
   and its date line, and finish with `pnpm docs:check --strict` green.
5. Tag: `git tag <ID>.<epic-slug> -m "<summary>"`.

## At project checkpoint
Same resolution as above. Then:
1. Write the increment completion report to `<DIR>/completion.md`
   (features, gates status, outstanding human items, postmortems).
2. Integration stops at the increment's base branch: never merge it to `main`/`master` —
   shipping the increment is the human's decision at this checkpoint.
3. STOP for human review.

## Documentation
Living documentation is a deliverable of every epic. The specification is
`docs/current/_documentation_principles.md`; this section is what the engine applies.
- `docs/current/` is current truth, tiered by audience (1 decision-maker, 2 operator or
  change-placer, 3 reference). Every page is listed in `_overview.md` with a tier and a
  one-line description and in `README.md`'s document map; `_overview.md` ends with a
  "Last documentation update" line.
- Implementers (per tick): for anything you change that a user, an operator or the next
  agent needs to know (a page, an action, a command, an env var, a table, a validation
  rule, a failure mode) update or create the page in the same commit. A new how-it-works
  concern gets `docs/current/how/<concern>.md` in the required shape: intro paragraph,
  lead diagram (`![Title](../diagrams/<id>.svg)` then `<!-- diagram: <id> -->` above a
  Mermaid block), `## Key entry points` table (concern → `path` → `export`), mechanism,
  failure modes. Add the page to `_overview.md` and `README.md`, and the diagram id to
  `_overview.md` → Diagrams. Run `pnpm docs:check` (missing renders are a warning for
  you; stale stamps and shape problems are failures you fix).
- Orchestrator (epic close-out living-docs audit, step 4 above):
  1. Read the epic's diff and the retro harvest; list every command, env var, table,
     page, action, rule and failure mode the epic added or changed.
  2. Check each against `docs/current/`; write what is missing, fix what the epic made
     false, delete what no longer exists. Check shape: every `how/` page opens with its
     diagram and carries a key-entry-points table; a page holding two concerns is split.
  3. Render diagrams: for every id `pnpm docs:check` reports `missing` or `stale`,
     invoke the `diagram-design` skill on the Mermaid block (`/diagram-design:import-mermaid`,
     or follow its `references/import-mermaid.md` procedure directly when the skill is
     not loaded in the session) and write `docs/current/diagrams/<id>.svg`. Then
     `pnpm docs:check --stamp`.
  4. Refresh `_overview.md` (inventory, Diagrams table, the date line naming the epic)
     and `README.md`'s document map.
  5. `pnpm docs:check --strict` must pass. Commit Markdown, SVGs and stamps together as
     `docs(<epic-slug>): living-docs audit`.
- An epic that changes nothing user- or operator-facing says so explicitly in its retro.

## Environment
- `node --version` — must be ≥ 24 (26.x on the dev machines)
- `pnpm --version` — pnpm ≥ 10
- `tk --version`
- `ls ~/.cache/ms-playwright | grep -q chromium` — Playwright's Chromium is installed (`pnpm exec playwright install chromium` if not)

## Rules
- Package manager is pnpm. Never run `pnpm add`/`pnpm install <pkg>` in a tick other
  than a tick whose description says it adds dependencies: if a dependency you need is
  missing, stop and report `STATUS: NEEDS_CONTEXT — missing dependency <name>`. Lockfile
  changes in parallel ticks are a merge hazard.
- `process.env` is read only in `src/lib/env.ts`. Database access only through
  `src/lib/db/`; SQL lives in `src/lib`, never in `src/app`.
- Tests use a temp-file SQLite per test via `createTestDb()` from `src/lib/db/test-db.ts`
  (created by the persistence foundation tick). Never touch `data/dev.db` from a test.
  Never run `pnpm test:e2e` in a worktree: it binds port 3100 and is post-merge.
- Test-first: write the failing test named in your tick, then make it pass. Never lower
  a coverage threshold, skip a test, or add `|| true`. A behaviour change fixes every
  sibling test it breaks in the same tick.
- Forms use server actions in `src/app/**/actions.ts`; validation of user input lives in
  `src/lib` and is unit-tested there.
- Prose in `docs/current/`: no em-dashes, exact values over narrative, identifiers as in
  the code.
- Commit as `tick <id>: <summary>`. Do not touch `.tick/`.

## Testing
- `pnpm typecheck` — TypeScript (in-worktree)
- `pnpm lint` — eslint (in-worktree)
- `pnpm test` — Vitest: unit, component, integration (temp-file SQLite per test) and repo guards (in-worktree)
- `pnpm docs:check` — docs shape and diagram stamps; missing renders are a warning in-worktree (in-worktree)
- `pnpm test:e2e` — Playwright on port 3100 against `data/e2e.db` (post-merge, orchestrator only)
- `pnpm build` — `next build` (post-merge, orchestrator only; slow and writes `.next/`)

## Closeout Evidence Commands
- `pnpm check`
- `pnpm test:e2e`
- `pnpm docs:check --strict`
- `pnpm test:coverage`

## Acceptance Evidence
- A1: `pnpm check`
- A2: `pnpm test:e2e`
- A3: `pnpm docs:check --strict`
- A4: `pnpm test:coverage`
