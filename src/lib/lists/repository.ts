import type { DatabaseSync } from "@/lib/db";
import type { List } from "./types";

type ListRow = {
  id: number;
  name: string;
  created_at: string;
  open_count: number;
};

function toList(row: ListRow): List {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    openCount: row.open_count,
  };
}

const SELECT_LIST = `
SELECT lists.id, lists.name, lists.created_at,
  (SELECT count(*) FROM tasks WHERE tasks.list_id = lists.id AND tasks.done_at IS NULL) AS open_count
FROM lists`;

/** Every list, by name case-insensitively, each with its open task count. */
export function listLists(db: DatabaseSync): List[] {
  const rows = db
    .prepare(`${SELECT_LIST} ORDER BY name COLLATE NOCASE ASC, id ASC`)
    .all() as unknown as ListRow[];
  return rows.map(toList);
}

/** A single list with its open count, or `null` when `id` does not exist. */
export function getList(db: DatabaseSync, id: number): List | null {
  const row = db.prepare(`${SELECT_LIST} WHERE lists.id = ?`).get(id) as
    ListRow | undefined;
  return row ? toList(row) : null;
}

/**
 * Inserts a list and returns it. A name that already exists throws the SQLite
 * UNIQUE error; callers test it with `isDuplicateListError`.
 */
export function createList(db: DatabaseSync, name: string): List {
  const result = db
    .prepare("INSERT INTO lists (name, created_at) VALUES (?, ?)")
    .run(name, new Date().toISOString());
  return getList(db, Number(result.lastInsertRowid)) as List;
}

/** True when `error` is the UNIQUE violation thrown by `createList`. */
export function isDuplicateListError(error: unknown): boolean {
  return (
    error instanceof Error &&
    /UNIQUE constraint failed: lists\.name/.test(error.message)
  );
}

/**
 * Deletes a list; `true` when a row was removed. The list's tasks are kept
 * with `list_id` set to NULL by the foreign key's `ON DELETE SET NULL`.
 */
export function deleteList(db: DatabaseSync, id: number): boolean {
  const result = db.prepare("DELETE FROM lists WHERE id = ?").run(id);
  return result.changes > 0;
}
