import type { Meta, StoryObj } from "@storybook/react";
import { CommandPalette } from "./index";

const meta: Meta<typeof CommandPalette> = {
  title: "Components/CommandPalette",
  component: CommandPalette,
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof CommandPalette>;

export const Basic: Story = {
  args: {
    items: [
      { id: "d1", label: "Aller au Dashboard", group: "Navigation" },
      { id: "r1", label: "Créer un rapport", group: "Actions", shortcut: "R" },
      { id: "s1", label: "Ouvrir Settings", group: "Navigation" },
    ],
  },
};