import type { Meta, StoryObj } from "@storybook/react";
import { DatePicker, DateRangePicker } from "./index";

const meta: Meta = {
  title: "Components/DatePicker",
  parameters: { layout: "centered" },
};
export default meta;

export const Single: StoryObj = { render: () => <DatePicker /> };
export const Range: StoryObj = { render: () => <DateRangePicker /> };