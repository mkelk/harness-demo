import { afterEach, describe, expect, it } from "vitest";
import { createTestDb, type TestDb } from "@/lib/db";
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  setDone,
  updateTask,
} from "./repository";

let testDb: TestDb | undefined;

function db() {
  testDb = createTestDb();
  return testDb.db;
}

afterEach(() => {
  testDb?.close();
  testDb = undefined;
});

describe("listTasks", () => {
  it("returns empty open and done lists on an empty db", () => {
    expect(listTasks(db())).toEqual({ open: [], done: [] });
  });
});

describe("createTask", () => {
  it("inserts a task with id 1, no done_at and matching created/updated timestamps", () => {
    const d = db();
    const task = createTask(d, { title: "Buy milk", notes: "" });
    expect(task.id).toBe(1);
    expect(task.doneAt).toBeNull();
    expect(typeof task.createdAt).toBe("string");
    expect(task.createdAt).toBe(task.updatedAt);
    expect(new Date(task.createdAt).toString()).not.toBe("Invalid Date");
    expect(listTasks(d).open[0]?.title).toBe("Buy milk");
  });

  it("orders open tasks newest first", () => {
    const d = db();
    createTask(d, { title: "First", notes: "" });
    createTask(d, { title: "Second", notes: "" });
    createTask(d, { title: "Third", notes: "" });
    const { open } = listTasks(d);
    expect(open.map((t) => t.id)).toEqual([3, 2, 1]);
  });

  it("throws when the title is 201 characters (CHECK constraint)", () => {
    const d = db();
    expect(() => createTask(d, { title: "a".repeat(201), notes: "" })).toThrow(
      /CHECK constraint/,
    );
  });
});

describe("setDone", () => {
  it("marks a task done, moving it from open to done", () => {
    const d = db();
    const task = createTask(d, { title: "Buy milk", notes: "" });
    const done = setDone(d, task.id, true);
    expect(done?.doneAt).toEqual(expect.any(String));
    const { open, done: doneList } = listTasks(d);
    expect(open.find((t) => t.id === task.id)).toBeUndefined();
    expect(doneList.find((t) => t.id === task.id)).toBeDefined();
  });

  it("orders done tasks newest-done first, id DESC on tie", () => {
    const d = db();
    const first = createTask(d, { title: "First", notes: "" });
    const second = createTask(d, { title: "Second", notes: "" });
    setDone(d, first.id, true);
    setDone(d, second.id, true);
    const { done } = listTasks(d);
    expect(done.map((t) => t.id)).toEqual([2, 1]);
  });

  it("is a no-op when already done (same doneAt on second call)", () => {
    const d = db();
    const task = createTask(d, { title: "Buy milk", notes: "" });
    const first = setDone(d, task.id, true);
    const second = setDone(d, task.id, true);
    expect(second?.doneAt).toBe(first?.doneAt);
  });

  it("reopens a done task, clearing doneAt", () => {
    const d = db();
    const task = createTask(d, { title: "Buy milk", notes: "" });
    setDone(d, task.id, true);
    const reopened = setDone(d, task.id, false);
    expect(reopened?.doneAt).toBeNull();
    expect(listTasks(d).open.find((t) => t.id === task.id)).toBeDefined();
  });

  it("returns null for an unknown id", () => {
    const d = db();
    expect(setDone(d, 999, true)).toBeNull();
  });
});

describe("updateTask", () => {
  it("changes title and notes and bumps updatedAt", () => {
    const d = db();
    const task = createTask(d, { title: "Buy milk", notes: "" });
    const updated = updateTask(d, task.id, {
      title: "Buy oat milk",
      notes: "2 litres",
    });
    expect(updated).not.toBeNull();
    expect(updated?.title).toBe("Buy oat milk");
    expect(updated?.notes).toBe("2 litres");
    expect(updated!.updatedAt >= updated!.createdAt).toBe(true);
    expect(getTask(d, task.id)).toEqual(updated);
  });

  it("returns null for an unknown id", () => {
    const d = db();
    expect(updateTask(d, 999, { title: "x", notes: "" })).toBeNull();
  });
});

describe("getTask", () => {
  it("returns null for an unknown id", () => {
    const d = db();
    expect(getTask(d, 999)).toBeNull();
  });
});

describe("deleteTask", () => {
  it("returns true when deleting, then false, and getTask returns null", () => {
    const d = db();
    const task = createTask(d, { title: "Buy milk", notes: "" });
    expect(deleteTask(d, task.id)).toBe(true);
    expect(deleteTask(d, task.id)).toBe(false);
    expect(getTask(d, task.id)).toBeNull();
  });
});
