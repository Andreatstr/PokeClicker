import { test, expect } from "@playwright/test";
import { NavbarPage } from "./pages/NavbarPage";
import { LoginPage } from "./pages/LoginPage";

test.describe("Navigation", () => {
  let navbar: NavbarPage;
  let login: LoginPage;

  test.beforeEach(async ({ page }) => {
    navbar = new NavbarPage(page);
    login = new LoginPage(page);
    await navbar.goto("/");
    await page.waitForLoadState("networkidle");

    if (await login.isOnLoginPage()) {
      await login.quickRegister();
      // Wait for search box to appear after registration
      await expect(page.getByPlaceholder(/search/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test("should load the application", async ({ page }) => {
    await expect(page).toHaveTitle(/pokeclicker|pokémon/i);
  });

  test("should navigate between Clicker and Pokédex", async ({ page }) => {
    await navbar.navigateToPokedex();
    await expect(page.getByPlaceholder(/search/i)).toBeVisible({
      timeout: 5000,
    });

    await navbar.navigateToClicker();
    // Wait for candy counter to appear after navigation
    await expect(page.locator('[data-onboarding="candy-counter"]')).toBeVisible({ timeout: 5000 });
  });
});
