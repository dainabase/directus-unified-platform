# Contributing Guide

## Branch Naming Convention

All branches must follow the format: `type/description`

### Allowed Types
- `feat/` - New features
- `fix/` - Bug fixes  
- `chore/` - Maintenance tasks
- `docs/` - Documentation updates
- `ci/` - CI/CD changes
- `refactor/` - Code refactoring
- `test/` - Test additions/modifications
- `hotfix/` - Critical production fixes

### Examples
✅ Good:
- `feat/design-system-apple`
- `fix/auth-redirect-issue`
- `docs/api-documentation`

❌ Bad:
- `feat-design-system-apple` (use slash, not dash)
- `feature/new-thing` (use `feat`, not `feature`)
- `my-branch` (missing type prefix)

### Enforcement
Branch names are automatically validated by CI when opening a pull request.

## Development Workflow

### 1. Create a new branch
```bash
git checkout -b feat/your-feature-name
```

### 2. Make your changes
- Follow the coding standards
- Add tests for new features
- Update documentation as needed

### 3. Commit your changes
Follow conventional commit format:
```bash
git commit -m "type(scope): description"
```

Types: feat, fix, docs, style, refactor, test, chore

### 4. Push and create PR
```bash
git push origin feat/your-feature-name
```

### 5. PR Guidelines
- Fill out the PR template completely
- Link related issues
- Ensure all CI checks pass
- Request review from appropriate team members

## Code Standards

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow ESLint configuration
- Prefer functional components in React
- Use Design System tokens for styling

### Styling
- Use Design System components from `packages/ui`
- Never use inline styles
- All colors, spacing, radius must come from tokens
- Follow the Apple-inspired design language

### Testing
- Write unit tests for utilities and hooks
- Add Storybook stories for UI components
- Include integration tests for critical paths
- Aim for >80% coverage on new code

## Project Structure

```
├── packages/
│   ├── ui/              # Design System components
│   │   ├── src/
│   │   ├── tokens.ts     # Design tokens
│   │   └── tailwind.config.ts
│   └── ...
├── apps/
│   ├── web/             # Next.js application
│   └── ...
├── docs/                # Documentation
└── .github/workflows/   # CI/CD pipelines
```

## Design System Guidelines

### Adding New Components
1. Create component in `packages/ui/src/components/[name]/`
2. Include `[name].tsx`, `[name].stories.tsx`, `[name].mdx`
3. Export from `packages/ui/src/index.ts`
4. Document props and usage in Storybook
5. Add accessibility tests

### Using Tokens
All design decisions must reference tokens:
```tsx
// ✅ Good
className="bg-background text-foreground rounded-md"

// ❌ Bad
className="bg-white text-black rounded-lg"
```

## Questions?
For questions about contributing, please open a discussion in the repository.