import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./index";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  args: { children: "Button" },
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {};
export const Ghost: Story = { args: { variant: "ghost" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Link: Story = { args: { variant: "link" } };
export const Destructive: Story = { args: { variant: "destructive" } };
export const Success: Story = { args: { variant: "success", children: "✅ Success" } };
export const Icon: Story = { args: { size: "icon", children: "🔍" } };