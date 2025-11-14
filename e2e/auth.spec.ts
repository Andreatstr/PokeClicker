import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";

test.describe("Authentication", () => {
  let login: LoginPage;

  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    await login.goto("/");
    await page.waitForSelector('text=Log in');
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
    // Wait for search box to appear after registration
    await expect(page.getByPlaceholder(/search/i)).toBeVisible({ timeout: 5000 });

    expect(await login.isOnLoginPage()).toBe(false);
  });

  test("should login existing user", async ({ page }) => {
    const username = `test${Math.floor(Math.random() * 10000)}`;
    const password = "testpass123";

    await login.register(username, password);
    // Wait for search box to appear after registration
    await expect(page.getByPlaceholder(/search/i)).toBeVisible({ timeout: 5000 });

    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
    // Wait for login page to appear after reload
    await expect(login.loginModalButton).toBeVisible({ timeout: 5000 });

    if (await login.isOnLoginPage()) {
      await login.login(username, password);
      // Wait for search box to appear after login
      await expect(page.getByPlaceholder(/search/i)).toBeVisible({ timeout: 5000 });

      expect(await login.isOnLoginPage()).toBe(false);
    }
  });

  test("should have guest login option", async ({ page }) => {
    await expect(login.guestButton).toBeVisible();

    await login.loginAsGuest();
    // Wait for search box to appear after guest login
    await expect(page.getByPlaceholder(/search/i)).toBeVisible({ timeout: 5000 });

    expect(await login.isOnLoginPage()).toBe(false);
  });
});
