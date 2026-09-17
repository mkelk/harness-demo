import type { TaskInput } from "./types";

export type TaskInputErrors = { title?: string; notes?: string };

export type ParseResult =
  { ok: true; value: TaskInput } | { ok: false; errors: TaskInputErrors };

export const TITLE_MAX = 200;
export const NOTES_MAX = 2000;

function toStringOrEmpty(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function parseTaskInput(raw: {
  title?: unknown;
  notes?: unknown;
}): ParseResult {
  const title = toStringOrEmpty(raw.title).trim();
  const notes = toStringOrEmpty(raw.notes).trim();

  const errors: TaskInputErrors = {};

  if (title.length === 0) {
    errors.title = "Title is required.";
  } else if (title.length > TITLE_MAX) {
    errors.title = `Title must be ${TITLE_MAX} characters or fewer.`;
  }

  if (notes.length > NOTES_MAX) {
    errors.notes = `Notes must be ${NOTES_MAX} characters or fewer.`;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { title, notes } };
}

export function formDataToRaw(formData: FormData): {
  title: unknown;
  notes: unknown;
} {
  return {
    title: formData.get("title"),
    notes: formData.get("notes"),
  };
}
