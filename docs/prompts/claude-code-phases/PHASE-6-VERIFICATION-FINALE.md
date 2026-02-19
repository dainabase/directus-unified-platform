# PHASE 6 — VÉRIFICATION FINALE & COMMIT

## Contexte
Suite et fin de la configuration `directus-unified-platform`. Toutes les phases (1-5) sont terminées. On fait maintenant une vérification complète et un commit.

## Mission Phase 6
Exécute toutes les vérifications ci-dessous et signale tout problème. Ensuite, commite le tout.

### 6.1 Vérification complète

```bash
echo "=========================================="
echo "  VÉRIFICATION COMPLÈTE DU SETUP"
echo "=========================================="

echo ""
echo "=== 1. MCP Servers ==="
claude mcp list

echo ""
echo "=== 2. Skills Custom (projet) ==="
ls -la .claude/skills/*/SKILL.md 2>/dev/null
echo "Total: $(ls .claude/skills/*/SKILL.md 2>/dev/null | wc -l) skills sur 8 attendus"

echo ""
echo "=== 3. Skills Repos (global) ==="
ls -la ~/.claude/skills-repos/ 2>/dev/null
echo "Total: $(ls -d ~/.claude/skills-repos/*/ 2>/dev/null | wc -l) repos"

echo ""
echo "=== 4. CLAUDE.md root ==="
head -3 CLAUDE.md

echo ""
echo "=== 5. CLAUDE.md sous-répertoires ==="
for f in directus/extensions/CLAUDE.md src/portals/CLAUDE.md integrations/CLAUDE.md; do
  [ -f "$f" ] && echo "✅ $f" || echo "❌ $f MANQUANT"
done

echo ""
echo "=== 6. .mcp.json ==="
cat .mcp.json 2>/dev/null || echo "❌ Pas de .mcp.json"

echo ""
echo "=== 7. NPM Packages Backend ==="
npm list swissqrbill dinero.js openai zod bullmq 2>/dev/null

echo ""
echo "=== 8. Git Status ==="
git status --short
```

### 6.2 Tableau récapitulatif attendu

| Composant | Quantité | Check |
|-----------|----------|-------|
| MCP Servers | 6 | `claude mcp list` |
| Skill Repositories | 12 repos | `~/.claude/skills-repos/` |
| Custom Skills | 8 fichiers | `.claude/skills/*/SKILL.md` |
| CLAUDE.md | 1 root + 3 sous-dirs | Vérifier contenu |
| NPM Packages | ~15 packages | `npm list` |
| .mcp.json | 1 fichier | Racine du projet |

### 6.3 Commit

Si tout est OK :

```bash
git add .claude/skills/ .mcp.json CLAUDE.md directus/extensions/CLAUDE.md src/portals/CLAUDE.md integrations/CLAUDE.md
git commit -m "feat: complete Claude Code specialist setup (MCP + skills + config)"
```

> ⚠️ Ne commite PAS les fichiers `.env`, credentials, ou `node_modules`.

### 6.4 Signale les résultats

Donne-moi un résumé complet :
- Nombre de MCP servers actifs
- Nombre de skills custom créés
- Nombre de repos clonés
- Statut du CLAUDE.md
- Packages installés avec succès
- Éventuelles erreurs rencontrées et solutions proposées
