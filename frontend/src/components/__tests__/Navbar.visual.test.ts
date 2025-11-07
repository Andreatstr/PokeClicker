import {test, expect} from '@playwright/test';

test.describe('Navbar Visual Regression', () => {
  test.beforeEach(async ({page}) => {
    // Set localStorage to skip onboarding before navigating
    await page.goto('/project2/');
    await page.evaluate(() => {
      localStorage.setItem('onboarding_completed', 'true');
    });

    // Navigate to the app
    await page.goto('/project2/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Click "Guest user" to access the main app
    await page.getByRole('button', {name: 'Guest user'}).click();

    // Wait for navigation
    await page.waitForLoadState('networkidle');

    // Wait for any animations to complete
    await page.waitForTimeout(500);
  });

  test('navbar in light mode', async ({page}) => {
    // Ensure we're in light mode
    const themeButton = page.getByRole('button', {
      name: /Switch to dark mode/i,
    });
    if (!(await themeButton.isVisible())) {
      // We're in dark mode, switch to light
      await page.getByRole('button', {name: /Switch to light mode/i}).click();
      await page.waitForTimeout(300);
    }

    // Take screenshot of the navbar
    const navbar = page.getByRole('banner');
    await expect(navbar).toHaveScreenshot('navbar-light-mode.png');
  });

  test('navbar in dark mode', async ({page}) => {
    // Switch to dark mode if not already
    const lightModeButton = page.getByRole('button', {
      name: /Switch to dark mode/i,
    });
    if (await lightModeButton.isVisible()) {
      await lightModeButton.click();
      await page.waitForTimeout(300);
    }

    // Take screenshot of the navbar
    const navbar = page.getByRole('banner');
    await expect(navbar).toHaveScreenshot('navbar-dark-mode.png');
  });

  test('navbar with mobile menu open', async ({page}) => {
    // Set viewport to mobile size
    await page.setViewportSize({width: 375, height: 667});

    // Open mobile menu
    const menuButton = page.getByRole('button', {name: 'Toggle mobile menu'});
    await menuButton.click();
    await page.waitForTimeout(300);

    // Take screenshot of the entire page with mobile menu
    await expect(page).toHaveScreenshot('navbar-mobile-menu-open.png');
  });
});
