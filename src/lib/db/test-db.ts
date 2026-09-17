import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { DatabaseSync } from "node:sqlite";
import { openDatabase } from "./open";

export type TestDb = { db: DatabaseSync; path: string; close(): void };

/**
 * A migrated database in a fresh temp directory, for integration tests. Call
 * `close()` in the test's teardown: it closes the handle and removes the
 * directory with the database file and its `-wal` / `-shm` siblings.
 */
export function createTestDb(): TestDb {
  const dir = mkdtempSync(join(tmpdir(), "harness-demo-"));
  const path = join(dir, "test.db");
  const db = openDatabase(path);
  return {
    db,
    path,
    close() {
      if (db.isOpen) db.close();
      rmSync(dirname(path), { recursive: true, force: true });
    },
  };
}
