
## Purpose

One-time-per-project installer of the devmeta method on top of the synthesized ticks engine.
Safe to re-run anytime: on a healthy project it prints an all-green checklist and changes
nothing. **Additive only — existing files and existing config sections are never modified.**

## Detection contract (used here and by /dmtix start and /dmtix go)

The devmeta adaptation is PRESENT when all four hold:
1. The synthesized ticks skill is resolvable: `SKILL.md` at **project level**
   (`.claude/skills/ticks/`) or **user level** (`~/.claude/skills/ticks/`).
   Project level takes precedence when both exist.
2. `.tick/` exists (tracker initialized)
3. `.tick/config.md` contains BOTH headings `## At epic close-out` and `## At project checkpoint`
4. `.devmeta/` exists (records tree)

## Steps (all idempotent)

### 1. Pre-flight
- Confirm this is a git repo (stop and tell the user if not).
- `tk` on PATH and modern: `tk create --help` must list `--role` (needs ≥ 0.19). If not,
  tell the user to upgrade (`tk upgrade`) and stop.

### 2. Tracker
- If `.tick/` missing: `tk init`.
- If `git check-ignore .tick/` matches: report which ignore file and ask before removing the
  rule (the tracker must be committed to work across sessions/machines).

### 3. Skill (detect at both levels; this command never fetches or installs the skill)
- Resolve in order: project `.claude/skills/ticks/SKILL.md`, then user
  `~/.claude/skills/ticks/SKILL.md`.
- **Project level found → pinned mode.** Report it (include `PROVENANCE.md` contents if
  present so the user can see how old the pin is). Leave untouched — upgrades are deliberate.
- **User level only → shared mode (the default; nothing to do).** Report it. If the user
  explicitly wants this project *pinned* to today's skill version, offer to vendor:
  `cp -r ~/.claude/skills/ticks .claude/skills/ticks` and write
  `.claude/skills/ticks/PROVENANCE.md`: `Vendored from user-level skill on <date>`
  (carry over any version marker the user-level copy contains). Do not vendor unless asked.
- **Neither → stop** and tell the user: install the synthesized ticks skill once at user
  level (`~/.claude/skills/ticks/`) or vendor a copy into this project
  (`.claude/skills/ticks/`), then re-run this command. Install sources:
  - **Morten's fork (preferred for now):** `npx skills add mkelk/ticks-melk -g -a claude-code`
    (https://github.com/mkelk/ticks-melk)
  - **Peter's original:** `npx skills add pengelbrecht/ticks -g -a claude-code`
    (https://github.com/pengelbrecht/ticks)

### 4. Config (create whole, or inject missing sections only)
- If `.tick/config.md` is missing: write the full template below.
- If it exists: grep for the template's lifecycle headings (`## At run start`,
  `## At epic close-out`, `## At project checkpoint`). Append ONLY the missing section(s) at
  the end of the file, verbatim from the template. Never edit or reorder existing content.
- If a section exists but visibly differs from the template's intent (e.g. a hand-rolled
  `At epic close-out` writing elsewhere): do NOT touch it — show the user the diff against
  the template and let them decide.

**Config template (method only — contains no per-increment state):**

```markdown
# Runner config — standing method contract (devmeta adaptation)

## For implementers
- Your tick description names the source-of-truth spec. Do not add scope beyond it.
- Follow CLAUDE.md / AGENTS.md and existing code patterns.

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
4. Living-docs audit: fix any doc the epic proved wrong.
5. Tag: `git tag <ID>.<epic-slug> -m "<summary>"`.

## At project checkpoint
Same resolution as above. Then:
1. Write the increment completion report to `<DIR>/completion.md`
   (features, gates status, outstanding human items, postmortems).
2. Integration stops at the increment's base branch: never merge it to `main`/`master` —
   shipping the increment is the human's decision at this checkpoint.
3. STOP for human review.
```

*(Deliberately no `Testing` section — the engine's execution profile infers test facts
from the repo. `At run start` carries only the branch guard: method policy is exactly the
kind of fact the repo cannot reveal, which is what these sections are for.)*

### 5. Records scaffold (create-if-missing)
- `.devmeta/increments/` (directory)
- `.devmeta/project-history.md` — header only:
  `# Project History` + one line: narrative entries appended per epic close-out.
- `.devmeta/current-increment.md` — placeholder:
  `# Current Increment` / `**Active:** none — run /dmtix start`.

### 6. Report

Print a checklist of the four detection items with created/already-present/needs-attention
per item, plus skill provenance. If anything was created, offer to commit it:
`chore(dmtix): bootstrap devmeta adaptation (skill, config sections, records scaffold)`.

**Do not start an increment or a run.** Next steps for the user:
`/dmtix start` to scope work, `/dmtix go` to run it.
