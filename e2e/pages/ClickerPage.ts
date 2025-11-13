import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ClickerPage extends BasePage {
  readonly candyCount: Locator;
  readonly clickButton: Locator;
  readonly clickPowerStat: Locator;
  readonly passiveIncomeStat: Locator;

  constructor(page: Page) {
    super(page);
    // Candy count is now in the global overlay with data-onboarding="candy-counter"
    // The count is in the <dd> element next to the candy icon
    this.candyCount = page
      .locator('[data-onboarding="candy-counter"]')
      .locator('dd');
    // Click button is the Pokemon button
    this.clickButton = page.getByRole('button', { name: /click pokemon to earn rare candy/i });
    // Stats are now simplified to Click Power and Passive Income
    this.clickPowerStat = page.getByText("Click Power", { exact: true }).locator("../..");
    this.passiveIncomeStat = page.getByText("Passive Income", { exact: true }).locator("../..");
  }

  async clickPokemon() {
    await this.clickButton.click();
  }

  async getCandyCount(): Promise<number> {
    // Wait for the candy counter to be visible first
    await this.page.locator('[data-onboarding="candy-counter"]').waitFor({ state: 'visible' });
    const text = await this.candyCount.textContent();
    // Handle formatted numbers (may include commas, spaces, or other formatting)
    // Remove all non-digit characters except decimal points
    const cleaned = text?.replace(/[^\d.]/g, '') || '0';
    return parseFloat(cleaned) || 0;
  }

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
