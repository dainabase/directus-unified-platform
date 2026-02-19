---
name: integration-sync-engine
description: Patterns de synchronisation bidirectionnelle pour Invoice Ninja v5, Revolut Business API v2, ERPNext v15, Mautic 5.x, et OpenAI Vision OCR. Ce skill doit être utilisé quand l'utilisateur travaille sur les intégrations externes, les webhooks, ou la synchronisation de données.
---

# Integration Sync Engine

## Invoice Ninja v5
- **Auth**: Header `X-API-TOKEN` + `X-Requested-With: XMLHttpRequest`
- **Base URL**: `http://localhost:8080/api/v1/`
- **Entities**: clients, invoices, payments, expenses, products
- **Pagination**: `?per_page=50&page=2`
- Pas de SDK Node officiel → REST direct avec axios

## Revolut Business API v2
- **Auth Flow**: RSA key pair → JWT client assertion (RS256) → OAuth2 code flow → access token (40min) + refresh token (90 jours)
- **Scopes**: READ, WRITE, PAY
- **⚠️ Token expire en 40min** — TOUJOURS implémenter le refresh flow
```javascript
import jwt from 'jsonwebtoken';
const clientAssertion = jwt.sign(
  { sub: CLIENT_ID, iss: CLIENT_ID, aud: 'https://revolut.com' },
  PRIVATE_KEY,
  { algorithm: 'RS256', expiresIn: '60s' }
);
```

## ERPNext v15
- **API v2**: `/api/v2/document/` et `/api/v2/method/`
- **Auth**: `token api_key:api_secret`
- **Filtres**: `?filters=[["field","=","value"]]`
- **Library**: `node-erpnext` npm

## Mautic 5.x
- **Auth**: Basic auth ou OAuth2
- **Webhook verification**: HMAC-SHA256 via header `Webhook-Signature`
- **Events clés**: `mautic.lead_post_save_new`, `form.submit`, `email.open`
- Mautic gère TOUS les emails (marketing + transactionnels)

## OpenAI Vision OCR
```javascript
import OpenAI from 'openai';
const openai = new OpenAI();
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{
    role: 'user',
    content: [
      { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
      { type: 'text', text: 'Extrais les données de cette facture en JSON structuré...' }
    ]
  }]
});
```

## Architecture de Sync
- **Outbound**: Directus hooks (action events) → appels API externes
- **Inbound**: Custom endpoints → réception webhooks → BullMQ async processing
- **Reconciliation**: CRON périodique pour rattraper les événements manqués
- **Idempotency**: Clés d'idempotence pour éviter les doublons
- **Circuit Breaker**: Désactiver temporairement un service externe en panne
