# Project History

Narrative entries appended per epic close-out, oldest first.

## 2026-09-17 — Increment 01-rxx, epic 1 "Persistence foundation" closed

The first epic of the first increment gave the app its database: `src/lib/db` opens one SQLite
file through `node:sqlite`, applies numbered migrations inside transactions, and hands tests a
temp file of their own. The tasks domain (types, validation, repository) landed in a two-wide
parallel wave on top of a solo foundation tick. The frontier review found no blockers but two
tests that could not fail (timestamp ties) and a type import reaching through a test helper;
one repair tick fixed those before close. First learnings file written. Tag
`01-rxx.persistence-foundation`.

## 2026-09-17 — Increment 01-rxx, epic 2 "Task list" closed

The app became usable: a list page with an add form, done and reopen checkboxes, delete
buttons, and an edit page, all through Next.js server actions calling the repository from
epic 1. The three tickets ran as one warm-chain in a single worktree because they shared the
same files; the post-merge e2e gate caught a selector clash with Next's route announcer, and
the frontier review sent duplicated id parsing back into the validation module. Ten Playwright
tests cover every user path in the spec. Tag `01-rxx.task-list`. The increment now has no
further epics: the run stops at the project checkpoint.

## 2026-09-17 — Increment 01-rxx shipped

Checkpoint reviewed, `2026-09-17-increment-01` merged into `main`, project tick `m2h` closed.

## 2026-09-17 — Increment 02-ngm, epic 1 "Due dates and priority" closed

Tasks gained a due date and a priority; the open list is now ordered by due date, priority and
age, overdue tasks are marked, and a filter bar narrows the page by state or by a search word.
A solo domain tick set the contract, a two-tick chain built the shared form fields and the list
page, and the review sent back three real defects: unescaped `LIKE` wildcards, a misleading
empty state under the Open filter, and a doc table broken by `||`. Tag `02-ngm.due-dates-and-priority`.
