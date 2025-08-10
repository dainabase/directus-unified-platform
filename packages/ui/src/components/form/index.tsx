"use client";

import * as React from "react";
import { useFormContext, FormProvider } from "react-hook-form";
import { twMerge } from "tailwind-merge";

export { FormProvider, useFormContext };

export function Form({ children, className, ...props }: React.FormHTMLAttributes<HTMLFormElement>) {
  return <form className={twMerge("space-y-4", className)} {...props}>{children}</form>;
}

export function FormItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge("space-y-1.5", className)} {...props} />;
}

export function FormLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={twMerge("block text-sm font-medium text-neutral-900", className)} {...props} />;
}

export function FormControl({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge("mt-1", className)} {...props} />;
}

export function FormDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={twMerge("text-xs text-neutral-600", className)} {...props} />;
}

export function FormMessage({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  if (!children) return null;
  return (
    <p className={twMerge("text-xs font-medium text-red-600", className)} {...props}>
      {children}
    </p>
  );
}

// Helper pour intégrer RHF (champ contrôlé simple)
export function FormField<TFieldValues extends Record<string, any>>({
  name,
  render,
}: {
  name: keyof TFieldValues & string;
  render: (field: {
    value: any;
    onChange: (v: any) => void;
    onBlur: () => void;
    name: string;
    ref: (instance: any) => void;
  }) => React.ReactNode;
}) {
  const { register, formState, getFieldState } = useFormContext<TFieldValues>();
  const r = register(name as any);
  const fieldState = getFieldState(name);
  const error = fieldState.error?.message;

  return (
    <div data-field={name}>
      {render({
        value: (formState as any).values?.[name],
        onChange: r.onChange,
        onBlur: r.onBlur,
        name: r.name,
        ref: r.ref,
      })}
      {error && <FormMessage>{error}</FormMessage>}
    </div>
  );
}