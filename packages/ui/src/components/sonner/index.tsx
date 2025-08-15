import * as React from 'react';
import { cn } from '../../lib/utils';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  duration?: number;
  type?: 'default' | 'success' | 'error' | 'warning' | 'info';
}

interface SonnerContextValue {
  toasts: Toast[];
  toast: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

const SonnerContext = React.createContext<SonnerContextValue | undefined>(undefined);

export interface SonnerProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  expand?: boolean;
  richColors?: boolean;
  closeButton?: boolean;
  duration?: number;
}

export const Toaster = React.forwardRef<HTMLDivElement, SonnerProps>(
  ({ 
    className, 
    position = 'bottom-right',
    expand = false,
    richColors = true,
    closeButton = true,
    duration = 4000,
    ...props 
  }, ref) => {
    const [toasts, setToasts] = React.useState<Toast[]>([]);

    const toast = React.useCallback((newToast: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substr(2, 9);
      const toastWithId = { ...newToast, id, duration: newToast.duration || duration };
      
      setToasts((prev) => [...prev, toastWithId]);

      if (toastWithId.duration && toastWithId.duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, toastWithId.duration);
      }
    }, [duration]);

    const dismiss = React.useCallback((id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const contextValue = React.useMemo(
      () => ({ toasts, toast, dismiss }),
      [toasts, toast, dismiss]
    );

    const positionClasses = {
      'top-left': 'top-0 left-0',
      'top-center': 'top-0 left-1/2 -translate-x-1/2',
      'top-right': 'top-0 right-0',
      'bottom-left': 'bottom-0 left-0',
      'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
      'bottom-right': 'bottom-0 right-0',
    };

    return (
      <SonnerContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(
            'fixed z-[100] flex max-h-screen flex-col gap-2 p-4 sm:p-6',
            positionClasses[position],
            className
          )}
          {...props}
        >
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onDismiss={() => dismiss(toast.id)}
              richColors={richColors}
              closeButton={closeButton}
            />
          ))}
        </div>
      </SonnerContext.Provider>
    );
  }
);

Toaster.displayName = 'Toaster';

interface ToastItemProps {
  toast: Toast;
  onDismiss: () => void;
  richColors?: boolean;
  closeButton?: boolean;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss, richColors, closeButton }) => {
  const typeClasses = richColors ? {
    default: 'bg-background border',
    success: 'bg-green-50 border-green-200 text-green-900 dark:bg-green-900 dark:border-green-800 dark:text-green-100',
    error: 'bg-red-50 border-red-200 text-red-900 dark:bg-red-900 dark:border-red-800 dark:text-red-100',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:border-yellow-800 dark:text-yellow-100',
    info: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900 dark:border-blue-800 dark:text-blue-100',
  } : {
    default: 'bg-background border',
    success: 'bg-background border',
    error: 'bg-background border',
    warning: 'bg-background border',
    info: 'bg-background border',
  };

  return (
    <div
      className={cn(
        'pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md p-6 pr-8 shadow-lg transition-all',
        typeClasses[toast.type || 'default']
      )}
    >
      <div className="flex-1">
        {toast.title && (
          <div className="text-sm font-semibold">{toast.title}</div>
        )}
        {toast.description && (
          <div className="text-sm opacity-90">{toast.description}</div>
        )}
      </div>
      {toast.action}
      {closeButton && (
        <button
          onClick={onDismiss}
          className="absolute right-2 top-2 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export const useSonner = () => {
  const context = React.useContext(SonnerContext);
  if (!context) {
    throw new Error('useSonner must be used within a Toaster');
  }
  return context;
};

// Export a standalone toast function for convenience
export const toast = {
  success: (message: string, options?: Omit<Toast, 'id' | 'type'>) => console.log('Success:', message, options),
  error: (message: string, options?: Omit<Toast, 'id' | 'type'>) => console.log('Error:', message, options),
  warning: (message: string, options?: Omit<Toast, 'id' | 'type'>) => console.log('Warning:', message, options),
  info: (message: string, options?: Omit<Toast, 'id' | 'type'>) => console.log('Info:', message, options),
  message: (message: string, options?: Omit<Toast, 'id' | 'type'>) => console.log('Message:', message, options),
};

export const Sonner = Toaster;
export default Sonner;
