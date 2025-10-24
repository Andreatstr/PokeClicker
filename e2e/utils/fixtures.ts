import { test as base } from "@playwright/test";
import { NavbarPage } from "../pages/NavbarPage";
import { ClickerPage } from "../pages/ClickerPage";
import { PokedexPage } from "../pages/PokedexPage";
import { PokemonDetailModalPage } from "../pages/PokemonDetailModalPage";
import { LoginPage } from "../pages/LoginPage";

type PageFixtures = {
  navbar: NavbarPage;
  clicker: ClickerPage;
  pokedex: PokedexPage;
  modal: PokemonDetailModalPage;
  login: LoginPage;
};

export const test = base.extend<PageFixtures>({
  navbar: async ({ page }, use) => {
    const navbar = new NavbarPage(page);
    await use(navbar);
  },

  clicker: async ({ page }, use) => {
    const clicker = new ClickerPage(page);
    await use(clicker);
  },

  pokedex: async ({ page }, use) => {
    const pokedex = new PokedexPage(page);
    await use(pokedex);
  },

  modal: async ({ page }, use) => {
    const modal = new PokemonDetailModalPage(page);
    await use(modal);
  },

  login: async ({ page }, use) => {
    const login = new LoginPage(page);
    await use(login);
  },
});

export { expect } from "@playwright/test";
