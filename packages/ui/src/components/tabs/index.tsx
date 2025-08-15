"use client";

import * as React from "react";
import * as RTabs from "@radix-ui/react-tabs";
import { twMerge } from "tailwind-merge";

export const Tabs = RTabs.Root;

// Export TabsProps type
export type TabsProps = React.ComponentPropsWithoutRef<typeof RTabs.Root>;

export const TabsList = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof RTabs.List>) => (
  <RTabs.List className={twMerge("inline-flex items-center gap-1 rounded-lg border border-border bg-white p-1", className)} {...props} />
);
export const TabsTrigger = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof RTabs.Trigger>) => (
  <RTabs.Trigger
    className={twMerge(
      "rounded-md px-3 py-1.5 text-sm text-neutral-700 outline-none data-[state=active]:bg-neutral-100 data-[state=active]:font-medium focus-visible:ring-2 focus-visible:ring-primary",
      className
    )}
    {...props}
  />
);
export const TabsContent = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof RTabs.Content>) => (
  <RTabs.Content className={twMerge("mt-3", className)} {...props} />
);