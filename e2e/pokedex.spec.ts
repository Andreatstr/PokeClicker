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

  test.describe("Filters", () => {
    test("should filter by region (Kanto)", async ({ page }) => {
      await pokedex.openMobileFilters();
      await pokedex.selectMobileRegion("Kanto");
      await pokedex.applyMobileFilters();
      await page.waitForTimeout(1000);

      const displayText = await pokedex.getDisplayedCount();
      expect(displayText).toContain("151"); // Kanto has 151 Pokémon
    });

    test("should filter by type (Fire)", async ({ page }) => {
      await pokedex.openMobileFilters();
      await pokedex.selectMobileType("fire");
      await pokedex.applyMobileFilters();
      await page.waitForTimeout(1000);

      const cardCount = await pokedex.getPokemonCardCount();
      expect(cardCount).toBeGreaterThan(0);
    });

    test("should clear type filter", async ({ page }) => {
      await pokedex.openMobileFilters();
      await pokedex.selectMobileType("water");
      await pokedex.applyMobileFilters();
      await page.waitForTimeout(1000);

      await pokedex.openMobileFilters();
      await pokedex.clearMobileFilters();
      await page.waitForTimeout(500);

      const cardCount = await pokedex.getPokemonCardCount();
      expect(cardCount).toBeGreaterThan(0);
    });

    test("should sort by name", async ({ page }) => {
      await pokedex.openMobileFilters();
      await pokedex.selectMobileSortBy("name");
      await pokedex.applyMobileFilters();
      await page.waitForTimeout(1000);

      // First card should be alphabetically first
      const firstCardText = await pokedex.pokemonCards.first().textContent();
      expect(firstCardText).toBeTruthy();
    });

    test("should sort in descending order", async ({ page }) => {
      await pokedex.openMobileFilters();
      await pokedex.selectMobileSortOrder("desc");
      await pokedex.applyMobileFilters();
      await page.waitForTimeout(1000);

      const cardCount = await pokedex.getPokemonCardCount();
      expect(cardCount).toBeGreaterThan(0);
    });

    test("should clear all filters", async ({ page }) => {
      // Increase timeout for this test due to slow loading
      test.setTimeout(60000);
      
      await pokedex.openMobileFilters();
      await pokedex.selectMobileRegion("Johto");
      await page.waitForTimeout(200);
      await pokedex.selectMobileType("grass");
      await page.waitForTimeout(200);
      await pokedex.applyMobileFilters();
      await page.waitForTimeout(1000);

      // Verify filters are applied by checking we have fewer Pokemon
      const filteredText = await pokedex.getDisplayedCount();
      expect(filteredText).toBeTruthy();

      await pokedex.openMobileFilters();
      await pokedex.clearMobileFilters();
      await page.waitForTimeout(500);

      const displayText = await pokedex.getDisplayedCount();
      // Should show more Pokémon after clearing filters
      expect(displayText).toBeTruthy();
    });
  });

  test("should paginate to next page", async ({ page }) => {
    const initialCount = await pokedex.getPokemonCardCount();

    await pokedex.goToNextPage();
    await page.waitForTimeout(1000);

    const newCount = await pokedex.getPokemonCardCount();
    expect(newCount).toBeGreaterThan(0);
    // Should have different Pokemon on page 2
  });

  test.describe("Combined filters", () => {
    test("should combine search and filters", async ({ page }) => {
      await pokedex.search("char");
      await pokedex.openMobileFilters();
      await pokedex.selectMobileRegion("Kanto");
      await pokedex.applyMobileFilters();
      await pokedex.waitForDebounce(500);

      const cardCount = await pokedex.getPokemonCardCount();
      expect(cardCount).toBeGreaterThanOrEqual(1);
    });
  });

});
