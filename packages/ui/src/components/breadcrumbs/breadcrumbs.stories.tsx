import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumbs } from "./index";

const meta: Meta<typeof Breadcrumbs> = {
  title: "Components/Breadcrumbs",
  component: Breadcrumbs,
  parameters: { layout: "centered" },
};
export default meta;

export const Basic: StoryObj<typeof Breadcrumbs> = {
  args: { items: [{ label: "Home", href: "#" }, { label: "Reports", href: "#" }, { label: "Q2 2025" }] },
};