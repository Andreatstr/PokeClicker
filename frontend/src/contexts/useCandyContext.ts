/**
 * Hook to access global candy state and actions
 * @throws Error if used outside CandyProvider
 */
import {useContext} from 'react';
import {CandyContext} from './CandyContextBase';

export function useCandyContext() {
  const context = useContext(CandyContext);
  if (!context) {
    throw new Error('useCandyContext must be used within CandyProvider');
  }
  return context;
}
