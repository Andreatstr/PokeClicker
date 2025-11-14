import { Page } from "@playwright/test";

/**
 * Base page object class providing common navigation functionality
 * All page objects extend this class to inherit shared behavior
 *
 * Features:
 * - Automatic onboarding/tutorial bypass for E2E tests
 * - Consistent navigation handling across test suites
 * - Page load waiting utilities
 */
export class BasePage {
  constructor(protected page: Page) {}

  /**
   * Navigates to a page with onboarding disabled
   * Uses addInitScript to set flags before app initialization
   *
   * Why disable onboarding?
   * - Tutorial overlays block E2E test interactions
   * - Tests need direct access to UI elements
   * - Onboarding is tested separately in dedicated test suite
   *
   * @param path - Relative path to navigate to (default: "/")
   */
  async goto(path = "/") {
    // Disable onboarding/tutorial before the app loads to avoid overlays blocking clicks
    await this.page.addInitScript(() => {
      try {
        // Set flag for regular users (localStorage)
        window.localStorage.setItem("onboarding_completed", "true");
        // Set flag for guest users (sessionStorage)
        window.sessionStorage.setItem("onboarding_completed_session", "true");
      } catch {
        // ignore if localStorage/sessionStorage is not available for some reason
      }
    });
    await this.page.goto(path);
  }

  /**
   * Waits for page to finish loading DOM content
   * Useful when navigation triggers dynamic content loading
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState("domcontentloaded");
  }
}
