import type { Preview } from "@storybook/react";
import "../src/styles/preview.css";
const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    a11y: { element: "#root" },
    options: { storySort: { order: ["Layout", "Components", "Charts", "Forms"] } },
  },
};
export default preview;