import { Page } from "@playwright/test";

export class BasePage {
  constructor(protected page: Page) {}

  async goto(path = "/") {
    // Disable onboarding/tutorial before the app loads to avoid overlays blocking clicks
    await this.page.addInitScript(() => {
      try {
        window.localStorage.setItem("onboarding_completed", "true");
      } catch {
        // ignore if localStorage is not available for some reason
      }
    });
    await this.page.goto(path);
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState("domcontentloaded");
  }
}
