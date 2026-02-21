# SKILL-PACK-05 — SWISS FINANCE
**Phases ROADMAP** : Toute story Finance, TVA, QR-Invoice
**Objectif** : Conformité suisse stricte — taux TVA 2025, QR-Invoice v2.3, PME Käfer

## Custom Skills HYPERVISUAL (OBLIGATOIRES pour toute story Finance)
1. **swiss-compliance-engine**
   PATH: `.claude/skills/swiss-compliance-engine/SKILL.md`
   USAGE: Taux TVA 8.1/2.6/3.8%, QR-Invoice ISO 20022 v2.3, Formulaire TVA 200 AFC, PME Käfer

2. **postgresql-directus-optimizer**
   PATH: `.claude/skills/postgresql-directus-optimizer/SKILL.md`
   USAGE: Collections comptabilité, journal, balance des comptes

3. **integration-sync-engine**
   PATH: `.claude/skills/integration-sync-engine/SKILL.md`
   USAGE: Sync Revolut transactions → comptabilité, Invoice Ninja → Directus

## Skills Finance
4. **invoice-generator**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/claude-code-plugins-plus-skills/skills/19-business-automation/invoice-generator/SKILL.md`
   USAGE: Génération factures, QR-Invoice, PDF

5. **financial-analyst**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/alirezarezvani-claude-skills/finance/financial-analyst/SKILL.md`
   USAGE: Analyse trésorerie, MRR, ARR, KPIs financiers

## Skills Regulatory
6. **regulatory-affairs-head**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/alirezarezvani-claude-skills/ra-qm-team/regulatory-affairs-head/SKILL.md`
   USAGE: Conformité Code des Obligations suisse, LPD

7. **code-reviewer**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/jeffallan-claude-skills/skills/code-reviewer/SKILL.md`
   USAGE: Vérification taux TVA dans TOUS les fichiers Finance

## MCP à utiliser
- MCP Directus : Collections client_invoices, supplier_invoices, payments, bank_transactions
- MCP PostgreSQL : Calculs TVA, balance comptable directe

## Règles NON-NÉGOCIABLES
- TVA Standard : 8.1% (JAMAIS 7.7%)
- TVA Réduit : 2.6% (JAMAIS 2.5%)
- TVA Hébergement : 3.8% (JAMAIS 3.7%)
- QR-Invoice : IBAN suisse, Mod10 récursif, ISO 20022 v2.3 strict
- Vérification obligatoire : `grep -r "7\.7\|2\.5\|3\.7" src/` → doit retourner 0 résultat TVA
- Tests doivent passer après chaque modification Finance
