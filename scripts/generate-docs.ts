#!/usr/bin/env tsx
/**
 * Automated Documentation Generator for directus-unified-platform
 * Generates component documentation based on the button.md template
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';

// Component categories and their descriptions
const COMPONENT_CATEGORIES = {
  core: {
    name: 'Core',
    description: 'Essential building blocks',
    components: ['icon', 'label', 'separator']
  },
  layout: {
    name: 'Layout',
    description: 'Structural components',
    components: ['card', 'resizable', 'scroll-area', 'collapsible']
  },
  forms: {
    name: 'Forms',
    description: 'Form inputs and controls',
    components: ['form', 'input', 'textarea', 'select', 'checkbox', 'radio-group', 
                 'switch', 'slider', 'date-picker', 'date-range-picker', 
                 'color-picker', 'file-upload', 'rating']
  },
  data: {
    name: 'Data Display',
    description: 'Data visualization and tables',
    components: ['table', 'data-grid', 'data-grid-adv', 'charts', 'timeline', 'calendar']
  },
  navigation: {
    name: 'Navigation',
    description: 'Navigation and routing components',
    components: ['navigation-menu', 'tabs', 'stepper', 'pagination', 'menubar']
  },
  feedback: {
    name: 'Feedback',
    description: 'User feedback and status',
    components: ['alert', 'toast', 'sonner', 'progress', 'skeleton', 'badge']
  },
  overlays: {
    name: 'Overlays',
    description: 'Modal and popup components',
    components: ['dialog', 'sheet', 'popover', 'tooltip', 'hover-card', 
                 'dropdown-menu', 'context-menu']
  },
  advanced: {
    name: 'Advanced',
    description: 'Complex and specialized components',
    components: ['command-palette', 'carousel', 'accordion', 'avatar', 
                 'text-animations', 'error-boundary', 'toggle', 'toggle-group', 
                 'ui-provider', 'forms-demo']
  }
};

// Find component category
function getComponentCategory(componentName: string): string {
  for (const [key, category] of Object.entries(COMPONENT_CATEGORIES)) {
    if (category.components.includes(componentName)) {
      return category.name;
    }
  }
  return 'Uncategorized';
}

// Convert kebab-case to PascalCase
function toPascalCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

// Convert kebab-case to Title Case
function toTitleCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Extract props from TypeScript file
async function extractPropsFromFile(filePath: string): Promise<{
  props: Array<{name: string, type: string, required: boolean, description: string}>,
  hasForwardRef: boolean,
  componentName: string
}> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Extract interface definition
    const interfaceMatch = content.match(/export\s+interface\s+(\w+Props)\s+(?:extends\s+[^{]+)?\{([^}]+)\}/s);
    if (!interfaceMatch) {
      return { props: [], hasForwardRef: false, componentName: '' };
    }
    
    const componentName = interfaceMatch[1].replace('Props', '');
    const propsContent = interfaceMatch[2];
    
    // Parse individual props
    const props: Array<{name: string, type: string, required: boolean, description: string}> = [];
    const propLines = propsContent.split('\n').filter(line => line.trim());
    
    for (const line of propLines) {
      // Skip comments
      if (line.trim().startsWith('//') || line.trim().startsWith('/*')) continue;
      
      // Match prop definition
      const propMatch = line.match(/^\s*(\w+)(\?)?:\s*([^;]+);?/);
      if (propMatch) {
        const [, name, optional, type] = propMatch;
        
        // Extract comment if exists
        const commentMatch = content.match(new RegExp(`\\/\\*\\*[^*]*\\*\\/\\s*${name}\\??:`));
        const description = commentMatch ? 
          commentMatch[0].replace(/\/\*\*|\*\/|^\s*\*\s*/gm, '').trim() : '';
        
        props.push({
          name,
          type: type.trim(),
          required: !optional,
          description
        });
      }
    }
    
    // Check if component uses forwardRef
    const hasForwardRef = content.includes('forwardRef');
    
    return { props, hasForwardRef, componentName };
  } catch (error) {
    console.error(`Error extracting props from ${filePath}:`, error);
    return { props: [], hasForwardRef: false, componentName: '' };
  }
}

// Generate documentation for a component
async function generateComponentDoc(
  componentName: string,
  componentPath: string
): Promise<string> {
  const pascalName = toPascalCase(componentName);
  const titleName = toTitleCase(componentName);
  const category = getComponentCategory(componentName);
  
  // Extract props from the component file
  const indexPath = path.join(componentPath, 'index.tsx');
  const { props, hasForwardRef, componentName: extractedName } = await extractPropsFromFile(indexPath);
  
  // Check if stories file exists
  const hasStories = await fs.access(path.join(componentPath, `${componentName}.stories.tsx`))
    .then(() => true)
    .catch(() => false);
  
  // Generate props table
  const propsTable = props.length > 0 ? `
## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
${props.map(prop => 
  `| ${prop.name} | \`${prop.type.replace(/\|/g, '\\|')}\` | - | ${prop.required ? 'Yes' : 'No'} | ${prop.description || '-'} |`
).join('\n')}` : '';

  // Generate the documentation
  return `# ${titleName}

${getComponentDescription(componentName)}

## Import

\`\`\`tsx
import { ${pascalName} } from '@dainabase/ui/${componentName}';
\`\`\`

## Basic Usage

\`\`\`tsx
import { ${pascalName} } from '@dainabase/ui/${componentName}';

export default function ${pascalName}Example() {
  return (
    <${pascalName}${getBasicProps(componentName)}>
      ${getBasicContent(componentName)}
    </${pascalName}>
  );
}
\`\`\`
${propsTable}

## Examples

### Basic ${titleName}

\`\`\`tsx
<${pascalName}${getBasicExampleProps(componentName)}>
  ${getBasicContent(componentName)}
</${pascalName}>
\`\`\`

### ${titleName} with Custom Styling

\`\`\`tsx
<${pascalName} 
  className="custom-class"${getCustomExampleProps(componentName)}>
  ${getCustomContent(componentName)}
</${pascalName}>
\`\`\`

## Accessibility

${getAccessibilityNotes(componentName)}

## Best Practices

${getBestPractices(componentName)}

## Common Use Cases

${getCommonUseCases(componentName)}

## Related Components

${getRelatedComponents(componentName)}

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>
`;
}

// Helper functions for content generation
function getComponentDescription(name: string): string {
  const descriptions: Record<string, string> = {
    'icon': 'A flexible icon component that wraps Lucide React icons with consistent styling and sizing.',
    'label': 'A semantic label component for form inputs and UI elements.',
    'separator': 'A visual divider to separate content sections.',
    'card': 'A container component with optional header, content, and footer sections.',
    'input': 'A versatile text input component with validation and styling support.',
    'dialog': 'A modal dialog overlay for important user interactions.',
    'alert': 'Display important messages and notifications to users.',
    'table': 'A responsive table component for displaying structured data.',
    'form': 'A complete form component with validation and error handling.',
    'select': 'A dropdown selection component with search and multi-select support.',
    'tabs': 'Organize content into tabbed sections for better navigation.',
    'toast': 'Show temporary notifications and feedback messages.',
    'tooltip': 'Display helpful information on hover or focus.',
    'badge': 'Small count and labeling component for highlighting information.',
    'progress': 'Show the completion progress of a task or process.',
    // Add more descriptions as needed
  };
  
  return descriptions[name] || `A ${name.replace(/-/g, ' ')} component for building modern user interfaces.`;
}

function getBasicProps(name: string): string {
  const props: Record<string, string> = {
    'icon': ' name="search" size={24}',
    'input': ' placeholder="Enter text"',
    'button': ' variant="primary"',
    'badge': ' variant="default"',
    'alert': ' variant="info"',
    // Add more as needed
  };
  return props[name] || '';
}

function getBasicContent(name: string): string {
  const content: Record<string, string> = {
    'card': 'Card content',
    'dialog': 'Dialog content',
    'alert': 'Alert message',
    'badge': '42',
    'label': 'Label text',
    // Add more as needed
  };
  return content[name] || 'Content';
}

function getBasicExampleProps(name: string): string {
  return getBasicProps(name);
}

function getCustomExampleProps(name: string): string {
  const props: Record<string, string> = {
    'icon': '\n  name="settings"\n  size={32}\n  className="text-primary"',
    'input': '\n  type="email"\n  required',
    // Add more as needed
  };
  return props[name] || '';
}

function getCustomContent(name: string): string {
  return getBasicContent(name);
}

function getAccessibilityNotes(name: string): string {
  const notes: Record<string, string> = {
    'form': '- Proper label associations\n- Error message announcements\n- Keyboard navigation support\n- ARIA attributes for screen readers',
    'dialog': '- Focus management\n- Escape key to close\n- Focus trap within dialog\n- Proper ARIA roles and labels',
    'input': '- Associated label elements\n- Error state announcements\n- Required field indicators\n- Keyboard navigation',
    // Add more as needed
  };
  
  return notes[name] || 
    '- Semantic HTML elements\n- Proper ARIA attributes\n- Keyboard navigation support\n- Screen reader compatibility';
}

function getBestPractices(name: string): string {
  const practices: Record<string, string> = {
    'form': '1. Always validate user input\n2. Provide clear error messages\n3. Use appropriate input types\n4. Include helpful placeholders',
    'dialog': '1. Use for important interactions only\n2. Keep content focused and concise\n3. Provide clear action buttons\n4. Always include a way to dismiss',
    // Add more as needed
  };
  
  return practices[name] || 
    '1. Use semantic variants for different contexts\n2. Maintain consistent styling across your app\n3. Consider accessibility requirements\n4. Test across different devices and browsers';
}

function getCommonUseCases(name: string): string {
  const useCases: Record<string, string> = {
    'icon': '- Navigation menus\n- Button icons\n- Status indicators\n- Decorative elements',
    'form': '- User registration\n- Contact forms\n- Settings panels\n- Data entry',
    'dialog': '- Confirmation dialogs\n- Form modals\n- Information popups\n- Media viewers',
    // Add more as needed
  };
  
  return useCases[name] || 
    '- User interfaces\n- Web applications\n- Dashboard components\n- Interactive elements';
}

function getRelatedComponents(name: string): string {
  const related: Record<string, string> = {
    'input': '- [Form](./form.md)\n- [Label](./label.md)\n- [Textarea](./textarea.md)',
    'dialog': '- [Sheet](./sheet.md)\n- [Alert](./alert.md)\n- [Popover](./popover.md)',
    'toast': '- [Alert](./alert.md)\n- [Sonner](./sonner.md)\n- [Badge](./badge.md)',
    // Add more as needed
  };
  
  return related[name] || '- [Button](./button.md)\n- [Card](./card.md)\n- [Form](./form.md)';
}

// Main function
async function main() {
  console.log('🚀 Starting documentation generation...\n');
  
  const componentsPath = path.join(process.cwd(), 'packages/ui/src/components');
  const docsPath = path.join(process.cwd(), 'docs/components');
  
  // Get all component directories
  const componentDirs = await fs.readdir(componentsPath);
  
  // Skip button as it's already documented
  const componentsToDocument = componentDirs.filter(dir => dir !== 'button');
  
  console.log(`📦 Found ${componentsToDocument.length} components to document\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const componentName of componentsToDocument) {
    try {
      const componentPath = path.join(componentsPath, componentName);
      
      // Check if it's a directory
      const stats = await fs.stat(componentPath);
      if (!stats.isDirectory()) continue;
      
      console.log(`📝 Generating documentation for ${componentName}...`);
      
      // Generate documentation
      const docContent = await generateComponentDoc(componentName, componentPath);
      
      // Write documentation file
      const docFilePath = path.join(docsPath, `${componentName}.md`);
      await fs.writeFile(docFilePath, docContent);
      
      console.log(`✅ Created ${componentName}.md`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error documenting ${componentName}:`, error);
      errorCount++;
    }
  }
  
  console.log(`
📊 Documentation Generation Complete!
✅ Successfully documented: ${successCount} components
❌ Errors: ${errorCount} components
📁 Documentation location: /docs/components/

Next steps:
1. Review generated documentation
2. Add specific examples where needed
3. Update component-specific details
4. Run validation checks
`);
}

// Run the script
main().catch(console.error);
