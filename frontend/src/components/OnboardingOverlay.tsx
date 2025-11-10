import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {FocusTrap} from 'focus-trap-react';
import {Button} from '@ui/pixelact';

type Page = 'pokedex' | 'clicker' | 'map' | 'profile' | 'ranks';

interface OnboardingStep {
  target: string;
  title: string;
  description: string;
  position: 'bottom' | 'top';
  page: Page;
  highlight?: boolean;
  waitForTarget?: boolean; // If true, wait for user to trigger the target (e.g., open modal)
}

const STEPS: OnboardingStep[] = [
  // Pokedex Page - Steps 0-6
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
      'Your Pokemon live here. Click a card to see stats and evolution.',
    position: 'top',
    page: 'pokedex',
    highlight: true,
  },
  {
    target: 'pokemon-stats',
    title: 'Pokemon Stats',
    description:
      'Stats and abilities live here: HP, Attack, Defense, Speed, and more.',
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
    target: 'pokemon-card-locked',
    title: 'Unlock New Pokemon',
    description:
      "Locked cards show Pokemon you don't own yet and how to unlock them.",
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
  // Transition to Clicker - Step 7
  {
    target: 'clicker-nav',
    title: 'Now Visit the Clicker!',
    description: 'Next, a quick tour of earning Rare Candy in Clicker.',
    position: 'bottom',
    page: 'pokedex',
    highlight: true,
  },
  // Clicker Page - Steps 8-9
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
    description: 'Use upgrades to boost earnings and efficiency later.',
    position: 'top',
    page: 'clicker',
    highlight: true,
  },
  // Transition to World - Step 10
  {
    target: 'world-nav',
    title: 'Explore the World!',
    description: 'Next, a quick look at the World map.',
    position: 'bottom',
    page: 'clicker',
    highlight: true,
  },
  // World/Map Page - Steps 11-12
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
      'Wild Pokemon appear as sprites on the map. Run into them to start a battle and catch them!',
    position: 'top',
    page: 'map',
    highlight: true,
  },
  // Transition to Profile - Step 13
  {
    target: 'profile-button',
    title: 'Visit Your Profile!',
    description: "Let's check out your Profile next.",
    position: 'bottom',
    page: 'map',
    highlight: true,
  },
  // Profile Page - Step 14
  {
    target: 'pokemon-selection',
    title: 'Choose Your Pokemon',
    description:
      'Pick your favorite Pokemon and your Clicker Pokemon. Your Clicker Pokemon appears on screen! Restart this tutorial anytime from here.',
    position: 'top',
    page: 'profile',
    highlight: true,
  },
  // Transition to Ranks - Step 15
  {
    target: 'ranks-nav',
    title: 'Check the Ranks!',
    description: "Finally, let's see how you rank against other trainers.",
    position: 'bottom',
    page: 'profile',
    highlight: true,
  },
  // Ranks Page - Step 16
  {
    target: 'league-buttons',
    title: 'Global Rankings',
    description:
      'Compete in two leagues: Candy League for most Rare Candy and Pokemon League for most Pokemon caught. Climb the ranks!',
    position: 'bottom',
    page: 'ranks',
    highlight: true,
  },
];

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
  const clearPendingTimeouts = () => {
    for (const id of pendingTimeoutsRef.current) clearTimeout(id);
    pendingTimeoutsRef.current = [];
  };
  const openedMobileMenuForStepRef = useRef<number | null>(null);

  // After the popup becomes visible, re-render once to measure actual height
  useEffect(() => {
    if (isCardVisible) {
      const id = setTimeout(() => setRepositionTick((t) => t + 1), 0);
      return () => clearTimeout(id);
    }
  }, [isCardVisible, targetRect, step]);

  // Handle page navigation and auto-open modal when step changes
  useEffect(() => {
    if (!currentStep) return;

    // Navigate to the correct page for this step
    if (previousStep && currentStep.page !== previousStep.page) {
      if (onNavigate) {
        onNavigate(currentStep.page);
      }
    }

    // Auto-open the Pokemon modal for modal-target steps
    // Add delay to ensure DOM is ready and card is clickable
    if (
      ['pokemon-stats', 'pokemon-upgrade', 'pokemon-evolution'].includes(
        currentStep.target
      ) &&
      onOpenFirstPokemon
    ) {
      // Slightly longer delay on mobile to ensure modal is mount-ready
      const coarse =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(pointer: coarse)').matches;
      const openDelay =
        coarse && currentStep.target === 'pokemon-stats' ? 350 : 200;
      const t = setTimeout(() => {
        onOpenFirstPokemon();
      }, openDelay);
      return () => clearTimeout(t);
    }
  }, [currentStep, previousStep, onNavigate, onOpenFirstPokemon]);

  // Ensure the detail modal closes when transitioning from a modal step to a non-modal step
  useEffect(() => {
    if (!currentStep || !previousStep) return;
    const modalTargets = [
      'pokemon-stats',
      'pokemon-upgrade',
      'pokemon-evolution',
    ];
    const wasModal = modalTargets.includes(previousStep.target);
    const isNowModal = modalTargets.includes(currentStep.target);
    // Do not close when intentionally skipping locked step after upgrade
    const skippingLocked =
      skipLockedAfterUpgradeRef.current &&
      previousStep.target === 'pokemon-upgrade' &&
      currentStep.target === 'pokemon-card-locked';

    // Only close modal when going from modal step to non-modal step
    // AND not going backwards (previousStep.page check ensures forward navigation)
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

  const skippedStepRef = useRef<number | null>(null);
  const maxWaitTimeRef = useRef<number | undefined>(undefined);

  // Helper to check if rects are significantly different (more than 5px in any dimension)
  const rectsAreDifferent = (
    rect1: DOMRect | null,
    rect2: DOMRect | null,
    threshold = 5
  ) => {
    if (!rect1 || !rect2) return true;
    return (
      Math.abs(rect1.top - rect2.top) > threshold ||
      Math.abs(rect1.left - rect2.left) > threshold ||
      Math.abs(rect1.width - rect2.width) > threshold ||
      Math.abs(rect1.height - rect2.height) > threshold
    );
  };

  useEffect(() => {
    if (!currentStep) return;

    // Reset loading state and found flag when step changes
    setIsLoading(true);
    setIsCardVisible(false);
    setTargetRect(null);
    setRectStep(null);
    foundElementRef.current = false;
    lastRectRef.current = null;

    const startTime = Date.now();
    // Allow more time for mobile nav steps (needs burger open)
    const navTargetsSet = new Set([
      'clicker-nav',
      'world-nav',
      'ranks-nav',
      'profile-button',
    ]);
    const MAX_WAIT_TIME = navTargetsSet.has(currentStep.target) ? 6000 : 3000;

    const findAndScrollToTarget = () => {
      // Use requestAnimationFrame for faster, more efficient DOM queries
      requestAnimationFrame(() => {
        if (foundElementRef.current) return; // Don't search if already found

        const candidates = Array.from(
          document.querySelectorAll(`[data-onboarding="${currentStep.target}"]`)
        ) as HTMLElement[];
        const isVisible = (el: HTMLElement) => {
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          const hasSize = rect.width > 1 && rect.height > 1;
          const visibleStyle =
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            (el.offsetParent !== null || style.position === 'fixed');
          return hasSize && visibleStyle;
        };
        const targetElement = candidates.find(isVisible) ?? null;

        if (targetElement) {
          foundElementRef.current = true;

          // Scroll element into view if needed
          const blockBehavior: ScrollLogicalPosition = [
            'pokemon-stats',
            'pokemon-upgrade',
            'pokemon-evolution',
          ].includes(currentStep.target)
            ? 'start'
            : 'center';
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: blockBehavior,
          });

          // Minimal delay to ensure layout is stable; longer on mobile for modals
          const coarse =
            typeof window !== 'undefined' &&
            typeof window.matchMedia === 'function' &&
            window.matchMedia('(pointer: coarse)').matches;
          const isStatsStep = currentStep.target === 'pokemon-stats';
          // Longer initial delay on mobile specifically for the Stats modal (step 4)
          const delay = isModalStep
            ? coarse
              ? isStatsStep
                ? 700
                : 320
              : 140
            : 0;

          const t1 = window.setTimeout(() => {
            const rect1 = targetElement.getBoundingClientRect();
            lastRectRef.current = rect1;
            setTargetRect(rect1);
            setRectStep(step);

            if (isModalStep && coarse) {
              // Extra settle pass on mobile for modal content
              const settleDelay = isStatsStep ? 300 : 140;
              const t2 = window.setTimeout(() => {
                const rect2 = targetElement.getBoundingClientRect();
                if (rectsAreDifferent(rect2, rect1, 2)) {
                  lastRectRef.current = rect2;
                  setTargetRect(rect2);
                }
                if (isStatsStep) {
                  const t3 = window.setTimeout(() => {
                    const rect3 = targetElement.getBoundingClientRect();
                    if (rectsAreDifferent(rect3, rect2, 2)) {
                      lastRectRef.current = rect3;
                      setTargetRect(rect3);
                    }
                    setIsLoading(false);
                    const t4 = window.setTimeout(
                      () => setIsCardVisible(true),
                      80
                    );
                    pendingTimeoutsRef.current.push(t4);
                  }, 180);
                  pendingTimeoutsRef.current.push(t3);
                } else {
                  setIsLoading(false);
                  const t4 = window.setTimeout(
                    () => setIsCardVisible(true),
                    80
                  );
                  pendingTimeoutsRef.current.push(t4);
                }
              }, settleDelay);
              pendingTimeoutsRef.current.push(t2);
            } else {
              setIsLoading(false);
              const t5 = window.setTimeout(() => setIsCardVisible(true), 80);
              pendingTimeoutsRef.current.push(t5);
            }
          }, delay);
          pendingTimeoutsRef.current.push(t1);
        } else {
          // Mobile navbar: if highlighting a nav item, open burger menu first when closed
          const navTargets = new Set([
            'clicker-nav',
            'world-nav',
            'ranks-nav',
            'profile-button',
          ]);
          let burgerBtn = document.querySelector(
            'button[aria-label="Toggle mobile menu"]'
          ) as HTMLButtonElement | null;
          if (!burgerBtn) {
            burgerBtn = document.querySelector(
              'section[aria-label="Mobile menu control"] button'
            ) as HTMLButtonElement | null;
          }
          const burgerClosed =
            burgerBtn?.getAttribute('aria-expanded') !== 'true';
          if (
            navTargets.has(currentStep.target) &&
            burgerBtn &&
            burgerClosed &&
            openedMobileMenuForStepRef.current !== step
          ) {
            openedMobileMenuForStepRef.current = step;
            window.scrollTo({top: 0, behavior: 'smooth'});
            const tOpen = window.setTimeout(() => {
              try {
                burgerBtn.click();
              } catch (e) {
                // ignore best-effort click errors
                void e;
              }
            }, 180);
            pendingTimeoutsRef.current.push(tOpen);
          }
          // Check if max wait time exceeded
          if (Date.now() - startTime > MAX_WAIT_TIME) {
            setIsLoading(false);
            setTargetRect(null);
            setRectStep(null);
          }
        }
      });
    };

    // Start immediately
    const timer = setTimeout(findAndScrollToTarget, 0);

    // For modal-based steps (pokemon-stats, pokemon-upgrade, pokemon-evolution),
    // keep polling until element appears
    const pollInterval: number = window.setInterval(() => {
      if (!foundElementRef.current) {
        findAndScrollToTarget();
      } else {
        // Clear interval once element is found
        if (pollInterval) clearInterval(pollInterval);
      }
    }, 16); // ~60fps polling
    const isModalStep = [
      'pokemon-stats',
      'pokemon-upgrade',
      'pokemon-evolution',
    ].includes(currentStep.target);

    // Poll frequently until found, then stop

    // Max wait timeout
    maxWaitTimeRef.current = setTimeout(() => {
      setIsLoading(false);
    }, MAX_WAIT_TIME);

    // If on the locked-card step and target is missing, skip this step gracefully
    let skipTimer: number | undefined;
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

    // Recalculate position on window resize/scroll
    const handleResize = () => {
      if (foundElementRef.current) {
        // Reset found flag to allow recalculation on resize
        foundElementRef.current = false;
        findAndScrollToTarget();
      }
    };
    const handleScroll = () => {
      const candidates = Array.from(
        document.querySelectorAll(`[data-onboarding="${currentStep.target}"]`)
      ) as HTMLElement[];
      const isVisible = (el: HTMLElement) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const hasSize = rect.width > 1 && rect.height > 1;
        const visibleStyle =
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          (el.offsetParent !== null || style.position === 'fixed');
        return hasSize && visibleStyle;
      };
      const el = candidates.find(isVisible) ?? null;
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rectsAreDifferent(rect, lastRectRef.current, 2)) {
          lastRectRef.current = rect;
          setTargetRect(rect);
          setRectStep(step);
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

  // For modal steps, if target not found yet, show backdrop but wait for element
  const isModalStep = [
    'pokemon-stats',
    'pokemon-upgrade',
    'pokemon-evolution',
  ].includes(currentStep.target);

  // Show only dark backdrop while waiting for target element (prevents white flash)
  if (isLoading || !targetRect || rectStep !== step || !isCardVisible) {
    return createPortal(
      <div
        className={`fixed inset-0 bg-black/70 ${isModalStep ? 'z-[50000]' : 'z-[9998]'}`}
        style={{pointerEvents: 'auto'}}
        aria-hidden="true"
      />,
      document.body
    );
  }

  // Calculate popup position
  const calculatePopupPosition = () => {
    const popupWidth = 350;
    const popupHeight = popupRef.current?.offsetHeight ?? 200;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    // Adaptive small spacing (non-hardcoded per-step): 6–10px based on target height
    const spacing = Math.max(6, Math.min(10, targetRect.height * 0.1));
    // Upward nudge based on popup height (~4% => ~8px for 200px height), clamped 6–10px
    const nudgeUp = Math.max(6, Math.min(10, Math.round(popupHeight * 0.04)));

    // Respect desired position; apply upward nudge only for top-positioned cards
    let top =
      currentStep.position === 'bottom'
        ? targetRect.bottom + spacing
        : targetRect.top - popupHeight - (spacing + nudgeUp);

    // Center horizontally relative to target and clamp
    let left = targetRect.left + targetRect.width / 2 - popupWidth / 2;
    left = Math.max(16, Math.min(left, viewportW - popupWidth - 16));

    // Clamp vertical position to viewport while keeping general intent
    top = Math.max(16, Math.min(top, viewportH - popupHeight - 16));

    return {top, left, position: currentStep.position};
  };

  const popupPosition = calculatePopupPosition();

  // Calculate arrow position
  const calculateArrowPosition = () => {
    const popupWidth = 350;
    const targetCenter = targetRect.left + targetRect.width / 2;
    const popupLeft = popupPosition.left;

    // Arrow position relative to popup
    let arrowLeft = targetCenter - popupLeft;
    arrowLeft = Math.max(30, Math.min(arrowLeft, popupWidth - 30));

    return arrowLeft;
  };

  return createPortal(
    <>
      {/* Transparent backdrop; blocks app interaction but does not cancel onboarding */}
      <div
        className={`fixed inset-0 ${isModalStep ? 'z-[50000]' : 'z-[9998]'}`}
        style={{pointerEvents: 'auto', background: 'transparent'}}
        aria-hidden="true"
      />

      {/* Spotlight on target element */}
      <div
        className={`fixed ${isModalStep ? 'z-[50001]' : 'z-[9999]'} border-4 border-yellow-400 rounded-lg pointer-events-none`}
        style={{
          top: targetRect.top - 8,
          left: targetRect.left - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
          // Giant outer shadow creates a dark backdrop with a rounded cutout matching this box
          boxShadow:
            '0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 215, 0, 0.8)',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      />

      {/* Popup with FocusTrap */}
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
          className={`fixed ${isModalStep ? 'z-[50002]' : 'z-[9999]'} border-4 p-4 max-w-[350px] pixel-font pointer-events-auto`}
          style={{
            top: isCardVisible ? `${popupPosition.top}px` : '-9999px',
            left: isCardVisible ? `${popupPosition.left}px` : '-9999px',
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
          {/* Step indicator */}
          <header className="flex justify-between items-center mb-2">
            <span
              className="text-xs"
              style={{color: isDarkMode ? '#9ca3af' : '#6b7280'}}
            >
              Step {step + 1} of {STEPS.length}
            </span>
            <button
              onClick={onSkip}
              className="text-xs hover:opacity-70 transition-opacity"
              aria-label="Skip tutorial"
              style={{color: isDarkMode ? '#ef4444' : '#dc2626'}}
            >
              Skip
            </button>
          </header>

          <h3
            id="onboarding-title"
            className="pixel-font text-base font-bold mb-2"
            style={{color: '#facc15'}}
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
                  const modalTargets = [
                    'pokemon-stats',
                    'pokemon-upgrade',
                    'pokemon-evolution',
                  ];

                  // Special case: going back from evolution should skip locked-card and go to upgrade
                  if (currentStep.target === 'pokemon-evolution') {
                    const prevTarget = STEPS[step - 1]?.target;
                    const prevPrevTarget = STEPS[step - 2]?.target;
                    if (
                      prevTarget === 'pokemon-card-locked' &&
                      prevPrevTarget === 'pokemon-upgrade'
                    ) {
                      // Skip locked-card and go directly to upgrade, keep modal open
                      onPrevious(); // to locked
                      setTimeout(() => {
                        onPrevious(); // to upgrade
                      }, 0);
                      return;
                    }
                  }

                  const isCurrentModal = modalTargets.includes(
                    currentStep.target
                  );
                  const prevTarget = STEPS[step - 1]?.target;
                  const isPrevModal = prevTarget
                    ? modalTargets.includes(prevTarget)
                    : false;

                  // If going from modal to non-modal (backwards), close the modal
                  if (isCurrentModal && !isPrevModal && onClosePokemonModal) {
                    onClosePokemonModal();
                    // Small delay to allow UI to update before going back
                    setTimeout(() => onPrevious(), 150);
                  } else {
                    // If staying within modal steps or going from non-modal, just go back
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
                // If moving from Upgrade to Evolution, skip the intermediate locked-card step
                if (currentStep.target === 'pokemon-upgrade') {
                  const next = STEPS[step + 1]?.target;
                  const next2 = STEPS[step + 2]?.target;
                  if (
                    next === 'pokemon-card-locked' &&
                    next2 === 'pokemon-evolution'
                  ) {
                    skipLockedAfterUpgradeRef.current = true;
                    onNext(); // to locked
                    // Immediately advance to evolution and keep modal open
                    setTimeout(() => {
                      onNext();
                      skipLockedAfterUpgradeRef.current = false;
                    }, 0);
                    return;
                  }
                }
                const modalTargets = [
                  'pokemon-stats',
                  'pokemon-upgrade',
                  'pokemon-evolution',
                ];
                const isCurrentModal = modalTargets.includes(
                  currentStep.target
                );
                const nextTarget = STEPS[step + 1]?.target;
                const isNextModal = nextTarget
                  ? modalTargets.includes(nextTarget)
                  : false;

                // If leaving a modal step to a non-modal step, close the modal first
                if (isCurrentModal && !isNextModal && onClosePokemonModal) {
                  onClosePokemonModal();
                  // Small delay to allow UI to update before advancing step
                  setTimeout(() => onNext(), 150);
                } else {
                  onNext();
                }
              }}
              className="flex-1"
              aria-label={`${step === STEPS.length - 1 ? 'Finish' : 'Next'} step`}
            >
              {step === STEPS.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </footer>

          {/* Animated Arrow pointing to element */}
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

      {/* Add keyframe animations */}
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
