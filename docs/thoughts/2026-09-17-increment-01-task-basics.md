# Increment 01: Task basics

**Date:** 2026-09-17 · **Status:** spec, scoped as increment 01-rxx by `/dmtix start` · **Roadmap row:** `2026-09-17-product-roadmap.md` → 01

This is the source-of-truth spec every epic description in increment 01 names. It is
written for the run: an implementer sees one tick plus this page, so the exact values are
here, not in anyone's head.

## Goal

The user keeps a persistent list of tasks in the browser: add one, see the open ones,
tick one off, reopen it, edit its title and notes, delete it. Restarting the server
changes nothing. Nothing else.

## On screen

### `/` the task list

- An **add form** at the top: a `title` text input (placeholder "What needs doing?"),
  a `notes` textarea (optional), an "Add task" button. On success the form clears and the
  task appears at the top of the open list. On a validation error the form keeps the
  input and shows the message under the field.
- **Open tasks**, newest first (by `created_at` descending, then `id` descending). Each
  row: a checkbox (accessible name "Mark done: <title>"), the title, the first line of
  the notes in muted text if any, an "Edit" link to `/tasks/<id>/edit`, a "Delete"
  button (accessible name "Delete: <title>").
- A **Done** section below, most recently completed first (`done_at` descending). Each
  row: a checked checkbox (accessible name "Reopen: <title>"), the title struck through,
  a "Delete" button. The section is omitted when there are no done tasks.
- **Empty state** when there are no tasks at all: the text "No tasks yet. Add the first
  one above."
- Counts in the headings: "Open (3)", "Done (1)".

### `/tasks/<id>/edit`

- A form with `title` and `notes` prefilled, "Save" and a "Cancel" link back to `/`.
- Save with valid input redirects to `/` and the list shows the new values.
- A validation error re-renders the form with the message.
- An unknown id renders the Next.js 404 (`notFound()`).

### Validation (shown to the user, tested in `src/lib`)

| Field   | Rule                          | Message                                                                 |
| ------- | ----------------------------- | ----------------------------------------------------------------------- |
| `title` | trimmed, 1 to 200 characters  | "Title is required." (empty) / "Title must be 200 characters or fewer." |
| `notes` | trimmed, 0 to 2000 characters | "Notes must be 2000 characters or fewer."                               |

Invalid input is never persisted.

## Under the hood

### Persistence (`src/lib/db/`)

| File                       | Export                                                                    | Contract                                                                                                                                                                                                                |
| -------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open.ts`                  | `openDatabase(path: string): DatabaseSync`                                | opens (creates) the SQLite file with `node:sqlite`, sets `PRAGMA journal_mode = WAL` and `PRAGMA foreign_keys = ON`, creates the parent directory if missing, applies pending migrations, returns the handle            |
| `migrate.ts`               | `applyMigrations(db, migrations = MIGRATIONS)`, `MIGRATIONS: Migration[]` | `schema_migrations(version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL)`; each migration `{version, name, sql}` runs once inside a transaction, in ascending version order; re-running is a no-op |
| `migrations/0001_tasks.ts` | `migration0001`                                                           | the `tasks` table below                                                                                                                                                                                                 |
| `client.ts`                | `getDb(): DatabaseSync`                                                   | process-wide singleton for the app, path from `readEnv().databasePath`; only server code imports it                                                                                                                     |
| `test-db.ts`               | `createTestDb(): { db, path, close(): void }`                             | a migrated database in a fresh temp file (`os.tmpdir()`), `close()` closes and deletes the file and its `-wal`/`-shm` siblings                                                                                          |

Migrations are TypeScript modules exporting SQL strings (not `.sql` files) so that
`next build` bundles them without a file-system read at runtime.

### Table `tasks` (migration 0001)

| Column       | Type    | Constraint                                  | Meaning                                |
| ------------ | ------- | ------------------------------------------- | -------------------------------------- |
| `id`         | INTEGER | PRIMARY KEY AUTOINCREMENT                   |                                        |
| `title`      | TEXT    | NOT NULL, `length(title) BETWEEN 1 AND 200` | trimmed                                |
| `notes`      | TEXT    | NOT NULL DEFAULT ''                         | trimmed, up to 2000                    |
| `done_at`    | TEXT    | NULL                                        | ISO 8601 UTC when done, NULL when open |
| `created_at` | TEXT    | NOT NULL                                    | ISO 8601 UTC                           |
| `updated_at` | TEXT    | NOT NULL                                    | ISO 8601 UTC, set on every write       |

Index: `tasks_open_idx ON tasks(done_at, created_at DESC)`.

### Domain (`src/lib/tasks/`)

| File            | Export                                                                                                                                                                                                                                                          | Contract                                                                                                                                                                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `types.ts`      | `Task = { id: number; title: string; notes: string; doneAt: string \| null; createdAt: string; updatedAt: string }`, `TaskInput = { title: string; notes: string }`                                                                                             |                                                                                                                                                                                                                                                       |
| `validate.ts`   | `parseTaskInput(raw: { title?: unknown; notes?: unknown }): { ok: true; value: TaskInput } \| { ok: false; errors: { title?: string; notes?: string } }`                                                                                                        | the validation table above; non-string values are treated as empty strings                                                                                                                                                                            |
| `repository.ts` | `listTasks(db): { open: Task[]; done: Task[] }`, `getTask(db, id): Task \| null`, `createTask(db, input: TaskInput): Task`, `updateTask(db, id, input: TaskInput): Task \| null`, `setDone(db, id, done: boolean): Task \| null`, `deleteTask(db, id): boolean` | every function takes the `DatabaseSync` handle as its first argument so tests pass a temp database; `setDone(true)` on a done task and `setDone(false)` on an open task are no-ops that return the task; `updateTask` and `setDone` bump `updated_at` |

Ordering: `open` by `created_at DESC, id DESC`; `done` by `done_at DESC, id DESC`.

### App (`src/app/`)

| File                                                                                        | Contract                                                                                                                                                               |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `page.tsx`                                                                                  | server component; calls `listTasks(getDb())`; renders `AddTaskForm` and `TaskList`                                                                                     |
| `actions.ts`                                                                                | `"use server"`: `addTask(prev, formData)`, `toggleTask(formData)`, `removeTask(formData)`; each parses form data, calls one repository function, `revalidatePath("/")` |
| `tasks/[id]/edit/page.tsx`, `tasks/[id]/edit/actions.ts`                                    | the edit page and `saveTask(prev, formData)` which redirects to `/` on success                                                                                         |
| `components/add-task-form.tsx`, `components/task-list.tsx`, `components/edit-task-form.tsx` | client components using `useActionState` for the forms                                                                                                                 |

### Guards added

- `scripts/check-rules.test.ts`: fails if `process.env` appears in `src/**` outside
  `src/lib/env.ts`, or if `node:sqlite` is imported outside `src/lib/db/`.

### Documentation added (in the shape of `_documentation_principles.md`)

| Page                                           | Tier | Diagram id                                                              | Written in                            |
| ---------------------------------------------- | ---- | ----------------------------------------------------------------------- | ------------------------------------- |
| `how/persistence.md`                           | 2    | `persistence` (open → migrate → handle; test db lifecycle)              | epic 1                                |
| `data-model.md`                                | 3    | `data-model` (ER of `tasks` and `schema_migrations`)                    | epic 1                                |
| `how/tasks.md`                                 | 2    | `task-flow` (form → server action → validate → repository → revalidate) | epic 2                                |
| `setup.md`, `README.md`, `how/architecture.md` |      |                                                                         | updated where the epic changed a fact |

## Not included

| Deferred                           | Why                                                                    |
| ---------------------------------- | ---------------------------------------------------------------------- |
| Due dates, priority, lists, search | increment 02                                                           |
| Drag ordering                      | needs a position column and a client-side interaction model; not basic |
| Undo after delete                  | UX nicety, no new structure                                            |
| Pagination                         | a single-user list will not reach a size that needs it in this demo    |

## Epics

Partitioned by hard sequencing, not by feature: the domain and persistence layer must
exist before any page can be tested end to end, and the two pages share one records file
and one docs page, so they run as one warm-chain.

| Epic                     | Scope                                                                                               | Ticks (planned just in time by the run; this is the expected shape)                                                                                                                                             | Dep          |
| ------------------------ | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| 1 Persistence foundation | `src/lib/db/*`, `tasks` table, `src/lib/tasks/*`, guard test, `how/persistence.md`, `data-model.md` | wave 1: open + migrate + test db + migration 0001 + guard test + docs (solo; also discovers the worktree provisioning recipe). wave 2: repository (integration tests) ∥ validation (unit tests), disjoint files |              |
| 2 Task list              | `/` and `/tasks/<id>/edit`, server actions, components, e2e, `how/tasks.md`                         | one warm-chain: list + add → done/reopen/delete → edit                                                                                                                                                          | blocked by 1 |

## Definitions of done

### Epic 1 Persistence foundation

- `pnpm check` is green (A1) and `pnpm test:coverage` meets the floor on `src/lib/**` (A4).
- Integration tests in `src/lib/db/open.integration.test.ts` prove: opening a path in a
  fresh temp directory creates the file and its parent directory; after opening,
  `schema_migrations` holds version 1 and `tasks` exists with the six columns; opening
  the same path twice applies nothing new; `createTestDb().close()` removes the file.
- Integration tests in `src/lib/tasks/repository.integration.test.ts` prove, on a temp
  database: `listTasks` on an empty db returns `{open: [], done: []}`; `createTask`
  returns the row with `doneAt: null` and it appears first in `open`; ordering of `open`
  is newest first; `setDone(id, true)` moves a task to `done` with `doneAt` set, and
  `done` is ordered by `doneAt` descending; `setDone(id, false)` moves it back;
  `updateTask` changes title and notes and bumps `updatedAt`; `getTask` and `updateTask`
  return `null` for an unknown id; `deleteTask` returns `true` then `false`; a title of
  201 characters is rejected by the database constraint.
- Unit tests in `src/lib/tasks/validate.test.ts` cover: `"  Buy milk  "` → ok with
  `"Buy milk"`; `""` and `"   "` → `title: "Title is required."`; 201 chars → the length
  message; notes of 2001 chars → the notes message; `undefined` notes → `""`; a non-string
  title → treated as empty.
- `scripts/check-rules.test.ts` exists and passes.
- `docs/current/how/persistence.md` and `docs/current/data-model.md` exist, are listed
  in `_overview.md` and `README.md`, and `pnpm docs:check --strict` is green (A3) after
  the close-out render.

### Epic 2 Task list

- `pnpm check` is green (A1), `pnpm test:e2e` is green (A2), coverage floor holds (A4).
- `e2e/tasks.spec.ts` proves, each test on a fresh page state it creates itself: the
  empty state text on a fresh database; adding "Buy milk" shows it first under "Open (1)"
  and clears the form; submitting an empty title shows "Title is required." and adds
  nothing; ticking "Mark done: Buy milk" moves it under "Done (1)" struck through;
  "Reopen: Buy milk" moves it back; "Delete: Buy milk" removes it and the empty state
  returns; the edit page changes title to "Buy oat milk" and notes to "2 litres" and the
  list shows both; saving an empty title on the edit page shows the error and changes
  nothing; `/tasks/999999/edit` is a 404.
- `docs/current/how/tasks.md` exists with the `task-flow` diagram, is listed, and
  `pnpm docs:check --strict` is green (A3) after the close-out render.
- No `process.env` and no `node:sqlite` import outside their allowed files
  (`scripts/check-rules.test.ts` still passes).

## Blocked or human items

None. No secrets, no accounts, no services.

## Exit criteria for the increment

- [ ] A1 `pnpm check` green on the base branch
- [ ] A2 `pnpm test:e2e` green on the base branch
- [ ] A3 `pnpm docs:check --strict` green
- [ ] A4 `pnpm test:coverage` meets the floor
- [ ] `completion.md` written; human smoke test in the browser; merge to `main` by the human
