"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { updateTask } from "@/lib/tasks/repository";
import {
  formDataToRaw,
  parseTaskId,
  parseTaskInput,
  submittedValues,
  type TaskInputErrors,
} from "@/lib/tasks/validate";

export type SaveTaskState = {
  errors?: TaskInputErrors;
  /** The submitted strings (`dueOn` and `priority` included), kept on error. */
  values?: ReturnType<typeof submittedValues>;
};

/**
 * Saves the edit form. Validation errors come back as state; a successful
 * save revalidates "/" and redirects there. `redirect` throws, so it is never
 * wrapped in try/catch.
 */
export async function saveTask(
  prevState: SaveTaskState,
  formData: FormData,
): Promise<SaveTaskState> {
  const id = parseTaskId(formData.get("id"));
  if (id === null) notFound();

  const parsed = parseTaskInput(formDataToRaw(formData));
  if (!parsed.ok) {
    return { errors: parsed.errors, values: submittedValues(formData) };
  }
  const updated = updateTask(getDb(), id, parsed.value);
  if (updated === null) notFound();

  revalidatePath("/");
  redirect("/");
}
