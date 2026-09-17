import Link from "next/link";
import type { List } from "@/lib/lists/types";
import { NewListForm } from "./new-list-form";

/**
 * The sidebar: the All tasks link, one link per list with its open count
 * (`<name> (<openCount>)`), and the New list form. `currentListId` marks
 * the current link with `aria-current="page"`; `null` marks All tasks.
 */
export function ListsNav({
  lists,
  currentListId,
}: {
  lists: List[];
  currentListId: number | null;
}) {
  const linkClass = (current: boolean) =>
    current
      ? "font-semibold text-zinc-900 underline"
      : "text-blue-700 underline";
  return (
    <nav aria-label="Lists" className="w-56 shrink-0 text-sm">
      <ul className="flex flex-col gap-1">
        <li>
          <Link
            href="/"
            aria-current={currentListId === null ? "page" : undefined}
            className={linkClass(currentListId === null)}
          >
            All tasks
          </Link>
        </li>
        {lists.map((list) => (
          <li key={list.id}>
            <Link
              href={`/lists/${list.id}`}
              aria-current={currentListId === list.id ? "page" : undefined}
              className={linkClass(currentListId === list.id)}
            >
              {list.name} ({list.openCount})
            </Link>
          </li>
        ))}
      </ul>
      <NewListForm />
    </nav>
  );
}
