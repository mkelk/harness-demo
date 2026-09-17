"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import {
  createList,
  deleteList,
  isDuplicateListError,
} from "@/lib/lists/repository";
import { DUPLICATE_LIST_MESSAGE, parseListName } from "@/lib/lists/validate";
import { parseTaskId } from "@/lib/tasks/validate";

export type CreateListState = {
  error?: string;
  /** The submitted name, kept on error. */
  value?: string;
  /** Changes on every successful create so the form can remount and clear. */
  nonce?: number;
};

/**
 * Creates a list from the New list form. A bad name comes back as `error`
 * with the submitted `value`; a duplicate name maps the UNIQUE error to
 * `DUPLICATE_LIST_MESSAGE`.
 */
export async function createListAction(
  prevState: CreateListState,
  formData: FormData,
): Promise<CreateListState> {
  const raw = formData.get("name");
  const value = typeof raw === "string" ? raw : "";
  const parsed = parseListName(raw);
  if (!parsed.ok) {
    return { error: parsed.error, value };
  }
  try {
    createList(getDb(), parsed.value);
  } catch (error) {
    if (isDuplicateListError(error)) {
      return { error: DUPLICATE_LIST_MESSAGE, value };
    }
    throw error;
  }
  revalidatePath("/");
  return { nonce: Date.now() };
}

/**
 * Deletes a list (its tasks are kept with `listId` null) and redirects to
 * `/`. An invalid or unknown `id` still redirects. `redirect` throws, so it
 * is never wrapped in try/catch.
 */
export async function deleteListAction(formData: FormData): Promise<void> {
  const id = parseTaskId(formData.get("id"));
  if (id !== null) {
    deleteList(getDb(), id);
  }
  revalidatePath("/");
  redirect("/");
}
