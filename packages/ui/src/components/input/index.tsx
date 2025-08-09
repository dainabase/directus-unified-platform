"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={twMerge(
        "h-10 w-full rounded-md border border-border bg-white px-3 text-sm outline-none ring-offset-white placeholder:text-neutral-400 focus:border-primary focus:ring-2 focus:ring-primary",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";