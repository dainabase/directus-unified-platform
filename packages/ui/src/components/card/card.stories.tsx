import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./index";
import { Button } from "../button";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Example: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Monthly Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-neutral-600">€42,500 (+8%) vs last month</p>
      </CardContent>
      <CardFooter>
        <Button>View details</Button>
      </CardFooter>
    </Card>
  ),
};