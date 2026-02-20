#!/bin/bash
# =============================================================================
# generate-skills-index.sh — HYPERVISUAL Unified Platform
# =============================================================================
# Scanne ~/.claude/skills-repos/ et génère SKILLS-INDEX.md
# Usage : bash scripts/generate-skills-index.sh
# Usage auto : bash scripts/generate-skills-index.sh > SKILLS-INDEX.md
# =============================================================================

SKILLS_BASE="${HOME}/.claude/skills-repos"
PROJECT_SKILLS="${PWD}/.claude/skills"
OUTPUT_FILE="${PWD}/SKILLS-INDEX.md"

# Compter les skills
if [ ! -d "$SKILLS_BASE" ]; then
  echo "ERROR: Skills directory not found at $SKILLS_BASE"
  echo "Verify that Claude Code skills repos are installed."
  exit 1
fi

TOTAL=$(find "$SKILLS_BASE" -name "SKILL.md" 2>/dev/null | wc -l | tr -d ' ')
PROJECT_TOTAL=$(find "$PROJECT_SKILLS" -name "SKILL.md" 2>/dev/null | wc -l | tr -d ' ')
DATE=$(date '+%Y-%m-%d %H:%M')

# Écrire dans le fichier de sortie
cat > "$OUTPUT_FILE" << EOF
# SKILLS-INDEX.md — Tous les skills disponibles

> **Auto-généré** : ${DATE}  
> **Total skills spécialisés** : ${TOTAL} skills dans \`~/.claude/skills-repos/\`  
> **Skills projet HYPERVISUAL** : ${PROJECT_TOTAL} skills dans \`.claude/skills/\`  
> **Regénérer** : \`bash scripts/generate-skills-index.sh\`  

---

## 🔴 INSTRUCTIONS POUR CLAUDE CODE

1. Lire ce fichier EN ENTIER (parcourir toutes les catégories)
2. Identifier les 3-6 skills les plus pertinents pour la tâche en cours
3. Lire leurs fichiers SKILL.md complets avant d'écrire une ligne de code
4. Consulter SKILLS-MAPPING.md pour les combinaisons recommandées par story

---

## SKILLS PROJET HYPERVISUAL (Toujours lire en premier)

EOF

# Skills projet
if [ -d "$PROJECT_SKILLS" ]; then
  find "$PROJECT_SKILLS" -name "SKILL.md" | sort | while read -r skill_file; do
    skill_name=$(basename "$(dirname "$skill_file")")
    description=$(grep -v '^#' "$skill_file" | grep -v '^$' | head -1 | cut -c1-100)
    echo "- **${skill_name}** → \`.claude/skills/${skill_name}/SKILL.md\`" >> "$OUTPUT_FILE"
    echo "  > ${description}" >> "$OUTPUT_FILE"
  done
fi

echo "" >> "$OUTPUT_FILE"
echo "---" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "## SKILLS SPÉCIALISÉS (${TOTAL} skills — ~/.claude/skills-repos/)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Skills repos — groupés par repo puis par catégorie
for repo_dir in "$SKILLS_BASE"/*/; do
  [ -d "$repo_dir" ] || continue
  repo_name=$(basename "$repo_dir")
  skill_count=$(find "$repo_dir" -name "SKILL.md" 2>/dev/null | wc -l | tr -d ' ')
  [ "$skill_count" -eq 0 ] && continue

  echo "### 📦 ${repo_name} (${skill_count} skills)" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"

  # Grouper par catégorie (sous-dossier du repo)
  current_cat=""
  find "$repo_dir" -name "SKILL.md" | sort | while read -r skill_file; do
    skill_dir=$(dirname "$skill_file")
    skill_name=$(basename "$skill_dir")
    parent_dir=$(dirname "$skill_dir")
    category=$(basename "$parent_dir")

    # Si la catégorie a changé, afficher le header
    if [ "$category" != "$current_cat" ] && [ "$category" != "$repo_name" ] && [ "$category" != "skills" ]; then
      echo "**[$category]**" >> "$OUTPUT_FILE"
      current_cat="$category"
    fi

    # Extraire une description courte
    description=$(grep -v '^#' "$skill_file" | grep -v '^[[:space:]]*$' | head -1 | sed 's/^[[:space:]]*//' | cut -c1-120)
    [ -z "$description" ] && description=$(head -5 "$skill_file" | tail -1 | cut -c1-120)

    echo "- **${skill_name}** → \`${skill_file}\`" >> "$OUTPUT_FILE"
    echo "  > ${description}" >> "$OUTPUT_FILE"
  done

  echo "" >> "$OUTPUT_FILE"
done

# Footer
cat >> "$OUTPUT_FILE" << 'EOF'
---

## RÈGLES DE SÉLECTION RAPIDE

| Type de tâche | Skills prioritaires |
|---|---|
| **Tout composant UI** | `frontend-design` + `ui-design-system` + `react-expert` |
| **Design System / tokens** | `frontend-design` + `ui-design-system` + `tailwind-theme-builder` + `web-design-methodology` |
| **Dashboard / KPIs** | `ceo-dashboard-designer` + `frontend-design` + `ui-design-system` + `directus-api-patterns` |
| **Nouveau module complet** | `frontend-design` + `ux-researcher-designer` + `web-design-patterns` + `fullstack-guardian` |
| **Directus / collections** | `directus-api-patterns` + MCP Directus pour vérifier les champs |
| **Finance / TVA Suisse** | `swiss-compliance-engine` + `directus-api-patterns` |
| **Webhooks / API** | `webhook-receiver-generator` + `integration-sync-engine` + `api-client-generator` |
| **PostgreSQL perf** | `postgresql-directus-optimizer` + `sql-pro` + `cte-query-builder` |
| **Sécurité** | `api-key-manager` + `rate-limiter-config` + `secure-code-guardian` |
| **Tests** | `playwright-expert` + `api-test-generator` + `webapp-testing` |

> Voir SKILLS-MAPPING.md pour les combinaisons détaillées par story de la roadmap.
EOF

echo "✅ SKILLS-INDEX.md généré avec succès"
echo "   → ${TOTAL} skills spécialisés"
echo "   → ${PROJECT_TOTAL} skills projet HYPERVISUAL"
echo "   → Fichier : ${OUTPUT_FILE}"
