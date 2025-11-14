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
 * Handles GraphQL errors, network errors, and generic Error objects
 * @param error - The error to extract message from (can be any type)
 * @returns A human-readable error message string
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
 * Uses keyword matching in error messages to determine error category
 * @param error - The error to classify
 * @returns An ErrorType classification
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

  if (errorMessage.includes('invalid') || errorMessage.includes('validation')) {
    return ErrorType.VALIDATION;
  }

  if (error && typeof error === 'object' && 'graphQLErrors' in error) {
    return ErrorType.GRAPHQL;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Determine error severity based on error type and content
 * Auth/permission errors are ERROR level, network is WARNING, validation/not-found is INFO
 * @param error - The error to evaluate
 * @returns The appropriate severity level for the error
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
 * Generates unique ID, extracts message, determines severity and classification
 * @param error - The raw error to wrap
 * @param context - Optional context string to prepend to user message
 * @returns A standardized AppError object
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
 * Routes to console.info/warn/error based on severity
 * In production, this would send to a logging service like Sentry
 * @param error - The AppError to log
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
 * Central error handling function that combines creation and logging
 * @param error - The error to handle
 * @param context - Optional context for error message
 * @returns The created AppError
 */
export function handleError(error: unknown, context?: string): AppError {
  const appError = createAppError(error, context);
  logError(appError);
  return appError;
}

/**
 * Error handler for async operations that re-throws as AppError
 * Returns a curried function suitable for .catch() chains
 * Usage: await someAsyncOperation().catch(handleAsyncError('context'))
 * @param context - Optional context for error message
 * @returns A function that handles the error and throws an AppError
 */
export function handleAsyncError(context?: string) {
  return (error: unknown): never => {
    const appError = handleError(error, context);
    throw appError;
  };
}
