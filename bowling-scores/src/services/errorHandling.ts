/**
 * Error Handling Service
 * Provides centralized error logging, reporting, and handling utilities
 */

import { ErrorInfo } from 'react';

export enum ErrorType {
  NETWORK = 'NETWORK',
  STORAGE = 'STORAGE',
  VALIDATION = 'VALIDATION',
  GAME_LOGIC = 'GAME_LOGIC',
  UI_RENDER = 'UI_RENDER',
  NAVIGATION = 'NAVIGATION',
  UNKNOWN = 'UNKNOWN',
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface AppError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  timestamp: string;
  context?: Record<string, any>;
  userMessage?: string;
}

export interface ErrorHandlerOptions {
  showToUser?: boolean;
  logToConsole?: boolean;
  reportToService?: boolean;
  userMessage?: string;
}

class ErrorHandlingService {
  private errors: AppError[] = [];
  private maxStoredErrors = 50;

  /**
   * Handle and log an error
   */
  handleError(
    error: Error | string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    options: ErrorHandlerOptions = {},
    context?: Record<string, any>
  ): AppError {
    const appError = this.createAppError(
      error,
      type,
      severity,
      context,
      options.userMessage
    );

    // Store the error
    this.storeError(appError);

    // Log to console (default: true)
    if (options.logToConsole !== false) {
      this.logToConsole(appError);
    }

    // Report to external service (if configured)
    if (options.reportToService) {
      this.reportToExternalService(appError);
    }

    return appError;
  }

  /**
   * Handle React component errors
   */
  handleReactError(
    error: Error,
    errorInfo: ErrorInfo,
    context?: Record<string, any>
  ): AppError {
    const appError = this.createAppError(
      error,
      ErrorType.UI_RENDER,
      ErrorSeverity.HIGH,
      {
        componentStack: errorInfo.componentStack,
        ...context,
      }
    );

    this.storeError(appError);
    this.logToConsole(appError);
    this.reportToExternalService(appError);

    return appError;
  }

  /**
   * Handle storage-related errors
   */
  handleStorageError(
    error: Error | string,
    operation: string,
    context?: Record<string, any>
  ): AppError {
    return this.handleError(
      error,
      ErrorType.STORAGE,
      ErrorSeverity.HIGH,
      {
        showToUser: true,
        userMessage: 'Failed to save or load data. Please try again.',
      },
      { operation, ...context }
    );
  }

  /**
   * Handle network-related errors
   */
  handleNetworkError(
    error: Error | string,
    url?: string,
    context?: Record<string, any>
  ): AppError {
    return this.handleError(
      error,
      ErrorType.NETWORK,
      ErrorSeverity.MEDIUM,
      {
        showToUser: true,
        userMessage:
          'Network connection issue. Please check your internet connection.',
      },
      { url, ...context }
    );
  }

  /**
   * Handle game logic errors
   */
  handleGameLogicError(
    error: Error | string,
    context?: Record<string, any>
  ): AppError {
    return this.handleError(
      error,
      ErrorType.GAME_LOGIC,
      ErrorSeverity.HIGH,
      {
        showToUser: true,
        userMessage: 'Game error occurred. Please restart the game.',
      },
      context
    );
  }

  /**
   * Handle validation errors
   */
  handleValidationError(
    error: Error | string,
    context?: Record<string, any>
  ): AppError {
    return this.handleError(
      error,
      ErrorType.VALIDATION,
      ErrorSeverity.LOW,
      {
        showToUser: true,
        logToConsole: false, // Don't clutter console with validation errors
      },
      context
    );
  }

  /**
   * Get all stored errors
   */
  getErrors(): AppError[] {
    return [...this.errors];
  }

  /**
   * Get errors by type
   */
  getErrorsByType(type: ErrorType): AppError[] {
    return this.errors.filter((error) => error.type === type);
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorSeverity): AppError[] {
    return this.errors.filter((error) => error.severity === severity);
  }

  /**
   * Clear all stored errors
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Clear errors older than specified time (in milliseconds)
   */
  clearOldErrors(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoffTime = new Date(Date.now() - maxAge).toISOString();
    this.errors = this.errors.filter((error) => error.timestamp > cutoffTime);
  }

  /**
   * Create an AppError object
   */
  private createAppError(
    error: Error | string,
    type: ErrorType,
    severity: ErrorSeverity,
    context?: Record<string, any>,
    userMessage?: string
  ): AppError {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const stack = typeof error === 'string' ? undefined : error.stack;

    return {
      id: this.generateErrorId(),
      type,
      severity,
      message: errorMessage,
      stack,
      timestamp: new Date().toISOString(),
      context,
      userMessage,
    };
  }

  /**
   * Store error in memory (limited buffer)
   */
  private storeError(error: AppError): void {
    this.errors.unshift(error);

    // Keep only the most recent errors
    if (this.errors.length > this.maxStoredErrors) {
      this.errors = this.errors.slice(0, this.maxStoredErrors);
    }
  }

  /**
   * Log error to console with formatting
   */
  private logToConsole(error: AppError): void {
    const prefix = `[${error.severity}] ${error.type}:`;

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        console.error(prefix, error.message);
        if (error.stack) console.error(error.stack);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn(prefix, error.message);
        break;
      case ErrorSeverity.LOW:
        console.log(prefix, error.message);
        break;
    }

    if (error.context) {
      console.log('Context:', error.context);
    }
  }

  /**
   * Report error to external service (e.g., Sentry, Bugsnag)
   */
  private reportToExternalService(error: AppError): void {
    // In a real app, this would send to your error reporting service
    // Example implementations:

    // Sentry:
    // Sentry.captureException(new Error(error.message), {
    //   tags: { type: error.type, severity: error.severity },
    //   extra: error.context,
    // });

    // Bugsnag:
    // Bugsnag.notify(new Error(error.message), event => {
    //   event.severity = error.severity.toLowerCase();
    //   event.addMetadata('context', error.context || {});
    // });

    // For now, just log that we would report this
    if (__DEV__) {
      console.log(`Would report to external service:`, error);
    }
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get human-readable error message for display
   */
  getUserFriendlyMessage(error: AppError): string {
    if (error.userMessage) {
      return error.userMessage;
    }

    // Default messages based on error type
    switch (error.type) {
      case ErrorType.NETWORK:
        return 'Network connection issue. Please check your internet connection and try again.';
      case ErrorType.STORAGE:
        return 'Failed to save or load data. Please restart the app and try again.';
      case ErrorType.VALIDATION:
        return 'Please check your input and try again.';
      case ErrorType.GAME_LOGIC:
        return 'Game error occurred. Please restart the game.';
      case ErrorType.UI_RENDER:
        return 'Display error occurred. Please refresh the screen.';
      case ErrorType.NAVIGATION:
        return 'Navigation error occurred. Please go back and try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Check if error should be shown to user
   */
  shouldShowToUser(error: AppError): boolean {
    // Don't show low severity errors by default
    if (error.severity === ErrorSeverity.LOW) {
      return false;
    }

    // Show errors with user messages
    return !!error.userMessage;
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandlingService();

// Export utility functions for common error patterns
export const handleAsyncError = async <T>(
  asyncOperation: () => Promise<T>,
  errorType: ErrorType = ErrorType.UNKNOWN,
  context?: Record<string, any>
): Promise<T | null> => {
  try {
    return await asyncOperation();
  } catch (error) {
    errorHandler.handleError(
      error as Error,
      errorType,
      ErrorSeverity.MEDIUM,
      { showToUser: true },
      context
    );
    return null;
  }
};

export const safeExecute = <T>(
  operation: () => T,
  errorType: ErrorType = ErrorType.UNKNOWN,
  context?: Record<string, any>
): T | null => {
  try {
    return operation();
  } catch (error) {
    errorHandler.handleError(
      error as Error,
      errorType,
      ErrorSeverity.MEDIUM,
      { showToUser: true },
      context
    );
    return null;
  }
};
