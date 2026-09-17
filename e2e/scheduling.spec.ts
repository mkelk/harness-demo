import { expect, test } from "@playwright/test";

// One ordered flow on its own rows ("Sched: ..."). It never assumes an empty
// database, and an afterAll deletes its row: spec files run alphabetically,
// so this file runs before tasks.spec.ts, whose first test expects the fresh
// per-run database to be empty.
test.describe.configure({ mode: "serial" });

const TITLE = "Sched: overdue milk";
const openList = (page: import("@playwright/test").Page) =>
  page.getByRole("list", { name: "Open tasks" });
const filters = (page: import("@playwright/test").Page) =>
  page.getByRole("navigation", { name: "Filters" });

// Cleanup runs here, not as a test, so it still deletes the row when an
// earlier test in this serial file fails partway through.
test.afterAll(async ({ browser }) => {
  const page = await browser.newPage();
  await page.goto("/");
  const deleteButton = page.getByRole("button", { name: `Delete: ${TITLE}` });
  if ((await deleteButton.count()) > 0) {
    await deleteButton.click();
  }
  await page.close();
});

test("adds a High task due 2000-01-01 and shows it first with High and Overdue", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Title").fill(TITLE);
  await page.getByLabel("Due", { exact: true }).fill("2000-01-01");
  await page.getByLabel("Priority").selectOption("1");
  await page.getByRole("button", { name: "Add task" }).click();

  const first = openList(page).getByRole("listitem").first();
  await expect(first).toContainText(TITLE);
  await expect(first.getByText("High", { exact: true })).toBeVisible();
  await expect(first.getByText("Due 2000-01-01")).toBeVisible();
  await expect(first.getByText("Overdue", { exact: true })).toBeVisible();
  await expect(first.locator(".overdue")).toHaveText("Overdue");
  await expect(page.getByLabel("Title")).toHaveValue("");
  await expect(page.getByLabel("Due", { exact: true })).toHaveValue("");
  await expect(page.getByLabel("Priority")).toHaveValue("2");
});

test("editing it to Low with no due date removes the Overdue and High marks", async ({
  page,
}) => {
  await page.goto("/");
  await openList(page)
    .getByRole("listitem")
    .filter({ hasText: TITLE })
    .getByRole("link", { name: "Edit" })
    .click();
  await expect(page).toHaveURL(/\/tasks\/\d+\/edit$/);
  await expect(page.getByLabel("Due", { exact: true })).toHaveValue(
    "2000-01-01",
  );
  await expect(page.getByLabel("Priority")).toHaveValue("1");

  await page.getByLabel("Due", { exact: true }).fill("");
  await page.getByLabel("Priority").selectOption("3");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page).toHaveURL(/\/$/);
  const row = openList(page).getByRole("listitem").filter({ hasText: TITLE });
  await expect(row).toHaveCount(1);
  await expect(row.getByText("Low", { exact: true })).toBeVisible();
  await expect(row.getByText("High", { exact: true })).toHaveCount(0);
  await expect(row.getByText("Overdue", { exact: true })).toHaveCount(0);
  await expect(row.getByText(/^Due /)).toHaveCount(0);
});

test("the Done filter shows only the Done section", async ({ page }) => {
  await page.goto("/");
  await filters(page).getByRole("link", { name: "Done" }).click();

  await expect(page).toHaveURL(/\?show=done$/);
  await expect(
    page.getByRole("heading", { name: /^Done \(\d+\)$/ }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: /^Open \(/ })).toHaveCount(0);
  await expect(openList(page)).toHaveCount(0);
  await expect(
    filters(page).getByRole("link", { name: "Done" }),
  ).toHaveAttribute("aria-current", "page");
});

test("searching for zzqx shows Open (0) with no rows", async ({ page }) => {
  await page.goto("/?show=open");
  await page.getByLabel("Search").fill("zzqx");
  await page.getByRole("button", { name: "Search" }).click();

  await expect(page).toHaveURL(/show=open/);
  await expect(page).toHaveURL(/q=zzqx/);
  await expect(page.getByRole("heading", { name: "Open (0)" })).toBeVisible();
  await expect(openList(page).getByRole("listitem")).toHaveCount(0);
  await expect(page.getByLabel("Search")).toHaveValue("zzqx");
  await expect(
    page.getByText("No tasks yet. Add the first one above."),
  ).toHaveCount(0);
});

test("the All filter shows both sections", async ({ page }) => {
  await page.goto("/?show=open");
  await filters(page).getByRole("link", { name: "All" }).click();

  await expect(page).toHaveURL(/\?show=all$/);
  await expect(
    page.getByRole("heading", { name: /^Open \(\d+\)$/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /^Done \(\d+\)$/ }),
  ).toBeVisible();
  await expect(openList(page).getByText(TITLE, { exact: true })).toBeVisible();
});
