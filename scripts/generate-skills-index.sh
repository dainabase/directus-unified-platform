#!/bin/bash
# =============================================================================
# HYPERVISUAL — Skills Discovery Script
# =============================================================================
# Usage: bash scripts/generate-skills-index.sh
# Output: SKILLS-INDEX.md (index compact de TOUS les skills disponibles)
#
# Ce script scanne ~/.claude/skills-repos/ et génère un index structuré.
# Claude Code DOIT exécuter ce script AVANT de commencer toute tâche.
# =============================================================================

SKILLS_BASE="${HOME}/.claude/skills-repos"
PROJECT_SKILLS="$(pwd)/.claude/skills"
OUTPUT_FILE="$(pwd)/SKILLS-INDEX.md"

# Vérification
if [ ! -d "$SKILLS_BASE" ]; then
  echo "❌ ERREUR: Répertoire skills introuvable: $SKILLS_BASE"
  echo "Vérifier que ~/.claude/skills-repos/ existe sur cette machine."
  exit 1
fi

TOTAL=$(find "$SKILLS_BASE" -name "SKILL.md" 2>/dev/null | wc -l | tr -d ' ')
PROJECT_TOTAL=$(find "$PROJECT_SKILLS" -name "SKILL.md" 2>/dev/null | wc -l | tr -d ' ')

echo "🔍 Scan en cours..."
echo "  - Skills repos: $TOTAL skills trouvés"
echo "  - Skills projet: $PROJECT_TOTAL skills trouvés"

# Générer l'index
cat > "$OUTPUT_FILE" << HEADER
# SKILLS-INDEX.md — Index Complet des Skills Disponibles

> **AUTO-GÉNÉRÉ** par `bash scripts/generate-skills-index.sh`  
> **Date** : $(date '+%Y-%m-%d %H:%M')  
> **Total skills** : $((TOTAL + PROJECT_TOTAL)) ($TOTAL repos + $PROJECT_TOTAL projet)
>
> ## COMMENT UTILISER CET INDEX
> 1. **Lire ce fichier EN ENTIER** avant toute tâche (2-3 minutes)
> 2. **Identifier** les skills pertinents pour la tâche en cours
> 3. **Lire** leurs fichiers SKILL.md complets (chemins indiqués)
> 4. **Coder** seulement après avoir lu minimum 2-3 skills
>
> ⛔ **RÈGLE ABSOLUE** : Ne jamais commencer à coder sans avoir lu cet index

---

## 📁 SKILLS PROJET (Spécifiques HYPERVISUAL)

Ces skills sont prioritaires — ils connaissent l'architecture exacte du projet.

HEADER

# Skills projet
if [ -d "$PROJECT_SKILLS" ]; then
  find "$PROJECT_SKILLS" -name "SKILL.md" | sort | while read -r skill_file; do
    skill_name=$(basename "$(dirname "$skill_file")")
    description=$(grep -v "^#" "$skill_file" | grep -v "^[[:space:]]*$" | head -1 | cut -c1-150)
    echo "- **${skill_name}** \`${skill_file}\`" >> "$OUTPUT_FILE"
    echo "  > ${description}" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
  done
fi

echo "---" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "## 🗂️ SKILLS REPOS EXTERNES" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Skills par repo
for repo_dir in "$SKILLS_BASE"/*/; do
  [ -d "$repo_dir" ] || continue
  repo_name=$(basename "$repo_dir")
  skill_count=$(find "$repo_dir" -name "SKILL.md" 2>/dev/null | wc -l | tr -d ' ')
  [ "$skill_count" -eq 0 ] && continue

  echo "### 📦 $repo_name ($skill_count skills)" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"

  # Grouper par sous-dossier catégorie
  prev_cat=""
  find "$repo_dir" -name "SKILL.md" | sort | while read -r skill_file; do
    skill_dir=$(dirname "$skill_file")
    skill_name=$(basename "$skill_dir")
    parent_dir=$(dirname "$skill_dir")
    category=$(basename "$parent_dir")

    # Afficher la catégorie si elle change
    if [ "$category" != "$prev_cat" ] && [ "$category" != "$(basename "$repo_dir")" ]; then
      echo "#### $category" >> "$OUTPUT_FILE"
      prev_cat="$category"
    fi

    # Description: première ligne non-vide non-header
    description=$(grep -v "^#" "$skill_file" | grep -v "^[[:space:]]*$" | head -1 | cut -c1-120)
    # Si vide, prendre le titre H1
    if [ -z "$description" ]; then
      description=$(grep "^# " "$skill_file" | head -1 | sed 's/^# //')
    fi

    echo "- **${skill_name}** — \`${skill_file}\`" >> "$OUTPUT_FILE"
    if [ -n "$description" ]; then
      echo "  *${description}*" >> "$OUTPUT_FILE"
    fi
  done

  echo "" >> "$OUTPUT_FILE"
done

# Section guide de sélection
cat >> "$OUTPUT_FILE" << FOOTER

---

## 🎯 GUIDE DE SÉLECTION RAPIDE

| Type de tâche | Skills prioritaires à lire |
|---------------|---------------------------|
| **UI/UX — nouveau composant React** | frontend-design + ui-design-system + react-expert + react-component-generator |
| **UI/UX — refactoring design** | frontend-design + ui-design-system + web-design-methodology + ux-audit |
| **Dashboard / KPIs** | ceo-dashboard-designer + frontend-design + ui-design-system + directus-api-patterns |
| **Formulaire complexe** | frontend-design + react-expert + react-hook-creator + directus-api-patterns |
| **API Express / Webhook** | express-route-generator + webhook-receiver-generator + integration-sync-engine |
| **Finance / TVA / QR-Invoice** | swiss-compliance-engine + directus-api-patterns + fullstack-guardian |
| **Base de données / PostgreSQL** | postgresql-directus-optimizer + sql-pro + directus-api-patterns |
| **Sécurité / Auth** | secure-code-guardian + api-key-manager + rate-limiter-config |
| **Tests E2E** | playwright-expert + webapp-testing + api-test-generator |
| **Performance frontend** | web-vitals-monitor + bundle-size-analyzer + tailwind-class-optimizer |
| **Module complet fullstack** | frontend-design + ux-researcher-designer + fullstack-guardian + directus-api-patterns |

> 📖 Voir aussi **SKILLS-MAPPING.md** pour les combinaisons recommandées par story ROADMAP
FOOTER

echo ""
echo "✅ SKILLS-INDEX.md généré avec succès !"
echo "   → $((TOTAL + PROJECT_TOTAL)) skills indexés"
echo "   → Fichier: $OUTPUT_FILE"
echo ""
echo "📋 Claude Code doit maintenant:"
echo "   1. Lire SKILLS-INDEX.md en entier"
echo "   2. Sélectionner 3-6 skills pertinents"
echo "   3. Lire leurs SKILL.md complets"
echo "   4. Seulement alors commencer à coder"
