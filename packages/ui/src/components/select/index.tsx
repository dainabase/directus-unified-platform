"use client";

import * as React from "react";
import * as RSelect from "@radix-ui/react-select";
import { twMerge } from "tailwind-merge";

export interface SelectProps extends RSelect.SelectProps {
  placeholder?: string;
  items: { label: string; value: string }[];
}

export function Select({ placeholder = "Sélectionner…", items, ...props }: SelectProps) {
  return (
    <RSelect.Root {...props}>
      <RSelect.Trigger
        className={twMerge(
          "inline-flex h-10 w-full items-center justify-between rounded-md border border-border bg-white px-3 text-left text-sm outline-none focus:ring-2 focus:ring-primary"
        )}
      >
        <RSelect.Value placeholder={placeholder} />
        <RSelect.Icon aria-hidden>▾</RSelect.Icon>
      </RSelect.Trigger>
      <RSelect.Portal>
        <RSelect.Content
          className={twMerge(
            "z-[1050] min-w-[--radix-select-trigger-width] overflow-hidden rounded-md border border-border bg-white shadow-lg"
          )}
        >
          <RSelect.Viewport className="p-1">
            {items.map((it) => (
              <RSelect.Item
                key={it.value}
                value={it.value}
                className="flex cursor-pointer select-none items-center rounded px-2 py-2 text-sm outline-none data-[highlighted]:bg-neutral-100"
              >
                <RSelect.ItemText>{it.label}</RSelect.ItemText>
              </RSelect.Item>
            ))}
          </RSelect.Viewport>
        </RSelect.Content>
      </RSelect.Portal>
    </RSelect.Root>
  );
}