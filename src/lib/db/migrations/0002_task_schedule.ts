import type { Migration } from "../migrate";

/** Due date and priority on `tasks`; see docs/current/data-model.md. */
export const migration0002: Migration = {
  version: 2,
  name: "task_schedule",
  sql: `
ALTER TABLE tasks ADD COLUMN due_on TEXT NULL;
ALTER TABLE tasks ADD COLUMN priority INTEGER NOT NULL DEFAULT 2 CHECK (priority IN (1, 2, 3));
CREATE INDEX tasks_due_idx ON tasks(done_at, due_on, priority);
`,
};
