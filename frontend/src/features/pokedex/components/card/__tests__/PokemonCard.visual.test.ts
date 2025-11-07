import {test, expect} from '@playwright/test';

test.describe('PokemonCard Visual Regression', () => {
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

    // Wait for navigation and Pokemon cards to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('owned pokemon card in light mode', async ({page}) => {
    // Ensure we're in light mode
    const themeButton = page.getByRole('button', {
      name: /Switch to dark mode/i,
    });
    if (!(await themeButton.isVisible())) {
      // We're in dark mode, switch to light
      await page.getByRole('button', {name: /Switch to light mode/i}).click();
      await page.waitForTimeout(300);
    }

    // Find the first owned Pokemon card (Bulbasaur)
    const firstCard = page
      .getByRole('button', {name: /View details for bulbasaur/i})
      .first();

    // Take screenshot of the card
    await expect(firstCard).toHaveScreenshot('pokemon-card-owned-light.png');
  });

  test('owned pokemon card in dark mode', async ({page}) => {
    // Switch to dark mode if not already
    const lightModeButton = page.getByRole('button', {
      name: /Switch to dark mode/i,
    });
    if (await lightModeButton.isVisible()) {
      await lightModeButton.click({force: true});
      await page.waitForTimeout(500);
    }

    // Find the first owned Pokemon card (Bulbasaur)
    const firstCard = page
      .getByRole('button', {name: /View details for bulbasaur/i})
      .first();

    // Take screenshot of the card
    await expect(firstCard).toHaveScreenshot('pokemon-card-owned-dark.png');
  });

  test('locked pokemon card in light mode', async ({page}) => {
    // Ensure we're in light mode
    const themeButton = page.getByRole('button', {
      name: /Switch to dark mode/i,
    });
    if (!(await themeButton.isVisible())) {
      // We're in dark mode, switch to light
      await page.getByRole('button', {name: /Switch to light mode/i}).click();
      await page.waitForTimeout(300);
    }

    // Find a locked Pokemon card (Ivysaur)
    const lockedCard = page
      .getByRole('button', {name: /View details for ivysaur/i})
      .first();

    // Take screenshot of the card
    await expect(lockedCard).toHaveScreenshot('pokemon-card-locked-light.png');
  });

  test('locked pokemon card in dark mode', async ({page}) => {
    // Switch to dark mode if not already
    const lightModeButton = page.getByRole('button', {
      name: /Switch to dark mode/i,
    });
    if (await lightModeButton.isVisible()) {
      await lightModeButton.click({force: true});
      await page.waitForTimeout(500);
    }

    // Find a locked Pokemon card (Ivysaur)
    const lockedCard = page
      .getByRole('button', {name: /View details for ivysaur/i})
      .first();

    // Take screenshot of the card
    await expect(lockedCard).toHaveScreenshot('pokemon-card-locked-dark.png');
  });
});
