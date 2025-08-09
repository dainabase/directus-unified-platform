"use client";

import * as React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "../calendar";
import { Button } from "../button";
import * as Popover from "@radix-ui/react-popover";
import { twMerge } from "tailwind-merge";

export interface DatePickerProps {
  value?: Date;
  onChange?: (date?: Date) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Sélectionner une date",
  className,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          className={twMerge(
            "w-[260px] justify-start text-left font-normal",
            !value && "text-neutral-500",
            className
          )}
          disabled={disabled}
        >
          <span className="mr-2">📅</span>
          {value ? format(value, "dd MMM yyyy", { locale: fr }) : placeholder}
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-[1050] w-auto rounded-lg border border-border bg-white dark:bg-neutral-900 dark:border-neutral-800 p-2 shadow-lg"
          align="start"
        >
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange?.(date);
              setOpen(false);
            }}
            initialFocus
            locale={fr}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}