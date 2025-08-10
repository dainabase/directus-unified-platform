import type { Meta, StoryObj } from "@storybook/react";
import { DateRangePicker } from "./date-range-picker";
import * as React from "react";
import { DateRange } from "react-day-picker";

const meta = {
  title: "Components/DateRangePicker",
  component: DateRangePicker,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    placeholder: {
      control: "text",
      description: "Placeholder text when no date is selected",
    },
    numberOfMonths: {
      control: { type: "number", min: 1, max: 3 },
      description: "Number of months to display in the calendar",
    },
  },
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Select date range",
    numberOfMonths: 2,
  },
  render: (args) => {
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
    return (
      <div className="w-[300px]">
        <DateRangePicker
          {...args}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>
    );
  },
};

export const WithPreselectedRange: Story = {
  args: {
    numberOfMonths: 2,
  },
  render: (args) => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
      from: weekAgo,
      to: today,
    });

    return (
      <div className="w-[300px]">
        <DateRangePicker
          {...args}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
        <p className="mt-4 text-sm text-muted-foreground">
          Selected: {dateRange?.from?.toLocaleDateString()} - {dateRange?.to?.toLocaleDateString()}
        </p>
      </div>
    );
  },
};

export const SingleMonth: Story = {
  args: {
    placeholder: "Pick a date range",
    numberOfMonths: 1,
  },
  render: (args) => {
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
    return (
      <div className="w-[300px]">
        <DateRangePicker
          {...args}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>
    );
  },
};

export const TripleMonth: Story = {
  args: {
    placeholder: "Select your vacation dates",
    numberOfMonths: 3,
  },
  render: (args) => {
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
    return (
      <div className="w-[350px]">
        <DateRangePicker
          {...args}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>
    );
  },
};

export const WithDisabledDates: Story = {
  args: {
    numberOfMonths: 2,
  },
  render: (args) => {
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
    
    // Disable weekends
    const isWeekend = (date: Date) => {
      const day = date.getDay();
      return day === 0 || day === 6;
    };

    return (
      <div className="w-[300px]">
        <DateRangePicker
          {...args}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          disabled={isWeekend}
        />
        <p className="mt-4 text-sm text-muted-foreground">
          Weekends are disabled
        </p>
      </div>
    );
  },
};

export const InForm: Story = {
  render: () => {
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
    const [submitted, setSubmitted] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitted(true);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4 w-[400px]">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Booking Period
          </label>
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            placeholder="Select check-in and check-out dates"
          />
        </div>
        
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Submit Booking
        </button>

        {submitted && dateRange && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              Booking submitted for:{" "}
              {dateRange.from?.toLocaleDateString()} -{" "}
              {dateRange.to?.toLocaleDateString()}
            </p>
          </div>
        )}
      </form>
    );
  },
};

export const MultipleRangePickers: Story = {
  render: () => {
    const [compareRange1, setCompareRange1] = React.useState<DateRange | undefined>();
    const [compareRange2, setCompareRange2] = React.useState<DateRange | undefined>();

    return (
      <div className="space-y-4 w-[400px]">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Period 1
          </label>
          <DateRangePicker
            dateRange={compareRange1}
            onDateRangeChange={setCompareRange1}
            placeholder="Select first period"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">
            Period 2
          </label>
          <DateRangePicker
            dateRange={compareRange2}
            onDateRangeChange={setCompareRange2}
            placeholder="Select second period"
          />
        </div>

        {compareRange1 && compareRange2 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800 font-medium mb-2">
              Comparison Results:
            </p>
            <p className="text-sm text-blue-700">
              Period 1: {compareRange1.from?.toLocaleDateString()} - {compareRange1.to?.toLocaleDateString()}
            </p>
            <p className="text-sm text-blue-700">
              Period 2: {compareRange2.from?.toLocaleDateString()} - {compareRange2.to?.toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    );
  },
};
