"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveTask, type SaveTaskState } from "@/app/tasks/[id]/edit/actions";
import type { Task } from "@/lib/tasks/types";
import { TaskFields } from "./task-fields";

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
  const values = state.values ?? {
    title: task.title,
    notes: task.notes,
    dueOn: task.dueOn ?? "",
    priority: String(task.priority),
    listId: task.listId === null ? "" : String(task.listId),
  };
  return (
    <form
      action={action}
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4"
    >
      <input type="hidden" name="id" value={task.id} />
      <TaskFields idPrefix="edit" values={values} errors={state.errors} />
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
