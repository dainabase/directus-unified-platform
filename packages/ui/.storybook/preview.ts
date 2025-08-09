import type { Preview } from "@storybook/react";
import "../src/styles/preview.css";
import { ThemeProvider } from "../src/theme/ThemeProvider";

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    a11y: { element: "#root" },
    options: { storySort: { order: ["Theming", "Layout", "Components", "Charts", "Forms"] } },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="min-h-screen bg-background text-foreground p-4">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};
export default preview;