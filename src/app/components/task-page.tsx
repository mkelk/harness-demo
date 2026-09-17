import type { ReactNode } from "react";
import { getDb } from "@/lib/db";
import { listLists } from "@/lib/lists/repository";
import type { List } from "@/lib/lists/types";
import { listTasks } from "@/lib/tasks/repository";
import type { FilterQuery } from "@/lib/tasks/validate";
import { AddTaskForm } from "./add-task-form";
import { FilterBar } from "./filter-bar";
import { ListsNav } from "./lists-nav";
import { TaskList } from "./task-list";

/**
 * The list page body shared by `/` (`list` null) and `/lists/<id>`: reads the
 * lists and the tasks for the scope and renders the sidebar, the heading
 * (the list name, or All tasks), the add form, the filter bar and the task
 * sections. `headingActions` renders next to the heading (the Delete list
 * form on a list page). The lists also fill the List select of the add form
 * (defaulting to the current list) and, on `/` only, the list link on rows.
 */
export function TaskPage({
  list,
  show,
  q,
  today,
  headingActions,
}: {
  list: List | null;
  show: FilterQuery["show"];
  q: string;
  today: string;
  headingActions?: ReactNode;
}) {
  const db = getDb();
  const lists = listLists(db);
  // The default view (no `show`) reads both lists and renders like `all`.
  const { open, done } = listTasks(db, {
    show: show ?? "all",
    q,
    listId: list?.id,
  });
  const basePath = list ? `/lists/${list.id}` : "/";
  const listOptions = lists.map(({ id, name }) => ({ id, name }));
  return (
    <main className="mx-auto max-w-4xl p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">harness-demo</h1>
        <p className="mt-1 text-sm text-zinc-600">
          A small task manager, built increment by increment with the dmtix
          method.
        </p>
      </header>
      <div className="flex gap-8">
        <ListsNav lists={lists} currentListId={list?.id ?? null} />
        <section className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">
              {list ? list.name : "All tasks"}
            </h2>
            {headingActions}
          </div>
          <AddTaskForm lists={listOptions} listId={list?.id} />
          <FilterBar show={show} q={q} basePath={basePath} />
          <TaskList
            open={open}
            done={done}
            show={show}
            q={q}
            today={today}
            lists={list ? undefined : listOptions}
          />
        </section>
      </div>
    </main>
  );
}
