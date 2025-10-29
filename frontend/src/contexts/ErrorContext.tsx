/* eslint-disable react-refresh/only-export-components */
import {createContext, useState, useCallback, type ReactNode} from 'react';
import {
  type AppError,
  handleError as handleErrorUtil,
  ErrorSeverity,
} from '@/lib/errorHandler';

interface ErrorContextValue {
  errors: AppError[];
  addError: (error: unknown, context?: string) => void;
  removeError: (errorId: string) => void;
  clearErrors: () => void;
  hasErrors: boolean;
}

// ErrorContext - Export for use in hooks only
// Use the useError hook from @/hooks/useError instead of consuming directly
export const ErrorContext = createContext<ErrorContextValue | undefined>(
  undefined
);

interface ErrorProviderProps {
  children: ReactNode;
  maxErrors?: number;
}

// ErrorProvider - Wrap your app with this to provide error handling
export function ErrorProvider({
  children,
  maxErrors = 5,
}: ErrorProviderProps) {
  const [errors, setErrors] = useState<AppError[]>([]);

  const removeError = useCallback((errorId: string) => {
    setErrors((prevErrors) => prevErrors.filter((e) => e.id !== errorId));
  }, []);

  const addError = useCallback(
    (error: unknown, context?: string) => {
      const appError = handleErrorUtil(error, context);

      setErrors((prevErrors) => {
        // Add new error at the beginning
        const newErrors = [appError, ...prevErrors];

        // Keep only the most recent errors up to maxErrors
        return newErrors.slice(0, maxErrors);
      });

      // Auto-dismiss non-critical errors after a delay
      if (
        appError.severity === ErrorSeverity.INFO ||
        appError.severity === ErrorSeverity.WARNING
      ) {
        setTimeout(() => {
          removeError(appError.id);
        }, 5000); // 5 seconds for info/warning
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

