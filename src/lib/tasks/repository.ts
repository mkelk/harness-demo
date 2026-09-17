import type { DatabaseSync } from "@/lib/db";
import type { Task, TaskInput } from "./types";

type TaskRow = {
  id: number;
  title: string;
  notes: string;
  done_at: string | null;
  created_at: string;
  updated_at: string;
};

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    doneAt: row.done_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Open tasks (newest first) and done tasks (most recently done first). */
export function listTasks(db: DatabaseSync): { open: Task[]; done: Task[] } {
  const open = db
    .prepare(
      "SELECT * FROM tasks WHERE done_at IS NULL ORDER BY created_at DESC, id DESC",
    )
    .all() as unknown as TaskRow[];
  const done = db
    .prepare(
      "SELECT * FROM tasks WHERE done_at IS NOT NULL ORDER BY done_at DESC, id DESC",
    )
    .all() as unknown as TaskRow[];
  return { open: open.map(toTask), done: done.map(toTask) };
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
      "INSERT INTO tasks (title, notes, done_at, created_at, updated_at) VALUES (?, ?, NULL, ?, ?)",
    )
    .run(input.title, input.notes, now, now);
  const row = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(result.lastInsertRowid) as TaskRow;
  return toTask(row);
}

/** Updates title and notes, bumping `updatedAt`; `null` for an unknown id. */
export function updateTask(
  db: DatabaseSync,
  id: number,
  input: TaskInput,
): Task | null {
  const now = new Date().toISOString();
  const result = db
    .prepare(
      "UPDATE tasks SET title = ?, notes = ?, updated_at = ? WHERE id = ?",
    )
    .run(input.title, input.notes, now, id);
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
