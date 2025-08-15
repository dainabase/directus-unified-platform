import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ContextMenuProps {
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export interface ContextMenuTriggerProps {
  children: React.ReactNode;
  disabled?: boolean;
  asChild?: boolean;
}

export interface ContextMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  alignOffset?: number;
  children: React.ReactNode;
}

export interface ContextMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
  destructive?: boolean;
  children: React.ReactNode;
  onSelect?: () => void;
}

export interface ContextMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface ContextMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const ContextMenuContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  position: { x: number; y: number } | null;
  setPosition: (pos: { x: number; y: number } | null) => void;
}>({
  open: false,
  setOpen: () => {},
  position: null,
  setPosition: () => {},
});

export const ContextMenuTrigger = React.forwardRef<HTMLDivElement, ContextMenuTriggerProps>(
  ({ children, disabled = false, asChild = false }, ref) => {
    const { setOpen, setPosition } = React.useContext(ContextMenuContext);

    const handleContextMenu = (e: React.MouseEvent) => {
      if (disabled) return;
      
      e.preventDefault();
      setPosition({ x: e.clientX, y: e.clientY });
      setOpen(true);
    };

    const Component = asChild ? React.Fragment : 'div';
    const props = asChild ? {} : { ref, onContextMenu: handleContextMenu };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        onContextMenu: handleContextMenu,
      });
    }

    return <Component {...props}>{children}</Component>;
  }
);
ContextMenuTrigger.displayName = 'ContextMenuTrigger';

export const ContextMenuContent = React.forwardRef<HTMLDivElement, ContextMenuContentProps>(
  ({ 
    className, 
    align = 'start', 
    side = 'bottom', 
    sideOffset = 4,
    alignOffset = 0,
    children,
    ...props 
  }, ref) => {
    const { open, setOpen, position } = React.useContext(ContextMenuContext);
    const menuRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setOpen(false);
        }
      };

      if (open) {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }, [open, setOpen]);

    if (!open || !position) return null;

    return (
      <div
        ref={menuRef}
        className={cn(
          'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
          'animate-in fade-in-80 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className
        )}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ContextMenuContent.displayName = 'ContextMenuContent';

export const ContextMenuItem = React.forwardRef<HTMLDivElement, ContextMenuItemProps>(
  ({ className, disabled = false, destructive = false, children, onSelect, onClick, ...props }, ref) => {
    const { setOpen } = React.useContext(ContextMenuContext);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      
      onClick?.(e);
      onSelect?.();
      setOpen(false);
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
          !disabled && 'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
          disabled && 'pointer-events-none opacity-50',
          destructive && !disabled && 'text-destructive hover:bg-destructive/10 focus:bg-destructive/10',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ContextMenuItem.displayName = 'ContextMenuItem';

export const ContextMenuSeparator = React.forwardRef<HTMLDivElement, ContextMenuSeparatorProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('h-px my-1 bg-muted', className)}
        {...props}
      />
    );
  }
);
ContextMenuSeparator.displayName = 'ContextMenuSeparator';

export const ContextMenuLabel = React.forwardRef<HTMLDivElement, ContextMenuLabelProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'px-2 py-1.5 text-xs font-semibold text-muted-foreground',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ContextMenuLabel.displayName = 'ContextMenuLabel';

export const ContextMenu: React.FC<ContextMenuProps> = ({ children, onOpenChange }) => {
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState<{ x: number; y: number } | null>(null);

  const handleSetOpen = React.useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
    if (!newOpen) {
      setPosition(null);
    }
  }, [onOpenChange]);

  return (
    <ContextMenuContext.Provider value={{ open, setOpen: handleSetOpen, position, setPosition }}>
      {children}
    </ContextMenuContext.Provider>
  );
};

export default ContextMenu;
