import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { ThemeProvider, useTheme } from "../theme/ThemeProvider";
import { ThemeToggle } from "../components/theme-toggle";
import { Card, CardHeader, CardTitle, CardContent } from "../components/card";
import { Button } from "../components/button";
import { Input } from "../components/input";

function Demo() {
  const { theme } = useTheme();
  return (
    <div className="space-y-3">
      <ThemeToggle />
      <div className="text-sm text-neutral-600">Current: <b>{theme}</b></div>
      <Card>
        <CardHeader><CardTitle>Themed Card</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Input placeholder="Input in current theme" />
          <Button>Primary button</Button>
        </CardContent>
      </Card>
    </div>
  );
}

const meta: Meta = {
  title: "Theming/ThemeProvider",
  decorators: [(Story) => <ThemeProvider><div className="p-4"><Story /></div></ThemeProvider>],
  parameters: { layout: "centered" },
};
export default meta;
export const Basic: StoryObj = { render: () => <Demo /> };