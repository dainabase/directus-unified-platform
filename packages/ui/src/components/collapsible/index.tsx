import * as React from 'react';
import { cn } from '../../lib/utils';

export interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export interface CollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  asChild?: boolean;
}

export interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  forceMount?: boolean;
}

const CollapsibleContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
}>({
  open: false,
  onOpenChange: () => {},
});

export const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ className, children, onClick, disabled, ...props }, ref) => {
    const { open, onOpenChange, disabled: contextDisabled } = React.useContext(CollapsibleContext);
    const isDisabled = disabled || contextDisabled;

    return (
      <button
        ref={ref}
        type="button"
        aria-expanded={open}
        aria-controls="collapsible-content"
        disabled={isDisabled}
        onClick={(e) => {
          onClick?.(e);
          if (!isDisabled) {
            onOpenChange(!open);
          }
        }}
        className={cn(
          'flex items-center justify-between w-full',
          isDisabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
CollapsibleTrigger.displayName = 'CollapsibleTrigger';

export const CollapsibleContent = React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ className, children, style, ...props }, ref) => {
    const { open } = React.useContext(CollapsibleContext);

    return (
      <div
        ref={ref}
        id="collapsible-content"
        role="region"
        data-state={open ? 'open' : 'closed'}
        hidden={!open}
        className={cn(
          'overflow-hidden transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          className
        )}
        style={{
          ...style,
          ...(open ? {} : { height: 0 })
        }}
        {...props}
      >
        {open && children}
      </div>
    );
  }
);
CollapsibleContent.displayName = 'CollapsibleContent';

export const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ className, open: openProp = false, onOpenChange, disabled = false, children, ...props }, ref) => {
    const [open, setOpen] = React.useState(openProp);

    React.useEffect(() => {
      setOpen(openProp);
    }, [openProp]);

    const handleOpenChange = React.useCallback((newOpen: boolean) => {
      setOpen(newOpen);
      onOpenChange?.(newOpen);
    }, [onOpenChange]);

    return (
      <CollapsibleContext.Provider value={{ open, onOpenChange: handleOpenChange, disabled }}>
        <div
          ref={ref}
          data-state={open ? 'open' : 'closed'}
          className={cn('', className)}
          {...props}
        >
          {children}
        </div>
      </CollapsibleContext.Provider>
    );
  }
);
Collapsible.displayName = 'Collapsible';

export default Collapsible;
