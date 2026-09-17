import { expect, test } from "@playwright/test";

// One ordered flow on one fresh database (playwright.config.ts sets a new
// DATABASE_PATH per run), so the tests build on each other's state.
test.describe.configure({ mode: "serial" });

test("shows the empty state on a fresh database", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByText("No tasks yet. Add the first one above."),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: /^Open \(/ })).toHaveCount(0);
});

test("adds a task and shows it first under Open (1) with the form cleared", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Title").fill("Buy milk");
  await page.getByLabel("Notes").fill("Semi-skimmed");
  await page.getByRole("button", { name: "Add task" }).click();

  await expect(page.getByRole("heading", { name: "Open (1)" })).toBeVisible();
  const open = page.getByRole("list", { name: "Open tasks" });
  await expect(open.getByRole("listitem").first()).toContainText("Buy milk");
  await expect(open.getByRole("listitem").first()).toContainText(
    "Semi-skimmed",
  );
  await expect(page.getByLabel("Title")).toHaveValue("");
  await expect(page.getByLabel("Notes")).toHaveValue("");
  await expect(
    page.getByText("No tasks yet. Add the first one above."),
  ).toHaveCount(0);
});

test("rejects an empty title with 'Title is required.' and adds nothing", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Notes").fill("no title here");
  await page.getByRole("button", { name: "Add task" }).click();

  await expect(page.getByRole("alert")).toHaveText("Title is required.");
  await expect(page.getByLabel("Notes")).toHaveValue("no title here");
  await expect(page.getByRole("heading", { name: "Open (1)" })).toBeVisible();
  const open = page.getByRole("list", { name: "Open tasks" });
  await expect(open.getByRole("listitem")).toHaveCount(1);
});
