"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { createTask, deleteTask, setDone } from "@/lib/tasks/repository";
import { formDataToRaw, parseTaskInput } from "@/lib/tasks/validate";

export type AddTaskState = {
  errors?: { title?: string; notes?: string };
  values?: { title: string; notes: string };
  ok?: boolean;
  /** Changes on every successful add so the form can remount and clear. */
  nonce?: number;
};

function submitted(formData: FormData): { title: string; notes: string } {
  const raw = formDataToRaw(formData);
  return {
    title: typeof raw.title === "string" ? raw.title : "",
    notes: typeof raw.notes === "string" ? raw.notes : "",
  };
}

/** The `id` hidden input as a positive integer, or `null` when it is not one. */
function taskId(formData: FormData): number | null {
  const raw = formData.get("id");
  if (typeof raw !== "string" || !/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function addTask(
  prevState: AddTaskState,
  formData: FormData,
): Promise<AddTaskState> {
  const parsed = parseTaskInput(formDataToRaw(formData));
  if (!parsed.ok) {
    return { errors: parsed.errors, values: submitted(formData) };
  }
  createTask(getDb(), parsed.value);
  revalidatePath("/");
  return { ok: true, nonce: Date.now() };
}

/**
 * Marks a task done (`done` = "true") or open (`done` = "false"). An invalid
 * or unknown `id` is ignored; the page is revalidated either way.
 */
export async function toggleTask(formData: FormData): Promise<void> {
  const id = taskId(formData);
  if (id !== null) {
    setDone(getDb(), id, formData.get("done") === "true");
  }
  revalidatePath("/");
}

/** Deletes a task. An invalid or unknown `id` is ignored. */
export async function removeTask(formData: FormData): Promise<void> {
  const id = taskId(formData);
  if (id !== null) {
    deleteTask(getDb(), id);
  }
  revalidatePath("/");
}
