/**
 * Interactive onboarding overlay that guides new users through app features.
 *
 * Features:
 * - 20-step tutorial covering all major features
 * - Auto-scrolling and highlighting of target elements
 * - Mobile-friendly: handles burger menu, viewport scrolling
 * - Smart positioning: popup avoids viewport edges, arrow points to target
 * - Page navigation: auto-navigates between pages for cross-page tours
 * - Modal integration: opens Pokemon detail modal for relevant steps
 * - Skip/Back navigation with state management
 *
 * State management:
 * - Polls for target elements with timeout/retry logic
 * - Tracks rect changes during scroll/resize for repositioning
 * - Auto-skips steps if target unavailable (e.g., locked Pokemon card)
 * - Handles mobile menu open/close for nav button steps
 *
 * Accessibility:
 * - Focus trap keeps keyboard users within onboarding popup
 * - ARIA dialog with labelledby/describedby
 * - Spotlight overlay with pulsing yellow border
 * - Backdrop prevents interaction with other elements during tour
 */
import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {FocusTrap} from 'focus-trap-react';
import {Button} from '@ui/pixelact';
import {logger} from '@/lib/logger';
import {
  Z_INDEX,
  TIMING,
  MODAL_STEP_TARGETS,
  NAV_BUTTON_TARGETS,
  RECT_DIFF_THRESHOLD_TIGHT,
  POPUP_WIDTH,
  DEFAULT_POPUP_HEIGHT,
  MIN_VIEWPORT_MARGIN,
  MIN_SPACING,
  MAX_SPACING,
  rectsAreDifferent,
  isMobileDevice,
  findVisibleOnboardingElement,
  delay,
  waitForRect,
  // utils for legacy behavior only
  scrollElementToTop,
  // helpers used in scroll/resize handling
  isRectInViewport,
  scrollElementIntoView,
} from './onboardingUtils';

type Page = 'pokedex' | 'clicker' | 'map' | 'profile' | 'ranks';

interface OnboardingStep {
  target: string;
  title: string;
  description: string;
  position: 'bottom' | 'top';
  page: Page;
  highlight?: boolean;
  waitForTarget?: boolean;
}

const STEPS: OnboardingStep[] = [
  {
    target: 'navbar',
    title: 'Welcome to PokeClicker!',
    description:
      'Navigate between Pokedex, Clicker, World, Ranks, and Profile. Use these tabs to explore every feature.',
    position: 'bottom',
    page: 'pokedex',
    highlight: true,
  },
  {
    target: 'candy-counter',
    title: 'Rare Candy Counter',
    description: 'See your Rare Candy balance. Earn more in Clicker and World.',
    position: 'top',
    page: 'pokedex',
    highlight: true,
  },
  {
    target: 'pokemon-card',
    title: 'Pokemon Cards',
    description:
      'Your Pokemon live here. Click a card to see stats and evolution. You can also buy new Pokemon.',
    position: 'top',
    page: 'pokedex',
    highlight: true,
  },
  {
    target: 'pokemon-stats',
    title: 'Pokemon Stats',
    description: 'View Pokemon stats: HP, Attack, Defense, Speed, and more.',
    position: 'top',
    page: 'pokedex',
    highlight: true,
  },
  {
    target: 'pokemon-upgrade',
    title: 'Upgrade Pokemon',
    description: "Spend Rare Candy to upgrade this Pokemon's stats and power.",
    position: 'top',
    page: 'pokedex',
    highlight: true,
  },
  {
    target: 'pokemon-evolution',
    title: 'Evolution Chain',
    description:
      'Click evolution stages to jump between them and explore the chain!',
    position: 'top',
    page: 'pokedex',
    highlight: true,
  },
  {
    target: 'pokemon-card-locked',
    title: 'Unlock New Pokemon',
    description:
      "Locked cards show Pokemon you don't own yet and how to unlock them.",
    position: 'top',
    page: 'pokedex',
    highlight: true,
  },
  {
    target: 'clicker-nav',
    title: 'Now Visit the Clicker!',
    description: 'Next, a quick tour of earning Rare Candy in Clicker.',
    position: 'bottom',
    page: 'pokedex',
    highlight: true,
  },
  {
    target: 'clicker-area',
    title: 'Click to Earn Candy!',
    description: 'Tap the screen or press A/B to earn candy after the tour.',
    position: 'top',
    page: 'clicker',
    highlight: true,
  },
  {
    target: 'upgrade-panel',
    title: 'Upgrade Your Stats',
    description: 'Use upgrades to boost earnings and efficiency.',
    position: 'top',
    page: 'clicker',
    highlight: true,
  },
  {
    target: 'world-nav',
    title: 'Explore the World!',
    description: 'Next, a quick look at the World map.',
    position: 'bottom',
    page: 'clicker',
    highlight: true,
  },
  {
    target: 'movement-controls',
    title: 'Movement Controls',
    description: 'Move with WASD/arrow keys or the joystick. Try it after!',
    position: 'top',
    page: 'map',
    highlight: true,
  },
  {
    target: 'map-canvas',
    title: 'Wild Pokemon & Battles',
    description:
      'Wild Pokemon appear around the map. Start a battle and click your way to victory!',
    position: 'top',
    page: 'map',
    highlight: true,
  },
  {
    target: 'profile-button',
    title: 'Visit Your Profile!',
    description: "Let's check out your Profile next.",
    position: 'bottom',
    page: 'map',
    highlight: true,
  },
  {
    target: 'pokemon-and-tutorial',
    title: 'Choose Your Pokemon',
    description:
      'Pick your Battle and Clicker Pokemon. Restart this tutorial anytime.',
    position: 'top',
    page: 'profile',
    highlight: true,
  },
  {
    target: 'ranks-nav',
    title: 'Check the Ranks!',
    description: "Finally, let's see how you rank against other trainers.",
    position: 'bottom',
    page: 'profile',
    highlight: true,
  },
  {
    target: 'league-buttons',
    title: 'Global Rankings',
    description:
      'Compete in two leagues: most Rare Candy and most Pokemon caught. Climb the ranks!',
    position: 'bottom',
    page: 'ranks',
    highlight: true,
  },
];

// Targets that should align to the very top of the viewport/scroll container
const START_ALIGN_TARGETS = new Set<string>([
  'movement-controls',
  'league-buttons',
]);

interface OnboardingOverlayProps {
  step: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onNavigate?: (page: Page) => void;
  onOpenFirstPokemon?: () => void;
  onClosePokemonModal?: () => void;
  isDarkMode?: boolean;
}

export function OnboardingOverlay({
  step,
  onNext,
  onPrevious,
  onSkip,
  onNavigate,
  onOpenFirstPokemon,
  onClosePokemonModal,
  isDarkMode = false,
}: OnboardingOverlayProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [rectStep, setRectStep] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [, setRepositionTick] = useState(0);
  const currentStep = STEPS[step];
  const previousStep = step > 0 ? STEPS[step - 1] : null;
  const skipLockedAfterUpgradeRef = useRef(false);
  const foundElementRef = useRef(false);
  const lastRectRef = useRef<DOMRect | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const pendingTimeoutsRef = useRef<number[]>([]);
  const openedMobileMenuForStepRef = useRef<number | null>(null);
  const skippedStepRef = useRef<number | null>(null);
  const recenterAttemptsRef = useRef<Record<number, number>>({});
  // revert advanced recentering for web; mobile-specific scroll handled inline
  const maxWaitTimeRef = useRef<number | undefined>(undefined);
  const hasShownRef = useRef<boolean>(false);

  const clearPendingTimeouts = () => {
    for (const id of pendingTimeoutsRef.current) clearTimeout(id);
    pendingTimeoutsRef.current = [];
  };

  useEffect(() => {
    if (isCardVisible) {
      const id = setTimeout(
        () => setRepositionTick((t) => t + 1),
        TIMING.REPOSITION_DELAY
      );
      return () => clearTimeout(id);
    }
  }, [isCardVisible, targetRect, step]);

  useEffect(() => {
    if (!currentStep) return;
    logger.debug(
      `Step change → ${step}: target=${currentStep?.target}, page=${currentStep?.page}`,
      'Onboarding'
    );

    if (previousStep && currentStep.page !== previousStep.page) {
      if (onNavigate) {
        onNavigate(currentStep.page);
      }
      // Mobile: only force scroll-to-top for nav-step transitions to avoid twitching on content steps
      if (
        isMobileDevice() &&
        NAV_BUTTON_TARGETS.includes(
          currentStep.target as (typeof NAV_BUTTON_TARGETS)[number]
        )
      ) {
        setTimeout(() => {
          try {
            window.scrollTo({top: 0, behavior: 'smooth'});
            const mainEl = document.querySelector('main');
            if (mainEl)
              (mainEl as HTMLElement).scrollTo({top: 0, behavior: 'smooth'});
          } catch (e) {
            void e;
          }
        }, TIMING.SCROLL_SMOOTH_DELAY);
      }
    }

    if (
      MODAL_STEP_TARGETS.includes(
        currentStep.target as (typeof MODAL_STEP_TARGETS)[number]
      ) &&
      onOpenFirstPokemon
    ) {
      const isMobile = isMobileDevice();
      let openDelay: number = TIMING.MODAL_OPEN_DEFAULT;
      if (currentStep.target === 'pokemon-stats') {
        openDelay = isMobile ? TIMING.MODAL_OPEN_MOBILE : 400; // give desktop extra time for modal mount
      }
      const t = setTimeout(() => {
        onOpenFirstPokemon();
      }, openDelay);
      return () => clearTimeout(t);
    }

    // Keep burger menu handling inside find/poll loop to avoid conflicts
  }, [currentStep, previousStep, onNavigate, onOpenFirstPokemon, step]);

  useEffect(() => {
    if (!currentStep || !previousStep) return;

    const wasModal = MODAL_STEP_TARGETS.includes(
      previousStep.target as (typeof MODAL_STEP_TARGETS)[number]
    );
    const isNowModal = MODAL_STEP_TARGETS.includes(
      currentStep.target as (typeof MODAL_STEP_TARGETS)[number]
    );

    const skippingLocked =
      skipLockedAfterUpgradeRef.current &&
      previousStep.target === 'pokemon-upgrade' &&
      currentStep.target === 'pokemon-card-locked';

    const isGoingForward =
      previousStep &&
      currentStep &&
      STEPS.findIndex((s) => s.target === currentStep.target) >
        STEPS.findIndex((s) => s.target === previousStep.target);

    if (
      wasModal &&
      !isNowModal &&
      onClosePokemonModal &&
      !skippingLocked &&
      isGoingForward
    ) {
      onClosePokemonModal();
    }
  }, [currentStep, previousStep, onClosePokemonModal]);

  useEffect(() => {
    if (!currentStep) return;

    setIsLoading(true);
    setIsCardVisible(false);
    setTargetRect(null);
    setRectStep(null);
    foundElementRef.current = false;
    lastRectRef.current = null;
    hasShownRef.current = false;

    const startTime = Date.now();
    const navTargetsSet = new Set(NAV_BUTTON_TARGETS);
    const MAX_WAIT_TIME = navTargetsSet.has(
      currentStep.target as (typeof NAV_BUTTON_TARGETS)[number]
    )
      ? TIMING.MAX_WAIT_NAV
      : TIMING.MAX_WAIT_DEFAULT;

    const findAndScrollToTarget = async () => {
      requestAnimationFrame(async () => {
        if (foundElementRef.current) return;

        // Mobile nav: proactively open burger menu before querying target to ensure correct element is present
        if (
          isMobileDevice() &&
          NAV_BUTTON_TARGETS.includes(
            currentStep.target as (typeof NAV_BUTTON_TARGETS)[number]
          )
        ) {
          const burgerBtn =
            document.querySelector<HTMLButtonElement>(
              'button[aria-label="Toggle mobile menu"]'
            ) ||
            document.querySelector<HTMLButtonElement>(
              'section[aria-label="Mobile menu control"] button'
            );
          const burgerClosed =
            burgerBtn?.getAttribute('aria-expanded') !== 'true';
          if (burgerBtn && burgerClosed) {
            try {
              burgerBtn.click();
              openedMobileMenuForStepRef.current = step;
              await delay(TIMING.BURGER_MENU_DELAY);
            } catch (e) {
              void e;
            }
          }
        }

        const targetElement = findVisibleOnboardingElement(currentStep.target);

        if (targetElement) {
          logger.debug(
            `Found target '${currentStep.target}'. Measuring rect...`,
            'Onboarding'
          );
          foundElementRef.current = true;

          const isModalTarget = MODAL_STEP_TARGETS.includes(
            currentStep.target as (typeof MODAL_STEP_TARGETS)[number]
          );
          const blockBehavior: ScrollLogicalPosition = isModalTarget
            ? 'start'
            : 'center';
          // Mobile: for specific targets, snap to top for full visibility
          if (
            isMobileDevice() &&
            (currentStep.target === 'movement-controls' ||
              currentStep.target === 'league-buttons')
          ) {
            scrollElementToTop(targetElement);
          } else {
            // Mobile settle: avoid fighting prior scroll (e.g., 11 -> 12)
            if (isMobileDevice() && currentStep.target === 'map-canvas') {
              await delay(220);
            }
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: blockBehavior,
            });
          }

          const isModalStep = MODAL_STEP_TARGETS.includes(
            currentStep.target as (typeof MODAL_STEP_TARGETS)[number]
          );
          const isStatsStep = currentStep.target === 'pokemon-stats';

          const rect = await waitForRect(
            targetElement,
            isModalStep,
            isStatsStep
          );
          logger.debug(
            `Rect ready for '${currentStep.target}': ${JSON.stringify({top: Math.round(rect.top), left: Math.round(rect.left), w: Math.round(rect.width), h: Math.round(rect.height)})}`,
            'Onboarding'
          );
          lastRectRef.current = rect;
          setTargetRect(rect);
          setRectStep(step);
          setIsLoading(false);

          await delay(TIMING.CARD_VISIBILITY_DELAY);
          setIsCardVisible(true);
          hasShownRef.current = true;

          // Mobile-only: ensure highlight is visible by aligning to start for specific targets
          if (isMobileDevice()) {
            if (
              currentStep.target === 'movement-controls' ||
              currentStep.target === 'map-canvas' ||
              currentStep.target === 'league-buttons'
            ) {
              targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              });
            }
          }
        } else {
          const count = document.querySelectorAll(
            `[data-onboarding="${currentStep.target}"]`
          ).length;
          logger.debug(
            `Target '${currentStep.target}' not visible yet (candidates: ${count}). Polling...`,
            'Onboarding'
          );
          const navTargets = new Set(NAV_BUTTON_TARGETS);
          const burgerBtn =
            document.querySelector<HTMLButtonElement>(
              'button[aria-label="Toggle mobile menu"]'
            ) ||
            document.querySelector<HTMLButtonElement>(
              'section[aria-label="Mobile menu control"] button'
            );
          const burgerClosed =
            burgerBtn?.getAttribute('aria-expanded') !== 'true';
          if (
            navTargets.has(
              currentStep.target as (typeof NAV_BUTTON_TARGETS)[number]
            ) &&
            burgerBtn &&
            burgerClosed &&
            openedMobileMenuForStepRef.current !== step
          ) {
            // Scroll to top, then attempt to open. Only mark as opened if aria-expanded flips to true.
            try {
              window.scrollTo({top: 0, behavior: 'smooth'});
            } catch (e) {
              void e;
            }
            await delay(TIMING.SCROLL_SMOOTH_DELAY);
            try {
              burgerBtn.click();
              await delay(TIMING.BURGER_MENU_DELAY);
              const nowExpanded =
                burgerBtn.getAttribute('aria-expanded') === 'true';
              if (nowExpanded) {
                openedMobileMenuForStepRef.current = step;
              }
            } catch (e) {
              void e;
            }
          }

          // Enforce a max wait time only if we haven't shown a target yet
          if (Date.now() - startTime > MAX_WAIT_TIME && !hasShownRef.current) {
            setIsLoading(false);
            setTargetRect(null);
            setRectStep(null);
            logger.debug(
              `Max wait exceeded for '${currentStep.target}'. Giving up for now.`,
              'Onboarding'
            );
          }
        }
      });
    };

    const timer = setTimeout(() => findAndScrollToTarget(), 0);

    const pollInterval: number = window.setInterval(() => {
      if (!foundElementRef.current) {
        findAndScrollToTarget();
      } else {
        clearInterval(pollInterval);
      }
    }, TIMING.POLL_INTERVAL);

    const isModalStep = MODAL_STEP_TARGETS.includes(
      currentStep.target as (typeof MODAL_STEP_TARGETS)[number]
    );

    // For modal steps, do not set a max wait timer; keep polling until the element appears
    if (!isModalStep) {
      maxWaitTimeRef.current = setTimeout(() => {
        setIsLoading(false);
      }, MAX_WAIT_TIME);
    }

    let skipTimer: number | undefined;
    // Auto-skip locked-card step when no locked card is visible
    if (
      currentStep.target === 'pokemon-card-locked' &&
      !isModalStep &&
      typeof onNext === 'function'
    ) {
      skipTimer = setTimeout(() => {
        if (
          skippedStepRef.current !== step &&
          !document.querySelector('[data-onboarding="pokemon-card-locked"]')
        ) {
          skippedStepRef.current = step;
          onNext();
        }
      }, 800);
    }

    // Intentionally do NOT auto-skip the upgrade step; allow extra time for data to load

    const handleResize = () => {
      if (foundElementRef.current) {
        foundElementRef.current = false;
        findAndScrollToTarget();
      }
    };

    const handleScroll = () => {
      const el = findVisibleOnboardingElement(currentStep.target);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (
          rectsAreDifferent(
            rect,
            lastRectRef.current,
            RECT_DIFF_THRESHOLD_TIGHT
          )
        ) {
          lastRectRef.current = rect;
          setTargetRect(rect);
          setRectStep(step);

          // If the target drifts near the edge after layout/scroll, recenter a limited number of times
          const attempts = recenterAttemptsRef.current[step] ?? 0;
          if (!isRectInViewport(rect, 24) && attempts < 3) {
            recenterAttemptsRef.current[step] = attempts + 1;
            const isModalTarget = MODAL_STEP_TARGETS.includes(
              currentStep.target as (typeof MODAL_STEP_TARGETS)[number]
            );
            const forceStart = START_ALIGN_TARGETS.has(currentStep.target);
            const blockBehavior =
              isModalTarget || forceStart ? 'start' : 'center';
            logger.debug(
              `Post-update recenter for '${currentStep.target}' (attempt ${attempts + 1})`,
              'Onboarding'
            );
            if (forceStart) {
              scrollElementToTop(el);
            } else {
              scrollElementIntoView(el, blockBehavior, 16);
            }
          }
        }
      } else if (!foundElementRef.current) {
        findAndScrollToTarget();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      clearTimeout(timer);
      clearPendingTimeouts();
      if (pollInterval) clearInterval(pollInterval);
      if (skipTimer) clearTimeout(skipTimer);
      if (maxWaitTimeRef.current) clearTimeout(maxWaitTimeRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [currentStep, onNext, step]);

  if (!currentStep) return null;

  const isModalStep = MODAL_STEP_TARGETS.includes(
    currentStep.target as (typeof MODAL_STEP_TARGETS)[number]
  );

  if (isLoading || !targetRect || rectStep !== step || !isCardVisible) {
    return createPortal(
      <div
        className="fixed inset-0 bg-black/70"
        style={{
          pointerEvents: 'auto',
          zIndex: isModalStep ? Z_INDEX.MODAL_BACKDROP : Z_INDEX.BACKDROP,
        }}
        aria-hidden="true"
      />,
      document.body
    );
  }

  const calculatePopupPosition = () => {
    const popupHeight = popupRef.current?.offsetHeight ?? DEFAULT_POPUP_HEIGHT;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    const spacing = Math.max(
      MIN_SPACING,
      Math.min(MAX_SPACING, targetRect.height * 0.1)
    );
    const nudgeUp = Math.max(
      MIN_SPACING,
      Math.min(MAX_SPACING, Math.round(popupHeight * 0.04))
    );

    let top =
      currentStep.position === 'bottom'
        ? targetRect.bottom + spacing
        : targetRect.top - popupHeight - (spacing + nudgeUp);

    let left = targetRect.left + targetRect.width / 2 - POPUP_WIDTH / 2;
    left = Math.max(
      MIN_VIEWPORT_MARGIN,
      Math.min(left, viewportW - POPUP_WIDTH - MIN_VIEWPORT_MARGIN)
    );

    top = Math.max(
      MIN_VIEWPORT_MARGIN,
      Math.min(top, viewportH - popupHeight - MIN_VIEWPORT_MARGIN)
    );

    return {top, left, position: currentStep.position};
  };

  const popupPosition = calculatePopupPosition();

  const calculateArrowPosition = () => {
    const targetCenter = targetRect.left + targetRect.width / 2;
    const popupLeft = popupPosition.left;

    let arrowLeft = targetCenter - popupLeft;
    arrowLeft = Math.max(30, Math.min(arrowLeft, POPUP_WIDTH - 30));

    return arrowLeft;
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0"
        style={{
          pointerEvents: 'auto',
          background: 'transparent',
          zIndex: isModalStep ? Z_INDEX.MODAL_BACKDROP : Z_INDEX.BACKDROP,
        }}
        aria-hidden="true"
      />

      <div
        className="fixed border-4 border-yellow-400 rounded-lg pointer-events-none"
        style={{
          top: targetRect.top - 8,
          left: targetRect.left - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
          zIndex: isModalStep ? Z_INDEX.MODAL_SPOTLIGHT : Z_INDEX.SPOTLIGHT,
          boxShadow:
            '0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 215, 0, 0.8)',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      />

      <FocusTrap
        active={true}
        focusTrapOptions={{
          allowOutsideClick: true,
          escapeDeactivates: false,
          initialFocus: false,
          returnFocusOnDeactivate: false,
          clickOutsideDeactivates: false,
          preventScroll: true,
        }}
      >
        <div
          ref={popupRef}
          className="fixed border-4 p-4 max-w-[350px] pixel-font pointer-events-auto"
          style={{
            top: isCardVisible ? `${popupPosition.top}px` : '-9999px',
            left: isCardVisible ? `${popupPosition.left}px` : '-9999px',
            zIndex: isModalStep ? Z_INDEX.MODAL_POPUP : Z_INDEX.POPUP,
            backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f1e8',
            borderColor: isDarkMode ? '#333333' : 'black',
            boxShadow: isDarkMode
              ? '8px 8px 0px rgba(51,51,51,1)'
              : '8px 8px 0px rgba(0,0,0,1)',
          }}
          role="dialog"
          aria-labelledby="onboarding-title"
          aria-describedby="onboarding-description"
        >
          <header className="flex justify-between items-center mb-2">
            <span
              className="text-xs"
              style={{color: isDarkMode ? '#9ca3af' : '#6b7280'}}
            >
              Step {step + 1} of {STEPS.length}
            </span>
            <button
              onClick={onSkip}
              className="text-xs hover:opacity-70 cursor-pointer transition-opacity"
              aria-label="Skip tutorial"
              style={{color: isDarkMode ? '#ef4444' : '#b91c1c'}}
            >
              Skip
            </button>
          </header>

          <h3
            id="onboarding-title"
            className="pixel-font text-base font-bold mb-2"
            style={{color: isDarkMode ? '#facc15' : '#3971a9ff'}}
          >
            {currentStep.title}
          </h3>
          <p
            id="onboarding-description"
            className="text-sm mb-4 leading-relaxed"
            style={{color: isDarkMode ? '#e5e7eb' : '#1f2937'}}
          >
            {currentStep.description}
          </p>

          <footer className="flex gap-2">
            {step > 0 && (
              <Button
                size="sm"
                variant="secondary"
                aria-label="Previous step"
                onClick={() => {
                  const openMobileMenuIfNeeded = () => {
                    const menuButton =
                      document.querySelector<HTMLButtonElement>(
                        '[data-nav-menu-toggle="true"]'
                      );
                    if (menuButton) {
                      const isExpanded =
                        menuButton.getAttribute('aria-expanded') === 'true';
                      if (!isExpanded) {
                        menuButton.click();
                      }
                    }
                  };

                  const prevTarget = STEPS[step - 1]?.target;

                  if (
                    prevTarget &&
                    NAV_BUTTON_TARGETS.includes(
                      prevTarget as (typeof NAV_BUTTON_TARGETS)[number]
                    )
                  ) {
                    openMobileMenuIfNeeded();
                  }

                  if (currentStep.target === 'clicker-nav') {
                    const prevPrevTarget = STEPS[step - 2]?.target;

                    if (
                      prevTarget === 'pokemon-card-locked' &&
                      prevPrevTarget === 'pokemon-evolution'
                    ) {
                      const hasLockedCard = document.querySelector(
                        '[data-onboarding="pokemon-card-locked"]'
                      );
                      if (!hasLockedCard) {
                        if (onNavigate) {
                          onNavigate('pokedex');
                        }
                        setTimeout(() => {
                          onPrevious();
                          setTimeout(() => {
                            onPrevious();
                            if (onOpenFirstPokemon) {
                              setTimeout(() => {
                                onOpenFirstPokemon();
                              }, 200);
                            }
                          }, 0);
                        }, 100);
                        return;
                      } else {
                        if (onNavigate) {
                          onNavigate('pokedex');
                        }
                        setTimeout(() => {
                          onPrevious();
                        }, 100);
                        return;
                      }
                    }
                  }

                  if (currentStep.target === 'world-nav') {
                    const prevTarget = STEPS[step - 1]?.target;
                    if (prevTarget === 'upgrade-panel') {
                      if (onNavigate) {
                        onNavigate('clicker');
                      }
                      setTimeout(() => {
                        onPrevious();
                      }, 100);
                      return;
                    }
                  }

                  if (currentStep.target === 'profile-button') {
                    const prevTarget = STEPS[step - 1]?.target;
                    if (prevTarget === 'map-canvas') {
                      if (onNavigate) {
                        onNavigate('map');
                      }
                      setTimeout(() => {
                        onPrevious();
                      }, 100);
                      return;
                    }
                  }

                  const isCurrentModal = MODAL_STEP_TARGETS.includes(
                    currentStep.target as (typeof MODAL_STEP_TARGETS)[number]
                  );
                  const isPrevModal = prevTarget
                    ? MODAL_STEP_TARGETS.includes(
                        prevTarget as (typeof MODAL_STEP_TARGETS)[number]
                      )
                    : false;

                  if (isCurrentModal && !isPrevModal && onClosePokemonModal) {
                    onClosePokemonModal();
                    setTimeout(() => onPrevious(), 150);
                  } else {
                    onPrevious();
                  }
                }}
              >
                Back
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => {
                const closeMobileMenuIfOpen = () => {
                  const menuButton = document.querySelector<HTMLButtonElement>(
                    '[data-nav-menu-toggle="true"]'
                  );
                  if (menuButton) {
                    const isExpanded =
                      menuButton.getAttribute('aria-expanded') === 'true';
                    if (isExpanded) {
                      menuButton.click();
                    }
                  }
                };

                const nextStep = STEPS[step + 1];
                const nextIsNavButton =
                  nextStep &&
                  NAV_BUTTON_TARGETS.includes(
                    nextStep.target as (typeof NAV_BUTTON_TARGETS)[number]
                  );

                if (nextIsNavButton) {
                  const menuButton = document.querySelector<HTMLButtonElement>(
                    '[data-nav-menu-toggle="true"]'
                  );
                  if (menuButton) {
                    const isExpanded =
                      menuButton.getAttribute('aria-expanded') === 'true';
                    if (!isExpanded) {
                      menuButton.click();
                    }
                  }
                }

                if (
                  NAV_BUTTON_TARGETS.includes(
                    currentStep.target as (typeof NAV_BUTTON_TARGETS)[number]
                  )
                ) {
                  closeMobileMenuIfOpen();

                  if (
                    nextStep &&
                    nextStep.page !== currentStep.page &&
                    onNavigate
                  ) {
                    onNavigate(nextStep.page);
                    setTimeout(() => {
                      closeMobileMenuIfOpen();
                      setTimeout(() => {
                        executeNextStep();
                      }, 100);
                    }, 200);
                  } else {
                    setTimeout(() => {
                      executeNextStep();
                    }, 100);
                  }
                  return;
                }

                if (
                  nextStep &&
                  nextStep.page !== currentStep.page &&
                  onNavigate
                ) {
                  onNavigate(nextStep.page);
                  setTimeout(() => {
                    executeNextStep();
                  }, 200);
                  return;
                }

                executeNextStep();

                function executeNextStep() {
                  if (currentStep.target === 'pokemon-upgrade') {
                    const next = STEPS[step + 1]?.target;
                    const next2 = STEPS[step + 2]?.target;
                    if (
                      next === 'pokemon-card-locked' &&
                      next2 === 'pokemon-evolution'
                    ) {
                      skipLockedAfterUpgradeRef.current = true;
                      onNext();
                      setTimeout(() => {
                        onNext();
                        skipLockedAfterUpgradeRef.current = false;
                      }, 0);
                      return;
                    }
                  }

                  const isCurrentModal = MODAL_STEP_TARGETS.includes(
                    currentStep.target as (typeof MODAL_STEP_TARGETS)[number]
                  );
                  const nextTarget = STEPS[step + 1]?.target;
                  const isNextModal = nextTarget
                    ? MODAL_STEP_TARGETS.includes(
                        nextTarget as (typeof MODAL_STEP_TARGETS)[number]
                      )
                    : false;

                  if (
                    currentStep.target === 'pokemon-evolution' &&
                    nextTarget === 'pokemon-card-locked'
                  ) {
                    const hasLockedCard = document.querySelector(
                      '[data-onboarding="pokemon-card-locked"]'
                    );
                    if (!hasLockedCard) {
                      if (onClosePokemonModal) {
                        onClosePokemonModal();
                      }

                      onNext();
                      setTimeout(() => {
                        onNext();

                        setTimeout(() => {
                          const menuButton =
                            document.querySelector<HTMLButtonElement>(
                              '[data-nav-menu-toggle="true"]'
                            );
                          if (menuButton) {
                            const isExpanded =
                              menuButton.getAttribute('aria-expanded') ===
                              'true';
                            if (!isExpanded) {
                              menuButton.click();
                            }
                          }
                        }, 100);
                      }, 0);
                      return;
                    }
                  }

                  if (isCurrentModal && !isNextModal && onClosePokemonModal) {
                    onClosePokemonModal();
                    setTimeout(() => onNext(), 150);
                  } else {
                    onNext();
                  }
                }
              }}
              className="flex-1"
              aria-label={`${step === STEPS.length - 1 ? 'Finish' : 'Next'} step`}
            >
              {step === STEPS.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </footer>

          <div
            className="absolute w-0 h-0"
            style={{
              [popupPosition.position === 'bottom' ? 'top' : 'bottom']: '-20px',
              left: `${calculateArrowPosition()}px`,
              transform: 'translateX(-50%)',
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              [popupPosition.position === 'bottom'
                ? 'borderBottom'
                : 'borderTop']:
                `20px solid ${isDarkMode ? '#1a1a1a' : '#f5f1e8'}`,
              filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))',
              animation: 'bounce 1s infinite',
            }}
          />
        </div>
      </FocusTrap>

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
          }

          @keyframes bounce {
            0%, 100% {
              transform: translateX(-50%) translateY(0);
            }
            50% {
              transform: translateX(-50%) translateY(-8px);
            }
          }
        `}
      </style>
    </>,
    document.body
  );
}
