import * as React from 'react';
import { cn } from '../../lib/utils';

export interface MenubarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const Menubar = React.forwardRef<HTMLDivElement, MenubarProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="menubar"
        className={cn(
          'flex h-10 items-center space-x-1 rounded-md border bg-background p-1',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Menubar.displayName = 'Menubar';

export const MenubarMenu = ({ children }: { children: React.ReactNode }) => (
  <div className="relative">{children}</div>
);

export const MenubarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
      className
    )}
    {...props}
  >
    {children}
  </button>
));

MenubarTrigger.displayName = 'MenubarTrigger';

export const MenubarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
      className
    )}
    {...props}
  >
    {children}
  </div>
));

MenubarContent.displayName = 'MenubarContent';

export const MenubarItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    {children}
  </div>
));

MenubarItem.displayName = 'MenubarItem';

export const MenubarSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
));

MenubarSeparator.displayName = 'MenubarSeparator';

export default Menubar;
