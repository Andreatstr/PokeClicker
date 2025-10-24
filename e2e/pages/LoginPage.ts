import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  readonly loginModalButton: Locator;
  readonly signupModalButton: Locator;
  readonly guestButton: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.loginModalButton = page
      .getByRole("button", { name: /^log in$/i, exact: false })
      .first();
    this.signupModalButton = page
      .getByRole("button", { name: /^sign up$/i, exact: false })
      .first();
    this.guestButton = page.getByRole("button", { name: /guest user/i });
    this.usernameInput = page.locator('input[type="text"]').first();
    this.passwordInput = page.locator('input[type="password"]');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async login(username: string, password: string) {
    await this.loginModalButton.click();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async register(username: string, password: string) {
    await this.signupModalButton.click();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async loginAsGuest() {
    await this.guestButton.click();
  }

  async quickLogin() {
    await this.loginAsGuest();
    await this.page.waitForTimeout(1000);
  }

  async quickRegister() {
    const testUsername = `e2etest${Date.now()}`;
    const testPassword = "testpass123";
    await this.register(testUsername, testPassword);
    await this.page.waitForTimeout(2000);
  }

  async isOnLoginPage(): Promise<boolean> {
    try {
      return await this.guestButton.isVisible({ timeout: 2000 });
    } catch {
      return false;
    }
  }
}
