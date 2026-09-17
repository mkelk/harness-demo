import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { applyMigrations, createTestDb, openDatabase } from "./index";

const dirs: string[] = [];

function freshDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "harness-demo-open-"));
  dirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of dirs.splice(0))
    rmSync(dir, { recursive: true, force: true });
});

describe("openDatabase", () => {
  it("creates the file and the nested parent directory", () => {
    const path = join(freshDir(), "nested", "dir", "app.db");
    const db = openDatabase(path);
    expect(existsSync(path)).toBe(true);
    db.close();
  });

  it("applies migration 0001 and creates the tasks table", () => {
    const db = openDatabase(join(freshDir(), "app.db"));
    const rows = db
      .prepare("SELECT version, name FROM schema_migrations ORDER BY version")
      .all();
    expect(rows).toEqual([{ version: 1, name: "tasks" }]);
    const columns = db
      .prepare("PRAGMA table_info(tasks)")
      .all()
      .map((row) => (row as { name: string }).name);
    expect(columns).toEqual([
      "id",
      "title",
      "notes",
      "done_at",
      "created_at",
      "updated_at",
    ]);
    db.close();
  });

  it("opening the same path twice applies nothing new", () => {
    const path = join(freshDir(), "app.db");
    const first = openDatabase(path);
    first.close();
    const second = openDatabase(path);
    expect(second).toBeDefined();
    expect(applyMigrations(second)).toBe(0);
    second.close();
  });
});

describe("applyMigrations", () => {
  it("applies a custom migration once", () => {
    const { db, close } = createTestDb();
    const custom = [{ version: 7, name: "x", sql: "CREATE TABLE x(a)" }];
    expect(applyMigrations(db, custom)).toBe(1);
    expect(applyMigrations(db, custom)).toBe(0);
    const row = db
      .prepare("SELECT name FROM schema_migrations WHERE version = 7")
      .get();
    expect(row).toEqual({ name: "x" });
    close();
  });

  it("rolls back a failing migration and throws", () => {
    const { db, close } = createTestDb();
    const broken = [{ version: 9, name: "broken", sql: "CREATE TABLE (" }];
    expect(() => applyMigrations(db, broken)).toThrow();
    const row = db
      .prepare("SELECT version FROM schema_migrations WHERE version = 9")
      .get();
    expect(row).toBeUndefined();
    close();
  });
});

describe("createTestDb", () => {
  it("creates a file that close() removes together with its directory", () => {
    const { path, close } = createTestDb();
    expect(existsSync(path)).toBe(true);
    close();
    expect(existsSync(path)).toBe(false);
    expect(existsSync(join(path, ".."))).toBe(false);
  });
});

describe("tasks table constraints", () => {
  it("rejects a 201-character title", () => {
    const { db, close } = createTestDb();
    const now = new Date().toISOString();
    const insert = db.prepare(
      "INSERT INTO tasks (title, notes, created_at, updated_at) VALUES (?, ?, ?, ?)",
    );
    expect(() => insert.run("a".repeat(201), "", now, now)).toThrow(
      /CHECK constraint/,
    );
    expect(() => insert.run("a".repeat(200), "", now, now)).not.toThrow();
    close();
  });
});
