import * as React from 'react';
import { cn } from '../../lib/utils';

export interface HoverCardProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openDelay?: number;
  closeDelay?: number;
}

export interface HoverCardTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  asChild?: boolean;
}

export interface HoverCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  alignOffset?: number;
  children: React.ReactNode;
  forceMount?: boolean;
}

const HoverCardContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLDivElement>;
}>({
  open: false,
  onOpenChange: () => {},
  triggerRef: React.createRef(),
});

export const HoverCardTrigger = React.forwardRef<HTMLDivElement, HoverCardTriggerProps>(
  ({ className, children, asChild = false, ...props }, ref) => {
    const { onOpenChange, triggerRef } = React.useContext(HoverCardContext);
    const hoverTimeoutRef = React.useRef<number>();
    
    const handleMouseEnter = () => {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = window.setTimeout(() => {
        onOpenChange(true);
      }, 200); // Default open delay
    };
    
    const handleMouseLeave = () => {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = window.setTimeout(() => {
        onOpenChange(false);
      }, 100); // Default close delay
    };

    React.useEffect(() => {
      return () => {
        clearTimeout(hoverTimeoutRef.current);
      };
    }, []);

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        ref: triggerRef,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onFocus: () => onOpenChange(true),
        onBlur: () => onOpenChange(false),
      });
    }

    return (
      <div
        ref={triggerRef}
        className={cn('inline-block', className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={() => onOpenChange(true)}
        onBlur={() => onOpenChange(false)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
HoverCardTrigger.displayName = 'HoverCardTrigger';

export const HoverCardContent = React.forwardRef<HTMLDivElement, HoverCardContentProps>(
  ({ 
    className, 
    align = 'center', 
    side = 'bottom', 
    sideOffset = 4,
    alignOffset = 0,
    children,
    forceMount = false,
    ...props 
  }, ref) => {
    const { open, onOpenChange, triggerRef } = React.useContext(HoverCardContext);
    const [position, setPosition] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const contentRef = React.useRef<HTMLDivElement>(null);
    const hoverTimeoutRef = React.useRef<number>();

    React.useEffect(() => {
      if (open && triggerRef.current && contentRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();
        
        let top = 0;
        let left = 0;

        // Calculate position based on side
        switch (side) {
          case 'top':
            top = triggerRect.top - contentRect.height - sideOffset;
            left = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
            break;
          case 'bottom':
            top = triggerRect.bottom + sideOffset;
            left = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
            break;
          case 'left':
            top = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
            left = triggerRect.left - contentRect.width - sideOffset;
            break;
          case 'right':
            top = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
            left = triggerRect.right + sideOffset;
            break;
        }

        // Apply alignment offset
        if (side === 'top' || side === 'bottom') {
          if (align === 'start') {
            left = triggerRect.left + alignOffset;
          } else if (align === 'end') {
            left = triggerRect.right - contentRect.width - alignOffset;
          }
        } else {
          if (align === 'start') {
            top = triggerRect.top + alignOffset;
          } else if (align === 'end') {
            top = triggerRect.bottom - contentRect.height - alignOffset;
          }
        }

        // Ensure the card stays within viewport
        const padding = 8;
        top = Math.max(padding, Math.min(top, window.innerHeight - contentRect.height - padding));
        left = Math.max(padding, Math.min(left, window.innerWidth - contentRect.width - padding));

        setPosition({ top, left });
      }
    }, [open, side, align, sideOffset, alignOffset, triggerRef]);

    const handleMouseEnter = () => {
      clearTimeout(hoverTimeoutRef.current);
    };

    const handleMouseLeave = () => {
      hoverTimeoutRef.current = window.setTimeout(() => {
        onOpenChange(false);
      }, 100);
    };

    React.useEffect(() => {
      return () => {
        clearTimeout(hoverTimeoutRef.current);
      };
    }, []);

    if (!open && !forceMount) return null;

    return (
      <div
        ref={contentRef}
        className={cn(
          'z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none',
          open ? 'animate-in fade-in-0 zoom-in-95' : 'animate-out fade-out-0 zoom-out-95',
          className
        )}
        style={{
          position: 'fixed',
          top: `${position.top}px`,
          left: `${position.left}px`,
          visibility: open ? 'visible' : 'hidden',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </div>
    );
  }
);
HoverCardContent.displayName = 'HoverCardContent';

export const HoverCard: React.FC<HoverCardProps> = ({ 
  children, 
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  openDelay = 200,
  closeDelay = 100,
}) => {
  const [open, setOpen] = React.useState(openProp ?? defaultOpen);
  const triggerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (openProp !== undefined) {
      setOpen(openProp);
    }
  }, [openProp]);

  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    if (openProp === undefined) {
      setOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [openProp, onOpenChange]);

  return (
    <HoverCardContext.Provider value={{ open, onOpenChange: handleOpenChange, triggerRef }}>
      {children}
    </HoverCardContext.Provider>
  );
};

export default HoverCard;
