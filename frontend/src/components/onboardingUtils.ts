export const Z_INDEX = {
  BACKDROP: 9998,
  SPOTLIGHT: 9999,
  POPUP: 9999,
  MODAL_BACKDROP: 50000,
  MODAL_SPOTLIGHT: 50001,
  MODAL_POPUP: 50002,
} as const;

export const TIMING = {
  POLL_INTERVAL: 16,
  MAX_WAIT_NAV: 6000,
  MAX_WAIT_DEFAULT: 3000,
  MOBILE_MODAL_DELAY: 700,
  MOBILE_MODAL_SETTLE: 320,
  DESKTOP_MODAL_DELAY: 140,
  STATS_STEP_EXTRA_SETTLE: 300,
  STATS_STEP_FINAL_SETTLE: 180,
  CARD_VISIBILITY_DELAY: 80,
  BURGER_MENU_DELAY: 180,
  REPOSITION_DELAY: 0,
  SCROLL_SMOOTH_DELAY: 180,
  MODAL_OPEN_MOBILE: 350,
  MODAL_OPEN_DEFAULT: 200,
} as const;

export const MODAL_STEP_TARGETS = [
  'pokemon-stats',
  'pokemon-upgrade',
  'pokemon-evolution',
] as const;

export const NAV_BUTTON_TARGETS = [
  'clicker-nav',
  'world-nav',
  'profile-button',
  'ranks-nav',
] as const;

export const RECT_DIFF_THRESHOLD = 5;
export const RECT_DIFF_THRESHOLD_TIGHT = 2;
export const POPUP_WIDTH = 350;
export const DEFAULT_POPUP_HEIGHT = 200;
export const MIN_VIEWPORT_MARGIN = 16;
export const MIN_SPACING = 6;
export const MAX_SPACING = 10;

export function rectsAreDifferent(
  rect1: DOMRect | null,
  rect2: DOMRect | null,
  threshold = RECT_DIFF_THRESHOLD
): boolean {
  if (!rect1 || !rect2) return true;
  return (
    Math.abs(rect1.top - rect2.top) > threshold ||
    Math.abs(rect1.left - rect2.left) > threshold ||
    Math.abs(rect1.width - rect2.width) > threshold ||
    Math.abs(rect1.height - rect2.height) > threshold
  );
}

export function isElementVisible(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  const style = window.getComputedStyle(el);
  const hasSize = rect.width > 1 && rect.height > 1;
  const visibleStyle =
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    (el.offsetParent !== null || style.position === 'fixed');
  return hasSize && visibleStyle;
}

export function isMobileDevice(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches
  );
}

export function findVisibleOnboardingElement(
  target: string
): HTMLElement | null {
  const candidates = Array.from(
    document.querySelectorAll(`[data-onboarding="${target}"]`)
  ) as HTMLElement[];
  return candidates.find(isElementVisible) ?? null;
}

export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForRect(
  targetElement: HTMLElement,
  isModalStep: boolean,
  isStatsStep: boolean
): Promise<DOMRect> {
  const isMobile = isMobileDevice();
  const initialDelay = isModalStep
    ? isMobile
      ? isStatsStep
        ? TIMING.MOBILE_MODAL_DELAY
        : TIMING.MOBILE_MODAL_SETTLE
      : TIMING.DESKTOP_MODAL_DELAY
    : 0;

  await delay(initialDelay);
  let rect = targetElement.getBoundingClientRect();

  if (isModalStep && isMobile) {
    const settleDelay = isStatsStep
      ? TIMING.STATS_STEP_EXTRA_SETTLE
      : TIMING.DESKTOP_MODAL_DELAY;
    await delay(settleDelay);
    const rect2 = targetElement.getBoundingClientRect();
    if (rectsAreDifferent(rect2, rect, RECT_DIFF_THRESHOLD_TIGHT)) {
      rect = rect2;
    }

    if (isStatsStep) {
      await delay(TIMING.STATS_STEP_FINAL_SETTLE);
      const rect3 = targetElement.getBoundingClientRect();
      if (rectsAreDifferent(rect3, rect, RECT_DIFF_THRESHOLD_TIGHT)) {
        rect = rect3;
      }
    }
  }

  return rect;
}
