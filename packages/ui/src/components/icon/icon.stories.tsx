import type { Meta, StoryObj } from "@storybook/react";
import { Icon } from "./index";

const meta: Meta<typeof Icon> = {
  title: "Components/Icon",
  component: Icon,
  args: { name: "Search", size: 20 },
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Basic: Story = { args: { name: "Search" } };

export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon name="Activity" className="text-primary" />
      <Icon name="Bell" className="text-secondary" />
      <Icon name="Star" className="text-yellow-500" />
      <Icon name="Heart" className="text-rose-500" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon name="Search" size={14} />
      <Icon name="Search" size={18} />
      <Icon name="Search" size={24} />
      <Icon name="Search" size={32} />
    </div>
  ),
};