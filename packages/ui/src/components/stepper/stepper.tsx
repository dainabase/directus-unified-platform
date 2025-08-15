import * as React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  content?: React.ReactNode;
  optional?: boolean;
  error?: boolean;
  disabled?: boolean;
}

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Steps configuration */
  steps: Step[];
  /** Current active step index */
  activeStep?: number;
  /** Completed steps (for non-linear steppers) */
  completedSteps?: number[];
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Allow clicking on steps to navigate */
  clickable?: boolean;
  /** Show step numbers */
  showNumbers?: boolean;
  /** Variant style */
  variant?: 'default' | 'dots' | 'progress' | 'simple';
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Color scheme */
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  /** Callback when step is clicked */
  onStepClick?: (stepIndex: number) => void;
  /** Show content for active step */
  showContent?: boolean;
  /** Alternative labels placement */
  alternativeLabel?: boolean;
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      className,
      steps,
      activeStep = 0,
      completedSteps = [],
      orientation = 'horizontal',
      clickable = true,
      showNumbers = true,
      variant = 'default',
      size = 'md',
      color = 'primary',
      onStepClick,
      showContent = false,
      alternativeLabel = false,
      ...props
    },
    ref
  ) => {
    const isStepComplete = (index: number) => {
      return completedSteps.includes(index) || index < activeStep;
    };

    const isStepActive = (index: number) => {
      return index === activeStep;
    };

    const isStepError = (step: Step) => {
      return step.error === true;
    };

    const isStepDisabled = (step: Step, index: number) => {
      return step.disabled === true || (!isStepComplete(index) && index > activeStep && !clickable);
    };

    const handleStepClick = (index: number, step: Step) => {
      if (!clickable || isStepDisabled(step, index)) return;
      onStepClick?.(index);
    };

    const sizes = {
      sm: {
        circle: 'h-8 w-8 text-xs',
        text: 'text-xs',
        connector: 'h-px',
      },
      md: {
        circle: 'h-10 w-10 text-sm',
        text: 'text-sm',
        connector: 'h-0.5',
      },
      lg: {
        circle: 'h-12 w-12 text-base',
        text: 'text-base',
        connector: 'h-0.5',
      },
    };

    const colors = {
      default: 'bg-gray-500',
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500',
    };

    const renderStepIndicator = (step: Step, index: number) => {
      const isComplete = isStepComplete(index);
      const isActive = isStepActive(index);
      const isError = isStepError(step);
      const isDisabled = isStepDisabled(step, index);

      if (variant === 'dots') {
        return (
          <div
            className={cn(
              'h-3 w-3 rounded-full transition-all',
              isComplete && colors[color],
              isActive && `${colors[color]} ring-4 ring-opacity-30 ring-current`,
              isError && 'bg-red-500',
              !isComplete && !isActive && !isError && 'bg-gray-300 dark:bg-gray-700',
              isDisabled && 'opacity-50'
            )}
          />
        );
      }

      return (
        <div
          className={cn(
            'relative flex items-center justify-center rounded-full transition-all',
            sizes[size].circle,
            isComplete && `${colors[color]} text-white`,
            isActive && `${colors[color]} text-white ring-4 ring-opacity-30 ring-current`,
            isError && 'bg-red-500 text-white',
            !isComplete && !isActive && !isError && 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
            isDisabled && 'opacity-50 cursor-not-allowed',
            clickable && !isDisabled && 'cursor-pointer hover:scale-110'
          )}
        >
          {isComplete && !showNumbers ? (
            <Check className="h-5 w-5" />
          ) : isError ? (
            <span className="text-xs">!</span>
          ) : step.icon ? (
            step.icon
          ) : showNumbers ? (
            <span>{index + 1}</span>
          ) : (
            <div className="h-2 w-2 rounded-full bg-current" />
          )}
        </div>
      );
    };

    const renderConnector = (index: number) => {
      if (index === steps.length - 1) return null;

      const isComplete = isStepComplete(index);
      const progress = variant === 'progress' && index < activeStep;

      if (orientation === 'vertical') {
        return (
          <div
            className={cn(
              'w-px h-full min-h-[30px] transition-all',
              variant === 'dots' ? '-translate-x-px' : 'ml-5',
              (isComplete || progress) ? colors[color] : 'bg-gray-300 dark:bg-gray-700'
            )}
          />
        );
      }

      return (
        <div
          className={cn(
            'flex-1 transition-all',
            sizes[size].connector,
            (isComplete || progress) ? colors[color] : 'bg-gray-300 dark:bg-gray-700'
          )}
        />
      );
    };

    if (orientation === 'vertical') {
      return (
        <div ref={ref} className={cn('flex flex-col', className)} {...props}>
          {steps.map((step, index) => (
            <div key={step.id} className="flex">
              <div className="flex flex-col items-center mr-4">
                <button
                  type="button"
                  onClick={() => handleStepClick(index, step)}
                  disabled={isStepDisabled(step, index)}
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-full"
                  aria-current={isStepActive(index) ? 'step' : undefined}
                >
                  {renderStepIndicator(step, index)}
                </button>
                {renderConnector(index)}
              </div>
              <div className={cn('flex-1 pb-8', index === steps.length - 1 && 'pb-0')}>
                <h3
                  className={cn(
                    'font-medium',
                    sizes[size].text,
                    isStepActive(index) && 'text-primary',
                    isStepDisabled(step, index) && 'text-gray-400'
                  )}
                >
                  {step.title}
                  {step.optional && (
                    <span className="text-xs text-gray-500 ml-1">(Optional)</span>
                  )}
                </h3>
                {step.description && (
                  <p className={cn('text-muted-foreground mt-1', sizes[size].text)}>
                    {step.description}
                  </p>
                )}
                {showContent && isStepActive(index) && step.content && (
                  <div className="mt-4">{step.content}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Horizontal orientation
    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div
                className={cn(
                  'flex items-center',
                  alternativeLabel ? 'flex-col' : 'flex-row'
                )}
              >
                <button
                  type="button"
                  onClick={() => handleStepClick(index, step)}
                  disabled={isStepDisabled(step, index)}
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-full"
                  aria-current={isStepActive(index) ? 'step' : undefined}
                >
                  {renderStepIndicator(step, index)}
                </button>
                {variant !== 'dots' && (
                  <div
                    className={cn(
                      alternativeLabel ? 'mt-2 text-center' : 'ml-3',
                      'flex flex-col'
                    )}
                  >
                    <h3
                      className={cn(
                        'font-medium whitespace-nowrap',
                        sizes[size].text,
                        isStepActive(index) && 'text-primary',
                        isStepDisabled(step, index) && 'text-gray-400'
                      )}
                    >
                      {step.title}
                      {step.optional && (
                        <span className="text-xs text-gray-500 ml-1">(Optional)</span>
                      )}
                    </h3>
                    {step.description && variant !== 'simple' && (
                      <p className={cn('text-muted-foreground mt-1', sizes[size].text)}>
                        {step.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
              {renderConnector(index)}
            </React.Fragment>
          ))}
        </div>
        {showContent && steps[activeStep]?.content && (
          <div className="mt-8">{steps[activeStep].content}</div>
        )}
      </div>
    );
  }
);

Stepper.displayName = 'Stepper';

export { Stepper };