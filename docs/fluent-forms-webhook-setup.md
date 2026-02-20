# F-01 — Fluent Forms Pro Webhook Setup

## Configuration WordPress

### 1. Dans Fluent Forms Pro
1. Ouvrir le formulaire ID 17 (Contact / Demande de devis)
2. **Settings > Integrations > Webhook**
3. Ajouter un nouveau webhook :
   - **URL** : `https://votre-domaine.com/api/leads/wp-webhook`
   - **Method** : POST
   - **Format** : JSON
   - **Headers** : aucun requis (ou ajouter X-Fluent-Signature si HMAC active)

### 2. Champs du formulaire
Le webhook accepte ces noms de champs (mapping flexible) :

| Champ Lead | Noms acceptes dans le formulaire |
|---|---|
| Email | `email`, `email_address` |
| Prenom | `first_name`, `prenom`, `name` (1er mot) |
| Nom | `last_name`, `nom`, `name` (reste) |
| Telephone | `phone`, `telephone`, `mobile` |
| Entreprise | `company`, `entreprise`, `societe` |
| Budget | `budget`, `budget_estimate`, `budget_estime` |
| Date evenement | `event_date`, `date_evenement`, `date` |
| Type projet | `type_projet`, `type` |
| Message | `message`, `description`, `besoin` |

### 3. Securite HMAC (optionnel)
Pour activer la verification de signature :
1. Definir `WP_WEBHOOK_SECRET=votre-secret-256-bits` dans `.env`
2. Configurer le meme secret dans Fluent Forms > Webhook > Secret Key
3. Le header `X-Fluent-Signature` sera verifie en HMAC-SHA256

## Test

```bash
# Test basique
curl -X POST http://localhost:3000/api/leads/wp-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "form_id": 17,
    "form_title": "Contact HYPERVISUAL",
    "data": {
      "email": "test@example.com",
      "first_name": "Jean",
      "last_name": "Test",
      "phone": "+41791234567",
      "company": "Test SA",
      "budget": "5000",
      "type_projet": "location",
      "message": "Test webhook"
    }
  }'
```

## Qualification Score (1-5)

| Critere | Points |
|---|---|
| Base | 1 |
| Budget > 10000 CHF | +2 |
| Budget 3000-10000 CHF | +1 |
| Date evenement dans 30 jours | +1 |
| Email + Phone + Entreprise remplis | +1 |
| Type projet precise (pas "inconnu") | +1 |
| **Maximum** | **5** |

## Workflow

1. Payload recu depuis Fluent Forms
2. Verification HMAC (si WP_WEBHOOK_SECRET configure)
3. Anti-doublon : check automation_logs (fenetre 30 minutes)
4. Extraction flexible des champs
5. Calcul du score de qualification
6. Creation/mise a jour lead dans Directus
7. Creation lead_activity
8. Envoi email de confirmation (best-effort)
9. Log dans automation_logs
