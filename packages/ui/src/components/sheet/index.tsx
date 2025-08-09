"use client";

import * as React from "react";
import * as RD from "@radix-ui/react-dialog";
import { twMerge } from "tailwind-merge";

export type SheetSide = "left" | "right" | "top" | "bottom";

export const Sheet = RD.Root;
export const SheetTrigger = RD.Trigger;
export const SheetPortal = RD.Portal;
export const SheetClose = RD.Close;

function sideClasses(side: SheetSide) {
  switch (side) {
    case "left":
      return "left-0 top-0 h-screen w-[90vw] max-w-md";
    case "right":
      return "right-0 top-0 h-screen w-[90vw] max-w-md";
    case "top":
      return "top-0 left-0 w-screen h-[85vh] max-h-[85vh]";
    case "bottom":
    default:
      return "bottom-0 left-0 w-screen h-[85vh] max-h-[85vh]";
  }
}

export function SheetContent({
  side = "right",
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof RD.Content> & { side?: SheetSide }) {
  const position =
    side === "right"
      ? "fixed right-0"
      : side === "left"
      ? "fixed left-0"
      : side === "top"
      ? "fixed top-0"
      : "fixed bottom-0";

  return (
    <RD.Portal>
      <RD.Overlay className="fixed inset-0 bg-black/50" />
      <RD.Content
        className={twMerge(
          position,
          sideClasses(side),
          "z-[1040] rounded-none border border-border bg-white shadow-xl outline-none",
          className
        )}
        {...props}
      >
        {children}
      </RD.Content>
    </RD.Portal>
  );
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge("border-b border-border p-4", className)} {...props} />;
}
export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={twMerge("text-base font-semibold", className)} {...props} />;
}
export function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={twMerge("text-sm text-neutral-600", className)} {...props} />;
}
export function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge("border-t border-border p-4 flex items-center justify-end gap-2", className)} {...props} />;
}