import { test, expect } from "@playwright/test";
import { quickLogin } from "../helpers";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function currentMonthLabel(): string {
  return new Date().toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

test.describe("Bookings", () => {
  test.beforeEach(async ({ page }) => {
    await quickLogin(page);
    await page.locator("aside nav a").filter({ hasText: "Bookings" }).click();
    await page.waitForLoadState("networkidle");
  });

  // ── 1. Page loads with header ──────────────────────────────────────
  test("loads with 'Bookings' header and description", async ({ page }) => {
    const heading = page.locator("h1");
    await expect(heading).toHaveText("Bookings");

    const description = page.getByText("Schedule and manage appointments");
    await expect(description).toBeVisible();
  });

  // ── 2. Calendar displays current month ─────────────────────────────
  test("calendar displays the current month", async ({ page }) => {
    const monthLabel = page.locator("h3").filter({ hasText: currentMonthLabel() });
    await expect(monthLabel).toBeVisible();
  });

  // ── 3. Calendar shows day names ────────────────────────────────────
  test("calendar header shows day names Mon–Sun", async ({ page }) => {
    // On desktop, full day names are rendered via hidden sm:inline
    for (const day of WEEKDAYS) {
      // Use the desktop variant (full name in hidden span)
      const dayHeader = page
        .locator(".grid.grid-cols-7 > div")
        .filter({ hasText: day });
      await expect(dayHeader).toBeVisible();
    }
  });

  // ── 4. Clicking a day opens booking form modal ─────────────────────
  test("clicking a calendar day opens the booking form modal", async ({ page }) => {
    // Find a day button in the current month's calendar grid
    // The grid is grid-cols-7; day buttons contain day numbers
    const dayButton = page
      .locator(".grid.grid-cols-7 > button")
      .filter({ hasText: /^15$/ })
      .first();
    await dayButton.click();

    // The modal overlay should appear
    const overlay = page.locator(".fixed.inset-0.z-50");
    await expect(overlay).toBeVisible();

    // The form should be visible inside
    const form = overlay.locator("form");
    await expect(form).toBeVisible();
  });

  // ── 5. Modal shows 'New Booking' title ─────────────────────────────
  test("modal displays 'New Booking' title", async ({ page }) => {
    const newBookingBtn = page.getByRole("button", { name: "+ New Booking" });
    await newBookingBtn.click();

    const modalTitle = page.locator("h2").filter({ hasText: "New Booking" });
    await expect(modalTitle).toBeVisible();
  });

  // ── 6. Booking form has all required fields ────────────────────────
  test("booking form contains title, client, start/end time, and type fields", async ({
    page,
  }) => {
    const newBookingBtn = page.getByRole("button", { name: "+ New Booking" });
    await newBookingBtn.click();

    const overlay = page.locator(".fixed.inset-0.z-50");
    await expect(overlay).toBeVisible();

    // Title input
    const titleInput = page.locator("#booking-title");
    await expect(titleInput).toBeVisible();

    // Client select
    const clientLabel = page.locator("label").filter({ hasText: "Client" });
    await expect(clientLabel).toBeVisible();

    // Start time
    const startInput = page.locator("#booking-start");
    await expect(startInput).toBeVisible();

    // End time
    const endInput = page.locator("#booking-end");
    await expect(endInput).toBeVisible();

    // Type select
    const typeLabel = page.locator("label").filter({ hasText: "Type" });
    await expect(typeLabel).toBeVisible();
  });

  // ── 7. Close button (×) dismisses modal ────────────────────────────
  test("close button (×) dismisses the modal", async ({ page }) => {
    const newBookingBtn = page.getByRole("button", { name: "+ New Booking" });
    await newBookingBtn.click();

    const overlay = page.locator(".fixed.inset-0.z-50");
    await expect(overlay).toBeVisible();

    // Click the × close button
    const closeBtn = overlay.locator("button").filter({ hasText: "×" });
    await closeBtn.click();

    // Modal should be gone
    await expect(overlay).toBeHidden();
  });

  // ── 8. Cancel button dismisses modal ───────────────────────────────
  test("Cancel button dismisses the modal when present", async ({ page }) => {
    const newBookingBtn = page.getByRole("button", { name: "+ New Booking" });
    await newBookingBtn.click();

    const overlay = page.locator(".fixed.inset-0.z-50");
    await expect(overlay).toBeVisible();

    // BookingForm renders Cancel only when an onCancel prop is provided.
    // The current page does NOT pass onCancel, so the Cancel button won't appear.
    // Verify it is not rendered (confirming the form only shows "Create Booking").
    const createBtn = page.getByRole("button", { name: "Create Booking" });
    await expect(createBtn).toBeVisible();
    const cancelBtn = page.getByRole("button", { name: "Cancel" });
    await expect(cancelBtn).toBeHidden();

    // Close via the × button (the actual dismiss mechanism)
    const closeBtn = overlay.locator("button").filter({ hasText: "×" });
    await closeBtn.click();
    await expect(overlay).toBeHidden();
  });

  // ── 9. Calendar navigation (prev/next month) ───────────────────────
  test("calendar navigates to previous and next month", async ({ page }) => {
    const monthLabel = page.locator("h3").filter({ hasText: currentMonthLabel() });
    await expect(monthLabel).toBeVisible();

    // Click Next →
    const nextBtn = page.getByRole("button", { name: "Next →" });
    await nextBtn.click();

    // Month should have changed — the current month label should be gone
    await expect(monthLabel).toBeHidden();

    // Click ← Prev to go back
    const prevBtn = page.getByRole("button", { name: "← Prev" });
    await prevBtn.click();

    // Current month should be back
    const restoredLabel = page.locator("h3").filter({ hasText: currentMonthLabel() });
    await expect(restoredLabel).toBeVisible();
  });

  // ── 10. Modal overlay blocks interaction with background ────────────
  test("modal overlay covers the background", async ({ page }) => {
    const newBookingBtn = page.getByRole("button", { name: "+ New Booking" });
    await newBookingBtn.click();

    // The overlay div should exist and be visible with fixed positioning
    const overlay = page.locator(".fixed.inset-0.z-50");
    await expect(overlay).toBeVisible();

    // The overlay should have the bg-black/50 class (the backdrop)
    await expect(overlay).toHaveClass(/bg-black\/50/);

    // The form panel sits inside the overlay
    const formPanel = overlay.locator("form");
    await expect(formPanel).toBeVisible();
  });
});
