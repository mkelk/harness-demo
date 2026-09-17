import Link from "next/link";
import { removeTask, toggleTask } from "@/app/actions";
import type { Task } from "@/lib/tasks/types";
import { TaskCheckbox } from "./task-checkbox";

function firstLine(notes: string): string {
  return notes.split(/\r?\n/, 1)[0] ?? "";
}

function DeleteButton({ task }: { task: Task }) {
  return (
    <form action={removeTask}>
      <input type="hidden" name="id" value={task.id} />
      <button
        type="submit"
        aria-label={`Delete: ${task.title}`}
        className="text-sm text-red-700 underline"
      >
        Delete
      </button>
    </form>
  );
}

function ToggleForm({ task, done }: { task: Task; done: boolean }) {
  // Submitting sets the opposite state: an open task becomes done, a done
  // task is reopened. The checkbox submits the form on change.
  return (
    <form action={toggleTask}>
      <input type="hidden" name="id" value={task.id} />
      <input type="hidden" name="done" value={done ? "false" : "true"} />
      <TaskCheckbox
        label={`${done ? "Reopen" : "Mark done"}: ${task.title}`}
        checked={done}
      />
    </form>
  );
}

export function TaskList({ open, done }: { open: Task[]; done: Task[] }) {
  if (open.length === 0 && done.length === 0) {
    return (
      <p className="mt-6 text-zinc-600">
        No tasks yet. Add the first one above.
      </p>
    );
  }
  return (
    <div className="mt-6 flex flex-col gap-6">
      <section aria-labelledby="open-heading">
        <h2 id="open-heading" className="text-lg font-semibold">
          Open ({open.length})
        </h2>
        <ul aria-label="Open tasks" className="mt-2 flex flex-col gap-2">
          {open.map((task) => (
            <li
              key={task.id}
              className="flex items-start gap-3 rounded border border-zinc-200 bg-white px-3 py-2"
            >
              <ToggleForm task={task} done={false} />
              <div className="flex-1">
                <div>{task.title}</div>
                {task.notes ? (
                  <div className="text-sm text-zinc-500">
                    {firstLine(task.notes)}
                  </div>
                ) : null}
              </div>
              <Link
                href={`/tasks/${task.id}/edit`}
                className="text-sm text-blue-700 underline"
              >
                Edit
              </Link>
              <DeleteButton task={task} />
            </li>
          ))}
        </ul>
      </section>
      {done.length > 0 ? (
        <section aria-labelledby="done-heading">
          <h2 id="done-heading" className="text-lg font-semibold">
            Done ({done.length})
          </h2>
          <ul aria-label="Done tasks" className="mt-2 flex flex-col gap-2">
            {done.map((task) => (
              <li
                key={task.id}
                className="flex items-start gap-3 rounded border border-zinc-200 bg-zinc-100 px-3 py-2"
              >
                <ToggleForm task={task} done={true} />
                <div className="flex-1 text-zinc-500 line-through">
                  {task.title}
                </div>
                <DeleteButton task={task} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
