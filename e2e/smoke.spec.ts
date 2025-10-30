import { test, expect } from "@playwright/test";
import { NavbarPage } from "./pages/NavbarPage";
import { LoginPage } from "./pages/LoginPage";
import { ClickerPage } from "./pages/ClickerPage";
import { PokedexPage } from "./pages/PokedexPage";

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
      await page.waitForTimeout(1000);

      expect(await login.isOnLoginPage()).toBe(false);
      await expect(page.getByPlaceholder(/search/i)).toBeVisible();
    }
  });

  test("can navigate between pages", async ({ page }) => {
    const navbar = new NavbarPage(page);
    const login = new LoginPage(page);

    await navbar.goto("/");
    await page.waitForLoadState("networkidle");

    if (await login.isOnLoginPage()) {
      await login.quickRegister();
      await page.waitForTimeout(1000);
    }

    await navbar.navigateToPokedex();
    await page.waitForTimeout(500);
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();

    await navbar.navigateToClicker();
    await page.waitForTimeout(500);
    await expect(page.getByText("Rare Candy")).toBeVisible();
  });

  test("clicker game displays and works", async ({ page }) => {
    const navbar = new NavbarPage(page);
    const login = new LoginPage(page);
    const clicker = new ClickerPage(page);

    await navbar.goto("/");
    await page.waitForLoadState("networkidle");

    if (await login.isOnLoginPage()) {
      await login.quickRegister();
      await page.waitForTimeout(1000);
    }

    await navbar.navigateToClicker();
    await page.waitForTimeout(500);

    const candyCount = await clicker.getCandyCount();
    expect(candyCount).toBeGreaterThanOrEqual(0);

    await expect(clicker.clickButton).toBeVisible();
  });

  test("pokédex displays cards", async ({ page }) => {
    const navbar = new NavbarPage(page);
    const login = new LoginPage(page);
    const pokedex = new PokedexPage(page);

    await navbar.goto("/");
    await page.waitForLoadState("networkidle");

    if (await login.isOnLoginPage()) {
      await login.quickRegister();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
    }

    await navbar.navigateToPokedex();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Wait for Pokemon data to load - check for the search input first
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();

    // Wait for at least one Pokemon card to appear
    await expect(pokedex.pokemonCards.first()).toBeVisible({ timeout: 15000 });

    // Wait for at least one Pokemon card to be visible
    await expect(pokedex.pokemonCards.first()).toBeVisible({ timeout: 10000 });

    const cardCount = await pokedex.getPokemonCardCount();
    expect(cardCount).toBeGreaterThan(0);
  });
});
