import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { applyMigrations } from "./migrate";

/**
 * Opens (creating if needed) the SQLite file at `path`, creates its parent
 * directory if missing, sets the connection PRAGMAs and applies pending
 * migrations. The caller owns the handle and closes it.
 */
export function openDatabase(path: string): DatabaseSync {
  mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");
  applyMigrations(db);
  return db;
}
