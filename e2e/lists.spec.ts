import { expect, test, type Page } from "@playwright/test";

// One ordered flow on its own rows ("Lists: ..."). It never assumes an empty
// database, and an afterAll deletes its tasks and its list: spec files run
// alphabetically, so this file runs before scheduling.spec.ts and
// tasks.spec.ts; only tasks.spec.ts's first test expects the fresh per-run
// database to be empty.
test.describe.configure({ mode: "serial" });

const LIST = "Lists: Groceries";
const TASK = "Lists: milk";
const TASK2 = "Lists: bread";
const listsNav = (page: Page) =>
  page.getByRole("navigation", { name: "Lists" });
const openList = (page: Page) => page.getByRole("list", { name: "Open tasks" });
const sidebarLink = (page: Page, count: number) =>
  listsNav(page).getByRole("link", { name: `${LIST} (${count})`, exact: true });
const anySidebarLink = (page: Page) =>
  listsNav(page).getByRole("link", {
    name: new RegExp(`^${LIST} \\(\\d+\\)$`),
  });

// Cleanup runs here, not as a test, so it still removes the rows when an
// earlier test in this serial file fails partway through. The list may
// already be gone (the flow deletes it), so both steps are guarded.
test.afterAll(async ({ browser }) => {
  const page = await browser.newPage();
  await page.goto("/");
  const deleteTask = page.getByRole("button", { name: `Delete: ${TASK}` });
  if ((await deleteTask.count()) > 0) {
    await deleteTask.click();
    await expect(deleteTask).toHaveCount(0);
  }
  const deleteTask2 = page.getByRole("button", { name: `Delete: ${TASK2}` });
  if ((await deleteTask2.count()) > 0) {
    await deleteTask2.click();
    await expect(deleteTask2).toHaveCount(0);
  }
  if ((await anySidebarLink(page).count()) > 0) {
    await anySidebarLink(page).click();
    await expect(page).toHaveURL(/\/lists\/\d+$/);
    await page.getByRole("button", { name: `Delete list: ${LIST}` }).click();
    await expect(page).toHaveURL(/\/$/);
  }
  await page.close();
});

test("Lists: creating a list shows it in the sidebar with (0)", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("List name").fill(LIST);
  await page.getByRole("button", { name: "Create list" }).click();

  await expect(sidebarLink(page, 0)).toBeVisible();
  await expect(sidebarLink(page, 0)).toHaveAttribute("href", /^\/lists\/\d+$/);
  await expect(page.getByLabel("List name")).toHaveValue("");
});

test("Lists: adding a task on the list page shows it there with (1) and a list link on /", async ({
  page,
}) => {
  await page.goto("/");
  await sidebarLink(page, 0).click();
  await expect(page).toHaveURL(/\/lists\/\d+$/);
  const listId = new URL(page.url()).pathname.split("/").pop() ?? "";
  await expect(
    page.getByRole("heading", { level: 2, name: LIST }),
  ).toBeVisible();
  await expect(sidebarLink(page, 0)).toHaveAttribute("aria-current", "page");
  await expect(page.getByLabel("List", { exact: true })).toHaveValue(listId);

  await page.getByLabel("Title").fill(TASK);
  await page.getByRole("button", { name: "Add task" }).click();

  await expect(page).toHaveURL(new RegExp(`/lists/${listId}$`));
  await expect(openList(page).getByText(TASK, { exact: true })).toBeVisible();
  await expect(sidebarLink(page, 1)).toBeVisible();
  await expect(page.getByLabel("Title")).toHaveValue("");
  await expect(page.getByLabel("List", { exact: true })).toHaveValue(listId);

  await page.goto("/");
  const row = openList(page).getByRole("listitem").filter({ hasText: TASK });
  await expect(row).toHaveCount(1);
  await expect(
    row.getByRole("link", { name: LIST, exact: true }),
  ).toHaveAttribute("href", `/lists/${listId}`);
});

test("Lists: editing the task to No list removes the link and the count returns to (0)", async ({
  page,
}) => {
  await page.goto("/");
  await openList(page)
    .getByRole("listitem")
    .filter({ hasText: TASK })
    .getByRole("link", { name: "Edit" })
    .click();
  await expect(page).toHaveURL(/\/tasks\/\d+\/edit$/);
  await expect(page.getByLabel("List", { exact: true })).not.toHaveValue("");

  await page.getByLabel("List", { exact: true }).selectOption("");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page).toHaveURL(/\/$/);
  const row = openList(page).getByRole("listitem").filter({ hasText: TASK });
  await expect(row).toHaveCount(1);
  await expect(row.getByRole("link", { name: LIST, exact: true })).toHaveCount(
    0,
  );
  await expect(sidebarLink(page, 0)).toBeVisible();
});

test("Lists: creating the same name again shows the duplicate message", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("List name").fill(LIST);
  await page.getByRole("button", { name: "Create list" }).click();

  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "A list with that name already exists." }),
  ).toHaveText("A list with that name already exists.");
  await expect(page.getByLabel("List name")).toHaveValue(LIST);
  await expect(anySidebarLink(page)).toHaveCount(1);
});

test("Lists: deleting the list lands on / with the tasks kept, no list link, and no sidebar entry", async ({
  page,
}) => {
  await page.goto("/");
  await sidebarLink(page, 0).click();
  await expect(page).toHaveURL(/\/lists\/\d+$/);
  const listId = new URL(page.url()).pathname.split("/").pop() ?? "";

  // A second task, still attached to the list when it is deleted, so the
  // delete exercises ON DELETE SET NULL through the UI (TASK's list_id was
  // already nulled by the earlier edit-to-No-list test).
  await page.getByLabel("Title").fill(TASK2);
  await page.getByRole("button", { name: "Add task" }).click();
  await expect(page).toHaveURL(new RegExp(`/lists/${listId}$`));
  await expect(openList(page).getByText(TASK2, { exact: true })).toBeVisible();

  await page.getByRole("button", { name: `Delete list: ${LIST}` }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(openList(page).getByText(TASK, { exact: true })).toBeVisible();
  await expect(openList(page).getByText(TASK2, { exact: true })).toBeVisible();
  const breadRow = openList(page)
    .getByRole("listitem")
    .filter({ hasText: TASK2 });
  await expect(
    breadRow.getByRole("link", { name: LIST, exact: true }),
  ).toHaveCount(0);
  await expect(anySidebarLink(page)).toHaveCount(0);
  await expect(
    listsNav(page).getByRole("link", { name: "All tasks" }),
  ).toHaveAttribute("aria-current", "page");
});

test("Lists: /lists/999999 responds 404", async ({ page }) => {
  const res = await page.goto("/lists/999999");
  expect(res?.status()).toBe(404);
});
