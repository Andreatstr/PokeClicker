import {useState, useEffect} from 'react';

/**
 * Custom hook to manage the onboarding tutorial state
 * Shows tutorial on first visit, persists completion to localStorage
 */
export function useOnboarding() {
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

  return {
    step,
    isActive,
    nextStep,
    previousStep,
    skipTutorial,
    restartTutorial,
  };
}
