
## Purpose

The single "drive it" command. Works identically for a fresh start and a resume: the ticks
skill's re-entry is just re-invocation (stale-state recovery, worktree reconciliation, and
`tk next` routing are all inside the skill).

> **Anti-drift rule: this file must NEVER contain loop logic.** No wave handling, no retro
> steps, no recovery procedures. The skill owns the loop; six prose copies of the loop is
> the failure mode the old engine died of. If you feel the urge to add process here, it
> belongs in the ticks skill itself (wherever it lives — user or project level), not here.

## Step 1 — Pre-flight (sanity only; environment checks belong to the skill's profile)

1. **Adaptation present?** Detection contract from `/dmtix bootstrap`
   (skill, `.tick/`, config lifecycle headings, `.devmeta/`). Missing → point the user at
   `/dmtix bootstrap` and stop.
2. **Active increment?** `.devmeta/current-increment.md` names an increment whose project
   tick is open (`tk show <id>`). Placeholder or closed → point at
   `/dmtix start` and stop.
3. **Branch:** on the increment's branch per its `_overview.md` → "How to run" (never
   main/master). Wrong branch → switch (or ask if ambiguous).
4. **Engine base-branch field:** stamp the branch on the roadmap so the engine never
   assumes main — `tk update <id> --base-branch <branch>` for the project tick and each
   of its epics (idempotent; skip any already set).

## Step 2 — Hand over to the engine

Invoke the `ticks` skill (Skill tool — project-level resolves over user-level; fall back to
reading `SKILL.md` + references directly from `.claude/skills/ticks/` or
`~/.claude/skills/ticks/`, whichever exists) and execute with exactly this instruction:

> Run the roadmap of project `<project-id>` (the active increment per
> `.devmeta/current-increment.md`). Base branch: `<current branch>` — integration stops
> there; never merge to main/master. Follow the skill's loop exactly — project execution
> profile, worktree provisioning, constraint-surface partitioning, and per-wave
> dispatch-mode selection via the economic gate. Honor `.tick/config.md`'s lifecycle
> sections. Run continuously; stop at the project checkpoint.

That's the whole command. The run ends at the checkpoint with the completion report in the
increment directory; the user reviews, smoke-tests, and closes the project tick. The next
increment starts with `/dmtix start` — never automatically.
