import { afterEach, describe, expect, it } from "vitest";
import { createTestDb, type TestDb } from "@/lib/db";
import { createTask, getTask, setDone } from "@/lib/tasks/repository";
import type { TaskInput } from "@/lib/tasks/types";
import {
  createList,
  deleteList,
  getList,
  isDuplicateListError,
  listLists,
} from "./repository";

const base: TaskInput = {
  title: "",
  notes: "",
  dueOn: null,
  priority: 2,
  listId: null,
};

let testDb: TestDb | undefined;

function db() {
  testDb = createTestDb();
  return testDb.db;
}

afterEach(() => {
  testDb?.close();
  testDb = undefined;
});

describe("createList and listLists", () => {
  it("returns an empty array on an empty db", () => {
    expect(listLists(db())).toEqual([]);
  });

  it("returns a created list with openCount 0", () => {
    const d = db();
    const list = createList(d, "Groceries");
    expect(list.id).toBe(1);
    expect(list.name).toBe("Groceries");
    expect(list.openCount).toBe(0);
    expect(new Date(list.createdAt).toString()).not.toBe("Invalid Date");
    expect(listLists(d)).toEqual([list]);
  });

  it("openCount counts only the open tasks of that list", () => {
    const d = db();
    const groceries = createList(d, "Groceries");
    const other = createList(d, "Other");
    createTask(d, { ...base, title: "Milk", listId: groceries.id });
    const bread = createTask(d, {
      ...base,
      title: "Bread",
      listId: groceries.id,
    });
    createTask(d, { ...base, title: "Elsewhere", listId: other.id });
    createTask(d, { ...base, title: "Unlisted" });
    setDone(d, bread.id, true);
    expect(getList(d, groceries.id)?.openCount).toBe(1);
    expect(listLists(d).map((l) => [l.name, l.openCount])).toEqual([
      ["Groceries", 1],
      ["Other", 1],
    ]);
  });

  it("orders names case-insensitively", () => {
    const d = db();
    createList(d, "banana");
    createList(d, "Cherry");
    createList(d, "apple");
    expect(listLists(d).map((l) => l.name)).toEqual([
      "apple",
      "banana",
      "Cherry",
    ]);
  });

  it("throws on a duplicate name and isDuplicateListError recognises it", () => {
    const d = db();
    createList(d, "Groceries");
    let caught: unknown;
    try {
      createList(d, "Groceries");
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeDefined();
    expect(isDuplicateListError(caught)).toBe(true);
    expect(isDuplicateListError(new Error("something else"))).toBe(false);
    expect(isDuplicateListError("nope")).toBe(false);
  });
});

describe("getList", () => {
  it("returns null for an unknown id", () => {
    expect(getList(db(), 999)).toBeNull();
  });

  it("returns the list by id", () => {
    const d = db();
    const list = createList(d, "Groceries");
    expect(getList(d, list.id)).toEqual(list);
  });
});

describe("deleteList", () => {
  it("returns true once, then false", () => {
    const d = db();
    const list = createList(d, "Groceries");
    expect(deleteList(d, list.id)).toBe(true);
    expect(deleteList(d, list.id)).toBe(false);
    expect(getList(d, list.id)).toBeNull();
  });

  it("keeps the list's tasks with listId set to null", () => {
    const d = db();
    const list = createList(d, "Groceries");
    const task = createTask(d, { ...base, title: "Milk", listId: list.id });
    expect(task.listId).toBe(list.id);
    expect(deleteList(d, list.id)).toBe(true);
    const kept = getTask(d, task.id);
    expect(kept).not.toBeNull();
    expect(kept?.listId).toBeNull();
    expect(kept?.title).toBe("Milk");
  });
});
