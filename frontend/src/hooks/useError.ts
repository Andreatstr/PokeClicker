import {useContext} from 'react';
import {ErrorContext} from '@/contexts/ErrorContext';

/**
 * Hook to access error context
 * Must be used within ErrorProvider
 */
export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}
