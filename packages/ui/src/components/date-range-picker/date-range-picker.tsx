import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "../lib/utils";
import { Button } from "../button";
import { Calendar } from "../calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../popover";

export interface DateRangePickerProps {
  /**
   * The selected date range
   */
  dateRange?: DateRange;
  /**
   * Callback when date range is selected
   */
  onDateRangeChange?: (range: DateRange | undefined) => void;
  /**
   * Placeholder text when no date is selected
   */
  placeholder?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Number of months to show
   */
  numberOfMonths?: number;
  /**
   * Disable specific dates
   */
  disabled?: Date[] | ((date: Date) => boolean);
}

/**
 * DateRangePicker component for selecting a date range
 * 
 * @example
 * ```tsx
 * <DateRangePicker
 *   dateRange={dateRange}
 *   onDateRangeChange={setDateRange}
 *   placeholder="Select date range"
 * />
 * ```
 */
export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  placeholder = "Pick a date range",
  className,
  numberOfMonths = 2,
  disabled,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (range: DateRange | undefined) => {
    onDateRangeChange?.(range);
    
    // Close popover when both dates are selected
    if (range?.from && range?.to) {
      setIsOpen(false);
    }
  };

  const formatDateRange = () => {
    if (!dateRange?.from) {
      return placeholder;
    }

    if (!dateRange.to) {
      return format(dateRange.from, "LLL dd, y");
    }

    return `${format(dateRange.from, "LLL dd, y")} - ${format(
      dateRange.to,
      "LLL dd, y"
    )}`;
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={handleSelect}
            numberOfMonths={numberOfMonths}
            disabled={disabled}
          />
          <div className="border-t p-3 flex justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                handleSelect(undefined);
                setIsOpen(false);
              }}
            >
              Clear
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const today = new Date();
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);
                handleSelect({ from: weekAgo, to: today });
                setIsOpen(false);
              }}
            >
              Last 7 days
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const today = new Date();
                const monthAgo = new Date(today);
                monthAgo.setMonth(today.getMonth() - 1);
                handleSelect({ from: monthAgo, to: today });
                setIsOpen(false);
              }}
            >
              Last 30 days
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

DateRangePicker.displayName = "DateRangePicker";
