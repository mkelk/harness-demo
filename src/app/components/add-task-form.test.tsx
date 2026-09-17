import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AddTaskFormView } from "./add-task-form";

// The view is rendered directly with a state prop; the server action module is
// mocked so the component file can be imported without a database.
vi.mock("@/app/actions", () => ({ addTask: vi.fn() }));

describe("AddTaskFormView", () => {
  it("renders the Title and Notes fields and the Add task button", () => {
    render(<AddTaskFormView state={{}} action={vi.fn()} />);
    expect(screen.getByLabelText("Title")).toHaveAttribute(
      "placeholder",
      "What needs doing?",
    );
    expect(screen.getByLabelText("Notes")).toBeInTheDocument();
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
          values: { title: "", notes: "some notes" },
        }}
        action={vi.fn()}
      />,
    );
    const alerts = screen.getAllByRole("alert");
    expect(alerts.map((a) => a.textContent)).toEqual([
      "Title is required.",
      "Notes too long.",
    ]);
    expect(screen.getByLabelText("Notes")).toHaveValue("some notes");
  });
});
