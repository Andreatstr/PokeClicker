import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ClickerPage extends BasePage {
  readonly candyCount: Locator;
  readonly clickButton: Locator;
  readonly hpStat: Locator;
  readonly attackStat: Locator;
  readonly defenseStat: Locator;
  readonly spAttackStat: Locator;
  readonly spDefenseStat: Locator;
  readonly speedStat: Locator;

  constructor(page: Page) {
    super(page);
    // Candy count is displayed next to "Rare Candy" text
    this.candyCount = page
      .getByText("Rare Candy")
      .locator("..")
      .locator("..")
      .getByText(/^\d+$/);
    // Click button is the Charizard button
    this.clickButton = page.getByRole('button', { name: /click charizard/i });
    // Stats are found by their label text (HP, Attack, etc.) and going up to parent container
    this.hpStat = page.getByText("HP", { exact: true }).locator("../..");
    this.attackStat = page
      .getByText("Attack", { exact: true })
      .locator("../..");
    this.defenseStat = page
      .getByText("Defense", { exact: true })
      .locator("../..");
    this.spAttackStat = page
      .getByText("Sp. Attack", { exact: true })
      .locator("../..");
    this.spDefenseStat = page
      .getByText("Sp. Defense", { exact: true })
      .locator("../..");
    this.speedStat = page.getByText("Speed", { exact: true }).locator("../..");
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
    stat: "hp" | "attack" | "defense" | "spAttack" | "spDefense" | "speed",
  ): Promise<number> {
    const locatorMap = {
      hp: this.hpStat,
      attack: this.attackStat,
      defense: this.defenseStat,
      spAttack: this.spAttackStat,
      spDefense: this.spDefenseStat,
      speed: this.speedStat,
    };

    // Stats display as "LV 1", "LV 2", etc.
    const text = await locatorMap[stat].textContent();
    const match = text?.match(/LV\s+(\d+)/i);
    return match ? parseInt(match[1]) : 1;
  }

  async upgradeHp() {
    await this.hpStat.locator("button").click();
  }

  async upgradeAttack() {
    await this.attackStat.locator("button").click();
  }

  async upgradeDefense() {
    await this.defenseStat.locator("button").click();
  }

  async clearLocalStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }
}
