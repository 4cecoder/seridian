import { test, expect } from "@playwright/test";
import { quickLogin } from "../helpers";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard" },
  { label: "Issues", href: "/dashboard/issues" },
  { label: "Clients", href: "/dashboard/clients" },
  { label: "Bookings", href: "/dashboard/bookings" },
  { label: "Sales", href: "/dashboard/sales" },
  { label: "Proposals", href: "/dashboard/proposals" },
  { label: "Templates", href: "/dashboard/templates" },
  { label: "Files", href: "/dashboard/files" },
  { label: "Sync", href: "/dashboard/sync" },
  { label: "Chat", href: "/dashboard/chat" },
];

test.describe("Sidebar & Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await quickLogin(page);
  });

  // ── 1. All 10 nav items present ────────────────────────────────────
  test("renders all 10 nav items in the sidebar", async ({ page }) => {
    const sidebar = page.locator("aside nav");
    for (const item of NAV_ITEMS) {
      await expect(sidebar.getByRole("link", { name: item.label })).toBeVisible();
    }
  });

  // ── 2. Each nav link has correct href ──────────────────────────────
  test("each nav link points to the correct href", async ({ page }) => {
    const sidebar = page.locator("aside nav");
    for (const item of NAV_ITEMS) {
      const link = sidebar.getByRole("link", { name: item.label });
      await expect(link).toHaveAttribute("href", item.href);
    }
  });

  // ── 3. Active nav item is highlighted ──────────────────────────────
  test("active nav item is visually highlighted", async ({ page }) => {
    // On /dashboard the Overview link should be active
    const overviewLink = page.locator("aside nav a").first();
    await expect(overviewLink).toHaveClass(/bg-seridian-500\/10/);
    await expect(overviewLink).toHaveClass(/text-seridian-400/);
  });

  // ── 4. Collapse button toggles sidebar width ──────────────────────
  test("collapse button toggles sidebar between 240px and 60px", async ({
    page,
  }) => {
    const sidebar = page.locator("aside").first();
    const collapseBtn = page.getByRole("button", { name: "Collapse sidebar" });

    // Expanded: 240px
    await expect(sidebar).toHaveClass(/w-\[240px\]/);

    // Click collapse
    await collapseBtn.click();

    // Collapsed: 60px
    await expect(sidebar).toHaveClass(/w-\[60px\]/);
  });

  // ── 5. When collapsed, labels are hidden ──────────────────────────
  test("when collapsed, nav labels are hidden and only icons are visible", async ({
    page,
  }) => {
    const sidebar = page.locator("aside").first();

    // Verify labels visible first
    for (const item of NAV_ITEMS) {
      await expect(
        page.locator("aside nav").getByText(item.label, { exact: true })
      ).toBeVisible();
    }

    // Collapse sidebar
    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    await expect(sidebar).toHaveClass(/w-\[60px\]/);

    // Labels should no longer be in the DOM (conditionally rendered with {!collapsed && ...})
    for (const item of NAV_ITEMS) {
      const labelSpan = page
        .locator("aside nav a")
        .getByText(item.label, { exact: true });
      await expect(labelSpan).toBeHidden();
    }
  });

  // ── 6. When collapsed, expanding restores labels ──────────────────
  test("expanding the sidebar restores nav labels", async ({ page }) => {
    const sidebar = page.locator("aside").first();

    // Collapse first
    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    await expect(sidebar).toHaveClass(/w-\[60px\]/);

    // Expand
    await page.getByRole("button", { name: "Expand sidebar" }).click();
    await expect(sidebar).toHaveClass(/w-\[240px\]/);

    // Labels should be visible again
    for (const item of NAV_ITEMS) {
      await expect(
        page.locator("aside nav").getByText(item.label, { exact: true })
      ).toBeVisible();
    }
  });

  // ── 7. Clicking nav items navigates to correct pages ──────────────
  for (const item of NAV_ITEMS) {
    test(`clicking "${item.label}" navigates to ${item.href}`, async ({
      page,
    }) => {
      await page.locator("aside nav").getByRole("link", { name: item.label }).click();
      await expect(page).toHaveURL(new RegExp(item.href));
    });
  }

  // ── 8. Logo "Seridian" text visible and links to home ─────────────
  test("logo text 'Seridian' is visible and links to home", async ({
    page,
  }) => {
    const logoLink = page.locator('aside a[href="/"]').first();
    await expect(logoLink).toBeVisible();

    const logoText = logoLink.getByText("Seridian", { exact: true });
    await expect(logoText).toBeVisible();

    // Verify it links to /
    await expect(logoLink).toHaveAttribute("href", "/");
  });

  // ── 9. Mobile: hamburger visible, sidebar hidden ──────────────────
  test("mobile viewport shows hamburger menu and hides sidebar", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    // Sidebar wrapper should be hidden on mobile (hidden lg:block)
    const sidebarWrapper = page.locator("div.hidden.lg\\:block");
    await expect(sidebarWrapper).toBeHidden();

    // Hamburger button should be visible
    const hamburger = page.getByRole("button", { name: "Open navigation" });
    await expect(hamburger).toBeVisible();
  });

  // ── 10. Mobile hamburger opens navigation overlay ─────────────────
  test("mobile hamburger opens the navigation overlay", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    const hamburger = page.getByRole("button", { name: "Open navigation" });
    await expect(hamburger).toBeVisible();
    await hamburger.click();

    // MobileNav overlay should now be visible
    const mobileNav = page.getByRole("navigation", {
      name: "Mobile navigation",
    });
    await expect(mobileNav).toBeVisible();

    // The mobile nav should contain the same nav items
    for (const item of NAV_ITEMS) {
      await expect(mobileNav.getByRole("link", { name: item.label })).toBeVisible();
    }

    // Close via Escape
    await page.keyboard.press("Escape");
    await expect(mobileNav).toBeHidden();
  });
});
