"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Button } from "../button";
import { twMerge } from "tailwind-merge";

export interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
}

export function DatePicker({ value, onChange, placeholder = "Choisir une date" }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Date | undefined>(value ?? undefined);

  React.useEffect(() => setSelected(value ?? undefined), [value]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button variant="outline">
          {selected ? selected.toLocaleDateString() : placeholder}
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className={twMerge(
            "z-[1050] rounded-lg border border-border bg-white p-2 shadow-lg"
          )}
        >
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(d) => {
              setSelected(d ?? undefined);
              onChange?.(d ?? null);
              setOpen(false);
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export interface DateRangePickerProps {
  value?: DateRange | undefined;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Choisir une période",
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [range, setRange] = React.useState<DateRange | undefined>(value);

  React.useEffect(() => setRange(value), [value]);

  const label =
    range?.from && range?.to
      ? `${range.from.toLocaleDateString()} → ${range.to.toLocaleDateString()}`
      : placeholder;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button variant="outline">{label}</Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="z-[1050] rounded-lg border border-border bg-white p-2 shadow-lg">
          <DayPicker
            mode="range"
            selected={range}
            onSelect={(r) => {
              setRange(r);
              onChange?.(r);
            }}
            numberOfMonths={2}
          />
          <div className="flex justify-end gap-2 p-2">
            <Button variant="ghost" onClick={() => setRange(undefined)}>
              Effacer
            </Button>
            <Button onClick={() => setOpen(false)}>OK</Button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}