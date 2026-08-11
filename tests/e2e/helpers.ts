import { type Page, type expect as Expect } from "@playwright/test";

/** Dashboard auth is localStorage-based (seridian_user JSON). */
export async function loginAs(
  page: Page,
  name = "Admin",
  pubkey = "admin",
) {
  await page.goto("/dashboard");
  // Wait for the login screen to appear
  await page.waitForSelector("text=Sign in to continue", { timeout: 10_000 });
  // Fill the form and submit
  await page.fill('input[placeholder="e.g. admin"]', pubkey);
  await page.fill('input[placeholder="e.g. Admin"]', name);
  await page.click('button:has-text("Sign In")');
  // Wait for dashboard to load (sidebar appears)
  await page.waitForSelector('aside nav', { timeout: 10_000 });
}

/** Quick-login via the "Quick Login as Admin" button. */
export async function quickLogin(page: Page) {
  await page.goto("/dashboard");
  await page.waitForSelector("text=Sign in to continue", { timeout: 10_000 });
  await page.click('button:has-text("Quick Login as Admin")');
  await page.waitForSelector('aside nav', { timeout: 10_000 });
}

/** Navigate to a dashboard section via sidebar link. */
export async function navigateTo(page: Page, section: string) {
  const link = page.locator(`aside nav a:has-text("${section}")`);
  await link.click();
  // Wait for route change
  await page.waitForLoadState("networkidle");
}

/** Wait for a Convex-powered list to finish loading. */
export async function waitForConvexLoad(page: Page) {
  // Convex queries show loading spinners that disappear when data arrives
  await page.waitForLoadState("networkidle");
  // Small extra wait for React re-render after Convex data arrives
  await page.waitForTimeout(500);
}

/** Close any open dialog by pressing Escape. */
export async function closeDialog(page: Page) {
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
}
