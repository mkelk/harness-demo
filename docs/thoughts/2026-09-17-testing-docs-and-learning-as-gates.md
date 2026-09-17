# Testing, documentation and learning as gates

**Date:** 2026-09-17 · **Status:** thought, binding; the rules it argues for are in `.tick/config.md`

## The problem with "make sure it is tested and documented"

An agent-run repository does not have a person watching every commit. Anything that
lives only as an instruction ("write tests", "update the docs") is followed when the
instruction is in context and forgotten when it is not. The only rules that hold under
that pressure are rules a command can check. So the question for every rule in this repo
is: _which command fails when it is broken, and at which point in the run does that
command execute?_

## Testing

Five tiers, each with a venue. The venue is the decision the ticks engine actually needs:
can this tier run in an isolated worktree in parallel with its siblings, or does it touch
something shared?

| Tier                    | Venue       | Reason                                          |
| ----------------------- | ----------- | ----------------------------------------------- |
| unit, component, guards | in-worktree | pure, no shared resource                        |
| integration             | in-worktree | each test creates its own temp SQLite file      |
| e2e                     | post-merge  | binds port 3100 and writes a real database file |

The engine records this in `.tick/profile.md` at run start and routes accordingly:
implementers run the first four in their worktree before reporting `DONE`; the
orchestrator runs e2e on the merged tree before a wave closes. A tick that cannot name
its test cases is not ready; a wave whose merged tree is red does not close.

Coverage is a floor on `src/lib/**`, not a target, and it is never lowered inside a tick.

## Documentation

`docs/current/` is a deliverable of every tick that changes behaviour, and the epic
close-out audits it. Two things make that more than a wish:

- **A written spec** (`_documentation_principles.md`): audience tiers, the shape of a
  how-it-works page, the inventory rule, the prose rules. The audit checks against it.
- **`pnpm docs:check`**: every page listed, every how-page opening with a tagged
  diagram and carrying a key-entry-points table with real paths, every diagram's SVG
  stamped against its Mermaid. `--strict` at close-out means an epic cannot close with an
  unrendered diagram.

Diagrams are the one piece that stays a skill invocation rather than a binary, so the
division of labour is explicit: implementers write Mermaid, the orchestrator renders and
stamps at close-out.

## Learning at two cadences

**Inside an increment (intra).** Every epic ends with a retro (`ia-cycles/<epic>.md`):
harvest tick notes and concerns, promote each learning to exactly one home, compact
`.tick/learnings.md` under its 150-line cap, verify the definition of done outside-in,
review the diff for drift. The next epic's planning re-reads `learnings.md` fresh. The
loop is closed by the engine, not by memory.

**Between increments (inter).** The checkpoint writes `completion.md` (features, gates,
outstanding human items, postmortems) and the run appends to `project-history.md`. The
next `/dmtix start` reads both; its spec cites what the last increment taught. Roadmap
changes proposed in retros come back to the human at that point and nowhere else.

The two loops feed different files on purpose. Operational gotchas that every future
implementer needs go to `learnings.md` and stay short. Narrative that explains why the
repo looks the way it does goes to history and thoughts and can be long. Mixing them
makes the short file long and the long file unread.
