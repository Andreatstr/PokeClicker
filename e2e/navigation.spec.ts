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
      await page.waitForTimeout(1000);
    }
  });

  test("should load the application", async ({ page }) => {
    await expect(page).toHaveTitle(/pokeclicker|pokémon/i);
  });

  test("should navigate between Clicker and Pokédex", async ({ page }) => {
    await navbar.navigateToPokedex();
    await page.waitForTimeout(500);
    await expect(page.getByPlaceholder(/search/i)).toBeVisible({
      timeout: 5000,
    });

    await navbar.navigateToClicker();
    await page.waitForTimeout(500);
    await expect(page.getByText("Rare Candy")).toBeVisible({ timeout: 5000 });
  });
});
