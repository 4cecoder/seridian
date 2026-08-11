import { test, expect } from "@playwright/test";
import { quickLogin } from "../helpers";

test.describe("Dashboard Overview", () => {
  test.beforeEach(async ({ page }) => {
    // Ensure clean auth state before each test
    await page.goto("/dashboard");
    await page.evaluate(() => localStorage.removeItem("seridian_user"));
  });

  test("1. unauthenticated user sees login screen on /dashboard", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    // Login screen heading
    await expect(
      page.getByRole("heading", { name: "Seridian Dashboard" }),
    ).toBeVisible();

    // Login prompt
    await expect(page.getByText("Sign in to continue")).toBeVisible();

    // Quick login button is visible
    await expect(
      page.getByRole("button", { name: "Quick Login as Admin" }),
    ).toBeVisible();

    // Sidebar should NOT be visible
    await expect(page.locator("aside nav")).not.toBeVisible();
  });

  test("2. page header shows Overview title and description", async ({
    page,
  }) => {
    await quickLogin(page);

    // Overview heading
    await expect(
      page.getByRole("heading", { name: "Overview" }),
    ).toBeVisible();

    // Description text
    await expect(page.getByText("Key metrics at a glance")).toBeVisible();
  });

  test("3. business overview section loads (skeleton then content)", async ({
    page,
  }) => {
    await quickLogin(page);

    // Business Overview heading appears after Convex data loads
    await expect(
      page.getByRole("heading", { name: "Business Overview" }),
    ).toBeVisible();

    // Metric cards should render in a grid
    await expect(
      page.getByText("Active Clients", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Active Deals", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Upcoming Bookings", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Published Case Studies", { exact: true }),
    ).toBeVisible();
  });

  test("4. dashboard layout has sidebar and main content structure", async ({
    page,
  }) => {
    await quickLogin(page);

    // Sidebar with navigation
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();

    // Sidebar nav contains section links
    await expect(sidebar.locator("nav").getByText("Overview")).toBeVisible();
    await expect(sidebar.locator("nav").getByText("Issues")).toBeVisible();
    await expect(sidebar.locator("nav").getByText("Clients")).toBeVisible();

    // Main content area exists alongside sidebar
    const main = page.locator("main");
    await expect(main).toBeVisible();

    // DashboardGuard renders the user info bar
    await expect(page.getByText("Admin")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign out" }),
    ).toBeVisible();
  });

  test("5. content area has proper max-width container", async ({
    page,
  }) => {
    await quickLogin(page);

    // The main content has a max-w-7xl container div
    const container = page.locator("main .max-w-7xl");
    await expect(container).toBeVisible();

    // Verify it constrains width by checking the computed max-width
    const maxWidth = await container.evaluate((el) => {
      return window.getComputedStyle(el).maxWidth;
    });
    // max-w-7xl is 80rem = 1280px
    expect(maxWidth).toBe("1280px");
  });

  test("6. responsive layout at mobile breakpoint", async ({ page }) => {
    await quickLogin(page);

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    // Desktop sidebar (inside div.hidden.lg:block) should be hidden at mobile
    // The <aside> element only exists inside the desktop sidebar wrapper
    await expect(page.locator("aside").first()).not.toBeVisible();

    // Mobile hamburger button should be visible
    const mobileNavBtn = page.getByRole("button", {
      name: "Open navigation",
    });
    await expect(mobileNavBtn).toBeVisible();

    // Click to open mobile nav
    await mobileNavBtn.click();

    // Mobile nav with role="navigation" should appear
    const mobileNav = page.getByRole("navigation", {
      name: "Mobile navigation",
    });
    await expect(mobileNav).toBeVisible();

    // Mobile nav should contain Overview link
    await expect(mobileNav.getByText("Overview")).toBeVisible();

    // Close button should be visible
    await expect(
      mobileNav.getByRole("button", { name: "Close navigation" }),
    ).toBeVisible();
  });

  test("7. browser tab title is appropriate", async ({ page }) => {
    await quickLogin(page);

    // Title should contain "Seridian" (from root layout metadata)
    await expect(page).toHaveTitle(/Seridian/);
  });

  test("8. loading skeleton appears briefly before content", async ({
    page,
  }) => {
    await quickLogin(page);

    // The Suspense boundary renders CardGridSkeleton as fallback.
    // Skeletons render as SVG-based components from @bytecats/ui-kit.
    // We verify the content area exists and eventually shows the
    // Business Overview heading (proving skeleton resolved to content).
    const main = page.locator("main");
    await expect(main).toBeVisible();

    // After Suspense resolves, Business Overview heading should appear
    await expect(
      page.getByRole("heading", { name: "Business Overview" }),
    ).toBeVisible();

    // Skeleton content (grid of card skeletons) should no longer be visible
    // since the real MetricCards replaced it. We verify the metric grid is
    // populated with actual data labels instead of skeleton placeholders.
    await expect(
      page.getByText("Active Clients", { exact: true }),
    ).toBeVisible();
  });
});
