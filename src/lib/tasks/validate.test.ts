import { describe, expect, it } from "vitest";
import {
  formDataToRaw,
  NOTES_MAX,
  parseDueOn,
  parsePriority,
  parseFilterQuery,
  parseTaskId,
  parseTaskInput,
  PRIORITY_LABELS,
  submittedValues,
  TITLE_MAX,
} from "./validate";

describe("parseTaskInput", () => {
  it("trims title and defaults notes to an empty string", () => {
    const result = parseTaskInput({ title: "  Buy milk  " });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.title).toBe("Buy milk");
      expect(result.value.notes).toBe("");
    }
  });

  it("rejects an empty title", () => {
    const result = parseTaskInput({ title: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.title).toBe("Title is required.");
    }
  });

  it("rejects a whitespace-only title", () => {
    const result = parseTaskInput({ title: "   " });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.title).toBe("Title is required.");
    }
  });

  it("rejects a title longer than 200 characters", () => {
    const title = "a".repeat(TITLE_MAX + 1);
    const result = parseTaskInput({ title });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.title).toBe(
        "Title must be 200 characters or fewer.",
      );
    }
  });

  it("accepts a title of exactly 200 characters", () => {
    const title = "a".repeat(TITLE_MAX);
    const result = parseTaskInput({ title });
    expect(result.ok).toBe(true);
  });

  it("rejects notes longer than 2000 characters", () => {
    const notes = "a".repeat(NOTES_MAX + 1);
    const result = parseTaskInput({ title: "Buy milk", notes });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.notes).toBe(
        "Notes must be 2000 characters or fewer.",
      );
    }
  });

  it("accepts notes of exactly 2000 characters", () => {
    const notes = "a".repeat(NOTES_MAX);
    const result = parseTaskInput({ title: "Buy milk", notes });
    expect(result.ok).toBe(true);
  });

  it("treats undefined notes as an empty string", () => {
    const result = parseTaskInput({ title: "Buy milk", notes: undefined });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.notes).toBe("");
    }
  });

  it("defaults dueOn to null and priority to 2 when the fields are absent", () => {
    const result = parseTaskInput({ title: "Buy milk" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        title: "Buy milk",
        notes: "",
        dueOn: null,
        priority: 2,
        listId: null,
      });
    }
  });

  it("rejects a listId that is not in options.listIds", () => {
    const result = parseTaskInput(
      { title: "Buy milk", listId: "3" },
      { listIds: [1, 2] },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toEqual({ listId: "List does not exist." });
    }
  });

  it("accepts a listId that is in options.listIds", () => {
    const result = parseTaskInput(
      { title: "Buy milk", listId: "2" },
      { listIds: [1, 2] },
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.listId).toBe(2);
  });

  it.each([[""], [undefined], [null]])(
    "treats listId %p as null even with listIds given",
    (raw) => {
      const result = parseTaskInput(
        { title: "Buy milk", listId: raw },
        { listIds: [1, 2] },
      );
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value.listId).toBeNull();
    },
  );

  it("accepts any positive listId when no options are given", () => {
    const result = parseTaskInput({ title: "Buy milk", listId: "9" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.listId).toBe(9);
  });

  it.each([["0"], ["-1"], ["abc"], ["1.5"]])(
    "rejects a malformed listId %p",
    (raw) => {
      const result = parseTaskInput({ title: "Buy milk", listId: raw });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.listId).toBe("List does not exist.");
      }
    },
  );

  it("reports a listId error alongside title errors", () => {
    const result = parseTaskInput({ title: "", listId: "7" }, { listIds: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toEqual({
        title: "Title is required.",
        listId: "List does not exist.",
      });
    }
  });

  it("accepts a valid dueOn and priority", () => {
    const result = parseTaskInput({
      title: "Buy milk",
      dueOn: "2026-09-30",
      priority: "1",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.dueOn).toBe("2026-09-30");
      expect(result.value.priority).toBe(1);
    }
  });

  it("reports dueOn and priority errors alongside title errors", () => {
    const result = parseTaskInput({
      title: "",
      dueOn: "2026-02-30",
      priority: "4",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toEqual({
        title: "Title is required.",
        dueOn: "Due must be a date (YYYY-MM-DD).",
        priority: "Priority must be high, normal or low.",
      });
    }
  });

  it("treats a non-string title as empty", () => {
    const result = parseTaskInput({ title: 42 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.title).toBe("Title is required.");
    }
  });

  it("reports every failing field at once", () => {
    const result = parseTaskInput({
      title: "",
      notes: "a".repeat(NOTES_MAX + 1),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.title).toBe("Title is required.");
      expect(result.errors.notes).toBe(
        "Notes must be 2000 characters or fewer.",
      );
    }
  });
});

describe("parseDueOn", () => {
  it.each([
    ["", null],
    ["   ", null],
    [undefined, null],
    [null, null],
    [42, null],
    ["2026-09-30", "2026-09-30"],
    [" 2026-09-30 ", "2026-09-30"],
  ])("parses %p as %p", (raw, value) => {
    expect(parseDueOn(raw)).toEqual({ ok: true, value });
  });

  it.each([["2026-02-30"], ["30/09/2026"], ["2026-9-30"], ["2026-13-01"]])(
    "rejects %p",
    (raw) => {
      expect(parseDueOn(raw)).toEqual({
        ok: false,
        error: "Due must be a date (YYYY-MM-DD).",
      });
    },
  );
});

describe("parsePriority", () => {
  it.each([
    [undefined, 2],
    [null, 2],
    ["", 2],
    ["1", 1],
    ["2", 2],
    ["3", 3],
    [1, 1],
    [3, 3],
  ])("parses %p as %p", (raw, value) => {
    expect(parsePriority(raw)).toEqual({ ok: true, value });
  });

  it.each([["4"], ["0"], ["high"], [4], [1.5], ["1.0"]])(
    "rejects %p",
    (raw) => {
      expect(parsePriority(raw)).toEqual({
        ok: false,
        error: "Priority must be high, normal or low.",
      });
    },
  );
});

describe("PRIORITY_LABELS", () => {
  it("names the three priorities", () => {
    expect(PRIORITY_LABELS).toEqual({ 1: "High", 2: "Normal", 3: "Low" });
  });
});

describe("formDataToRaw", () => {
  it("reads title, notes, dueOn, priority and listId from FormData", () => {
    const formData = new FormData();
    formData.append("title", "Buy milk");
    formData.append("notes", "2%");
    formData.append("dueOn", "2026-09-30");
    formData.append("priority", "1");
    formData.append("listId", "4");

    expect(formDataToRaw(formData)).toEqual({
      title: "Buy milk",
      notes: "2%",
      dueOn: "2026-09-30",
      priority: "1",
      listId: "4",
    });
  });

  it("returns null for missing keys, which parseTaskInput treats as empty", () => {
    const formData = new FormData();

    const raw = formDataToRaw(formData);
    expect(raw).toEqual({
      title: null,
      notes: null,
      dueOn: null,
      priority: null,
      listId: null,
    });

    const result = parseTaskInput(raw);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.title).toBe("Title is required.");
    }
  });
});

describe("parseTaskId", () => {
  it("accepts a positive integer string", () => {
    expect(parseTaskId("12")).toBe(12);
  });

  it("accepts a positive safe integer number", () => {
    expect(parseTaskId(12)).toBe(12);
  });

  it.each([["0"], ["-1"], ["1.5"], ["abc"], [""], [null]])(
    "rejects %p",
    (raw) => {
      expect(parseTaskId(raw)).toBeNull();
    },
  );
});

describe("submittedValues", () => {
  it("reads title, notes, dueOn, priority and listId as submitted", () => {
    const formData = new FormData();
    formData.append("title", "Buy milk");
    formData.append("notes", "2%");
    formData.append("dueOn", "2026-02-30");
    formData.append("priority", "4");
    formData.append("listId", "3");

    expect(submittedValues(formData)).toEqual({
      title: "Buy milk",
      notes: "2%",
      dueOn: "2026-02-30",
      priority: "4",
      listId: "3",
    });
  });

  it("coerces non-string (missing) values to an empty string", () => {
    const formData = new FormData();

    expect(submittedValues(formData)).toEqual({
      title: "",
      notes: "",
      dueOn: "",
      priority: "",
      listId: "",
    });
  });
});

describe("parseFilterQuery", () => {
  it("reads show and a trimmed q from the search params", () => {
    expect(parseFilterQuery({ show: "done", q: "  milk " })).toEqual({
      show: "done",
      q: "milk",
    });
  });

  it("treats a missing or unknown show as undefined and a missing q as empty", () => {
    expect(parseFilterQuery({})).toEqual({ show: undefined, q: "" });
    expect(parseFilterQuery({ show: "later" })).toEqual({
      show: undefined,
      q: "",
    });
  });

  it("uses the first value of a repeated parameter", () => {
    expect(parseFilterQuery({ show: ["open", "done"], q: ["a", "b"] })).toEqual(
      { show: "open", q: "a" },
    );
  });
});
