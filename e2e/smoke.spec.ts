import { test, expect } from "@playwright/test";
import { NavbarPage } from "./pages/NavbarPage";
import { LoginPage } from "./pages/LoginPage";
import { ClickerPage } from "./pages/ClickerPage";

test.describe("Smoke Tests", () => {
  test("application loads successfully", async ({ page }) => {
    const navbar = new NavbarPage(page);
    await navbar.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveTitle(/pokeclicker|pokémon/i);
  });

  test("can login as guest", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto("/");
    await page.waitForLoadState("networkidle");

    if (await login.isOnLoginPage()) {
      await login.loginAsGuest();
      // Wait for search box to appear after login instead of arbitrary timeout
      await expect(page.getByPlaceholder(/search/i)).toBeVisible({ timeout: 5000 });

      expect(await login.isOnLoginPage()).toBe(false);
    }
  });

  test("can navigate between pages", async ({ page }) => {
    test.setTimeout(30000); // 30s timeout
    const navbar = new NavbarPage(page);
    const login = new LoginPage(page);

    await navbar.goto("/");
    await page.waitForLoadState("networkidle");

    if (await login.isOnLoginPage()) {
      await login.quickRegister();
      // Wait for search box to appear after registration
      await expect(page.getByPlaceholder(/search/i)).toBeVisible({ timeout: 10000 });
    }

    // Dismiss any onboarding overlay that might be blocking clicks
    const skipButton = page.getByRole("button", { name: /skip|dismiss|close|got it/i });
    if (await skipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipButton.click();
      await page.waitForTimeout(500); // Wait for overlay to disappear
    }

    await navbar.navigateToPokedex();
    await expect(page.getByPlaceholder(/search/i)).toBeVisible({ timeout: 10000 });

    await navbar.navigateToClicker();
    // Check for global candy counter overlay instead of local "Rare Candy" text
    await expect(page.locator('[data-onboarding="candy-counter"]')).toBeVisible({ timeout: 10000 });
  });

  test("clicker game displays and works", async ({ page }) => {
    test.setTimeout(30000); // 30s timeout
    const navbar = new NavbarPage(page);
    const login = new LoginPage(page);
    const clicker = new ClickerPage(page);

    await navbar.goto("/");
    await page.waitForLoadState("networkidle");

    if (await login.isOnLoginPage()) {
      await login.quickRegister();
      // Wait for search box to appear after registration
      await expect(page.getByPlaceholder(/search/i)).toBeVisible({ timeout: 10000 });
    }

    // Dismiss any onboarding overlay that might be blocking clicks
    const skipButton = page.getByRole("button", { name: /skip|dismiss|close|got it/i });
    if (await skipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipButton.click();
      await page.waitForTimeout(500); // Wait for overlay to disappear
    }

    await navbar.navigateToClicker();
    // Wait for candy counter to be visible before checking count
    await expect(page.locator('[data-onboarding="candy-counter"]')).toBeVisible({ timeout: 10000 });

    const candyCount = await clicker.getCandyCount();
    expect(candyCount).toBeGreaterThanOrEqual(0);

    await expect(clicker.clickButton).toBeVisible({ timeout: 10000 });
  });
});
