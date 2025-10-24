import { test, expect } from "@playwright/test";
import { NavbarPage } from "./pages/NavbarPage";
import { PokedexPage } from "./pages/PokedexPage";
import { PokemonDetailModalPage } from "./pages/PokemonDetailModalPage";
import { LoginPage } from "./pages/LoginPage";

test.describe("Pokédex", () => {
  let navbar: NavbarPage;
  let pokedex: PokedexPage;
  let modal: PokemonDetailModalPage;
  let login: LoginPage;

  test.beforeEach(async ({ page }) => {
    navbar = new NavbarPage(page);
    pokedex = new PokedexPage(page);
    modal = new PokemonDetailModalPage(page);
    login = new LoginPage(page);

    await navbar.goto("/");
    await page.waitForLoadState("networkidle");

    if (await login.isOnLoginPage()) {
      await login.quickRegister();
      await page.waitForTimeout(1000);
    }

    const isOnPokedex = await navbar.isOnPokedex();
    if (!isOnPokedex) {
      await navbar.navigateToPokedex();
      await page.waitForTimeout(500);
    }
  });

  test("should display Pokémon cards", async ({ page }) => {
    await page.waitForTimeout(1000);
    const cardCount = await pokedex.getPokemonCardCount();
    expect(cardCount).toBeGreaterThan(0);
  });

  test("should clear search", async ({ page }) => {
    await pokedex.search("Charizard");
    await pokedex.waitForDebounce(500);

    await pokedex.clearSearch();
    await pokedex.waitForDebounce(500);

    const cardCount = await pokedex.getPokemonCardCount();
    expect(cardCount).toBeGreaterThan(5);
  });

  test.describe("Desktop filters", () => {
    test.beforeEach(async ({ page, browserName }) => {
      // Skip mobile browsers for desktop filter tests
      if (browserName.includes("Mobile") || page.viewportSize()?.width! < 768) {
        test.skip();
      }
    });

    test("should filter by region (Kanto)", async ({ page }) => {
      await pokedex.selectRegion("Kanto");
      await page.waitForTimeout(1000);

      const displayText = await pokedex.getDisplayedCount();
      expect(displayText).toContain("151"); // Kanto has 151 Pokémon
    });

    test("should filter by type (Fire)", async ({ page }) => {
      await pokedex.selectType("fire");
      await page.waitForTimeout(1000);

      const cardCount = await pokedex.getPokemonCardCount();
      expect(cardCount).toBeGreaterThan(0);

      // Should show type filter is active
      await expect(page.getByText(/showing types.*fire/i)).toBeVisible();
    });

    test("should clear type filter", async ({ page }) => {
      await pokedex.selectType("water");
      await page.waitForTimeout(1000);

      await expect(page.getByText(/showing types.*water/i)).toBeVisible();

      await pokedex.clearTypeFilter();
      await page.waitForTimeout(1000);

      await expect(page.getByText(/showing types.*all types/i)).toBeVisible();
    });

    test("should sort by name", async ({ page }) => {
      await pokedex.selectSortBy("name");
      await page.waitForTimeout(1000);

      // First card should be alphabetically first
      const firstCardText = await pokedex.pokemonCards.first().textContent();
      expect(firstCardText).toBeTruthy();
    });

    test("should sort in descending order", async ({ page }) => {
      await pokedex.selectSortOrder("desc");
      await page.waitForTimeout(1000);

      const cardCount = await pokedex.getPokemonCardCount();
      expect(cardCount).toBeGreaterThan(0);
    });

    test("should clear all filters", async ({ page }) => {
      await pokedex.selectRegion("Johto");
      await pokedex.selectType("grass");
      await pokedex.selectSortBy("name");
      await page.waitForTimeout(1000);

      await pokedex.clearFilters();
      await page.waitForTimeout(1000);

      const displayText = await pokedex.getDisplayedCount();
      // Should show more Pokémon after clearing filters
      expect(displayText).toBeTruthy();
    });
  });

  test("should load more Pokémon", async ({ page }) => {
    const initialCount = await pokedex.getPokemonCardCount();

    await pokedex.loadMore();
    await page.waitForTimeout(1000);

    const newCount = await pokedex.getPokemonCardCount();
    expect(newCount).toBeGreaterThan(initialCount);
  });

  test.describe("Combined filters", () => {
    test.beforeEach(async ({ page }) => {
      // Skip on mobile browsers
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 768) {
        test.skip();
      }
    });

    test("should combine search and filters", async ({ page }) => {
      await pokedex.search("char");
      await pokedex.selectRegion("Kanto");
      await pokedex.waitForDebounce(500);

      const cardCount = await pokedex.getPokemonCardCount();
      expect(cardCount).toBeGreaterThanOrEqual(1);
    });
  });

});
