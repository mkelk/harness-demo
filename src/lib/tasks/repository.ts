import type { DatabaseSync } from "@/lib/db";
import type { Priority, Task, TaskInput } from "./types";

type TaskRow = {
  id: number;
  title: string;
  notes: string;
  due_on: string | null;
  priority: Priority;
  done_at: string | null;
  created_at: string;
  updated_at: string;
};

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    dueOn: row.due_on,
    priority: row.priority,
    doneAt: row.done_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * What `listTasks` returns: `show` picks the lists (`"open"`, the default,
 * leaves `done` empty; `"done"` leaves `open` empty; `"all"` fills both);
 * `q`, trimmed and non-empty, keeps only titles containing it, case-insensitive.
 */
export type ListFilter = { show?: "open" | "done" | "all"; q?: string };

/** Open ordering: dated first by due date, then priority, then newest. */
const OPEN_ORDER =
  "ORDER BY (due_on IS NULL) ASC, due_on ASC, priority ASC, created_at DESC, id DESC";
const DONE_ORDER = "ORDER BY done_at DESC, id DESC";

function selectTasks(
  db: DatabaseSync,
  doneClause: string,
  order: string,
  q: string,
): Task[] {
  const search =
    q.length > 0 ? " AND lower(title) LIKE '%' || lower(?) || '%'" : "";
  const statement = db.prepare(
    `SELECT * FROM tasks WHERE ${doneClause}${search} ${order}`,
  );
  const rows = (q.length > 0
    ? statement.all(q)
    : statement.all()) as unknown as TaskRow[];
  return rows.map(toTask);
}

/**
 * Open tasks (due date ascending with undated last, then priority High to Low,
 * then newest first) and done tasks (most recently done first), filtered.
 */
export function listTasks(
  db: DatabaseSync,
  filter: ListFilter = {},
): { open: Task[]; done: Task[] } {
  const show = filter.show ?? "open";
  const q = (filter.q ?? "").trim();
  const open =
    show === "done" ? [] : selectTasks(db, "done_at IS NULL", OPEN_ORDER, q);
  const done =
    show === "open"
      ? []
      : selectTasks(db, "done_at IS NOT NULL", DONE_ORDER, q);
  return { open, done };
}

/**
 * True when the task is open, dated and its due date is before `today`
 * (both `YYYY-MM-DD`, compared as strings). The caller supplies `today`;
 * the repository never reads the clock for this.
 */
export function isOverdue(
  task: Pick<Task, "dueOn" | "doneAt">,
  today: string,
): boolean {
  return task.doneAt === null && task.dueOn !== null && task.dueOn < today;
}

/** A single task, or `null` when `id` does not exist. */
export function getTask(db: DatabaseSync, id: number): Task | null {
  const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as
    TaskRow | undefined;
  return row ? toTask(row) : null;
}

/** Inserts a new open task and returns the stored row. */
export function createTask(db: DatabaseSync, input: TaskInput): Task {
  const now = new Date().toISOString();
  const result = db
    .prepare(
      "INSERT INTO tasks (title, notes, due_on, priority, done_at, created_at, updated_at) VALUES (?, ?, ?, ?, NULL, ?, ?)",
    )
    .run(input.title, input.notes, input.dueOn, input.priority, now, now);
  const row = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(result.lastInsertRowid) as TaskRow;
  return toTask(row);
}

/** Updates the input fields, bumping `updatedAt`; `null` for an unknown id. */
export function updateTask(
  db: DatabaseSync,
  id: number,
  input: TaskInput,
): Task | null {
  const now = new Date().toISOString();
  const result = db
    .prepare(
      "UPDATE tasks SET title = ?, notes = ?, due_on = ?, priority = ?, updated_at = ? WHERE id = ?",
    )
    .run(input.title, input.notes, input.dueOn, input.priority, now, id);
  if (result.changes === 0) return null;
  return getTask(db, id);
}

/**
 * Sets or clears `doneAt`. A no-op (other than the read) when the task is
 * already in the requested state; bumps `updatedAt` only when it changes.
 * `null` for an unknown id.
 */
export function setDone(
  db: DatabaseSync,
  id: number,
  done: boolean,
): Task | null {
  const existing = getTask(db, id);
  if (!existing) return null;
  const isDone = existing.doneAt !== null;
  if (isDone === done) return existing;
  const now = new Date().toISOString();
  db.prepare("UPDATE tasks SET done_at = ?, updated_at = ? WHERE id = ?").run(
    done ? now : null,
    now,
    id,
  );
  return getTask(db, id);
}

/** Deletes a task; `true` when a row was removed. */
export function deleteTask(db: DatabaseSync, id: number): boolean {
  const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  return result.changes > 0;
}
