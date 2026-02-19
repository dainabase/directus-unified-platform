#!/bin/bash
# scan-skills.sh — Scanne tous les SKILL.md et regenere le registry
# Usage: bash .claude/skills/skill-router/scripts/scan-skills.sh

set -e

SKILLS_DIR="$HOME/.claude/skills-repos"
PROJECT_DIR="$(cd "$(dirname "$0")/../../../.." && pwd)"
ROUTER_DIR="$PROJECT_DIR/.claude/skills/skill-router"
CATEGORIES_DIR="$ROUTER_DIR/references/categories"
INVENTORY="/tmp/all-skills-inventory.csv"

echo "=== Skill Router — Scan & Registry Generator ==="
echo "Scanning: $SKILLS_DIR"
echo ""

# Step 1: Scan all SKILL.md files
echo "Step 1: Scanning SKILL.md files..."
> "$INVENTORY"
find "$SKILLS_DIR" -name "SKILL.md" -maxdepth 5 2>/dev/null | while read file; do
  fm=$(sed -n '/^---$/,/^---$/p' "$file" 2>/dev/null | head -20)
  name=$(echo "$fm" | grep "^name:" | head -1 | sed 's/^name: *//' | tr -d '"' | tr -d "'")
  desc=$(echo "$fm" | grep "^description:" | head -1 | sed 's/^description: *//' | tr -d '"' | cut -c1-150)
  repo=$(echo "$file" | sed "s|.*skills-repos/||" | cut -d'/' -f1)
  if [ -n "$name" ]; then
    echo "${name}|${desc}|${repo}|${file}" >> "$INVENTORY"
  fi
done

TOTAL=$(wc -l < "$INVENTORY" | tr -d ' ')
echo "Found $TOTAL skills with valid frontmatter"
echo ""

# Step 2: Categorize
echo "Step 2: Categorizing..."
mkdir -p "$CATEGORIES_DIR"

# Define categories and keywords
declare -A CATEGORIES
CATEGORIES[database]="database|sql|query|schema|migration|orm|index|postgres|mysql|mongo|redis|cache|data-model|knex"
CATEGORIES[api]="api|rest|graphql|endpoint|webhook|rate-limit|swagger|openapi|grpc|gateway"
CATEGORIES[security]="security|vulnerability|scanner|gdpr|pci|secret|encryption|xss|injection|penetration|owasp"
CATEGORIES[devops]="docker|kubernetes|ci-cd|ci/cd|pipeline|deploy|infrastructure|terraform|ansible|helm|monitoring|backup|nginx|cloud"
CATEGORIES[testing]="test|e2e|unit-test|coverage|mock|fixture|cypress|playwright|jest|selenium|qa"
CATEGORIES[ai-ml]="ai|ml|machine-learning|anomaly|forecast|sentiment|nlp|classification|neural|llm|embedding|vision|openai"
CATEGORIES[performance]="performance|profiler|bottleneck|memory-leak|apm|load-test|benchmark|latency|optimize"
CATEGORIES[frontend]="react|frontend|css|tailwind|component|ui|ux|responsive|accessibility|storybook|animation|design"
CATEGORIES[finance]="finance|accounting|invoice|payment|tax|revenue|budget|openbb|financial|pricing"
CATEGORIES[productivity]="workflow|productivity|automation|commit|agent|orchestrat|overnight|task|project-manage|changelog"
CATEGORIES[documentation]="doc|readme|changelog|reference|tutorial|guide|wiki|api-doc"
CATEGORIES[business]="business|cto|ceo|cfo|revenue|sales|marketing|growth|strategy|leadership|stakeholder|customer-success"
CATEGORIES[regulatory]="regulatory|compliance|hipaa|sox|legal|audit|risk"
CATEGORIES[orchestration]="swarm|multi-agent|coordination|agent-commun"

# Clear category files
for cat in "${!CATEGORIES[@]}" other; do
  echo "# $(echo "$cat" | tr '-' ' ' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1') Skills" > "$CATEGORIES_DIR/$cat.md"
  echo "> Generated $(date '+%Y-%m-%d %H:%M')" >> "$CATEGORIES_DIR/$cat.md"
  echo "" >> "$CATEGORIES_DIR/$cat.md"
  echo "| # | Skill | Description | Path |" >> "$CATEGORIES_DIR/$cat.md"
  echo "|---|-------|-------------|------|" >> "$CATEGORIES_DIR/$cat.md"
done

# Categorize each skill
declare -A COUNTS
while IFS='|' read -r name desc repo path; do
  name_lower=$(echo "$name $desc" | tr '[:upper:]' '[:lower:]')
  matched=false
  for cat in "${!CATEGORIES[@]}"; do
    pattern="${CATEGORIES[$cat]}"
    if echo "$name_lower" | grep -qE "$pattern"; then
      n=${COUNTS[$cat]:-0}
      n=$((n + 1))
      COUNTS[$cat]=$n
      echo "| $n | $name | ${desc:0:100} | $path |" >> "$CATEGORIES_DIR/$cat.md"
      matched=true
      break
    fi
  done
  if [ "$matched" = false ]; then
    n=${COUNTS[other]:-0}
    n=$((n + 1))
    COUNTS[other]=$n
    echo "| $n | $name | ${desc:0:100} | $path |" >> "$CATEGORIES_DIR/$cat.md"
  fi
done < "$INVENTORY"

# Step 3: Summary
echo ""
echo "=== Results ==="
for cat in $(echo "${!COUNTS[@]}" | tr ' ' '\n' | sort); do
  printf "  %-20s %s skills\n" "$cat" "${COUNTS[$cat]}"
done
echo "  ---"
echo "  TOTAL: $TOTAL skills"
echo ""
echo "Registry files updated in: $CATEGORIES_DIR/"
echo "Done."
