"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={twMerge(
        "min-h-[96px] w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none ring-offset-white placeholder:text-neutral-400 focus:border-primary focus:ring-2 focus:ring-primary",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";