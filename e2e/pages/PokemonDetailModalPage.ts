import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class PokemonDetailModalPage extends BasePage {
  readonly modal: Locator;
  readonly closeButton: Locator;
  readonly pokemonName: Locator;
  readonly pokemonSprite: Locator;
  readonly typeBadges: Locator;
  readonly ownedBadge: Locator;
  readonly purchaseButton: Locator;
  readonly errorMessage: Locator;

  // Stats
  readonly hpStat: Locator;
  readonly attackStat: Locator;
  readonly defenseStat: Locator;
  readonly spAttackStat: Locator;
  readonly spDefenseStat: Locator;
  readonly speedStat: Locator;

  // Evolution
  readonly evolutionSection: Locator;
  readonly evolutionPokemon: Locator;

  constructor(page: Page) {
    super(page);

    this.modal = page.locator('[role="complementary"]').first();
    this.closeButton = this.modal.locator('button:has-text("X")');
    this.pokemonName = this.modal.locator("h2").first();
    this.pokemonSprite = this.modal.locator("figure img");
    this.typeBadges = this.modal.locator("span[class*='uppercase']");
    this.ownedBadge = this.modal.locator('div:has-text("OWNED")');
    this.purchaseButton = this.modal.locator("button:has-text('Unlock')");
    this.errorMessage = this.modal.locator("p.text-red-500");

    // Stats
    this.hpStat = this.modal.locator("span:has-text('HP')");
    this.attackStat = this.modal.locator("span:has-text('Attack')");
    this.defenseStat = this.modal.locator("span:has-text('Defense')");
    this.spAttackStat = this.modal.locator("span:has-text('Sp. Atk')");
    this.spDefenseStat = this.modal.locator("span:has-text('Sp. Def')");
    this.speedStat = this.modal.locator("span:has-text('Speed')");

    // Evolution
    this.evolutionSection = this.modal.locator("div.evolutionWrapper");
    this.evolutionPokemon = this.evolutionSection.locator(".evolutionItem");
  }

  async isOpen(): Promise<boolean> {
    try {
      return await this.modal.isVisible({ timeout: 2000 });
    } catch {
      return false;
    }
  }

  async close() {
    await this.closeButton.click();
    await this.modal.waitFor({ state: "hidden", timeout: 2000 });
  }

  async getPokemonName(): Promise<string> {
    const text = await this.pokemonName.textContent();
    return text?.trim() || "";
  }

  async getTypes(): Promise<string[]> {
    const badges = await this.typeBadges.allTextContents();
    return badges.map((b) => b.trim().toLowerCase());
  }

  async isOwned(): Promise<boolean> {
    try {
      return await this.ownedBadge.isVisible({ timeout: 1000 });
    } catch {
      return false;
    }
  }

  async purchasePokemon() {
    await this.purchaseButton.click();
    await this.page.waitForTimeout(1000); // Wait for purchase animation
  }

  async isPurchaseButtonVisible(): Promise<boolean> {
    try {
      return await this.purchaseButton.isVisible({ timeout: 1000 });
    } catch {
      return false;
    }
  }

  async hasError(): Promise<boolean> {
    try {
      return await this.errorMessage.isVisible({ timeout: 1000 });
    } catch {
      return false;
    }
  }

  async getErrorMessage(): Promise<string> {
    const text = await this.errorMessage.textContent();
    return text?.trim() || "";
  }

  async getEvolutionCount(): Promise<number> {
    return await this.evolutionPokemon.count();
  }

  async clickEvolution(index: number) {
    const evoButton = this.evolutionPokemon.nth(index).locator("button");
    await evoButton.click();
    await this.page.waitForTimeout(500);
  }

  async hasStats(): Promise<boolean> {
    try {
      return await this.hpStat.isVisible({ timeout: 1000 });
    } catch {
      return false;
    }
  }

  async isUnknownPokemon(): Promise<boolean> {
    const name = await this.getPokemonName();
    return name === "???";
  }
}
