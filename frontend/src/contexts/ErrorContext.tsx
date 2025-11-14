/* eslint-disable react-refresh/only-export-components */
import {createContext, useState, useCallback, type ReactNode} from 'react';
import {
  type AppError,
  handleError as handleErrorUtil,
  ErrorSeverity,
} from '@/lib/errorHandler';

/**
 * Error context value shape
 * Provides centralized error management across the application
 */
interface ErrorContextValue {
  errors: AppError[];
  addError: (error: unknown, context?: string) => void;
  removeError: (errorId: string) => void;
  clearErrors: () => void;
  hasErrors: boolean;
}

/**
 * Global error context for application-wide error handling
 *
 * @remarks
 * This context should not be consumed directly. Use the useError hook from @/hooks/useError instead.
 * Provides a centralized error queue with automatic dismissal for non-critical errors.
 */
export const ErrorContext = createContext<ErrorContextValue | undefined>(
  undefined
);

interface ErrorProviderProps {
  children: ReactNode;
  maxErrors?: number;
}

/**
 * Error provider component that manages application-wide error state
 *
 * @param children - Child components to wrap
 * @param maxErrors - Maximum number of errors to keep in queue (default: 5)
 *
 * @remarks
 * Features:
 * - Maintains a FIFO queue of recent errors
 * - Auto-dismisses INFO and WARNING errors after 5 seconds
 * - Processes raw errors through the error handler utility
 * - Keeps only the most recent errors to prevent memory issues
 *
 * Usage:
 * Wrap your app root with this provider to enable global error handling.
 * Access errors via the useError hook.
 */
export function ErrorProvider({children, maxErrors = 5}: ErrorProviderProps) {
  const [errors, setErrors] = useState<AppError[]>([]);

  const removeError = useCallback((errorId: string) => {
    setErrors((prevErrors) => prevErrors.filter((e) => e.id !== errorId));
  }, []);

  const addError = useCallback(
    (error: unknown, context?: string) => {
      const appError = handleErrorUtil(error, context);

      setErrors((prevErrors) => {
        // Add new error at the beginning for most-recent-first ordering
        const newErrors = [appError, ...prevErrors];

        // Keep only the most recent errors up to maxErrors to prevent unbounded growth
        return newErrors.slice(0, maxErrors);
      });

      // Auto-dismiss non-critical errors to avoid cluttering the UI
      if (
        appError.severity === ErrorSeverity.INFO ||
        appError.severity === ErrorSeverity.WARNING
      ) {
        setTimeout(() => {
          removeError(appError.id);
        }, 5000);
      }
    },
    [maxErrors, removeError]
  );

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const hasErrors = errors.length > 0;

  return (
    <ErrorContext.Provider
      value={{errors, addError, removeError, clearErrors, hasErrors}}
    >
      {children}
    </ErrorContext.Provider>
  );
}
