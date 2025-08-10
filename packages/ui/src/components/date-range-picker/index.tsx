import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "../../lib/utils";
import { Button } from "../button";
import { Calendar } from "../calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";

interface DateRangePickerProps {
  className?: string;
  date?: DateRange;
  onDateChange?: (date: DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DateRangePicker({
  className,
  date,
  onDateChange,
  placeholder = "Pick a date range",
  disabled = false,
}: DateRangePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<DateRange | undefined>(date);

  React.useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  const handleSelect = (newDate: DateRange | undefined) => {
    setSelectedDate(newDate);
    onDateChange?.(newDate);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate?.from ? (
              selectedDate.to ? (
                <>
                  {format(selectedDate.from, "LLL dd, y")} -{" "}
                  {format(selectedDate.to, "LLL dd, y")}
                </>
              ) : (
                format(selectedDate.from, "LLL dd, y")
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-background border rounded-md shadow-md"
          align="start"
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={selectedDate?.from}
            selected={selectedDate}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

DateRangePicker.displayName = "DateRangePicker";

export { DateRangePicker as default };
