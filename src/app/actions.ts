"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { createTask } from "@/lib/tasks/repository";
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
