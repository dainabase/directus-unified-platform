---
id: error-boundary
title: Error Boundary
sidebar_position: 54
---

import { ErrorBoundary } from '@dainabase/ui';

A robust error boundary component that gracefully catches and handles React component errors, preventing complete application crashes while providing fallback UI and error recovery options.

## Preview

```jsx live
function ErrorBoundaryDemo() {
  const [shouldError, setShouldError] = useState(false);
  
  const ThrowError = () => {
    if (shouldError) {
      throw new Error('This is a simulated error!');
    }
    return <div>Component is working normally</div>;
  };
  
  return (
    <div className="space-y-4">
      <ErrorBoundary
        fallback={<div className="p-4 bg-red-50 text-red-900 rounded">An error occurred!</div>}
        onError={(error, errorInfo) => console.log('Error caught:', error)}
        onReset={() => setShouldError(false)}
      >
        <ThrowError />
      </ErrorBoundary>
      
      <button 
        onClick={() => setShouldError(!shouldError)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {shouldError ? 'Fix Component' : 'Trigger Error'}
      </button>
    </div>
  );
}
```

## Features

- 🛡️ **Error Isolation**: Prevents errors from crashing the entire application
- 🔄 **Error Recovery**: Built-in reset functionality to recover from errors
- 🎨 **Custom Fallback UI**: Fully customizable error display
- 📊 **Error Reporting**: Integration with error tracking services
- 🔍 **Development Mode**: Enhanced error details in development
- 📱 **Responsive Design**: Mobile-friendly error displays
- ♿ **Accessible**: WCAG 2.1 compliant error messages
- 🌐 **i18n Support**: Localized error messages
- 📝 **Error Logging**: Comprehensive error logging capabilities
- 🎯 **Boundary Levels**: Nested error boundaries for granular control

## Installation

```bash
npm install @dainabase/ui
```

## Basic Usage

```jsx
import { ErrorBoundary } from '@dainabase/ui';

function App() {
  return (
    <ErrorBoundary
      fallback={<ErrorFallback />}
      onError={(error, errorInfo) => {
        // Log to error reporting service
        console.error('Error caught:', error, errorInfo);
      }}
    >
      <YourApplication />
    </ErrorBoundary>
  );
}
```

## Examples

### Default Error Boundary

```jsx
<ErrorBoundary>
  <ComponentThatMightError />
</ErrorBoundary>
```

### Custom Fallback Component

```jsx
const CustomErrorFallback = ({ error, resetError }) => (
  <div className="error-container">
    <h2>Oops! Something went wrong</h2>
    <details style={{ whiteSpace: 'pre-wrap' }}>
      {error && error.toString()}
    </details>
    <button onClick={resetError}>Try again</button>
  </div>
);

<ErrorBoundary fallback={CustomErrorFallback}>
  <RiskyComponent />
</ErrorBoundary>
```

### With Error Reporting

```jsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Send to Sentry, LogRocket, etc.
    errorReportingService.log({
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
  }}
>
  <Application />
</ErrorBoundary>
```

### Nested Error Boundaries

```jsx
<ErrorBoundary fallback={<AppErrorFallback />}>
  <Header />
  
  <ErrorBoundary fallback={<SidebarErrorFallback />}>
    <Sidebar />
  </ErrorBoundary>
  
  <ErrorBoundary fallback={<ContentErrorFallback />}>
    <MainContent />
  </ErrorBoundary>
  
  <Footer />
</ErrorBoundary>
```

### With Retry Logic

```jsx
function RetryableErrorBoundary({ children, maxRetries = 3 }) {
  const [retryCount, setRetryCount] = useState(0);
  
  return (
    <ErrorBoundary
      fallback={({ resetError }) => (
        <div className="error-retry">
          <p>Failed to load. Retry {retryCount}/{maxRetries}</p>
          <button 
            onClick={() => {
              setRetryCount(prev => prev + 1);
              resetError();
            }}
            disabled={retryCount >= maxRetries}
          >
            Retry
          </button>
        </div>
      )}
      onReset={() => setRetryCount(0)}
    >
      {children}
    </ErrorBoundary>
  );
}
```

### Development vs Production

```jsx
const ErrorFallback = ({ error, resetError }) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return (
    <div className="error-boundary-fallback">
      <h1>Application Error</h1>
      
      {isDevelopment ? (
        <>
          <pre className="error-stack">{error.stack}</pre>
          <button onClick={resetError}>Reset</button>
        </>
      ) : (
        <>
          <p>We're sorry, but something went wrong.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </>
      )}
    </div>
  );
};
```

### With Error Context

```jsx
const ErrorContext = React.createContext();

function ErrorProvider({ children }) {
  const [errors, setErrors] = useState([]);
  
  const logError = (error, context) => {
    setErrors(prev => [...prev, { error, context, timestamp: Date.now() }]);
  };
  
  return (
    <ErrorContext.Provider value={{ errors, logError }}>
      <ErrorBoundary
        onError={(error, errorInfo) => {
          logError(error, errorInfo);
        }}
      >
        {children}
      </ErrorBoundary>
    </ErrorContext.Provider>
  );
}
```

### Async Error Boundary

```jsx
function AsyncErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      setHasError(true);
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
  
  if (hasError) {
    return <div>An async error occurred</div>;
  }
  
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}
```

### Form Error Boundary

```jsx
function FormErrorBoundary({ children, onFormError }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="form-error">
          <Alert variant="error">
            <AlertTitle>Form Error</AlertTitle>
            <AlertDescription>
              The form encountered an error. Please check your inputs and try again.
            </AlertDescription>
          </Alert>
          <button onClick={resetError} className="mt-4">
            Reset Form
          </button>
        </div>
      )}
      onError={(error) => {
        onFormError?.(error);
        // Log form-specific error details
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

### With Fallback Loading State

```jsx
function SuspenseErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="error-with-loading">
          <Spinner />
          <p>Attempting to recover...</p>
          {setTimeout(() => resetError(), 3000)}
        </div>
      )}
    >
      <Suspense fallback={<Spinner />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}
```

## API Reference

### ErrorBoundary Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | Required | Components to wrap |
| `fallback` | `Component \| ReactNode` | Error message | Fallback UI to display |
| `onError` | `(error, errorInfo) => void` | - | Error handler callback |
| `onReset` | `() => void` | - | Reset handler callback |
| `resetKeys` | `string[]` | `[]` | Dependencies to trigger reset |
| `resetOnPropsChange` | `boolean` | `false` | Reset on prop changes |
| `isolate` | `boolean` | `true` | Isolate errors to boundary |
| `level` | `'app' \| 'page' \| 'component'` | `'component'` | Boundary level |
| `fallbackRender` | `Function` | - | Custom fallback renderer |
| `onResetKeysChange` | `Function` | - | Keys change handler |
| `enableLogging` | `boolean` | `true` | Enable error logging |

### Fallback Component Props

| Prop | Type | Description |
|------|------|-------------|
| `error` | `Error` | The caught error object |
| `resetError` | `() => void` | Function to reset the error boundary |
| `errorInfo` | `ErrorInfo` | React error information |

### Error Methods

```typescript
interface ErrorBoundaryContext {
  hasError: boolean;
  error: Error | null;
  resetError: () => void;
  errorInfo: ErrorInfo | null;
}
```

## Accessibility

The Error Boundary component follows WCAG 2.1 Level AA guidelines:

- **Error Identification**: Clear error messages with proper ARIA labels
- **Error Suggestion**: Provides recovery suggestions when possible
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Reader Support**: Proper ARIA live regions for error announcements
- **Focus Management**: Automatically focuses error messages
- **Color Contrast**: Error messages meet WCAG contrast requirements

```jsx
// Accessible error boundary
<ErrorBoundary
  fallback={({ error, resetError }) => (
    <div 
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className="error-boundary"
    >
      <h2 id="error-title">Error Occurred</h2>
      <p aria-describedby="error-title">
        {error.message}
      </p>
      <button 
        onClick={resetError}
        aria-label="Reset application and try again"
      >
        Try Again
      </button>
    </div>
  )}
>
  {children}
</ErrorBoundary>
```

## Best Practices

### Do's ✅

- Use multiple error boundaries for different app sections
- Provide meaningful error messages to users
- Log errors to monitoring services
- Include reset functionality
- Test error boundaries thoroughly
- Use appropriate boundary levels
- Provide fallback UI that matches your design
- Clear error state on successful recovery
- Document expected errors
- Consider user experience in error states

### Don'ts ❌

- Don't catch errors in event handlers (use try-catch instead)
- Don't use error boundaries for expected errors
- Don't expose sensitive information in production
- Don't ignore error logging
- Don't use a single boundary for the entire app
- Don't forget to test error scenarios
- Don't show technical details to end users
- Don't auto-retry without user consent
- Don't forget mobile error experiences
- Don't neglect accessibility in error states

## Use Cases

1. **Application Shell Protection**: Protect main app layout from crashes
2. **Feature Isolation**: Isolate experimental features
3. **Third-party Integration**: Wrap unreliable third-party components
4. **Data Visualization**: Protect complex charts/graphs
5. **Form Protection**: Prevent form errors from affecting page
6. **Route Protection**: Wrap route components
7. **Widget Isolation**: Isolate dashboard widgets
8. **Plugin System**: Protect against plugin errors
9. **Dynamic Imports**: Handle lazy loading failures
10. **API Error Handling**: Graceful degradation for API failures

## Troubleshooting

Common issues and solutions:

```jsx
// Issue: Error boundary not catching errors
// Solution: Ensure errors are thrown during render, not in event handlers

// ❌ Won't be caught
<button onClick={() => {
  throw new Error('Click error');
}}>

// ✅ Will be caught
function Component() {
  if (condition) {
    throw new Error('Render error');
  }
  return <div>Content</div>;
}

// Issue: Infinite error loops
// Solution: Implement proper reset logic
<ErrorBoundary
  resetKeys={[userId]} // Reset when userId changes
  onReset={() => {
    // Clear error state
    clearErrorState();
  }}
>
```

## Related Components

- [Alert](./alert) - For error notifications
- [Dialog](./dialog) - For error modals
- [Toast](./toast) - For temporary error messages
- [Spinner](./spinner) - For loading states
- [Button](./button) - For retry actions