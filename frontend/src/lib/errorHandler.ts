/**
 * Centralized Error Handling Utilities
 * Provides consistent error handling, logging, and user-friendly error messages
 */

// Error severity levels
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export const ErrorSeverity = {
  INFO: 'info' as ErrorSeverity,
  WARNING: 'warning' as ErrorSeverity,
  ERROR: 'error' as ErrorSeverity,
  CRITICAL: 'critical' as ErrorSeverity,
};

export interface AppError {
  id: string;
  message: string;
  severity: ErrorSeverity;
  timestamp: Date;
  code?: string;
  details?: unknown;
  userMessage: string;
}

// Error type classifications
export type ErrorType =
  | 'NETWORK_ERROR'
  | 'GRAPHQL_ERROR'
  | 'AUTH_ERROR'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'PERMISSION_ERROR'
  | 'UNKNOWN_ERROR';

export const ErrorType = {
  NETWORK: 'NETWORK_ERROR' as ErrorType,
  GRAPHQL: 'GRAPHQL_ERROR' as ErrorType,
  AUTH: 'AUTH_ERROR' as ErrorType,
  VALIDATION: 'VALIDATION_ERROR' as ErrorType,
  NOT_FOUND: 'NOT_FOUND' as ErrorType,
  PERMISSION: 'PERMISSION_ERROR' as ErrorType,
  UNKNOWN: 'UNKNOWN_ERROR' as ErrorType,
};

/**
 * Extract user-friendly error message from various error types
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    // GraphQL errors
    if ('graphQLErrors' in error) {
      const gqlError = error as {graphQLErrors: Array<{message: string}>};
      if (gqlError.graphQLErrors && gqlError.graphQLErrors.length > 0) {
        return gqlError.graphQLErrors[0].message;
      }
    }

    // Network errors
    if ('networkError' in error) {
      return 'Network error. Please check your connection and try again.';
    }

    // Standard Error
    return error.message;
  }

  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as {message: unknown}).message === 'string'
  ) {
    return (error as {message: string}).message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Classify error type based on error content
 */
export function classifyError(error: unknown): ErrorType {
  if (!error) return ErrorType.UNKNOWN;

  const errorMessage = getUserFriendlyMessage(error).toLowerCase();

  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return ErrorType.NETWORK;
  }

  if (
    errorMessage.includes('auth') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('token')
  ) {
    return ErrorType.AUTH;
  }

  if (
    errorMessage.includes('not found') ||
    errorMessage.includes('does not exist')
  ) {
    return ErrorType.NOT_FOUND;
  }

  if (
    errorMessage.includes('permission') ||
    errorMessage.includes('forbidden')
  ) {
    return ErrorType.PERMISSION;
  }

  if (
    errorMessage.includes('invalid') ||
    errorMessage.includes('validation')
  ) {
    return ErrorType.VALIDATION;
  }

  if (error && typeof error === 'object' && 'graphQLErrors' in error) {
    return ErrorType.GRAPHQL;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Determine error severity based on error type and content
 */
export function determineErrorSeverity(error: unknown): ErrorSeverity {
  const errorType = classifyError(error);

  switch (errorType) {
    case ErrorType.AUTH:
    case ErrorType.PERMISSION:
      return ErrorSeverity.ERROR;

    case ErrorType.NETWORK:
      return ErrorSeverity.WARNING;

    case ErrorType.VALIDATION:
    case ErrorType.NOT_FOUND:
      return ErrorSeverity.INFO;

    case ErrorType.GRAPHQL:
    case ErrorType.UNKNOWN:
    default:
      return ErrorSeverity.ERROR;
  }
}

/**
 * Create a standardized AppError from any error type
 */
export function createAppError(error: unknown, context?: string): AppError {
  const userMessage = getUserFriendlyMessage(error);
  const severity = determineErrorSeverity(error);
  const errorType = classifyError(error);

  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    message: userMessage,
    severity,
    timestamp: new Date(),
    code: errorType,
    details: error,
    userMessage: context ? `${context}: ${userMessage}` : userMessage,
  };
}

/**
 * Log error to console with appropriate level
 * In production, this would send to a logging service
 */
export function logError(error: AppError): void {
  const logMessage = `[${error.severity.toUpperCase()}] ${error.code || 'ERROR'} - ${error.message}`;

  switch (error.severity) {
    case ErrorSeverity.INFO:
      console.info(logMessage, error.details);
      break;
    case ErrorSeverity.WARNING:
      console.warn(logMessage, error.details);
      break;
    case ErrorSeverity.ERROR:
    case ErrorSeverity.CRITICAL:
      console.error(logMessage, error.details);
      break;
    default:
      console.log(logMessage, error.details);
  }
}

/**
 * Main error handler - creates AppError, logs it, and returns it
 */
export function handleError(error: unknown, context?: string): AppError {
  const appError = createAppError(error, context);
  logError(appError);
  return appError;
}

/**
 * Error handler for async operations
 * Usage: await someAsyncOperation().catch(handleAsyncError('context'))
 */
export function handleAsyncError(context?: string) {
  return (error: unknown): never => {
    const appError = handleError(error, context);
    throw appError;
  };
}
