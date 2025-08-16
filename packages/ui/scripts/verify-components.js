#!/usr/bin/env node
/**
 * 🚀 SCRIPT DE VÉRIFICATION ET GÉNÉRATION AUTOMATIQUE
 * Vérifie et complète les 75 composants du Design System
 */

const fs = require('fs');
const path = require('path');

// Liste complète des 75 composants
const CORE_COMPONENTS = [
  'accordion', 'alert', 'avatar', 'badge', 'breadcrumb', 'button',
  'calendar', 'card', 'carousel', 'chart', 'checkbox', 'collapsible',
  'color-picker', 'command-palette', 'context-menu', 'data-grid',
  'data-grid-advanced', 'date-picker', 'date-range-picker', 'dialog',
  'dropdown-menu', 'error-boundary', 'file-upload', 'form', 'forms-demo',
  'hover-card', 'icon', 'input', 'label', 'menubar', 'navigation-menu',
  'pagination', 'popover', 'progress', 'radio-group', 'rating',
  'resizable', 'scroll-area', 'select', 'separator', 'sheet', 'skeleton',
  'slider', 'sonner', 'stepper', 'switch', 'table', 'tabs',
  'text-animations', 'textarea', 'timeline', 'toast', 'toggle',
  'toggle-group', 'tooltip', 'ui-provider'
];

const ADVANCED_COMPONENTS = [
  'advanced-filter', 'alert-dialog', 'app-shell', 'audio-recorder',
  'code-editor', 'dashboard-grid', 'drawer', 'drag-drop-grid',
  'image-cropper', 'infinite-scroll', 'kanban', 'mentions',
  'notification-center', 'pdf-viewer', 'rich-text-editor',
  'search-bar', 'tag-input', 'theme-builder', 'theme-toggle',
  'tree-view', 'video-player', 'virtual-list', 'virtualized-table'
];

const ALL_COMPONENTS = [...CORE_COMPONENTS, ...ADVANCED_COMPONENTS];

// Templates pour générer les fichiers manquants
const TEMPLATES = {
  // Template pour index.tsx
  indexTsx: (name, className) => `import * as React from "react";
import { cn } from "../../lib/utils";

export interface ${className}Props extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export const ${className} = React.forwardRef<HTMLDivElement, ${className}Props>(
  ({ className: classNameProp, variant = "default", size = "md", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "${name}-base",
          variant && \`${name}-\${variant}\`,
          size && \`${name}-\${size}\`,
          classNameProp
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

${className}.displayName = "${className}";
`,

  // Template pour index.ts (export simple)
  indexTs: (className) => `export * from "./${className.toLowerCase()}";
export type { ${className}Props } from "./${className.toLowerCase()}";
`,

  // Template pour test.tsx
  testTsx: (name, className) => `import { render, screen } from "@testing-library/react";
import { ${className} } from "./index";

describe("${className}", () => {
  it("renders without crashing", () => {
    render(<${className}>Test Content</${className}>);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <${className} className="custom-class">Content</${className}>
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("forwards ref correctly", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<${className} ref={ref}>Content</${className}>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("renders with different variants", () => {
    const { rerender, container } = render(
      <${className} variant="primary">Content</${className}>
    );
    expect(container.firstChild).toHaveClass("${name}-primary");
    
    rerender(<${className} variant="secondary">Content</${className}>);
    expect(container.firstChild).toHaveClass("${name}-secondary");
  });

  it("renders with different sizes", () => {
    const { rerender, container } = render(
      <${className} size="sm">Content</${className}>
    );
    expect(container.firstChild).toHaveClass("${name}-sm");
    
    rerender(<${className} size="lg">Content</${className}>);
    expect(container.firstChild).toHaveClass("${name}-lg");
  });
});
`,

  // Template pour stories.tsx
  storiesTsx: (name, className) => `import type { Meta, StoryObj } from "@storybook/react";
import { ${className} } from "./index";

const meta = {
  title: "Components/${className}",
  component: ${className},
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "primary", "secondary"],
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof ${className}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Default ${className}",
  },
};

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Primary ${className}",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary ${className}",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    children: "Small ${className}",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    children: "Large ${className}",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <${className} variant="default">Default Variant</${className}>
      <${className} variant="primary">Primary Variant</${className}>
      <${className} variant="secondary">Secondary Variant</${className}>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <${className} size="sm">Small Size</${className}>
      <${className} size="md">Medium Size</${className}>
      <${className} size="lg">Large Size</${className}>
    </div>
  ),
};
`
};

// Fonction pour convertir kebab-case en PascalCase
function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

// Rapport de vérification
const report = {
  total: ALL_COMPONENTS.length,
  complete: [],
  incomplete: [],
  missing: {
    index: [],
    test: [],
    stories: []
  }
};

console.log('🚀 VÉRIFICATION DES 75 COMPOSANTS DU DESIGN SYSTEM');
console.log('=' .repeat(60));
console.log(\`📊 Total: \${ALL_COMPONENTS.length} composants\`);
console.log(\`📦 Core: \${CORE_COMPONENTS.length} | Advanced: \${ADVANCED_COMPONENTS.length}\`);
console.log('=' .repeat(60));

// Fonction pour générer les fichiers manquants
function generateMissingFiles(componentName, componentPath, className) {
  const files = {
    'index.tsx': TEMPLATES.indexTsx(componentName, className),
    'index.ts': TEMPLATES.indexTs(className),
    [\`\${componentName}.tsx\`]: TEMPLATES.indexTsx(componentName, className),
    [\`\${componentName}.test.tsx\`]: TEMPLATES.testTsx(componentName, className),
    [\`\${componentName}.stories.tsx\`]: TEMPLATES.storiesTsx(componentName, className)
  };

  console.log(\`\\n🔧 Génération des fichiers pour \${className}:\`);
  
  Object.entries(files).forEach(([filename, content]) => {
    const filePath = path.join(componentPath, filename);
    if (!fs.existsSync(filePath)) {
      console.log(\`  ✅ Création: \${filename}\`);
      // En mode simulation, on affiche juste ce qui serait créé
      // fs.writeFileSync(filePath, content);
    }
  });
}

// Vérification de chaque composant
ALL_COMPONENTS.forEach((componentName, index) => {
  const className = toPascalCase(componentName);
  const componentPath = path.join(__dirname, '../src/components', componentName);
  
  console.log(\`\\n[\${index + 1}/\${ALL_COMPONENTS.length}] 🔍 \${className}\`);
  
  // Vérifier si le dossier existe
  if (!fs.existsSync(componentPath)) {
    console.log(\`  ❌ Dossier manquant: \${componentName}\`);
    report.missing.index.push(componentName);
    // Créer le dossier et les fichiers
    // fs.mkdirSync(componentPath, { recursive: true });
    // generateMissingFiles(componentName, componentPath, className);
    return;
  }
  
  // Vérifier les fichiers requis
  const requiredFiles = {
    index: ['index.tsx', 'index.ts', \`\${componentName}.tsx\`],
    test: [\`\${componentName}.test.tsx\`, 'test.tsx'],
    stories: [\`\${componentName}.stories.tsx\`, 'stories.tsx']
  };
  
  const hasIndex = requiredFiles.index.some(f => 
    fs.existsSync(path.join(componentPath, f))
  );
  const hasTest = requiredFiles.test.some(f => 
    fs.existsSync(path.join(componentPath, f))
  );
  const hasStories = requiredFiles.stories.some(f => 
    fs.existsSync(path.join(componentPath, f))
  );
  
  const status = [];
  if (hasIndex) status.push('✅ Code');
  else {
    status.push('❌ Code');
    report.missing.index.push(componentName);
  }
  
  if (hasTest) status.push('✅ Tests');
  else {
    status.push('⚠️ Tests');
    report.missing.test.push(componentName);
  }
  
  if (hasStories) status.push('✅ Stories');
  else {
    status.push('⚠️ Stories');
    report.missing.stories.push(componentName);
  }
  
  console.log(\`  Status: \${status.join(' | ')}\`);
  
  if (hasIndex && hasTest && hasStories) {
    report.complete.push(componentName);
  } else {
    report.incomplete.push(componentName);
    // Générer les fichiers manquants
    if (!hasIndex || !hasTest || !hasStories) {
      // generateMissingFiles(componentName, componentPath, className);
    }
  }
});

// Afficher le rapport final
console.log('\\n' + '=' .repeat(60));
console.log('📊 RAPPORT FINAL');
console.log('=' .repeat(60));
console.log(\`✅ Complets: \${report.complete.length}/\${report.total}\`);
console.log(\`⚠️ Incomplets: \${report.incomplete.length}/\${report.total}\`);
console.log(\`❌ Code manquant: \${report.missing.index.length}\`);
console.log(\`⚠️ Tests manquants: \${report.missing.test.length}\`);
console.log(\`⚠️ Stories manquantes: \${report.missing.stories.length}\`);

// Calculer le pourcentage de complétude
const completionRate = Math.round((report.complete.length / report.total) * 100);
console.log(\`\\n📈 Taux de complétude: \${completionRate}%\`);

// Afficher les actions nécessaires
if (report.incomplete.length > 0) {
  console.log('\\n🔧 ACTIONS NÉCESSAIRES:');
  console.log('Pour compléter le Design System, exécutez:');
  console.log('npm run generate:missing-components');
  console.log('\\nCela va créer automatiquement:');
  console.log(\`- \${report.missing.index.length} fichiers de composants\`);
  console.log(\`- \${report.missing.test.length} fichiers de tests\`);
  console.log(\`- \${report.missing.stories.length} fichiers Storybook\`);
}

// Exporter le rapport en JSON
const reportPath = path.join(__dirname, '../component-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(\`\\n📄 Rapport détaillé sauvegardé: component-report.json\`);

console.log('\\n✨ Vérification terminée!');
