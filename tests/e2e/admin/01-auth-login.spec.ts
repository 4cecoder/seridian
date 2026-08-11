import { test, expect } from "@playwright/test";
import { quickLogin, loginAs } from "../helpers";

test.describe("Auth & Login", () => {
  test.beforeEach(async ({ page }) => {
    // Ensure clean state: remove stored auth before each test
    await page.goto("/dashboard");
    await page.evaluate(() => localStorage.removeItem("seridian_user"));
  });

  test("1. login screen renders correctly", async ({ page }) => {
    await page.goto("/dashboard");

    // Heading
    await expect(page.getByRole("heading", { name: "Seridian Dashboard" })).toBeVisible();

    // Subtitle
    await expect(page.getByText("Sign in to continue")).toBeVisible();

    // Form inputs
    await expect(page.getByPlaceholder("e.g. admin")).toBeVisible();
    await expect(page.getByPlaceholder("e.g. Admin")).toBeVisible();

    // Sign In button
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();

    // Quick login button
    await expect(page.getByRole("button", { name: "Quick Login as Admin" })).toBeVisible();
  });

  test("2. empty form submission does nothing", async ({ page }) => {
    await page.goto("/dashboard");

    const signInBtn = page.getByRole("button", { name: "Sign In" });

    // Button should be disabled when both fields are empty
    await expect(signInBtn).toBeDisabled();

    // Click the button (should be a no-op since it's disabled)
    await signInBtn.click({ force: true });

    // Still on login screen
    await expect(page.getByRole("heading", { name: "Seridian Dashboard" })).toBeVisible();
    // No sidebar should appear
    await expect(page.locator("aside nav")).not.toBeVisible();
  });

  test("3. full login with credentials loads dashboard", async ({ page }) => {
    await page.goto("/dashboard");

    // Fill form
    await page.getByPlaceholder("e.g. admin").fill("admin");
    await page.getByPlaceholder("e.g. Admin").fill("Admin");

    // Button should now be enabled
    await expect(page.getByRole("button", { name: "Sign In" })).toBeEnabled();

    // Submit
    await page.getByRole("button", { name: "Sign In" }).click();

    // Dashboard sidebar should appear
    await expect(page.locator("aside nav")).toBeVisible();

    // Sidebar should have nav items
    await expect(page.locator("aside nav").getByText("Overview")).toBeVisible();
  });

  test("4. quick login button loads dashboard", async ({ page }) => {
    await page.goto("/dashboard");

    await page.getByRole("button", { name: "Quick Login as Admin" }).click();

    // Dashboard sidebar should appear
    await expect(page.locator("aside nav")).toBeVisible();
    await expect(page.locator("aside nav").getByText("Overview")).toBeVisible();
  });

  test("5. user name displayed in top bar after login", async ({ page }) => {
    await quickLogin(page);

    // The DashboardGuard renders the user name in a span
    await expect(page.getByText("Admin")).toBeVisible();
  });

  test("6. sign out clears auth and returns to login screen", async ({ page }) => {
    await quickLogin(page);

    // Click sign out
    await page.getByRole("button", { name: "Sign out" }).click();

    // Should return to login screen
    await expect(page.getByRole("heading", { name: "Seridian Dashboard" })).toBeVisible();
    await expect(page.getByText("Sign in to continue")).toBeVisible();

    // Sidebar should be gone
    await expect(page.locator("aside nav")).not.toBeVisible();
  });

  test("7. refreshing page after login persists session", async ({ page }) => {
    await quickLogin(page);

    // Reload the page
    await page.reload();

    // Should still be logged in — sidebar visible
    await expect(page.locator("aside nav")).toBeVisible();

    // User name still shown
    await expect(page.getByText("Admin")).toBeVisible();
  });

  test("8. wrong empty credentials show disabled button", async ({ page }) => {
    await page.goto("/dashboard");

    const signInBtn = page.getByRole("button", { name: "Sign In" });

    // Fill only pubkey — button should remain disabled
    await page.getByPlaceholder("e.g. admin").fill("admin");
    await expect(signInBtn).toBeDisabled();

    // Clear pubkey, fill only name — button should remain disabled
    await page.getByPlaceholder("e.g. admin").clear();
    await page.getByPlaceholder("e.g. Admin").fill("Admin");
    await expect(signInBtn).toBeDisabled();

    // Fill both — now enabled
    await page.getByPlaceholder("e.g. admin").fill("admin");
    await expect(signInBtn).toBeEnabled();
  });
});
