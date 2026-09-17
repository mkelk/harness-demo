---
name: dmtix
description: devmeta-on-ticks — Morten's delivery method on the synthesized ticks engine. Explicit user invocation with an argument; "bootstrap" installs the method into a project, "start" scopes a new increment, "go" starts or resumes the active increment's run. Not for general tk/tick work — the ticks skill owns that.
---

# dmtix — devmeta-on-ticks

Three doors, factored by cadence. **Dispatch on the argument; read ONLY the matching
reference and follow it exactly.** With no or an unknown argument, show this table and ask.

| Argument | Cadence | Door |
|---|---|---|
| `bootstrap` | once per project | `references/bootstrap.md` — install the method: verify the ticks skill resolves (user- or project-level), tk init, config lifecycle sections (additive), `.devmeta/` scaffold. Idempotent. |
| `start` (or `start-increment-spec`) | once per increment | `references/start-increment-spec.md` — interactive scoping (engine-drafted epic partition, human-ratified; goal-compatible DoDs), records tree, tk roadmap. Setup only. |
| `go` | per session | `references/go.md` — start **or resume** the run; thin wrapper over the ticks skill; stops at the project checkpoint. |

Principles (binding for all three doors):
- **Doors, not engines.** These files hold the interactive surface only. All process lives
  in the ticks skill and the tk structure — never add loop logic here.
- **Method vs state:** `.tick/config.md` is method (edited only to change how you work);
  per-increment facts resolve via `.devmeta/current-increment.md` and tick descriptions.
- Records land in `.devmeta/` (written by the run's lifecycle hooks); live state is tk
  (`tk roadmap`, `tk board`).

Source of truth for this skill: `github.com/mkelk/skills` → `skills/dmtix/`.
Install / update via `npx skills` (see the repo README).
