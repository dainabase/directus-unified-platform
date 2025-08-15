import * as React from 'react';
import { cn } from '../../lib/utils';
import { Toggle } from '../toggle';

export interface ToggleGroupProps {
  type?: 'single' | 'multiple';
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

const ToggleGroupContext = React.createContext<{
  type: 'single' | 'multiple';
  value: string | string[];
  onValueChange: (value: string) => void;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}>({
  type: 'single',
  value: '',
  onValueChange: () => {},
});

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  (
    {
      type = 'single',
      value: controlledValue,
      defaultValue = type === 'single' ? '' : [],
      onValueChange,
      disabled = false,
      children,
      className,
      variant = 'default',
      size = 'default',
      ...props
    },
    ref
  ) => {
    const [value, setValue] = React.useState(defaultValue);
    const currentValue = controlledValue !== undefined ? controlledValue : value;

    const handleValueChange = React.useCallback(
      (itemValue: string) => {
        let newValue: string | string[];
        
        if (type === 'single') {
          newValue = currentValue === itemValue ? '' : itemValue;
        } else {
          const currentArray = Array.isArray(currentValue) ? currentValue : [];
          if (currentArray.includes(itemValue)) {
            newValue = currentArray.filter(v => v !== itemValue);
          } else {
            newValue = [...currentArray, itemValue];
          }
        }

        if (controlledValue === undefined) {
          setValue(newValue);
        }
        onValueChange?.(newValue);
      },
      [type, currentValue, controlledValue, onValueChange]
    );

    return (
      <ToggleGroupContext.Provider
        value={{
          type,
          value: currentValue,
          onValueChange: handleValueChange,
          variant,
          size,
        }}
      >
        <div
          ref={ref}
          className={cn('flex items-center justify-center gap-1', className)}
          data-disabled={disabled ? '' : undefined}
          {...props}
        >
          {children}
        </div>
      </ToggleGroupContext.Provider>
    );
  }
);

ToggleGroup.displayName = 'ToggleGroup';

export interface ToggleGroupItemProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Toggle>, 'pressed' | 'onPressedChange'> {
  value: string;
}

const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({ value, variant, size, ...props }, ref) => {
    const context = React.useContext(ToggleGroupContext);
    
    const isPressed = context.type === 'single'
      ? context.value === value
      : Array.isArray(context.value) && context.value.includes(value);

    return (
      <Toggle
        ref={ref}
        variant={variant || context.variant}
        size={size || context.size}
        pressed={isPressed}
        onPressedChange={() => context.onValueChange(value)}
        {...props}
      />
    );
  }
);

ToggleGroupItem.displayName = 'ToggleGroupItem';

export { ToggleGroup, ToggleGroupItem };
export default ToggleGroup;
