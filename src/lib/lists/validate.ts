export const LIST_NAME_MAX = 60;

/** The message the create-list action shows when `createList` throws a UNIQUE error. */
export const DUPLICATE_LIST_MESSAGE = "A list with that name already exists.";

/**
 * A list name: a non-string is treated as `""`; the value is trimmed, must be
 * non-empty and at most `LIST_NAME_MAX` characters.
 */
export function parseListName(
  raw: unknown,
): { ok: true; value: string } | { ok: false; error: string } {
  const value = (typeof raw === "string" ? raw : "").trim();
  if (value.length === 0) {
    return { ok: false, error: "List name is required." };
  }
  if (value.length > LIST_NAME_MAX) {
    return {
      ok: false,
      error: `List name must be ${LIST_NAME_MAX} characters or fewer.`,
    };
  }
  return { ok: true, value };
}
