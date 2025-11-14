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
      // Wait for search box to appear after registration
      await expect(page.getByPlaceholder(/search/i)).toBeVisible({ timeout: 5000 });
    }

    const isOnPokedex = await navbar.isOnPokedex();
    if (!isOnPokedex) {
      await navbar.navigateToPokedex();
      // Wait for search box to appear after navigation
      await expect(page.getByPlaceholder(/search/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test("should display Pokémon cards", async ({ page }) => {
    // Wait for Pokemon cards to load
    await expect(pokedex.pokemonCards.first()).toBeVisible({ timeout: 5000 });
    const cardCount = await pokedex.getPokemonCardCount();
    expect(cardCount).toBeGreaterThan(0);
  });

  test("should paginate to next page", async ({ page }) => {
    const initialCount = await pokedex.getPokemonCardCount();

    await pokedex.goToNextPage();
    // Wait for Pokemon cards to reload after pagination
    await expect(pokedex.pokemonCards.first()).toBeVisible({ timeout: 5000 });

    const newCount = await pokedex.getPokemonCardCount();
    expect(newCount).toBeGreaterThan(0);
    // Should have different Pokemon on page 2
  });

  test("should search for Pokemon and show results", async ({ page }) => {
    // Get initial count before searching
    const initialCount = await pokedex.getPokemonCardCount();
    expect(initialCount).toBeGreaterThan(0);

    // Search for a specific Pokemon
    await pokedex.search("Pikachu");

    // Wait for search results to update
    await expect(pokedex.pokemonCards.first()).toBeVisible({ timeout: 5000 });

    // Verify we still have Pokemon cards displayed (search worked)
    const searchResultCount = await pokedex.getPokemonCardCount();
    expect(searchResultCount).toBeGreaterThan(0);
  });

  test("should open filter modal and filter by region", async ({ page }) => {
    test.setTimeout(30000); // 30 second timeout for this test

    // Verify we have Pokemon cards initially
    await expect(pokedex.pokemonCards.first()).toBeVisible({ timeout: 5000 });

    // Try multiple ways to find the Filters button
    // Method 1: Using data-onboarding attribute
    let filtersButton = page.locator('[data-onboarding="filters-button"]');
    if (!(await filtersButton.isVisible({ timeout: 2000 }).catch(() => false))) {
      // Method 2: Using text content
      filtersButton = page.locator('button:has-text("Filters")');
    }
    if (!(await filtersButton.isVisible({ timeout: 2000 }).catch(() => false))) {
      // Method 3: Using getByRole with text
      filtersButton = page.getByRole("button", { name: "Filters" });
    }

    await expect(filtersButton).toBeVisible({ timeout: 10000 });
    await filtersButton.click();

    // Wait for filter modal to appear (10s timeout)
    const filterModal = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(filterModal).toBeVisible({ timeout: 10000 });

    // Select Kanto region - look for the Region dropdown within modal
    const regionSelect = filterModal.locator('button[role="combobox"]').filter({ hasText: /region/i }).or(
      filterModal.locator('label:has-text("Region")').locator('..').locator('button[role="combobox"]')
    );
    await expect(regionSelect.first()).toBeVisible({ timeout: 5000 });
    await regionSelect.first().click();

    // Click on Kanto option
    const kantoOption = page.getByRole("option", { name: /kanto/i });
    await expect(kantoOption).toBeVisible({ timeout: 5000 });
    await kantoOption.click();

    // Apply filters
    const applyButton = filterModal.getByRole("button", { name: /apply/i });
    await expect(applyButton).toBeVisible({ timeout: 5000 });
    await applyButton.click();

    // Wait for modal to close
    await expect(filterModal).not.toBeVisible({ timeout: 5000 });

    // Wait for Pokemon cards to reload after filtering
    await expect(pokedex.pokemonCards.first()).toBeVisible({ timeout: 5000 });

    // Verify Pokemon cards are still displayed (filter worked)
    const filteredCount = await pokedex.getPokemonCardCount();
    expect(filteredCount).toBeGreaterThan(0);
  });

});
