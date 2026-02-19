# Integrations Externes

## Services
- Invoice Ninja v5: REST direct, header `X-API-TOKEN`
- Revolut Business API v2: OAuth2 + JWT RS256, token 40min (refresh obligatoire)
- ERPNext v15: API v2, `token api_key:api_secret`
- Mautic 5.x: Basic auth ou OAuth2, gere TOUS les emails
- OpenAI Vision: OCR factures via GPT-4o

## Conventions
- Webhooks: ACK immediat (200) + traitement async via BullMQ
- Rate limiting: Bottleneck
- Retry: p-retry (3 tentatives)
- Idempotency keys pour eviter les doublons
- Circuit breaker pour les services en panne
