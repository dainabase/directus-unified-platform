"use client";

import * as React from "react";
import * as RCheckbox from "@radix-ui/react-checkbox";
import { twMerge } from "tailwind-merge";

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof RCheckbox.Root> {
  label?: string;
}

export function Checkbox({ className, label, ...props }: CheckboxProps) {
  return (
    <label className="inline-flex items-center gap-2">
      <RCheckbox.Root
        className={twMerge(
          "flex h-5 w-5 items-center justify-center rounded border border-border bg-white outline-none focus:ring-2 focus:ring-primary data-[state=checked]:border-primary",
          className
        )}
        {...props}
      >
        <RCheckbox.Indicator className="text-primary" aria-hidden>✓</RCheckbox.Indicator>
      </RCheckbox.Root>
      {label && <span className="text-sm text-neutral-900">{label}</span>}
    </label>
  );
}