import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";

test.describe("Authentication", () => {
  let login: LoginPage;

  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    await login.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should display login screen", async () => {
    await expect(login.guestButton).toBeVisible({ timeout: 10000 });
    await expect(login.loginModalButton).toBeVisible();
    await expect(login.signupModalButton).toBeVisible();
  });

  test("should register new user", async ({ page }) => {
    const username = `test${Math.floor(Math.random() * 10000)}`;
    const password = "testpass123";

    await login.register(username, password);
    await page.waitForTimeout(2000);

    expect(await login.isOnLoginPage()).toBe(false);
    await expect(page.getByText("Rare Candy")).toBeVisible();
  });

  test("should login existing user", async ({ page }) => {
    const username = `test${Math.floor(Math.random() * 10000)}`;
    const password = "testpass123";

    await login.register(username, password);
    await page.waitForTimeout(2000);

    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    if (await login.isOnLoginPage()) {
      await login.login(username, password);
      await page.waitForTimeout(2000);

      expect(await login.isOnLoginPage()).toBe(false);
    }
  });

  test("should have guest login option", async ({ page }) => {
    await expect(login.guestButton).toBeVisible();

    await login.loginAsGuest();
    await page.waitForTimeout(1000);

    expect(await login.isOnLoginPage()).toBe(false);
    await expect(page.getByText("Rare Candy")).toBeVisible();
  });
});
