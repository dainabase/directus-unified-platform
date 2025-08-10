"use client";

import * as React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { colorAt } from "./palette";
import { twMerge } from "tailwind-merge";

export interface DonutChartProps {
  data: { name: string; value: number }[];
  height?: number;
  className?: string;
  innerRadius?: number;
  outerRadius?: number;
  legend?: boolean;
  tooltipFormatter?: (v: any, name: string) => any;
}

export function DonutChart({
  data,
  height = 280,
  className,
  innerRadius = 60,
  outerRadius = 100,
  legend = true,
  tooltipFormatter,
}: DonutChartProps) {
  return (
    <div className={twMerge("w-full rounded-lg border border-border bg-white p-3", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={innerRadius} outerRadius={outerRadius} paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={colorAt(i)} />
            ))}
          </Pie>
          <Tooltip formatter={tooltipFormatter} />
          {legend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}