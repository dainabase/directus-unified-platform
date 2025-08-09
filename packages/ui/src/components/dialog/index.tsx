"use client";

import * as React from "react";
import * as RD from "@radix-ui/react-dialog";
import { twMerge } from "tailwind-merge";

export const Dialog = RD.Root;
export const DialogTrigger = RD.Trigger;
export const DialogPortal = RD.Portal;
export const DialogClose = RD.Close;

export function DialogContent({ className, ...props }: React.ComponentPropsWithoutRef<typeof RD.Content>) {
  return (
    <RD.Portal>
      <RD.Overlay className="fixed inset-0 bg-black/50" />
      <RD.Content
        className={twMerge(
          "fixed left-1/2 top-1/2 z-[1040] w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-white p-4 shadow-xl focus:outline-none",
          className
        )}
        {...props}
      />
    </RD.Portal>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge("mb-3", className)} {...props} />;
}
export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={twMerge("text-lg font-semibold", className)} {...props} />;
}
export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={twMerge("text-sm text-neutral-600", className)} {...props} />;
}
export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge("mt-4 flex justify-end gap-2", className)} {...props} />;
}