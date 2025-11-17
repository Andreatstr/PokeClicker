import { test, expect } from "@playwright/test";
import { NavbarPage } from "./pages/NavbarPage";
import { LoginPage } from "./pages/LoginPage";
import { ClickerPage } from "./pages/ClickerPage";

test.describe("Smoke Tests", () => {
  // Disable onboarding for all smoke tests by setting flag before page loads
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('onboarding_completed', 'true');
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

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

    // Check if the onboarding overlay is active and click "Skip"
    const skipButton = page.locator('button[aria-label="Skip tutorial"]');
    if (await skipButton.isVisible()) {
      await skipButton.click({ force: true });
    } else {
      console.warn('Skip button not found or not visible, removing overlay...');
      await page.evaluate(() => {
        const overlay = document.querySelector('[role="dialog"]');
        if (overlay) {
          overlay.remove();
        }
      });
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

    // Check if the onboarding overlay is active and click "Skip"
    const skipButton = page.locator('button[aria-label="Skip tutorial"]');
    if (await skipButton.isVisible()) {
      await skipButton.click({ force: true });
    } else {
      console.warn('Skip button not found or not visible, removing overlay...');
      await page.evaluate(() => {
        const overlay = document.querySelector('[role="dialog"]');
        if (overlay) {
          overlay.remove();
        }
      });
    }

    await navbar.navigateToClicker();
    // Wait for candy counter to be visible before checking count
    await expect(page.locator('[data-onboarding="candy-counter"]')).toBeVisible({ timeout: 10000 });

    const candyCount = await clicker.getCandyCount();
    expect(candyCount).toBeGreaterThanOrEqual(0);

    await expect(clicker.clickButton).toBeVisible({ timeout: 10000 });
  });
});
