import Link from "next/link";
import type { ListFilter } from "@/lib/tasks/repository";

export type Show = NonNullable<ListFilter["show"]>;

const LINKS: ReadonlyArray<[Show, string]> = [
  ["open", "Open"],
  ["done", "Done"],
  ["all", "All"],
];

function href(show: Show, q: string): string {
  const params = new URLSearchParams({ show });
  if (q.length > 0) params.set("q", q);
  return `/?${params.toString()}`;
}

/**
 * The Open, Done and All links and the search form above the task sections.
 * `show` is the query value as the page normalised it; `undefined` (no query)
 * is the default view, which renders like `all`, so the All link is current.
 * The links keep `q`; the form keeps `show` as a hidden input.
 */
export function FilterBar({ show, q }: { show: Show | undefined; q: string }) {
  const current: Show = show ?? "all";
  return (
    <nav
      aria-label="Filters"
      className="mt-6 flex flex-wrap items-center gap-4 text-sm"
    >
      <ul className="flex gap-3">
        {LINKS.map(([value, label]) => (
          <li key={value}>
            <Link
              href={href(value, q)}
              aria-current={current === value ? "page" : undefined}
              className={
                current === value
                  ? "font-semibold text-zinc-900 underline"
                  : "text-blue-700 underline"
              }
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <form method="get" action="/" className="flex items-center gap-2">
        {show ? <input type="hidden" name="show" value={show} /> : null}
        <label htmlFor="filter-q" className="font-medium">
          Search
        </label>
        <input
          id="filter-q"
          name="q"
          type="search"
          defaultValue={q}
          className="rounded border border-zinc-300 px-2 py-1"
        />
        <button
          type="submit"
          className="rounded border border-zinc-300 bg-white px-3 py-1"
        >
          Search
        </button>
      </form>
    </nav>
  );
}
