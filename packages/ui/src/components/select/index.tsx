"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { twMerge } from "tailwind-merge";
import { cva, type VariantProps } from "class-variance-authority";

// 🎯 TYPES & INTERFACES - Enterprise Dashboard Support
export interface SelectItem {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  avatar?: string;
  category?: string;
  disabled?: boolean;
  badge?: string;
  metadata?: Record<string, any>;
}

export interface SelectGroup {
  label: string;
  items: SelectItem[];
}

export interface DashboardMetrics {
  totalItems: number;
  selectedCount: number;
  categories: string[];
  lastUpdated?: Date;
}

// 🎨 THEME SYSTEM - Executive Dashboard Themes
export const selectThemes = {
  default: {
    background: "bg-white dark:bg-neutral-900",
    border: "border-neutral-200 dark:border-neutral-800",
    text: "text-neutral-900 dark:text-neutral-100",
    accent: "focus:ring-blue-500 focus:border-blue-500",
  },
  executive: {
    background: "bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800",
    border: "border-slate-300 dark:border-slate-600",
    text: "text-slate-900 dark:text-slate-100",
    accent: "focus:ring-amber-500 focus:border-amber-500",
  },
  dashboard: {
    background: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-900 dark:text-blue-100",
    accent: "focus:ring-blue-600 focus:border-blue-600",
  },
  finance: {
    background: "bg-emerald-50 dark:bg-emerald-950",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-900 dark:text-emerald-100",
    accent: "focus:ring-emerald-600 focus:border-emerald-600",
  },
  analytics: {
    background: "bg-purple-50 dark:bg-purple-950",
    border: "border-purple-200 dark:border-purple-800",
    text: "text-purple-900 dark:text-purple-100",
    accent: "focus:ring-purple-600 focus:border-purple-600",
  },
  minimal: {
    background: "bg-gray-50 dark:bg-gray-900",
    border: "border-gray-200 dark:border-gray-700",
    text: "text-gray-900 dark:text-gray-100",
    accent: "focus:ring-gray-500 focus:border-gray-500",
  },
} as const;

export type SelectTheme = keyof typeof selectThemes;

// 🎭 VARIANT SYSTEM - Premium Dashboard Components
const selectVariants = cva(
  "relative flex items-center justify-between whitespace-nowrap rounded-lg border px-3 py-2 text-sm shadow-sm transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-8 px-2 text-xs",
        md: "h-9 px-3 text-sm",
        lg: "h-11 px-4 text-base",
        xl: "h-12 px-5 text-lg",
      },
      variant: {
        default: "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800",
        outline: "border-2 bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800",
        filled: "bg-neutral-100 dark:bg-neutral-800 border-transparent",
        ghost: "border-transparent shadow-none hover:bg-neutral-100 dark:hover:bg-neutral-800",
        premium: "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800",
        executive: "bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-950 dark:via-orange-950 dark:to-red-950 border-amber-200 dark:border-amber-800 shadow-lg",
      },
      state: {
        default: "",
        success: "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950",
        warning: "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950",
        error: "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950",
      },
      animation: {
        none: "",
        subtle: "hover:scale-[1.01] active:scale-[0.99]",
        smooth: "hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
        premium: "hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-200/50 dark:hover:shadow-blue-900/50 active:scale-[0.98]",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
      state: "default",
      animation: "subtle",
    },
  }
);

// 🔍 SEARCH & FILTERING ENGINE
const useSelectSearch = (items: SelectItem[], searchValue: string) => {
  return React.useMemo(() => {
    if (!searchValue) return items;
    
    const search = searchValue.toLowerCase();
    return items.filter(item => 
      item.label.toLowerCase().includes(search) ||
      item.value.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search) ||
      item.category?.toLowerCase().includes(search)
    );
  }, [items, searchValue]);
};

// 🚀 PERFORMANCE - Virtualization for Large Datasets
const useVirtualization = (items: SelectItem[], containerHeight = 200) => {
  const [visibleRange, setVisibleRange] = React.useState({ start: 0, end: 10 });
  const itemHeight = 40;
  const maxVisibleItems = Math.floor(containerHeight / itemHeight);

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(start + maxVisibleItems + 2, items.length);
    setVisibleRange({ start, end });
  }, [items.length, maxVisibleItems]);

  const visibleItems = React.useMemo(() => 
    items.slice(visibleRange.start, visibleRange.end)
  , [items, visibleRange]);

  return { visibleItems, handleScroll, totalHeight: items.length * itemHeight };
};

// 🏷️ MULTI-SELECT CHIP COMPONENT
const SelectChip: React.FC<{
  label: string;
  onRemove: () => void;
  variant?: "default" | "primary" | "success" | "warning" | "error";
}> = ({ label, onRemove, variant = "default" }) => {
  const chipVariants = {
    default: "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200",
    primary: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <span className={twMerge(
      "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200",
      chipVariants[variant],
      "hover:scale-105 active:scale-95"
    )}>
      {label}
      <button
        onClick={onRemove}
        className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
        aria-label={`Remove ${label}`}
      >
        ✕
      </button>
    </span>
  );
};

// 📊 DASHBOARD METRICS COMPONENT
const SelectMetrics: React.FC<{ metrics: DashboardMetrics }> = ({ metrics }) => (
  <div className="flex items-center gap-4 px-3 py-2 text-xs text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
    <span>Total: {metrics.totalItems}</span>
    <span>Selected: {metrics.selectedCount}</span>
    <span>Categories: {metrics.categories.length}</span>
    {metrics.lastUpdated && (
      <span className="ml-auto">
        Updated: {metrics.lastUpdated.toLocaleTimeString()}
      </span>
    )}
  </div>
);

// 🎯 ENHANCED SELECT PRIMITIVES
const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

// 🎨 PREMIUM SELECT TRIGGER - Apple-style Design
interface SelectTriggerProps 
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
    VariantProps<typeof selectVariants> {
  theme?: SelectTheme;
  showClearButton?: boolean;
  onClear?: () => void;
  isMulti?: boolean;
  selectedItems?: SelectItem[];
  onRemoveItem?: (value: string) => void;
  searchable?: boolean;
  placeholder?: string;
}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ 
  className, 
  children, 
  size, 
  variant, 
  state, 
  animation,
  theme = "default",
  showClearButton = false,
  onClear,
  isMulti = false,
  selectedItems = [],
  onRemoveItem,
  searchable = false,
  placeholder,
  ...props 
}, ref) => {
  const themeStyles = selectThemes[theme];
  
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={twMerge(
        selectVariants({ size, variant, state, animation }),
        themeStyles.background,
        themeStyles.border,
        themeStyles.text,
        "group relative overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {isMulti && selectedItems.length > 0 ? (
          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
            {selectedItems.map((item) => (
              <SelectChip
                key={item.value}
                label={item.label}
                onRemove={() => onRemoveItem?.(item.value)}
              />
            ))}
          </div>
        ) : (
          <span className="truncate">
            {children || <span className="text-neutral-500">{placeholder}</span>}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-1 ml-2">
        {showClearButton && onClear && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded p-1 transition-colors"
            aria-label="Clear selection"
          >
            ✕
          </button>
        )}
        
        <SelectPrimitive.Icon asChild>
          <div className="text-neutral-500 transition-transform duration-200 group-data-[state=open]:rotate-180">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </SelectPrimitive.Icon>
      </div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

// 🔍 SEARCH INPUT COMPONENT
const SelectSearch: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder = "Search..." }) => (
  <div className="p-2 border-b border-neutral-200 dark:border-neutral-800">
    <div className="relative">
      <svg 
        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-8 pr-3 py-2 text-sm bg-transparent border-none outline-none placeholder:text-neutral-400"
        autoComplete="off"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  </div>
);

// 🚀 ENHANCED SELECT CONTENT - Premium Animations
interface SelectContentProps 
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
  theme?: SelectTheme;
  showMetrics?: boolean;
  metrics?: DashboardMetrics;
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  virtualized?: boolean;
  maxHeight?: number;
}

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  SelectContentProps
>(({ 
  className, 
  children, 
  position = "popper",
  theme = "default",
  showMetrics = false,
  metrics,
  searchable = false,
  searchValue = "",
  onSearchChange,
  virtualized = false,
  maxHeight = 300,
  ...props 
}, ref) => {
  const themeStyles = selectThemes[theme];
  
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={twMerge(
          "relative z-[1050] min-w-[8rem] overflow-hidden rounded-xl border shadow-2xl",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          "backdrop-blur-xl bg-white/95 dark:bg-neutral-900/95",
          themeStyles.border,
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        {showMetrics && metrics && <SelectMetrics metrics={metrics} />}
        
        {searchable && (
          <SelectSearch
            value={searchValue}
            onChange={onSearchChange || (() => {})}
          />
        )}
        
        <SelectPrimitive.Viewport
          className={twMerge(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
          style={{ maxHeight }}
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
SelectContent.displayName = SelectPrimitive.Content.displayName;

// 🏷️ ENHANCED SELECT LABEL
const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={twMerge(
      "px-3 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider",
      className
    )}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

// 🎯 PREMIUM SELECT ITEM - Rich Content Support
interface SelectItemProps 
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
  icon?: React.ReactNode;
  description?: string;
  badge?: string;
  avatar?: string;
  isSelected?: boolean;
  isMulti?: boolean;
}

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  SelectItemProps
>(({ 
  className, 
  children, 
  icon, 
  description, 
  badge, 
  avatar,
  isSelected = false,
  isMulti = false,
  ...props 
}, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={twMerge(
      "relative flex items-center gap-3 rounded-lg py-2 px-3 text-sm outline-none cursor-pointer",
      "transition-all duration-200 ease-out",
      "focus:bg-blue-50 focus:text-blue-900 dark:focus:bg-blue-900/20 dark:focus:text-blue-100",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "hover:bg-neutral-50 dark:hover:bg-neutral-800/50",
      "group",
      className
    )}
    {...props}
  >
    {/* Icon or Avatar */}
    <div className="flex-shrink-0">
      {avatar ? (
        <img 
          src={avatar} 
          alt="" 
          className="w-6 h-6 rounded-full object-cover"
        />
      ) : icon ? (
        <span className="w-5 h-5 flex items-center justify-center text-neutral-500 group-focus:text-blue-600">
          {icon}
        </span>
      ) : null}
    </div>
    
    {/* Content */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <SelectPrimitive.ItemText className="truncate font-medium">
          {children}
        </SelectPrimitive.ItemText>
        {badge && (
          <span className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full">
            {badge}
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
          {description}
        </p>
      )}
    </div>
    
    {/* Selection Indicator */}
    <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        {isMulti ? (
          <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        ) : (
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </SelectPrimitive.ItemIndicator>
    </div>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

// 📏 SEPARATOR
const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={twMerge("mx-1 my-1 h-px bg-neutral-200 dark:bg-neutral-800", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

// ⬆️⬇️ SCROLL BUTTONS - Enhanced Design
const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={twMerge(
      "flex cursor-default items-center justify-center py-1 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors",
      className
    )}
    {...props}
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={twMerge(
      "flex cursor-default items-center justify-center py-1 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors",
      className
    )}
    {...props}
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

// 🎯 SPECIALIZED DASHBOARD VARIANTS

// 📊 Executive Dashboard Select
export const ExecutiveSelect: React.FC<{
  items: SelectItem[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ items, value, onValueChange, placeholder = "Select metric...", className }) => (
  <Select value={value} onValueChange={onValueChange}>
    <SelectTrigger 
      variant="executive" 
      theme="executive"
      animation="premium"
      className={className}
    >
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent theme="executive" className="min-w-[280px]">
      <SelectGroup>
        <SelectLabel>Executive Metrics</SelectLabel>
        {items.map((item) => (
          <SelectItem 
            key={item.value} 
            value={item.value}
            icon={item.icon}
            description={item.description}
            badge={item.badge}
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectGroup>
    </SelectContent>
  </Select>
);

// 💼 Team Member Select with Avatars
export const TeamSelect: React.FC<{
  members: SelectItem[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  isMulti?: boolean;
  selectedMembers?: SelectItem[];
  onRemoveMember?: (value: string) => void;
  className?: string;
}> = ({ 
  members, 
  value, 
  onValueChange, 
  placeholder = "Select team member...",
  isMulti = false,
  selectedMembers = [],
  onRemoveMember,
  className 
}) => (
  <Select value={value} onValueChange={onValueChange}>
    <SelectTrigger 
      variant="outline" 
      theme="default"
      isMulti={isMulti}
      selectedItems={selectedMembers}
      onRemoveItem={onRemoveMember}
      className={className}
    >
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent className="min-w-[320px]">
      <SelectGroup>
        <SelectLabel>Team Members</SelectLabel>
        {members.map((member) => (
          <SelectItem 
            key={member.value} 
            value={member.value}
            avatar={member.avatar}
            description={member.description}
            badge={member.badge}
            isMulti={isMulti}
          >
            {member.label}
          </SelectItem>
        ))}
      </SelectGroup>
    </SelectContent>
  </Select>
);

// 🔍 Advanced Multi-Filter Select
export const MultiFilterSelect: React.FC<{
  items: SelectItem[];
  selectedValues: string[];
  onValueChange: (values: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  showMetrics?: boolean;
  className?: string;
}> = ({ 
  items, 
  selectedValues, 
  onValueChange, 
  placeholder = "Select filters...",
  searchable = true,
  showMetrics = true,
  className 
}) => {
  const [searchValue, setSearchValue] = React.useState("");
  const filteredItems = useSelectSearch(items, searchValue);
  const selectedItems = items.filter(item => selectedValues.includes(item.value));
  
  const metrics: DashboardMetrics = {
    totalItems: items.length,
    selectedCount: selectedValues.length,
    categories: [...new Set(items.map(item => item.category).filter(Boolean))],
    lastUpdated: new Date(),
  };

  return (
    <Select>
      <SelectTrigger 
        variant="premium" 
        theme="dashboard"
        isMulti={true}
        selectedItems={selectedItems}
        onRemoveItem={(value) => onValueChange(selectedValues.filter(v => v !== value))}
        showClearButton={selectedValues.length > 0}
        onClear={() => onValueChange([])}
        className={className}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent 
        theme="dashboard"
        searchable={searchable}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        showMetrics={showMetrics}
        metrics={metrics}
        className="min-w-[400px]"
      >
        <SelectGroup>
          <SelectLabel>Available Filters</SelectLabel>
          {filteredItems.map((item) => (
            <SelectItem 
              key={item.value} 
              value={item.value}
              icon={item.icon}
              description={item.description}
              badge={item.badge}
              isMulti={true}
              isSelected={selectedValues.includes(item.value)}
              onClick={() => {
                const isSelected = selectedValues.includes(item.value);
                if (isSelected) {
                  onValueChange(selectedValues.filter(v => v !== item.value));
                } else {
                  onValueChange([...selectedValues, item.value]);
                }
              }}
            >
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

// 🌍 Country/Region Select with Flags
export const CountrySelect: React.FC<{
  countries: SelectItem[];
  value?: string;
  onValueChange?: (value: string) => void;
  searchable?: boolean;
  placeholder?: string;
  className?: string;
}> = ({ 
  countries, 
  value, 
  onValueChange, 
  searchable = true,
  placeholder = "Select country...",
  className 
}) => {
  const [searchValue, setSearchValue] = React.useState("");
  const filteredCountries = useSelectSearch(countries, searchValue);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger variant="outline" className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent 
        searchable={searchable}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        className="min-w-[280px]"
      >
        <SelectGroup>
          <SelectLabel>Countries & Regions</SelectLabel>
          {filteredCountries.map((country) => (
            <SelectItem 
              key={country.value} 
              value={country.value}
              icon={country.icon}
              description={country.description}
            >
              {country.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

// 💹 Finance KPI Select
export const FinanceSelect: React.FC<{
  kpis: SelectItem[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ kpis, value, onValueChange, placeholder = "Select KPI...", className }) => (
  <Select value={value} onValueChange={onValueChange}>
    <SelectTrigger 
      variant="filled" 
      theme="finance"
      animation="premium"
      className={className}
    >
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent theme="finance" className="min-w-[300px]">
      <SelectGroup>
        <SelectLabel>Financial KPIs</SelectLabel>
        {kpis.map((kpi) => (
          <SelectItem 
            key={kpi.value} 
            value={kpi.value}
            icon={kpi.icon}
            description={kpi.description}
            badge={kpi.badge}
          >
            {kpi.label}
          </SelectItem>
        ))}
      </SelectGroup>
    </SelectContent>
  </Select>
);

// 📈 Analytics Dashboard Select
export const AnalyticsSelect: React.FC<{
  metrics: SelectItem[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  virtualized?: boolean;
  className?: string;
}> = ({ 
  metrics, 
  value, 
  onValueChange, 
  placeholder = "Select metric...",
  virtualized = false,
  className 
}) => {
  const { visibleItems, handleScroll, totalHeight } = useVirtualization(metrics);
  const itemsToRender = virtualized && metrics.length > 100 ? visibleItems : metrics;

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger 
        variant="premium" 
        theme="analytics"
        animation="smooth"
        className={className}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent 
        theme="analytics" 
        virtualized={virtualized}
        maxHeight={400}
        className="min-w-[350px]"
      >
        <SelectGroup>
          <SelectLabel>Analytics Metrics</SelectLabel>
          <div 
            style={virtualized ? { height: totalHeight } : undefined}
            onScroll={virtualized ? handleScroll : undefined}
          >
            {itemsToRender.map((metric) => (
              <SelectItem 
                key={metric.value} 
                value={metric.value}
                icon={metric.icon}
                description={metric.description}
                badge={metric.badge}
              >
                {metric.label}
              </SelectItem>
            ))}
          </div>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

// 🏷️ Tag Creation Select
export const TagSelect: React.FC<{
  tags: SelectItem[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  onCreateTag?: (tag: string) => void;
  placeholder?: string;
  allowCreate?: boolean;
  className?: string;
}> = ({ 
  tags, 
  selectedTags, 
  onTagsChange, 
  onCreateTag,
  placeholder = "Select or create tags...",
  allowCreate = true,
  className 
}) => {
  const [searchValue, setSearchValue] = React.useState("");
  const filteredTags = useSelectSearch(tags, searchValue);
  const selectedItems = tags.filter(tag => selectedTags.includes(tag.value));
  
  const canCreateTag = allowCreate && searchValue && !tags.some(tag => 
    tag.label.toLowerCase() === searchValue.toLowerCase()
  );

  return (
    <Select>
      <SelectTrigger 
        variant="outline" 
        isMulti={true}
        selectedItems={selectedItems}
        onRemoveItem={(value) => onTagsChange(selectedTags.filter(tag => tag !== value))}
        showClearButton={selectedTags.length > 0}
        onClear={() => onTagsChange([])}
        className={className}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent 
        searchable={true}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        className="min-w-[320px]"
      >
        <SelectGroup>
          <SelectLabel>Available Tags</SelectLabel>
          
          {canCreateTag && (
            <SelectItem 
              value={`create:${searchValue}`}
              icon={<span>+</span>}
              onClick={() => {
                onCreateTag?.(searchValue);
                setSearchValue("");
              }}
            >
              Create "{searchValue}"
            </SelectItem>
          )}
          
          {filteredTags.map((tag) => (
            <SelectItem 
              key={tag.value} 
              value={tag.value}
              icon={tag.icon}
              isMulti={true}
              isSelected={selectedTags.includes(tag.value)}
              onClick={() => {
                const isSelected = selectedTags.includes(tag.value);
                if (isSelected) {
                  onTagsChange(selectedTags.filter(t => t !== tag.value));
                } else {
                  onTagsChange([...selectedTags, tag.value]);
                }
              }}
            >
              {tag.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

// 🚀 EXPORTS
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  // Specialized Components
  ExecutiveSelect,
  TeamSelect,
  MultiFilterSelect,
  CountrySelect,
  FinanceSelect,
  AnalyticsSelect,
  TagSelect,
  // Utility Components
  SelectChip,
  SelectMetrics,
  SelectSearch,
  // Hooks & Utils
  useSelectSearch,
  useVirtualization,
  // Types
  type SelectItem,
  type SelectGroup as SelectGroupType,
  type DashboardMetrics,
  type SelectTheme,
  type SelectTriggerProps,
  type SelectContentProps,
  type SelectItemProps,
  // Themes & Variants
  selectThemes,
  selectVariants,
};