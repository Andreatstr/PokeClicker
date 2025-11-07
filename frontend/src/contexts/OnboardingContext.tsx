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
    const hasSeenTutorial = localStorage.getItem('onboarding_completed');

    // Always show onboarding for guest user (localStorage is cleared in AuthContext)
    // For other users, only show if they haven't seen it
    if (!hasSeenTutorial) {
      setStep(0);
      setIsActive(true);
    }
  }, [user]);

  const nextStep = () => setStep((s) => s + 1);

  const previousStep = () => setStep((s) => Math.max(0, s - 1));

  const skipTutorial = () => {
    setIsActive(false);
    localStorage.setItem('onboarding_completed', 'true');
  };

  // Allow manual restart for demo purposes (for examiners)
  const restartTutorial = () => {
    localStorage.removeItem('onboarding_completed');
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
