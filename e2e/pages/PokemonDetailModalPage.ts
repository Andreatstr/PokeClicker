import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page Object Model for the Pokemon detail modal overlay
 *
 * Handles interactions with the Pokemon detail modal including:
 * - Viewing Pokemon information (name, sprite, types, stats)
 * - Purchasing/unlocking Pokemon
 * - Navigating between evolution chain members
 * - Checking ownership status
 * - Error message handling
 */
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

    // Uses ARIA complementary role for modal sidepanel pattern
    this.modal = page.locator('[role="complementary"]').first();
    // Scoped within modal to avoid selecting other close buttons on page
    this.closeButton = this.modal.locator('button:has-text("X")');
    this.pokemonName = this.modal.locator("h2").first();
    // Targets image within semantic figure element
    this.pokemonSprite = this.modal.locator("figure img");
    // Type badges use uppercase styling class convention
    this.typeBadges = this.modal.locator("span[class*='uppercase']");
    this.ownedBadge = this.modal.locator('div:has-text("OWNED")');
    this.purchaseButton = this.modal.locator("button:has-text('Unlock')");
    // Error messages use consistent Tailwind error color class
    this.errorMessage = this.modal.locator("p.text-red-500");

    // Stats - uses text content matching for semantic stat labels
    this.hpStat = this.modal.locator("span:has-text('HP')");
    this.attackStat = this.modal.locator("span:has-text('Attack')");
    this.defenseStat = this.modal.locator("span:has-text('Defense')");
    this.spAttackStat = this.modal.locator("span:has-text('Sp. Atk')");
    this.spDefenseStat = this.modal.locator("span:has-text('Sp. Def')");
    this.speedStat = this.modal.locator("span:has-text('Speed')");

    // Evolution - uses custom CSS class naming convention
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

  /**
   * Closes the modal and waits for hide animation to complete
   * Ensures modal is fully dismissed before continuing test flow
   */
  async close() {
    await this.closeButton.click();
    await this.modal.waitFor({ state: "hidden", timeout: 2000 });
  }

  /**
   * Extracts Pokemon name from modal heading
   * Returns "???" for locked/unknown Pokemon
   */
  async getPokemonName(): Promise<string> {
    const text = await this.pokemonName.textContent();
    return text?.trim() || "";
  }

  /**
   * Extracts all type badges from modal
   * Returns normalized lowercase array for consistent comparisons
   */
  async getTypes(): Promise<string[]> {
    const badges = await this.typeBadges.allTextContents();
    return badges.map((b) => b.trim().toLowerCase());
  }

  /**
   * Checks if Pokemon is owned by current user
   * OWNED badge only displays for unlocked Pokemon in user's collection
   */
  async isOwned(): Promise<boolean> {
    try {
      return await this.ownedBadge.isVisible({ timeout: 1000 });
    } catch {
      return false;
    }
  }

  /**
   * Purchases/unlocks a Pokemon
   * Waits for purchase animation to complete before continuing
   */
  async purchasePokemon() {
    await this.purchaseButton.click();
    // Allow time for purchase animation and state update
    await this.page.waitForTimeout(1000);
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

  /**
   * Clicks on an evolution in the evolution chain
   * Navigates to that Pokemon's detail view within the modal
   */
  async clickEvolution(index: number) {
    const evoButton = this.evolutionPokemon.nth(index).locator("button");
    await evoButton.click();
    // Allow time for modal content to update with new Pokemon
    await this.page.waitForTimeout(500);
  }

  /**
   * Checks if stats section is visible
   * Stats are hidden for locked Pokemon
   */
  async hasStats(): Promise<boolean> {
    try {
      return await this.hpStat.isVisible({ timeout: 1000 });
    } catch {
      return false;
    }
  }

  /**
   * Checks if Pokemon is locked/unknown
   * Locked Pokemon display as "???" placeholder
   */
  async isUnknownPokemon(): Promise<boolean> {
    const name = await this.getPokemonName();
    return name === "???";
  }
}
