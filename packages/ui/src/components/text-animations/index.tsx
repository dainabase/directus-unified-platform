import * as React from 'react';
import { cn } from '../../lib/utils';

export interface TextAnimationsProps {
  children: React.ReactNode;
  animation?: 'fade' | 'slide' | 'typewriter' | 'bounce' | 'scale';
  duration?: number;
  delay?: number;
  className?: string;
}

const TextAnimations: React.FC<TextAnimationsProps> = ({
  children,
  animation = 'fade',
  duration = 1000,
  delay = 0,
  className,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const animationStyles = {
    fade: {
      opacity: isVisible ? 1 : 0,
      transition: `opacity ${duration}ms ease-in-out`,
    },
    slide: {
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      opacity: isVisible ? 1 : 0,
      transition: `all ${duration}ms ease-out`,
    },
    typewriter: {
      width: isVisible ? '100%' : '0',
      overflow: 'hidden',
      whiteSpace: 'nowrap' as const,
      transition: `width ${duration}ms steps(30, end)`,
    },
    bounce: {
      transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
      opacity: isVisible ? 1 : 0,
      transition: `all ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`,
    },
    scale: {
      transform: isVisible ? 'scale(1)' : 'scale(0.8)',
      opacity: isVisible ? 1 : 0,
      transition: `all ${duration}ms ease-out`,
    },
  };

  return (
    <div 
      className={cn('inline-block', className)}
      style={animationStyles[animation]}
    >
      {children}
    </div>
  );
};

// Wrapper components for different animation types
export const FadeText: React.FC<Omit<TextAnimationsProps, 'animation'>> = (props) => (
  <TextAnimations {...props} animation="fade" />
);

export const SlideText: React.FC<Omit<TextAnimationsProps, 'animation'>> = (props) => (
  <TextAnimations {...props} animation="slide" />
);

export const TypewriterText: React.FC<Omit<TextAnimationsProps, 'animation'>> = (props) => (
  <TextAnimations {...props} animation="typewriter" />
);

export const BounceText: React.FC<Omit<TextAnimationsProps, 'animation'>> = (props) => (
  <TextAnimations {...props} animation="bounce" />
);

export const ScaleText: React.FC<Omit<TextAnimationsProps, 'animation'>> = (props) => (
  <TextAnimations {...props} animation="scale" />
);

export { TextAnimations };
export default TextAnimations;
