import { test, expect } from "@playwright/test";
import { NavbarPage } from "./pages/NavbarPage";
import { ClickerPage } from "./pages/ClickerPage";
import { LoginPage } from "./pages/LoginPage";

test.describe("Clicker Game", () => {
  let navbar: NavbarPage;
  let clicker: ClickerPage;
  let login: LoginPage;

  test.beforeEach(async ({ page }) => {
    navbar = new NavbarPage(page);
    clicker = new ClickerPage(page);
    login = new LoginPage(page);
    await navbar.goto("/");
    await page.waitForLoadState("networkidle");

    if (await login.isOnLoginPage()) {
      await login.quickRegister();
      await page.waitForTimeout(2000); // Wait longer for login to complete
    }

    // Ensure we're on the clicker page
    const isOnClicker = await navbar.isOnClicker();
    if (!isOnClicker) {
      await navbar.navigateToClicker();
      await page.waitForTimeout(500);
    }

    // Wait for page to be fully interactive
    await page.waitForLoadState("networkidle");

    // Verify clicker elements are visible before proceeding
    await clicker.candyCount.waitFor({ state: "visible", timeout: 5000 });
    await clicker.clickButton.waitFor({ state: "visible", timeout: 5000 });
  });

  test("should display initial candy count", async () => {
    const candyCount = await clicker.getCandyCount();
    expect(candyCount).toBeGreaterThanOrEqual(0);
  });

  test("should increment candy count when clicking Charizard", async ({
    page,
  }) => {
    const initialCandy = await clicker.getCandyCount();
    await clicker.clickPokemon();
    await page.waitForTimeout(500);

    const newCandy = await clicker.getCandyCount();
    expect(newCandy).toBeGreaterThan(initialCandy);
  });

  test("should work on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await expect(clicker.candyCount).toBeVisible();
    await expect(clicker.clickButton).toBeVisible();
    await clicker.clickPokemon();

    // Stats should still be accessible
    const clickPowerLevel = await clicker.getStatLevel("clickPower");
    expect(clickPowerLevel).toBeGreaterThanOrEqual(1);
  });
});
