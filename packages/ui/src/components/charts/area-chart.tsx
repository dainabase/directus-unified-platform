"use client";

import * as React from "react";
import {
  AreaChart as RAreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { colorAt } from "./palette";
import { twMerge } from "tailwind-merge";

export type AreaSeries = { dataKey: string; name?: string; stackId?: string | number };
export interface AreaChartProps {
  data: Record<string, any>[];
  xKey: string;
  series: AreaSeries[];
  height?: number;
  className?: string;
  grid?: boolean;
  legend?: boolean;
  yAxisFormatter?: (v: number) => string | number;
  tooltipFormatter?: (v: any, name: string) => any;
}

export function AreaChart({
  data,
  xKey,
  series,
  height = 280,
  className,
  grid = true,
  legend = true,
  yAxisFormatter,
  tooltipFormatter,
}: AreaChartProps) {
  return (
    <div className={twMerge("w-full rounded-lg border border-border bg-white p-3", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RAreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          {grid && <CartesianGrid strokeOpacity={0.2} />}
          <XAxis dataKey={xKey} />
          <YAxis tickFormatter={yAxisFormatter} />
          <Tooltip formatter={tooltipFormatter} />
          {legend && <Legend />}
          {series.map((s, i) => (
            <Area
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name ?? s.dataKey}
              stackId={s.stackId}
              stroke={colorAt(i)}
              fill={colorAt(i)}
              fillOpacity={0.2}
            />
          ))}
        </RAreaChart>
      </ResponsiveContainer>
    </div>
  );
}