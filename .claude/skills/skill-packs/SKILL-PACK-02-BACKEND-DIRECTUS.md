# SKILL-PACK-02 — BACKEND DIRECTUS
**Phases ROADMAP** : A.1→A.7, B.1.1→B.1.5, B.2.1→B.2.5
**Objectif** : Collections Directus, élimination mock data, pages déconnectées

## Custom Skills HYPERVISUAL
1. **directus-api-patterns**
   PATH: `.claude/skills/directus-api-patterns/SKILL.md`
   USAGE: CRUD collections, M2O/O2M, permissions, RBAC

2. **directus-extension-architect**
   PATH: `.claude/skills/directus-extension-architect/SKILL.md`
   USAGE: Endpoints custom, hooks Directus, flows automation

3. **postgresql-directus-optimizer**
   PATH: `.claude/skills/postgresql-directus-optimizer/SKILL.md`
   USAGE: Schéma PostgreSQL, index, requêtes optimisées

4. **integration-sync-engine**
   PATH: `.claude/skills/integration-sync-engine/SKILL.md`
   USAGE: Synchronisation Directus ↔ Invoice Ninja, Mautic, Revolut

## Skills Database
5. **database-optimization**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/awesome-claude-code-toolkit/skills/database-optimization/SKILL.md`
   USAGE: Performance requêtes PostgreSQL, index sur collections

6. **redis-patterns**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/awesome-claude-code-toolkit/skills/redis-patterns/SKILL.md`
   USAGE: Cache Directus, sessions

## Skills API
7. **api-design-patterns**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/awesome-claude-code-toolkit/skills/api-design-patterns/SKILL.md`
   USAGE: Structure endpoints custom Directus RESTful

8. **webhook-receiver-generator**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/claude-code-plugins-plus-skills/skills/16-api-integration/webhook-receiver-generator/SKILL.md`
   USAGE: Réception webhooks Revolut HMAC + DocuSeal

9. **websocket-realtime**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/awesome-claude-code-toolkit/skills/websocket-realtime/SKILL.md`
   USAGE: Temps réel balances Revolut, statut paiements

## Skills React (connexion UI → API)
10. **fullstack-guardian**
    PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/jeffallan-claude-skills/skills/fullstack-guardian/SKILL.md`
    USAGE: Connexion pages React aux collections Directus (zéro mock)

11. **react-expert**
    PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/jeffallan-claude-skills/skills/react-expert/SKILL.md`
    USAGE: State management données Directus dans les pages

## MCP à utiliser
- MCP Directus : list_collections, describe_table, create_item, update_item
- MCP PostgreSQL : Requêtes SQL directes pour audit et optimisation
- MCP GitHub : Vérification commits, éviter régressions

## Règles critiques
- TOUJOURS list_collections + describe_table AVANT de coder
- ZÉRO mock data — toute donnée vient de Directus ou API
- Vérifier taux TVA 8.1/2.6/3.8 dans tout fichier Finance
- Tests doivent passer après chaque story Finance
