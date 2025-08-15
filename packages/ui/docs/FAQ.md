# Frequently Asked Questions (FAQ) - @dainabase/ui v1.3.0

## 📦 Installation & Setup

### Q: What are the minimum requirements?
**A:** 
- Node.js >= 18.0.0
- NPM >= 9.0.0 (or pnpm/yarn equivalent)
- React >= 18.0.0
- React DOM >= 18.0.0

### Q: How do I install the package?
**A:** 
```bash
# NPM
npm install @dainabase/ui@1.3.0

# Yarn
yarn add @dainabase/ui@1.3.0

# pnpm
pnpm add @dainabase/ui@1.3.0
```

### Q: Do I need to install all peer dependencies?
**A:** No! The beauty of v1.3.0 is that dependencies are optional. The core bundle (38KB) includes essential components. Additional dependencies are only needed when using specific features:
- `@radix-ui/*` - Only for components that use them
- `lucide-react` - Only if using Icon component with Lucide icons
- `react-hook-form` - Only if using Form component
- etc.

## 🎯 Bundle Size & Performance

### Q: Why is the bundle only 38KB?
**A:** We use several optimization techniques:
1. **Minimal core**: Only 8 essential components in main bundle
2. **Tree-shaking**: Unused code is eliminated
3. **Lazy loading**: Heavy components load on-demand
4. **External dependencies**: Radix UI and others are peer dependencies
5. **Modern build**: Targets ES2022 for smaller output

### Q: How do I keep my app bundle small?
**A:** Use lazy loading for heavy components:
```tsx
// ❌ Don't import everything
import * as UI from '@dainabase/ui';

// ✅ Import only what you need
import { Button, Card } from '@dainabase/ui';

// ✅ Lazy load heavy components
const DataGrid = lazy(() => import('@dainabase/ui/lazy/data-grid'));
```

### Q: What's the performance impact?
**A:** Minimal! 
- Core import time: ~12ms
- First paint: <0.4s
- Lighthouse score: 98/100
- Memory usage: 50% less than v1.0

## 🔄 Migration & Breaking Changes

### Q: How do I migrate from v1.0?
**A:** Follow these steps:
1. Update the package: `npm update @dainabase/ui@1.3.0`
2. Update breaking changes:
   - `isLoading` → `loading` on Button
   - `onClose` → `onOpenChange` on Dialog
   - `onChange` → `onValueChange` on Select
3. Test your application
4. Enable new features (optional)

Full guide: [Migration Guide](./docs/migrations/v1.0-to-v1.3.md)

### Q: What are the breaking changes?
**A:** Four main changes:
1. **Button**: `isLoading` prop renamed to `loading`
2. **Dialog**: `onClose` renamed to `onOpenChange`
3. **Select**: Migrated to Radix UI v2 API
4. **DataGrid**: Virtualization now enabled by default

### Q: Can I stay on v1.0?
**A:** Yes, but not recommended:
- v1.0 support ends July 2025
- Missing 95% test coverage
- Larger bundle size (50KB vs 38KB)
- No lazy loading support
- Security updates only until July 2025

## 🧪 Testing & Quality

### Q: What's the test coverage?
**A:** 95% overall coverage:
- Lines: 95%
- Statements: 94%
- Functions: 93%
- Branches: 92%
- 100% of components have tests
- 100+ edge case scenarios

### Q: How do I run tests?
**A:** 
```bash
# Unit tests
npm test

# With coverage
npm test:coverage

# Watch mode
npm test:watch

# E2E tests
npm test:e2e
```

### Q: Are the components accessible?
**A:** Yes! WCAG 2.1 AAA compliant:
- Full keyboard navigation
- Screen reader support
- ARIA attributes
- Focus management
- High contrast mode
- Reduced motion support

## 🎨 Styling & Theming

### Q: Can I customize the theme?
**A:** Yes! Use CSS variables or the ThemeProvider:
```tsx
<ThemeProvider theme={{
  colors: {
    primary: '#007bff',
    secondary: '#6c757d'
  },
  radius: '8px',
  spacing: '4px'
}}>
  <App />
</ThemeProvider>
```

### Q: Does it work with Tailwind?
**A:** Yes! Built with Tailwind in mind:
- Components use Tailwind classes
- Fully compatible with custom configs
- Works with tailwind-merge
- Supports dark mode

### Q: How do I override styles?
**A:** Multiple options:
```tsx
// 1. className prop
<Button className="custom-class">

// 2. CSS modules
<Button className={styles.button}>

// 3. Styled components
const StyledButton = styled(Button)`...`

// 4. CSS variables
:root {
  --ui-primary: #custom-color;
}
```

## 🌍 Internationalization

### Q: Does it support i18n?
**A:** Yes! Built-in i18n support:
- 5+ languages included
- RTL support
- Date/number formatting
- Easy to add languages

### Q: How do I add a new language?
**A:** 
```tsx
import { addLocale } from '@dainabase/ui';

addLocale('es', {
  button: {
    loading: 'Cargando...'
  }
});
```

## 🚀 Lazy Loading

### Q: How does lazy loading work?
**A:** Components are split into bundles:
```tsx
// Option 1: Import bundles
import { DataGrid } from '@dainabase/ui/lazy/data';

// Option 2: Dynamic import
const Chart = lazy(() => import('@dainabase/ui/lazy/chart'));

// Option 3: Loader functions
import { loadCalendar } from '@dainabase/ui';
const { Calendar } = await loadCalendar();
```

### Q: Which components should I lazy load?
**A:** Heavy components (>10KB):
- PdfViewer (57KB)
- ImageCropper (50KB)
- CodeEditor (49KB)
- ThemeBuilder (34KB)
- RichTextEditor (29KB)
- DataGrid (18KB)
- Chart (15KB)
- Calendar (14KB)

## 🐛 Troubleshooting

### Q: "Module not found" error?
**A:** Check your import path:
```tsx
// ❌ Wrong
import Button from '@dainabase/ui/Button';

// ✅ Correct
import { Button } from '@dainabase/ui';
```

### Q: Components not rendering?
**A:** Ensure peer dependencies are installed:
```bash
# Check missing peers
npm ls @dainabase/ui

# Install missing ones
npm install react react-dom
```

### Q: TypeScript errors?
**A:** Update TypeScript and types:
```bash
npm install -D typescript@latest @types/react@latest
```

### Q: Bundle size too large?
**A:** Use bundle analyzer:
```bash
# Analyze your bundle
npx webpack-bundle-analyzer stats.json

# Check what's included
npm ls @dainabase/ui
```

## 📊 Monitoring & Analytics

### Q: How do I track usage?
**A:** The package includes no telemetry. Track manually:
```tsx
// Track component usage
import { Button } from '@dainabase/ui';

function TrackableButton(props) {
  const handleClick = (e) => {
    analytics.track('ui_button_click');
    props.onClick?.(e);
  };
  
  return <Button {...props} onClick={handleClick} />;
}
```

### Q: How do I monitor performance?
**A:** Use built-in metrics:
```tsx
import { getMetrics } from '@dainabase/ui/utils';

const metrics = getMetrics();
console.log(metrics);
// {
//   renderTime: 12,
//   componentCount: 58,
//   bundleSize: 38000
// }
```

## 🔐 Security

### Q: Is it secure?
**A:** Yes! A+ security rating:
- Zero known vulnerabilities
- Regular security audits
- Dependabot enabled
- SNYK monitoring
- No eval() or innerHTML
- CSP compliant

### Q: How often are security updates?
**A:** 
- Critical: Within 24 hours
- High: Within 1 week
- Medium: Within 1 month
- Low: Next regular release

## 🤝 Support & Community

### Q: Where can I get help?
**A:** Multiple channels:
- 📚 [Documentation](https://ui.dainabase.com)
- 💬 [Discord](https://discord.gg/dainabase)
- 🐛 [GitHub Issues](https://github.com/dainabase/directus-unified-platform/issues)
- 📧 [Email](mailto:support@dainabase.com)

### Q: How do I report bugs?
**A:** 
1. Check existing issues
2. Create minimal reproduction
3. Open issue with template
4. Include version, browser, OS

### Q: Can I contribute?
**A:** Yes! We welcome contributions:
1. Read [CONTRIBUTING.md](../CONTRIBUTING.md)
2. Fork the repository
3. Create feature branch
4. Submit pull request

## 💰 Licensing & Pricing

### Q: Is it free?
**A:** Yes! MIT licensed:
- Free for commercial use
- Free for personal use
- No attribution required
- Can modify and distribute

### Q: Is there paid support?
**A:** Enterprise support available:
- Priority bug fixes
- Custom components
- Training sessions
- SLA guarantees

Contact: enterprise@dainabase.com

## 🔮 Future & Roadmap

### Q: What's next?
**A:** 
- **v1.3.1** (Sept 2025): Bug fixes
- **v1.4.0** (Oct 2025): 5 new components
- **v2.0.0** (Q1 2026): React Server Components

### Q: Will there be breaking changes?
**A:** 
- v1.3.x: No breaking changes
- v1.4.x: No breaking changes
- v2.0.0: Major update with migration path

### Q: React 19 support?
**A:** Coming in v1.4.0 (October 2025)

## ⚡ Quick Tips

### Performance Tips
1. Use lazy loading for heavy components
2. Enable React.memo for list items
3. Use virtualization for large lists
4. Minimize re-renders with useCallback
5. Profile with React DevTools

### Bundle Size Tips
1. Import specific components
2. Use dynamic imports
3. Analyze with bundlephobia
4. Enable tree-shaking
5. Externalize large dependencies

### Development Tips
1. Use TypeScript for better DX
2. Enable ESLint rules
3. Use Storybook for testing
4. Set up pre-commit hooks
5. Use the VSCode extension

---

**Still have questions?** Join our [Discord](https://discord.gg/dainabase) or open an [issue](https://github.com/dainabase/directus-unified-platform/issues)!

*Last updated: August 15, 2025*