# Why this repo exists

**Date:** 2026-09-17 · **Status:** thought, binding for the shape of the repo

## The question

What does a repository look like when it is built, end to end, with the dmtix method
(the devmeta increment discipline running on the ticks engine)? Not a description of the
method: a finished, small, readable example that someone can clone, read top to bottom,
and copy the shape of.

## The answer this repo gives

A task manager is the smallest product with enough surface to need real structure:
persistence, a data model that grows, forms, validation, listing rules, and enough
features to fill more than one increment. It is also boring on purpose. Nobody has to
learn the domain, so all the attention goes to _how_ it was built.

The repo therefore shows, in one place:

- **The method installed**: `.tick/config.md` as the standing contract, `.devmeta/` as
  the records tree, `tk` as the live state.
- **The rhythm**: `/dmtix start` scopes an increment into a roadmap of epics with
  goal-compatible definitions of done; `/dmtix go` runs it wave by wave and stops at the
  checkpoint; a human merges to `main`.
- **Gates that are commands, not opinions**: test tiers with venues (in-worktree or
  post-merge), a docs shape check, diagram stamps, acceptance evidence mapped to exact
  commands.
- **Learning loops at two cadences**: inside an increment (`.tick/learnings.md`, epic
  retros in `ia-cycles/`) and between increments (`project-history.md`, `completion.md`,
  the next increment's spec citing the last one's postmortem).
- **Documentation as a deliverable**: `docs/current/` with a written spec, tiered by
  audience, diagrams first, updated in the same tick as the code.

## What this repo is not

- Not a product. There is no auth, no deployment, no multi-user story. Those would add
  surface without adding method.
- Not a benchmark. Wave widths here are small; the point is the shape of a run, not its
  throughput.
- Not the method's source. The method lives in `github.com/mkelk/skills` (dmtix) and
  `github.com/mkelk/ticks-melk` (the engine). This repo is one consumer of both.

## How to read it

1. `README.md`: the app and the method, in that order.
2. `docs/current/`: the app as it is now.
3. `.devmeta/increments/*/_overview.md`: what each increment set out to do, then its
   `ia-cycles/` for how each epic went and `completion.md` for how the increment ended.
4. `.devmeta/project-history.md`: the narrative, oldest first.
5. `git log --first-parent main`: one merge per increment, tags per epic close.
