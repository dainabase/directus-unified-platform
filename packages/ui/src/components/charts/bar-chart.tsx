"use client";

import * as React from "react";
import {
  BarChart as RBarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { colorAt } from "./palette";
import { twMerge } from "tailwind-merge";

export type BarSeries = { dataKey: string; name?: string; stackId?: string | number };
export interface BarChartProps {
  data: Record<string, any>[];
  xKey: string;
  series: BarSeries[];
  height?: number;
  className?: string;
  grid?: boolean;
  legend?: boolean;
  yAxisFormatter?: (v: number) => string | number;
  tooltipFormatter?: (v: any, name: string) => any;
}

export function BarChart({
  data,
  xKey,
  series,
  height = 280,
  className,
  grid = true,
  legend = true,
  yAxisFormatter,
  tooltipFormatter,
}: BarChartProps) {
  return (
    <div className={twMerge("w-full rounded-lg border border-border bg-white p-3", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RBarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          {grid && <CartesianGrid strokeOpacity={0.2} />}
          <XAxis dataKey={xKey} />
          <YAxis tickFormatter={yAxisFormatter} />
          <Tooltip formatter={tooltipFormatter} />
          {legend && <Legend />}
          {series.map((s, i) => (
            <Bar key={s.dataKey} dataKey={s.dataKey} name={s.name ?? s.dataKey} stackId={s.stackId} fill={colorAt(i)} />
          ))}
        </RBarChart>
      </ResponsiveContainer>
    </div>
  );
}