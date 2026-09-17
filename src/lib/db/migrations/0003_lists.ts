import type { Migration } from "../migrate";

/**
 * The `lists` table and `tasks.list_id`; see docs/current/data-model.md.
 * `ON DELETE SET NULL` is enforced because open.ts sets
 * `PRAGMA foreign_keys = ON`.
 */
export const migration0003: Migration = {
  version: 3,
  name: "lists",
  sql: `
CREATE TABLE lists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE CHECK (length(name) BETWEEN 1 AND 60),
  created_at TEXT NOT NULL
);
ALTER TABLE tasks ADD COLUMN list_id INTEGER NULL REFERENCES lists(id) ON DELETE SET NULL;
CREATE INDEX tasks_list_idx ON tasks(list_id);
`,
};
