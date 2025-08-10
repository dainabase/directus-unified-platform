"use client";

import * as React from "react";
import {
  LineChart as RLineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { colorAt } from "./palette";
import { twMerge } from "tailwind-merge";

export type LineSeries = { dataKey: string; name?: string };
export interface LineChartProps {
  data: Record<string, any>[];
  xKey: string;
  series: LineSeries[];
  height?: number;
  className?: string;
  grid?: boolean;
  legend?: boolean;
  smooth?: boolean;
  yAxisFormatter?: (v: number) => string | number;
  tooltipFormatter?: (v: any, name: string) => any;
}

export function LineChart({
  data,
  xKey,
  series,
  height = 280,
  className,
  grid = true,
  legend = true,
  smooth = true,
  yAxisFormatter,
  tooltipFormatter,
}: LineChartProps) {
  return (
    <div className={twMerge("w-full rounded-lg border border-border bg-white p-3", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RLineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          {grid && <CartesianGrid strokeOpacity={0.2} />}
          <XAxis dataKey={xKey} />
          <YAxis tickFormatter={yAxisFormatter} />
          <Tooltip formatter={tooltipFormatter} />
          {legend && <Legend />}
          {series.map((s, i) => (
            <Line
              key={s.dataKey}
              type={smooth ? "monotone" : "linear"}
              dataKey={s.dataKey}
              name={s.name ?? s.dataKey}
              stroke={colorAt(i)}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </RLineChart>
      </ResponsiveContainer>
    </div>
  );
}