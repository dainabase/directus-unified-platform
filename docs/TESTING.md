# UI Testing (a11y + visual)

## Accessibility

- Outil: `@storybook/test-runner` + Playwright + Axe.
- Commandes:
  ```bash
  pnpm -C packages/ui build:sb:static
  pnpm -C packages/ui test:stories
  ```
- CI: `.github/workflows/ui-a11y.yml` (échoue en cas de violations).

## Visual Regression (VRT)

- Outil: **Chromatic** (intégré à Storybook).
- Secret requis: `CHROMATIC_PROJECT_TOKEN` (Settings → Secrets → Actions).
- Commandes:
  ```bash
  pnpm -C packages/ui chromatic
  ```
- CI: `.github/workflows/ui-chromatic.yml` (non bloquant par défaut).