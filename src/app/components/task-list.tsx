import Link from "next/link";
import { removeTask, toggleTask } from "@/app/actions";
import { isOverdue } from "@/lib/tasks/repository";
import type { Task } from "@/lib/tasks/types";
import { PRIORITY_LABELS } from "@/lib/tasks/validate";
import type { Show } from "./filter-bar";
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

/**
 * The marks after a title: a High or Low badge (Normal shows nothing), the
 * due date, and Overdue for an open task due before `today`.
 */
function TaskMarks({ task, today }: { task: Task; today: string }) {
  return (
    <>
      {task.priority !== 2 ? (
        <span
          className={`badge rounded px-1.5 text-xs ${
            task.priority === 1
              ? "bg-red-100 text-red-800"
              : "bg-zinc-200 text-zinc-700"
          }`}
        >
          {PRIORITY_LABELS[task.priority]}
        </span>
      ) : null}
      {task.dueOn ? (
        <span className="text-xs text-zinc-600">Due {task.dueOn}</span>
      ) : null}
      {isOverdue(task, today) ? (
        <span className="overdue text-xs font-semibold text-red-700">
          Overdue
        </span>
      ) : null}
    </>
  );
}

/**
 * The Open and Done sections. `show` is the normalised query value:
 * `"open"` renders Open only, `"done"` Done only, `"all"` both (a `Done (0)`
 * heading included); `undefined` (no query) renders Open and, only when it has
 * rows, Done, which is what the page did before the filter bar existed. The
 * empty-state paragraph appears only without a search and without rows.
 */
export function TaskList({
  open,
  done,
  show,
  q,
  today,
}: {
  open: Task[];
  done: Task[];
  show: Show | undefined;
  q: string;
  today: string;
}) {
  const showOpen = show !== "done";
  const showDone =
    show === "done" ||
    show === "all" ||
    (show === undefined && done.length > 0);
  if (showOpen && open.length === 0 && done.length === 0 && q.length === 0) {
    return (
      <p className="mt-6 text-zinc-600">
        No tasks yet. Add the first one above.
      </p>
    );
  }
  return (
    <div className="mt-6 flex flex-col gap-6">
      {showOpen ? (
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
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{task.title}</span>
                    <TaskMarks task={task} today={today} />
                  </div>
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
      ) : null}
      {showDone ? (
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
                <div className="flex flex-1 flex-wrap items-center gap-2">
                  <span className="text-zinc-500 line-through">
                    {task.title}
                  </span>
                  <TaskMarks task={task} today={today} />
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
