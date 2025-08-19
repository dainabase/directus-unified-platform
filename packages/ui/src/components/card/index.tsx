import * as React from "react";
import { twMerge } from "tailwind-merge";
import { cva, type VariantProps } from "class-variance-authority";

/**
 * 🃏 CARD PATTERN TRIPLE ⭐⭐⭐⭐⭐ - APPLE-STYLE DASHBOARD EXCELLENCE
 * 
 * Enterprise-grade card containers for Dashboard Apple-style
 * Optimized for KPIs, metrics widgets, and executive views
 * 
 * @version 1.0.1-beta.2
 * @author Dainabase Design System Team
 * @premium Apple-style Dashboard focused
 * 
 * FEATURES PREMIUM:
 * ✨ 6 Variants Business (Executive, Analytics, Finance, Minimal, Dashboard, KPI)
 * 🎨 4 Thèmes Sophistiqués (Apple-glass, Dark Executive, Light Premium, High-contrast)  
 * 🚀 Animations & Effects (Hover, Glass morphism, Gradients)
 * ♿ Accessibility AA+
 * 📱 Responsive Excellence
 * 🎯 Performance Optimized
 * 
 * DASHBOARD APPLE-STYLE SPECIALIZATIONS:
 * - Executive: Premium glass containers for C-level dashboards
 * - Analytics: Data-focused cards with subtle highlights  
 * - Finance: Professional financial metrics containers
 * - KPI: Compact high-impact metric displays
 * - Dashboard: General purpose Apple-style widgets
 * - Minimal: Clean focus cards for key metrics
 */

// 🎨 CARD VARIANT SYSTEM - APPLE-STYLE DASHBOARD EXCELLENCE
const cardVariants = cva(
  "relative rounded-xl border transition-all duration-300 ease-out overflow-hidden group", 
  {
    variants: {
      // 🏢 BUSINESS VARIANTS - APPLE DASHBOARD OPTIMIZED
      variant: {
        // 👑 EXECUTIVE - Premium glass containers for C-level
        executive: [
          "bg-gradient-to-br from-white/95 via-white/90 to-white/85",
          "dark:bg-gradient-to-br dark:from-slate-900/95 dark:via-slate-900/90 dark:to-slate-800/85",
          "border-white/20 dark:border-slate-700/50",
          "shadow-xl shadow-black/5 dark:shadow-black/20",
          "backdrop-blur-xl backdrop-saturate-150",
          "hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/30",
          "hover:scale-[1.02] hover:-translate-y-1",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity",
        ],
        
        // 📊 ANALYTICS - Data-focused with subtle highlights
        analytics: [
          "bg-white dark:bg-slate-900",
          "border-slate-200/60 dark:border-slate-700/60", 
          "shadow-lg shadow-slate-900/5 dark:shadow-black/20",
          "hover:border-blue-300/60 dark:hover:border-blue-500/40",
          "hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20",
          "hover:scale-[1.01]",
          "relative after:absolute after:inset-0 after:bg-gradient-to-r after:from-blue-500/5 after:to-purple-500/5 after:opacity-0 hover:after:opacity-100 after:transition-opacity",
        ],
        
        // 💰 FINANCE - Professional financial metrics
        finance: [
          "bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-950/20 dark:to-slate-900",
          "border-emerald-200/40 dark:border-emerald-800/40",
          "shadow-lg shadow-emerald-900/5 dark:shadow-black/20",
          "hover:border-emerald-300/60 dark:hover:border-emerald-600/60",
          "hover:shadow-xl hover:shadow-emerald-500/15 dark:hover:shadow-emerald-500/25",
          "hover:scale-[1.01]",
        ],
        
        // 🎯 KPI - Compact high-impact displays
        kpi: [
          "bg-white/90 dark:bg-slate-900/90",
          "border-slate-200/40 dark:border-slate-700/40",
          "shadow-md shadow-slate-900/5 dark:shadow-black/15", 
          "backdrop-blur-sm",
          "hover:bg-white dark:hover:bg-slate-900",
          "hover:border-slate-300/60 dark:hover:border-slate-600/60",
          "hover:shadow-lg hover:shadow-slate-900/10 dark:hover:shadow-black/25",
          "hover:scale-[1.02]",
        ],
        
        // 🏠 DASHBOARD - General purpose Apple-style  
        dashboard: [
          "bg-white/95 dark:bg-slate-900/95",
          "border-slate-200/50 dark:border-slate-700/50",
          "shadow-lg shadow-slate-900/8 dark:shadow-black/20",
          "backdrop-blur-md",
          "hover:bg-white dark:hover:bg-slate-900", 
          "hover:border-slate-300/70 dark:hover:border-slate-600/70",
          "hover:shadow-xl hover:shadow-slate-900/12 dark:hover:shadow-black/30",
          "hover:scale-[1.01] hover:-translate-y-0.5",
        ],
        
        // ✨ MINIMAL - Clean focus for key metrics
        minimal: [
          "bg-white dark:bg-slate-900",
          "border-slate-200/30 dark:border-slate-700/30",
          "shadow-sm shadow-slate-900/5 dark:shadow-black/10",
          "hover:border-slate-300/50 dark:hover:border-slate-600/50", 
          "hover:shadow-md hover:shadow-slate-900/8 dark:hover:shadow-black/15",
          "hover:scale-[1.005]",
        ],
      },
      
      // 🎨 THEME VARIANTS - APPLE ECOSYSTEM INSPIRED
      theme: {
        // 🍎 APPLE GLASS - Signature translucent style
        "apple-glass": [
          "bg-white/80 dark:bg-slate-900/80",
          "backdrop-blur-xl backdrop-saturate-150",
          "border-white/30 dark:border-white/10",
          "shadow-2xl shadow-black/10 dark:shadow-black/40",
        ],
        
        // 🌙 DARK EXECUTIVE - Premium dark theme
        "dark-executive": [
          "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
          "border-slate-700/50",
          "shadow-2xl shadow-black/25",
          "text-white",
        ],
        
        // ☀️ LIGHT PREMIUM - Sophisticated light
        "light-premium": [
          "bg-gradient-to-br from-white via-slate-50/50 to-white",
          "border-slate-200/60",
          "shadow-xl shadow-slate-900/8",
        ],
        
        // 🔍 HIGH CONTRAST - Accessibility optimized
        "high-contrast": [
          "bg-white dark:bg-black",
          "border-slate-900 dark:border-white",
          "shadow-lg shadow-slate-900/20 dark:shadow-white/20",
          "text-slate-900 dark:text-white",
        ],
      },
      
      // 📏 SIZE VARIANTS - DASHBOARD OPTIMIZED
      size: {
        sm: "p-3 rounded-lg",
        md: "p-4 rounded-xl", 
        lg: "p-6 rounded-2xl",
        xl: "p-8 rounded-3xl",
        
        // DASHBOARD SPECIFIC SIZES
        "kpi-compact": "p-3 rounded-lg min-h-[120px]",
        "widget-standard": "p-4 rounded-xl min-h-[200px]",
        "metric-large": "p-6 rounded-2xl min-h-[300px]",
        "executive-full": "p-8 rounded-3xl min-h-[400px]",
      },
      
      // ✨ ANIMATION VARIANTS
      animation: {
        none: "",
        subtle: "transition-all duration-200 ease-out",
        smooth: "transition-all duration-300 ease-out", 
        premium: "transition-all duration-500 ease-out",
        bounce: "transition-all duration-300 ease-out hover:animate-pulse",
      },
      
      // 🎭 INTERACTION STATES
      interactive: {
        none: "",
        hover: "cursor-pointer",
        clickable: "cursor-pointer active:scale-[0.98]",
        draggable: "cursor-move",
      },
    },
    defaultVariants: {
      variant: "dashboard",
      size: "md", 
      animation: "smooth",
      interactive: "none",
    },
  }
);

// 📋 CARD HEADER VARIANTS - APPLE-STYLE SOPHISTICATION  
const cardHeaderVariants = cva(
  "relative",
  {
    variants: {
      variant: {
        executive: "px-6 py-4 border-b border-white/10 dark:border-slate-700/50 bg-gradient-to-r from-transparent to-white/5",
        analytics: "px-5 py-4 border-b border-slate-200/50 dark:border-slate-700/50",
        finance: "px-5 py-4 border-b border-emerald-200/30 dark:border-emerald-800/30 bg-emerald-50/20 dark:bg-emerald-950/10",
        kpi: "px-4 py-3 border-b border-slate-200/30 dark:border-slate-700/30",
        dashboard: "px-5 py-4 border-b border-slate-200/40 dark:border-slate-700/40", 
        minimal: "px-4 py-3 border-b border-slate-200/20 dark:border-slate-700/20",
      },
      size: {
        sm: "px-3 py-2",
        md: "px-4 py-3", 
        lg: "px-6 py-4",
        xl: "px-8 py-6",
      },
    },
    defaultVariants: {
      variant: "dashboard",
      size: "md",
    },
  }
);

// 🎯 CARD CONTENT VARIANTS - OPTIMIZED LAYOUTS
const cardContentVariants = cva(
  "relative",
  {
    variants: {
      variant: {
        executive: "px-6 py-5",
        analytics: "px-5 py-4", 
        finance: "px-5 py-4",
        kpi: "px-4 py-3 flex items-center justify-center",
        dashboard: "px-5 py-4",
        minimal: "px-4 py-3",
      },
      size: {
        sm: "px-3 py-2",
        md: "px-4 py-3",
        lg: "px-6 py-4", 
        xl: "px-8 py-6",
      },
    },
    defaultVariants: {
      variant: "dashboard",
      size: "md", 
    },
  }
);

// 🏁 CARD FOOTER VARIANTS - SOPHISTICATED ACTIONS
const cardFooterVariants = cva(
  "relative",
  {
    variants: {
      variant: {
        executive: "px-6 py-4 border-t border-white/10 dark:border-slate-700/50 bg-gradient-to-r from-transparent to-white/5",
        analytics: "px-5 py-4 border-t border-slate-200/50 dark:border-slate-700/50",
        finance: "px-5 py-4 border-t border-emerald-200/30 dark:border-emerald-800/30 bg-emerald-50/20 dark:bg-emerald-950/10",
        kpi: "px-4 py-3 border-t border-slate-200/30 dark:border-slate-700/30",
        dashboard: "px-5 py-4 border-t border-slate-200/40 dark:border-slate-700/40",
        minimal: "px-4 py-3 border-t border-slate-200/20 dark:border-slate-700/20",
      },
      size: {
        sm: "px-3 py-2",
        md: "px-4 py-3",
        lg: "px-6 py-4",
        xl: "px-8 py-6", 
      },
    },
    defaultVariants: {
      variant: "dashboard",
      size: "md",
    },
  }
);

// 🏷️ TYPESCRIPT INTERFACES - ENTERPRISE GRADE
export interface CardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /**
   * Business variant for specific dashboard contexts
   * @default "dashboard"
   */
  variant?: "executive" | "analytics" | "finance" | "kpi" | "dashboard" | "minimal";
  
  /**
   * Theme variant for visual consistency 
   * @default undefined
   */
  theme?: "apple-glass" | "dark-executive" | "light-premium" | "high-contrast";
  
  /**
   * Size variant for different container needs
   * @default "md"
   */
  size?: "sm" | "md" | "lg" | "xl" | "kpi-compact" | "widget-standard" | "metric-large" | "executive-full";
  
  /**
   * Animation style for interactions
   * @default "smooth"
   */
  animation?: "none" | "subtle" | "smooth" | "premium" | "bounce";
  
  /**
   * Interactive behavior
   * @default "none"
   */
  interactive?: "none" | "hover" | "clickable" | "draggable";
  
  /**
   * Apple-style glass effect overlay
   * @default false
   */
  glassEffect?: boolean;
  
  /**
   * Premium gradient background
   * @default false
   */
  gradientBg?: boolean;
  
  /**
   * Accessibility optimizations
   * @default false
   */
  highContrast?: boolean;
  
  /**
   * Performance mode (reduced animations)
   * @default false
   */
  performanceMode?: boolean;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "executive" | "analytics" | "finance" | "kpi" | "dashboard" | "minimal";
  size?: "sm" | "md" | "lg" | "xl";
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "executive" | "analytics" | "finance" | "kpi" | "dashboard" | "minimal";  
  size?: "sm" | "md" | "lg" | "xl";
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "executive" | "analytics" | "finance" | "kpi" | "dashboard" | "minimal";
  size?: "sm" | "md" | "lg" | "xl";
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * Heading level for semantic HTML
   * @default "h3"
   */
  level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  
  /**
   * Visual style variant
   * @default "default"
   */
  variant?: "default" | "executive" | "kpi" | "minimal";
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /**
   * Text style variant
   * @default "default"
   */
  variant?: "default" | "muted" | "executive" | "minimal";
}

// 🃏 MAIN CARD COMPONENT - PATTERN TRIPLE ⭐⭐⭐⭐⭐
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = "dashboard",
    theme,
    size = "md", 
    animation = "smooth",
    interactive = "none",
    glassEffect = false,
    gradientBg = false,
    highContrast = false,
    performanceMode = false,
    children,
    ...props 
  }, ref) => {
    
    // 🎨 DYNAMIC CLASS COMPOSITION
    const cardClasses = twMerge(
      cardVariants({ 
        variant, 
        size, 
        animation: performanceMode ? "none" : animation,
        interactive 
      }),
      
      // THEME OVERRIDES
      theme && cardVariants({ theme } as any),
      
      // GLASS EFFECT
      glassEffect && [
        "backdrop-blur-xl backdrop-saturate-150",
        "bg-white/80 dark:bg-slate-900/80",
        "border-white/30 dark:border-white/10",
      ],
      
      // GRADIENT BACKGROUND
      gradientBg && [
        "bg-gradient-to-br from-white via-slate-50/50 to-white",
        "dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900",
      ],
      
      // HIGH CONTRAST MODE
      highContrast && [
        "bg-white dark:bg-black",
        "border-slate-900 dark:border-white", 
        "text-slate-900 dark:text-white",
        "shadow-lg shadow-slate-900/20 dark:shadow-white/20",
      ],
      
      className
    );

    return (
      <div
        ref={ref}
        className={cardClasses}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

// 📋 CARD HEADER COMPONENT - PREMIUM HEADERS
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, variant = "dashboard", size = "md", ...props }, ref) => (
    <div
      ref={ref}
      className={twMerge(cardHeaderVariants({ variant, size }), className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

// 🎯 CARD TITLE COMPONENT - SEMANTIC EXCELLENCE
const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, level = "h3", variant = "default", children, ...props }, ref) => {
    const Component = level;
    
    const titleClasses = twMerge(
      // BASE STYLES
      "font-semibold leading-tight tracking-tight",
      
      // VARIANT STYLES
      variant === "executive" && "text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent",
      variant === "kpi" && "text-2xl font-bold text-slate-900 dark:text-white",
      variant === "minimal" && "text-base font-medium text-slate-800 dark:text-slate-200",
      variant === "default" && "text-lg text-slate-900 dark:text-white",
      
      className
    );

    return (
      <Component
        ref={ref}
        className={titleClasses}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
CardTitle.displayName = "CardTitle";

// 📝 CARD DESCRIPTION COMPONENT - SOPHISTICATED TEXT
const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, variant = "default", ...props }, ref) => {
    
    const descriptionClasses = twMerge(
      // BASE STYLES
      "leading-relaxed",
      
      // VARIANT STYLES
      variant === "executive" && "text-sm text-slate-600 dark:text-slate-300 font-medium",
      variant === "muted" && "text-xs text-slate-500 dark:text-slate-400",
      variant === "minimal" && "text-sm text-slate-600 dark:text-slate-400",
      variant === "default" && "text-sm text-slate-600 dark:text-slate-300",
      
      className
    );

    return (
      <p
        ref={ref}
        className={descriptionClasses}
        {...props}
      />
    );
  }
);
CardDescription.displayName = "CardDescription";

// 🎯 CARD CONTENT COMPONENT - OPTIMIZED LAYOUTS
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, variant = "dashboard", size = "md", ...props }, ref) => (
    <div
      ref={ref}
      className={twMerge(cardContentVariants({ variant, size }), className)}
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";

// 🏁 CARD FOOTER COMPONENT - SOPHISTICATED ACTIONS
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, variant = "dashboard", size = "md", ...props }, ref) => (
    <div
      ref={ref}
      className={twMerge(cardFooterVariants({ variant, size }), className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

// 🚀 EXPORTS - PATTERN TRIPLE COMPLETE
export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  cardVariants,
  cardHeaderVariants,
  cardContentVariants, 
  cardFooterVariants,
};

/**
 * 🎯 USAGE EXAMPLES - APPLE-STYLE DASHBOARD
 * 
 * // EXECUTIVE KPI CARD
 * <Card variant="executive" size="kpi-compact" glassEffect>
 *   <CardContent variant="kpi">
 *     <CardTitle variant="kpi">€2.4M</CardTitle>
 *     <CardDescription variant="executive">Revenue YTD</CardDescription>
 *   </CardContent>
 * </Card>
 * 
 * // ANALYTICS DASHBOARD WIDGET
 * <Card variant="analytics" size="widget-standard" animation="premium">
 *   <CardHeader variant="analytics">
 *     <CardTitle variant="default">User Engagement</CardTitle>
 *     <CardDescription>Last 30 days analytics</CardDescription>
 *   </CardHeader>
 *   <CardContent variant="analytics">
 *     <LineChart data={engagementData} />
 *   </CardContent>
 * </Card>
 * 
 * // FINANCE METRICS CARD
 * <Card variant="finance" size="metric-large" gradientBg>
 *   <CardHeader variant="finance">
 *     <CardTitle variant="executive">Q3 Financial Overview</CardTitle>
 *   </CardHeader>
 *   <CardContent variant="finance">
 *     <FinancialChart />
 *   </CardContent>
 *   <CardFooter variant="finance">
 *     <Button variant="finance">View Details</Button>
 *   </CardFooter>
 * </Card>
 */