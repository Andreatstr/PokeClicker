import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class NavbarPage extends BasePage {
  readonly pokedexTab: Locator;
  readonly clickerTab: Locator;
  readonly themeToggle: Locator;
  readonly mobileMenuButton: Locator;

  constructor(page: Page) {
    super(page);
    // Be specific to avoid matching the new logo button with aria-label containing "Pokedex"
    this.pokedexTab = page.getByRole("button", { name: /^pokedex$/i });
    this.clickerTab = page.getByRole("button", { name: /^clicker$/i });
    this.themeToggle = page
      .locator("button")
      .filter({ has: page.locator("svg") })
      .first();
    this.mobileMenuButton = page.locator("button").first();
  }

  async openMobileMenuIfNeeded() {
    const clickerVisible = await this.clickerTab
      .isVisible({ timeout: 500 })
      .catch(() => false);
    if (clickerVisible) {
      return;
    }

    const hamburgerButton = this.page
      .locator("header button")
      .filter({ has: this.page.locator("svg") })
      .last();

    try {
      if (await hamburgerButton.isVisible({ timeout: 1000 })) {
        await hamburgerButton.click();
        await this.page.waitForTimeout(300);
      }
    } catch (error) {
      console.log("Hamburger menu not found, assuming desktop layout");
    }
  }

  async navigateToPokedex() {
    await this.openMobileMenuIfNeeded();
    await this.pokedexTab.click();
  }

  async navigateToClicker() {
    await this.openMobileMenuIfNeeded();
    await this.clickerTab.click();
  }

  async toggleTheme() {
    await this.openMobileMenuIfNeeded();

    const themeButtons = this.page
      .locator("button")
      .filter({ has: this.page.locator("svg") });
    const count = await themeButtons.count();

    for (let i = 0; i < count; i++) {
      const button = themeButtons.nth(i);
      const isVisible = await button.isVisible().catch(() => false);

      if (isVisible) {
        const text = await button.textContent();
        if (!text || text.trim() === "") {
          await button.click();
          return;
        }
      }
    }

    await this.themeToggle.click();
  }

  async isOnPokedex(): Promise<boolean> {
    return await this.page
      .getByPlaceholder(/search/i)
      .isVisible()
      .catch(() => false);
  }

  async isOnClicker(): Promise<boolean> {
    const rareCandyVisible = await this.page
      .getByText("Rare Candy")
      .isVisible()
      .catch(() => false);
    const charizardVisible = await this.page
      .locator('img[alt="Charizard"]')
      .isVisible()
      .catch(() => false);
    return rareCandyVisible || charizardVisible;
  }
}
