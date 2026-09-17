import { describe, expect, it } from "vitest";
import {
  DUPLICATE_LIST_MESSAGE,
  LIST_NAME_MAX,
  parseListName,
} from "./validate";

describe("parseListName", () => {
  it("trims the name", () => {
    expect(parseListName("  Groceries ")).toEqual({
      ok: true,
      value: "Groceries",
    });
  });

  it("rejects an empty name", () => {
    expect(parseListName("")).toEqual({
      ok: false,
      error: "List name is required.",
    });
  });

  it("rejects a whitespace-only name", () => {
    expect(parseListName("   ")).toEqual({
      ok: false,
      error: "List name is required.",
    });
  });

  it("rejects a name longer than 60 characters", () => {
    expect(parseListName("a".repeat(LIST_NAME_MAX + 1))).toEqual({
      ok: false,
      error: "List name must be 60 characters or fewer.",
    });
  });

  it("accepts a name of exactly 60 characters", () => {
    expect(parseListName("a".repeat(LIST_NAME_MAX))).toEqual({
      ok: true,
      value: "a".repeat(LIST_NAME_MAX),
    });
  });

  it("treats a non-string as empty", () => {
    expect(parseListName(42)).toEqual({
      ok: false,
      error: "List name is required.",
    });
  });
});

describe("constants", () => {
  it("exposes the limit and the duplicate message", () => {
    expect(LIST_NAME_MAX).toBe(60);
    expect(DUPLICATE_LIST_MESSAGE).toBe(
      "A list with that name already exists.",
    );
  });
});
