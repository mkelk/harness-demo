"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveTask, type SaveTaskState } from "@/app/tasks/[id]/edit/actions";
import type { Task } from "@/lib/tasks/types";

export function EditTaskForm({ task }: { task: Task }) {
  const [state, formAction] = useActionState(saveTask, {});
  return <EditTaskFormView task={task} state={state} action={formAction} />;
}

/**
 * The form itself, with the action state as a prop so it can be rendered and
 * tested without a server action. Fields are prefilled from the last submitted
 * values when there are any, otherwise from the task.
 */
export function EditTaskFormView({
  task,
  state,
  action,
}: {
  task: Task;
  state: SaveTaskState;
  action: (formData: FormData) => void;
}) {
  const values = state.values ?? { title: task.title, notes: task.notes };
  return (
    <form
      action={action}
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4"
    >
      <input type="hidden" name="id" value={task.id} />
      <div className="flex flex-col gap-1">
        <label htmlFor="edit-title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="edit-title"
          name="title"
          type="text"
          defaultValue={values.title}
          className="rounded border border-zinc-300 px-2 py-1"
        />
        {state.errors?.title ? (
          <p role="alert" className="text-sm text-red-700">
            {state.errors.title}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="edit-notes" className="text-sm font-medium">
          Notes
        </label>
        <textarea
          id="edit-notes"
          name="notes"
          rows={4}
          defaultValue={values.notes}
          className="rounded border border-zinc-300 px-2 py-1"
        />
        {state.errors?.notes ? (
          <p role="alert" className="text-sm text-red-700">
            {state.errors.notes}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-4">
        <button
          type="submit"
          className="rounded bg-zinc-900 px-3 py-1 text-white"
        >
          Save
        </button>
        <Link href="/" className="text-sm text-blue-700 underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
