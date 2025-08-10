import type { Meta, StoryObj } from "@storybook/react";
import { AppShell } from "./index";
import { Button } from "../button";

const Sidebar = () => (
  <div className="p-3">
    <div className="text-xs font-semibold text-neutral-500 mb-2">NAVIGATION</div>
    <ul className="space-y-1 text-sm">
      <li><a className="text-primary" href="#">Overview</a></li>
      <li><a className="text-primary" href="#">Reports</a></li>
      <li><a className="text-primary" href="#">Settings</a></li>
    </ul>
  </div>
);

const meta: Meta<typeof AppShell> = {
  title: "Layout/AppShell",
  component: AppShell,
  parameters: { layout: "fullscreen" },
};
export default meta;

export const Basic: StoryObj = {
  render: () => (
    <AppShell sidebar={<Sidebar />} title="Unified Dashboard" topbarRight={<Button>Action</Button>}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-40 rounded-lg border border-border bg-white p-4">Bloc A</div>
        <div className="h-40 rounded-lg border border-border bg-white p-4">Bloc B</div>
      </div>
    </AppShell>
  ),
};