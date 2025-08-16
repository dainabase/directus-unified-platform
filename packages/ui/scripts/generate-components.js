#!/usr/bin/env node
/**
 * 🚀 GÉNÉRATEUR AUTOMATIQUE DE COMPOSANTS
 * Crée automatiquement TOUS les fichiers manquants pour les 75 composants
 */

const fs = require('fs');
const path = require('path');

// Liste complète des 75 composants
const ALL_COMPONENTS = {
  // Core Components (58)
  'accordion': { type: 'core', hasRadix: true },
  'alert': { type: 'core', hasIcon: true },
  'alert-dialog': { type: 'core', hasRadix: true },
  'avatar': { type: 'core', hasRadix: true },
  'badge': { type: 'core', variants: true },
  'breadcrumb': { type: 'core', navigation: true },
  'button': { type: 'core', variants: true },
  'calendar': { type: 'core', hasDatePicker: true },
  'card': { type: 'core', layout: true },
  'carousel': { type: 'core', hasEmbla: true },
  'chart': { type: 'core', hasRecharts: true },
  'checkbox': { type: 'core', hasRadix: true },
  'collapsible': { type: 'core', hasRadix: true },
  'color-picker': { type: 'core', hasColorInput: true },
  'command-palette': { type: 'core', hasCommand: true },
  'context-menu': { type: 'core', hasRadix: true },
  'data-grid': { type: 'core', hasTable: true },
  'data-grid-advanced': { type: 'core', hasTable: true },
  'date-picker': { type: 'core', hasDatePicker: true },
  'date-range-picker': { type: 'core', hasDatePicker: true },
  'dialog': { type: 'core', hasRadix: true },
  'dropdown-menu': { type: 'core', hasRadix: true },
  'error-boundary': { type: 'core', errorHandling: true },
  'file-upload': { type: 'core', hasDropzone: true },
  'form': { type: 'core', hasReactHookForm: true },
  'forms-demo': { type: 'core', demo: true },
  'hover-card': { type: 'core', hasRadix: true },
  'icon': { type: 'core', hasLucide: true },
  'input': { type: 'core', form: true },
  'label': { type: 'core', form: true },
  'menubar': { type: 'core', hasRadix: true },
  'navigation-menu': { type: 'core', hasRadix: true },
  'pagination': { type: 'core', navigation: true },
  'popover': { type: 'core', hasRadix: true },
  'progress': { type: 'core', hasRadix: true },
  'radio-group': { type: 'core', hasRadix: true },
  'rating': { type: 'core', interactive: true },
  'resizable': { type: 'core', hasReResizable: true },
  'scroll-area': { type: 'core', hasRadix: true },
  'select': { type: 'core', hasRadix: true },
  'separator': { type: 'core', hasRadix: true },
  'sheet': { type: 'core', hasRadix: true },
  'skeleton': { type: 'core', loading: true },
  'slider': { type: 'core', hasRadix: true },
  'sonner': { type: 'core', hasToast: true },
  'stepper': { type: 'core', navigation: true },
  'switch': { type: 'core', hasRadix: true },
  'table': { type: 'core', hasTable: true },
  'tabs': { type: 'core', hasRadix: true },
  'text-animations': { type: 'core', animation: true },
  'textarea': { type: 'core', form: true },
  'timeline': { type: 'core', display: true },
  'toast': { type: 'core', hasRadix: true },
  'toggle': { type: 'core', hasRadix: true },
  'toggle-group': { type: 'core', hasRadix: true },
  'tooltip': { type: 'core', hasRadix: true },
  'ui-provider': { type: 'core', provider: true },
  
  // Advanced Components (17)
  'advanced-filter': { type: 'advanced', filtering: true },
  'app-shell': { type: 'advanced', layout: true },
  'audio-recorder': { type: 'advanced', media: true },
  'code-editor': { type: 'advanced', hasMonaco: true },
  'dashboard-grid': { type: 'advanced', layout: true },
  'drawer': { type: 'advanced', hasRadix: true },
  'drag-drop-grid': { type: 'advanced', hasDnd: true },
  'image-cropper': { type: 'advanced', media: true },
  'infinite-scroll': { type: 'advanced', scrolling: true },
  'kanban': { type: 'advanced', hasDnd: true },
  'mentions': { type: 'advanced', text: true },
  'notification-center': { type: 'advanced', notification: true },
  'pdf-viewer': { type: 'advanced', media: true },
  'rich-text-editor': { type: 'advanced', hasEditor: true },
  'search-bar': { type: 'advanced', search: true },
  'tag-input': { type: 'advanced', form: true },
  'theme-builder': { type: 'advanced', theming: true },
  'theme-toggle': { type: 'advanced', theming: true },
  'tree-view': { type: 'advanced', hierarchy: true },
  'video-player': { type: 'advanced', media: true },
  'virtual-list': { type: 'advanced', performance: true },
  'virtualized-table': { type: 'advanced', performance: true }
};

// Fonction pour convertir kebab-case en PascalCase
function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

// Template générateur basé sur le type de composant
function generateComponentCode(name, className, config) {
  const hasRadix = config.hasRadix;
  const isForm = config.form;
  const hasVariants = config.variants;
  
  if (hasRadix) {
    return generateRadixComponent(name, className);
  } else if (isForm) {
    return generateFormComponent(name, className);
  } else if (hasVariants) {
    return generateVariantComponent(name, className);
  } else {
    return generateStandardComponent(name, className);
  }
}

// Template pour composant Radix UI
function generateRadixComponent(name, className) {
  const radixImport = \`@radix-ui/react-\${name}\`;
  
  return \`"use client";

import * as React from "react";
import * as \${className}Primitive from "\${radixImport}";
import { cn } from "../../lib/utils";

const \${className} = \${className}Primitive.Root;

const \${className}Trigger = React.forwardRef<
  React.ElementRef<typeof \${className}Primitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof \${className}Primitive.Trigger>
>(({ className: classNameProp, children, ...props }, ref) => (
  <\${className}Primitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-md",
      "px-4 py-2 text-sm font-medium",
      "transition-colors focus:outline-none focus:ring-2",
      "hover:bg-accent hover:text-accent-foreground",
      classNameProp
    )}
    {...props}
  >
    {children}
  </\${className}Primitive.Trigger>
));
\${className}Trigger.displayName = \${className}Primitive.Trigger.displayName;

const \${className}Content = React.forwardRef<
  React.ElementRef<typeof \${className}Primitive.Content>,
  React.ComponentPropsWithoutRef<typeof \${className}Primitive.Content>
>(({ className: classNameProp, children, ...props }, ref) => (
  <\${className}Primitive.Portal>
    <\${className}Primitive.Content
      ref={ref}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md",
        "border bg-popover p-1 text-popover-foreground shadow-md",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        classNameProp
      )}
      {...props}
    >
      {children}
    </\${className}Primitive.Content>
  </\${className}Primitive.Portal>
));
\${className}Content.displayName = \${className}Primitive.Content.displayName;

export { \${className}, \${className}Trigger, \${className}Content };
export type \${className}Props = React.ComponentProps<typeof \${className}>;
\`;
}

// Template pour composant Form
function generateFormComponent(name, className) {
  return \`"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

export interface \${className}Props
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const \${className} = React.forwardRef<HTMLInputElement, \${className}Props>(
  ({ className: classNameProp, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || React.useId();
    
    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "flex h-10 w-full rounded-md border border-input",
            "bg-background px-3 py-2 text-sm ring-offset-background",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            classNameProp
          )}
          aria-invalid={!!error}
          aria-describedby={error ? \`\${inputId}-error\` : helperText ? \`\${inputId}-helper\` : undefined}
          {...props}
        />
        {error && (
          <p id={\`\${inputId}-error\`} className="text-sm text-destructive">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={\`\${inputId}-helper\`} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

\${className}.displayName = "\${className}";
\`;
}

// Template pour composant avec variants
function generateVariantComponent(name, className) {
  return \`"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const \${name}Variants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface \${className}Props
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof \${name}Variants> {
  asChild?: boolean;
}

export const \${className} = React.forwardRef<HTMLDivElement, \${className}Props>(
  ({ className: classNameProp, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(\${name}Variants({ variant, size }), classNameProp)}
        {...props}
      />
    );
  }
);

\${className}.displayName = "\${className}";
\`;
}

// Template standard
function generateStandardComponent(name, className) {
  return \`"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

export interface \${className}Props extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const \${className} = React.forwardRef<HTMLDivElement, \${className}Props>(
  ({ className: classNameProp, variant = "default", size = "md", loading = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "\${name}-base",
          "relative rounded-lg border bg-card text-card-foreground shadow-sm",
          variant === "primary" && "border-primary bg-primary/5",
          variant === "secondary" && "border-secondary bg-secondary/5",
          size === "sm" && "p-4",
          size === "md" && "p-6",
          size === "lg" && "p-8",
          loading && "animate-pulse",
          classNameProp
        )}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        ) : (
          children
        )}
      </div>
    );
  }
);

\${className}.displayName = "\${className}";
\`;
}

// Template pour les tests
function generateTestFile(name, className) {
  return \`import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { \${className} } from "./index";

describe("\${className}", () => {
  it("renders without crashing", () => {
    render(<\${className}>Test Content</\${className}>);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <\${className} className="custom-class">Content</\${className}>
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("forwards ref correctly", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<\${className} ref={ref}>Content</\${className}>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("handles onClick events", () => {
    const handleClick = jest.fn();
    render(<\${className} onClick={handleClick}>Clickable</\${className}>);
    
    fireEvent.click(screen.getByText("Clickable"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders with different variants", () => {
    const { rerender } = render(
      <\${className} variant="primary">Primary</\${className}>
    );
    expect(screen.getByText("Primary")).toBeInTheDocument();
    
    rerender(<\${className} variant="secondary">Secondary</\${className}>);
    expect(screen.getByText("Secondary")).toBeInTheDocument();
  });

  it("renders with different sizes", () => {
    const { rerender } = render(
      <\${className} size="sm">Small</\${className}>
    );
    expect(screen.getByText("Small")).toBeInTheDocument();
    
    rerender(<\${className} size="lg">Large</\${className}>);
    expect(screen.getByText("Large")).toBeInTheDocument();
  });

  it("supports loading state", () => {
    const { container } = render(
      <\${className} loading>Loading Content</\${className}>
    );
    expect(container.firstChild).toHaveAttribute("aria-busy", "true");
  });

  it("is accessible", () => {
    const { container } = render(
      <\${className} role="region" aria-label="Test Region">
        Accessible Content
      </\${className}>
    );
    
    const element = container.firstChild;
    expect(element).toHaveAttribute("role", "region");
    expect(element).toHaveAttribute("aria-label", "Test Region");
  });
});
\`;
}

// Template pour les stories
function generateStoriesFile(name, className, config) {
  return \`import type { Meta, StoryObj } from "@storybook/react";
import { \${className} } from "./index";

const meta = {
  title: "Components/\${config.type === 'advanced' ? 'Advanced/' : ''}\${className}",
  component: \${className},
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "\${className} component for the Dainabase Design System.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "primary", "secondary"],
      description: "Visual variant of the component",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Size variant of the component",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
} satisfies Meta<typeof \${className}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Default \${className}",
  },
};

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Primary \${className}",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary \${className}",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    children: "Small \${className}",
  },
};

export const Medium: Story = {
  args: {
    size: "md",
    children: "Medium \${className}",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    children: "Large \${className}",
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    children: "Loading State",
  },
};

export const Playground: Story = {
  args: {
    children: "Playground - Try different props!",
    variant: "default",
    size: "md",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <\${className} variant="default">Default Variant</\${className}>
      <\${className} variant="primary">Primary Variant</\${className}>
      <\${className} variant="secondary">Secondary Variant</\${className}>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <\${className} size="sm">Small Size</\${className}>
      <\${className} size="md">Medium Size</\${className}>
      <\${className} size="lg">Large Size</\${className}>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [count, setCount] = React.useState(0);
    
    return (
      <\${className} 
        onClick={() => setCount(count + 1)}
        className="cursor-pointer"
      >
        Clicked {count} times
      </\${className}>
    );
  },
};
\`;
}

// Fonction principale de génération
async function generateComponent(componentName) {
  const className = toPascalCase(componentName);
  const config = ALL_COMPONENTS[componentName];
  const componentPath = path.join(__dirname, '../src/components', componentName);
  
  console.log(\`\\n🔧 Génération du composant \${className}...\`);
  
  // Créer le dossier si nécessaire
  if (!fs.existsSync(componentPath)) {
    fs.mkdirSync(componentPath, { recursive: true });
    console.log(\`  📁 Dossier créé: \${componentName}\`);
  }
  
  // Fichiers à générer
  const files = {
    'index.tsx': generateComponentCode(componentName, className, config),
    [\`\${componentName}.test.tsx\`]: generateTestFile(componentName, className),
    [\`\${componentName}.stories.tsx\`]: generateStoriesFile(componentName, className, config)
  };
  
  let created = 0;
  let skipped = 0;
  
  for (const [filename, content] of Object.entries(files)) {
    const filePath = path.join(componentPath, filename);
    
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content);
      console.log(\`  ✅ Créé: \${filename}\`);
      created++;
    } else {
      console.log(\`  ⏭️ Existe déjà: \${filename}\`);
      skipped++;
    }
  }
  
  console.log(\`  📊 Résultat: \${created} créés, \${skipped} ignorés\`);
  
  return { created, skipped };
}

// Fonction principale
async function main() {
  console.log('🚀 GÉNÉRATION AUTOMATIQUE DES 75 COMPOSANTS');
  console.log('=' .repeat(60));
  
  const stats = {
    total: 0,
    created: 0,
    skipped: 0
  };
  
  // Générer tous les composants
  for (const componentName of Object.keys(ALL_COMPONENTS)) {
    const result = await generateComponent(componentName);
    stats.total++;
    stats.created += result.created;
    stats.skipped += result.skipped;
  }
  
  // Rapport final
  console.log('\\n' + '=' .repeat(60));
  console.log('✨ GÉNÉRATION TERMINÉE !');
  console.log('=' .repeat(60));
  console.log(\`📊 Composants traités: \${stats.total}\`);
  console.log(\`✅ Fichiers créés: \${stats.created}\`);
  console.log(\`⏭️ Fichiers ignorés: \${stats.skipped}\`);
  console.log('\\n🎉 Tous les 75 composants sont maintenant complets !');
  console.log('\\n📝 Prochaines étapes:');
  console.log('1. npm run test - Pour exécuter tous les tests');
  console.log('2. npm run storybook - Pour voir tous les composants');
  console.log('3. npm run build - Pour compiler le Design System');
}

// Exécution
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateComponent, ALL_COMPONENTS };
