import {useContext} from 'react';
import {OnboardingContext} from '@/contexts/OnboardingContextBase';

/**
 * Hook to access the onboarding tutorial context
 *
 * @returns Onboarding state and control methods
 * @throws Error if used outside OnboardingProvider
 *
 * @example
 * ```tsx
 * const { step, isActive, nextStep, skipTutorial } = useOnboarding();
 * ```
 */
export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
