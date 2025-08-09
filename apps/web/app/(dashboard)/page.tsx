"use client";

import * as React from "react";
import {
  AppShell, Button, Card, CardHeader, CardTitle, CardContent,
  Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose,
  DateRangePicker, Tabs, TabsList, TabsTrigger, TabsContent,
  Breadcrumbs, ToastProvider, ThemeToggle
} from "@dainabase/ui";
import { LineChart, BarChart, DonutChart, RadialGauge } from "@dainabase/ui";
import { DataGridAdv } from "@dainabase/ui";

type Sale = { id: number; customer: string; email: string; dept: string; amount: number; status: "Paid"|"Due"|"Overdue" };

const sales: Sale[] = Array.from({ length: 240 }).map((_, i) => ({
  id: i + 1,
  customer: `Client ${i + 1}`,
  email: `client${i + 1}@ex.com`,
  dept: ["Sales","Ops","Finance","Tech"][i % 4],
  amount: Math.round(Math.random()*10000)/100,
  status: (["Paid","Due","Overdue"] as const)[i % 3]
}));

const kpis = [
  { label: "Revenue (M)", value: "€1.24M", delta: "+8%" },
  { label: "Costs (M)", value: "€0.82M", delta: "-2%" },
  { label: "Active Users", value: "12,430", delta: "+4%" },
  { label: "NPS", value: "72", delta: "+3" }
];

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const series = months.map((m) => ({
  month: m,
  revenue: Math.round(Math.random()*10000)+2000,
  cost: Math.round(Math.random()*7000)+1000
}));
const donut = [
  { name: "Sales", value: 42 },
  { name: "Ops", value: 18 },
  { name: "Finance", value: 22 },
  { name: "Tech", value: 18 }
];

export default function DashboardPage() {
  const sidebar = (
    <div className="p-3">
      <div className="text-xs font-semibold text-neutral-500 mb-2">NAVIGATION</div>
      <ul className="space-y-1 text-sm">
        <li><a className="text-primary" href="#">Overview</a></li>
        <li><a className="text-primary" href="#">Reports</a></li>
        <li><a className="text-primary" href="#">Settings</a></li>
      </ul>
    </div>
  );

  return (
    <ToastProvider>
      <AppShell sidebar={sidebar} title="Unified Dashboard" topbarRight={<ThemeToggle />}>
        <div className="mb-3 flex items-center justify-between">
          <Breadcrumbs items={[{ label: "Home", href: "#" }, { label: "Dashboard" }]} />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Filtres ▾</Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader><SheetTitle>Filtrer par période</SheetTitle></SheetHeader>
              <div className="p-4">
                <DateRangePicker />
              </div>
              <SheetFooter>
                <SheetClose asChild><Button variant="ghost">Annuler</Button></SheetClose>
                <Button>Appliquer</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-3 md:grid-cols-4">
          {kpis.map((k, i) => (
            <Card key={i}>
              <CardHeader><CardTitle>{k.label}</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{k.value}</div>
                <div className="text-xs text-neutral-600">{k.delta} vs dernier mois</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <Tabs defaultValue="charts">
            <TabsList>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
            <TabsContent value="charts">
              <div className="mt-3 grid gap-3 xl:grid-cols-2">
                <Card><CardContent><LineChart data={series} xKey="month" series={[{ dataKey: "revenue", name: "Revenue" }, { dataKey: "cost", name: "Cost" }]} yAxisFormatter={(v)=>`€${v.toLocaleString("fr-FR")}`} /></CardContent></Card>
                <Card><CardContent><BarChart data={series} xKey="month" series={[{ dataKey: "revenue" }, { dataKey: "cost" }]} yAxisFormatter={(v)=>`€${v.toLocaleString("fr-FR")}`} /></CardContent></Card>
                <Card><CardContent><DonutChart data={donut} /></CardContent></Card>
                <Card><CardContent><RadialGauge value={72} label="Target" /></CardContent></Card>
              </div>
            </TabsContent>
            <TabsContent value="table">
              <div className="mt-3">
                <Card>
                  <CardContent>
                    <DataGridAdv
                      data={sales}
                      columns={[
                        { accessorKey: "id", header: "ID" },
                        { accessorKey: "customer", header: "Client" },
                        { accessorKey: "email", header: "Email" },
                        { accessorKey: "dept", header: "Dept" },
                        { accessorKey: "amount", header: "Montant", cell: (c) => `€${(c.getValue<number>() ?? 0).toLocaleString("fr-FR",{minimumFractionDigits:2})}` },
                        { accessorKey: "status", header: "Statut" }
                      ]}
                      actionsPerRow={[
                        { id: "view", label: "Voir", onAction: (r)=>alert(`Voir ${r.id}`) },
                        { id: "edit", label: "Éditer", onAction: (r)=>alert(`Éditer ${r.id}`) }
                      ]}
                      globalFilterPlaceholder="Rechercher…"
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </AppShell>
    </ToastProvider>
  );
}