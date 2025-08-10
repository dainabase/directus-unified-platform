"use client";

import * as React from "react";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { twMerge } from "tailwind-merge";
import { colorAt } from "./palette";

export interface RadialGaugeProps {
  value: number;       // 0..100
  height?: number;
  className?: string;
  label?: string;
}

export function RadialGauge({ value, height = 220, className, label = "Progress" }: RadialGaugeProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const data = [{ name: label, value: clamped, fill: colorAt(0) }];

  return (
    <div className={twMerge("w-full rounded-lg border border-border bg-white p-3", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RadialBarChart
          data={data}
          innerRadius="70%"
          outerRadius="100%"
          startAngle={180}
          endAngle={-180}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar background dataKey="value" cornerRadius={10} />
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="20" fontWeight="600">
            {clamped}%
          </text>
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}