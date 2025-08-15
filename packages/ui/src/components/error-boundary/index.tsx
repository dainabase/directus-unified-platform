import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

const DefaultErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="max-w-md">
        <h2 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h2>
        <p className="text-muted-foreground mb-4">
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left mb-4 p-4 bg-muted rounded-md">
            <summary className="cursor-pointer font-medium mb-2">Error details</summary>
            <pre className="text-xs overflow-auto whitespace-pre-wrap break-words">
              {error.name}: {error.message}
              {error.stack && (
                <>
                  {'\n\n'}Stack trace:{'\n'}
                  {error.stack}
                </>
              )}
            </pre>
          </details>
        )}
        <button
          onClick={resetErrorBoundary}
          className={cn(
            'inline-flex items-center justify-center rounded-md text-sm font-medium',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            'h-10 px-4 py-2 transition-colors'
          )}
        >
          Try again
        </button>
      </div>
    </div>
  );
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;
  private resetKeys: Array<string | number>;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
    this.resetKeys = props.resetKeys || [];
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError } = this.props;
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // Call custom error handler if provided
    onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;
    
    // Reset on prop changes if enabled
    if (hasError && prevProps.children !== this.props.children && resetOnPropsChange) {
      this.resetErrorBoundary();
    }
    
    // Reset on resetKeys change
    if (hasError && resetKeys && prevProps.resetKeys !== resetKeys) {
      const hasResetKeyChanged = resetKeys.some((key, index) => {
        return prevProps.resetKeys?.[index] !== key;
      });
      
      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId !== null) {
      window.clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    const { onReset } = this.props;
    
    onReset?.();
    
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback: Fallback = DefaultErrorFallback } = this.props;

    if (hasError && error) {
      return <Fallback error={error} resetErrorBoundary={this.resetErrorBoundary} />;
    }

    return children;
  }
}

// Hook for using error boundary programmatically
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
}

export default ErrorBoundary;
