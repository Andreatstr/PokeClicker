import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {FocusTrap} from 'focus-trap-react';
import {Button} from '@ui/pixelact';
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
    target: 'pokemon-selection-and-tutorial',
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
  const maxWaitTimeRef = useRef<number | undefined>(undefined);

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

    if (previousStep && currentStep.page !== previousStep.page) {
      if (onNavigate) {
        onNavigate(currentStep.page);
      }
    }

    if (
      MODAL_STEP_TARGETS.includes(
        currentStep.target as (typeof MODAL_STEP_TARGETS)[number]
      ) &&
      onOpenFirstPokemon
    ) {
      const isMobile = isMobileDevice();
      const openDelay =
        isMobile && currentStep.target === 'pokemon-stats'
          ? TIMING.MODAL_OPEN_MOBILE
          : TIMING.MODAL_OPEN_DEFAULT;
      const t = setTimeout(() => {
        onOpenFirstPokemon();
      }, openDelay);
      return () => clearTimeout(t);
    }
  }, [currentStep, previousStep, onNavigate, onOpenFirstPokemon]);

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

        const targetElement = findVisibleOnboardingElement(currentStep.target);

        if (targetElement) {
          foundElementRef.current = true;

          const blockBehavior: ScrollLogicalPosition =
            MODAL_STEP_TARGETS.includes(
              currentStep.target as (typeof MODAL_STEP_TARGETS)[number]
            )
              ? 'start'
              : 'center';
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: blockBehavior,
          });

          const isModalStep = MODAL_STEP_TARGETS.includes(
            currentStep.target as (typeof MODAL_STEP_TARGETS)[number]
          );
          const isStatsStep = currentStep.target === 'pokemon-stats';

          const rect = await waitForRect(
            targetElement,
            isModalStep,
            isStatsStep
          );
          lastRectRef.current = rect;
          setTargetRect(rect);
          setRectStep(step);
          setIsLoading(false);

          await delay(TIMING.CARD_VISIBILITY_DELAY);
          setIsCardVisible(true);
        } else {
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
            openedMobileMenuForStepRef.current = step;
            window.scrollTo({top: 0, behavior: 'smooth'});
            await delay(TIMING.SCROLL_SMOOTH_DELAY);
            try {
              burgerBtn.click();
            } catch (e) {
              void e;
            }
          }

          if (Date.now() - startTime > MAX_WAIT_TIME) {
            setIsLoading(false);
            setTargetRect(null);
            setRectStep(null);
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

    maxWaitTimeRef.current = setTimeout(() => {
      setIsLoading(false);
    }, MAX_WAIT_TIME);

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
        className={`fixed inset-0 bg-black/70 ${isModalStep ? `z-[${Z_INDEX.MODAL_BACKDROP}]` : `z-[${Z_INDEX.BACKDROP}]`}`}
        style={{pointerEvents: 'auto'}}
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
        className={`fixed inset-0 ${isModalStep ? `z-[${Z_INDEX.MODAL_BACKDROP}]` : `z-[${Z_INDEX.BACKDROP}]`}`}
        style={{pointerEvents: 'auto', background: 'transparent'}}
        aria-hidden="true"
      />

      <div
        className={`fixed ${isModalStep ? `z-[${Z_INDEX.MODAL_SPOTLIGHT}]` : `z-[${Z_INDEX.SPOTLIGHT}]`} border-4 border-yellow-400 rounded-lg pointer-events-none`}
        style={{
          top: targetRect.top - 8,
          left: targetRect.left - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
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
          className={`fixed ${isModalStep ? `z-[${Z_INDEX.MODAL_POPUP}]` : `z-[${Z_INDEX.POPUP}]`} border-4 p-4 max-w-[350px] pixel-font pointer-events-auto`}
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
