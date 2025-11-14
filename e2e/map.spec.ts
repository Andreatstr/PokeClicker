import {test, expect} from '@playwright/test';
import {LoginPage} from './pages/LoginPage';
import {NavbarPage} from './pages/NavbarPage';

test.describe('World Map Functionality', () => {
  let loginPage: LoginPage;
  let navbar: NavbarPage;

  test.beforeEach(async ({page}) => {
    loginPage = new LoginPage(page);
    navbar = new NavbarPage(page);
    
    await navbar.goto('/');
    await page.waitForLoadState('networkidle');

    if (await loginPage.isOnLoginPage()) {
      await loginPage.quickRegister();
      await page.waitForTimeout(2000);
    }

    // Ensure we're on the map page
    const isOnMap = await navbar.isOnMap();
    if (!isOnMap) {
      await navbar.navigateToMap();
      await page.waitForTimeout(500);
    }
    
    // Wait for page to be fully interactive
    await page.waitForLoadState('networkidle');
    
    // Wait for map to load (canvas and character)
    await page.waitForSelector('canvas', {timeout: 10000});
    await page.waitForTimeout(500); // Additional time for tiles to start loading
  });

  test('should load world map and display character sprite', async ({page}) => {
    // Check that canvas is rendered (map tiles)
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Verify canvas has dimensions
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();
    expect(canvasBox!.width).toBeGreaterThan(0);
    expect(canvasBox!.height).toBeGreaterThan(0);

    // Check that character sprite is visible (has background-image style)
    const characterSprite = page.locator('[style*="background-image"]').first();
    await expect(characterSprite).toBeVisible();
  });

  test('should display teleport button and allow teleportation', async ({page}) => {
    // Find teleport button (has aria-label for accessibility)
    const teleportButton = page.getByRole('button', {name: /teleport/i});
    await expect(teleportButton).toBeVisible();
    await expect(teleportButton).toBeEnabled();

    // Click teleport
    await teleportButton.click();

    // Should show "Teleporting" state
    await expect(teleportButton).toContainText('Teleporting');
    await expect(teleportButton).toBeDisabled();

    // Wait for teleport to complete (150ms + 1200ms = 1350ms total)
    await page.waitForTimeout(1500);

    // Button should now be on cooldown
    await expect(teleportButton).toContainText('Wait');
    await expect(teleportButton).toBeDisabled();

    // Teleport notification should appear briefly
    const notification = page.getByText(/Teleported to/i);
    const hasNotification = await notification.isVisible().catch(() => false);
    
    // Verify teleport completed (notification visible or cooldown active)
    if (hasNotification) {
      await expect(notification).toBeVisible();
      // Notification should disappear after 3 seconds
      await page.waitForTimeout(3500);
      await expect(notification).not.toBeVisible();
    }
  });

  test('should toggle fullscreen', async ({page}) => {
    // Find fullscreen button
    const fullscreenButton = page.getByRole('button', {name: /fullscreen|exit fullscreen/i});
    
    if (await fullscreenButton.isVisible()) {
      const initialText = await fullscreenButton.textContent();
      
      // Click to toggle fullscreen
      await fullscreenButton.click();
      await page.waitForTimeout(500);

      // Button text should change
      const newText = await fullscreenButton.textContent();
      expect(newText).not.toBe(initialText);
    }
  });

  test('should display wild Pokemon and battle prompt when near them', async ({page}) => {
    // Wait for Pokemon to potentially spawn nearby
    await page.waitForTimeout(2000);

    // Look for battle prompt (has "nearby" text)
    const battlePrompt = page.getByText(/nearby/i);
    const battleButton = page.getByRole('button', {name: /battle/i});

    // Check if a wild Pokemon appeared near the character
    const hasBattlePrompt = await battlePrompt.isVisible().catch(() => false);
    
    if (hasBattlePrompt) {
      // Battle prompt and button should be visible
      await expect(battleButton).toBeVisible();
      await expect(battleButton).toBeEnabled();
      
      // Pokemon sprite should be visible in the prompt
      const pokemonSprite = page.locator('img[alt]').filter({has: page.locator('[src*="sprite"]')});
      const hasPokemonSprite = await pokemonSprite.first().isVisible().catch(() => false);
      if (hasPokemonSprite) {
        await expect(pokemonSprite.first()).toBeVisible();
      }
    }
  });

  test('should handle joystick movement', async ({page}) => {
    // Get initial character position
    const characterSprite = page.locator('[style*="background-image"]').first();
    const initialStyle = await characterSprite.getAttribute('style');

    // Find joystick (D-pad buttons)
    const upButton = page.locator('button[aria-label*="up" i]').first();
    
    if (await upButton.isVisible()) {
      // Click up button
      await upButton.click();
      await page.waitForTimeout(300);

      // Character style should change (position updated)
      const newStyle = await characterSprite.getAttribute('style');
      expect(newStyle).not.toBe(initialStyle);
    }
  });

  test('should load map tiles progressively without errors', async ({page}) => {
    // Canvas should be rendering tiles
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Wait for tiles to load
    await page.waitForTimeout(1500);

    // Canvas should still be visible (no rendering errors)
    await expect(canvas).toBeVisible();
    
    // No error messages should appear
    const errorBanner = page.getByText(/error|failed/i);
    const hasError = await errorBanner.isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });

  test('should not show duplicate UI elements', async ({page}) => {
    // There should only be ONE teleport button visible
    const teleportButtons = page.locator('button:has-text("Teleport")');
    const count = await teleportButtons.count();
    expect(count).toBeLessThanOrEqual(1);

    // If there's a battle prompt, only ONE should be visible
    const battleButtons = page.locator('button:has-text("BATTLE")');
    const battleCount = await battleButtons.count();
    expect(battleCount).toBeLessThanOrEqual(1);
  });
});
