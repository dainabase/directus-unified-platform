# SKILLS-QUICK-INDEX — HYPERVISUAL Unified Platform
> Point d'entrée unique du système skill-packs.
> Lire ce fichier EN PREMIER avant toute tâche de développement.
> Dernière mise à jour : Février 2026

---

## ÉTAPE 1 — Identifier ta phase ROADMAP

| Phase | Description | Pack à charger |
|-------|-------------|----------------|
| **Phase A** — Fondation Données | Collections Directus, audit mock data, TVA | PACK-02 + PACK-05 |
| **Phase B** — Connecter | Éliminer mock data, pages déconnectées, workflows réels | PACK-02 + PACK-09 + PACK-03 |
| **Phase C** — Simplifier UX | Sidebar SuperAdmin, Dashboard CEO | PACK-01 + PACK-02 |
| **Phase D** — Rendre Visible | 4 Hubs intégrations, actions contextuelles | PACK-09 + PACK-01 |
| **Phase E** — Tests E2E | Validation 5 workflows CEO | PACK-04 |
| **Phase F** — Production | Build, SSL, monitoring | PACK-07 + PACK-10 + PACK-03 |
| **Phase G** — Multi-entreprises | Company switcher | PACK-02 + PACK-01 |
| **Finance uniquement** | TVA, QR-Invoice, comptabilité | PACK-05 (OBLIGATOIRE) |
| **Tâche ponctuelle UI** | Composant, page React | PACK-01 |
| **Tâche ponctuelle API** | Endpoint, intégration | PACK-09 |
| **Documentation** | Après phase complétée | PACK-11 |

---

## ÉTAPE 2 — Charger le pack

Lire le fichier correspondant dans `.claude/skills/skill-packs/`

| # | Fichier Pack | Domaine |
|---|-------------|---------|
| 01 | `SKILL-PACK-01-DASHBOARD-UI.md` | Dashboard CEO, 4 Hubs, React |
| 02 | `SKILL-PACK-02-BACKEND-DIRECTUS.md` | Collections, mock data, API |
| 03 | `SKILL-PACK-03-SECURITY.md` | HMAC, OAuth2, score sécurité |
| 04 | `SKILL-PACK-04-TESTING-E2E.md` | Workflows CEO, Playwright |
| 05 | `SKILL-PACK-05-SWISS-FINANCE.md` | TVA 2025, QR-Invoice, PME Käfer |
| 06 | `SKILL-PACK-06-DATA-VISUALIZATION.md` | Recharts, KPIs temps réel |
| 07 | `SKILL-PACK-07-PERFORMANCE.md` | Build prod, Vite, Lighthouse |
| 08 | `SKILL-PACK-08-ACCESSIBILITY-I18N.md` | FR/DE/EN, WCAG |
| 09 | `SKILL-PACK-09-API-INTEGRATIONS.md` | Invoice Ninja, Mautic, Revolut, ERPNext |
| 10 | `SKILL-PACK-10-DEVOPS-DOCKER.md` | Docker, SSL, Grafana |
| 11 | `SKILL-PACK-11-DOCUMENTATION.md` | Docs API, code quality |

---

## ÉTAPE 3 — Produire la DÉCLARATION SKILLS

Après avoir lu le pack et les SKILL.md correspondants, produire obligatoirement :

```
=== DÉCLARATION SKILLS ===
...
=== FIN DÉCLARATION SKILLS ===
```

Voir `.claude/skills/skill-router/SKILL.md` pour le format exact.

---

## Plugins actifs (toujours disponibles)

Lire la liste complète : `.claude/skills/skill-router/references/active-plugins.md`

Highlights les plus utilisés sur HYPERVISUAL :

| Plugin | Usage |
|--------|-------|
| `webhook-receiver-generator` | Validation HMAC webhooks financiers |
| `react-context-setup` | Context global multi-portails |
| `react-component-generator` | Génération composants UI |
| `react-hook-creator` | Hooks custom Directus/API |
| `database-optimization` | Performance PostgreSQL |
| `ln-760-security-setup` | Sécurité endpoints |
| `ln-771-logging-configurator` | Logs production |

---

## MCP Servers (6 — disponibles directement)

| MCP | Usage principal |
|-----|-----------------|
| MCP Directus | CRUD collections, schéma, items — utiliser AVANT tout mapping données |
| MCP PostgreSQL | SQL direct 83+ collections |
| MCP ESLint | Analyse statique JS/TS |
| MCP Playwright | Tests E2E automatisés |
| MCP Context7 | Docs live 44,000+ librairies (Recharts, Directus...) |
| MCP Sequential Thinking | Raisonnement multi-étapes structuré |

---

## Règles globales HYPERVISUAL

### Design System (NON-NÉGOCIABLE)
- Background: #F5F5F7 | Texte: #1D1D1F | Accent: #0071E3
- Sidebar: 240px, glassmorphism rgba(255,255,255,0.80) + backdrop-filter: blur(20px)
- Police: -apple-system, 'SF Pro Display', 'Inter', base 14px
- Référence: `src/styles/design-system.css`

### TVA Suisse 2025 (NON-NÉGOCIABLE)
- Standard: 8.1% | Réduit: 2.6% | Hébergement: 3.8%
- Vérification: `grep -r "7\.7\|2\.5\|3\.7" src/` → doit retourner 0 résultat TVA

### Stack technique (INTERDIT de dévier)
- Frontend: React 18.2 + Vite (PAS Next.js, PAS Vue, PAS Angular)
- Graphiques: Recharts 2.10 (PAS ApexCharts)
- UI Template: Tabler.io 1.0.0-beta20 via CDN (template acheté)
- Backend: Directus 10.x + PostgreSQL 15
- Emails: Mautic 5.x (TOUS les emails — PAS SendGrid)
- Storage: Directus local (PAS S3)

### Workflow développement
1. Lire ce fichier → identifier le pack
2. Lire le pack → extraire les skills nécessaires
3. Lire chaque SKILL.md réel via son chemin absolu
4. Produire la DÉCLARATION SKILLS
5. Coder
6. Produire le RÉSUMÉ EXÉCUTION
7. Committer : `feat(phase-X): story X.X — description`
8. Marquer story complétée dans `ROADMAP_v3.0.md`
