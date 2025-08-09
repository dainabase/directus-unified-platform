import type { Meta, StoryObj } from "@storybook/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./index";
import { Button } from "../button";

const meta: Meta = {
  title: "Components/DropdownMenu",
  parameters: { layout: "centered" },
};
export default meta;

export const Basic: StoryObj = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Item A</DropdownMenuItem>
        <DropdownMenuItem>Item B</DropdownMenuItem>
        <DropdownMenuItem>Item C</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};