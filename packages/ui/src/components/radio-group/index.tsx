import * as React from 'react';
import { cn } from '../../lib/utils';

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

const RadioGroupContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
  required?: boolean;
}>({});

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ 
    className, 
    value, 
    defaultValue, 
    onValueChange, 
    disabled, 
    name,
    required,
    orientation = 'vertical',
    children,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const actualValue = value !== undefined ? value : internalValue;

    const handleValueChange = (newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    };

    return (
      <RadioGroupContext.Provider
        value={{
          value: actualValue,
          onValueChange: handleValueChange,
          disabled,
          name,
          required
        }}
      >
        <div
          ref={ref}
          role="radiogroup"
          aria-orientation={orientation}
          className={cn(
            'grid gap-2',
            orientation === 'horizontal' && 'grid-flow-col',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

export interface RadioGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  id?: string;
}

export const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ className, value, id, disabled: itemDisabled, children, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext);
    const isDisabled = itemDisabled || context.disabled;
    const isChecked = context.value === value;

    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={isChecked}
        data-state={isChecked ? 'checked' : 'unchecked'}
        data-disabled={isDisabled ? '' : undefined}
        disabled={isDisabled}
        value={value}
        id={id}
        className={cn(
          'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        onClick={() => {
          if (!isDisabled) {
            context.onValueChange?.(value);
          }
        }}
        {...props}
      >
        {isChecked && (
          <span className="flex items-center justify-center">
            <span className="h-2.5 w-2.5 rounded-full bg-current" />
          </span>
        )}
      </button>
    );
  }
);

RadioGroupItem.displayName = 'RadioGroupItem';

export default RadioGroup;
