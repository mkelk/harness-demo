import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Task } from "@/lib/tasks/types";
import { EditTaskFormView } from "./edit-task-form";

// The view is rendered directly with a state prop; the server action module is
// mocked so the component file can be imported without a database.
vi.mock("@/app/tasks/[id]/edit/actions", () => ({ saveTask: vi.fn() }));

const task: Task = {
  id: 7,
  title: "Buy milk",
  notes: "Semi-skimmed",
  dueOn: null,
  priority: 2,
  doneAt: null,
  createdAt: "2026-09-17T10:00:00.000Z",
  updatedAt: "2026-09-17T10:00:00.000Z",
};

describe("EditTaskFormView", () => {
  it("prefills Title and Notes from the task and renders Save and Cancel", () => {
    render(<EditTaskFormView task={task} state={{}} action={vi.fn()} />);
    expect(screen.getByLabelText("Title")).toHaveValue("Buy milk");
    expect(screen.getByLabelText("Notes")).toHaveValue("Semi-skimmed");
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cancel" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows the error and the submitted values from the action state", () => {
    render(
      <EditTaskFormView
        task={task}
        state={{
          errors: { title: "Title is required." },
          values: { title: "", notes: "changed notes" },
        }}
        action={vi.fn()}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Title is required.");
    expect(screen.getByLabelText("Title")).toHaveValue("");
    expect(screen.getByLabelText("Notes")).toHaveValue("changed notes");
  });
});
