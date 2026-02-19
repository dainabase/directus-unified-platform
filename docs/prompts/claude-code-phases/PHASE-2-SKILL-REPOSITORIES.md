# PHASE 2 — INSTALLATION SKILL REPOSITORIES

## Contexte
Suite de la configuration `directus-unified-platform`. La Phase 1 (MCP Servers) est terminée. On passe maintenant au clonage des skill repositories.

## Mission Phase 2
Clone tous les repos de skills dans `~/.claude/skills-repos/`. Si un repo est déjà cloné, passe au suivant (ne pas écraser). Confirme chaque clone.

### 2.1 Tier 1 — Core Repositories

```bash
# Créer le dossier si nécessaire
mkdir -p ~/.claude/skills-repos

# Anthropic Official Skills
git clone https://github.com/anthropics/skills.git ~/.claude/skills-repos/anthropics-skills 2>/dev/null || echo "anthropics-skills: déjà cloné ou erreur"

# Anthropic Official Plugins
git clone https://github.com/anthropics/claude-plugins-official.git ~/.claude/skills-repos/claude-plugins-official 2>/dev/null || echo "claude-plugins-official: déjà cloné ou erreur"

# Awesome Claude Code Toolkit (135 agents, 35 skills, 42 commands, 120 plugins, 19 hooks)
git clone https://github.com/rohitg00/awesome-claude-code-toolkit.git ~/.claude/skills-repos/awesome-claude-code-toolkit 2>/dev/null || echo "awesome-claude-code-toolkit: déjà cloné ou erreur"

# Claude Code Plugins Plus (270+ plugins, 1,537 agent skills)
git clone https://github.com/jeremylongshore/claude-code-plugins-plus-skills.git ~/.claude/skills-repos/claude-code-plugins-plus-skills 2>/dev/null || echo "claude-code-plugins-plus-skills: déjà cloné ou erreur"
```

### 2.2 Tier 2 — Collections Spécialisées

```bash
# Jeffallan (66 skills: Postgres Pro, API Designer, GraphQL Architect, TypeScript Pro)
git clone https://github.com/Jeffallan/claude-skills.git ~/.claude/skills-repos/jeffallan-claude-skills 2>/dev/null || echo "jeffallan: déjà cloné ou erreur"

# Alirezarezvani (53 skills: Engineering, Finance, Regulatory, C-Level)
git clone https://github.com/alirezarezvani/claude-skills.git ~/.claude/skills-repos/alirezarezvani-claude-skills 2>/dev/null || echo "alirezarezvani: déjà cloné ou erreur"

# Levnikolaevich (102 skills: Full Agile lifecycle)
git clone https://github.com/levnikolaevich/claude-code-skills.git ~/.claude/skills-repos/levnikolaevich-claude-code-skills 2>/dev/null || echo "levnikolaevich: déjà cloné ou erreur"

# Jamie-BitFlight (20 plugins: hallucination-detector, plugin-creator)
git clone https://github.com/Jamie-BitFlight/claude_skills.git ~/.claude/skills-repos/jamie-bitflight-claude-skills 2>/dev/null || echo "jamie-bitflight: déjà cloné ou erreur"

# Daymade (github-ops, deep-research, ui-designer, i18n-expert)
git clone https://github.com/daymade/claude-code-skills.git ~/.claude/skills-repos/daymade-claude-code-skills 2>/dev/null || echo "daymade: déjà cloné ou erreur"

# Jezweb (24 skills: React, Tailwind, frontend testing)
git clone https://github.com/jezweb/claude-skills.git ~/.claude/skills-repos/jezweb-claude-skills 2>/dev/null || echo "jezweb: déjà cloné ou erreur"

# Shinpr (workflows: /front-design, /front-build)
git clone https://github.com/shinpr/claude-code-workflows.git ~/.claude/skills-repos/shinpr-claude-code-workflows 2>/dev/null || echo "shinpr: déjà cloné ou erreur"
```

### 2.3 Tier 3 — Skills Essentiels

```bash
# Skill Factory (meta-outil pour générer des skills custom on-demand)
git clone https://github.com/alirezarezvani/claude-code-skill-factory.git ~/.claude/skills-repos/skill-factory 2>/dev/null || echo "skill-factory: déjà cloné ou erreur"

# Everything Claude Code (backend patterns: REST, JWT, RBAC, Zod, retry)
git clone https://github.com/affaan-m/everything-claude-code.git ~/.claude/skills-repos/everything-claude-code 2>/dev/null || echo "everything-claude-code: déjà cloné ou erreur"
```

### 2.4 Outils Écosystème

```bash
# SkillKit (accès 15,000+ skills via agentskills.com)
npx skillkit@latest

# Agent Skills CLI
npx agent-skills-cli
```

### 2.5 Vérification des installations

```bash
echo "=== Skills Repos installés ==="
ls -la ~/.claude/skills-repos/ 2>/dev/null
echo ""
echo "=== Project Skills ==="
ls -la .claude/skills/ 2>/dev/null
echo ""
echo "=== Global Skills ==="
ls -la ~/.claude/skills/ 2>/dev/null
```

## Résultat attendu
- 12 repos clonés dans `~/.claude/skills-repos/`
- Signale-moi le résultat de la vérification 2.5 pour que je puisse lancer la Phase 3.
