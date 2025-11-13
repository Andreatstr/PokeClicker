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

// Find the nearest scrollable ancestor (or return document.scrollingElement/window sentinel)
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
  return document.scrollingElement || document.documentElement;
}

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

export function isRectInViewport(rect: DOMRect, margin = 16): boolean {
  const vw = window.innerWidth || document.documentElement.clientWidth;
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const topOk = rect.top >= margin;
  const leftOk = rect.left >= 0;
  const rightOk = rect.right <= vw;
  const bottomOk = rect.bottom <= vh - margin;
  return topOk && leftOk && rightOk && bottomOk;
}

// Compute target's offsetTop relative to a specific container (not the page)
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
