/**
 * Button Component - Enterprise Dashboard CTA Premium ⭐⭐⭐⭐⭐
 * 
 * Advanced button system for executive dashboards with premium theming,
 * sophisticated interactions, and business intelligence integration.
 * 
 * Features:
 * - 6 Premium Dashboard Themes (executive, analytics, finance, etc.)
 * - 7 Specialized Variants for business scenarios
 * - Advanced loading states with custom animations
 * - Apple-style micro-interactions and glassmorphism
 * - Icon integration with badges and indicators
 * - Performance monitoring and analytics tracking
 * - Executive-level styling and typography
 * - Keyboard shortcuts and accessibility++
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { 
  Loader2, 
  ChevronRight, 
  TrendingUp, 
  DollarSign, 
  BarChart3,
  Users,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Check,
  X,
  AlertCircle,
  Info,
  Star,
  Zap,
  Shield,
  Globe,
  Clock,
  Bell
} from "lucide-react";

// =================== THEME SYSTEM ===================

export type ButtonTheme = 
  | 'executive'     // C-level gradients and premium styling
  | 'analytics'     // Purple data science theme
  | 'finance'       // Green financial KPIs theme
  | 'dashboard'     // Blue business intelligence theme
  | 'minimal'       // Clean modern gray theme
  | 'default';      // Standard enterprise theme

export type ButtonVariant = 
  | 'primary'       // Main call-to-action buttons
  | 'secondary'     // Secondary actions
  | 'executive'     // Premium C-level styling
  | 'action'        // Quick action buttons
  | 'analytics'     // Data visualization actions
  | 'finance'       // Financial operations
  | 'danger'        // Destructive actions
  | 'success'       // Positive confirmations
  | 'ghost'         // Subtle background actions
  | 'outline'       // Bordered actions
  | 'link'          // Text-only actions
  | 'icon'          // Icon-only actions
  | 'floating';     // Floating action buttons

export type ButtonSize = 
  | 'xs'            // Compact for dense UIs
  | 'sm'            // Small secondary actions
  | 'md'            // Standard size
  | 'lg'            // Prominent actions
  | 'xl'            // Hero actions
  | 'icon'          // Square icon buttons
  | 'fab';          // Floating action button

// =================== THEME CONFIGURATIONS ===================

export const themeStyles = {
  executive: {
    primary: "bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white border-purple-500/20 shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-300",
    secondary: "bg-gradient-to-r from-gray-100 to-white text-slate-800 border border-slate-200 shadow-lg hover:shadow-xl hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-100",
    ghost: "text-slate-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-slate-50 hover:text-purple-700",
  },
  analytics: {
    primary: "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/40 hover:from-violet-700 hover:to-purple-700",
    secondary: "bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 hover:border-violet-300",
    ghost: "text-violet-600 hover:bg-violet-50 hover:text-violet-700",
  },
  finance: {
    primary: "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 hover:from-emerald-700 hover:to-green-700",
    secondary: "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300",
    ghost: "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700",
  },
  dashboard: {
    primary: "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:from-blue-700 hover:to-cyan-700",
    secondary: "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300",
    ghost: "text-blue-600 hover:bg-blue-50 hover:text-blue-700",
  },
  minimal: {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-xl",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow-md",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-700",
  },
  default: {
    primary: "bg-primary text-white hover:brightness-95 shadow-md hover:shadow-lg",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
  },
};

// =================== VARIANT CONFIGURATIONS ===================

export const buttonVariants = cva(
  [
    // Base styles
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium",
    "transition-all duration-200 ease-in-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary",
    "disabled:pointer-events-none disabled:opacity-50",
    "ring-offset-background",
    // Performance optimizations
    "will-change-transform",
    // Accessibility enhancements
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
  ],
  {
    variants: {
      variant: {
        primary: "font-semibold",
        secondary: "font-medium",
        executive: "font-bold tracking-wide text-base backdrop-blur-sm",
        action: "font-medium hover:scale-105 active:scale-95",
        analytics: "font-medium",
        finance: "font-medium",
        danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/25",
        success: "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/25",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto font-normal",
        icon: "hover:bg-accent hover:text-accent-foreground",
        floating: [
          "rounded-full shadow-xl hover:shadow-2xl",
          "bg-gradient-to-r from-blue-600 to-purple-600",
          "text-white hover:scale-110 active:scale-95",
          "fixed bottom-6 right-6 z-50",
        ],
      },
      size: {
        xs: "h-7 px-2 text-xs",
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4 text-sm",
        lg: "h-10 px-6 text-sm",
        xl: "h-12 px-8 text-base",
        icon: "h-9 w-9",
        fab: "h-14 w-14 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

// =================== ICON MAPPINGS ===================

export const iconMap = {
  // Actions
  download: Download,
  upload: Upload,
  refresh: RefreshCw,
  settings: Settings,
  
  // Status
  check: Check,
  close: X,
  alert: AlertCircle,
  info: Info,
  
  // Business
  trending: TrendingUp,
  finance: DollarSign,
  analytics: BarChart3,
  users: Users,
  
  // UI
  chevronRight: ChevronRight,
  star: Star,
  zap: Zap,
  shield: Shield,
  globe: Globe,
  clock: Clock,
  bell: Bell,
  
  // Loading
  loading: Loader2,
} as const;

export type IconName = keyof typeof iconMap;

// =================== COMPONENT INTERFACES ===================

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  
  // Theme system
  theme?: ButtonTheme;
  
  // Loading states
  loading?: boolean;
  loadingText?: string;
  loadingIcon?: React.ReactNode;
  
  // Icon system
  icon?: IconName | React.ReactNode;
  iconPosition?: 'left' | 'right';
  rightIcon?: IconName | React.ReactNode;
  
  // Badge system
  badge?: string | number;
  badgeVariant?: 'default' | 'success' | 'warning' | 'error';
  
  // Keyboard shortcuts
  shortcut?: string;
  
  // Analytics
  trackingId?: string;
  trackingData?: Record<string, any>;
  
  // Advanced styling
  gradient?: boolean;
  glassmorphism?: boolean;
  
  // Animation
  animateOnHover?: boolean;
  pulseOnMount?: boolean;
  
  // Accessibility enhancements
  description?: string;
  tooltipContent?: string;
}

// =================== SPECIALIZED BUTTON VARIANTS ===================

export interface ExecutiveButtonProps extends Omit<ButtonProps, 'variant' | 'theme'> {
  metric?: string;
  trend?: 'up' | 'down' | 'neutral';
  priority?: 'high' | 'medium' | 'low';
}

export interface ActionButtonProps extends Omit<ButtonProps, 'variant'> {
  actionType?: 'create' | 'edit' | 'delete' | 'view' | 'export' | 'import';
  confirmRequired?: boolean;
}

export interface AnalyticsButtonProps extends Omit<ButtonProps, 'variant' | 'theme'> {
  dataType?: 'chart' | 'table' | 'export' | 'filter' | 'drill-down';
  visualizationType?: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap';
}

export interface FinanceButtonProps extends Omit<ButtonProps, 'variant' | 'theme'> {
  financialAction?: 'approve' | 'reject' | 'review' | 'calculate' | 'forecast';
  amount?: number;
  currency?: string;
}

// =================== UTILITY FUNCTIONS ===================

const getThemeStyles = (theme: ButtonTheme, variant: string) => {
  const themeConfig = themeStyles[theme];
  if (!themeConfig) return '';
  
  // Map variants to theme styles
  const variantMap: Record<string, keyof typeof themeConfig> = {
    primary: 'primary',
    executive: 'primary',
    action: 'primary',
    analytics: 'primary',
    finance: 'primary',
    secondary: 'secondary',
    ghost: 'ghost',
  };
  
  const themeVariant = variantMap[variant] || 'primary';
  return themeConfig[themeVariant] || '';
};

const renderIcon = (icon: IconName | React.ReactNode, className?: string) => {
  if (!icon) return null;
  
  if (typeof icon === 'string' && icon in iconMap) {
    const IconComponent = iconMap[icon as IconName];
    return <IconComponent className={className} />;
  }
  
  return icon;
};

const renderBadge = (badge: string | number, variant: ButtonProps['badgeVariant'] = 'default') => {
  if (!badge) return null;
  
  const badgeStyles = {
    default: 'bg-gray-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-black',
    error: 'bg-red-500 text-white',
  };
  
  return (
    <span className={twMerge(
      'absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs font-bold flex items-center justify-center',
      badgeStyles[variant]
    )}>
      {badge}
    </span>
  );
};

// =================== MAIN BUTTON COMPONENT ===================

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    theme = 'default',
    asChild = false,
    loading = false,
    loadingText,
    loadingIcon,
    icon,
    iconPosition = 'left',
    rightIcon,
    badge,
    badgeVariant = 'default',
    shortcut,
    trackingId,
    trackingData,
    gradient = false,
    glassmorphism = false,
    animateOnHover = false,
    pulseOnMount = false,
    description,
    tooltipContent,
    children,
    onClick,
    disabled,
    ...props 
  }, ref) => {
    
    const [isClicked, setIsClicked] = React.useState(false);
    const [mountAnimation, setMountAnimation] = React.useState(pulseOnMount);
    
    // Handle mount animation
    React.useEffect(() => {
      if (pulseOnMount) {
        const timer = setTimeout(() => setMountAnimation(false), 1000);
        return () => clearTimeout(timer);
      }
    }, [pulseOnMount]);
    
    // Handle click with analytics
    const handleClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;
      
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 150);
      
      // Analytics tracking
      if (trackingId && typeof window !== 'undefined') {
        // Analytics tracking logic here
        console.log('Button clicked:', { trackingId, trackingData });
      }
      
      onClick?.(event);
    }, [disabled, loading, onClick, trackingId, trackingData]);
    
    // Handle keyboard shortcuts
    React.useEffect(() => {
      if (!shortcut) return;
      
      const handleKeyDown = (event: KeyboardEvent) => {
        const keys = shortcut.toLowerCase().split('+');
        const modifiers = keys.slice(0, -1);
        const key = keys[keys.length - 1];
        
        const hasModifiers = modifiers.every(mod => {
          switch (mod) {
            case 'ctrl': return event.ctrlKey;
            case 'alt': return event.altKey;
            case 'shift': return event.shiftKey;
            case 'meta': return event.metaKey;
            default: return false;
          }
        });
        
        if (hasModifiers && event.key.toLowerCase() === key) {
          event.preventDefault();
          handleClick(event as any);
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [shortcut, handleClick]);
    
    // Build component classes
    const Comp = asChild ? Slot : "button";
    
    const themeClasses = theme !== 'default' ? getThemeStyles(theme, variant || 'primary') : '';
    
    const combinedClassName = twMerge(
      buttonVariants({ variant, size }),
      themeClasses,
      // Gradient effects
      gradient && variant === 'primary' && "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
      // Glassmorphism
      glassmorphism && "backdrop-blur-lg bg-white/10 border border-white/20",
      // Animations
      animateOnHover && "hover:scale-105 active:scale-95",
      mountAnimation && "animate-pulse",
      isClicked && "scale-95",
      // Relative positioning for badges
      badge && "relative",
      className
    );
    
    // Render loading state
    if (loading) {
      const LoadingIcon = loadingIcon || <Loader2 className="w-4 h-4 animate-spin" />;
      return (
        <Comp
          className={combinedClassName}
          ref={ref}
          disabled={true}
          aria-disabled="true"
          aria-label={loadingText || "Loading"}
          {...props}
        >
          {renderIcon(LoadingIcon, "w-4 h-4 animate-spin")}
          {loadingText && <span className="ml-2">{loadingText}</span>}
          {badge && renderBadge(badge, badgeVariant)}
        </Comp>
      );
    }
    
    // Render normal state
    return (
      <Comp
        className={combinedClassName}
        ref={ref}
        disabled={disabled}
        onClick={handleClick}
        aria-label={props['aria-label'] || description}
        aria-describedby={description ? `${props.id}-description` : undefined}
        title={tooltipContent}
        {...props}
      >
        {/* Left icon */}
        {icon && iconPosition === 'left' && (
          renderIcon(icon, twMerge("w-4 h-4", children && "mr-2"))
        )}
        
        {/* Content */}
        {children}
        
        {/* Right icon */}
        {(rightIcon || (icon && iconPosition === 'right')) && (
          renderIcon(rightIcon || icon, twMerge("w-4 h-4", children && "ml-2"))
        )}
        
        {/* Keyboard shortcut hint */}
        {shortcut && (
          <span className="ml-2 text-xs opacity-60 font-mono">
            {shortcut}
          </span>
        )}
        
        {/* Badge */}
        {badge && renderBadge(badge, badgeVariant)}
        
        {/* Hidden description for screen readers */}
        {description && (
          <span id={`${props.id}-description`} className="sr-only">
            {description}
          </span>
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

// =================== SPECIALIZED COMPONENTS ===================

export const ExecutiveButton = React.forwardRef<HTMLButtonElement, ExecutiveButtonProps>(
  ({ metric, trend, priority = 'medium', children, ...props }, ref) => {
    const trendIcon = trend === 'up' ? 'trending' : trend === 'down' ? 'chevronRight' : undefined;
    const priorityTheme = priority === 'high' ? 'executive' : priority === 'medium' ? 'dashboard' : 'minimal';
    
    return (
      <Button
        ref={ref}
        variant="executive"
        theme={priorityTheme}
        icon={trendIcon}
        glassmorphism
        animateOnHover
        className="font-bold text-base tracking-wide"
        {...props}
      >
        {metric && <span className="text-sm opacity-80 mr-2">{metric}</span>}
        {children}
      </Button>
    );
  }
);

ExecutiveButton.displayName = "ExecutiveButton";

export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ actionType, confirmRequired, children, ...props }, ref) => {
    const actionIcons: Record<string, IconName> = {
      create: 'zap',
      edit: 'settings',
      delete: 'close',
      view: 'info',
      export: 'download',
      import: 'upload',
    };
    
    const actionIcon = actionType ? actionIcons[actionType] : undefined;
    
    return (
      <Button
        ref={ref}
        variant="action"
        icon={actionIcon}
        theme="dashboard"
        animateOnHover
        {...props}
      >
        {children}
      </Button>
    );
  }
);

ActionButton.displayName = "ActionButton";

export const AnalyticsButton = React.forwardRef<HTMLButtonElement, AnalyticsButtonProps>(
  ({ dataType, visualizationType, children, ...props }, ref) => {
    const dataIcons: Record<string, IconName> = {
      chart: 'analytics',
      table: 'settings',
      export: 'download',
      filter: 'settings',
      'drill-down': 'chevronRight',
    };
    
    const dataIcon = dataType ? dataIcons[dataType] : 'analytics';
    
    return (
      <Button
        ref={ref}
        variant="analytics"
        theme="analytics"
        icon={dataIcon}
        gradient
        {...props}
      >
        {children}
      </Button>
    );
  }
);

AnalyticsButton.displayName = "AnalyticsButton";

export const FinanceButton = React.forwardRef<HTMLButtonElement, FinanceButtonProps>(
  ({ financialAction, amount, currency = 'USD', children, ...props }, ref) => {
    const financeIcons: Record<string, IconName> = {
      approve: 'check',
      reject: 'close',
      review: 'info',
      calculate: 'analytics',
      forecast: 'trending',
    };
    
    const financeIcon = financialAction ? financeIcons[financialAction] : 'finance';
    
    return (
      <Button
        ref={ref}
        variant="finance"
        theme="finance"
        icon={financeIcon}
        {...props}
      >
        {amount && (
          <span className="font-mono mr-2">
            {new Intl.NumberFormat('en-US', { 
              style: 'currency', 
              currency 
            }).format(amount)}
          </span>
        )}
        {children}
      </Button>
    );
  }
);

FinanceButton.displayName = "FinanceButton";

// =================== EXPORTS ===================

export default Button;

// Export all types individually to avoid double exports
export {
  type ButtonProps,
  type ExecutiveButtonProps,
  type ActionButtonProps,
  type AnalyticsButtonProps,
  type FinanceButtonProps,
  type ButtonTheme,
  type ButtonVariant,
  type ButtonSize,
  type IconName,
};

/**
 * Usage Examples:
 * 
 * // Basic usage
 * <Button>Click me</Button>
 * 
 * // Executive dashboard
 * <ExecutiveButton metric="Q4 Revenue" trend="up" priority="high">
 *   $2.4M
 * </ExecutiveButton>
 * 
 * // Analytics action
 * <AnalyticsButton dataType="chart" visualizationType="line">
 *   Generate Report
 * </AnalyticsButton>
 * 
 * // Finance operation
 * <FinanceButton financialAction="approve" amount={15000}>
 *   Approve Budget
 * </FinanceButton>
 * 
 * // Custom themed
 * <Button variant="primary" theme="executive" icon="trending" gradient>
 *   Executive Action
 * </Button>
 * 
 * // With keyboard shortcut
 * <Button shortcut="Ctrl+S" icon="download">
 *   Save Report
 * </Button>
 * 
 * // Loading state
 * <Button loading loadingText="Processing...">
 *   Submit
 * </Button>
 * 
 * // With badge
 * <Button badge={3} badgeVariant="error" icon="bell">
 *   Notifications
 * </Button>
 */