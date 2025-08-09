import type { Meta, StoryObj } from "@storybook/react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "./index";
import { Button } from "../button";

const meta: Meta = {
  title: "Components/Sheet",
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj;

export const Right: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open Right Sheet</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Affinez les résultats.</SheetDescription>
        </SheetHeader>
        <div className="p-4 space-y-3">
          <div className="text-sm text-neutral-700">Contenu…</div>
        </div>
        <SheetFooter>
          <SheetClose asChild><Button variant="ghost">Annuler</Button></SheetClose>
          <Button>Appliquer</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Left: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Left Sheet</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Accès rapide.</SheetDescription>
        </SheetHeader>
        <div className="p-4 space-y-2">
          <a className="block text-primary" href="#">Dashboard</a>
          <a className="block text-primary" href="#">Reports</a>
          <a className="block text-primary" href="#">Settings</a>
        </div>
      </SheetContent>
    </Sheet>
  ),
};