import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      pressed: controlledPressed,
      defaultPressed = false,
      onPressedChange,
      children,
      ...props
    },
    ref
  ) => {
    const [pressed, setPressed] = React.useState(defaultPressed);
    const isPressed = controlledPressed !== undefined ? controlledPressed : pressed;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      const newPressed = !isPressed;
      if (controlledPressed === undefined) {
        setPressed(newPressed);
      }
      onPressedChange?.(newPressed);
      props.onClick?.(event);
    };

    const sizeStyles = {
      default: 'h-10 px-3',
      sm: 'h-9 px-2.5',
      lg: 'h-11 px-5',
    };

    const variantStyles = {
      default: cn(
        'bg-transparent hover:bg-muted hover:text-muted-foreground',
        isPressed && 'bg-accent text-accent-foreground'
      ),
      outline: cn(
        'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
        isPressed && 'bg-accent text-accent-foreground'
      ),
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={isPressed}
        data-state={isPressed ? 'on' : 'off'}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Toggle.displayName = 'Toggle';

export { Toggle };
export default Toggle;
