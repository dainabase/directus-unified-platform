import type { Meta, StoryObj } from "@storybook/react";
import { LineChart } from "./line-chart";
import { BarChart } from "./bar-chart";
import { AreaChart } from "./area-chart";
import { DonutChart } from "./donut-chart";
import { RadialGauge } from "./radial-gauge";

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const data = months.map((m, i) => ({
  month: m,
  revenue: Math.round(Math.random() * 10000) + 2000,
  cost: Math.round(Math.random() * 6000) + 1000,
  users: Math.round(Math.random() * 1200) + 200,
}));

const donutData = [
  { name: "Sales", value: 40 },
  { name: "Ops", value: 18 },
  { name: "Finance", value: 22 },
  { name: "Tech", value: 20 },
];

const meta: Meta = {
  title: "Charts/All",
  parameters: { layout: "fullscreen" },
};
export default meta;

export const Lines: StoryObj = {
  render: () => (
    <LineChart
      data={data}
      xKey="month"
      series={[
        { dataKey: "revenue", name: "Revenue" },
        { dataKey: "cost", name: "Cost" },
      ]}
      yAxisFormatter={(v) => `€${v.toLocaleString("fr-FR")}`}
    />
  ),
};

export const Bars: StoryObj = {
  render: () => (
    <BarChart
      data={data}
      xKey="month"
      series={[
        { dataKey: "revenue", name: "Revenue" },
        { dataKey: "cost", name: "Cost" },
      ]}
      yAxisFormatter={(v) => `€${v.toLocaleString("fr-FR")}`}
    />
  ),
};

export const Areas: StoryObj = {
  render: () => (
    <AreaChart
      data={data}
      xKey="month"
      series={[
        { dataKey: "revenue", name: "Revenue" },
        { dataKey: "cost", name: "Cost" },
      ]}
      yAxisFormatter={(v) => `€${v.toLocaleString("fr-FR")}`}
    />
  ),
};

export const Donut: StoryObj = {
  render: () => <DonutChart data={donutData} />,
};

export const Gauge: StoryObj = {
  render: () => <RadialGauge value={72} label="Target" />,
};