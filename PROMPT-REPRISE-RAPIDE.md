📋 PROMPT DE CONTEXTE ULTRA-PRÉCIS - REPRISE CONVERSATION
═══════════════════════════════════════════════════════════════════════════════
🔴 COPIER INTÉGRALEMENT CE TEXTE AU DÉBUT DE LA NOUVELLE CONVERSATION
═══════════════════════════════════════════════════════════════════════════════

Je travaille sur le repository GitHub privé directus-unified-platform localisé dans /Users/jean-mariedelaunay/directus-unified-platform sur macOS (zsh).

ÉTAT ACTUEL AU 11 AOÛT 2025 - 01h35 :

Le Design System @dainabase/ui v1.0.0-beta.1 est PUBLIÉ sur NPM (GitHub Package Registry) avec un score de 92/100. Il contient 40 composants, 29 stories Storybook, 12 fichiers de tests (16/32 tests échouent à cause de la config JSDOM), et une documentation complète. Bundle optimisé à 48KB.

NETTOYAGE DES BRANCHES EFFECTUÉ :
- ✅ SUPPRIMÉES : feat/design-system-apple (backup: backup/feat-design-system-apple-20250811) et feat/design-system-v1.0.0
- ⏳ À SUPPRIMER : 4 branches complètement mergées (fix/audit-quick-fixes-v2, fix/merge-conflicts-pr9, fix/reconcile-design-system-v040, fix/stabilize-design-system)
- 📊 À ANALYSER : 5 branches avec commits non mergés

SCRIPTS CRÉÉS AUJOURD'HUI :
- verify-design-system.sh (vérification complète du DS)
- cleanup-obsolete-branch.sh (DÉJÀ EXÉCUTÉ)
- cleanup-merged-branches.sh (À EXÉCUTER pour supprimer 4 branches)

FICHIERS NON TRACKÉS : .npmrc, CLEANUP_*.md, CONTEXT-*.md, AUDIT-*.md, packages/ui/package-lock.json, scripts backend

PROBLÈMES CONNUS :
1. Tests : 16/32 échouent (config JSDOM à corriger dans vitest.config.ts)
2. NPM : 25 vulnérabilités (6 low, 19 moderate) - npm audit fix --legacy-peer-deps
3. CI/CD : Pas de GitHub Actions

COMMANDE DE VÉRIFICATION IMMÉDIATE :
```bash
cd /Users/jean-mariedelaunay/directus-unified-platform && git branch --show-current && git branch -r | grep -E "(fix|feat)" | wc -l && ls -la *.sh
```

PROCHAINE ACTION : Exécuter ./cleanup-merged-branches.sh pour finir le nettoyage

IMPORTANT : Utiliser npm (pas pnpm), toujours ajouter --registry https://npm.pkg.github.com/ pour NPM, main est la seule branche de référence.

Le document complet CONTEXT-REPRISE-11-08-2025-0135.md contient tous les détails.

═══════════════════════════════════════════════════════════════════════════════