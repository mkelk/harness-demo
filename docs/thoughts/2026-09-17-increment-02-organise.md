# Increment 02: Organise

**Date:** 2026-09-17 · **Status:** spec, scoped as increment 02-ngm by `/dmtix start` · **Roadmap row:** `2026-09-17-product-roadmap.md` → 02 · **Builds on:** increment 01-rxx (`.devmeta/increments/increment-01-rxx/completion.md`)

Source of truth for every epic description in increment 02. Exact values live here.

## What increment 01 taught, applied here

From `completion.md` and the two retros:

- The forms will grow two fields; a shared `TaskFields` component is named up front so the
  add and edit forms stop duplicating markup (accepted debt from the epic 2 review).
- `parseTaskId` and `submittedValues` are part of the domain table now; new form fields get
  their parsers in `validate.ts` with unit tests, never in an action file.
- E2E stays serial per file on the per-run database, one file per feature, each file
  creating its own uniquely titled rows and never assuming an empty database (only
  `tasks.spec.ts` may, and it runs first alphabetically only by accident: do not rely on it).
- Timestamp and ordering tests use fake timers or explicit values and a discriminating case.
- Migrations are appended (`0002`, `0003`); the ledger and `data-model.md` change in the same tick.

## Goal

The user can give a task a due date and a priority, see what is overdue, put tasks into
lists, look at one list at a time, and narrow the list by state or by a search word.

## On screen

### Task fields (add form on `/`, edit form on `/tasks/<id>/edit`)

Both forms render the same `TaskFields` component:

| Field    | Control                                                                                                                         | Rule                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Title    | text input, label "Title"                                                                                                       | as increment 01                                                                    |
| Notes    | textarea, label "Notes"                                                                                                         | as increment 01                                                                    |
| Due      | `<input type="date">`, label "Due"                                                                                              | optional; a calendar date `YYYY-MM-DD`; message "Due must be a date (YYYY-MM-DD)." |
| Priority | `<select>`, label "Priority", options High (1), Normal (2), Low (3), default Normal                                             | required; message "Priority must be high, normal or low."                          |
| List     | `<select>`, label "List", options "No list" plus every list by name; default is the current list on a list page, else "No list" | optional; an existing list id; message "List does not exist."                      |

### The list page (`/` and `/lists/<id>`)

- A **sidebar** (nav, `aria-label="Lists"`): link "All tasks" to `/`, one link per list to
  `/lists/<id>` with the open count in parentheses, and a form "New list" with a text input
  labelled "List name" and a button "Create list".
- `/lists/<id>` is the same page scoped to that list: heading is the list name, the add form
  defaults List to it, and a "Delete list" button (accessible name "Delete list: <name>")
  removes the list and sends its tasks to "No list" (the tasks are kept), then redirects to `/`.
  Unknown id is a 404.
- **Each task row** shows, after the title: a priority badge ("High" or "Low"; Normal shows
  nothing), the due date as `Due 2026-09-30` when set, and the word "Overdue" (element with
  class `overdue`) when `due_on` is before today and the task is open. Rows on `/` also show
  the list name as a link when the task has one.
- **Filter bar** above the open list: links "Open", "Done", "All" (query `show=open|done|all`,
  default `open`; the current one has `aria-current="page"`), and a search form with an input
  labelled "Search" and a button "Search" (query `q`). Show `done` renders only the Done
  section; `all` renders both; `open` renders only Open. `q` filters both sections by
  case-insensitive substring of the title. The heading counts reflect the filtered rows.
- **Ordering of open tasks** changes to: due date ascending with undated last, then priority
  (High, Normal, Low), then newest first. Done tasks stay by `done_at` descending.

### Validation messages summary

| Field     | Message                                                                                                          |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| title     | as increment 01                                                                                                  |
| notes     | as increment 01                                                                                                  |
| due       | "Due must be a date (YYYY-MM-DD)."                                                                               |
| priority  | "Priority must be high, normal or low."                                                                          |
| list      | "List does not exist."                                                                                           |
| list name | "List name is required." / "List name must be 60 characters or fewer." / "A list with that name already exists." |

## Under the hood

### Migration 0002 `task_schedule` (epic 1)

```sql
ALTER TABLE tasks ADD COLUMN due_on TEXT NULL;            -- YYYY-MM-DD or NULL
ALTER TABLE tasks ADD COLUMN priority INTEGER NOT NULL DEFAULT 2 CHECK (priority IN (1, 2, 3));
CREATE INDEX tasks_due_idx ON tasks(done_at, due_on, priority);
```

### Migration 0003 `lists` (epic 2)

```sql
CREATE TABLE lists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE CHECK (length(name) BETWEEN 1 AND 60),
  created_at TEXT NOT NULL
);
ALTER TABLE tasks ADD COLUMN list_id INTEGER NULL REFERENCES lists(id) ON DELETE SET NULL;
CREATE INDEX tasks_list_idx ON tasks(list_id);
```

`PRAGMA foreign_keys = ON` is already set on open, so `ON DELETE SET NULL` is enforced.

### Domain (`src/lib/tasks/`, `src/lib/lists/`)

| File                  | Export                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Contract                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `tasks/types.ts`      | `Task` gains `dueOn: string \| null`, `priority: 1 \| 2 \| 3`, `listId: number \| null`; `TaskInput` gains `dueOn: string \| null`, `priority: Priority`, `listId: number \| null`; `Priority = 1 \| 2 \| 3`                                                                                                                                                                                                                                                                                                                                         | epic 1 adds `dueOn` and `priority`; epic 2 adds `listId`                          |
| `tasks/validate.ts`   | `parseTaskInput` handles the new fields: `dueOn` empty → null, else must match `^\d{4}-\d{2}-\d{2}$` and be a real date (`new Date(v + "T00:00:00Z")` round-trips); `priority` "1"/"2"/"3" (or number) else error; `listId` empty → null, else `parseTaskId` semantics with message "List does not exist." when the id is not in the provided `listIds: number[]` option. New exports: `parseDueOn`, `parsePriority`, `PRIORITY_LABELS = {1: "High", 2: "Normal", 3: "Low"}`. `parseTaskInput(raw, { listIds })` gets an options argument in epic 2. |                                                                                   |
| `tasks/repository.ts` | `listTasks(db, filter?: { show?: "open" \| "done" \| "all"; q?: string; listId?: number \| null })` returns `{ open, done }` filtered; open ordering `due_on IS NULL, due_on ASC, priority ASC, created_at DESC, id DESC`; `createTask`/`updateTask` persist the new fields; `isOverdue(task, today: string): boolean` pure helper                                                                                                                                                                                                                   | epic 1: ordering, dueOn, priority, `show`/`q`; epic 2: `listId` filter and column |
| `lists/types.ts`      | `List = { id: number; name: string; createdAt: string; openCount: number }`                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | epic 2                                                                            |
| `lists/validate.ts`   | `parseListName(raw: unknown): { ok: true; value: string } \| { ok: false; error: string }`                                                                                                                                                                                                                                                                                                                                                                                                                                                           | epic 2                                                                            |
| `lists/repository.ts` | `listLists(db): List[]` (name ascending, with open counts), `getList(db, id): List \| null`, `createList(db, name): List` (throws on duplicate; the action maps it to the message), `deleteList(db, id): boolean`                                                                                                                                                                                                                                                                                                                                    | epic 2                                                                            |

Today's date for "overdue" is computed once per request in the page (`new Date().toISOString().slice(0, 10)`) and passed down; the repository never reads the clock for ordering.

### App (`src/app/`)

| File                                       | Contract                                                                                                         |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `components/task-fields.tsx`               | `TaskFields({ values, errors, lists, defaultListId })`: the five labelled controls; used by both forms           |
| `components/task-list.tsx`                 | badges, due, overdue, list link                                                                                  |
| `components/filter-bar.tsx`                | the three links and the search form; preserves the current list scope                                            |
| `components/lists-nav.tsx`                 | sidebar with links, counts and the New list form (client component using `useActionState(createListAction, {})`) |
| `page.tsx`                                 | reads `searchParams` (`show`, `q`), passes filter to `listTasks`; renders sidebar, filter bar, forms and lists   |
| `lists/[id]/page.tsx`                      | same, scoped with `listId`; 404 for unknown id                                                                   |
| `lists/actions.ts`                         | `createListAction(prev, formData)`, `deleteListAction(formData)` (redirects to `/`)                              |
| `actions.ts`, `tasks/[id]/edit/actions.ts` | parse the new fields; `addTask` takes the current list id from a hidden input                                    |

### Documentation added

| Page                                                               | Tier | Diagram id                                                   | Written in                   |
| ------------------------------------------------------------------ | ---- | ------------------------------------------------------------ | ---------------------------- |
| `how/scheduling.md` (due dates, priority, overdue, ordering)       | 2    | `scheduling` (the ordering decision: due, priority, created) | epic 1                       |
| `how/lists.md` (lists, the sidebar, scoping, filtering and search) | 2    | `lists-and-filters` (URL → filter → repository → sections)   | epic 2                       |
| `data-model.md`                                                    | 3    | `data-model` updated (new columns, `lists`, the relation)    | epic 1 columns, epic 2 table |
| `how/tasks.md`, `setup.md`, `README.md`                            |      |                                                              | updated where facts change   |

## Not included

| Deferred                                             | Why                                                          |
| ---------------------------------------------------- | ------------------------------------------------------------ |
| Today / upcoming views, recurrence, keyboard capture | increment 03 (roadmap)                                       |
| Renaming a list                                      | one more form for no new structure; deferred to 03 if wanted |
| Sorting controls in the UI                           | ordering is fixed by the rules above                         |
| Full-text search                                     | substring on the title is enough at this size                |

## Epics

| Epic                     | Scope                                                                                                                                                            | Expected shape                                                                                                                                                      | Dep          |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| 1 Due dates and priority | migration 0002, domain fields, ordering, `show`/`q` filtering in the repository, `TaskFields`, badges, overdue, filter bar, `how/scheduling.md`, `data-model.md` | wave 1: domain tick (migration, types, validate, repository, tests, data-model). wave 2: warm-chain (TaskFields + forms → list rendering + filter bar + e2e + docs) |              |
| 2 Lists and filtering    | migration 0003, lists domain, sidebar, list pages, list select in forms, delete list, `how/lists.md`                                                             | wave 1: domain tick. wave 2: warm-chain (sidebar + create/delete → scoping + selects + e2e + docs)                                                                  | blocked by 1 |

## Definitions of done

### Epic 1 Due dates and priority

- A1, A3 (after close-out render), A4 green.
- Integration tests prove: migration 0002 applies on a fresh db and on a db that already had
  0001 (ledger holds 1 and 2); `createTask` stores `dueOn` and `priority` and defaults priority
  to 2 when given 2; `listTasks().open` orders `[due 2026-01-01 normal, due 2026-01-02 high,
undated high, undated normal newest, undated normal older]` for that input set; `show: "done"`
  returns no open rows; `q: "milk"` matches "Buy MILK" and not "Bread"; `isOverdue` is true for
  an open task due yesterday, false for today, false for a done task due yesterday.
- Unit tests prove the due and priority rules and messages, including `2026-02-30` rejected.
- `e2e/scheduling.spec.ts` (serial, its own titles, never assumes an empty db) proves: adding a
  task with Due `2000-01-01` and Priority High shows the row first with "High" and "Overdue";
  editing it to Low and no due date removes both marks; the "Done" filter shows only the Done
  section; searching "zzqx" shows "Open (0)".
- `how/scheduling.md` exists with the `scheduling` diagram; `data-model.md` shows the two
  columns and migration 0002 in the ledger; both listed.

### Epic 2 Lists and filtering

- A1, A2, A3, A4 green.
- Integration tests prove: migration 0003; `createList` then `listLists` returns it with
  `openCount`; duplicate name throws; `deleteList` sets the tasks' `listId` to null and keeps
  them; `listTasks({ listId })` returns only that list's tasks; `listTasks({ listId: null })`
  returns unlisted tasks only? No: `listId: undefined` means all, `listId: <n>` means that
  list; `null` is not a filter value. `parseTaskInput` rejects a `listId` not in `listIds`.
- `e2e/lists.spec.ts` (serial, own titles) proves: creating list "Groceries" shows it in the
  sidebar with "(0)"; adding a task on `/lists/<id>` shows it there with the sidebar count "(1)"
  and on `/` with the list link; moving it via the edit form to "No list" updates both;
  deleting the list returns to `/`, the task remains, the sidebar no longer shows the list;
  `/lists/999999` is a 404; a duplicate list name shows "A list with that name already exists."
- `how/lists.md` exists with the `lists-and-filters` diagram; `data-model.md` shows `lists`
  and the relation; both listed.

## Blocked or human items

None.

## Exit criteria for the increment

- [ ] A1 `pnpm check`, A2 `pnpm test:e2e` (three spec files), A3 `pnpm docs:check --strict`, A4 coverage floor
- [ ] `completion.md` written; human smoke test; merge to `main` by the human
