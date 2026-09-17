import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NewListFormView } from "./new-list-form";

vi.mock("@/app/lists/actions", () => ({ createListAction: vi.fn() }));

describe("NewListFormView", () => {
  it("renders the List name input and the Create list button without an alert", () => {
    render(<NewListFormView state={{}} action={vi.fn()} />);
    const input = screen.getByLabelText("List name");
    expect(input).toHaveAttribute("name", "name");
    expect(input).toHaveValue("");
    expect(screen.getByRole("form", { name: "New list" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create list" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows the error in an alert and keeps the submitted value", () => {
    render(
      <NewListFormView
        state={{
          error: "A list with that name already exists.",
          value: "Groceries",
        }}
        action={vi.fn()}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "A list with that name already exists.",
    );
    expect(screen.getByLabelText("List name")).toHaveValue("Groceries");
  });

  it("clears the input when a new nonce remounts the form", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <NewListFormView state={{}} action={vi.fn()} />,
    );
    await user.type(screen.getByLabelText("List name"), "Groceries");
    expect(screen.getByLabelText("List name")).toHaveValue("Groceries");

    rerender(<NewListFormView state={{ nonce: 1 }} action={vi.fn()} />);

    expect(screen.getByLabelText("List name")).toHaveValue("");
  });
});
