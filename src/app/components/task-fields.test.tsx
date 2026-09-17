import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TaskFields } from "./task-fields";

const empty = { title: "", notes: "", dueOn: "", priority: "2" };

describe("TaskFields", () => {
  it("renders Title, Notes, Due and Priority with the three priority options", () => {
    render(<TaskFields idPrefix="add" values={empty} errors={undefined} />);
    expect(screen.getByLabelText("Title")).toHaveAttribute("name", "title");
    expect(screen.getByLabelText("Notes")).toHaveAttribute("name", "notes");
    const due = screen.getByLabelText("Due");
    expect(due).toHaveAttribute("type", "date");
    expect(due).toHaveAttribute("name", "dueOn");
    const priority = screen.getByLabelText("Priority");
    expect(priority).toHaveAttribute("name", "priority");
    expect(priority).toHaveValue("2");
    const options = screen.getAllByRole("option");
    expect(
      options.map((o) => [o.getAttribute("value"), o.textContent]),
    ).toEqual([
      ["1", "High"],
      ["2", "Normal"],
      ["3", "Low"],
    ]);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("prefills every control from values", () => {
    render(
      <TaskFields
        idPrefix="edit"
        values={{
          title: "Buy milk",
          notes: "Semi-skimmed",
          dueOn: "2026-09-30",
          priority: "1",
        }}
        errors={undefined}
      />,
    );
    expect(screen.getByLabelText("Title")).toHaveValue("Buy milk");
    expect(screen.getByLabelText("Notes")).toHaveValue("Semi-skimmed");
    expect(screen.getByLabelText("Due")).toHaveValue("2026-09-30");
    expect(screen.getByLabelText("Priority")).toHaveValue("1");
  });

  it("shows one alert per field error, in field order", () => {
    render(
      <TaskFields
        idPrefix="add"
        values={empty}
        errors={{
          title: "Title is required.",
          notes: "Notes too long.",
          dueOn: "Due must be a date (YYYY-MM-DD).",
          priority: "Priority must be high, normal or low.",
        }}
      />,
    );
    expect(screen.getAllByRole("alert").map((a) => a.textContent)).toEqual([
      "Title is required.",
      "Notes too long.",
      "Due must be a date (YYYY-MM-DD).",
      "Priority must be high, normal or low.",
    ]);
  });

  it("uses idPrefix so two forms on one page never share ids", () => {
    render(<TaskFields idPrefix="add" values={empty} errors={undefined} />);
    expect(screen.getByLabelText("Title")).toHaveAttribute("id", "add-title");
    expect(screen.getByLabelText("Due")).toHaveAttribute("id", "add-dueOn");
  });
});
