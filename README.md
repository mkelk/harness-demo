# harness-demo

A small task manager (Next.js 16 App Router, SQLite through `node:sqlite`) that exists
to show how a repository run with **dmtix** is set up and structured. The app is
deliberately boring so that the method is what you read.

- **The app, as it is now:** [`docs/current/`](docs/current/README.md) (start at the
  document map; the inventory is [`_overview.md`](docs/current/_overview.md)).
- **How it was built:** the rest of this README, then
  [`.devmeta/project-history.md`](.devmeta/project-history.md) and
  `.devmeta/increments/*/`.
- **Why it looks like this:** [`docs/thoughts/`](docs/thoughts/), dated.

## The app

Tasks with a title and notes, a done state, a due date, a priority and a list. Open tasks
are ordered by due date, priority and age; overdue ones are marked; a filter bar narrows
the page by state or a search word; lists get their own page. One SQLite file at
`DATABASE_PATH` (default `data/dev.db`), no accounts, no external services.

```bash
pnpm install
pnpm dev                 # http://localhost:3000
pnpm check               # typecheck, lint, vitest tiers, docs:check, build
pnpm test:e2e            # playwright, own server on :3100, fresh data/e2e-<timestamp>.db per run
```

Setup, test tiers and architecture: [`docs/current/setup.md`](docs/current/setup.md),
[`docs/current/testing.md`](docs/current/testing.md),
[`docs/current/how/architecture.md`](docs/current/how/architecture.md).

## How dmtix is used here

dmtix is a delivery method (the "devmeta" increment discipline) running on the **ticks**
engine (`tk`, an issue tracker built for agents, plus the `ticks` skill that runs epics
as waves of implementer agents in git worktrees). The method and the engine are
installed once per machine as Claude Code skills; this repo only carries their
project-side state.

| Layer                                      | Source                                                                                                                                   | In this repo                                                                       |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Method: `/dmtix bootstrap`, `start`, `go`  | [github.com/mkelk/skills](https://github.com/mkelk/skills) → `skills/dmtix`                                                              | `.tick/config.md` (contract), `.devmeta/` (records)                                |
| Engine: the `ticks` skill and the `tk` CLI | [github.com/mkelk/ticks-melk](https://github.com/mkelk/ticks-melk) (fork of [pengelbrecht/ticks](https://github.com/pengelbrecht/ticks)) | `.tick/` (tracker, committed), `.tick/profile.md` (inferred), `.tick/learnings.md` |

### The rhythm

```
/dmtix bootstrap        once      install the method: tk init, config sections, .devmeta/ scaffold
/dmtix start "<title>"  per increment   scope: goal, deliverables, exclusions, epics, definitions of done → records + tk roadmap
/dmtix go               per session     run or resume the active increment; stops at the project checkpoint
git merge <base branch> human         shipping the increment to main is a person's decision
```

An **increment** is one unit of shippable scope with one base branch
(`YYYY-MM-DD-increment-NN`), one records directory
(`.devmeta/increments/increment-NN-xxx/`) and one checkpoint. It is partitioned into
**epics** (units of sequencing and record cadence, not feature taxonomy; two to five per
increment), and each epic is fleshed out into **ticks** just in time, by the run, never
up front.

### Ticks: how the engine sees the work

- `tk roadmap` and `tk board` are the live state. `.tick/` is committed so the state
  travels with the branch.
- A tick is an atomic, committable piece of work with its test cases and its test
  command written into it. The engine's Definition of Ready refuses vague ticks.
- Every epic has a **definition of done** (`--acceptance`) that is checkable, bounded and
  outside-in. That is what makes a run safe to walk away from.
- Every epic ends with two process ticks the engine creates itself: a **final review**
  of the epic's diff and a **close-out** that runs the retro and plans the next epic.
- Implementers run in isolated worktrees, commit as `tick <id>: <summary>`, and never
  touch `.tick/`; the orchestrator owns tick state and integrates wave by wave.

### Rules for testing, and where they are enforced

dmtix itself enforces nothing: it is the door. The ticks engine and `.tick/config.md` do the
enforcing, at four points of every run. A missing or weak test is caught at the first point
it reaches, never at the end.

| Point in the run    | What is checked                                                                                                                                                                                                                                                                                                                                                                  | Where the rule lives                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Tick creation**   | The engine's Definition of Ready refuses a tick without spelled-out test cases and a test command. Every tick here lists inputs to expected outputs and ends with `Run: pnpm typecheck && pnpm lint && pnpm test && pnpm docs:check`.                                                                                                                                            | ticks skill, `references/tick-patterns.md`                                    |
| **In the worktree** | The implementer writes the failing test first and may only report `DONE` with the in-worktree tiers green. No lowered threshold, no skipped test, no `\|\| true`; a behaviour change fixes every sibling test it breaks.                                                                                                                                                         | `.tick/config.md` → `## Testing`, `## Rules`; the implementer prompt          |
| **Post-merge gate** | The orchestrator merges a wave, then runs the whole suite plus the post-merge tiers (e2e, build) on the integrated tree. Ticks close only after that passes; a red gate keeps them open. This caught the one defect implementers could not see (Next's route announcer sharing `role="alert"`).                                                                                  | ticks skill loop, `.tick/profile.md` (venues)                                 |
| **Close-out**       | The epic's definition of done is verified item by item using only the commands under `## Acceptance Evidence` (A1 `pnpm check`, A2 `pnpm test:e2e`, A3 `pnpm docs:check --strict`, A4 `pnpm test:coverage`). Fails closed: a command not listed there cannot count as evidence. The frontier review also hunts for tests that cannot fail; it found some in three of four epics. | `.tick/config.md` → `## Acceptance Evidence`, `## Closeout Evidence Commands` |

The tiers and their venues:

| Tier                                 | Runner       | Venue                         | Why                                             |
| ------------------------------------ | ------------ | ----------------------------- | ----------------------------------------------- |
| unit, component, integration, guards | Vitest       | in-worktree, per tick         | pure, or a temp SQLite file per test            |
| e2e                                  | Playwright   | post-merge, orchestrator only | binds port 3100 and writes a real database file |
| build                                | `next build` | post-merge                    | slow, writes `.next/`                           |

Venues are inferred by the engine into `.tick/profile.md` at run start, on positive evidence
of isolation only (`createTestDb()` makes a temp file per test); anything that touches a
shared resource is routed post-merge. Coverage has a floor on `src/lib/**` (80 / 70 / 80 / 80)
that no tick may lower.

To run the same gates by hand:

```bash
pnpm check           # typecheck, lint, all Vitest tiers, docs:check, build
pnpm test:e2e        # Playwright, own server on :3100, throwaway data/e2e-<run>.db
pnpm test:unit       # or test:component, test:integration, test:coverage
```

Details: [`docs/current/testing.md`](docs/current/testing.md) (commands, tiers, failure
modes) and [`docs/current/standards/testing-strategy.md`](docs/current/standards/testing-strategy.md)
(what each tier proves, the rules, the guard tests).

### Rules for automatic documentation, and where they are enforced

Set in `.tick/config.md` → `## Documentation`, specified in
[`docs/current/_documentation_principles.md`](docs/current/_documentation_principles.md).
`docs/current/` is current truth, tiered by audience, one page per concern, listed in
`_overview.md`; every how-it-works page opens with a diagram. As with tests, the rule is
only as good as the point in the run that checks it:

| Point in the run    | What is checked                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Where the rule lives                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| **Tick creation**   | A tick that changes behaviour, commands, config or tables names the page it updates, and a tick that creates a how-it-works page names its diagram id (`<!-- diagram: lists-and-filters -->`), so the Mermaid block is in scope, not follow-up.                                                                                                                                                                                                                                                                                                        | `.tick/config.md` → `## For implementers`, `## Documentation`                  |
| **In the worktree** | `pnpm docs:check` runs in every tick's gate: a page not listed in `_overview.md`, a `how/` page without a tagged Mermaid block before its first heading, a missing `## Key entry points` table, an entry-point path that does not exist, or a page over 650 lines fails the tick. A missing SVG is a warning here, because rendering is orchestrator work.                                                                                                                                                                                             | `scripts/check-docs.mjs`, tested by `scripts/check-docs.test.ts`               |
| **Close-out**       | The living-docs audit passes over `docs/current/` against the epic's diff, renders every `missing` or `stale` diagram with the `diagram-design` skill, stamps it (`pnpm docs:check --stamp` writes the SHA-256 of the Mermaid block to `diagrams/<id>.sha`), refreshes the inventory and date line, and then A3 `pnpm docs:check --strict` must pass, where a missing or stale render is a failure. This fired four times in two increments: every edit to an existing Mermaid block went stale and had to be re-rendered before the epic could close. | `.tick/config.md` → `## At epic close-out` step 4, `## Acceptance Evidence` A3 |
| **Afterwards**      | The stamp is a hash, not a timestamp: a later Mermaid edit, a clone or a merge cannot fool it, and `pnpm check` (which includes `docs:check`) goes red.                                                                                                                                                                                                                                                                                                                                                                                                | `scripts/check-docs.mjs`                                                       |

What is not enforced mechanically: whether a diagram shows a mechanism or merely decorates a
list, and whether a concern that deserved a how-page was written as something else. Those
are the final review's doc-accuracy axis, a judgment call at frontier tier.

Rendering is the one step that is a skill invocation rather than a binary: Mermaid in the
Markdown is the source, the skill draws an editorial SVG next to it under
`docs/current/diagrams/`, and only the SVG is referenced from the page. Implementers write
the Mermaid; the orchestrator renders and stamps.

### Learning, inside and between increments

- **Intra-increment.** Each epic's close-out runs a retro: harvest tick notes and
  concerns, promote each learning to exactly one home (`AGENTS.md` for rules,
  `docs/current/` for how-the-code-works, `.tick/learnings.md` for operational gotchas,
  hard cap 150 lines, compacted every retro), verify the definition of done outside-in
  against the code, review the diff for drift. The report lands in
  `.devmeta/increments/<id>/ia-cycles/<epic>.md`; the next epic's planning re-reads
  `learnings.md` fresh.
- **Inter-increment.** The checkpoint writes `completion.md` (features, gate status,
  outstanding human items, postmortems) and every epic appends to
  `.devmeta/project-history.md`. The next `/dmtix start` reads both, and its spec in
  `docs/thoughts/` says what the last increment taught. Roadmap changes proposed in
  retros come back to the human there; the engine never executes them on its own.

### Where things live

| What                                                            | Where                                                     |
| --------------------------------------------------------------- | --------------------------------------------------------- |
| Standing method contract (edit only to change how you work)     | `.tick/config.md`                                         |
| Live state                                                      | `tk roadmap`, `tk board`, `.devmeta/current-increment.md` |
| Inferred execution facts (never hand-edited)                    | `.tick/profile.md`                                        |
| Operational gotchas for implementers                            | `.tick/learnings.md`                                      |
| Increment records: overview, per-epic retros, completion report | `.devmeta/increments/increment-NN-xxx/`                   |
| Narrative history, oldest first                                 | `.devmeta/project-history.md`                             |
| Increment specs and dated thinking                              | `docs/thoughts/YYYY-MM-DD-*.md`                           |
| Living documentation of the app                                 | `docs/current/`                                           |
| Agent instructions (one canonical file)                         | `AGENTS.md` (`CLAUDE.md` imports it)                      |

### Reading a finished increment

1. `docs/thoughts/YYYY-MM-DD-increment-NN-<slug>.md`: the spec the increment was scoped from.
2. `.devmeta/increments/increment-NN-xxx/_overview.md`: goal, deliverables, exclusions,
   the tk roadmap, definitions of done, exit criteria.
3. `ia-cycles/<epic>.md`: how each epic went (dispatch ledger, verification table, drift,
   promoted learnings, proposed roadmap changes).
4. `completion.md`: how the increment ended and what was left for a human.
5. `git log --first-parent main` and `git tag`: one merge per increment, one tag per
   epic close (`<increment-id>.<epic-slug>`).

## What was built, increment by increment

| Increment          | Spec                                                                                                           | Records                                                                                      | Epics (tags)                                                  | Result                                                             |
| ------------------ | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------ |
| 01-rxx Task basics | [`docs/thoughts/2026-09-17-increment-01-task-basics.md`](docs/thoughts/2026-09-17-increment-01-task-basics.md) | [`.devmeta/increments/increment-01-rxx/`](.devmeta/increments/increment-01-rxx/_overview.md) | `01-rxx.persistence-foundation`, `01-rxx.task-list`           | SQLite layer, tasks domain, list and edit pages; 55 Vitest, 10 e2e |
| 02-ngm Organise    | [`docs/thoughts/2026-09-17-increment-02-organise.md`](docs/thoughts/2026-09-17-increment-02-organise.md)       | [`.devmeta/increments/increment-02-ngm/`](.devmeta/increments/increment-02-ngm/_overview.md) | `02-ngm.due-dates-and-priority`, `02-ngm.lists-and-filtering` | due dates, priority, ordering, filters, lists; 165 Vitest, 21 e2e  |

Each increment ran as `/dmtix start` → `/dmtix go` → checkpoint → `git merge --no-ff` to
`main`. Every epic has a retro under `ia-cycles/`, every increment a `completion.md` whose
postmortems fed the next spec. `.tick/learnings.md` grew from nothing to 74 lines over four
retros. Increments 03 and 04 exist only in
[`docs/thoughts/2026-09-17-product-roadmap.md`](docs/thoughts/2026-09-17-product-roadmap.md),
to show where the product would go and what was left out on purpose.
