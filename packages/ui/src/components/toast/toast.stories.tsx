import type { Meta, StoryObj } from "@storybook/react";
import { ToastProvider, useToast } from "./index";
import { Button } from "../button";

function Demo() {
  const { toast } = useToast();
  return (
    <div className="space-x-2">
      <Button onClick={() => toast({ title: "Succès", description: "Action effectuée." })}>Toast</Button>
    </div>
  );
}

const meta: Meta = {
  title: "Components/Toast",
  parameters: { layout: "centered" },
  decorators: [(Story) => <ToastProvider><Story /></ToastProvider>],
};
export default meta;

export const Basic: StoryObj = { render: () => <Demo /> };