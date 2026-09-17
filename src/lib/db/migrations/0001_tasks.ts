import type { Migration } from "../migrate";

/** The `tasks` table; see docs/current/data-model.md. */
export const migration0001: Migration = {
  version: 1,
  name: "tasks",
  sql: `
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  notes TEXT NOT NULL DEFAULT '' CHECK (length(notes) <= 2000),
  done_at TEXT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX tasks_open_idx ON tasks(done_at, created_at DESC);
`,
};
