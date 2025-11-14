import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page Object Model for the Pokédex page
 *
 * Handles interactions with the Pokédex browser including:
 * - Search functionality with debounced input
 * - Desktop and mobile filter controls (region, type, sort)
 * - Pagination through Pokémon cards
 * - Modal-based mobile filter dialog
 */
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

    // Search - uses semantic HTML search input type
    this.searchInput = page.locator('input[type="search"]');
    // Uses accessible button role with descriptive ARIA label
    this.clearSearchButton = page.locator('div[role="button"][aria-label="Clear search"]');
    this.mobileFiltersButton = page.getByRole("button", { name: /open filter options/i });

    // Desktop filters - traverse DOM from label to find associated combobox
    // Uses label text to locate parent container, then finds the combobox within
    this.regionSelect = page.locator('label:has-text("REGION")').locator('..').locator('button[role="combobox"]');
    this.typeSelect = page.locator('label:has-text("TYPE")').locator('..').locator('button');
    this.sortBySelect = page.locator('label:has-text("SORT BY")').locator('..').locator('button[role="combobox"]');
    this.sortOrderSelect = page.locator('label:has-text("ORDER")').locator('..').locator('button[role="combobox"]');
    this.clearFiltersButton = page.getByRole("button", { name: /clear filters/i });
    this.clearTypeButton = page.getByRole("button", { name: /clear type/i });

    // Mobile filter modal - scoped locators within dialog for better selector specificity
    // Uses ARIA dialog role to identify modal overlay
    this.mobileFilterModal = page.locator('div[role="dialog"][aria-modal="true"]');
    // All mobile filters are scoped within the modal to avoid conflicts with desktop filters
    this.mobileRegionSelect = this.mobileFilterModal.locator('label:has-text("Region")').locator('..').locator('button[role="combobox"]');
    this.mobileTypeSelect = this.mobileFilterModal.locator('label:has-text("Type")').locator('..').locator('button');
    this.mobileSortBySelect = this.mobileFilterModal.locator('label:has-text("Sort by")').locator('..').locator('button[role="combobox"]');
    this.mobileSortOrderSelect = this.mobileFilterModal.locator('label:has-text("Order")').locator('..').locator('button[role="combobox"]');
    this.applyFiltersButton = this.mobileFilterModal.getByRole("button", { name: /apply/i });
    this.cancelFiltersButton = this.mobileFilterModal.getByRole("button", { name: /cancel/i });
    this.clearMobileFiltersButton = this.mobileFilterModal.getByRole("button", { name: /clear/i });
    this.closeModalButton = this.mobileFilterModal.locator('button[aria-label="Close filter dialog"]');

    // Pokemon grid - dual selector strategy to handle both grid and flex layouts
    // Targets list items that are direct children of styled unordered lists
    this.pokemonCards = page.locator('ul[style*="grid-template-columns"] > li, ul.flex > li');
    this.nextPageButton = page.getByRole("button", { name: /next/i });
    this.previousPageButton = page.getByRole("button", { name: /previous/i });
    this.countText = page.getByText(/showing \d+ of \d+ pokémon/i);
    this.noResultsText = page.getByText(/no pokemon found/i);
  }

  async search(term: string) {
    await this.searchInput.fill(term);
  }

  /**
   * Clears search input if clear button is visible
   * Conditional check prevents errors when search is already empty
   */
  async clearSearch() {
    if (await this.clearSearchButton.isVisible({ timeout: 1000 })) {
      await this.clearSearchButton.click();
    }
  }

  /**
   * Selects a region filter from the desktop dropdown
   * Uses ARIA option role for accessibility-first selection
   */
  async selectRegion(region: string) {
    await this.regionSelect.click();
    await this.page.getByRole("option", { name: new RegExp(region, "i") }).click();
  }

  /**
   * Selects a type filter from the desktop multi-select dropdown
   * Requires exact match and explicit close to handle multi-select behavior
   */
  async selectType(type: string) {
    await this.typeSelect.click();
    // Wait for dropdown animation to complete
    await this.page.getByText(type, { exact: true }).waitFor({ state: "visible", timeout: 2000 });
    await this.page.getByText(type, { exact: true }).click();
    // Close dropdown by clicking outside - multi-select stays open after selection
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

  /**
   * Clears type filter if any type is currently selected
   * Button only appears when types are actively filtered
   */
  async clearTypeFilter() {
    if (await this.clearTypeButton.isVisible({ timeout: 1000 })) {
      await this.clearTypeButton.click();
    }
  }

  /**
   * Opens mobile filter dialog and waits for animation
   * Modal uses ARIA dialog pattern for accessibility
   */
  async openMobileFilters() {
    await this.mobileFiltersButton.click();
    await this.mobileFilterModal.waitFor({ state: "visible" });
  }

  /**
   * Closes mobile filter modal and waits for it to fully hide
   * Ensures modal is dismissed before continuing test flow
   */
  async closeMobileFilters() {
    await this.closeModalButton.click();
    await this.mobileFilterModal.waitFor({ state: "hidden" });
  }

  /**
   * Selects region in mobile modal
   * Uses scoped locators within modal to avoid desktop filter conflicts
   */
  async selectMobileRegion(region: string) {
    await this.mobileRegionSelect.click();
    await this.page.getByRole("option", { name: new RegExp(region, "i") }).click();
  }

  /**
   * Selects type in mobile modal
   * Scopes search within modal to ensure correct dropdown is targeted
   */
  async selectMobileType(type: string) {
    await this.mobileTypeSelect.click();
    // Scope within modal to avoid selecting desktop filter options
    await this.mobileFilterModal.getByText(type, { exact: true }).waitFor({ state: "visible", timeout: 2000 });
    await this.mobileFilterModal.getByText(type, { exact: true }).click();
  }

  /**
   * Selects sort option in mobile modal
   * Scrolls into view first to handle long modal content
   */
  async selectMobileSortBy(sortBy: "id" | "name" | "type") {
    await this.mobileSortBySelect.scrollIntoViewIfNeeded();
    await this.mobileSortBySelect.click();
    // Wait for dropdown to render before selecting
    await this.page.getByRole("option", { name: new RegExp(sortBy, "i") }).waitFor({ state: "visible", timeout: 2000 });
    await this.page.getByRole("option", { name: new RegExp(sortBy, "i") }).click();
  }

  /**
   * Selects sort order in mobile modal
   * Ensures element is visible in viewport before interaction
   */
  async selectMobileSortOrder(order: "asc" | "desc") {
    await this.mobileSortOrderSelect.scrollIntoViewIfNeeded();
    await this.mobileSortOrderSelect.click();
    // Wait for dropdown to render before selecting
    await this.page.getByRole("option", { name: new RegExp(order, "i") }).waitFor({ state: "visible", timeout: 2000 });
    await this.page.getByRole("option", { name: new RegExp(order, "i") }).click();
  }

  /**
   * Applies mobile filters and waits for modal to close
   * Confirms that filters have been applied to the main view
   */
  async applyMobileFilters() {
    await this.applyFiltersButton.click();
    await this.mobileFilterModal.waitFor({ state: "hidden" });
  }

  /**
   * Cancels mobile filter changes without applying
   * Returns to main view with previous filters intact
   */
  async cancelMobileFilters() {
    await this.cancelFiltersButton.click();
    await this.mobileFilterModal.waitFor({ state: "hidden" });
  }

  async clearMobileFilters() {
    await this.clearMobileFiltersButton.click();
  }

  async getPokemonCardCount(): Promise<number> {
    return await this.pokemonCards.count();
  }

  async clickPokemonCard(index: number) {
    await this.pokemonCards.nth(index).click();
  }

  async clickPokemonByName(name: string) {
    await this.page.getByText(name, { exact: true }).first().click();
  }

  /**
   * Navigates to next page and waits for content to load
   * Waits for first card to ensure pagination completed successfully
   */
  async goToNextPage() {
    await this.nextPageButton.click();
    // Verify page transition by waiting for card visibility
    await this.pokemonCards.first().waitFor({ state: "visible", timeout: 5000 });
  }

  /**
   * Navigates to previous page and waits for content to load
   * Confirms page loaded by checking first card visibility
   */
  async goToPreviousPage() {
    await this.previousPageButton.click();
    // Verify page transition by waiting for card visibility
    await this.pokemonCards.first().waitFor({ state: "visible", timeout: 5000 });
  }

  /**
   * Checks if current viewport is mobile size
   * Mobile breakpoint matches application's responsive design (768px)
   */
  async isMobile(): Promise<boolean> {
    const viewport = this.page.viewportSize();
    return viewport ? viewport.width <= 768 : false;
  }

  /**
   * Extracts displayed count text from pagination
   * Returns placeholder on mobile where count is not rendered
   */
  async getDisplayedCount(): Promise<string> {
    // Count text is hidden on mobile for space efficiency
    if (await this.isMobile()) {
      return "Mobile view — count text not visible";
    }

    const text = await this.countText.textContent();
    return text || "";
  }

  async hasNoResults(): Promise<boolean> {
    try {
      return await this.noResultsText.isVisible({ timeout: 2000 });
    } catch {
      return false;
    }
  }
}
