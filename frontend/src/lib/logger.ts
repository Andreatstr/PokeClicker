/**
 * Centralized Logging Service
 * Provides structured logging with different log levels
 * In production, this can be extended to send logs to external services
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogConfig {
  enabled: boolean;
  minLevel: LogLevel;
  includeTimestamp: boolean;
  includeContext: boolean;
}

// Numeric levels for minimum level filtering
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private config: LogConfig = {
    enabled: true,
    // Development shows debug logs, production only info and above
    minLevel: import.meta.env.DEV ? 'debug' : 'info',
    includeTimestamp: true,
    includeContext: true,
  };

  /**
   * Configure the logger
   * @param config - Partial configuration to merge with current config
   */
  configure(config: Partial<LogConfig>): void {
    this.config = {...this.config, ...config};
  }

  /**
   * Check if a log level should be logged based on minimum level
   * Uses numeric comparison (debug=0, info=1, warn=2, error=3)
   */
  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  /**
   * Format log message with metadata (timestamp, level, context)
   * Example output: "[2025-11-14T12:00:00.000Z] [INFO] [AuthService] User logged in"
   */
  private formatMessage(
    level: LogLevel,
    message: string,
    context?: string
  ): string {
    const parts: string[] = [];

    if (this.config.includeTimestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }

    parts.push(`[${level.toUpperCase()}]`);

    if (context && this.config.includeContext) {
      parts.push(`[${context}]`);
    }

    parts.push(message);

    return parts.join(' ');
  }

  /**
   * Log debug message
   * Use for detailed diagnostic information
   */
  debug(message: string, context?: string, ...args: unknown[]): void {
    if (!this.shouldLog('debug')) return;
    console.debug(this.formatMessage('debug', message, context), ...args);
  }

  /**
   * Log info message
   * Use for general informational messages
   */
  info(message: string, context?: string, ...args: unknown[]): void {
    if (!this.shouldLog('info')) return;
    console.info(this.formatMessage('info', message, context), ...args);
  }

  /**
   * Log warning message
   * Use for potentially harmful situations
   */
  warn(message: string, context?: string, ...args: unknown[]): void {
    if (!this.shouldLog('warn')) return;
    console.warn(this.formatMessage('warn', message, context), ...args);
  }

  /**
   * Log error message
   * Use for error events that might still allow the app to continue
   */
  error(message: string, context?: string, ...args: unknown[]): void {
    if (!this.shouldLog('error')) return;
    console.error(this.formatMessage('error', message, context), ...args);
  }

  /**
   * Log error object with full details including stack trace
   * Extracts message and stack from Error objects
   */
  logError(error: unknown, context?: string): void {
    if (!this.shouldLog('error')) return;

    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    console.error(
      this.formatMessage('error', errorMessage, context),
      '\n',
      stack || error
    );
  }

  /**
   * Disable logging (useful for tests)
   */
  disable(): void {
    this.config.enabled = false;
  }

  /**
   * Enable logging
   */
  enable(): void {
    this.config.enabled = true;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const {debug, info, warn, error, logError} = logger;
