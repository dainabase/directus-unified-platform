"use client";

import * as React from "react";
import * as RSwitch from "@radix-ui/react-switch";
import { twMerge } from "tailwind-merge";

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof RSwitch.Root> {
  label?: string;
}

export function Switch({ className, label, ...props }: SwitchProps) {
  return (
    <label className="inline-flex items-center gap-2">
      <RSwitch.Root
        className={twMerge(
          "relative h-6 w-10 cursor-pointer rounded-full bg-neutral-300 outline-none data-[state=checked]:bg-primary",
          className
        )}
        {...props}
      >
        <RSwitch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[22px]" />
      </RSwitch.Root>
      {label && <span className="text-sm text-neutral-900">{label}</span>}
    </label>
  );
}