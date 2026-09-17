import { getDb } from "@/lib/db";
import { listTasks } from "@/lib/tasks/repository";
import { AddTaskForm } from "./components/add-task-form";
import { FilterBar, type Show } from "./components/filter-bar";
import { TaskList } from "./components/task-list";

// The list is read from the database on every request, never prerendered.
export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

/** `show=open|done|all` as given; anything else (including no value) is `undefined`. */
function parseShow(raw: string): Show | undefined {
  return raw === "open" || raw === "done" || raw === "all" ? raw : undefined;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const show = parseShow(first(params.show));
  const q = first(params.q).trim();
  // The default view (no `show`) reads both lists and renders like `all`.
  const { open, done } = listTasks(getDb(), { show: show ?? "all", q });
  // Computed once per request, in the server's timezone as a UTC calendar day.
  const today = new Date().toISOString().slice(0, 10);
  return (
    <main className="mx-auto max-w-2xl p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">harness-demo</h1>
        <p className="mt-1 text-sm text-zinc-600">
          A small task manager, built increment by increment with the dmtix
          method.
        </p>
      </header>
      <AddTaskForm />
      <FilterBar show={show} q={q} />
      <TaskList open={open} done={done} show={show} q={q} today={today} />
    </main>
  );
}
