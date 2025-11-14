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

});
