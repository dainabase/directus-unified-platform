import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';
import Handlebars from 'handlebars';

interface ComponentOptions {
  template: string;
  path?: string;
  story: boolean;
  test: boolean;
}

export async function generateComponent(name: string, options: ComponentOptions) {
  const spinner = ora(`Generating component ${name}...`).start();

  try {
    // Validate component name
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
      throw new Error('Component name must be in PascalCase');
    }

    // Ask for additional details if not provided
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'description',
        message: 'Component description:',
        default: `${name} component`,
      },
      {
        type: 'confirm',
        name: 'hasProps',
        message: 'Will this component have props?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'forwardRef',
        message: 'Should this component forward refs?',
        default: false,
      },
    ]);

    const kebabName = name.replace(/([A-Z])/g, '-$1').toLowerCase().slice(1);
    const componentDir = options.path || `./src/components/${kebabName}`;

    // Create component directory
    await fs.mkdir(componentDir, { recursive: true });

    // Generate component file
    const componentTemplate = `import * as React from "react"
import { cn } from "../../lib/utils"

{{#if hasProps}}
export interface {{name}}Props extends React.HTMLAttributes<HTMLDivElement> {
  // Add your props here
}
{{/if}}

{{#if forwardRef}}
const {{name}} = React.forwardRef<
  HTMLDivElement,
  {{#if hasProps}}{{name}}Props{{else}}React.HTMLAttributes<HTMLDivElement>{{/if}}
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "{{kebabName}}",
        className
      )}
      {...props}
    />
  )
})
{{name}}.displayName = "{{name}}"
{{else}}
export function {{name}}({
  className,
  ...props
}: {{#if hasProps}}{{name}}Props{{else}}React.HTMLAttributes<HTMLDivElement>{{/if}}) {
  return (
    <div
      className={cn(
        "{{kebabName}}",
        className
      )}
      {...props}
    />
  )
}
{{/if}}

export { {{name}} }`;

    const template = Handlebars.compile(componentTemplate);
    const componentContent = template({
      name,
      kebabName,
      ...answers,
    });

    await fs.writeFile(
      path.join(componentDir, `${kebabName}.tsx`),
      componentContent
    );

    // Generate index file
    const indexContent = `export { ${name} } from './${kebabName}'
export type { ${name}Props } from './${kebabName}'`;
    await fs.writeFile(path.join(componentDir, 'index.ts'), indexContent);

    // Generate test file if requested
    if (options.test) {
      const testTemplate = `import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { {{name}} } from './{{kebabName}}';

describe('{{name}} Component', () => {
  it('renders correctly', () => {
    render(<{{name}} data-testid="{{kebabName}}">Test Content</{{name}}>);
    const element = screen.getByTestId('{{kebabName}}');
    expect(element).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<{{name}} className="custom-class" data-testid="{{kebabName}}" />);
    const element = screen.getByTestId('{{kebabName}}');
    expect(element).toHaveClass('custom-class');
  });
})`;

      const testContent = Handlebars.compile(testTemplate)({
        name,
        kebabName,
      });

      await fs.writeFile(
        path.join(componentDir, `${kebabName}.test.tsx`),
        testContent
      );
    }

    // Generate Storybook story if requested
    if (options.story) {
      const storyTemplate = `import type { Meta, StoryObj } from '@storybook/react'
import { {{name}} } from './{{kebabName}}'

const meta = {
  title: 'Components/{{name}}',
  component: {{name}},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Define your argTypes here
  },
} satisfies Meta<typeof {{name}}>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: '{{name}} Component',
  },
}

export const Example: Story = {
  args: {
    children: 'Example {{name}}',
    className: 'custom-class',
  },
}`;

      const storyContent = Handlebars.compile(storyTemplate)({
        name,
        kebabName,
      });

      await fs.writeFile(
        path.join(componentDir, `${kebabName}.stories.tsx`),
        storyContent
      );
    }

    spinner.succeed(chalk.green(`✅ Component ${name} generated successfully!`));
    console.log(chalk.blue(`📁 Location: ${componentDir}`));
    console.log(chalk.yellow('\n📝 Next steps:'));
    console.log('  1. Import and add to src/index.ts exports');
    console.log('  2. Add component styles if needed');
    console.log('  3. Run tests: pnpm test');
    console.log('  4. View in Storybook: pnpm sb');
  } catch (error) {
    spinner.fail(chalk.red(`Failed to generate component: ${error.message}`));
    process.exit(1);
  }
}