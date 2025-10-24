import { Page } from "@playwright/test";

export async function clearAllStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

export async function setLocalStorage(page: Page, key: string, value: any) {
  await page.evaluate(
    ({ key, value }) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    { key, value },
  );
}

export async function getLocalStorage(page: Page, key: string): Promise<any> {
  return await page.evaluate((key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }, key);
}

export async function waitForDebounce(page: Page, delay = 500) {
  await page.waitForTimeout(delay);
}

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

export function generateTestId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
