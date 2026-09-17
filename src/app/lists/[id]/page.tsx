import { notFound } from "next/navigation";
import { TaskPage } from "@/app/components/task-page";
import { deleteListAction } from "@/app/lists/actions";
import { getDb } from "@/lib/db";
import { getList } from "@/lib/lists/repository";
import { parseFilterQuery, parseTaskId } from "@/lib/tasks/validate";

// Always read the list and its tasks from the database, never prerender.
export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

/** `/lists/<id>`: the list page scoped to one list; unknown id is a 404. */
export default async function ListPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { id: rawId } = await params;
  const id = parseTaskId(rawId);
  if (id === null) notFound();
  const list = getList(getDb(), id);
  if (list === null) notFound();

  const { show, q } = parseFilterQuery(await searchParams);
  // Computed once per request, in the server's timezone as a UTC calendar day.
  const today = new Date().toISOString().slice(0, 10);
  return (
    <TaskPage
      list={list}
      show={show}
      q={q}
      today={today}
      headingActions={
        <form action={deleteListAction}>
          <input type="hidden" name="id" value={list.id} />
          <button
            type="submit"
            aria-label={`Delete list: ${list.name}`}
            className="text-sm text-red-700 underline"
          >
            Delete list
          </button>
        </form>
      }
    />
  );
}
