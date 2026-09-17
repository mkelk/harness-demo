# Product shape and roadmap

**Date:** 2026-09-17 · **Status:** thought, the roadmap /dmtix start draws increments from

## The product in one paragraph

A single-user task manager in the browser. Tasks have a title, notes, a done state, and
later a due date, a priority and a list they belong to. The user sees a list, adds to it,
ticks things off, edits, deletes, and later filters and organises. One SQLite file, no
accounts, no sync. It should feel finished at the end of every increment.

## Roadmap

Each row is one increment: one base branch, one `_overview.md`, one checkpoint, one merge
to `main`. Increments 01 and 02 are built in this repo; 03 and 04 are written down so
the roadmap shows where the product would go and what was deliberately left out.

| Increment | Title       | Goal (what the user can do afterwards)                                                          | Epics (rough)                                                                                                                  | Status                                                                      |
| --------- | ----------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| 01        | Task basics | Keep a persistent list of tasks: add, see, complete, reopen, edit, delete                       | (1) Persistence foundation: SQLite, migrations, `tasks` table, repository, test db. (2) Task list: pages, server actions, e2e. | shipped 2026-09-17 as 01-rxx, spec `2026-09-17-increment-01-task-basics.md` |
| 02        | Organise    | Give tasks a due date and a priority, group them into lists, and find them by filter and search | (1) Due dates and priority. (2) Lists and filtering.                                                                           | planned after 01 closes                                                     |
| 03        | Focus       | Work from a Today view with keyboard-first capture and recurring tasks                          | (1) Today and upcoming views. (2) Keyboard capture and recurrence.                                                             | roadmap only                                                                |
| 04        | Share       | Several people on one instance                                                                  | accounts, per-user lists, invitations                                                                                          | not planned; out of scope for a demo                                        |

## Constraints that hold across increments

- **Stack stays put**: Next.js App Router, React server components and server actions,
  `node:sqlite`, Tailwind. No ORM, no client state library. Adding a dependency is a
  foundation-tick decision, never a mid-wave one.
- **One SQLite file** at `DATABASE_PATH`; numbered SQL migrations applied on open.
- **Every increment ships green** on `pnpm check` and `pnpm test:e2e`, with
  `docs/current/` updated, before it is merged.
- **Scope never shrinks inside a run.** If an increment turns out too big, the human
  rescopes at the checkpoint and the next spec says why.

## Explicitly out of scope, with reasons

| Deferred                   | Why                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------ |
| Authentication, multi-user | Adds infrastructure and secrets handling without adding anything the method needs to demonstrate |
| Deployment                 | Same: the demo is about building, not running in production                                      |
| Offline or sync            | A second store would double the persistence surface for no method gain                           |
| Attachments, comments      | Feature depth without new structure                                                              |
