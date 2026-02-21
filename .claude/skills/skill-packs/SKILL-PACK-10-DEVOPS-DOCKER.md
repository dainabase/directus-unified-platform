# SKILL-PACK-10 — DEVOPS & DOCKER
**Phases ROADMAP** : F.1→F.6 (Production deployment)
**Objectif** : Déploiement production, SSL, monitoring Grafana

## Custom Skills HYPERVISUAL
1. **docker-stack-ops**
   PATH: `.claude/skills/docker-stack-ops/SKILL.md`
   USAGE: Docker Compose production, services Directus/PostgreSQL/Redis/Invoice Ninja/ERPNext/Mautic

## Skills DevOps
2. **senior-devops**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/alirezarezvani-claude-skills/engineering-team/senior-devops/SKILL.md`
   USAGE: Infrastructure production complète

3. **ln-783-container-launcher**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/levnikolaevich-claude-code-skills/ln-783-container-launcher/SKILL.md`
   USAGE: Déploiement et orchestration conteneurs

4. **ln-771-logging-configurator**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/levnikolaevich-claude-code-skills/ln-771-logging-configurator/SKILL.md`
   USAGE: Centralisation logs, Grafana dashboard

5. **ln-743-test-infrastructure**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/levnikolaevich-claude-code-skills/ln-743-test-infrastructure/SKILL.md`
   USAGE: Infrastructure de test reproductible

6. **ln-731-docker-generator**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/levnikolaevich-claude-code-skills/ln-731-docker-generator/SKILL.md`
   USAGE: Génération Dockerfile et docker-compose optimisés

7. **ln-780-bootstrap-verifier**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/levnikolaevich-claude-code-skills/ln-780-bootstrap-verifier/SKILL.md`
   USAGE: Vérification démarrage complet stack avant mise en prod

## MCP à utiliser
- MCP Sequential Thinking : Planification séquence déploiement
- MCP GitHub : Vérification avant release, versioning

## Stack production cible
- Directus 10.x + PostgreSQL 15 + Redis
- Invoice Ninja v5 (Docker MySQL + Redis)
- ERPNext v15 (Docker Frappe)
- Mautic 5.x (Docker)
- SSL : certificats production (obligatoire webhooks Revolut/DocuSeal)
- Grafana : monitoring temps réel
