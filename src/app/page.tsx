import { TaskPage } from "./components/task-page";
import { parseFilterQuery } from "@/lib/tasks/validate";

// The list is read from the database on every request, never prerendered.
export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { show, q } = parseFilterQuery(await searchParams);
  // Computed once per request, in the server's timezone as a UTC calendar day.
  const today = new Date().toISOString().slice(0, 10);
  return <TaskPage list={null} show={show} q={q} today={today} />;
}
