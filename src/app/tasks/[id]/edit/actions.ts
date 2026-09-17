"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { updateTask } from "@/lib/tasks/repository";
import { formDataToRaw, parseTaskInput } from "@/lib/tasks/validate";

export type SaveTaskState = {
  errors?: { title?: string; notes?: string };
  values?: { title: string; notes: string };
};

function submitted(formData: FormData): { title: string; notes: string } {
  const raw = formDataToRaw(formData);
  return {
    title: typeof raw.title === "string" ? raw.title : "",
    notes: typeof raw.notes === "string" ? raw.notes : "",
  };
}

function taskId(formData: FormData): number | null {
  const raw = formData.get("id");
  if (typeof raw !== "string" || !/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

/**
 * Saves the edit form. Validation errors come back as state; a successful
 * save revalidates "/" and redirects there. `redirect` throws, so it is never
 * wrapped in try/catch.
 */
export async function saveTask(
  prevState: SaveTaskState,
  formData: FormData,
): Promise<SaveTaskState> {
  const id = taskId(formData);
  if (id === null) notFound();

  const parsed = parseTaskInput(formDataToRaw(formData));
  if (!parsed.ok) {
    return { errors: parsed.errors, values: submitted(formData) };
  }
  const updated = updateTask(getDb(), id, parsed.value);
  if (updated === null) notFound();

  revalidatePath("/");
  redirect("/");
}
