"use client";

import * as React from "react";
import * as RToast from "@radix-ui/react-toast";
import { twMerge } from "tailwind-merge";

type ToastState = { title?: string; description?: string; open: boolean };

const ToastContext = React.createContext<{ toast: (t: Omit<ToastState, "open">) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<ToastState>({ open: false });

  const toast = (t: Omit<ToastState, "open">) => setState({ ...t, open: true });

  return (
    <ToastContext.Provider value={{ toast }}>
      <RToast.Provider swipeDirection="right">
        {children}
        <RToast.Root
          open={state.open}
          onOpenChange={(o) => setState((s) => ({ ...s, open: o }))}
          className={twMerge("fixed right-4 bottom-4 z-[1100] w-[360px] rounded-lg border border-border bg-white p-3 shadow-lg")}
        >
          {state.title && <RToast.Title className="text-sm font-medium">{state.title}</RToast.Title>}
          {state.description && <RToast.Description className="mt-1 text-sm text-neutral-700">{state.description}</RToast.Description>}
        </RToast.Root>
        <RToast.Viewport />
      </RToast.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}