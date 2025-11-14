import { Page } from "@playwright/test";

/**
 * Clears all browser storage (localStorage and sessionStorage)
 * Useful for resetting test state between scenarios
 */
export async function clearAllStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Sets a value in localStorage
 * Automatically JSON-stringifies the value
 *
 * @param page - Playwright page instance
 * @param key - Storage key
 * @param value - Value to store (will be JSON-stringified)
 */
export async function setLocalStorage(page: Page, key: string, value: any) {
  await page.evaluate(
    ({ key, value }) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    { key, value },
  );
}

/**
 * Retrieves and parses a value from localStorage
 *
 * @param page - Playwright page instance
 * @param key - Storage key to retrieve
 * @returns Parsed value or null if not found
 */
export async function getLocalStorage(page: Page, key: string): Promise<any> {
  return await page.evaluate((key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }, key);
}

/**
 * Waits for debounced operations to complete
 * Used when testing features with debounced input (e.g., search)
 *
 * @param page - Playwright page instance
 * @param delay - Delay in milliseconds (default: 500ms to match app's debounce)
 */
export async function waitForDebounce(page: Page, delay = 500) {
  await page.waitForTimeout(delay);
}

/**
 * Mocks clicker game state in localStorage for testing
 * Allows tests to start with specific candy/stat levels without gameplay
 *
 * Note: This may be deprecated - the app now uses server-side state
 * instead of localStorage for game progression
 *
 * @param page - Playwright page instance
 * @param state - Partial state to set (missing fields use defaults)
 */
export async function mockClickerState(
  page: Page,
  state: {
    rareCandy?: number;
    stats?: {
      hp?: number;
      attack?: number;
      defense?: number;
      spAttack?: number;
      spDefense?: number;
      speed?: number;
    };
  },
) {
  const defaultState = {
    rareCandy: 0,
    stats: {
      hp: 1,
      attack: 1,
      defense: 1,
      spAttack: 1,
      spDefense: 1,
      speed: 1,
    },
  };

  const mergedState = {
    ...defaultState,
    ...state,
    stats: {
      ...defaultState.stats,
      ...(state.stats || {}),
    },
  };

  await setLocalStorage(page, "pokeClickerState", mergedState);
}

/**
 * Generates unique test ID with timestamp and random suffix
 * Useful for creating unique usernames or identifiers in E2E tests
 *
 * @param prefix - Prefix for the generated ID
 * @returns Unique ID string (format: prefix-timestamp-random)
 *
 * @example
 * generateTestId("user") // => "user-1634567890123-k3x9p2q"
 */
export function generateTestId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
