import { describe, expect, it } from "vitest";
import {
  formDataToRaw,
  NOTES_MAX,
  parseTaskInput,
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

describe("formDataToRaw", () => {
  it("reads title and notes from FormData", () => {
    const formData = new FormData();
    formData.append("title", "Buy milk");
    formData.append("notes", "2%");

    expect(formDataToRaw(formData)).toEqual({
      title: "Buy milk",
      notes: "2%",
    });
  });

  it("returns null for missing keys, which parseTaskInput treats as empty", () => {
    const formData = new FormData();

    const raw = formDataToRaw(formData);
    expect(raw).toEqual({ title: null, notes: null });

    const result = parseTaskInput(raw);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.title).toBe("Title is required.");
    }
  });
});
