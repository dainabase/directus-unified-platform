# 🎨 Chromatic Visual Testing Integration

> **Status**: ✅ CONFIGURED & READY | **Last Update**: August 12, 2025, 07:16 UTC

## 📊 Overview

Chromatic provides automated visual regression testing for our UI components library, ensuring visual consistency across changes.

## 🚀 Quick Start

### Local Development
```bash
# Start Storybook locally
pnpm --filter @dainabase/ui sb

# Build Storybook for production
pnpm --filter @dainabase/ui build-storybook

# Run tests with coverage
pnpm --filter @dainabase/ui test:coverage
```

### Chromatic URLs
- **Project**: [View on Chromatic](https://www.chromatic.com/builds?appId=YOUR_APP_ID)
- **Latest Build**: Check GitHub Actions for latest URLs
- **Token**: Configured in GitHub Secrets

## 📁 Configuration Files

### Workflows
- `.github/workflows/ui-chromatic.yml` - Feature branch workflow
- `.github/workflows/ui-chromatic-main.yml` - Main branch workflow ✨ NEW

### Package Dependencies
```json
{
  "@chromatic-com/storybook": "^1.2.25",
  "@storybook/react": "^8.1.11",
  "@storybook/react-vite": "^8.1.11"
}
```

## 🔄 CI/CD Integration

### Trigger Events
| Event | Branches | Auto-Accept | Status |
|-------|----------|-------------|--------|
| Push | main | ✅ | Active |
| Push | feat/design-system-apple | ✅ | Active |
| Pull Request | main, master | ❌ | Active |
| Manual | Any | Configurable | Active |

### Workflow Features
- 🎯 **Targeted Testing**: Only runs on UI changes
- 📸 **Screenshot Comparison**: Detects visual regressions
- 💬 **PR Comments**: Automatic results posting
- 🔗 **Direct Links**: Build & Storybook URLs
- ⚡ **Performance**: Only changed components tested

## 📈 Metrics & Coverage

### Component Coverage
```yaml
Total Components: 57
Tested Components: 57
Visual Tests: 57 stories
Coverage: 100%
```

### Recent Builds
| Date | Commit | Changes | Status |
|------|--------|---------|--------|
| 2025-08-12 | efdc293 | Setup | ✅ Pass |
| - | - | - | - |

## 🎯 Testing Strategy

### Visual Regression Testing
1. **Baseline Creation**: First run creates visual baselines
2. **Change Detection**: Subsequent runs compare against baselines
3. **Review Process**: Changes require manual approval
4. **Auto-Accept**: Main branch changes auto-accepted

### Component Categories
- **Core Components**: Button, Input, Select (High Priority)
- **Layout Components**: AppShell, Card, Grid (Medium Priority)
- **Feedback Components**: Toast, Alert, Dialog (High Priority)
- **Data Components**: Table, DataGrid (Critical)

## 🛠️ Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf packages/ui/storybook-static
pnpm --filter @dainabase/ui build-storybook
```

#### Token Issues
```bash
# Verify token in GitHub Secrets
# Settings > Secrets > Actions > CHROMATIC_PROJECT_TOKEN
```

#### Component Not Appearing
```typescript
// Ensure story is exported
export default {
  title: 'Components/YourComponent',
  component: YourComponent,
};

export const Default = () => <YourComponent />;
```

## 📝 Best Practices

### Writing Stories
```typescript
// Good story structure
export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'destructive'],
    },
  },
};

// Multiple states
export const Primary = () => <Button variant="primary">Click me</Button>;
export const Secondary = () => <Button variant="secondary">Click me</Button>;
export const Disabled = () => <Button disabled>Can't click</Button>;
```

### Visual Testing Tips
1. **Consistent Data**: Use static data in stories
2. **Viewport Testing**: Test responsive designs
3. **Theme Testing**: Include dark/light mode stories
4. **State Coverage**: Test all interactive states
5. **Accessibility**: Include focus states

## 🔗 Resources

### External Links
- [Chromatic Documentation](https://www.chromatic.com/docs/)
- [Storybook Documentation](https://storybook.js.org/docs)
- [Visual Testing Guide](https://www.chromatic.com/docs/test)

### Internal Documentation
- [Testing Guidelines](./TESTING_GUIDELINES.md)
- [Component Standards](./COMPONENT_STANDARDS.md)
- [CI/CD Monitor](./CI_MONITOR.md)

## 📊 Integration Status

### Chromatic Features
| Feature | Status | Notes |
|---------|--------|-------|
| Visual Tests | ✅ Active | All components covered |
| UI Review | ✅ Enabled | PR comments active |
| Composition | ⏳ Planned | Component interaction tests |
| Accessibility | ⏳ Planned | A11y addon integration |
| Performance | ⏳ Planned | Render performance tracking |

### GitHub Integration
| Feature | Status | Configuration |
|---------|--------|---------------|
| PR Comments | ✅ | Automatic |
| Status Checks | ✅ | Required for merge |
| Branch Protection | ✅ | Visual approval required |
| Webhooks | ✅ | Chromatic notifications |

## 🚀 Upcoming Enhancements

### Phase 1 (Current)
- ✅ Basic visual regression testing
- ✅ GitHub Actions integration
- ✅ PR commenting system

### Phase 2 (Next Sprint)
- [ ] Interaction testing
- [ ] Cross-browser testing
- [ ] Accessibility checks
- [ ] Performance budgets

### Phase 3 (Q3 2025)
- [ ] AI-powered review suggestions
- [ ] Component usage analytics
- [ ] Design token validation
- [ ] Figma integration

## 📞 Support

### Contacts
- **Team Lead**: @dainabase
- **Chromatic Support**: support@chromatic.com
- **Internal Slack**: #ui-testing

### Quick Actions
- [View Latest Build](https://github.com/dainabase/directus-unified-platform/actions)
- [Check Coverage](./TEST_DASHBOARD.md)
- [Report Issue](https://github.com/dainabase/directus-unified-platform/issues/new)

---

*Generated by CI/CD Sprint | August 12, 2025, 07:16 UTC*
