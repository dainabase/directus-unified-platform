import type { Meta, StoryObj } from "@storybook/react";
import { ColumnDef } from "@tanstack/react-table";
import { DataGrid } from "./index";

type Person = { id: number; name: string; email: string; role: string; revenue: number };

const data: Person[] = Array.from({ length: 42 }).map((_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@company.com`,
  role: ["Admin", "Manager", "Viewer"][i % 3],
  revenue: Math.round(Math.random() * 10000) / 100,
}));

const columns: ColumnDef<Person>[] = [
  { accessorKey: "id", header: "ID", cell: ctx => ctx.getValue<number>() },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Role" },
  { accessorKey: "revenue", header: "Revenue", cell: (ctx) => `€${(ctx.getValue<number>() ?? 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}` },
];

const meta: Meta<typeof DataGrid<Person, unknown>> = {
  title: "Components/DataGrid",
  component: DataGrid<Person, unknown>,
  args: { columns, data, initialSorting: [{ id: "id", desc: false }] },
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof DataGrid<Person, unknown>>;
export const Basic: Story = {};