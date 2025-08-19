import * as React from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";
import { VariantProps, cva } from "class-variance-authority";

// ===============================
// 🎯 ENTERPRISE INPUT THEMES SYSTEM
// ===============================

const inputThemes = {
  // 🎯 Executive Theme - C-level sophistication
  executive: {
    base: "bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-blue-900/20",
    border: "border-2 border-blue-200/50 dark:border-blue-800/50",
    focus: "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20",
    text: "text-slate-800 dark:text-slate-100",
    placeholder: "placeholder:text-slate-500 dark:placeholder:text-slate-400"
  },
  
  // 📊 Dashboard Theme - Business intelligence focused
  dashboard: {
    base: "bg-white dark:bg-slate-900",
    border: "border border-slate-300 dark:border-slate-700",
    focus: "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30",
    text: "text-slate-900 dark:text-slate-50",
    placeholder: "placeholder:text-slate-500"
  },
  
  // 💰 Finance Theme - Financial operations styling
  finance: {
    base: "bg-gradient-to-r from-emerald-50/50 to-green-50/30 dark:from-emerald-950/30 dark:to-green-950/20",
    border: "border-2 border-emerald-200 dark:border-emerald-800",
    focus: "focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/25",
    text: "text-emerald-900 dark:text-emerald-100",
    placeholder: "placeholder:text-emerald-600 dark:placeholder:text-emerald-400"
  },
  
  // 📈 Analytics Theme - Data science operations
  analytics: {
    base: "bg-gradient-to-r from-purple-50/50 to-violet-50/30 dark:from-purple-950/30 dark:to-violet-950/20",
    border: "border-2 border-purple-200 dark:border-purple-800",
    focus: "focus:border-purple-500 focus:ring-3 focus:ring-purple-500/25",
    text: "text-purple-900 dark:text-purple-100",
    placeholder: "placeholder:text-purple-600 dark:placeholder:text-purple-400"
  },
  
  // 🎨 Minimal Theme - Clean modern design
  minimal: {
    base: "bg-gray-50/50 dark:bg-gray-900/50",
    border: "border border-gray-200 dark:border-gray-700",
    focus: "focus:border-gray-400 focus:ring-1 focus:ring-gray-400/20",
    text: "text-gray-900 dark:text-gray-100",
    placeholder: "placeholder:text-gray-500"
  },
  
  // 🔹 Default Theme - Versatile enterprise
  default: {
    base: "bg-white dark:bg-neutral-900",
    border: "border border-border dark:border-neutral-800",
    focus: "focus:border-neutral-400 focus:ring-2 focus:ring-neutral-400/20",
    text: "text-neutral-900 dark:text-neutral-100",
    placeholder: "placeholder:text-neutral-500"
  }
} as const;

// ===============================
// 🎭 INPUT VARIANTS SYSTEM
// ===============================

const inputVariants = cva([
  // Base styles
  "flex h-10 w-full rounded-lg px-3 py-2 text-sm transition-all duration-200",
  "file:border-0 file:bg-transparent file:text-sm file:font-medium",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "focus-visible:outline-none",
  
  // Animation and interaction
  "transform transition-all duration-200 ease-in-out",
  "hover:scale-[1.01] focus:scale-[1.02]",
  
  // Accessibility
  "focus:outline-none focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900"
], {
  variants: {
    variant: {
      // 🎯 Primary - Main input style
      primary: "shadow-sm",
      
      // 🎯 Secondary - Alternative styling
      secondary: "shadow-inner",
      
      // 💼 Executive - C-level styling
      executive: "shadow-lg shadow-blue-500/10",
      
      // 📊 Dashboard - Business forms
      dashboard: "shadow-md",
      
      // 💰 Finance - Financial input styling
      finance: "shadow-lg shadow-emerald-500/10",
      
      // 📈 Analytics - Data input styling
      analytics: "shadow-lg shadow-purple-500/10",
      
      // ⚠️ Error - Validation error state
      error: "shadow-md shadow-red-500/20 border-red-500 focus:border-red-600 focus:ring-red-500/30",
      
      // ✅ Success - Validation success state
      success: "shadow-md shadow-green-500/20 border-green-500 focus:border-green-600 focus:ring-green-500/30",
      
      // 👻 Ghost - Minimal styling
      ghost: "shadow-none border-0 bg-transparent",
      
      // 📝 Outline - Outlined style
      outline: "bg-transparent shadow-none",
      
      // 🔗 Link - Link-like input
      link: "shadow-none border-0 bg-transparent underline-offset-4 hover:underline",
      
      // 🎯 Icon - With icon styling
      icon: "pl-10 shadow-sm",
      
      // 🎈 Floating - Floating label style
      floating: "pt-6 pb-2 shadow-md"
    },
    
    size: {
      sm: "h-8 px-2 text-xs",
      default: "h-10 px-3 text-sm",
      lg: "h-12 px-4 text-base",
      xl: "h-14 px-5 text-lg"
    },
    
    theme: {
      executive: "",
      dashboard: "",
      finance: "",
      analytics: "",
      minimal: "",
      default: ""
    }
  },
  defaultVariants: {
    variant: "primary",
    size: "default",
    theme: "default"
  }
});

// ===============================
// 🎨 ICON SYSTEM
// ===============================

const IconComponents = {
  // Basic icons
  user: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  
  email: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  
  search: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  
  lock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  
  // Business icons
  briefcase: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 002 2v1M8 6v2a2 2 0 002 2v1m0 0H8m4 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-4z" />
    </svg>
  ),
  
  chartBar: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  
  currency: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  
  // Status icons
  check: () => (
    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  
  exclamation: () => (
    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  
  loading: () => (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  )
} as const;

// ===============================
// 🎯 VALIDATION SYSTEM
// ===============================

interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

const validationRules = {
  required: (message = "This field is required"): ValidationRule => ({
    test: (value) => value.trim().length > 0,
    message
  }),
  
  email: (message = "Please enter a valid email address"): ValidationRule => ({
    test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message
  }),
  
  minLength: (min: number, message?: string): ValidationRule => ({
    test: (value) => value.length >= min,
    message: message || `Must be at least ${min} characters long`
  }),
  
  maxLength: (max: number, message?: string): ValidationRule => ({
    test: (value) => value.length <= max,
    message: message || `Must be no more than ${max} characters long`
  }),
  
  pattern: (regex: RegExp, message: string): ValidationRule => ({
    test: (value) => regex.test(value),
    message
  }),
  
  // Business validation rules
  phoneNumber: (message = "Please enter a valid phone number"): ValidationRule => ({
    test: (value) => /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, "")),
    message
  }),
  
  currency: (message = "Please enter a valid amount"): ValidationRule => ({
    test: (value) => /^\d+(\.\d{1,2})?$/.test(value),
    message
  }),
  
  alphanumeric: (message = "Only letters and numbers are allowed"): ValidationRule => ({
    test: (value) => /^[a-zA-Z0-9]+$/.test(value),
    message
  })
};

// ===============================
// 🎯 MAIN INPUT INTERFACE
// ===============================

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  // Theme and styling
  theme?: keyof typeof inputThemes;
  
  // Icons and visual elements
  icon?: keyof typeof IconComponents;
  rightIcon?: keyof typeof IconComponents;
  
  // Validation
  validation?: ValidationRule[];
  showValidation?: boolean;
  validateOnChange?: boolean;
  
  // Labels and helpers
  label?: string;
  helperText?: string;
  errorText?: string;
  successText?: string;
  
  // Loading and status
  loading?: boolean;
  success?: boolean;
  
  // Container styling
  containerClassName?: string;
  labelClassName?: string;
  helperClassName?: string;
  
  // Callbacks
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
}

// ===============================
// 🎯 MAIN INPUT COMPONENT
// ===============================

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    variant,
    size,
    theme = "default",
    type = "text",
    icon,
    rightIcon,
    validation = [],
    showValidation = true,
    validateOnChange = true,
    label,
    helperText,
    errorText,
    successText,
    loading = false,
    success = false,
    containerClassName,
    labelClassName,
    helperClassName,
    onValidationChange,
    onChange,
    onBlur,
    value,
    defaultValue,
    ...props
  }, ref) => {
    // State management
    const [internalValue, setInternalValue] = useState(defaultValue || "");
    const [errors, setErrors] = useState<string[]>([]);
    const [touched, setTouched] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Use forwarded ref or internal ref
    const resolvedRef = (ref || inputRef) as React.MutableRefObject<HTMLInputElement>;
    
    // Get current value (controlled vs uncontrolled)
    const currentValue = value !== undefined ? value : internalValue;
    
    // Validation logic
    const validateValue = useCallback((val: string) => {
      const newErrors: string[] = [];
      
      validation.forEach(rule => {
        if (!rule.test(val)) {
          newErrors.push(rule.message);
        }
      });
      
      setErrors(newErrors);
      onValidationChange?.(newErrors.length === 0, newErrors);
      
      return newErrors.length === 0;
    }, [validation, onValidationChange]);
    
    // Handle value changes
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      
      if (value === undefined) {
        setInternalValue(newValue);
      }
      
      if (validateOnChange && (touched || newValue.length > 0)) {
        validateValue(newValue);
      }
      
      onChange?.(e);
    }, [value, validateOnChange, touched, validateValue, onChange]);
    
    // Handle blur events
    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);
      setIsFocused(false);
      
      if (showValidation) {
        validateValue(currentValue as string);
      }
      
      onBlur?.(e);
    }, [showValidation, validateValue, currentValue, onBlur]);
    
    // Handle focus events
    const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    }, [props]);
    
    // Determine current status
    const hasErrors = showValidation && touched && errors.length > 0;
    const isSuccess = success || (showValidation && touched && errors.length === 0 && currentValue);
    const statusVariant = hasErrors ? "error" : isSuccess ? "success" : variant;
    
    // Get theme styles
    const themeStyles = inputThemes[theme];
    
    // Build input classes
    const inputClasses = twMerge(
      inputVariants({ variant: statusVariant, size, theme }),
      themeStyles.base,
      themeStyles.border,
      themeStyles.focus,
      themeStyles.text,
      themeStyles.placeholder,
      
      // Icon padding adjustments
      icon && "pl-10",
      rightIcon && "pr-10",
      
      // Loading state
      loading && "pr-10",
      
      className
    );
    
    // Render icon
    const renderIcon = (iconName: keyof typeof IconComponents, position: "left" | "right") => {
      const IconComponent = IconComponents[iconName];
      const positionClasses = position === "left" 
        ? "left-3 top-1/2 -translate-y-1/2" 
        : "right-3 top-1/2 -translate-y-1/2";
      
      return (
        <div className={`absolute ${positionClasses} pointer-events-none z-10`}>
          <IconComponent />
        </div>
      );
    };
    
    return (
      <div className={twMerge("w-full", containerClassName)}>
        {/* Label */}
        {label && (
          <label 
            className={twMerge(
              "block text-sm font-medium mb-2",
              themeStyles.text,
              isFocused && "text-blue-600 dark:text-blue-400",
              labelClassName
            )}
            htmlFor={props.id}
          >
            {label}
            {validation.some(rule => rule.test === validationRules.required().test) && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
        )}
        
        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {icon && renderIcon(icon, "left")}
          
          {/* Input Element */}
          <input
            ref={resolvedRef}
            type={type}
            className={inputClasses}
            value={currentValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            {...props}
          />
          
          {/* Right Icon or Status */}
          {loading ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <IconComponents.loading />
            </div>
          ) : rightIcon ? (
            renderIcon(rightIcon, "right")
          ) : isSuccess ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <IconComponents.check />
            </div>
          ) : hasErrors ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <IconComponents.exclamation />
            </div>
          ) : null}
        </div>
        
        {/* Helper Text / Error / Success Messages */}
        {showValidation && (
          <div className="mt-1 min-h-[1.25rem]">
            {hasErrors ? (
              <p className={twMerge("text-sm text-red-600 dark:text-red-400", helperClassName)}>
                {errorText || errors[0]}
              </p>
            ) : isSuccess && successText ? (
              <p className={twMerge("text-sm text-green-600 dark:text-green-400", helperClassName)}>
                {successText}
              </p>
            ) : helperText ? (
              <p className={twMerge("text-sm text-gray-600 dark:text-gray-400", helperClassName)}>
                {helperText}
              </p>
            ) : null}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// ===============================
// 🎯 SPECIALIZED INPUT COMPONENTS
// ===============================

// Executive Input - For C-level interfaces
const ExecutiveInput = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => (
    <Input
      ref={ref}
      theme="executive"
      variant="executive"
      size="lg"
      {...props}
    />
  )
);
ExecutiveInput.displayName = "ExecutiveInput";

// Validation Input - With comprehensive validation
const ValidationInput = React.forwardRef<HTMLInputElement, InputProps & {
  validationType?: "email" | "phone" | "currency" | "alphanumeric";
}>(({ validationType, validation = [], ...props }, ref) => {
  const typeValidation = React.useMemo(() => {
    const rules = [...validation];
    
    switch (validationType) {
      case "email":
        rules.push(validationRules.email());
        break;
      case "phone":
        rules.push(validationRules.phoneNumber());
        break;
      case "currency":
        rules.push(validationRules.currency());
        break;
      case "alphanumeric":
        rules.push(validationRules.alphanumeric());
        break;
    }
    
    return rules;
  }, [validationType, validation]);
  
  return (
    <Input
      ref={ref}
      validation={typeValidation}
      showValidation
      validateOnChange
      {...props}
    />
  );
});
ValidationInput.displayName = "ValidationInput";

// Analytics Input - For data science operations
const AnalyticsInput = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => (
    <Input
      ref={ref}
      theme="analytics"
      variant="analytics"
      icon="chartBar"
      {...props}
    />
  )
);
AnalyticsInput.displayName = "AnalyticsInput";

// Finance Input - For financial operations
const FinanceInput = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => (
    <Input
      ref={ref}
      theme="finance"
      variant="finance"
      icon="currency"
      {...props}
    />
  )
);
FinanceInput.displayName = "FinanceInput";

// ===============================
// 🎯 EXPORTS
// ===============================

export { 
  Input,
  ExecutiveInput,
  ValidationInput,
  AnalyticsInput,
  FinanceInput,
  inputVariants,
  validationRules,
  type ValidationRule
};