# WORKFLOW_CLAUDE.md
> **Objectif** : Décrire la procédure complète pour le développement Frontend Design System-First du projet `dainabase/directus-unified-platform` (branche `feat/design-system-apple`) avec Claude Desktop / Cloud Code.
---
## 1. Contexte du projet
Ce projet vise à créer un **Design System Apple-style** pour un dashboard d'entreprise moderne, sobre, haut de gamme.  
Il est implémenté en **React/Next.js (App Router)**, avec **TailwindCSS**, **shadcn/ui**, **Radix Primitives**, **Recharts**, et **TanStack Table**.
Le Design System est centralisé dans `packages/ui` et utilisé par toutes les apps (notamment `apps/web`).  
Aucun style ne doit être défini en dur dans les pages.  
Police : **Montserrat** via `--font-sans`.
---
## 2. Principes fondamentaux
1. **DS-first** : Tout nouveau composant ou style passe par `packages/ui`.
2. **Tokens-only** : couleurs, radius, spacing, shadows… toujours via `tokens.ts`.
3. **Pas de duplication** : si un composant existe déjà, il est réutilisé ou étendu.
4. **Accessibilité** : ARIA-friendly (Radix gère focus et interactions).
5. **Documentation** : chaque composant a `.stories.tsx` et `.mdx` dans Storybook.
---
## 3. Environnement technique
- **React + Next.js (App Router)**
- **TailwindCSS** (config customisée avec tokens)
- **shadcn/ui** (base UI)
- **Radix Primitives** (accessibilité)
- **Recharts** (graphiques)
- **TanStack Table** (tableaux avancés)
- **Storybook** (docs UI)
- **Vitest + React Testing Library**
- **Playwright** (E2E)
---
## 4. Règles d'implémentation
- **Arborescence** :
  - `packages/ui/src/components/[nom]`
    - `[nom].tsx`
    - `[nom].stories.tsx`
    - `[nom].mdx`
  - `packages/ui/tokens.ts`
  - `packages/ui/tailwind.config.ts`
- **Fichiers interdits à modifier sans demande explicite** :
  - Fichiers hors `packages/ui` sauf intégration de pages
  - Config monorepo, back-end, API
- **Commits** :
  - 1 commit par pack reçu (ou petit groupe de composants liés)
  - Message clair : `feat(ds): add [nom composant]` ou `fix(ds): adjust token spacing`
---
## 5. Workflow avec Claude
1. Claude doit **vérifier** qu'il travaille sur :
   - Repo : `dainabase/directus-unified-platform`
   - Branche : `feat/design-system-apple`
2. Claude doit **lire ce fichier** avant toute action.
3. Claude applique uniquement **le pack fourni** (code + chemins + commit message).  
   Aucun autre fichier n'est modifié.
4. Après chaque pack :
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm build` si nécessaire
   - Rapport de l'état : OK / conflits / dépendances manquantes
5. Claude attend la commande "**Envoie PACK suivant**" avant de continuer.
---
## 6. Packs prévus
- **PACK 01** : Tokens, Tailwind config, PR template
- **PACK 02** : Button, Card, DataGrid base
- **PACK 03** : Command Palette, DatePicker/RangePicker, Dialog, Sheet
- **PACK 04** : AppShell, Tabs, Breadcrumbs, Dropdown, Toast
- **PACK 05** : Forms kit (React Hook Form), Inputs
- **PACK 06** : DataGrid avancée
- **PACK 07** : Charts (Line, Bar, Area, Donut, Radial)
- **PACK 08** : Dashboard demo (pages)
- **PACK 09** : CI/CD (lint, tests, storybook artefact)
- **PACK 10** : Déploiement Storybook (Pages/Vercel), Changesets
- **PACK 11** : Docs complémentaires
---
## 7. Validation et QA
- Storybook doit être à jour après chaque ajout
- Tous les composants doivent avoir au moins un test RTL
- Aucun style en dur en dehors de tokens
- Responsive + accessible
---
## 8. Publication
À la fin de tous les packs :
- Claude ouvre une PR vers la branche par défaut
- PR inclut : checklist DS, lien Storybook preview, captures
---
**Fin du fichier**