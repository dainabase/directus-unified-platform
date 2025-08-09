"use client";
import * as React from "react";
import * as Lucide from "lucide-react";
import { twMerge } from "tailwind-merge";

/**
 * Icon wrapper — usage:
 * <Icon name="Search" size={18} />
 * <Icon name="settings" className="text-primary" />
 */
export type IconName = keyof typeof Lucide | Lowercase<keyof typeof Lucide>;

export interface IconProps extends React.SVGAttributes<SVGElement> {
  name: IconName;
  size?: number;          // px
  strokeWidth?: number;   // 1..2.5
}

function resolveName(n: IconName): keyof typeof Lucide {
  // supporte "search", "Search", "searchIcon" etc. en normalisant
  const candidates = [
    n as string,
    (n as string).charAt(0).toUpperCase() + (n as string).slice(1),
    (n as string).replace(/[-_ ]+(\w)/g, (_, c) => c.toUpperCase()).replace(/^\w/, (c) => c.toUpperCase()),
  ];
  for (const c of candidates) {
    if (c in Lucide) return c as keyof typeof Lucide;
  }
  throw new Error(`Icon "${n}" not found in lucide-react`);
}

export const Icon = React.forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, size = 18, strokeWidth = 2, className, ...rest },
  ref
) {
  const key = resolveName(name);
  const Cmp = (Lucide as any)[key] as React.ComponentType<any>;
  return <Cmp ref={ref} size={size} strokeWidth={strokeWidth} className={twMerge("shrink-0", className)} {...rest} />;
});