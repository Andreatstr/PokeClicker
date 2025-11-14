import { test as base } from "@playwright/test";
import { NavbarPage } from "../pages/NavbarPage";
import { ClickerPage } from "../pages/ClickerPage";
import { PokedexPage } from "../pages/PokedexPage";
import { PokemonDetailModalPage } from "../pages/PokemonDetailModalPage";
import { LoginPage } from "../pages/LoginPage";

/**
 * Custom Playwright fixtures for Page Object Model pattern
 *
 * Benefits of using fixtures:
 * 1. Automatic page object instantiation - no need to create instances in each test
 * 2. Consistent setup/teardown lifecycle management
 * 3. Type-safe access to page objects via destructuring ({ pokedex, modal, etc. })
 * 4. Lazy initialization - only creates objects when used
 * 5. Improved test readability - direct access to page objects
 *
 * Usage in tests:
 * ```typescript
 * test('example', async ({ page, pokedex, modal }) => {
 *   await page.goto('/');
 *   await pokedex.search('pikachu');
 *   await pokedex.clickPokemonCard(0);
 *   await modal.getPokemonName();
 * });
 * ```
 */
type PageFixtures = {
  navbar: NavbarPage;
  clicker: ClickerPage;
  pokedex: PokedexPage;
  modal: PokemonDetailModalPage;
  login: LoginPage;
};

/**
 * Extended test function with automatic page object injection
 * Each fixture creates a page object instance and provides it to the test
 * The `use` callback allows the test to execute, then cleanup occurs automatically
 */
export const test = base.extend<PageFixtures>({
  // Navbar page object for navigation between app sections
  navbar: async ({ page }, use) => {
    const navbar = new NavbarPage(page);
    await use(navbar);
  },

  // Clicker game page object
  clicker: async ({ page }, use) => {
    const clicker = new ClickerPage(page);
    await use(clicker);
  },

  // Pokedex browser page object with search and filtering
  pokedex: async ({ page }, use) => {
    const pokedex = new PokedexPage(page);
    await use(pokedex);
  },

  // Pokemon detail modal page object
  modal: async ({ page }, use) => {
    const modal = new PokemonDetailModalPage(page);
    await use(modal);
  },

  // Login/authentication page object
  login: async ({ page }, use) => {
    const login = new LoginPage(page);
    await use(login);
  },
});

// Re-export expect for convenient single-line import in test files
export { expect } from "@playwright/test";
