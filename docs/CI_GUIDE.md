# CI/CD Guide

- UI CI : lint + typecheck + build Storybook + artifact (workflow: UI CI)
- UI Storybook Pages : build puis déploiement GitHub Pages (URL fournie par le job)
- Web CI : typecheck + build de l'app Next.js de démo
- DS Guard : garde-fou sur la branche feat-design-system-apple

## Usage

- Les jobs tournent sur chaque push/PR.
- Pour (re)déployer Storybook Pages manuellement: onglet Actions → UI Storybook Pages → Run workflow.

## Prérequis

- pnpm-workspace.yaml à la racine.
- Settings → Pages: GitHub Actions.