import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Task } from "@/lib/tasks/types";
import { TaskList } from "./task-list";

// The row forms point at server actions; the module is mocked so the component
// file can be imported without a database.
vi.mock("@/app/actions", () => ({ toggleTask: vi.fn(), removeTask: vi.fn() }));

function task(over: Partial<Task> & { id: number; title: string }): Task {
  return {
    notes: "",
    dueOn: null,
    priority: 2,
    listId: null,
    doneAt: null,
    createdAt: "2026-09-17T10:00:00.000Z",
    updatedAt: "2026-09-17T10:00:00.000Z",
    ...over,
  };
}

const TODAY = "2026-09-17";

describe("TaskList rows", () => {
  it("shows a High or Low badge, the due date and Overdue on open rows", () => {
    render(
      <TaskList
        open={[
          task({ id: 1, title: "Milk", priority: 1, dueOn: "2026-09-16" }),
          task({ id: 2, title: "Bread", priority: 2, dueOn: "2026-09-17" }),
          task({ id: 3, title: "Eggs", priority: 3 }),
        ]}
        done={[]}
        show={undefined}
        q=""
        today={TODAY}
      />,
    );
    const rows = within(
      screen.getByRole("list", { name: "Open tasks" }),
    ).getAllByRole("listitem");
    expect(rows[0]).toHaveTextContent("Milk");
    expect(within(rows[0]).getByText("High")).toHaveClass("badge");
    expect(within(rows[0]).getByText("Due 2026-09-16")).toBeInTheDocument();
    expect(within(rows[0]).getByText("Overdue")).toHaveClass("overdue");

    expect(within(rows[1]).queryByText("Normal")).toBeNull();
    expect(within(rows[1]).getByText("Due 2026-09-17")).toBeInTheDocument();
    expect(within(rows[1]).queryByText("Overdue")).toBeNull();

    expect(within(rows[2]).getByText("Low")).toHaveClass("badge");
    expect(within(rows[2]).queryByText(/^Due /)).toBeNull();
  });

  it("shows the due date but never Overdue on done rows", () => {
    render(
      <TaskList
        open={[]}
        done={[
          task({
            id: 4,
            title: "Old",
            dueOn: "2000-01-01",
            priority: 1,
            doneAt: "2026-09-17T11:00:00.000Z",
          }),
        ]}
        show="done"
        q=""
        today={TODAY}
      />,
    );
    const row = within(
      screen.getByRole("list", { name: "Done tasks" }),
    ).getByRole("listitem");
    expect(within(row).getByText("High")).toHaveClass("badge");
    expect(within(row).getByText("Due 2000-01-01")).toBeInTheDocument();
    expect(within(row).queryByText("Overdue")).toBeNull();
  });
});

describe("TaskList sections", () => {
  const open = [task({ id: 1, title: "Milk" })];
  const done = [
    task({ id: 2, title: "Bread", doneAt: "2026-09-17T11:00:00.000Z" }),
  ];
  const heading = (name: RegExp) => screen.queryByRole("heading", { name });

  it("default view: Open always, Done only when non-empty", () => {
    const { unmount } = render(
      <TaskList open={open} done={[]} show={undefined} q="" today={TODAY} />,
    );
    expect(heading(/^Open \(1\)/)).toBeInTheDocument();
    expect(heading(/^Done/)).toBeNull();
    unmount();
    render(
      <TaskList open={open} done={done} show={undefined} q="" today={TODAY} />,
    );
    expect(heading(/^Open \(1\)/)).toBeInTheDocument();
    expect(heading(/^Done \(1\)/)).toBeInTheDocument();
  });

  it("show=open renders only the Open section", () => {
    render(<TaskList open={open} done={[]} show="open" q="" today={TODAY} />);
    expect(heading(/^Open \(1\)/)).toBeInTheDocument();
    expect(heading(/^Done/)).toBeNull();
  });

  it("show=done renders only the Done section, Done (0) when empty", () => {
    render(<TaskList open={[]} done={[]} show="done" q="" today={TODAY} />);
    expect(heading(/^Open/)).toBeNull();
    expect(heading(/^Done \(0\)/)).toBeInTheDocument();
    expect(screen.queryByText(/No tasks yet/)).toBeNull();
  });

  it("show=all renders both sections even when Done is empty", () => {
    render(<TaskList open={open} done={[]} show="all" q="" today={TODAY} />);
    expect(heading(/^Open \(1\)/)).toBeInTheDocument();
    expect(heading(/^Done \(0\)/)).toBeInTheDocument();
  });

  it("shows the empty state only without a search and without rows", () => {
    const { unmount } = render(
      <TaskList open={[]} done={[]} show={undefined} q="" today={TODAY} />,
    );
    expect(
      screen.getByText("No tasks yet. Add the first one above."),
    ).toBeInTheDocument();
    expect(heading(/^Open/)).toBeNull();
    unmount();
    render(<TaskList open={[]} done={[]} show="all" q="" today={TODAY} />);
    expect(
      screen.getByText("No tasks yet. Add the first one above."),
    ).toBeInTheDocument();
  });

  it("show=open with no rows renders Open (0), never the empty state", () => {
    render(<TaskList open={[]} done={[]} show="open" q="" today={TODAY} />);
    expect(heading(/^Open \(0\)/)).toBeInTheDocument();
    expect(screen.queryByText(/No tasks yet/)).toBeNull();
  });

  it("with a search and no match renders Open (0) with no rows", () => {
    render(<TaskList open={[]} done={[]} show="open" q="zzqx" today={TODAY} />);
    expect(screen.queryByText(/No tasks yet/)).toBeNull();
    expect(heading(/^Open \(0\)/)).toBeInTheDocument();
    expect(
      within(screen.getByRole("list", { name: "Open tasks" })).queryAllByRole(
        "listitem",
      ),
    ).toHaveLength(0);
  });

  it("links the list name to /lists/<id> when lists are given and the task has one", () => {
    const lists = [{ id: 4, name: "Groceries" }];
    render(
      <TaskList
        open={[
          task({ id: 1, title: "Milk", listId: 4 }),
          task({ id: 2, title: "Bread" }),
        ]}
        done={[
          task({
            id: 3,
            title: "Eggs",
            listId: 4,
            doneAt: "2026-09-17T11:00:00.000Z",
          }),
        ]}
        show={undefined}
        q=""
        today={TODAY}
        lists={lists}
      />,
    );
    const rows = within(
      screen.getByRole("list", { name: "Open tasks" }),
    ).getAllByRole("listitem");
    expect(
      within(rows[0]).getByRole("link", { name: "Groceries" }),
    ).toHaveAttribute("href", "/lists/4");
    expect(
      within(rows[1]).queryByRole("link", { name: "Groceries" }),
    ).toBeNull();
    const doneRow = within(
      screen.getByRole("list", { name: "Done tasks" }),
    ).getByRole("listitem");
    expect(
      within(doneRow).getByRole("link", { name: "Groceries" }),
    ).toHaveAttribute("href", "/lists/4");
  });

  it("shows no list link on a list page (no lists given)", () => {
    render(
      <TaskList
        open={[task({ id: 1, title: "Milk", listId: 4 })]}
        done={[]}
        show={undefined}
        q=""
        today={TODAY}
      />,
    );
    expect(screen.queryByRole("link", { name: "Groceries" })).toBeNull();
  });
});
