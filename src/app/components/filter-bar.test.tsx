import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FilterBar } from "./filter-bar";

describe("FilterBar", () => {
  it("renders the three links, marks the current one and keeps q in the hrefs", () => {
    render(<FilterBar show="done" q="milk" />);
    const nav = screen.getByRole("navigation", { name: "Filters" });
    expect(nav).toBeInTheDocument();
    const open = screen.getByRole("link", { name: "Open" });
    const done = screen.getByRole("link", { name: "Done" });
    const all = screen.getByRole("link", { name: "All" });
    expect(open).toHaveAttribute("href", "/?show=open&q=milk");
    expect(done).toHaveAttribute("href", "/?show=done&q=milk");
    expect(all).toHaveAttribute("href", "/?show=all&q=milk");
    expect(done).toHaveAttribute("aria-current", "page");
    expect(open).not.toHaveAttribute("aria-current");
    expect(all).not.toHaveAttribute("aria-current");
  });

  it("omits q from the hrefs when empty and marks All current for the default view", () => {
    render(<FilterBar show={undefined} q="" />);
    expect(screen.getByRole("link", { name: "Open" })).toHaveAttribute(
      "href",
      "/?show=open",
    );
    expect(screen.getByRole("link", { name: "All" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("renders a GET search form with the current q and a hidden show", () => {
    render(<FilterBar show="open" q="milk" />);
    const input = screen.getByLabelText("Search");
    expect(input).toHaveAttribute("name", "q");
    expect(input).toHaveValue("milk");
    const button = screen.getByRole("button", { name: "Search" });
    const form = button.closest("form");
    expect(form).toHaveAttribute("method", "get");
    expect(form).toHaveAttribute("action", "/");
    expect(form?.querySelector('input[name="show"]')).toHaveAttribute(
      "value",
      "open",
    );
  });

  it("sends no hidden show for the default view", () => {
    render(<FilterBar show={undefined} q="" />);
    const form = screen.getByRole("button", { name: "Search" }).closest("form");
    expect(form?.querySelector('input[name="show"]')).toBeNull();
  });
});
