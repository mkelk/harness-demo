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

### Rules for testing

Set in `.tick/config.md` → `## Testing` and explained in
[`docs/current/standards/testing-strategy.md`](docs/current/standards/testing-strategy.md):

- Five tiers: unit, component, integration, guards (Vitest) and e2e (Playwright).
- **Venues.** The engine's inferred profile routes unit, component, integration and
  guards **in-worktree** (implementers run them before reporting) and e2e
  **post-merge** (it binds a port and writes a real database file, so the orchestrator
  runs it once on the integrated tree before a wave closes).
- Test-first, real database in a temp file per test, coverage floor on `src/lib/**`,
  no threshold lowered inside a tick, sibling tests fixed in the same tick.
- Acceptance is evidence: `.tick/config.md` → `## Acceptance Evidence` maps each
  definition-of-done item to exactly one command that the close-out may run.

### Rules for automatic documentation

Set in `.tick/config.md` → `## Documentation`, specified in
[`docs/current/_documentation_principles.md`](docs/current/_documentation_principles.md):

- `docs/current/` is current truth, tiered by audience, one page per concern, listed in
  `_overview.md`.
- A tick that changes behaviour, commands, config or tables updates `docs/current/` in
  the same tick. The epic close-out runs a **living-docs audit** against what the epic
  built and refreshes the inventory and its date line.
- **Diagrams first.** A how-it-works page opens with a diagram: Mermaid in the Markdown
  is the source, the `diagram-design` skill renders an SVG beside it, and a SHA stamp
  proves the two match. Implementers write the Mermaid; the orchestrator renders and
  stamps at close-out.
- `pnpm docs:check` holds the mechanical parts (inventory, page shape, stamps) and runs
  `--strict` at close-out, so an epic cannot close with a missing page or an unrendered
  diagram.

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
