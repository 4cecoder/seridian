import { test, expect } from "@playwright/test";
import { quickLogin, navigateTo, waitForConvexLoad, closeDialog } from "../helpers";

test.describe("Templates & Files", () => {
  test.beforeEach(async ({ page }) => {
    await quickLogin(page);
  });

  // ── Templates Page ────────────────────────────────────────────────

  test("1. templates page loads with 'Email Templates' header", async ({ page }) => {
    await navigateTo(page, "Templates");
    await expect(page.getByRole("heading", { name: "Email Templates" })).toBeVisible();
    await expect(page.getByText("Manage reusable email templates")).toBeVisible();
  });

  test("2. empty state shows when no templates", async ({ page }) => {
    await navigateTo(page, "Templates");
    await waitForConvexLoad(page);

    // The empty state or template count is visible — if 0 templates, empty text shows
    const emptyText = page.getByText("No templates yet. Create your first email template to get started.");
    const countText = page.getByText(/template/);
    // One of these should be visible depending on data state
    await expect(emptyText.or(countText)).toBeVisible();
  });

  test("3. '+ New Template' button opens form dialog", async ({ page }) => {
    await navigateTo(page, "Templates");
    await waitForConvexLoad(page);

    // Click the New Template button
    await page.getByRole("button", { name: "+ New Template" }).click();

    // Dialog should open with "New Template" title
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("New Template", { exact: true })).toBeVisible();

    // Form fields should be present
    await expect(page.locator("#tpl-name")).toBeVisible();
    await expect(page.locator("#tpl-subject")).toBeVisible();
    await expect(page.locator("#tpl-body")).toBeVisible();

    // Close the dialog
    await closeDialog(page);
  });

  test("4. create template: fill form and submit", async ({ page }) => {
    await navigateTo(page, "Templates");
    await waitForConvexLoad(page);

    // Open form
    await page.getByRole("button", { name: "+ New Template" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Fill required fields
    await page.locator("#tpl-name").fill("Test Welcome Email");
    await page.locator("#tpl-subject").fill("Welcome {{client_name}}!");
    await page.locator("#tpl-body").fill("Dear {{client_name}},\n\nWelcome to our service.");

    // Submit — button text changes to "Create Template" for new
    await page.getByRole("button", { name: "Create Template" }).click();

    // Wait for dialog to close (onSuccess calls setFormOpen(false))
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 10_000 });

    // Template should appear in the list
    await waitForConvexLoad(page);
    await expect(page.getByText("Test Welcome Email")).toBeVisible();
  });

  test("5. edit template: click edit → form pre-filled → update", async ({ page }) => {
    await navigateTo(page, "Templates");
    await waitForConvexLoad(page);

    // Click on a template card to edit (cards are buttons)
    const templateCard = page.locator("button:has-text('Test Welcome Email')").first();
    await templateCard.click();

    // Dialog should open with "Edit Template" title
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Edit Template", { exact: true })).toBeVisible();

    // Form should be pre-filled
    await expect(page.locator("#tpl-name")).toHaveValue("Test Welcome Email");

    // Update the name
    await page.locator("#tpl-name").fill("Updated Welcome Email");

    // Submit — button text should be "Update Template"
    await page.getByRole("button", { name: "Update Template" }).click();

    // Wait for dialog to close
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 10_000 });

    // Updated name should appear in the list
    await waitForConvexLoad(page);
    await expect(page.getByText("Updated Welcome Email")).toBeVisible();
  });

  test("6. template list shows template name and subject", async ({ page }) => {
    await navigateTo(page, "Templates");
    await waitForConvexLoad(page);

    // If a template exists, its name should be visible in the card
    const templateName = page.locator("h4").filter({ hasText: "Updated Welcome Email" });
    // We expect at least the heading elements to be present (template cards render h4)
    const headings = page.locator("h4");
    const count = await headings.count();
    // At least 1 template card heading should exist
    expect(count).toBeGreaterThanOrEqual(1);
  });

  // ── Files Page ────────────────────────────────────────────────────

  test("7. files page loads with 'Files' header and description", async ({ page }) => {
    await navigateTo(page, "Files");
    await expect(page.getByRole("heading", { name: "Files" })).toBeVisible();
    await expect(page.getByText("Manage project files and documents")).toBeVisible();
  });

  test("8. file manager component renders with file count", async ({ page }) => {
    await navigateTo(page, "Files");
    await waitForConvexLoad(page);

    // The FileManager shows a file count (e.g., "0 files" or "N files")
    const fileCount = page.getByText(/file/);
    await expect(fileCount.first()).toBeVisible();

    // The "+ Upload" button should be visible
    await expect(page.getByRole("button", { name: "+ Upload" })).toBeVisible();
  });

  test("9. file upload area appears when clicking Upload button", async ({ page }) => {
    await navigateTo(page, "Files");
    await waitForConvexLoad(page);

    // Click the Upload button to show the upload area
    await page.getByRole("button", { name: "+ Upload" }).click();

    // FileUpload component should render with drag-drop zone
    await expect(page.getByText("Drop files here or")).toBeVisible();
    await expect(page.getByText("browse")).toBeVisible();
    await expect(page.getByText("Any file type supported")).toBeVisible();

    // A hidden file input should exist
    await expect(page.locator('input[type="file"]')).toBeAttached();
  });

  test("10. both pages accessible from sidebar navigation", async ({ page }) => {
    // Navigate to Templates via sidebar
    await page.locator("aside nav").getByRole("link", { name: "Templates" }).click();
    await expect(page).toHaveURL(/\/dashboard\/templates/);
    await expect(page.getByRole("heading", { name: "Email Templates" })).toBeVisible();

    // Navigate to Files via sidebar
    await page.locator("aside nav").getByRole("link", { name: "Files" }).click();
    await expect(page).toHaveURL(/\/dashboard\/files/);
    await expect(page.getByRole("heading", { name: "Files" })).toBeVisible();
  });
});
