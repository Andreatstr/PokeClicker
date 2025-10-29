import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ClickerPage extends BasePage {
  readonly candyCount: Locator;
  readonly clickButton: Locator;
  readonly clickPowerStat: Locator;
  readonly passiveIncomeStat: Locator;

  constructor(page: Page) {
    super(page);
    // Candy count is displayed next to "Rare Candy" text
    this.candyCount = page
      .getByText("Rare Candy")
      .locator("..")
      .locator("..")
      .getByText(/^\d+$/);
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
    const text = await this.candyCount.textContent();
    const match = text?.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
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
