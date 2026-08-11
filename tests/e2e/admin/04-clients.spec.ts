import { test, expect } from "@playwright/test";
import { quickLogin, waitForConvexLoad } from "../helpers";

/** Unique test data to avoid collisions with existing clients. */
function uniqueClient() {
  const ts = Date.now();
  return {
    name: `E2E Client ${ts}`,
    company: `Test Co ${ts}`,
    email: `e2e${ts}@test.com`,
    phone: "+1 (555) 000-1234",
    notes: "Created by E2E test",
    website: "https://example.com",
    industry: "Technology",
  };
}

test.describe("Clients", () => {
  test.beforeEach(async ({ page }) => {
    // Log in and navigate to clients page
    await quickLogin(page);
    await page.goto("/dashboard/clients");
    // Wait for Convex data to load
    await waitForConvexLoad(page);
  });

  test("1. page loads with Clients header", async ({ page }) => {
    // PageHeader renders the title "Clients"
    await expect(page.getByRole("heading", { name: "Clients" }).first()).toBeVisible();

    // ClientList also has a heading
    await expect(page.getByText("Manage your client relationships")).toBeVisible();
  });

  test("2. Add Client button opens form dialog", async ({ page }) => {
    // Click the "+ Add Client" button
    await page.getByRole("button", { name: "+ Add Client" }).click();

    // Dialog should appear with title "New Client"
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("New Client")).toBeVisible();

    // "Create Client" submit button should be present
    await expect(page.getByRole("button", { name: "Create Client" })).toBeVisible();

    // Cancel button should be present
    await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
  });

  test("3. form shows all expected fields", async ({ page }) => {
    await page.getByRole("button", { name: "+ Add Client" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Check all field labels exist
    await expect(page.locator("label").filter({ hasText: "Name *" })).toBeVisible();
    await expect(page.locator("label").filter({ hasText: "Company *" })).toBeVisible();
    await expect(page.locator("label").filter({ hasText: "Email *" })).toBeVisible();
    await expect(page.locator("label").filter({ hasText: "Phone" })).toBeVisible();
    await expect(page.locator("label").filter({ hasText: "Website" })).toBeVisible();
    await expect(page.locator("label").filter({ hasText: "Industry" })).toBeVisible();
    await expect(page.locator("label").filter({ hasText: "Notes" })).toBeVisible();
    await expect(page.locator("label").filter({ hasText: "Status" })).toBeVisible();

    // Check input fields exist by their IDs
    await expect(page.locator("#client-name")).toBeVisible();
    await expect(page.locator("#client-company")).toBeVisible();
    await expect(page.locator("#client-email")).toBeVisible();
    await expect(page.locator("#client-phone")).toBeVisible();
    await expect(page.locator("#client-website")).toBeVisible();
    await expect(page.locator("#client-industry")).toBeVisible();
    await expect(page.locator("#client-notes")).toBeVisible();
  });

  test("4. required field validation shows errors on empty submit", async ({ page }) => {
    await page.getByRole("button", { name: "+ Add Client" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Submit the form without filling anything
    await page.getByRole("button", { name: "Create Client" }).click();

    // Validation error messages should appear
    await expect(page.getByText("Name is required")).toBeVisible();
    await expect(page.getByText("Company is required")).toBeVisible();
    await expect(page.getByText("Email is required")).toBeVisible();

    // Dialog should still be open (form not submitted)
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("5. invalid email shows validation error", async ({ page }) => {
    await page.getByRole("button", { name: "+ Add Client" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Fill name and company (valid), but use invalid email
    await page.locator("#client-name").fill("Valid Name");
    await page.locator("#client-company").fill("Valid Company");
    await page.locator("#client-email").fill("not-an-email");

    await page.getByRole("button", { name: "Create Client" }).click();

    // Should show email validation error
    await expect(page.getByText("Invalid email address")).toBeVisible();

    // Dialog should still be open
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("6. create a new client successfully", async ({ page }) => {
    const client = uniqueClient();

    await page.getByRole("button", { name: "+ Add Client" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Fill required fields
    await page.locator("#client-name").fill(client.name);
    await page.locator("#client-company").fill(client.company);
    await page.locator("#client-email").fill(client.email);

    // Fill optional fields
    await page.locator("#client-phone").fill(client.phone);
    await page.locator("#client-notes").fill(client.notes);
    await page.locator("#client-website").fill(client.website);
    await page.locator("#client-industry").fill(client.industry);

    // Submit
    await page.getByRole("button", { name: "Create Client" }).click();

    // Dialog should close
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // New client should appear in the list
    await expect(page.getByText(client.name)).toBeVisible();
    await expect(page.getByText(client.company)).toBeVisible();
    await expect(page.getByText(client.email)).toBeVisible();
  });

  test("7. client row shows avatar, name, status badge, company, and email", async ({ page }) => {
    const client = uniqueClient();

    // Create a client first
    await page.getByRole("button", { name: "+ Add Client" }).click();
    await page.locator("#client-name").fill(client.name);
    await page.locator("#client-company").fill(client.company);
    await page.locator("#client-email").fill(client.email);
    await page.getByRole("button", { name: "Create Client" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // Find the row containing this client
    const row = page.locator("div").filter({ hasText: client.name }).first();

    // Avatar should show first letter of name
    await expect(row.locator("div").filter({ hasText: client.name.charAt(0).toUpperCase() }).first()).toBeVisible();

    // Name link should be visible
    await expect(row.getByText(client.name)).toBeVisible();

    // Status badge should show "active" (default)
    await expect(row.getByText("active")).toBeVisible();

    // Company should be visible
    await expect(row.getByText(client.company)).toBeVisible();

    // Email should be visible (in the sm:flex container)
    await expect(row.getByText(client.email)).toBeVisible();
  });

  test("8. edit client opens form pre-filled and saves changes", async ({ page }) => {
    const client = uniqueClient();

    // Create a client first
    await page.getByRole("button", { name: "+ Add Client" }).click();
    await page.locator("#client-name").fill(client.name);
    await page.locator("#client-company").fill(client.company);
    await page.locator("#client-email").fill(client.email);
    await page.getByRole("button", { name: "Create Client" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // Hover over the row to reveal the Edit button, then click it
    const nameLink = page.getByText(client.name);
    await nameLink.hover();
    // The edit button is in the same row, find it via the row container
    const editBtn = page.locator("button").filter({ hasText: "Edit" }).last();
    await editBtn.click();

    // Dialog should open with "Edit Client" title
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Edit Client")).toBeVisible();

    // Form should be pre-filled with existing data
    await expect(page.locator("#client-name")).toHaveValue(client.name);
    await expect(page.locator("#client-company")).toHaveValue(client.company);
    await expect(page.locator("#client-email")).toHaveValue(client.email);

    // Update the name
    const updatedName = `${client.name} Updated`;
    await page.locator("#client-name").fill(updatedName);

    // Submit update
    await page.getByRole("button", { name: "Update Client" }).click();

    // Dialog should close
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // Updated name should appear in the list
    await expect(page.getByText(updatedName)).toBeVisible();
  });

  test("9. clicking client name navigates to detail page", async ({ page }) => {
    const client = uniqueClient();

    // Create a client first
    await page.getByRole("button", { name: "+ Add Client" }).click();
    await page.locator("#client-name").fill(client.name);
    await page.locator("#client-company").fill(client.company);
    await page.locator("#client-email").fill(client.email);
    await page.getByRole("button", { name: "Create Client" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // Click on the client name link
    await page.getByText(client.name).click();

    // Should navigate to the client detail page
    await expect(page).toHaveURL(/\/dashboard\/clients\//);
  });

  test("10. cancel button closes form without saving", async ({ page }) => {
    await page.getByRole("button", { name: "+ Add Client" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Fill in some data
    await page.locator("#client-name").fill("Should Not Save");
    await page.locator("#client-company").fill("Should Not Save Co");
    await page.locator("#client-email").fill("shouldnotsave@test.com");

    // Click Cancel
    await page.getByRole("button", { name: "Cancel" }).click();

    // Dialog should close
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // The client should NOT appear in the list
    await expect(page.getByText("Should Not Save")).not.toBeVisible();

    // Re-open form to verify fields are reset (not pre-filled)
    await page.getByRole("button", { name: "+ Add Client" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.locator("#client-name")).toHaveValue("");
    await expect(page.locator("#client-company")).toHaveValue("");
    await expect(page.locator("#client-email")).toHaveValue("");
  });
});
