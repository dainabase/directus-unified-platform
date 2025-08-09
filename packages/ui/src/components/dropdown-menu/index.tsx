"use client";

import * as React from "react";
import * as RDM from "@radix-ui/react-dropdown-menu";
import { twMerge } from "tailwind-merge";

export const DropdownMenu = RDM.Root;
export const DropdownMenuTrigger = RDM.Trigger;

export function DropdownMenuContent({ className, ...props }: React.ComponentPropsWithoutRef<typeof RDM.Content>) {
  return (
    <RDM.Portal>
      <RDM.Content
        sideOffset={6}
        className={twMerge(
          "z-[1050] min-w-[180px] rounded-lg border border-border bg-white p-1 shadow-lg",
          className
        )}
        {...props}
      />
    </RDM.Portal>
  );
}

export function DropdownMenuItem({ className, ...props }: React.ComponentPropsWithoutRef<typeof RDM.Item>) {
  return (
    <RDM.Item
      className={twMerge(
        "flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-2 text-sm outline-none data-[highlighted]:bg-neutral-100",
        className
      )}
      {...props}
    />
  );
}