# Documentation Principles

How and why we write documentation in `docs/current/`. This is the specification the
dmtix run enforces: `.tick/config.md` → `## Documentation` points here, the epic-close
living-docs audit checks against it, and `pnpm docs:check` holds the mechanical parts.

## Core principle

**Write for the person who needs to act on this, at the depth they need, with the
specific data they need to decide.**

Every document exists so that a specific person can make a specific decision or perform a
specific action. For this repo the readers are: someone evaluating the dmtix method by
reading a finished example, someone (human or agent) about to change the app, and someone
running it locally. Write for them.

## Audience tiers

| Tier | Audience                                                   | Question they are answering                                                                                                          |
| ---- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | Decision-maker, evaluator                                  | What is this? Is it healthy? How was it built?                                                                                       |
| 2    | Operator, and whoever is placing a change (human or agent) | How do I set up, run and test this? For a concern I am about to change: which file holds it, what is its mechanism, and what breaks? |
| 3    | Reference                                                  | What does each table, config key or command actually mean?                                                                           |

The README's document map assigns every document to a tier. A reader should be able to
stop at their tier and have everything they need.

## Coverage

The documentation aims for **architectural completeness**: someone who has read
`docs/current/` in full, without reading the source, should be able to say what the app
does, how it works, how it is run and tested, and to predict what it does in a situation
the docs do not spell out. An agent planning a change reads these pages before the code
and must find the concern, its mechanism and the file it lives in without grepping.

Covered, always:

- **What the system is**: what it does, what it runs on, what it talks to.
- **Every user-facing capability**, with the page or action that exposes it.
- **Modules and boundaries**: `src/app` (routes, server actions), `src/lib` (domain and
  persistence), `scripts/` (repo tooling), and how they connect.
- **Key mechanisms**: persistence and migrations, the request-to-write path of a server
  action, validation rules, ordering and filtering rules.
- **Data**: every table, its columns, keys and the invariant it protects.
- **Configuration**: every environment variable and named constant.
- **The operational surface**: setup, run, test, reset the database.
- **Failure modes** an operator or developer will actually see, with the fix.

Not covered: the internals of Next.js or SQLite, or every function. The syntax of ours
lives in the code; the design lives here.

## Rules

### Current truth, not history

`docs/current/` is the state of the system now. Not a changelog. When the system changes,
the docs change; they do not accumulate layers. History lives in
`.devmeta/project-history.md`; exploration lives in `docs/thoughts/`.

### Numbers and exact values over narrative

Ports, paths, env var names, table and column names, limits. "Titles are validated" is
filler; "a title is 1 to 200 characters after trimming" is usable. If a command is
copy-pasteable, paste it.

### Actionable structure

Runbooks have copy-pasteable commands. Reference docs have exact names and types.
Troubleshooting has symptom-to-fix tables.

### Progressive depth

README (map) to `_overview.md` (inventory) to a page. No page requires reading another
page first to be useful at its own level.

### One document, one job

One concern per page. A concern that outgrows a section becomes its own page. A page past
650 lines holds two jobs; `pnpm docs:check` fails it.

### The shape of a how-it-works page (`how/*.md`)

Enforced by `pnpm docs:check`:

1. `# Title`, then one paragraph saying what the concern is and who the page is for.
2. The lead diagram, before the first `##` heading (see **Diagrams first**).
3. `## Key entry points`: a table from concern to code, `path` → `export`, identifiers
   written exactly as in the code. Paths in backticks must exist.
4. The mechanism in prose, exact values in tables, commands in fenced blocks.
5. Failure modes of this concern, or a pointer to `troubleshooting.md`.

### Prose conventions

- No em-dashes in prose. A hyphen with spaces, a comma, a colon, or two sentences.
- Plain hyphens in headings.
- Identifiers exactly as in the code, in backticks.

### Document inventory

Every page under `docs/current/` appears in `_overview.md` with a tier and a one-line
description, and in the README's document map. If it is not in the overview, it does not
exist. `pnpm docs:check` fails an unlisted page.

## Diagrams first, for insight

A reader takes in a good diagram faster than paragraphs. Every page that explains how
something works leads with one. Text and tables still carry the exact values; the diagram
gives the shape.

- **Mermaid in the Markdown is the source of truth.** The block is tagged on the line
  above with `<!-- diagram: <id> -->` (id starts with a letter or digit; the angle
  brackets in this sentence are what keep this example from counting).
- **The `diagram-design` skill renders an editorial SVG** next to it at
  `docs/current/diagrams/<id>.svg`, and the page shows the SVG above the Mermaid block:
  `![Title](../diagrams/<id>.svg)`. Rendering is a skill invocation, not a binary. The skill
  is vendored at `.claude/skills/diagram-design/` (command `/diagram-import-mermaid`); its
  style guide carries a profile header for this repo, so it runs without a first-time prompt.
- **A stamp proves the SVG matches the Mermaid.** `pnpm docs:check --stamp` writes
  `diagrams/<id>.sha` (SHA-256 of the block). `pnpm docs:check` fails a stale stamp;
  `--strict` also fails a missing SVG.
- A diagram earns its place by showing a mechanism, a sequence or a boundary, not by
  decorating a list. One or two focal elements, one accent colour.

### Who renders, and when

Implementers (the engine's subagents) write the Mermaid and the prose in the same tick
as the code. They run `pnpm docs:check` (missing renders are a warning there). Rendering
and stamping is orchestrator work at epic close-out: the living-docs audit invokes the
skill on every `missing` or `stale` id, stamps, and commits Markdown, SVG and stamp
together. The close-out gate runs `pnpm docs:check --strict`, so an epic cannot close
with an unrendered diagram.

## When to update

- **In the same tick** as a change to behaviour, commands, config, tables or the test
  setup. `.tick/config.md` → `## For implementers` makes this part of the definition of
  done.
- **At every epic close-out**, the living-docs audit passes over `docs/current/` against
  what the epic built: new commands, env vars, tables, failure modes appear; anything the
  epic made false is fixed; `_overview.md` and its date line are refreshed; diagrams are
  rendered and stamped.
- **At the increment checkpoint**, the completion report names any doc debt explicitly.
