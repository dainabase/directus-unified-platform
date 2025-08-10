import type { Meta, StoryObj } from "@storybook/react";
import { Calendar } from "./calendar";
import * as React from "react";

const meta = {
  title: "Components/Calendar",
  component: Calendar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    mode: {
      control: "select",
      options: ["single", "multiple", "range"],
      description: "Selection mode for the calendar",
    },
    showOutsideDays: {
      control: "boolean",
      description: "Show days outside the current month",
    },
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    mode: "single",
    showOutsideDays: true,
  },
  render: (args) => {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    return (
      <Calendar
        {...args}
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
    );
  },
};

export const SingleSelection: Story = {
  args: {
    mode: "single",
  },
  render: (args) => {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    return (
      <div className="space-y-4">
        <Calendar
          {...args}
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
        <p className="text-sm text-muted-foreground">
          Selected date: {date?.toLocaleDateString()}
        </p>
      </div>
    );
  },
};

export const MultipleSelection: Story = {
  args: {
    mode: "multiple",
  },
  render: (args) => {
    const [dates, setDates] = React.useState<Date[] | undefined>([]);
    return (
      <div className="space-y-4">
        <Calendar
          {...args}
          selected={dates}
          onSelect={setDates}
          className="rounded-md border"
        />
        <div className="text-sm text-muted-foreground">
          <p>Selected dates:</p>
          <ul className="list-disc list-inside">
            {dates?.map((date) => (
              <li key={date.toISOString()}>{date.toLocaleDateString()}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  },
};

export const RangeSelection: Story = {
  args: {
    mode: "range",
  },
  render: (args) => {
    const [dateRange, setDateRange] = React.useState<
      { from: Date | undefined; to?: Date | undefined } | undefined
    >({ from: undefined, to: undefined });

    return (
      <div className="space-y-4">
        <Calendar
          {...args}
          selected={dateRange}
          onSelect={setDateRange}
          className="rounded-md border"
        />
        <p className="text-sm text-muted-foreground">
          {dateRange?.from && (
            <>
              From: {dateRange.from.toLocaleDateString()}
              {dateRange.to && (
                <> to {dateRange.to.toLocaleDateString()}</>
              )}
            </>
          )}
        </p>
      </div>
    );
  },
};

export const DisabledDates: Story = {
  args: {
    mode: "single",
    disabled: [
      { from: new Date(2025, 7, 1), to: new Date(2025, 7, 5) },
      new Date(2025, 7, 15),
    ],
  },
  render: (args) => {
    const [date, setDate] = React.useState<Date | undefined>();
    return (
      <div className="space-y-4">
        <Calendar
          {...args}
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
        <p className="text-sm text-muted-foreground">
          Some dates in August are disabled
        </p>
      </div>
    );
  },
};

export const WithFooter: Story = {
  args: {
    mode: "single",
  },
  render: (args) => {
    const [date, setDate] = React.useState<Date | undefined>();
    return (
      <div className="rounded-md border">
        <Calendar
          {...args}
          selected={date}
          onSelect={setDate}
        />
        <div className="border-t p-3 flex justify-between">
          <button
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setDate(undefined)}
          >
            Clear
          </button>
          <button
            className="text-sm text-primary hover:text-primary/80"
            onClick={() => setDate(new Date())}
          >
            Today
          </button>
        </div>
      </div>
    );
  },
};
