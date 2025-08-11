/**
 * Simple Documentation Generator - Batch Create Docs via GitHub API
 * Run this to generate all component docs at once
 */

const COMPONENTS_TO_DOCUMENT = [
  // Core (3)
  { name: 'icon', category: 'Core', description: 'Flexible icon component wrapping Lucide React icons' },
  { name: 'label', category: 'Core', description: 'Semantic label component for form inputs' },
  { name: 'separator', category: 'Core', description: 'Visual divider for content sections' },
  
  // Layout (4)
  { name: 'card', category: 'Layout', description: 'Container with header, content, and footer sections' },
  { name: 'resizable', category: 'Layout', description: 'Resizable panel component' },
  { name: 'scroll-area', category: 'Layout', description: 'Custom scrollable area with styled scrollbars' },
  { name: 'collapsible', category: 'Layout', description: 'Expandable/collapsible content container' },
  
  // Forms (12)
  { name: 'form', category: 'Forms', description: 'Complete form with validation and error handling' },
  { name: 'input', category: 'Forms', description: 'Versatile text input with validation support' },
  { name: 'textarea', category: 'Forms', description: 'Multi-line text input component' },
  { name: 'select', category: 'Forms', description: 'Dropdown selection with search and multi-select' },
  { name: 'checkbox', category: 'Forms', description: 'Checkbox input for boolean values' },
  { name: 'radio-group', category: 'Forms', description: 'Radio button group for single selection' },
  { name: 'switch', category: 'Forms', description: 'Toggle switch for on/off states' },
  { name: 'slider', category: 'Forms', description: 'Range slider for numeric input' },
  { name: 'date-picker', category: 'Forms', description: 'Calendar-based date selection' },
  { name: 'date-range-picker', category: 'Forms', description: 'Select date ranges with calendar' },
  { name: 'color-picker', category: 'Forms', description: 'Visual color selection tool' },
  { name: 'file-upload', category: 'Forms', description: 'File upload with drag and drop' },
  { name: 'rating', category: 'Forms', description: 'Star rating input component' },
  
  // Data Display (6)
  { name: 'table', category: 'Data', description: 'Responsive table for structured data' },
  { name: 'data-grid', category: 'Data', description: 'Advanced data grid with sorting and filtering' },
  { name: 'data-grid-adv', category: 'Data', description: 'Enterprise data grid with all features' },
  { name: 'charts', category: 'Data', description: 'Chart components for data visualization' },
  { name: 'timeline', category: 'Data', description: 'Timeline display for chronological data' },
  { name: 'calendar', category: 'Data', description: 'Calendar view for events and scheduling' },
  
  // Navigation (5)
  { name: 'navigation-menu', category: 'Navigation', description: 'Main navigation menu component' },
  { name: 'tabs', category: 'Navigation', description: 'Tabbed content organization' },
  { name: 'stepper', category: 'Navigation', description: 'Step-by-step progress indicator' },
  { name: 'pagination', category: 'Navigation', description: 'Page navigation controls' },
  { name: 'menubar', category: 'Navigation', description: 'Horizontal menu bar component' },
  
  // Feedback (6)
  { name: 'alert', category: 'Feedback', description: 'Display important messages and notifications' },
  { name: 'toast', category: 'Feedback', description: 'Temporary notification messages' },
  { name: 'sonner', category: 'Feedback', description: 'Advanced toast notification system' },
  { name: 'progress', category: 'Feedback', description: 'Progress indicator for tasks' },
  { name: 'skeleton', category: 'Feedback', description: 'Loading placeholder component' },
  { name: 'badge', category: 'Feedback', description: 'Small labeling component' },
  
  // Overlays (7)
  { name: 'dialog', category: 'Overlays', description: 'Modal dialog for user interactions' },
  { name: 'sheet', category: 'Overlays', description: 'Slide-out panel overlay' },
  { name: 'popover', category: 'Overlays', description: 'Floating content container' },
  { name: 'tooltip', category: 'Overlays', description: 'Hover information display' },
  { name: 'hover-card', category: 'Overlays', description: 'Rich content on hover' },
  { name: 'dropdown-menu', category: 'Overlays', description: 'Contextual dropdown menu' },
  { name: 'context-menu', category: 'Overlays', description: 'Right-click context menu' },
  
  // Advanced (14)
  { name: 'command-palette', category: 'Advanced', description: 'Command search and execution' },
  { name: 'carousel', category: 'Advanced', description: 'Image and content carousel' },
  { name: 'accordion', category: 'Advanced', description: 'Collapsible content sections' },
  { name: 'avatar', category: 'Advanced', description: 'User avatar display component' },
  { name: 'text-animations', category: 'Advanced', description: 'Animated text effects' },
  { name: 'error-boundary', category: 'Advanced', description: 'Error handling wrapper' },
  { name: 'toggle', category: 'Advanced', description: 'Toggle button component' },
  { name: 'toggle-group', category: 'Advanced', description: 'Group of toggle buttons' },
  { name: 'ui-provider', category: 'Advanced', description: 'UI context provider' },
  { name: 'forms-demo', category: 'Advanced', description: 'Form components showcase' }
];

function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function toTitleCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function generateDocContent(component) {
  const pascalName = toPascalCase(component.name);
  const titleName = toTitleCase(component.name);
  
  return `# ${titleName}

${component.description}

## Import

\`\`\`tsx
import { ${pascalName} } from '@dainabase/ui/${component.name}';
\`\`\`

## Basic Usage

\`\`\`tsx
import { ${pascalName} } from '@dainabase/ui/${component.name}';

export default function ${pascalName}Example() {
  return (
    <${pascalName}>
      {/* Your content here */}
    </${pascalName}>
  );
}
\`\`\`

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| className | \`string\` | - | No | Additional CSS classes |
| children | \`ReactNode\` | - | No | Child elements |
| ...props | \`HTMLAttributes\` | - | No | Standard HTML attributes |

## Examples

### Basic ${titleName}

\`\`\`tsx
<${pascalName}>
  Basic ${component.name} example
</${pascalName}>
\`\`\`

### ${titleName} with Custom Styling

\`\`\`tsx
<${pascalName} className="custom-class">
  Styled ${component.name} example
</${pascalName}>
\`\`\`

### Advanced ${titleName} Usage

\`\`\`tsx
import { ${pascalName} } from '@dainabase/ui/${component.name}';
import { useState } from 'react';

function ${pascalName}Advanced() {
  const [state, setState] = useState(false);
  
  return (
    <${pascalName}
      className="w-full"
      onClick={() => setState(!state)}
    >
      Advanced usage example
    </${pascalName}>
  );
}
\`\`\`

## Accessibility

- Semantic HTML elements
- Proper ARIA attributes
- Keyboard navigation support
- Screen reader compatibility
- Focus management

## Best Practices

1. Use semantic variants for different contexts
2. Maintain consistent styling across your app
3. Consider accessibility requirements
4. Test across different devices and browsers
5. Follow React best practices

## Common Use Cases

- Building modern user interfaces
- Creating responsive web applications
- Implementing design systems
- Rapid prototyping
- Production-ready components

## API Reference

### ${pascalName} Component

The main ${component.name} component accepts all standard HTML attributes plus:

- \`className\`: Additional CSS classes for styling
- \`ref\`: React ref for direct DOM access
- \`children\`: Content to render inside the component

## Styling

The ${titleName} component supports multiple styling approaches:

### Tailwind CSS Classes
\`\`\`tsx
<${pascalName} className="bg-gray-100 p-4 rounded-lg" />
\`\`\`

### CSS Modules
\`\`\`tsx
<${pascalName} className={styles.custom${pascalName}} />
\`\`\`

### Inline Styles
\`\`\`tsx
<${pascalName} style={{ backgroundColor: '#f0f0f0' }} />
\`\`\`

## TypeScript

Full TypeScript support with type definitions:

\`\`\`tsx
import { ${pascalName}, ${pascalName}Props } from '@dainabase/ui/${component.name}';

const MyComponent: React.FC<${pascalName}Props> = (props) => {
  return <${pascalName} {...props} />;
};
\`\`\`

## Testing

Example test with React Testing Library:

\`\`\`tsx
import { render, screen } from '@testing-library/react';
import { ${pascalName} } from '@dainabase/ui/${component.name}';

describe('${pascalName}', () => {
  it('renders correctly', () => {
    render(<${pascalName}>Test Content</${pascalName}>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
\`\`\`

## Performance Considerations

- Lazy loading support via React.lazy()
- Minimal bundle size impact
- Optimized re-renders
- Tree-shaking friendly

## Migration Guide

Migrating from other libraries:

### From Material-UI
\`\`\`tsx
// Before (MUI)
<MuiComponent />

// After (Directus UI)
<${pascalName} />
\`\`\`

### From Ant Design
\`\`\`tsx
// Before (Ant Design)
<AntComponent />

// After (Directus UI)
<${pascalName} />
\`\`\`

## Related Components

- [Button](./button.md)
- [Card](./card.md)
- [Form](./form.md)
- [Input](./input.md)

## Resources

- [Component Source](https://github.com/dainabase/directus-unified-platform/tree/main/packages/ui/src/components/${component.name})
- [Storybook Demo](https://directus-ui.vercel.app/?path=/story/${component.name})
- [Design System Guidelines](../guides/design-system.md)

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>
`;
}

// Generate the list of components and their docs
console.log('📝 Documentation Generation Plan');
console.log('================================');
console.log(`Total components to document: ${COMPONENTS_TO_DOCUMENT.length}`);
console.log('\nComponents by category:');

const byCategory = {};
COMPONENTS_TO_DOCUMENT.forEach(comp => {
  if (!byCategory[comp.category]) byCategory[comp.category] = [];
  byCategory[comp.category].push(comp.name);
});

Object.entries(byCategory).forEach(([cat, comps]) => {
  console.log(`\n${cat} (${comps.length}):`);
  console.log(comps.join(', '));
});

console.log('\n\n📦 Sample Documentation Output:');
console.log('================================');
console.log('Generating sample for "icon" component...\n');
console.log(generateDocContent(COMPONENTS_TO_DOCUMENT[0]).substring(0, 1000) + '...');

console.log('\n\n🚀 Ready to Generate All Documentation');
console.log('=====================================');
console.log('This script will create 57 markdown files in /docs/components/');
console.log('\nTo execute via GitHub API, each component needs to be created individually.');
console.log('Run the generate-batch.js script to create all files automatically.');

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { COMPONENTS_TO_DOCUMENT, generateDocContent };
}
