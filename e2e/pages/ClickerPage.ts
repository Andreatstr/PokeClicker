import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page object for the Clicker game interface
 * Encapsulates locators and actions for clicker-related tests
 *
 * UI structure:
 * - Candy count displayed in global overlay (data-onboarding="candy-counter")
 * - Main click button (Pokemon sprite)
 * - Upgrade panel with Click Power and Passive Income stats
 *
 * Design pattern:
 * - Uses data attributes and accessible role selectors for stable tests
 * - Parent traversal (.locator("../..")) to find upgrade buttons within stat cards
 */
export class ClickerPage extends BasePage {
  readonly candyCount: Locator;
  readonly clickButton: Locator;
  readonly clickPowerStat: Locator;
  readonly passiveIncomeStat: Locator;

  constructor(page: Page) {
    super(page);
    // Candy count is in the global overlay (data-onboarding attribute for stable selection)
    // The count is in the <dd> element next to the candy icon
    this.candyCount = page
      .locator('[data-onboarding="candy-counter"]')
      .locator('dd');
    // Click button is the Pokemon button (accessible name for stable selection)
    this.clickButton = page.getByRole('button', { name: /click pokemon to earn rare candy/i });
    // Stats are displayed as cards with "Click Power" and "Passive Income" labels
    // Parent traversal finds the card container for upgrade button access
    this.clickPowerStat = page.getByText("Click Power", { exact: true }).locator("../..");
    this.passiveIncomeStat = page.getByText("Passive Income", { exact: true }).locator("../..");
  }

  async clickPokemon() {
    await this.clickButton.click();
  }

  /**
   * Retrieves current candy count from UI
   * Handles formatted numbers (e.g., "1,234.56" or "1 234.56")
   *
   * @returns Candy count as number (defaults to 0 if parsing fails)
   */
  async getCandyCount(): Promise<number> {
    // Wait for the candy counter to be visible first
    await this.page.locator('[data-onboarding="candy-counter"]').waitFor({ state: 'visible' });
    const text = await this.candyCount.textContent();
    // Handle formatted numbers (may include commas, spaces, or other formatting)
    // Remove all non-digit characters except decimal points
    const cleaned = text?.replace(/[^\d.]/g, '') || '0';
    return parseFloat(cleaned) || 0;
  }

  /**
   * Retrieves stat level from upgrade card
   * Parses "LV X" format displayed in UI
   *
   * @param stat - Which stat to check ("clickPower" or "passiveIncome")
   * @returns Level number (defaults to 1 if parsing fails)
   */
  async getStatLevel(
    stat: "clickPower" | "passiveIncome",
  ): Promise<number> {
    const locatorMap = {
      clickPower: this.clickPowerStat,
      passiveIncome: this.passiveIncomeStat,
    };

    // Stats display as "LV 1", "LV 2", etc.
    const text = await locatorMap[stat].textContent();
    const match = text?.match(/LV\s+(\d+)/i);
    return match ? parseInt(match[1]) : 1;
  }

  async upgradeClickPower() {
    await this.clickPowerStat.locator("button").click();
  }

  async upgradePassiveIncome() {
    await this.passiveIncomeStat.locator("button").click();
  }

  async clearLocalStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }
}
