"use client";

import { useActionState } from "react";
import { addTask, type AddTaskState } from "@/app/actions";
import { type ListOption, TaskFields } from "./task-fields";

/**
 * `lists` fills the List select; `listId` is the current list on
 * `/lists/<id>`, which the select defaults to.
 */
export function AddTaskForm({
  lists,
  listId,
}: {
  lists: ListOption[];
  listId?: number;
}) {
  const [state, formAction] = useActionState(addTask, {});
  return (
    <AddTaskFormView
      state={state}
      action={formAction}
      lists={lists}
      listId={listId}
    />
  );
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
 * remounts the form with empty fields, the List select back on `listId`.
 */
export function AddTaskFormView({
  state,
  action,
  lists,
  listId,
}: {
  state: AddTaskState;
  action: (formData: FormData) => void;
  lists: ListOption[];
  listId?: number;
}) {
  const values = state.values ?? {
    ...EMPTY_VALUES,
    listId: listId === undefined ? "" : String(listId),
  };
  return (
    <form
      key={state.nonce ?? "initial"}
      action={action}
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4"
    >
      <TaskFields
        idPrefix="add"
        values={values}
        errors={state.errors}
        lists={lists}
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
