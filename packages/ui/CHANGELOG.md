# @dainabase/ui

## 0.2.0

### Minor Changes

- Initial public release of @dainabase/ui Design System
- Complete Apple-style Design System with shadcn/ui components
- 40+ production-ready components including:
  - Core components: Button, Card, Dialog, Sheet, Tabs, etc.
  - Form components with React Hook Form integration
  - Data visualization with Recharts
  - Advanced DataGrid with virtualization
  - Date/Time components
- Design tokens system for consistent theming
- Montserrat font integration
- Full TypeScript support
- Comprehensive Storybook documentation
- Accessibility-first approach with Radix UI
- GitHub Packages distribution

### Features

- **Components**: Button, Card, Dialog, Sheet, Tabs, CommandPalette, DataGrid, DatePicker, and 30+ more
- **Design Tokens**: Centralized tokens for colors, spacing, shadows, and radii
- **Storybook**: Complete documentation with stories and MDX docs for every component
- **TypeScript**: Full type safety and IntelliSense support
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation
- **Build**: ESM and CommonJS dual package with tree-shaking support

### Installation

```bash
# Configure GitHub Packages
echo "@dainabase:registry=https://npm.pkg.github.com/" >> .npmrc
echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc

# Install the package
pnpm add @dainabase/ui
```

### Usage

```tsx
import { Button, Card, Stack } from '@dainabase/ui';

export function MyComponent() {
  return (
    <Card>
      <Stack>
        <Button>Click me</Button>
      </Stack>
    </Card>
  );
}
```