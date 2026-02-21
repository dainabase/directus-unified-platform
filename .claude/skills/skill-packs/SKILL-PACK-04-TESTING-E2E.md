# SKILL-PACK-04 — TESTING E2E
**Phases ROADMAP** : E.1→E.6, B.3.1→B.3.5
**Objectif** : Validation 5 workflows CEO en conditions réelles

## Custom Skills HYPERVISUAL
1. **multi-portal-architecture**
   PATH: `.claude/skills/multi-portal-architecture/SKILL.md`
   USAGE: Tests portails SuperAdmin, Client, Prestataire, Revendeur

2. **integration-sync-engine**
   PATH: `.claude/skills/integration-sync-engine/SKILL.md`
   USAGE: Test workflows bout-en-bout : Revolut → Directus → Invoice Ninja

## Skills Testing
3. **senior-qa**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/alirezarezvani-claude-skills/engineering-team/senior-qa/SKILL.md`
   USAGE: Stratégie tests E2E, cas de test workflows CEO

4. **tdd-guide**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/alirezarezvani-claude-skills/engineering-team/tdd-guide/SKILL.md`
   USAGE: Tests unitaires, maintien tests 100% pass

5. **ln-522-manual-tester**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/levnikolaevich-claude-code-skills/ln-522-manual-tester/SKILL.md`
   USAGE: Tests manuels workflows CEO (checklist production)

6. **ln-781-build-verifier**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/levnikolaevich-claude-code-skills/ln-781-build-verifier/SKILL.md`
   USAGE: Vérification build production avant déploiement

7. **ux-researcher-designer**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/alirezarezvani-claude-skills/product-team/ux-researcher-designer/SKILL.md`
   USAGE: Tests utilisabilité Dashboard CEO — navigation sans confusion

8. **ln-301-task-creator**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/levnikolaevich-claude-code-skills/ln-301-task-creator/SKILL.md`
   USAGE: Création des cas de test pour chaque workflow

## Skills Playwright (via MCP)
9. **playwright-expert**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/jeffallan-claude-skills/skills/playwright-expert/SKILL.md`
   USAGE: Automatisation tests W1→W5, screenshots validation
   Note: MCP Playwright disponible directement

## Skills Performance
10. **frontend-excellence**
    PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/awesome-claude-code-toolkit/skills/frontend-excellence/SKILL.md`
    USAGE: Performance UI, temps de chargement dashboard

## MCP à utiliser
- MCP Playwright : Tests E2E automatisés, screenshots
- MCP Directus : Vérification données après workflow
- MCP PostgreSQL : Validation état base de données post-test

## Checklist workflows (tous doivent passer)
- W1 : Lead → Devis → Signature → Acompte → Projet activé (sans quitter la plateforme)
- W2 : Transaction Revolut → Matching → Facture mise à jour → Comptabilité
- W3 : Facture fournisseur → Bouton "Payer via Revolut" → Paiement confirmé
- W4 : Vue projet CEO — statut, jalons, prestataires, budget en une page
- W5 : Facture en retard → Relance Mautic déclenchée → Statut tracé
