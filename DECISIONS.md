# DECISIONS — Registre des decisions techniques

> Ce fichier est mis a jour uniquement par Jean (CEO) ou sur instruction explicite.
> Claude Code peut lire ce fichier, jamais l'ecrire sans instruction.

---

| ID    | Date       | Decision                                      | Alternatives rejetees     | Raison                          |
|-------|------------|-----------------------------------------------|---------------------------|---------------------------------|
| D-001 | 2026-02-19 | Recharts pour les graphiques                  | ApexCharts                | Valide en session avec Jean     |
| D-002 | 2026-02-19 | Mautic pour TOUS les emails                   | SendGrid, Resend          | Deja integre, evite doublon     |
| D-003 | 2026-02-19 | Tabler.io via CDN (template achete)           | Bootstrap, MUI            | Template achete, UI coherente   |
| D-004 | 2026-02-19 | Directus Storage (pas S3)                     | AWS S3, Cloudflare R2     | Simplifie l'architecture        |
| D-005 | 2026-02-19 | Outil automation : decision en attente        | Make.com, n8n, Directus Flows | Evalue a l'implementation  |
| D-006 | 2026-02-19 | Scope V1 : HYPERVISUAL uniquement             | Multi-entreprises des V1  | Stabiliser avant d'etendre      |
| D-007 | 2026-02-19 | swissqrbill pour QR-Invoice v2.3              | Custom implementation     | Librairie certifiee, deja installee |
