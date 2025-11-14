import {createContext} from 'react';

/**
 * Onboarding context value shape
 * Manages the interactive tutorial/onboarding flow
 */
export interface OnboardingContextType {
  /** Current step in the onboarding flow (0-16) */
  step: number;
  /** Whether the onboarding tutorial is currently active */
  isActive: boolean;
  /** Advance to the next onboarding step */
  nextStep: () => void;
  /** Go back to the previous onboarding step */
  previousStep: () => void;
  /** Skip the tutorial and mark it as completed */
  skipTutorial: () => void;
  /** Manually restart the tutorial (useful for demo purposes) */
  restartTutorial: () => void;
}

/**
 * Context for managing the application onboarding tutorial
 *
 * @remarks
 * Do not consume directly - use the useOnboarding hook instead
 */
export const OnboardingContext = createContext<
  OnboardingContextType | undefined
>(undefined);
