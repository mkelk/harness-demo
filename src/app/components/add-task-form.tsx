"use client";

import { useActionState } from "react";
import { addTask, type AddTaskState } from "@/app/actions";
import { TaskFields } from "./task-fields";

/** `listId` is the current list on `/lists/<id>`; the task is added to it. */
export function AddTaskForm({ listId }: { listId?: number }) {
  const [state, formAction] = useActionState(addTask, {});
  return <AddTaskFormView state={state} action={formAction} listId={listId} />;
}

const EMPTY_VALUES = {
  title: "",
  notes: "",
  dueOn: "",
  priority: "2",
  listId: "",
};

/**
 * The form itself, with the action state as a prop so it can be rendered and
 * tested without a server action. Keyed on `state.nonce` so a successful add
 * remounts the form with empty fields. A `listId` travels as a hidden input.
 */
export function AddTaskFormView({
  state,
  action,
  listId,
}: {
  state: AddTaskState;
  action: (formData: FormData) => void;
  listId?: number;
}) {
  return (
    <form
      key={state.nonce ?? "initial"}
      action={action}
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4"
    >
      {listId !== undefined ? (
        <input type="hidden" name="listId" value={listId} />
      ) : null}
      <TaskFields
        idPrefix="add"
        values={state.values ?? EMPTY_VALUES}
        errors={state.errors}
      />
      <div>
        <button
          type="submit"
          className="rounded bg-zinc-900 px-3 py-1 text-white"
        >
          Add task
        </button>
      </div>
    </form>
  );
}
