"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { createTask, deleteTask, setDone } from "@/lib/tasks/repository";
import {
  formDataToRaw,
  parseTaskId,
  parseTaskInput,
  submittedValues,
} from "@/lib/tasks/validate";

export type AddTaskState = {
  errors?: { title?: string; notes?: string };
  values?: { title: string; notes: string };
  /** Changes on every successful add so the form can remount and clear. */
  nonce?: number;
};

export async function addTask(
  prevState: AddTaskState,
  formData: FormData,
): Promise<AddTaskState> {
  const parsed = parseTaskInput(formDataToRaw(formData));
  if (!parsed.ok) {
    return { errors: parsed.errors, values: submittedValues(formData) };
  }
  createTask(getDb(), parsed.value);
  revalidatePath("/");
  return { nonce: Date.now() };
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
  revalidatePath("/");
}

/** Deletes a task. An invalid or unknown `id` is ignored. */
export async function removeTask(formData: FormData): Promise<void> {
  const id = parseTaskId(formData.get("id"));
  if (id !== null) {
    deleteTask(getDb(), id);
  }
  revalidatePath("/");
}
