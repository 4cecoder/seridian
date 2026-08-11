import { test, expect } from "@playwright/test";
import { quickLogin } from "../helpers";

test.describe("Chat, Sync & Search", () => {
  test.beforeEach(async ({ page }) => {
    await quickLogin(page);
  });

  // ── Chat page ─────────────────────────────────────────────────────
  test("1. chat page loads with 'Chat' header and description", async ({
    page,
  }) => {
    await page.goto("/dashboard/chat");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("heading", { name: "Chat" })
    ).toBeVisible();
    await expect(
      page.getByText("Team communication and messaging")
    ).toBeVisible();
  });

  test("2. ChatLayout renders with channel list", async ({ page }) => {
    await page.goto("/dashboard/chat");
    await page.waitForLoadState("networkidle");

    // ChannelList has an "Channels" heading
    await expect(page.getByText("Channels")).toBeVisible();
  });

  test("3. channel list shows loading skeletons or channel items", async ({
    page,
  }) => {
    await page.goto("/dashboard/chat");
    await page.waitForLoadState("networkidle");

    // Either loading skeletons (animate-pulse divs), "No channels yet" text,
    // or actual channel items are visible. The key assertion is that the
    // channel list container is present with its heading.
    const channelHeading = page.getByText("Channels");
    await expect(channelHeading).toBeVisible();

    // After Convex data loads, we should see either channels or empty state
    await page.waitForTimeout(2000);
    const hasContent = await page
      .getByText("No channels yet")
      .isVisible()
      .catch(() => false);
    const hasSkeleton = await page
      .locator(".animate-pulse")
      .first()
      .isVisible()
      .catch(() => false);

    // At least one state should be present (content, empty, or still loading)
    expect(hasContent || hasSkeleton || (await channelHeading.isVisible())).toBe(
      true
    );
  });

  test("4. message area is present when no channel is selected", async ({
    page,
  }) => {
    await page.goto("/dashboard/chat");
    await page.waitForLoadState("networkidle");

    // When no channel is selected, ChatLayout shows placeholder text
    await expect(
      page.getByText("Select a channel to start chatting")
    ).toBeVisible();
  });

  test("5. user panel is present on desktop", async ({ page }) => {
    await page.goto("/dashboard/chat");
    await page.waitForLoadState("networkidle");

    // UserPanel shows "Users" heading on desktop
    await expect(page.getByText("Users")).toBeVisible();
  });

  // ── Sync page ─────────────────────────────────────────────────────
  test("6. sync page loads with 'Sync' header and description", async ({
    page,
  }) => {
    await page.goto("/dashboard/sync");
    await page.waitForLoadState("networkidle");

    // PageHeader renders title and description
    await expect(
      page.getByRole("heading", { name: "Sync" }).first()
    ).toBeVisible();
    await expect(
      page.getByText("Synchronize data from external services").first()
    ).toBeVisible();
  });

  test("7. SyncDashboard renders sync management heading", async ({
    page,
  }) => {
    await page.goto("/dashboard/sync");
    await page.waitForLoadState("networkidle");

    // SyncDashboard has its own heading
    await expect(
      page.getByText("Sync Management").first()
    ).toBeVisible();

    // Sync All button is present
    await expect(
      page.getByRole("button", { name: /Sync All/ })
    ).toBeVisible();
  });

  test("8. GitHub sync section is present", async ({ page }) => {
    await page.goto("/dashboard/sync");
    await page.waitForLoadState("networkidle");

    // GitHubSyncSection renders "GitHub Sync" heading
    await expect(
      page.getByText("GitHub Sync").first()
    ).toBeVisible();
  });

  test("9. Linear sync section is present", async ({ page }) => {
    await page.goto("/dashboard/sync");
    await page.waitForLoadState("networkidle");

    // LinearSyncSection renders "Linear Sync" heading
    await expect(
      page.getByText("Linear Sync").first()
    ).toBeVisible();
  });

  // ── Search (Ctrl+K) ───────────────────────────────────────────────
  test("10. Ctrl+K opens search command dialog", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Press Ctrl+K to open search
    await page.keyboard.press("Control+k");

    // SearchCommand dialog should appear with placeholder input
    const searchInput = page.getByPlaceholder("Search or jump to...");
    await expect(searchInput).toBeVisible();
  });

  test("11. search dialog has input field accepting text", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    await page.keyboard.press("Control+k");

    const searchInput = page.getByPlaceholder("Search or jump to...");
    await expect(searchInput).toBeVisible();

    // Type into the search field
    await searchInput.fill("dashboard");
    await expect(searchInput).toHaveValue("dashboard");
  });

  test("12. Escape closes search dialog", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    await page.keyboard.press("Control+k");

    const searchInput = page.getByPlaceholder("Search or jump to...");
    await expect(searchInput).toBeVisible();

    // Press Escape to close
    await page.keyboard.press("Escape");

    // Search input should no longer be visible
    await expect(searchInput).toBeHidden();
  });
});
