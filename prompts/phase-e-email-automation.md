# PHASE E — AUTOMATISATIONS EMAIL VIA MAUTIC
**Objectif** : Zéro email manuel pour HYPERVISUAL Switzerland  
**CDC** : Modules 1, 3, 5, 8  
**Commit cible** : `phase-e-email-automation`  

---

## ÉTAPE 0 — PRÉPARATION OBLIGATOIRE (dans cet ordre exact)

### 0a — Skill-router EN PREMIER
Avant tout code, lance le skill-router pour scanner les 939 skills disponibles :
```
Lis ~/.claude/skills-repos/claude-code-plugins-plus/skill-router/SKILL.md
```
Catégories à scanner : `email`, `automation`, `backend`, `api`, `directus`  
Propose les 2-3 meilleurs skills avant de commencer.

### 0b — Skills projet
```
Lis ~/.claude/skills-repos/claude-code-plugins-plus/directus-api-patterns/SKILL.md
```

### 0c — Vérification champs Directus via MCP
Avant de coder, vérifie les champs réels via MCP Directus (token = `hypervisual-admin-static-token-2026`) :
- `leads` : email, first_name, last_name, company_name, status, score
- `quotes` : id, quote_number, status, contact_id, total_ttc, pdf_url
- `client_invoices` : id, invoice_number, status, due_date, total_ttc, contact_id
- `payments` : id, status, amount, invoice_id, paid_at
- `proposals` : id, status, provider_id, amount
- `supplier_invoices` : id, status, payment_date, provider_id
- `email_templates` : id, name, category, subject, html_body, variables

---

## CONTEXTE TECHNIQUE

### Service Mautic existant
Fichier : `src/backend/api/mautic/index.js`  
Port : **8084** (pas 8080)  
Auth : Basic HTTP (username/password)  
Méthodes disponibles : `upsertContact()`, `sendEmail()`, `getActiveCampaigns()`, `bulkImportContacts()`

**Credentials Mautic** (à récupérer depuis .env ou docker-compose.yml) :
```
MAUTIC_URL=http://localhost:8084
MAUTIC_USERNAME=admin
MAUTIC_PASSWORD=<voir docker-compose>
```

### Architecture emails
Tous les emails passent par Mautic — jamais de sendgrid/nodemailer direct.  
**Déclencheurs** : Directus Flows (hooks sur événements collections).  
**Templates** : stockés dans collection `email_templates` Directus ET dans Mautic (emails transactionnels).  
**Langue** : Français (Suisse), format date DD.MM.YYYY, devise CHF.

---

## STORIES À IMPLÉMENTER

### E-01 — Email confirmation lead (REQ-LEAD-007 — délai < 5 minutes)
**Déclencheur** : Création d'un item dans collection `leads` (status = "new")  
**Destinataire** : lead.email  
**Template** : "Merci pour votre intérêt — HYPERVISUAL Switzerland"  
**Contenu** :
- Prénom du lead
- Résumé de sa demande (notes/company_name)
- Coordonnées HYPERVISUAL (info@hypervisual.ch, +41 xx xxx xx xx)
- Mention : "Notre équipe vous contacte sous 24h"

**Implémentation** :
1. Directus Flow : trigger `items.create` sur `leads`
2. Flow appelle endpoint custom `/api/email/lead-confirmation`
3. Endpoint : récupère lead → upsert contact Mautic → envoie email template E-01
4. Log dans `automation_logs` (rule_name, status, payload)

---

### E-02 — Email devis envoyé au client avec PDF (REQ-FACT-004)
**Déclencheur** : PATCH `quotes` → status change vers `"sent"`  
**Destinataire** : quote.contact_id.email  
**Template** : "Votre devis HYPERVISUAL Switzerland — [quote_number]"  
**Contenu** :
- Prénom client
- Numéro devis, montant TTC en CHF
- Lien PDF du devis (quote.pdf_url si existant, sinon lien portail client)
- Lien signature : `http://localhost:5173/client/quotes/[id]`
- Validité : 30 jours
- CTA : "Signer mon devis"

**Implémentation** :
1. Directus Flow : trigger `items.update` sur `quotes` filter `status = "sent"`
2. Endpoint `/api/email/quote-sent`
3. Récupère contact via `quote.contact_id` (GET /items/quotes/id?fields=*,contact_id.*)

---

### E-03 — Email accusé de réception paiement + activation projet (REQ-FACT-006)
**Déclencheur** : PATCH `payments` → status change vers `"completed"`  
**Destinataire** : payment → invoice → contact email  
**Template** : "Paiement reçu — Votre projet est activé ✓"  
**Contenu** :
- Montant CHF reçu
- Référence paiement
- Confirmation projet activé
- Lien suivi projet portail client : `http://localhost:5173/client/projects`
- Mention légale : "Reçu fiscal disponible sur demande"

**Implémentation** :
1. Directus Flow : trigger `items.update` sur `payments` filter `status = "completed"`
2. Endpoint `/api/email/payment-confirmed`
3. Chaîne : payment → client_invoice → contact_id → email

---

### E-04 — Rappels automatiques factures impayées (REQ-FACT-010)
**Déclencheur** : CRON quotidien à 09h00 (Directus Flow schedule)  
**Logique** :
- J+7 après due_date : rappel courtois
- J+14 après due_date : rappel ferme avec mention SchKG/LP
- J+30 après due_date : mise en demeure (SchKG/LP suisse)

**Templates** :
- J+7 : "Rappel : Votre facture [invoice_number] arrive à échéance"
- J+14 : "2ème rappel — Facture [invoice_number] impayée"  
- J+30 : "Mise en demeure — Facture [invoice_number]" (mention SchKG article 67)

**Implémentation** :
1. Directus Flow schedule : `0 9 * * *`
2. Endpoint `/api/email/invoice-reminders`
3. Query : `client_invoices` where `status = "sent"` AND `due_date < now()`
4. Calcul jours retard → sélection template
5. Log dans `automation_logs` avec invoice_id et level (7/14/30)
6. ⚠️ Ne jamais envoyer 2 rappels le même jour pour la même facture (check `automation_logs`)

---

### E-05 — Notification prestataire approbation facture + date paiement (REQ-APPRO-005)
**Déclencheur** : PATCH `supplier_invoices` → status change vers `"approved"`  
**Destinataire** : supplier_invoice → provider_id.email  
**Template** : "Votre facture a été approuvée — Paiement prévu le [date]"  
**Contenu** :
- Numéro facture fournisseur
- Montant TTC CHF
- Date de paiement prévue (payment_date ou J+30 si non renseignée)
- Coordonnées comptabilité HYPERVISUAL

**Implémentation** :
1. Directus Flow : trigger `items.update` sur `supplier_invoices` filter `status = "approved"`
2. Endpoint `/api/email/supplier-invoice-approved`
3. Récupère provider email via `provider_id.email`

---

### E-06 — Rappel prestataire si pas de réponse sous 24h (REQ-PREST-004)
**Déclencheur** : CRON toutes les heures (Directus Flow schedule)  
**Logique** : `proposals` où `status = "pending"` ET `date_created < now() - 24h`  
**Destinataire** : proposal → provider_id.email  
**Template** : "Rappel : Demande de devis en attente — [project_name]"  
**Contenu** :
- Nom du projet
- Date limite de réponse
- Lien portail prestataire : `http://localhost:5173/prestataire/quotes`
- Montant estimatif si disponible

**Implémentation** :
1. Directus Flow schedule : `0 * * * *`
2. Endpoint `/api/email/provider-reminder`
3. ⚠️ Max 1 rappel par proposal (check `automation_logs`)

---

## FICHIERS À CRÉER/MODIFIER

```
src/backend/api/email/
├── index.js              # Router principal email endpoints
├── templates.js          # Helpers HTML templates (fr-CH)
├── lead-confirmation.js  # E-01
├── quote-sent.js         # E-02
├── payment-confirmed.js  # E-03
├── invoice-reminders.js  # E-04 (CRON)
├── supplier-approved.js  # E-05
└── provider-reminder.js  # E-06 (CRON)

src/backend/directus-flows/
└── phase-e-flows.json    # Export JSON des 6 Flows Directus
```

**Modifications** :
- `src/backend/server.js` (ou app.js) : monter `/api/email` router
- `email_templates` collection : créer les 6 templates via API Directus

---

## RÈGLES TECHNIQUES OBLIGATOIRES

1. **Tous les emails via Mautic** — utiliser `MauticAPI.sendEmail()` ou équivalent, jamais nodemailer direct
2. **Éviter les doublons** : avant chaque envoi, checker `automation_logs` pour (rule_name + entity_id + date)
3. **Format suisse** : dates DD.MM.YYYY, montants `CHF 1'234.50` (apostrophe comme séparateur milliers)
4. **Logging systématique** : chaque email → insert dans `automation_logs` (status: sent/failed, error si failed)
5. **Gestion erreurs** : si Mautic down → log error dans `automation_logs`, ne pas crasher le serveur
6. **Pas de données sensibles** dans les logs (pas de password, pas de token bancaire)

---

## TEMPLATES HTML (structure minimale fr-CH)

```html
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
  <div style="background: #1e40af; padding: 20px; text-align: center;">
    <img src="https://hypervisual.ch/logo.png" height="40" alt="HYPERVISUAL Switzerland" />
  </div>
  <div style="padding: 30px;">
    <!-- contenu -->
  </div>
  <div style="background: #f3f4f6; padding: 20px; font-size: 12px; color: #666; text-align: center;">
    HYPERVISUAL Switzerland · info@hypervisual.ch<br>
    <a href="{unsubscribe_url}">Se désabonner</a>
  </div>
</body>
</html>
```

---

## VÉRIFICATION FINALE

Après implémentation :
```bash
# Test E-01 : créer un lead, vérifier email reçu
curl -X POST http://localhost:8055/items/leads \
  -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Test","last_name":"Email","email":"test@test.com","status":"new"}'

# Vérifier automation_logs
curl http://localhost:8055/items/automation_logs?sort=-date_created&limit=5 \
  -H "Authorization: Bearer hypervisual-admin-static-token-2026"

# Build sans erreur
cd src/frontend && npm run build
```

---

## MAJ ROADMAP.md OBLIGATOIRE

Après chaque story terminée, mettre à jour `ROADMAP.md` :
- Marquer `[V]` la story avec date et fichiers livrés
- Mettre à jour les métriques globales
- Logger les découvertes dans le tableau

**Commit final** : `feat(phase-e): email automation Mautic — 6 flows opérationnels`

---

## CRITÈRES D'ACCEPTATION

- [ ] E-01 : Lead créé → email reçu dans < 2 minutes (test manuel)
- [ ] E-02 : Quote status → "sent" → email client avec lien signature
- [ ] E-03 : Payment status → "completed" → email accusé réception
- [ ] E-04 : CRON 09h00 → rappels factures impayées par palier
- [ ] E-05 : Supplier invoice "approved" → email prestataire avec date paiement
- [ ] E-06 : CRON horaire → rappel prestataire si proposal en attente > 24h
- [ ] Aucun doublon d'email (check automation_logs)
- [ ] Tous les emails en français suisse (CHF, DD.MM.YYYY)
- [ ] Build React 0 erreurs
- [ ] ROADMAP.md mis à jour
