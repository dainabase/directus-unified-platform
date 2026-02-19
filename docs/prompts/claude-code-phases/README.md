# Claude Code Setup — Directus Unified Platform
## Guide d'exécution en 7 phases

Le prompt original a été découpé en **7 phases indépendantes** pour que Claude Code puisse les exécuter une par une sans dépasser ses limites de contexte.

---

## Ordre d'exécution

| # | Fichier | Contenu | Durée estimée |
|---|---------|---------|---------------|
| 1 | `PHASE-1-MCP-SERVERS.md` | 6 MCP servers + `.mcp.json` | ~3 min |
| 2 | `PHASE-2-SKILL-REPOSITORIES.md` | 12 repos git à cloner | ~5 min |
| 3A | `PHASE-3A-CUSTOM-SKILLS-1-4.md` | Skills 1-4 (critiques + high) | ~3 min |
| 3B | `PHASE-3B-CUSTOM-SKILLS-5-8.md` | Skills 5-8 (high + medium) | ~3 min |
| 4 | `PHASE-4-CLAUDE-MD.md` | CLAUDE.md root + 3 sous-dirs | ~2 min |
| 5 | `PHASE-5-NPM-PACKAGES.md` | ~15 packages npm | ~3 min |
| 6 | `PHASE-6-VERIFICATION-FINALE.md` | Check complet + commit | ~2 min |

**Temps total estimé : ~20 minutes**

---

## Comment utiliser

### Option A — Copier-coller dans Claude Code
1. Ouvre Claude Code dans le repo `directus-unified-platform`
2. Copie le contenu de `PHASE-1-MCP-SERVERS.md` et colle-le dans Claude Code
3. Attends la confirmation de succès
4. Passe au fichier suivant (Phase 2, puis 3A, etc.)

### Option B — Référencer le fichier
```
Lis le fichier ./claude-code-phases/PHASE-1-MCP-SERVERS.md et exécute toutes les instructions
```

---

## Pourquoi 7 phases ?

Le prompt original fait ~950 lignes avec 8 skills complets, 12 repos à cloner, et 6 MCP servers. En une seule passe, Claude Code risque de :
- Dépasser sa fenêtre de contexte
- Perdre le fil et sauter des étapes
- Ne pas signaler correctement les erreurs

En découpant, chaque phase est autonome, vérifiable, et peut être relancée indépendamment en cas d'échec.

---

## En cas de problème

- **MCP server qui ne démarre pas** → Vérifier que npx est disponible et que Node.js 18+ est installé
- **Git clone qui échoue** → Vérifier l'accès réseau et les permissions GitHub
- **Skill mal créé** → Relancer la phase 3A ou 3B concernée
- **npm install qui échoue** → Vérifier le `package.json` et les versions de Node
- **Credentials manquants** → Créer un `.env` avec les variables nécessaires AVANT de lancer les phases
