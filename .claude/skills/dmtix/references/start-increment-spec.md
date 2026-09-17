
## Context

- Determine today's date with `date +%Y-%m-%d`.
- The increment title may be passed as the skill argument after `start`
  (e.g. `/dmtix start "Quotes v2"`); otherwise ask for it in the dialogue.

## Purpose

Interactive setup of a new increment for the synthesized ticks engine. This command is a
**door, not an engine**: it interviews the human, writes the record artifacts, creates the
tk roadmap — then STOPS. It never plans epic internals (the run details epics just-in-time)
and never starts execution (`/dmtix go` does that).

## Step 0 — Adaptation check

Run the detection contract from `/dmtix bootstrap` (skill present, `.tick/`
present, config has both lifecycle headings, `.devmeta/` present). If anything is missing,
tell the user what, confirm, and follow `references/bootstrap.md` (the bootstrap door of
this same skill) before continuing. Do not duplicate its logic here.

## Step 1 — Increment id

Read `.devmeta/current-increment.md`. Parse the active line's leading integer (0 if
placeholder), add 1 → `<NN>`. Generate a 3-letter random suffix `<xxx>` from [a-z]
(collision-proofing for parallel branches). Increment id = `<NN>-<xxx>`; directory =
`.devmeta/increments/increment-<NN>-<xxx>/`.

## Step 2 — Interactive scope dialogue

Work through these with the user (AskUserQuestion for the multiple-choice ones), updating a
draft as answers land:

1. **Goal** — what can the user do afterwards that they couldn't before?
2. **On-screen deliverables** — what visibly changes?
3. **Under-the-hood deliverables** — schema, services, infrastructure.
4. **Exclusions** — explicitly out of scope, with reasons.
5. **Deliverable inventory** — enumerate every deliverable from 2–3, each with a seed of
   checkable acceptance (these feed the DoDs in step 7).
6. **Epic partition — engine drafts, human ratifies.** Do NOT ask the user to invent the
   split. Propose it yourself (this is frontier-judgment work), applying the partitioning
   doctrine lifted to epic level:
   - Epics are units of **hard sequencing** and **record/checkpoint cadence** — never
     feature taxonomy. One retro, one ia-cycle report, one history entry per epic: cut
     where the user wants a narrative boundary or where sequencing genuinely forces one.
   - **Independent deliverables that could run concurrently belong INSIDE one epic** as a
     parallel wave — sibling epics serialize (the benchmark's hardest-won lesson). Split
     them into separate epics only if the user wants a record boundary between them.
   - Genuine hard dependencies (incl. predictable schema/layering order) justify separate
     `--blocked-by` epics; mere preference is `--after`.
   - Typically 2–5 epics, rough scope only; more scope-uncertainty → rougher and fewer
     (just-in-time detailing keeps late epics cheap to rescope).
   Present the draft WITH rationale (groupings, why, expected within-epic parallelism);
   the user adjusts and ratifies. The roadmap level remains a human decision — informed,
   not delegated away. Note to the user that the engine may propose roadmap adjustments
   in its retros; those come back to them, never executed unilaterally.
7. **Definition of done per ratified epic.** Push each DoD until it is:
   - *checkable* — runnable commands / observable behavior, never "works well"
   - *bounded* — names what is in scope and stops
   - *outside-in* — user-visible behavior, not implementation detail
   Items needing human taste go behind an `--awaiting` gate instead of into the DoD.
   The DoDs are what make the run safe to walk away from — don't rush this.
8. **Blocked / human items** — API keys, accounts, decisions.
9. **Exit criteria** — the increment's verification gates (test/build/migration/smoke).

## Step 3 — Write the records tree

Create the increment directory with `ia-cycles/.gitkeep` and `_overview.md`:

```markdown
# Increment <NN>-<xxx> — <Title>

**Status:** NOT STARTED · **Target:** <date or —>
**Engine:** synthesized ticks skill (project-level if vendored — see its PROVENANCE.md — else user-level)

## Goal
<goal>

## Produces
### On screen
<list>
### Under the hood
<list>

## Not included
| Deferred | Why |
|---|---|

## Roadmap (tk)
Project `<id>` — the checkpoint boundary; the run stops there for human review.
| Epic | tk id | Scope | Dep |
|---|---|---|---|

## Definitions of done
### <Epic 1>
<DoD>

## Exit criteria (verification gates)
- [ ] <from dialogue>

## How to run
`/dmtix go` on branch `<branch>` (required services up). Resume: `/dmtix go` again.
```

## Step 4 — Update the resolution anchor

Rewrite `.devmeta/current-increment.md`:

```markdown
# Current Increment
**Active:** Increment <NN>-<xxx> — <Title>
**Overview:** `.devmeta/increments/increment-<NN>-<xxx>/_overview.md`
**Roadmap (tk):** project `<id>` → <epic ids>
**Status:** NOT STARTED
```

This file is what the config lifecycle sections resolve at close-out — it MUST be accurate.

## Step 5 — Create the tk roadmap

```bash
P=$(tk create "<Title>" -d "<goal>. Overview: .devmeta/increments/increment-<NN>-<xxx>/_overview.md" [--target-date YYYY-MM-DD])
E1=$(tk create "<Epic 1>" -t epic --parent $P -d "<rough scope. Source of truth: <spec path or overview section>>" --acceptance "<DoD 1>")
E2=$(tk create "<Epic 2>" -t epic --parent $P --blocked-by $E1 -d "..." --acceptance "<DoD 2>")
# --after for soft ordering
```

Rules:
- **No child ticks for any epic** — just-in-time planning is the engine's job.
- **No process ticks** — the skill's EPIC-SKELETON pre-flight creates them.
- **Every epic description names its source-of-truth spec** — this convention is what lets
  config stay state-free.
- Fill the roadmap table in `_overview.md` with the real tk ids.

## Step 6 — Base branch

Ask the user (the one legitimate question): use the current branch, or create
`YYYY-MM-DD-<slug>` from it? Never main/master. Record the choice in `_overview.md` →
"How to run", and stamp it on the roadmap so the engine never assumes main:
`tk update <id> --base-branch <branch>` for the project tick and each epic.

## Step 7 — Commit and stop

Commit `.devmeta/` + `.tick/` as
`increment(<NN>-<xxx>): setup — records tree + roadmap`. Then report:

```
## Increment <NN>-<xxx> ready
Overview: <path> · Project: <tk id> · Epics: <tk ids>
Run it: /dmtix go   (on branch <branch>, services up)
```

**Do NOT start executing. Do NOT plan epic internals.** Setup ends here — increment start
is a human decision, made by invoking /dmtix go.
