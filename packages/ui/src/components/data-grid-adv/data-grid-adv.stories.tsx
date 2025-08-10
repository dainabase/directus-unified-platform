import type { Meta, StoryObj } from "@storybook/react";
import { ColumnDef } from "@tanstack/react-table";
import { DataGridAdv } from "./index";
type Person = { id: number; name: string; email: string; dept: string; revenue: number; active: boolean };
const data: Person[] = Array.from({ length: 1500 }).map((_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@company.com`,
  dept: ["Sales", "Ops", "Finance", "Tech"][i % 4],
  revenue: Math.round(Math.random() * 10000) / 100,
  active: i % 3 === 0,
}));
const columns: ColumnDef<Person>[] = [
  { accessorKey: "id", header: "ID", size: 60 },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "dept", header: "Dept" },
  {
    accessorKey: "revenue",
    header: "Revenue",
    cell: (ctx) => `€${(ctx.getValue<number>() ?? 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}`,
  },
  { accessorKey: "active", header: "Active", cell: (ctx) => (ctx.getValue<boolean>() ? "Yes" : "No") },
];
const meta: Meta<typeof DataGridAdv<Person, unknown>> = {
  title: "Components/DataGrid Advanced",
  component: DataGridAdv<Person, unknown>,
  args: {
    columns,
    data,
    virtualization: true,
    initialDensity: "normal",
    globalFilterPlaceholder: "Search users…"
  },
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof DataGridAdv<Person, unknown>>;
export const Basic: Story = {};
export const WithRowActions: Story = {
  args: {
    actionsPerRow: [
      { id: "view", label: "View", onAction: (r) => alert(`View ${r.id}`) },
      { id: "edit", label: "Edit", onAction: (r) => alert(`Edit ${r.id}`) },
    ],
  },
};