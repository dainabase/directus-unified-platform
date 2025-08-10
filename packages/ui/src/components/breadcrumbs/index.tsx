"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export function Breadcrumbs({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={twMerge("text-sm text-neutral-600", className)}>
      <ol className="flex items-center gap-2">
        {items.map((it, idx) => {
          const last = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-2">
              {idx > 0 && <span className="text-neutral-300">/</span>}
              {last ? (
                <span className="text-neutral-900 font-medium">{it.label}</span>
              ) : it.href ? (
                <a className="text-primary hover:underline" href={it.href}>{it.label}</a>
              ) : (
                <button onClick={it.onClick} className="text-primary hover:underline">{it.label}</button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}