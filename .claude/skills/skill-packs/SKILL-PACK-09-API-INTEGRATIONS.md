# SKILL-PACK-09 — API INTEGRATIONS EXTERNES
**Phases ROADMAP** : D.1→D.4 (4 Hubs), B.3.1→B.3.5 (workflows réels)
**Objectif** : Invoice Ninja, Mautic, Revolut, ERPNext — actions contextuelles

## Custom Skills HYPERVISUAL (TOUS obligatoires pour cette phase)
1. **integration-sync-engine**
   PATH: `.claude/skills/integration-sync-engine/SKILL.md`
   USAGE: Sync bidirectionnelle Directus ↔ Invoice Ninja, Mautic, Revolut, ERPNext

2. **directus-api-patterns**
   PATH: `.claude/skills/directus-api-patterns/SKILL.md`
   USAGE: Webhooks entrants, endpoints custom pour intégration

3. **directus-extension-architect**
   PATH: `.claude/skills/directus-extension-architect/SKILL.md`
   USAGE: Hooks Directus pour automatisation post-paiement, post-signature

## Skills API
4. **webhook-receiver-generator**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/claude-code-plugins-plus-skills/skills/16-api-integration/webhook-receiver-generator/SKILL.md`
   USAGE: Réception + validation HMAC webhooks Revolut, DocuSeal

5. **api-design-patterns**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/awesome-claude-code-toolkit/skills/api-design-patterns/SKILL.md`
   USAGE: Client HTTP Invoice Ninja v5, Mautic 5.x API, ERPNext v15

6. **websocket-realtime**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/awesome-claude-code-toolkit/skills/websocket-realtime/SKILL.md`
   USAGE: Balances Revolut temps réel (refresh 60s)

7. **senior-fullstack**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/alirezarezvani-claude-skills/engineering-team/senior-fullstack/SKILL.md`
   USAGE: Architecture globale API layer

## Skills Security (pour sécuriser les intégrations)
8. **ln-760-security-setup**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/levnikolaevich-claude-code-skills/ln-760-security-setup/SKILL.md`
   USAGE: OAuth2 Revolut token management, expiration gracieuse

## Skills React (actions contextuelles dans les pages)
9. **react-hook-creator**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/react-hook-creator/SKILL.md`
   USAGE: useInvoiceNinja, useMautic, useRevolutPayment hooks

10. **fullstack-guardian**
    PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/jeffallan-claude-skills/skills/fullstack-guardian/SKILL.md`
    USAGE: Boutons actions contextuelles : "Payer via Revolut", "Envoyer relance Mautic"

## MCP à utiliser
- MCP Directus : Lecture/écriture statuts intégrations
- MCP GitHub : Vérification code existant avant modification

## Intégrations prioritaires
1. Invoice Ninja v5 : envoi devis/factures (CRITIQUE — coeur cycle vente)
2. Revolut Business API : paiements fournisseurs + token management
3. Mautic 5.x : relances clients + emails transactionnels visibles dans UI
4. DocuSeal : validation webhook signature électronique
5. ERPNext v15 : Hub lecture seule (pas de sync profonde en v3)
