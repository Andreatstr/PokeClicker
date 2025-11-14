import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page Object Model for the navigation bar
 *
 * Handles navigation between application sections and theme toggling:
 * - Tab navigation (Pokedex, Clicker)
 * - Mobile hamburger menu detection and interaction
 * - Theme toggle functionality
 * - Responsive layout handling (desktop vs mobile)
 */
export class NavbarPage extends BasePage {
  readonly pokedexTab: Locator;
  readonly clickerTab: Locator;
  readonly themeToggle: Locator;
  readonly mobileMenuButton: Locator;

  constructor(page: Page) {
    super(page);
    // Exact match to avoid selecting logo button which may contain "Pokedex" in aria-label
    this.pokedexTab = page.getByRole("button", { name: /^pokedex$/i });
    this.clickerTab = page.getByRole("button", { name: /^clicker$/i });
    // Targets icon-only buttons (theme toggle has SVG but no text)
    this.themeToggle = page
      .locator("button")
      .filter({ has: page.locator("svg") })
      .first();
    this.mobileMenuButton = page.locator("button").first();
  }

  /**
   * Opens mobile hamburger menu if navigation tabs are not visible
   * Implements responsive navigation pattern - menu is collapsed on mobile
   * Waits for menu animation to complete before proceeding
   */
  async openMobileMenuIfNeeded() {
    // Check if tabs are already visible (desktop layout)
    const clickerVisible = await this.clickerTab
      .isVisible({ timeout: 500 })
      .catch(() => false);
    if (clickerVisible) {
      return;
    }

    // Locate hamburger menu in header (last button with SVG icon)
    const hamburgerButton = this.page
      .locator("header button")
      .filter({ has: this.page.locator("svg") })
      .last();

    try {
      if (await hamburgerButton.isVisible({ timeout: 1000 })) {
        await hamburgerButton.click();
        // Verify menu opened by checking tab visibility
        await this.clickerTab.waitFor({ state: "visible", timeout: 2000 });
      }
    } catch (error) {
      console.log("Hamburger menu not found, assuming desktop layout");
    }
  }

  /**
   * Navigates to Pokedex page
   * Handles mobile menu opening automatically before navigation
   */
  async navigateToPokedex() {
    await this.openMobileMenuIfNeeded();
    await this.pokedexTab.click();
  }

  /**
   * Navigates to Clicker page
   * Handles mobile menu opening automatically before navigation
   */
  async navigateToClicker() {
    await this.openMobileMenuIfNeeded();
    await this.clickerTab.click();
  }

  /**
   * Toggles application theme (light/dark mode)
   * Identifies theme button as icon-only button (has SVG, no text)
   * Handles mobile menu if needed before toggling
   */
  async toggleTheme() {
    await this.openMobileMenuIfNeeded();

    // Find theme toggle by looking for buttons with icons but no text content
    const themeButtons = this.page
      .locator("button")
      .filter({ has: this.page.locator("svg") });
    const count = await themeButtons.count();

    for (let i = 0; i < count; i++) {
      const button = themeButtons.nth(i);
      const isVisible = await button.isVisible().catch(() => false);

      if (isVisible) {
        const text = await button.textContent();
        // Theme toggle has no text content, only icon
        if (!text || text.trim() === "") {
          await button.click();
          return;
        }
      }
    }

    await this.themeToggle.click();
  }

  /**
   * Checks if currently on Pokedex page
   * Uses search input presence as page indicator
   */
  async isOnPokedex(): Promise<boolean> {
    return await this.page
      .getByPlaceholder(/search/i)
      .isVisible()
      .catch(() => false);
  }

  /**
   * Checks if currently on Clicker page
   * Uses multiple indicators for robust detection (text or image)
   */
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
