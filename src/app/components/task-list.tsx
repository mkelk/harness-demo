import Link from "next/link";
import type { Task } from "@/lib/tasks/types";

function firstLine(notes: string): string {
  return notes.split(/\r?\n/, 1)[0] ?? "";
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
                <div className="flex-1 line-through text-zinc-500">
                  {task.title}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
