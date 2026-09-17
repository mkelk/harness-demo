import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AddTaskFormView } from "./add-task-form";

// The view is rendered directly with a state prop; the server action module is
// mocked so the component file can be imported without a database.
vi.mock("@/app/actions", () => ({ addTask: vi.fn() }));

describe("AddTaskFormView", () => {
  it("renders the Title and Notes fields and the Add task button", () => {
    render(<AddTaskFormView state={{}} action={vi.fn()} lists={[]} />);
    expect(screen.getByLabelText("Title")).toHaveAttribute(
      "placeholder",
      "What needs doing?",
    );
    expect(screen.getByLabelText("Notes")).toBeInTheDocument();
    expect(screen.getByLabelText("Due")).toHaveValue("");
    expect(screen.getByLabelText("Priority")).toHaveValue("2");
    expect(
      screen.getByRole("button", { name: "Add task" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows the errors from the action state and keeps the submitted values", () => {
    render(
      <AddTaskFormView
        state={{
          errors: { title: "Title is required.", notes: "Notes too long." },
          values: {
            title: "",
            notes: "some notes",
            dueOn: "2026-09-30",
            priority: "3",
            listId: "",
          },
        }}
        action={vi.fn()}
        lists={[]}
      />,
    );
    const alerts = screen.getAllByRole("alert");
    expect(alerts.map((a) => a.textContent)).toEqual([
      "Title is required.",
      "Notes too long.",
    ]);
    expect(screen.getByLabelText("Notes")).toHaveValue("some notes");
    expect(screen.getByLabelText("Due")).toHaveValue("2026-09-30");
    expect(screen.getByLabelText("Priority")).toHaveValue("3");
  });

  it("clears the Title field when a new nonce remounts the form", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <AddTaskFormView state={{}} action={vi.fn()} lists={[]} />,
    );

    await user.type(screen.getByLabelText("Title"), "Buy milk");
    expect(screen.getByLabelText("Title")).toHaveValue("Buy milk");

    rerender(
      <AddTaskFormView state={{ nonce: 1 }} action={vi.fn()} lists={[]} />,
    );

    expect(screen.getByLabelText("Title")).toHaveValue("");
  });
});

describe("AddTaskFormView on a list page", () => {
  const lists = [
    { id: 7, name: "Groceries" },
    { id: 8, name: "Work" },
  ];

  it("defaults the List select to the current list", () => {
    render(
      <AddTaskFormView state={{}} action={vi.fn()} lists={lists} listId={7} />,
    );
    expect(screen.getByLabelText("List", { exact: true })).toHaveValue("7");
  });

  it("defaults the List select to No list on the unscoped page", () => {
    render(<AddTaskFormView state={{}} action={vi.fn()} lists={lists} />);
    expect(screen.getByLabelText("List", { exact: true })).toHaveValue("");
  });

  it("keeps the submitted listId after a validation error", () => {
    render(
      <AddTaskFormView
        state={{
          errors: { title: "Title is required." },
          values: {
            title: "",
            notes: "",
            dueOn: "",
            priority: "2",
            listId: "8",
          },
        }}
        action={vi.fn()}
        lists={lists}
        listId={7}
      />,
    );
    expect(screen.getByLabelText("List", { exact: true })).toHaveValue("8");
  });
});
