import {useState, useEffect} from 'react';

/**
 * Hook for managing onboarding tutorial state and progression
 *
 * Features:
 * - Shows tutorial automatically on first visit
 * - Persists completion to localStorage
 * - Step-by-step progression (next/previous)
 * - Skip functionality to dismiss tutorial
 * - Manual restart for demo/testing purposes
 *
 * Tutorial flow:
 * - Checks localStorage for 'onboarding_completed' flag
 * - Activates tutorial if flag not present
 * - Saves flag when tutorial skipped or completed
 *
 * @returns Tutorial state (step, isActive) and control functions
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
