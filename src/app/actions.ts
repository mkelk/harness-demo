"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { listLists } from "@/lib/lists/repository";
import { createTask, deleteTask, setDone } from "@/lib/tasks/repository";
import {
  formDataToRaw,
  parseTaskId,
  parseTaskInput,
  submittedValues,
  type TaskInputErrors,
} from "@/lib/tasks/validate";

export type AddTaskState = {
  errors?: TaskInputErrors;
  /** The submitted strings (`dueOn` and `priority` included), kept on error. */
  values?: ReturnType<typeof submittedValues>;
  /** Changes on every successful add so the form can remount and clear. */
  nonce?: number;
};

export async function addTask(
  prevState: AddTaskState,
  formData: FormData,
): Promise<AddTaskState> {
  const db = getDb();
  // The List select must name an existing list (or "" for No list).
  const listIds = listLists(db).map((list) => list.id);
  const parsed = parseTaskInput(formDataToRaw(formData), { listIds });
  if (!parsed.ok) {
    return { errors: parsed.errors, values: submittedValues(formData) };
  }
  createTask(db, parsed.value);
  revalidateTaskPages();
  return { nonce: Date.now() };
}

/** Every page that renders task rows: `/` and each `/lists/<id>`. */
function revalidateTaskPages(): void {
  revalidatePath("/");
  revalidatePath("/lists/[id]", "page");
}

/**
 * Marks a task done (`done` = "true") or open (`done` = "false"). An invalid
 * or unknown `id` is ignored; the page is revalidated either way.
 */
export async function toggleTask(formData: FormData): Promise<void> {
  const id = parseTaskId(formData.get("id"));
  if (id !== null) {
    setDone(getDb(), id, formData.get("done") === "true");
  }
  revalidateTaskPages();
}

/** Deletes a task. An invalid or unknown `id` is ignored. */
export async function removeTask(formData: FormData): Promise<void> {
  const id = parseTaskId(formData.get("id"));
  if (id !== null) {
    deleteTask(getDb(), id);
  }
  revalidateTaskPages();
}
