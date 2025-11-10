import {useState, useEffect, type ReactNode} from 'react';
import {OnboardingContext} from '@/contexts/OnboardingContextBase';
import {useAuth} from '@features/auth';

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({children}: OnboardingProviderProps) {
  const [step, setStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const {user} = useAuth();

  // Check onboarding status on mount and when user changes
  useEffect(() => {
    // Only check if user is set (not null)
    if (!user) return;

    const isGuest = user.username.toLowerCase() === 'guest';

    // For guest users, check sessionStorage (persists during session, clears on new login)
    // For other users, check localStorage (persists across sessions)
    const storageKey = isGuest
      ? 'onboarding_completed_session'
      : 'onboarding_completed';
    const storage = isGuest ? sessionStorage : localStorage;
    const hasSeenTutorial = storage.getItem(storageKey);

    // Always show onboarding for guest user on new login (sessionStorage is empty)
    // For other users, only show if they haven't seen it
    if (!hasSeenTutorial && !isActive) {
      setStep(0);
      setIsActive(true);
    }
  }, [user, isActive]);

  const nextStep = () => {
    // There are 17 steps (0-16), so if we're at step 16, finish the tutorial
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

    // For guest users, use sessionStorage (persists during session, clears on new login)
    // For other users, use localStorage (persists across sessions)
    if (isGuest) {
      sessionStorage.setItem('onboarding_completed_session', 'true');
    } else {
      localStorage.setItem('onboarding_completed', 'true');
    }
  };

  // Allow manual restart for demo purposes (for examiners)
  const restartTutorial = () => {
    const isGuest = user?.username.toLowerCase() === 'guest';

    // Clear the appropriate storage based on user type
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
