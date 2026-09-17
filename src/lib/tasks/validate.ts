import type { Priority, TaskInput } from "./types";

export type TaskInputErrors = {
  title?: string;
  notes?: string;
  dueOn?: string;
  priority?: string;
};

export type ParseResult =
  { ok: true; value: TaskInput } | { ok: false; errors: TaskInputErrors };

export const TITLE_MAX = 200;
export const NOTES_MAX = 2000;

export const PRIORITY_LABELS: Record<Priority, string> = {
  1: "High",
  2: "Normal",
  3: "Low",
};

const DUE_ON_ERROR = "Due must be a date (YYYY-MM-DD).";
const PRIORITY_ERROR = "Priority must be high, normal or low.";

function toStringOrEmpty(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * A due date field: a non-string or blank value is `null` (undated); otherwise
 * the trimmed value must be `YYYY-MM-DD` and a real calendar date.
 */
export function parseDueOn(
  raw: unknown,
): { ok: true; value: string | null } | { ok: false; error: string } {
  const value = toStringOrEmpty(raw).trim();
  if (value.length === 0) return { ok: true, value: null };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { ok: false, error: DUE_ON_ERROR };
  }
  const date = new Date(value + "T00:00:00Z");
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    return { ok: false, error: DUE_ON_ERROR };
  }
  return { ok: true, value };
}

/**
 * A priority field: `undefined`, `null` or `""` is the default 2 (Normal), so
 * forms without the field keep working; "1"/"2"/"3" or 1/2/3 is that value.
 */
export function parsePriority(
  raw: unknown,
): { ok: true; value: Priority } | { ok: false; error: string } {
  if (raw === undefined || raw === null || raw === "") {
    return { ok: true, value: 2 };
  }
  if (raw === 1 || raw === "1") return { ok: true, value: 1 };
  if (raw === 2 || raw === "2") return { ok: true, value: 2 };
  if (raw === 3 || raw === "3") return { ok: true, value: 3 };
  return { ok: false, error: PRIORITY_ERROR };
}

export function parseTaskInput(raw: {
  title?: unknown;
  notes?: unknown;
  dueOn?: unknown;
  priority?: unknown;
}): ParseResult {
  const title = toStringOrEmpty(raw.title).trim();
  const notes = toStringOrEmpty(raw.notes).trim();
  const dueOn = parseDueOn(raw.dueOn);
  const priority = parsePriority(raw.priority);

  const errors: TaskInputErrors = {};

  if (title.length === 0) {
    errors.title = "Title is required.";
  } else if (title.length > TITLE_MAX) {
    errors.title = `Title must be ${TITLE_MAX} characters or fewer.`;
  }

  if (notes.length > NOTES_MAX) {
    errors.notes = `Notes must be ${NOTES_MAX} characters or fewer.`;
  }

  if (!dueOn.ok) errors.dueOn = dueOn.error;
  if (!priority.ok) errors.priority = priority.error;

  if (!dueOn.ok || !priority.ok || Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: { title, notes, dueOn: dueOn.value, priority: priority.value },
  };
}

export function formDataToRaw(formData: FormData): {
  title: unknown;
  notes: unknown;
  dueOn: unknown;
  priority: unknown;
} {
  return {
    title: formData.get("title"),
    notes: formData.get("notes"),
    dueOn: formData.get("dueOn"),
    priority: formData.get("priority"),
  };
}

/**
 * Parses a hidden `id` input value: a string or number that is a positive
 * safe integer. Anything else (including "0", "-1", "1.5", non-numeric
 * strings, `null` or missing values) is `null`.
 */
export function parseTaskId(raw: unknown): number | null {
  if (typeof raw === "number") {
    return Number.isSafeInteger(raw) && raw > 0 ? raw : null;
  }
  if (typeof raw !== "string" || !/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

/** The fields as submitted, non-strings coerced to `""`. */
export function submittedValues(formData: FormData): {
  title: string;
  notes: string;
  dueOn: string;
  priority: string;
} {
  const raw = formDataToRaw(formData);
  return {
    title: toStringOrEmpty(raw.title),
    notes: toStringOrEmpty(raw.notes),
    dueOn: toStringOrEmpty(raw.dueOn),
    priority: toStringOrEmpty(raw.priority),
  };
}
