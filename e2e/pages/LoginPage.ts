import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page Object Model for the authentication/login page
 *
 * Handles user authentication flows including:
 * - Login with credentials
 * - User registration
 * - Guest access (unauthenticated mode)
 * - Quick authentication helpers for test setup
 */
export class LoginPage extends BasePage {
  readonly loginModalButton: Locator;
  readonly signupModalButton: Locator;
  readonly guestButton: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    // Uses ARIA button role with exact match to avoid confusion with other buttons
    // .first() ensures we target the main login button, not potential duplicates in mobile menu
    this.loginModalButton = page
      .getByRole("button", { name: /^log in$/i, exact: false })
      .first();
    this.signupModalButton = page
      .getByRole("button", { name: /^sign up$/i, exact: false })
      .first();
    this.guestButton = page.getByRole("button", { name: /guest user/i });
    // Targets semantic input types for proper form field identification
    this.usernameInput = page.locator('input[type="text"]').first();
    this.passwordInput = page.locator('input[type="password"]');
    this.submitButton = page.locator('button[type="submit"]');
  }

  /**
   * Logs in with username and password credentials
   * Opens login modal, fills form, and submits
   */
  async login(username: string, password: string) {
    await this.loginModalButton.click();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /**
   * Registers a new user account
   * Opens signup modal, fills form, and submits
   */
  async register(username: string, password: string) {
    await this.signupModalButton.click();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async loginAsGuest() {
    await this.guestButton.click();
  }

  /**
   * Quick authentication helper for test setup
   * Uses guest login for faster test execution (no registration required)
   * Waits for network idle to ensure auth state is fully established
   */
  async quickLogin() {
    await this.loginAsGuest();
    // Wait for navigation and GraphQL authentication to complete
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Quick registration helper for tests requiring unique user accounts
   * Generates unique username using random number (max 20 chars as per validation)
   * Waits for network idle to ensure registration completed successfully
   */
  async quickRegister() {
    // Generate username that fits within 20 char limit: "test" + 16 random digits
    const testUsername = `test${Math.floor(Math.random() * 1e16)}`;
    const testPassword = "testpass123";
    await this.register(testUsername, testPassword);
    // Wait for registration and auto-login to complete
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Checks if user is on the login/landing page
   * Uses guest button visibility as indicator (only shown when not authenticated)
   */
  async isOnLoginPage(): Promise<boolean> {
    try {
      return await this.guestButton.isVisible({ timeout: 2000 });
    } catch {
      return false;
    }
  }
}
