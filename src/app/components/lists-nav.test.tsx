import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { List } from "@/lib/lists/types";
import { ListsNav } from "./lists-nav";

// NewListForm points at the create-list server action; the module is mocked
// so the component file can be imported without a database.
vi.mock("@/app/lists/actions", () => ({ createListAction: vi.fn() }));

const lists: List[] = [
  {
    id: 1,
    name: "Groceries",
    createdAt: "2026-09-17T10:00:00.000Z",
    openCount: 2,
  },
  { id: 2, name: "Work", createdAt: "2026-09-17T10:00:00.000Z", openCount: 0 },
];

describe("ListsNav", () => {
  it("renders the All tasks link and one link per list with its open count", () => {
    render(<ListsNav lists={lists} currentListId={null} />);
    const nav = screen.getByRole("navigation", { name: "Lists" });
    const all = within(nav).getByRole("link", { name: "All tasks" });
    expect(all).toHaveAttribute("href", "/");
    expect(all).toHaveAttribute("aria-current", "page");
    const groceries = within(nav).getByRole("link", { name: "Groceries (2)" });
    expect(groceries).toHaveAttribute("href", "/lists/1");
    expect(groceries).not.toHaveAttribute("aria-current");
    expect(within(nav).getByRole("link", { name: "Work (0)" })).toHaveAttribute(
      "href",
      "/lists/2",
    );
  });

  it("marks the current list's link and not All tasks", () => {
    render(<ListsNav lists={lists} currentListId={2} />);
    expect(screen.getByRole("link", { name: "Work (0)" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "All tasks" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(
      screen.getByRole("link", { name: "Groceries (2)" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("renders the New list form inside the nav", () => {
    render(<ListsNav lists={[]} currentListId={null} />);
    const nav = screen.getByRole("navigation", { name: "Lists" });
    expect(within(nav).getByLabelText("List name")).toHaveAttribute(
      "name",
      "name",
    );
    expect(
      within(nav).getByRole("button", { name: "Create list" }),
    ).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: "All tasks" })).toBeVisible();
  });
});
