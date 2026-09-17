import { afterEach, describe, expect, it, vi } from "vitest";
import { createTestDb, type TestDb } from "@/lib/db";
import {
  createTask,
  deleteTask,
  getTask,
  isOverdue,
  listTasks,
  setDone,
  updateTask,
} from "./repository";
import type { TaskInput } from "./types";

const base: TaskInput = { title: "", notes: "", dueOn: null, priority: 2 };

let testDb: TestDb | undefined;

function db() {
  testDb = createTestDb();
  return testDb.db;
}

afterEach(() => {
  testDb?.close();
  testDb = undefined;
  vi.useRealTimers();
});

describe("listTasks", () => {
  it("returns empty open and done lists on an empty db", () => {
    expect(listTasks(db())).toEqual({ open: [], done: [] });
  });

  it("orders open tasks by due date (undated last), priority, then newest", () => {
    const d = db();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"));
    const inputs: TaskInput[] = [
      { ...base, title: "undated normal older" },
      { ...base, title: "undated normal newest" },
      { ...base, title: "undated high", priority: 1 },
      {
        ...base,
        title: "due 2026-01-02 high",
        dueOn: "2026-01-02",
        priority: 1,
      },
      { ...base, title: "due 2026-01-01 normal", dueOn: "2026-01-01" },
    ];
    for (const input of inputs) {
      createTask(d, input);
      vi.advanceTimersByTime(1000);
    }
    const { open } = listTasks(d);
    expect(open.map((t) => t.title)).toEqual([
      "due 2026-01-01 normal",
      "due 2026-01-02 high",
      "undated high",
      "undated normal newest",
      "undated normal older",
    ]);
  });

  it("show 'done' returns no open rows; show 'all' returns both", () => {
    const d = db();
    const a = createTask(d, { ...base, title: "A" });
    createTask(d, { ...base, title: "B" });
    setDone(d, a.id, true);
    const done = listTasks(d, { show: "done" });
    expect(done.open).toEqual([]);
    expect(done.done.map((t) => t.title)).toEqual(["A"]);
    const all = listTasks(d, { show: "all" });
    expect(all.open.map((t) => t.title)).toEqual(["B"]);
    expect(all.done.map((t) => t.title)).toEqual(["A"]);
    const open = listTasks(d, { show: "open" });
    expect(open.open.map((t) => t.title)).toEqual(["B"]);
    expect(open.done).toEqual([]);
  });

  it("q filters both lists by case-insensitive title substring", () => {
    const d = db();
    createTask(d, { ...base, title: "Buy MILK" });
    createTask(d, { ...base, title: "Bread" });
    const oat = createTask(d, { ...base, title: "Oat milk" });
    setDone(d, oat.id, true);
    const result = listTasks(d, { show: "all", q: " milk " });
    expect(result.open.map((t) => t.title)).toEqual(["Buy MILK"]);
    expect(result.done.map((t) => t.title)).toEqual(["Oat milk"]);
    expect(listTasks(d, { q: "   " }).open).toHaveLength(2);
  });
});

describe("isOverdue", () => {
  const today = "2026-09-17";

  it("is true for an open task due yesterday", () => {
    expect(isOverdue({ dueOn: "2026-09-16", doneAt: null }, today)).toBe(true);
  });

  it("is false for a task due today", () => {
    expect(isOverdue({ dueOn: "2026-09-17", doneAt: null }, today)).toBe(false);
  });

  it("is false for a done task due yesterday", () => {
    expect(
      isOverdue(
        { dueOn: "2026-09-16", doneAt: "2026-09-16T10:00:00.000Z" },
        today,
      ),
    ).toBe(false);
  });

  it("is false for an undated task", () => {
    expect(isOverdue({ dueOn: null, doneAt: null }, today)).toBe(false);
  });
});

describe("createTask", () => {
  it("inserts a task with id 1, no done_at and matching created/updated timestamps", () => {
    const d = db();
    const task = createTask(d, { ...base, title: "Buy milk" });
    expect(task.id).toBe(1);
    expect(task.doneAt).toBeNull();
    expect(task.dueOn).toBeNull();
    expect(task.priority).toBe(2);
    expect(typeof task.createdAt).toBe("string");
    expect(task.createdAt).toBe(task.updatedAt);
    expect(new Date(task.createdAt).toString()).not.toBe("Invalid Date");
    expect(listTasks(d).open[0]?.title).toBe("Buy milk");
  });

  it("stores dueOn and priority", () => {
    const d = db();
    const task = createTask(d, {
      ...base,
      title: "Buy milk",
      dueOn: "2026-09-30",
      priority: 1,
    });
    expect(task.dueOn).toBe("2026-09-30");
    expect(task.priority).toBe(1);
    expect(getTask(d, task.id)).toEqual(task);
  });

  it("orders undated open tasks of equal priority newest first", () => {
    const d = db();
    createTask(d, { ...base, title: "First" });
    createTask(d, { ...base, title: "Second" });
    createTask(d, { ...base, title: "Third" });
    const { open } = listTasks(d);
    expect(open.map((t) => t.id)).toEqual([3, 2, 1]);
  });

  it("throws when the title is 201 characters (CHECK constraint)", () => {
    const d = db();
    expect(() => createTask(d, { ...base, title: "a".repeat(201) })).toThrow(
      /CHECK constraint/,
    );
  });
});

describe("setDone", () => {
  it("marks a task done, moving it from open to done", () => {
    const d = db();
    const task = createTask(d, { ...base, title: "Buy milk" });
    const done = setDone(d, task.id, true);
    expect(done?.doneAt).toEqual(expect.any(String));
    const { open, done: doneList } = listTasks(d, { show: "all" });
    expect(open.find((t) => t.id === task.id)).toBeUndefined();
    expect(doneList.find((t) => t.id === task.id)).toBeDefined();
  });

  it("orders done tasks by done_at DESC, not id DESC", () => {
    const d = db();
    const first = createTask(d, { ...base, title: "First" });
    const second = createTask(d, { ...base, title: "Second" });
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"));
    setDone(d, second.id, true);
    vi.setSystemTime(new Date("2024-01-01T00:00:01.000Z"));
    setDone(d, first.id, true);
    const { done } = listTasks(d, { show: "done" });
    expect(done.map((t) => t.id)).toEqual([1, 2]);
  });

  it("is a no-op when already done (same doneAt on second call)", () => {
    const d = db();
    const task = createTask(d, { ...base, title: "Buy milk" });
    const first = setDone(d, task.id, true);
    const second = setDone(d, task.id, true);
    expect(second?.doneAt).toBe(first?.doneAt);
  });

  it("reopens a done task, clearing doneAt", () => {
    const d = db();
    const task = createTask(d, { ...base, title: "Buy milk" });
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
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"));
    const task = createTask(d, { ...base, title: "Buy milk" });
    vi.setSystemTime(new Date("2024-01-01T00:00:01.000Z"));
    const updated = updateTask(d, task.id, {
      ...base,
      title: "Buy oat milk",
      notes: "2 litres",
    });
    expect(updated).not.toBeNull();
    expect(updated?.title).toBe("Buy oat milk");
    expect(updated?.notes).toBe("2 litres");
    expect(updated?.dueOn).toBeNull();
    expect(updated?.priority).toBe(2);
    expect(updated!.updatedAt > updated!.createdAt).toBe(true);
    expect(getTask(d, task.id)).toEqual(updated);
  });

  it("changes dueOn and priority", () => {
    const d = db();
    const task = createTask(d, { ...base, title: "Buy milk" });
    const updated = updateTask(d, task.id, {
      ...base,
      title: "Buy milk",
      dueOn: "2026-09-30",
      priority: 3,
    });
    expect(updated?.dueOn).toBe("2026-09-30");
    expect(updated?.priority).toBe(3);
    const cleared = updateTask(d, task.id, { ...base, title: "Buy milk" });
    expect(cleared?.dueOn).toBeNull();
    expect(cleared?.priority).toBe(2);
  });

  it("returns null for an unknown id", () => {
    const d = db();
    expect(updateTask(d, 999, { ...base, title: "x" })).toBeNull();
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
    const task = createTask(d, { ...base, title: "Buy milk" });
    expect(deleteTask(d, task.id)).toBe(true);
    expect(deleteTask(d, task.id)).toBe(false);
    expect(getTask(d, task.id)).toBeNull();
  });
});
