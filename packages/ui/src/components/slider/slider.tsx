import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  /** Show value label on thumb */
  showValue?: boolean;
  /** Format value for display */
  formatValue?: (value: number) => string;
  /** Show marks at specific values */
  marks?: Array<{ value: number; label?: string }>;
  /** Color variant */
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>((
  {
    className,
    showValue = false,
    formatValue = (v) => v.toString(),
    marks,
    variant = 'default',
    value,
    defaultValue,
    ...props
  },
  ref
) => {
  const [currentValue, setCurrentValue] = React.useState(
    value || defaultValue || [0]
  );

  React.useEffect(() => {
    if (value) {
      setCurrentValue(value);
    }
  }, [value]);

  const handleValueChange = (newValue: number[]) => {
    setCurrentValue(newValue);
    props.onValueChange?.(newValue);
  };

  const variantStyles = {
    default: 'bg-primary',
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
  };

  return (
    <div className="relative">
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          className
        )}
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range
            className={cn(
              'absolute h-full',
              variantStyles[variant]
            )}
          />
        </SliderPrimitive.Track>
        {currentValue.map((val, index) => (
          <SliderPrimitive.Thumb
            key={index}
            className={cn(
              'block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:pointer-events-none disabled:opacity-50',
              'hover:scale-110 hover:shadow-lg'
            )}
          >
            {showValue && (
              <span
                className={cn(
                  'absolute -top-8 left-1/2 -translate-x-1/2 transform',
                  'rounded bg-gray-900 px-2 py-1 text-xs text-white',
                  'dark:bg-gray-100 dark:text-gray-900',
                  'pointer-events-none select-none'
                )}
              >
                {formatValue(val)}
              </span>
            )}
          </SliderPrimitive.Thumb>
        ))}
      </SliderPrimitive.Root>
      {marks && (
        <div className="relative mt-2">
          {marks.map((mark) => {
            const position = 
              props.max && props.min !== undefined
                ? ((mark.value - props.min) / (props.max - props.min)) * 100
                : 0;
            return (
              <div
                key={mark.value}
                className="absolute text-xs text-muted-foreground"
                style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
              >
                <div className="w-px h-2 bg-gray-300 dark:bg-gray-700 mx-auto" />
                {mark.label && (
                  <span className="block mt-1">{mark.label}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };