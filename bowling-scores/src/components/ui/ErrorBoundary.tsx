/**
 * ErrorBoundary component
 * Catches JavaScript errors anywhere in the child component tree and displays a fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { Button } from './Button';
import { Card } from './Card';
import { Icon } from './Icon';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Call the optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to log this to an error reporting service
    // Example: Sentry.captureException(error);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { hasError } = this.state;
    const { resetOnPropsChange } = this.props;

    // Reset error boundary when props change (if enabled)
    if (
      hasError &&
      resetOnPropsChange &&
      prevProps.children !== this.props.children
    ) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // If a custom fallback is provided, use it
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <Card style={styles.errorCard}>
            <View style={styles.iconContainer}>
              <Icon name='alert-circle' size='large' color='#ff6b6b' />
            </View>

            <Typography variant='h2' style={styles.title}>
              Something went wrong
            </Typography>

            <Typography variant='body1' style={styles.message}>
              We're sorry, but something unexpected happened. The app
              encountered an error and couldn't continue.
            </Typography>

            {__DEV__ && error && (
              <View style={styles.debugContainer}>
                <Typography variant='h3' style={styles.debugTitle}>
                  Debug Information:
                </Typography>
                <Typography variant='caption' style={styles.debugText}>
                  {error.name}: {error.message}
                </Typography>
                {errorInfo && (
                  <Typography variant='caption' style={styles.debugText}>
                    {errorInfo.componentStack}
                  </Typography>
                )}
              </View>
            )}

            <View style={styles.buttonContainer}>
              <Button
                variant='primary'
                onPress={this.handleRetry}
                style={styles.retryButton}>
                Try Again
              </Button>
            </View>
          </Card>
        </View>
      );
    }

    return children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorCard: {
    padding: 24,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
    lineHeight: 20,
  },
  debugContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  debugTitle: {
    marginBottom: 8,
    color: '#333',
  },
  debugText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  buttonContainer: {
    width: '100%',
  },
  retryButton: {
    marginTop: 8,
  },
});

export default ErrorBoundary;
