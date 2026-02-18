# AUDIT — Résumé Exécutif

> **Plateforme** : Directus Unified Platform v2.0.0
> **Client** : HMF Corporation SA / HYPERVISUAL, Fribourg, Suisse
> **Date** : 18 février 2026
> **Auditeur** : Architecte système IA

---

## Périmètre de l'audit

Audit exhaustif de la plateforme de gestion multi-entreprises (ERP/CRM/Finance/RH/Legal) couvrant : 83 collections Directus, 200+ endpoints API, 87 composants React, 8 intégrations externes, et l'ensemble du code source (1'605 commits).

---

## État global de la plateforme

**Score de maturité : 49/100**

La plateforme dispose d'un noyau backend robuste (85/100) centré sur la finance et le workflow commercial, mais souffre de lacunes significatives en sécurité (35/100), en couverture de tests (10/100), et dans les portails secondaires (5/100).

### Points forts

Le **workflow commercial** (Lead → Devis → CGV → Signature → Acompte → Projet) est l'élément le plus abouti avec 49 endpoints implémentés et une machine à états complète. Le **module finance** offre 80+ endpoints fonctionnels incluant la facturation QR-Facture suisse, le rapprochement bancaire, et l'OCR via GPT-4 Vision. Le **moteur comptable suisse** est conforme aux normes 2025 (TVA, plan Käfer, formulaire 200 AFC, QR-Factures ISO 20022). Le **portail client** est production-ready avec authentification JWT complète. Les intégrations **Invoice Ninja**, **Mautic**, et **DocuSeal** sont opérationnelles avec orchestration multi-outils.

### Points critiques

Six routes API sensibles (collection, legal, revolut, invoice-ninja, mautic, erpnext) n'ont **aucune authentification**. Des **clés API sont exposées** dans le fichier .env committé (OpenAI, Notion, Directus). La blacklist JWT et la protection brute force sont **non-persistantes** (in-memory). Il n'existe **aucun test automatisé** malgré Jest et Playwright configurés. 25 composants frontend utilisent des **données mock hardcodées** avec un flag `USE_MOCK_DATA` par défaut à `true`.

---

## Synthèse par domaine

| Domaine | Maturité | Commentaire |
|---------|:--------:|-------------|
| Finance & Comptabilité | ⭐⭐⭐⭐ | 80+ endpoints, QR-Facture, TVA 2025, OCR — backend quasi-complet, UIs d'import/réconciliation manquantes |
| Workflow commercial | ⭐⭐⭐⭐⭐ | Pipeline complet Lead→Projet, signatures DocuSeal, acomptes |
| Recouvrement | ⭐⭐⭐⭐⭐ | Art. 104 CO, escalade, LP, dashboard — module le plus abouti |
| Portail Client | ⭐⭐⭐⭐⭐ | Production-ready, auth JWT, devis/factures/signatures |
| CRM & Leads | ⭐⭐⭐ | CRUD fonctionnel, Kanban — pipeline et customer success mockés |
| Intégrations | ⭐⭐⭐ | Invoice Ninja et Mautic excellents — Revolut et ERPNext partiels |
| Juridique | ⭐⭐⭐ | CGV/signatures fonctionnels — contrats et compliance mockés |
| Marketing | ⭐ | 100% mock — Mautic backend prêt mais pas connecté au frontend |
| Support | ⭐ | 100% mock — collection support_tickets créée mais non connectée |
| HR | ⭐ | Seule la vue équipe est connectée — tout le reste est mock |
| Portails secondaires | ⭐ | 1 fichier chacun, données hardcodées, pas d'auth |
| Sécurité | ⭐⭐ | JWT fonctionnel mais 6 routes non protégées, clés exposées |
| Tests & DevOps | ⭐ | 0% couverture, pas de CI/CD, pas de monitoring |

---

## Actions prioritaires

### Immédiat (Semaine 1) — Sécurité critique
1. **Rotation de toutes les clés API exposées** (OpenAI, Notion, Directus)
2. **Ajout d'authentification** sur les 6 routes non protégées
3. **Nettoyage de l'historique Git** pour supprimer les secrets
4. **Correction du flag** `USE_MOCK_DATA` (défaut à `false`)

### Court terme (Semaines 2-4) — Valeur rapide
5. **UIs manquantes** : import bancaire, rapprochement, OCR (3 écrans qui activent 24 endpoints dormants)
6. **Connexion des composants mock** : Support (3), Finance (2), CRM (2)
7. **Activation BullMQ + Redis** pour les tâches asynchrones et la persistance sessions
8. **Remplacement console.log** par Winston (81 fichiers)

### Moyen terme (Mois 2-3) — Consolidation
9. **Tests automatisés** : priorité sur le workflow commercial et la finance
10. **Scheduler de rappels** : compléter les 17 TODO des hooks
11. **Portail prestataire** MVP (auth + missions + time tracking)
12. **Finalisation Revolut** OAuth2 pour les 5 entreprises

### Long terme (Trimestre 2) — Excellence
13. Migration TypeScript progressive
14. CI/CD pipeline
15. Documentation API Swagger
16. Portail revendeur
17. Fonctionnalités prédictives (AI/ML)

---

## Conclusion

La plateforme repose sur des **fondations solides** — architecture multi-entreprise, moteur comptable suisse conforme, workflow commercial complet, et intégrations clés opérationnelles. Le principal risque est la **dette technique en sécurité** qui doit être adressée avant toute mise en production. Le ratio valeur/effort le plus favorable se trouve dans la **création d'interfaces pour les endpoints backend existants** (import bancaire, rapprochement, OCR), qui activeraient immédiatement des fonctionnalités déjà codées mais invisibles.

Avec 4 à 6 semaines de développement ciblé, la plateforme peut passer d'un score de 49/100 à environ 70/100, en se concentrant sur la sécurité, les UIs manquantes, et la connexion des composants mock.

---

*Livrables complets disponibles :*
- `audit_collections_directus.md` — 83 collections détaillées
- `audit_relations_map.md` — Cartographie des 100+ relations
- `audit_roles_permissions.md` — Rôles, auth, et permissions
- `audit_flows_extensions.md` — Flows, hooks, et extensions
- `audit_frontend_react.md` — 87 composants analysés
- `audit_integrations.md` — 8 intégrations évaluées
- `audit_gap_analysis.md` — Analyse des écarts complète
- `audit_opportunites.md` — Opportunités identifiées
