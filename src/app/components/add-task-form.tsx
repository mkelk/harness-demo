"use client";

import { useActionState } from "react";
import { addTask, type AddTaskState } from "@/app/actions";

export function AddTaskForm() {
  const [state, formAction] = useActionState(addTask, {});
  return <AddTaskFormView state={state} action={formAction} />;
}

/**
 * The form itself, with the action state as a prop so it can be rendered and
 * tested without a server action. Keyed on `state.nonce` so a successful add
 * remounts the form with empty fields.
 */
export function AddTaskFormView({
  state,
  action,
}: {
  state: AddTaskState;
  action: (formData: FormData) => void;
}) {
  return (
    <form
      key={state.nonce ?? "initial"}
      action={action}
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="add-title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="add-title"
          name="title"
          type="text"
          placeholder="What needs doing?"
          defaultValue={state.values?.title ?? ""}
          className="rounded border border-zinc-300 px-2 py-1"
        />
        {state.errors?.title ? (
          <p role="alert" className="text-sm text-red-700">
            {state.errors.title}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="add-notes" className="text-sm font-medium">
          Notes
        </label>
        <textarea
          id="add-notes"
          name="notes"
          rows={2}
          defaultValue={state.values?.notes ?? ""}
          className="rounded border border-zinc-300 px-2 py-1"
        />
        {state.errors?.notes ? (
          <p role="alert" className="text-sm text-red-700">
            {state.errors.notes}
          </p>
        ) : null}
      </div>
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
