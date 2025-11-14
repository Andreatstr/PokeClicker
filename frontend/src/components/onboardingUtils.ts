/**
 * Z-index constants for onboarding overlay layers
 * Ensures proper stacking order of tutorial elements
 */
export const Z_INDEX = {
  BACKDROP: 9998,
  SPOTLIGHT: 9999,
  POPUP: 9999,
  MODAL_BACKDROP: 100000,
  MODAL_SPOTLIGHT: 100001,
  MODAL_POPUP: 100002,
} as const;

/**
 * Timing constants for onboarding animations and waits (in milliseconds)
 * Tuned for smooth transitions across devices
 */
export const TIMING = {
  POLL_INTERVAL: 16, // ~60fps for DOM polling
  MAX_WAIT_NAV: 6000, // Navigation transition timeout
  MAX_WAIT_DEFAULT: 3000, // Default element appearance timeout
  MOBILE_MODAL_DELAY: 700, // Mobile modal animation delay
  MOBILE_MODAL_SETTLE: 320, // Mobile modal settling time
  DESKTOP_MODAL_DELAY: 140, // Desktop modal animation delay
  STATS_STEP_EXTRA_SETTLE: 300, // Stats step additional settling
  STATS_STEP_FINAL_SETTLE: 180, // Stats step final settling
  CARD_VISIBILITY_DELAY: 80, // Card visibility check delay
  BURGER_MENU_DELAY: 180, // Mobile menu animation delay
  REPOSITION_DELAY: 0, // Popup reposition delay (immediate)
  SCROLL_SMOOTH_DELAY: 180, // Smooth scroll settling time
  MODAL_OPEN_MOBILE: 350, // Mobile modal open animation
  MODAL_OPEN_DEFAULT: 200, // Desktop modal open animation
} as const;

/** Onboarding steps that occur inside modal dialogs */
export const MODAL_STEP_TARGETS = [
  'pokemon-stats',
  'pokemon-upgrade',
  'pokemon-evolution',
] as const;

/** Navigation button targets for onboarding */
export const NAV_BUTTON_TARGETS = [
  'clicker-nav',
  'world-nav',
  'profile-button',
  'ranks-nav',
] as const;

/** Pixel threshold for detecting rect changes (standard) */
export const RECT_DIFF_THRESHOLD = 5;
/** Pixel threshold for detecting rect changes (tight tolerance for final checks) */
export const RECT_DIFF_THRESHOLD_TIGHT = 2;
/** Fixed width of instruction popup boxes */
export const POPUP_WIDTH = 350;
/** Default popup height (grows with content) */
export const DEFAULT_POPUP_HEIGHT = 200;
/** Minimum margin from viewport edges */
export const MIN_VIEWPORT_MARGIN = 16;
/** Minimum spacing between popup and target */
export const MIN_SPACING = 6;
/** Maximum spacing between popup and target */
export const MAX_SPACING = 10;

/**
 * Checks if two DOMRects differ by more than the threshold
 * Used to detect when element positions/sizes have finished animating
 */
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

/**
 * Checks if an element is actually visible on screen
 * Considers both size and CSS visibility properties
 */
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

/**
 * Detects mobile device via pointer type (touch vs mouse)
 * More reliable than user agent sniffing
 */
export function isMobileDevice(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches
  );
}

/**
 * Finds the first visible element with matching onboarding data attribute
 * Handles cases where multiple elements may have the same target (e.g., mobile/desktop)
 */
export function findVisibleOnboardingElement(
  target: string
): HTMLElement | null {
  const candidates = Array.from(
    document.querySelectorAll(`[data-onboarding="${target}"]`)
  ) as HTMLElement[];
  return candidates.find(isElementVisible) ?? null;
}

/** Promise-based delay utility */
export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Waits for element rect to stabilize after animations
 * Handles different timing needs for mobile/desktop and modal/non-modal contexts
 */
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

/**
 * Finds the nearest scrollable ancestor element
 * Returns Document as sentinel if document/window is the scrollable container
 */
export function getScrollableAncestor(el: HTMLElement): HTMLElement | Document {
  const isScrollable = (node: HTMLElement) => {
    const style = window.getComputedStyle(node);
    const overflowY = style.overflowY;
    const canScroll = /(auto|scroll|overlay)/.test(overflowY);
    return canScroll && node.scrollHeight > node.clientHeight;
  };
  let node: HTMLElement | null = el.parentElement;
  while (node && node !== document.body) {
    if (isScrollable(node)) return node;
    node = node.parentElement;
  }
  // Use Document as a sentinel for window/document scrolling
  return document;
}

/**
 * Smoothly scrolls element into view with custom positioning
 * Handles both container and window scrolling
 */
export function scrollElementIntoView(
  target: HTMLElement,
  position: 'start' | 'center' = 'center',
  margin = 16
) {
  const container = getScrollableAncestor(target);
  if (container instanceof HTMLElement) {
    const cRect = container.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();
    const current = container.scrollTop;
    const deltaTop = tRect.top - cRect.top;
    let targetTop =
      current +
      deltaTop -
      (position === 'center'
        ? Math.max(0, (cRect.height - tRect.height) / 2)
        : margin);
    const maxTop = Math.max(0, container.scrollHeight - container.clientHeight);
    targetTop = Math.max(0, Math.min(targetTop, maxTop));
    container.scrollTo({top: targetTop, behavior: 'smooth'});
  } else {
    // window/document scroll
    const tRect = target.getBoundingClientRect();
    const pageY = window.pageYOffset || document.documentElement.scrollTop || 0;
    let top =
      pageY +
      tRect.top -
      (position === 'center'
        ? Math.max(0, (window.innerHeight - tRect.height) / 2)
        : margin);
    const docEl = document.scrollingElement || document.documentElement;
    const maxTop = Math.max(0, (docEl?.scrollHeight || 0) - window.innerHeight);
    top = Math.max(0, Math.min(top, maxTop));
    window.scrollTo({top, behavior: 'smooth'});
  }
}

/**
 * Checks if a rect is fully visible within the viewport
 * Accounts for specified margins
 */
export function isRectInViewport(rect: DOMRect, margin = 16): boolean {
  const vw = window.innerWidth || document.documentElement.clientWidth;
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const topOk = rect.top >= margin;
  const leftOk = rect.left >= 0;
  const rightOk = rect.right <= vw;
  const bottomOk = rect.bottom <= vh - margin;
  return topOk && leftOk && rightOk && bottomOk;
}

/**
 * Computes target's offsetTop relative to a specific container
 * Used for calculating scroll positions within scrollable containers
 */
export function getOffsetTopWithin(
  container: HTMLElement,
  target: HTMLElement
): number {
  let offset = 0;
  let node: HTMLElement | null = target;
  while (node && node !== container && node !== document.body) {
    offset += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return offset;
}

/**
 * Smoothly scrolls element to top of its scrollable container
 * Alternative to scrollElementIntoView when top positioning is needed
 */
export function scrollElementToTop(target: HTMLElement) {
  const container = getScrollableAncestor(target);
  if (container instanceof HTMLElement) {
    const top = Math.max(
      0,
      Math.min(
        getOffsetTopWithin(container, target),
        container.scrollHeight - container.clientHeight
      )
    );
    container.scrollTo({top, behavior: 'smooth'});
  } else {
    // window/document
    const rect = target.getBoundingClientRect();
    const pageY = window.pageYOffset || document.documentElement.scrollTop || 0;
    const docEl = document.scrollingElement || document.documentElement;
    const maxTop = Math.max(0, (docEl?.scrollHeight || 0) - window.innerHeight);
    const top = Math.max(0, Math.min(pageY + rect.top, maxTop));
    window.scrollTo({top, behavior: 'smooth'});
  }
}
