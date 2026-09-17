import type { DatabaseSync } from "node:sqlite";
import { migration0001 } from "./migrations/0001_tasks";

/**
 * A schema step. Migrations are TypeScript modules exporting SQL strings (not
 * .sql files) so that `next build` bundles them without a file-system read.
 */
export type Migration = { version: number; name: string; sql: string };

/** Every migration, ascending by version. Append; never edit an applied one. */
export const MIGRATIONS: Migration[] = [migration0001];

/**
 * Applies every migration whose version is not yet recorded in
 * `schema_migrations`, each inside its own transaction. Returns how many were
 * applied; re-running is a no-op returning 0.
 */
export function applyMigrations(
  db: DatabaseSync,
  migrations: Migration[] = MIGRATIONS,
): number {
  db.exec(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    )`,
  );
  const applied = new Set(
    db
      .prepare("SELECT version FROM schema_migrations")
      .all()
      .map((row) => (row as { version: number }).version),
  );
  const record = db.prepare(
    "INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)",
  );
  let count = 0;
  for (const migration of [...migrations].sort(
    (a, b) => a.version - b.version,
  )) {
    if (applied.has(migration.version)) continue;
    db.exec("BEGIN");
    try {
      db.exec(migration.sql);
      record.run(migration.version, migration.name, new Date().toISOString());
      db.exec("COMMIT");
    } catch (error) {
      if (db.isTransaction) db.exec("ROLLBACK");
      throw error;
    }
    count++;
  }
  return count;
}
