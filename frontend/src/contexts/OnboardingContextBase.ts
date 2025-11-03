import {createContext} from 'react';

export interface OnboardingContextType {
  step: number;
  isActive: boolean;
  nextStep: () => void;
  previousStep: () => void;
  skipTutorial: () => void;
  restartTutorial: () => void;
}

export const OnboardingContext = createContext<
  OnboardingContextType | undefined
>(undefined);
