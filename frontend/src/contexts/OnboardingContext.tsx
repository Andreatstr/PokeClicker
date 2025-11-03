import {useState, useEffect, type ReactNode} from 'react';
import {OnboardingContext} from '@/contexts/OnboardingContextBase';

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({children}: OnboardingProviderProps) {
  const [step, setStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('onboarding_completed');
    if (!hasSeenTutorial) {
      setIsActive(true);
    }
  }, []);

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
