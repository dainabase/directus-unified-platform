import type { Meta, StoryObj } from '@storybook/react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion';

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A vertically stacked set of interactive headings that each reveal an associated section of content.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: () => (
    <div className="w-[450px]">
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>
            Yes. It adheres to the WAI-ARIA design pattern.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Is it styled?</AccordionTrigger>
          <AccordionContent>
            Yes. It comes with default styles that matches the other
            components' aesthetic.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Is it animated?</AccordionTrigger>
          <AccordionContent>
            Yes. It's animated by default, but you can disable it if you prefer.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div className="w-[450px]">
      <Accordion type="multiple">
        <AccordionItem value="item-1">
          <AccordionTrigger>Can I open multiple items?</AccordionTrigger>
          <AccordionContent>
            Yes! When the type is set to "multiple", you can open multiple items at once.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Is it responsive?</AccordionTrigger>
          <AccordionContent>
            Yes. The accordion is fully responsive and works great on mobile devices.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Can it be customized?</AccordionTrigger>
          <AccordionContent>
            Yes. You can customize the styling using Tailwind classes or CSS.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

export const DefaultExpanded: Story = {
  render: () => (
    <div className="w-[450px]">
      <Accordion type="single" collapsible defaultValue="item-2">
        <AccordionItem value="item-1">
          <AccordionTrigger>First Section</AccordionTrigger>
          <AccordionContent>
            This section is collapsed by default.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Second Section (Default Open)</AccordionTrigger>
          <AccordionContent>
            This section is expanded by default using the defaultValue prop.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Third Section</AccordionTrigger>
          <AccordionContent>
            This section is also collapsed by default.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

export const WithComplexContent: Story = {
  render: () => (
    <div className="w-[450px]">
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Product Features</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc pl-6 space-y-2">
              <li>High-performance rendering</li>
              <li>Accessibility first approach</li>
              <li>Fully customizable design</li>
              <li>TypeScript support</li>
              <li>Comprehensive documentation</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Installation Guide</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <p>Install the component using your package manager:</p>
              <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md">
                <code>pnpm add @dainabase/ui</code>
              </pre>
              <p>Then import and use in your application.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>API Reference</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div>
                <strong>type</strong>: "single" | "multiple"
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Determines whether one or multiple items can be opened at the same time.
                </p>
              </div>
              <div>
                <strong>collapsible</strong>: boolean
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  When type is "single", allows closing content when clicking on open item.
                </p>
              </div>
              <div>
                <strong>defaultValue</strong>: string | string[]
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The value of the item to expand by default.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};