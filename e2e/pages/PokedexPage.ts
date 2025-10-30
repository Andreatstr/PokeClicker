import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class PokedexPage extends BasePage {
  // Search elements
  readonly searchInput: Locator;
  readonly clearSearchButton: Locator;
  readonly mobileFiltersButton: Locator;

  // Desktop filter elements
  readonly regionSelect: Locator;
  readonly typeSelect: Locator;
  readonly sortBySelect: Locator;
  readonly sortOrderSelect: Locator;
  readonly clearFiltersButton: Locator;
  readonly clearTypeButton: Locator;

  // Mobile filter modal elements
  readonly mobileFilterModal: Locator;
  readonly mobileRegionSelect: Locator;
  readonly mobileTypeSelect: Locator;
  readonly mobileSortBySelect: Locator;
  readonly mobileSortOrderSelect: Locator;
  readonly applyFiltersButton: Locator;
  readonly cancelFiltersButton: Locator;
  readonly clearMobileFiltersButton: Locator;
  readonly closeModalButton: Locator;

  // Pokemon grid elements
  readonly pokemonCards: Locator;
  readonly nextPageButton: Locator;
  readonly previousPageButton: Locator;
  readonly countText: Locator;
  readonly noResultsText: Locator;

  constructor(page: Page) {
    super(page);

    // Search
    this.searchInput = page.locator('input[type="search"]');
    this.clearSearchButton = page.locator('div[role="button"][aria-label="Clear search"]');
    this.mobileFiltersButton = page.getByRole("button", { name: /open filter options/i });

    // Desktop filters
    this.regionSelect = page.locator('label:has-text("REGION")').locator('..').locator('button[role="combobox"]');
    this.typeSelect = page.locator('label:has-text("TYPE")').locator('..').locator('button');
    this.sortBySelect = page.locator('label:has-text("SORT BY")').locator('..').locator('button[role="combobox"]');
    this.sortOrderSelect = page.locator('label:has-text("ORDER")').locator('..').locator('button[role="combobox"]');
    this.clearFiltersButton = page.getByRole("button", { name: /clear filters/i });
    this.clearTypeButton = page.getByRole("button", { name: /clear type/i });

    // Mobile filter modal
    this.mobileFilterModal = page.locator('div[role="dialog"][aria-modal="true"]');
    this.mobileRegionSelect = this.mobileFilterModal.locator('label:has-text("Region")').locator('..').locator('button[role="combobox"]');
    this.mobileTypeSelect = this.mobileFilterModal.locator('label:has-text("Type")').locator('..').locator('button');
    this.mobileSortBySelect = this.mobileFilterModal.locator('label:has-text("Sort by")').locator('..').locator('button[role="combobox"]');
    this.mobileSortOrderSelect = this.mobileFilterModal.locator('label:has-text("Order")').locator('..').locator('button[role="combobox"]');
    this.applyFiltersButton = this.mobileFilterModal.getByRole("button", { name: /apply/i });
    this.cancelFiltersButton = this.mobileFilterModal.getByRole("button", { name: /cancel/i });
    this.clearMobileFiltersButton = this.mobileFilterModal.getByRole("button", { name: /clear/i });
    this.closeModalButton = this.mobileFilterModal.locator('button[aria-label="Close filter dialog"]');

    // Pokemon grid
    this.pokemonCards = page.locator("ul li");
    this.nextPageButton = page.getByRole("button", { name: /next/i });
    this.previousPageButton = page.getByRole("button", { name: /previous/i });
    this.countText = page.getByText(/showing \d+ of \d+ pokémon/i);
    this.noResultsText = page.getByText(/no pokemon found/i);
  }

  async search(term: string) {
    await this.searchInput.fill(term);
  }

  async clearSearch() {
    if (await this.clearSearchButton.isVisible({ timeout: 1000 })) {
      await this.clearSearchButton.click();
    }
  }

  async selectRegion(region: string) {
    await this.regionSelect.click();
    await this.page.getByRole("option", { name: new RegExp(region, "i") }).click();
  }

  async selectType(type: string) {
    await this.typeSelect.click();
    await this.page.waitForTimeout(300);
    await this.page.getByText(type, { exact: true }).click();
    // Click outside to close the dropdown
    await this.page.locator("body").click({ position: { x: 0, y: 0 } });
  }

  async selectSortBy(sortBy: "id" | "name" | "type") {
    await this.sortBySelect.click();
    await this.page.getByRole("option", { name: new RegExp(sortBy, "i") }).click();
  }

  async selectSortOrder(order: "asc" | "desc") {
    await this.sortOrderSelect.click();
    await this.page.getByRole("option", { name: new RegExp(order, "i") }).click();
  }

  async clearFilters() {
    await this.clearFiltersButton.click();
  }

  async clearTypeFilter() {
    if (await this.clearTypeButton.isVisible({ timeout: 1000 })) {
      await this.clearTypeButton.click();
    }
  }

  // Mobile filter methods
  async openMobileFilters() {
    await this.mobileFiltersButton.click();
    await this.mobileFilterModal.waitFor({ state: "visible" });
  }

  async closeMobileFilters() {
    await this.closeModalButton.click();
    await this.mobileFilterModal.waitFor({ state: "hidden" });
  }

  async selectMobileRegion(region: string) {
    await this.mobileRegionSelect.click();
    await this.page.getByRole("option", { name: new RegExp(region, "i") }).click();
  }

  async selectMobileType(type: string) {
    await this.mobileTypeSelect.click();
    await this.page.waitForTimeout(300);
    await this.mobileFilterModal.getByText(type, { exact: true }).click();
  }

  async selectMobileSortBy(sortBy: "id" | "name" | "type") {
    await this.page.waitForTimeout(200);
    await this.mobileSortBySelect.scrollIntoViewIfNeeded();
    await this.mobileSortBySelect.click();
    await this.page.getByRole("option", { name: new RegExp(sortBy, "i") }).click();
  }

  async selectMobileSortOrder(order: "asc" | "desc") {
    await this.page.waitForTimeout(200);
    await this.mobileSortOrderSelect.scrollIntoViewIfNeeded();
    await this.mobileSortOrderSelect.click();
    await this.page.getByRole("option", { name: new RegExp(order, "i") }).click();
  }

  async applyMobileFilters() {
    await this.applyFiltersButton.click();
    await this.mobileFilterModal.waitFor({ state: "hidden" });
  }

  async cancelMobileFilters() {
    await this.cancelFiltersButton.click();
    await this.mobileFilterModal.waitFor({ state: "hidden" });
  }

  async clearMobileFilters() {
    await this.clearMobileFiltersButton.click();
  }

  // Pokemon grid methods
  async getPokemonCardCount(): Promise<number> {
    return await this.pokemonCards.count();
  }

  async clickPokemonCard(index: number) {
    await this.pokemonCards.nth(index).click();
  }

  async clickPokemonByName(name: string) {
    await this.page.getByText(name, { exact: true }).first().click();
  }

  async goToNextPage() {
    await this.nextPageButton.click();
    await this.page.waitForTimeout(500); // Wait for new cards to load
  }

  async goToPreviousPage() {
    await this.previousPageButton.click();
    await this.page.waitForTimeout(500); // Wait for new cards to load
  }

  async isMobile(): Promise<boolean> {
    const viewport = this.page.viewportSize();
    return viewport ? viewport.width <= 768 : false;
  }

  async getDisplayedCount(): Promise<string> {
    // Skip checking count text on mobile since it's not rendered there
    if (await this.isMobile()) {
      return "Mobile view — count text not visible";
    }

    const text = await this.countText.textContent();
    return text || "";
  }

  async waitForDebounce(delay: number = 300) {
    await this.page.waitForTimeout(delay);
  }

  async hasNoResults(): Promise<boolean> {
    try {
      return await this.noResultsText.isVisible({ timeout: 2000 });
    } catch {
      return false;
    }
  }
}
