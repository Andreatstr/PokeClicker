import {useState, useEffect, type ReactNode} from 'react';
import {OnboardingContext} from '@/contexts/OnboardingContextBase';
import {useAuth} from '@features/auth';

interface OnboardingProviderProps {
  children: ReactNode;
}

/**
 * Onboarding provider that manages the tutorial flow state
 *
 * @remarks
 * Features:
 * - 17-step tutorial (steps 0-16)
 * - Different persistence strategies for guest vs. regular users
 * - Guest users: sessionStorage (tutorial shows on new login, not on page reload)
 * - Regular users: localStorage (tutorial shows once per user, persists across sessions)
 * - Manual restart capability for demonstration purposes
 *
 * @param children - Child components to wrap
 */
export function OnboardingProvider({children}: OnboardingProviderProps) {
  const [step, setStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const {user} = useAuth();

  // Auto-activate onboarding for new users based on storage persistence
  useEffect(() => {
    if (!user) return;

    const isGuest = user.username.toLowerCase() === 'guest';

    // Guest users use sessionStorage to show tutorial on each new login but not on page reloads
    // Regular users use localStorage to show tutorial only once ever
    const storageKey = isGuest
      ? 'onboarding_completed_session'
      : 'onboarding_completed';
    const storage = isGuest ? sessionStorage : localStorage;
    const hasSeenTutorial = storage.getItem(storageKey);

    if (!hasSeenTutorial && !isActive) {
      setStep(0);
      setIsActive(true);
    }
  }, [user, isActive]);

  const nextStep = () => {
    // Tutorial has 17 steps (0-16), so reaching step 16 means completion
    if (step >= 16) {
      skipTutorial();
    } else {
      setStep((s) => s + 1);
    }
  };

  const previousStep = () => setStep((s) => Math.max(0, s - 1));

  const skipTutorial = () => {
    setIsActive(false);
    const isGuest = user?.username.toLowerCase() === 'guest';

    // Persist completion status using appropriate storage for user type
    if (isGuest) {
      sessionStorage.setItem('onboarding_completed_session', 'true');
    } else {
      localStorage.setItem('onboarding_completed', 'true');
    }
  };

  const restartTutorial = () => {
    const isGuest = user?.username.toLowerCase() === 'guest';

    // Clear completion flags to allow tutorial replay
    if (isGuest) {
      sessionStorage.removeItem('onboarding_completed_session');
    } else {
      localStorage.removeItem('onboarding_completed');
    }
    setStep(0);
    setIsActive(true);
  };

  return (
    <OnboardingContext.Provider
      value={{
        step,
        isActive,
        nextStep,
        previousStep,
        skipTutorial,
        restartTutorial,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}
