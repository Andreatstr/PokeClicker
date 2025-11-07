import {useEffect, useRef, useState} from 'react';
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
  const currentStep = STEPS[step];
  const previousStep = step > 0 ? STEPS[step - 1] : null;
  const skipLockedAfterUpgradeRef = useRef(false);

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
    if (
      ['pokemon-stats', 'pokemon-upgrade', 'pokemon-evolution'].includes(
        currentStep.target
      ) &&
      onOpenFirstPokemon
    ) {
      onOpenFirstPokemon();
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

    if (wasModal && !isNowModal && onClosePokemonModal && !skippingLocked) {
      onClosePokemonModal();
    }
  }, [currentStep, previousStep, onClosePokemonModal]);

  const skippedStepRef = useRef<number | null>(null);

  useEffect(() => {
    if (!currentStep) return;

    const findAndScrollToTarget = () => {
      const targetElement = document.querySelector(
        `[data-onboarding="${currentStep.target}"]`
      );

      if (targetElement) {
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

        // Small delay to ensure scroll completes before getting rect
        setTimeout(() => {
          const rect = targetElement.getBoundingClientRect();
          setTargetRect(rect);
        }, 300);
      } else {
        setTargetRect(null);
      }
    };

    // Delay finding target to allow page navigation to complete
    const timer = setTimeout(findAndScrollToTarget, 400);

    // For modal-based steps (pokemon-stats, pokemon-upgrade, pokemon-evolution),
    // keep polling until element appears
    let pollInterval: number | undefined;
    const isModalStep = [
      'pokemon-stats',
      'pokemon-upgrade',
      'pokemon-evolution',
    ].includes(currentStep.target);
    if (isModalStep && !targetRect) {
      pollInterval = setInterval(findAndScrollToTarget, 300);
    }

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

    // Recalculate position on window resize
    const handleResize = () => findAndScrollToTarget();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      if (pollInterval) clearInterval(pollInterval);
      if (skipTimer) clearTimeout(skipTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentStep, targetRect, onNext, step]);

  if (!currentStep) return null;

  // For modal steps, if target not found yet, show backdrop but wait for element
  const isModalStep = [
    'pokemon-stats',
    'pokemon-upgrade',
    'pokemon-evolution',
  ].includes(currentStep.target);
  if (!targetRect) {
    // For modal steps, show nothing while waiting for target to appear
    if (isModalStep) return null;
    // For non-modal steps, hide tutorial if element not found
    return null;
  }

  // Calculate popup position
  const calculatePopupPosition = () => {
    const popupWidth = 350;
    const popupHeight = 200;
    // Extra spacing for bottom corner elements
    let spacing = 24;
    if (currentStep.target === 'music-player') {
      spacing = 80;
    } else if (currentStep.target === 'candy-counter') {
      spacing = 120; // Extra high for candy counter in bottom-right
    } else if (currentStep.target === 'pokemon-stats') {
      // Move popup further away from stats to avoid covering the section
      spacing = 140;
    } else if (currentStep.target === 'pokemon-upgrade') {
      // Keep popup well above the upgrade button
      spacing = 120;
    } else if (currentStep.target === 'pokemon-evolution') {
      // Keep popup well above the evolution section
      spacing = 160;
    }

    let top: number;
    let left: number;

    if (currentStep.position === 'bottom') {
      top = targetRect.bottom + spacing;
    } else {
      top = targetRect.top - popupHeight - spacing;
    }

    // Center horizontally relative to target, but keep within viewport
    left = targetRect.left + targetRect.width / 2 - popupWidth / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - popupWidth - 16));

    // Keep within viewport vertically
    top = Math.max(16, Math.min(top, window.innerHeight - popupHeight - 16));

    return {top, left};
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

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/70 ${isModalStep ? 'z-[11000]' : 'z-[9998]'}`}
        onClick={isModalStep ? undefined : onSkip}
        style={{pointerEvents: isModalStep ? 'none' : 'auto'}}
        aria-hidden="true"
      />

      {/* Spotlight on target element */}
      <div
        className={`fixed ${isModalStep ? 'z-[11001]' : 'z-[9999]'} border-4 border-yellow-400 rounded-lg pointer-events-none`}
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

      {/* Popup */}
      <div
        className={`fixed ${isModalStep ? 'z-[11001]' : 'z-[9999]'} border-4 p-4 max-w-[350px] pixel-font`}
        style={{
          top: `${popupPosition.top}px`,
          left: `${popupPosition.left}px`,
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
        <div className="flex justify-between items-center mb-2">
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
        </div>

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

        <div className="flex gap-2">
          {step > 0 && (
            <Button size="sm" variant="secondary" onClick={onPrevious}>
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
              const isCurrentModal = modalTargets.includes(currentStep.target);
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
          >
            {step === STEPS.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </div>

        {/* Animated Arrow pointing to element */}
        <div
          className="absolute w-0 h-0"
          style={{
            [currentStep.position === 'bottom' ? 'top' : 'bottom']: '-20px',
            left: `${calculateArrowPosition()}px`,
            transform: 'translateX(-50%)',
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            [currentStep.position === 'bottom' ? 'borderBottom' : 'borderTop']:
              `20px solid ${isDarkMode ? '#1a1a1a' : '#f5f1e8'}`,
            filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))',
            animation: 'bounce 1s infinite',
          }}
        />
      </div>

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
    </>
  );
}
