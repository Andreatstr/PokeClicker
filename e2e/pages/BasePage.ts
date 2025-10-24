import { Page } from "@playwright/test";

export class BasePage {
  constructor(protected page: Page) {}

  async goto(path = "/") {
    await this.page.goto(path);
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState("domcontentloaded");
  }
}
