# SKILL-PACK-03 — SECURITY
**Phases ROADMAP** : B.3.1→B.3.5, F.3, F.4
**Objectif** : Validation webhooks HMAC, score sécurité 85/100, audit CVE

## Custom Skills HYPERVISUAL
1. **integration-sync-engine**
   PATH: `.claude/skills/integration-sync-engine/SKILL.md`
   USAGE: HMAC validation Revolut webhooks, OAuth2 token management

## Skills Security
2. **senior-security**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/alirezarezvani-claude-skills/engineering-team/senior-security/SKILL.md`
   USAGE: Audit sécurité global, OWASP checklist

3. **ln-761-secret-scanner**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/levnikolaevich-claude-code-skills/ln-761-secret-scanner/SKILL.md`
   USAGE: Scan secrets exposés dans le code

4. **ln-770-crosscutting-setup**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/levnikolaevich-claude-code-skills/ln-770-crosscutting-setup/SKILL.md`
   USAGE: Sécurité transversale (CORS, headers, rate limiting)

5. **ln-760-security-setup**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/levnikolaevich-claude-code-skills/ln-760-security-setup/SKILL.md`
   USAGE: Configuration sécurité initiale

6. **ln-733-env-configurator**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/levnikolaevich-claude-code-skills/ln-733-env-configurator/SKILL.md`
   USAGE: Variables d'environnement sécurisées

7. **senior-secops**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/alirezarezvani-claude-skills/engineering-team/senior-secops/SKILL.md`
   USAGE: Opérations sécurité, monitoring intrusions

## Skills API/Webhook
8. **webhook-receiver-generator**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/claude-code-plugins-plus-skills/skills/16-api-integration/webhook-receiver-generator/SKILL.md`
   USAGE: HMAC validation Revolut, signature verification DocuSeal

9. **api-design-patterns**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/awesome-claude-code-toolkit/skills/api-design-patterns/SKILL.md`
   USAGE: Sécurisation endpoints, authentification JWT

## Skills DevOps
10. **ln-771-logging-configurator**
    PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/levnikolaevich-claude-code-skills/ln-771-logging-configurator/SKILL.md`
    USAGE: Logs sécurité, audit trail paiements

## MCP à utiliser
- MCP ESLint : Analyse statique sécurité JS/TS
- MCP GitHub : Audit commits pour secrets accidentels

## Objectifs mesurables
- Score sécurité : 72/100 → ≥85/100
- npm audit : 0 vulnérabilité critique
- HMAC Revolut : validé en conditions réelles
- SSL production : configuré
