import * as React from 'react';
import { Star, Heart, ThumbsUp, Circle, Square, Triangle } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface RatingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current rating value */
  value?: number;
  /** Default rating value */
  defaultValue?: number;
  /** Maximum rating value */
  max?: number;
  /** Icon to use for rating */
  icon?: 'star' | 'heart' | 'thumbs' | 'circle' | 'square' | 'triangle';
  /** Size of the rating icons */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Color variant */
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  /** Allow half ratings */
  allowHalf?: boolean;
  /** Disable interaction */
  disabled?: boolean;
  /** Read-only mode */
  readOnly?: boolean;
  /** Show rating label */
  showLabel?: boolean;
  /** Custom labels for each rating value */
  labels?: string[];
  /** Callback when rating changes */
  onValueChange?: (value: number) => void;
  /** Callback on hover */
  onHoverChange?: (value: number | null) => void;
}

const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      className,
      value,
      defaultValue = 0,
      max = 5,
      icon = 'star',
      size = 'md',
      color = 'warning',
      allowHalf = false,
      disabled = false,
      readOnly = false,
      showLabel = false,
      labels,
      onValueChange,
      onHoverChange,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const [hoverValue, setHoverValue] = React.useState<number | null>(null);
    const currentValue = value !== undefined ? value : internalValue;
    const displayValue = hoverValue !== null ? hoverValue : currentValue;

    const icons = {
      star: Star,
      heart: Heart,
      thumbs: ThumbsUp,
      circle: Circle,
      square: Square,
      triangle: Triangle,
    };

    const sizes = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-8 w-8',
    };

    const colors = {
      default: 'text-gray-400 fill-gray-400',
      primary: 'text-primary fill-primary',
      secondary: 'text-secondary fill-secondary',
      success: 'text-green-500 fill-green-500',
      warning: 'text-yellow-500 fill-yellow-500',
      danger: 'text-red-500 fill-red-500',
    };

    const Icon = icons[icon];
    const isInteractive = !disabled && !readOnly;

    const handleClick = (rating: number) => {
      if (!isInteractive) return;
      
      const newValue = rating === currentValue ? 0 : rating;
      setInternalValue(newValue);
      onValueChange?.(newValue);
    };

    const handleMouseEnter = (rating: number) => {
      if (!isInteractive) return;
      setHoverValue(rating);
      onHoverChange?.(rating);
    };

    const handleMouseLeave = () => {
      if (!isInteractive) return;
      setHoverValue(null);
      onHoverChange?.(null);
    };

    const renderIcon = (index: number) => {
      const rating = index + 1;
      const filled = rating <= displayValue;
      const halfFilled = allowHalf && rating - 0.5 === displayValue;

      return (
        <button
          key={index}
          type="button"
          className={cn(
            'relative transition-all',
            isInteractive && 'hover:scale-110 focus:outline-none focus:scale-110',
            disabled && 'opacity-50 cursor-not-allowed',
            readOnly && 'cursor-default',
            isInteractive && 'cursor-pointer'
          )}
          onClick={() => handleClick(rating)}
          onMouseEnter={() => handleMouseEnter(rating)}
          onMouseLeave={handleMouseLeave}
          disabled={disabled}
          aria-label={`Rate ${rating} out of ${max}`}
        >
          <Icon
            className={cn(
              sizes[size],
              'transition-colors',
              filled ? colors[color] : 'text-gray-300 dark:text-gray-700'
            )}
          />
          {halfFilled && (
            <Icon
              className={cn(
                sizes[size],
                'absolute inset-0',
                colors[color],
                'clip-half'
              )}
              style={{ clipPath: 'inset(0 50% 0 0)' }}
            />
          )}
        </button>
      );
    };

    const label = React.useMemo(() => {
      if (!showLabel) return null;
      
      if (labels && labels[Math.floor(displayValue) - 1]) {
        return labels[Math.floor(displayValue) - 1];
      }
      
      return `${displayValue} / ${max}`;
    }, [showLabel, labels, displayValue, max]);

    return (
      <div
        ref={ref}
        className={cn('inline-flex items-center gap-1', className)}
        {...props}
      >
        <div className="flex gap-0.5">
          {Array.from({ length: max }, (_, i) => renderIcon(i))}
        </div>
        {showLabel && label && (
          <span className={cn(
            'ml-2 text-sm text-muted-foreground',
            size === 'sm' && 'text-xs',
            size === 'lg' && 'text-base',
            size === 'xl' && 'text-lg'
          )}>
            {label}
          </span>
        )}
      </div>
    );
  }
);

Rating.displayName = 'Rating';

export { Rating };