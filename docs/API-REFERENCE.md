# API Reference -- HYPERVISUAL Unified Platform

> **Version**: 2.1.0
> **Base URL**: `http://localhost:3000`
> **Generated**: 2026-02-21
> **Total endpoints**: 200+

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Finance](#2-finance)
3. [Legal](#3-legal)
4. [Collection (Recouvrement)](#4-collection-recouvrement)
5. [Commercial](#5-commercial)
6. [KPIs](#6-kpis)
7. [Milestones](#7-milestones)
8. [Subscriptions](#8-subscriptions)
9. [Credits](#9-credits)
10. [Supplier Invoices](#10-supplier-invoices)
11. [Time Tracking](#11-time-tracking)
12. [Support](#12-support)
13. [Lead Capture](#13-lead-capture)
14. [Email Automation](#14-email-automation)
15. [Workflows](#15-workflows)
16. [Notifications](#16-notifications)
17. [Integrations (DocuSeal, Invoice Ninja, Mautic)](#17-integrations)
18. [Invoice Ninja (Direct)](#18-invoice-ninja-direct)
19. [Revolut](#19-revolut)
20. [ERPNext](#20-erpnext)
21. [Mautic (Direct)](#21-mautic-direct)
22. [Reports](#22-reports)
23. [Health Check](#23-health-check)
24. [OCR (Legacy)](#24-ocr-legacy)
25. [Directus Proxy](#25-directus-proxy)

---

## Authentication Methods

The platform supports three authentication methods:

| Method | Header | Usage |
|--------|--------|-------|
| JWT Bearer | `Authorization: Bearer <token>` | Primary method for all portals |
| API Key | `X-API-Key: <key>` | Machine-to-machine integration |
| Flexible Auth | Either JWT or API Key | Finance API and protected routes |

Rate limits:
- **Global**: 100 requests/minute per IP on `/api/*`
- **Auth**: 10 requests/15 minutes on `/api/auth/*`
- **Webhooks**: 30 requests/minute on `/api/workflows/webhook/*`

---

## 1. Authentication

**Base path**: `/api/auth`
**Auth**: None required for login/register; JWT required for protected routes
**Source**: `src/backend/api/auth/auth.routes.js`

### POST /api/auth/login

Authenticate user and return JWT tokens.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | Yes | User email |
| `password` | string | Yes | User password |
| `portal` | string | No | Portal context (`superadmin`, `client`, `prestataire`, `revendeur`) |

**Response** (200):
```json
{
  "success": true,
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "expiresIn": "24h",
  "portal": "superadmin",
  "user": { "id": "...", "email": "...", "name": "...", "role": "admin", "companies": [...] }
}
```

**Errors**: `400` (missing fields), `401` (invalid credentials), `403` (account disabled / portal denied), `429` (rate limited)

---

### POST /api/auth/refresh

Refresh access token using refresh token.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `refreshToken` | string | Yes | Valid refresh token |

**Response** (200): `{ success, accessToken, refreshToken, expiresIn }`

**Errors**: `400`, `401` (invalid/expired refresh token)

---

### POST /api/auth/logout

Logout user and blacklist current token.

**Auth**: JWT required

**Response** (200): `{ success: true, message: "Deconnexion reussie" }`

---

### GET /api/auth/me

Get current user profile.

**Auth**: JWT required

**Response** (200): `{ success, user: { id, email, name, role, companies, avatar, last_login } }`

---

### PUT /api/auth/me

Update current user profile.

**Auth**: JWT required

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | Display name |
| `avatar` | string | No | Avatar URL/ID |

**Response** (200): `{ success: true, message: "Profil mis a jour" }`

---

### POST /api/auth/change-password

Change user password (forces re-login).

**Auth**: JWT required

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `currentPassword` | string | Yes | Current password |
| `newPassword` | string | Yes | New password (min 8 chars, upper+lower+digit) |

**Response** (200): `{ success: true, message: "Mot de passe modifie" }`

**Errors**: `400` (weak password), `401` (wrong current password)

---

### GET /api/auth/verify

Verify token is valid.

**Auth**: JWT required

**Response** (200): `{ success: true, valid: true, user: { id, email, name, role } }`

---

### GET /api/auth/companies

Get companies user has access to.

**Auth**: JWT required

**Response** (200): `{ success, companies: [{ code, name, hasAccess }] }`

---

### POST /api/auth/register

Register a new user (admin only).

**Auth**: JWT required (admin/superadmin role)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | Yes | User email |
| `password` | string | Yes | User password |
| `name` | string | Yes | Display name |
| `role` | string | No | Role (default: `user`) |
| `companies` | array | No | Company access codes |

**Response** (201): `{ success, user: { id, email, name, role } }`

**Errors**: `403` (not admin), `409` (email exists)

---

### POST /api/auth/magic-link

Send a one-time login link (client portal).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | Yes | Client email |

**Response** (200): `{ success: true, message: "Si un compte existe..." }`

> In dev mode, returns `dev_token` for testing.

---

### GET /api/auth/magic-link/verify/:token

Verify a magic link token and create a session.

| Parameter | Location | Required | Description |
|-----------|----------|----------|-------------|
| `token` | path | Yes | Magic link token |

**Response** (200): `{ success, accessToken, contact: { id, name, email } }`

**Errors**: `401` (invalid/expired link)

---

### GET /api/auth/health

Health check for auth service.

**Response** (200): `{ success: true, service: "auth", status: "healthy" }`

---

## 2. Finance

**Base path**: `/api/finance`
**Auth**: Flexible (JWT or API Key) -- applied at router level
**Source**: `src/backend/api/finance/finance.routes.js`
**Endpoints**: 80+

### Configuration

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/config/companies` | GET | List all company configurations | flexibleAuth |
| `/config/companies/:code` | GET | Get specific company config | flexibleAuth |
| `/config/companies/:code` | PUT | Update company config | admin only |
| `/config/sync` | POST | Sync fallback companies to DB | admin only |
| `/config/tva` | GET | Get TVA rates | flexibleAuth |
| `/config/exchange-rates` | GET | Get exchange rates | flexibleAuth |
| `/config/thresholds` | GET | Get alert thresholds | flexibleAuth |
| `/config/cache/clear` | POST | Clear config cache | admin only |

### Dashboard

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/dashboard/consolidated` | GET | Consolidated dashboard (5 companies) |
| `/dashboard/:company` | GET | Full dashboard for one company |
| `/kpis/:company` | GET | KPIs and key metrics. Query: `start`, `end` |
| `/alerts/:company` | GET | Priority alerts by severity |
| `/evolution/:company` | GET | Monthly evolution. Query: `months` (default 12, max 24) |
| `/cash-position/:company` | GET | Detailed cash position |
| `/cash-forecast/:company` | GET | Cash forecast. Query: `days` (default 90, max 180) |
| `/upcoming/:company` | GET | Upcoming due dates. Query: `days` (default 30) |
| `/transactions/:company` | GET | Recent bank transactions. Query: `limit` (default 20, max 100) |
| `/yoy/:company` | GET | Year-over-year comparison |
| `/vat/:company` | GET | Quarterly VAT balance |
| `/client-stats/:company` | GET | Client statistics. Query: `client_id` |
| `/receivables/:company` | GET | Receivables with aging |
| `/payables/:company` | GET | Payables with aging |
| `/companies` | GET | List supported companies |

### Client Invoices

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/invoices` | POST | Create client invoice |
| `/invoices/:id` | GET | Invoice detail |
| `/invoices/:id/qr` | GET | Invoice with Swiss QR data |
| `/invoices/:id` | PUT | Update invoice (draft only) |
| `/invoices/:id/send` | POST | Send invoice by email |
| `/invoices/:id/mark-paid` | POST | Mark as paid |
| `/invoices/:id/partial-payment` | POST | Record partial payment |
| `/invoices/:id/cancel` | POST | Cancel invoice (reason required) |
| `/invoices/:id/duplicate` | POST | Duplicate invoice |
| `/invoices/:id/credit-note` | POST | Create credit note |
| `/invoices/list/:company` | GET | List invoices. Query: `status`, `client_id`, `from`, `to`, `page`, `limit`, `sort` |
| `/invoices/search/:company` | GET | Search invoices. Query: `q` (min 2 chars) |
| `/invoices/overdue/:company` | GET | Overdue invoices |
| `/invoices/stats/:company` | GET | Invoice statistics. Query: `from`, `to` |

### PDF Generation

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/invoices/:id/pdf` | POST | Generate invoice PDF |
| `/invoices/:id/pdf/download` | GET | Download invoice PDF directly |
| `/reminder/:id/pdf` | POST | Generate payment reminder PDF. Body: `level` (1-3) |
| `/credit-note/:id/pdf` | POST | Generate credit note PDF |
| `/statement/:clientId/pdf` | POST | Generate account statement PDF. Body: `owner_company`, `from`, `to` |

### Reminders

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/invoices/:id/reminder` | POST | Send payment reminder. Body: `level`, `send_email`, `email` |
| `/reminders/:company` | GET | List sent reminders. Query: `status`, `from`, `to`, `page`, `limit` |
| `/reminders/batch/:company` | POST | Batch send reminders. Body: `invoice_ids`, `level`, `send_email` |

### Bank Reconciliation

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/reconciliation/:company` | GET | Unreconciled transactions. Query: `page`, `limit`, `type` |
| `/reconciliation/suggestions/:transactionId` | GET | Reconciliation suggestions |
| `/reconciliation/pending/:company` | GET | Pending suggestions |
| `/reconciliation/match` | POST | Confirm reconciliation. Body: `transaction_id`, `invoice_id` |
| `/reconciliation/validate-suggestion` | POST | Validate existing suggestion. Body: `suggestion_id` |
| `/reconciliation/reject` | POST | Reject suggestion. Body: `suggestion_id`, `reason` |
| `/reconciliation/manual` | POST | Manual reconciliation. Body: `transaction_id`, `invoice_id`, `notes` |
| `/reconciliation/undo/:id` | POST | Undo reconciliation. Body: `reason` |
| `/reconciliation/auto/:company` | POST | Auto-reconcile. Body: `threshold` |
| `/reconciliation/history/:company` | GET | Reconciliation history. Query: `from`, `to`, `page`, `limit` |
| `/reconciliation/report/:company` | GET | Reconciliation report. Query: `from`, `to` |

### Bank Import

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/bank/import/camt053` | POST | Import CAMT.053 file (ISO 20022). Multipart: `file`, `owner_company` |
| `/bank/import/csv` | POST | Import bank CSV. Multipart: `file`, `owner_company`, `bank_format` |
| `/bank/stats/:company` | GET | Cash flow statistics. Query: `from`, `to` |

### OCR (Finance Module)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ocr/process` | POST | Process document via OCR. Multipart: `document`, `document_type`, `owner_company` |
| `/ocr/preview` | POST | Preview accounting entry. Body: `ocr_id` |
| `/ocr/validate` | POST | Validate and record entry. Body: `ocr_id`, `corrections` |
| `/ocr/reject` | POST | Reject OCR document. Body: `ocr_id`, `reason` |
| `/ocr/pending/:company` | GET | Pending OCR documents. Query: `page`, `limit` |
| `/ocr/stats/:company` | GET | OCR statistics |
| `/ocr/batch/:company` | POST | Batch OCR processing. Body: `limit` |
| `/ocr/mappings` | GET | Available account mappings. Query: `search` |

### Supplier Invoices (Finance Module)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/supplier-invoices/:company` | GET | List supplier invoices. Query: `status`, `supplier_id`, `from`, `to`, `page`, `limit` |
| `/supplier-invoices/:id/approve` | POST | Approve. Body: `approved_by`, `notes` |
| `/supplier-invoices/:id/reject` | POST | Reject. Body: `rejected_by`, `reason` (required) |
| `/supplier-invoices/:id/schedule` | POST | Schedule payment. Body: `payment_date` (required), `bank_account_id` |
| `/supplier-invoices/:id/mark-paid` | POST | Mark as paid. Body: `payment_date`, `payment_method`, `transaction_id` |

### Reports and Exports

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/report/:company` | GET | Financial report. Query: `period` (default `month`) |
| `/export/json/:company` | GET | Export dashboard as JSON file |
| `/export/csv/:company/transactions` | GET | Export transactions CSV. Query: `from`, `to` |
| `/export/csv/:company/invoices` | GET | Export invoices CSV. Query: `from`, `to`, `type` |

### GET /api/finance/health

Health check for Finance API.

**Response** (200): `{ success, status, version, services, auth }`

---

## 3. Legal

**Base path**: `/api/legal`
**Auth**: JWT (authMiddleware)
**Source**: `src/backend/api/legal/legal.routes.js`

### CGV (General Terms)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/cgv/:company/:type` | GET | Get active CGV. Query: `language` (default `fr`) |
| `/cgv` | POST | Create new CGV document |
| `/cgv/:id/accept` | POST | Record client CGV acceptance |
| `/cgv/:company/:type/check/:clientId` | GET | Check if client accepted current CGV |
| `/cgv/:company/:type/history` | GET | CGV version history |
| `/cgv/generate` | POST | Generate CGV content. Body: `owner_company`, `document_type`, `custom_data` |

### Signatures

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/signature/request` | POST | Create signature request |
| `/signature/callback` | POST | Signature provider webhook callback |
| `/signature/:id/verify` | GET | Verify signature validity |
| `/signature/:company` | GET | List signature requests. Query: `status`, `limit` |
| `/signature/:id/cancel` | POST | Cancel signature request |

### GET /api/legal/health

**Response** (200): `{ success, status, service: "legal", modules: ["cgv", "signature"] }`

---

## 4. Collection (Recouvrement)

**Base path**: `/api/collection`
**Auth**: JWT (authMiddleware)
**Source**: `src/backend/api/collection/collection.routes.js`

### Collection Tracking

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/initialize/:invoiceId` | POST | Initialize collection tracking for invoice |
| `/process` | POST | Process collection workflow (cron). Body: `owner_company` |
| `/dashboard/:company` | GET | Collection dashboard |
| `/:trackingId/payment` | POST | Record payment |
| `/:trackingId/suspend` | POST | Suspend collection. Body: `reason` |
| `/:trackingId/resume` | POST | Resume collection |
| `/:trackingId/write-off` | POST | Write off debt. Body: `reason` |
| `/:trackingId/history` | GET | Collection history |

### Interest Calculation

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/calculate-interest` | POST | Calculate late payment interest. Body: `principal`, `rate`, `days` or `start_date`/`end_date` |
| `/rate-check/:rate` | GET | Check if interest rate is acceptable |

### LP (Poursuites / Swiss Debt Collection)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/lp/initiate/:trackingId` | POST | Initiate LP debt collection proceedings |
| `/lp/webhook` | POST | e-LP webhook handler |
| `/lp/:caseId` | GET | LP case status |
| `/lp/:caseId/continue` | POST | Request LP continuation |
| `/lp/stats/:company` | GET | LP statistics |
| `/lp/fees/:amount` | GET | Calculate LP fees for amount |

### GET /api/collection/health

**Response** (200): `{ success, status, service: "collection", modules: [...] }`

---

## 5. Commercial

**Base path**: `/api/commercial`
**Auth**: JWT (authMiddleware)
**Source**: `src/backend/api/commercial/index.js`

The commercial module mounts 6 sub-routers:

### Quotes (`/api/commercial/quotes`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/quotes` | GET | List quotes with filters |
| `/quotes/stats` | GET | Quote statistics |
| `/quotes/:id` | GET | Get quote detail |
| `/quotes/:id/workflow` | GET | Quote workflow status |
| `/quotes` | POST | Create quote |
| `/quotes/from-lead` | POST | Convert lead to quote |
| `/quotes/:id/send` | POST | Send quote to client |
| `/quotes/:id/status` | PATCH | Update quote status |
| `/quotes/:id/cgv-accept` | POST | Record CGV acceptance |
| `/quotes/:id/sign` | POST | Mark quote as signed |

### Deposits (`/api/commercial/deposits`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/deposits/pending` | GET | Pending deposits |
| `/deposits/overdue` | GET | Overdue deposits |
| `/deposits/stats` | GET | Deposit statistics |
| `/deposits/config/:owner_company_id` | GET | Deposit config |
| `/deposits/calculate/:quote_id` | POST | Calculate deposit amount |
| `/deposits/invoice/:quote_id` | POST | Create deposit invoice |
| `/deposits/paid/:quote_id` | POST | Mark deposit as paid |

### CGV (`/api/commercial/cgv`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/cgv/:owner_company_id` | GET | Active CGV |
| `/cgv/:owner_company_id/versions` | GET | CGV version history |
| `/cgv/:owner_company_id/stats` | GET | CGV statistics |
| `/cgv` | POST | Create CGV version |
| `/cgv/:cgv_id/activate` | POST | Activate CGV version |
| `/cgv/accept` | POST | Record CGV acceptance |
| `/cgv/check/:contact_id/:owner_company_id` | GET | Check acceptance |
| `/cgv/history/:contact_id` | GET | Acceptance history |

### Signatures (`/api/commercial/signatures`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/signatures/request/:quote_id` | POST | Create DocuSeal signature request |
| `/signatures/initiate/:quote_id` | POST | Initiate signature process |
| `/signatures/manual/:quote_id` | POST | Manual signature |
| `/signatures/logs/:quote_id` | GET | Signature logs |
| `/signatures/verify/:signature_log_id` | GET | Verify signature |
| `/signatures/webhook/docuseal` | POST | DocuSeal webhook |
| `/signatures/types` | GET | Signature types |

### Portal (`/api/commercial/portal`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/portal/auth/login` | POST | Portal login |
| `/portal/auth/activate` | POST | Activate portal account |
| `/portal/auth/forgot-password` | POST | Forgot password |
| `/portal/auth/reset-password` | POST | Reset password |
| `/portal/auth/verify` | GET | Verify portal token |
| `/portal/me` | GET | Portal user profile |
| `/portal/me/preferences` | PATCH | Update preferences |
| `/portal/accounts` | POST | Create portal account (admin) |

### Pipeline (`/api/commercial/pipeline`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/pipeline/stats` | GET | Pipeline statistics |
| `/pipeline/dashboard` | GET | Full pipeline dashboard |
| `/pipeline/funnel` | GET | Funnel data |
| `/pipeline/kpis` | GET | Pipeline KPIs |
| `/pipeline/activity` | GET | Recent pipeline activity |

### GET /api/commercial/

API info and available endpoints.

### GET /api/commercial/docs

Full API documentation.

---

## 6. KPIs

**Base path**: `/api/kpis`
**Auth**: None (public) -- recommended to add flexibleAuth
**Source**: `src/backend/api/kpis/index.js`, `thresholds.js`, `daily-report.js`, `treasury-forecast.js`

### KPI Data (Phase J-01)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/latest` | GET | Latest value per metric with variation. Query: `company` (default `HYPERVISUAL`) |
| `/history/:metric` | GET | Time-series for sparkline. Query: `days` (default 30), `company` |
| `/summary` | GET | Full CEO summary with operational data. Query: `company` |

### Thresholds and Alerts (Phase J-02)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/thresholds` | GET | Current threshold configuration |
| `/thresholds` | PUT | Update thresholds (merged with defaults). Body: JSON thresholds object |
| `/alerts` | GET | KPIs in alert state (warning/critical). Query: `company` |

Default thresholds: MRR (CHF 60k/40k), ARR (CHF 700k/500k), RUNWAY (6/3 months), NPS (50/30), LTV_CAC (3x/2x), EBITDA (0/-10k).

### Daily Report (Phase J-03)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/report/preview` | GET | Preview CEO report HTML. Query: `company` |
| `/report/send` | POST | Send CEO report immediately. Body: `company`, `email` |

CRON: Sends automatically at 07:00 daily via Mautic.

### Treasury Forecast (Phase J-04)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/treasury` | GET | Treasury forecast 30/60/90 days. Query: `company` |

**Response** (200):
```json
{
  "current_balance": 245000,
  "burn_rate_monthly": 42000,
  "runway_months": 5.8,
  "d30": { "balance": 238000, "incoming": 85000, "outgoing": 92000 },
  "d60": { "balance": 225000, "incoming": 120000, "outgoing": 140000 },
  "d90": { "balance": 210000, "incoming": 175000, "outgoing": 210000 }
}
```

---

## 7. Milestones

**Base path**: `/api/milestones`
**Auth**: None (recommended to add)
**Source**: `src/backend/api/milestones/index.js`
**Story**: I-01

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/:deliverableId/invoice` | POST | Generate invoice from completed deliverable |
| `/project/:projectId` | GET | List milestones with billing status |
| `/health` | GET | Health check |

---

## 8. Subscriptions

**Base path**: `/api/subscriptions`
**Auth**: None (recommended to add)
**Source**: `src/backend/api/subscriptions/index.js`
**Story**: I-02, I-03

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | List subscriptions with next billing date. Query: `status`, `owner_company` |
| `/` | POST | Create subscription. Body: `name`, `amount`, `billing_cycle` (required) |
| `/:id` | PUT | Update subscription |
| `/:id/cancel` | POST | Cancel subscription |
| `/due-today` | GET | Subscriptions due for billing today |
| `/health` | GET | Health check |

Billing CRON runs automatically (I-03).

---

## 9. Credits

**Base path**: `/api/credits`
**Auth**: None (recommended to add)
**Source**: `src/backend/api/credits/index.js`
**Story**: I-04

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | POST | Create credit note. Body: `invoice_id` (required), `amount`, `reason` (required), `type` (`full`/`partial`) |
| `/:id/apply` | POST | Apply credit to target invoice. Body: `target_invoice_id` (required) |
| `/` | GET | List credits. Query: `status`, `owner_company` |
| `/health` | GET | Health check |

---

## 10. Supplier Invoices

**Base path**: `/api/supplier-invoices`
**Auth**: None (recommended to add)
**Source**: `src/backend/api/supplier-invoices/index.js`
**Stories**: I-05, I-06

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/pending` | GET | Pending invoices queue with deviation analysis. Query: `owner_company` |
| `/pending/count` | GET | Badge notification count. Query: `owner_company` |
| `/:id/deviation` | GET | Deviation analysis (quote vs invoice) |
| `/:id/approve` | POST | Approve invoice (blocks if deviation > 5%). Body: `approved_by`, `notes`, `force` |
| `/:id/reject` | POST | Reject invoice. Body: `reason` (required) |
| `/health` | GET | Health check |

---

## 11. Time Tracking

**Base path**: `/api/time-tracking`
**Auth**: None (recommended to add)
**Source**: `src/backend/api/time-tracking/index.js`
**Story**: 7.9 / I-07

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/entries` | GET | List entries. Query: `project_id`, `contact_id`, `month` (YYYY-MM), `invoiced`, `owner_company` |
| `/entries` | POST | Create entry. Body: `project_id`, `date`, `hours`, `hourly_rate` (required) |
| `/entries/:id` | PATCH | Update entry (blocked if invoiced) |
| `/entries/:id` | DELETE | Delete entry (blocked if invoiced) |
| `/reports` | GET | Monthly report by project/contact. Query: `month`, `owner_company` |
| `/generate-invoice` | POST | Generate regie invoice from uninvoiced entries. Body: `project_id`, `month`, `owner_company` (required) |
| `/export` | GET | CSV export (Swiss format, semicolon separator). Query: `project_id`, `month`, `owner_company` |
| `/health` | GET | Health check |

---

## 12. Support

**Base path**: `/api/support`
**Auth**: None (recommended to add)
**Source**: `src/backend/api/support/index.js`
**Story**: I-08

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/tickets` | GET | List tickets. Query: `status`, `owner_company`, `billable` |
| `/tickets` | POST | Create ticket. Body: `subject` (required), `description`, `priority`, `project_id`, `contact_id`, `subscription_id`, `billable`, `owner_company` |
| `/tickets/:id` | PUT | Update ticket |
| `/tickets/:id/close` | POST | Close ticket + auto-bill if applicable |
| `/tickets/:id/bill` | POST | Manual billing. Body: `hourly_rate`, `hours_spent` |
| `/tickets/stats` | GET | Ticket statistics |
| `/health` | GET | Health check |

Auto-billing: If ticket is `billable`, not covered by subscription, and `hours_spent > 0`, closing generates an invoice at CHF 150/h default rate.

---

## 13. Lead Capture

**Base path**: `/api/leads`
**Auth**: None (webhook endpoints are public)
**Source**: `src/backend/api/leads/index.js`
**Stories**: F-01 to F-04

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/wp-webhook` | POST | WordPress Fluent Form webhook (F-01) |
| `/whatsapp-webhook` | GET | WhatsApp verification challenge (F-02) |
| `/whatsapp-webhook` | POST | WhatsApp incoming message (F-02) |
| `/whatsapp-messages` | GET | WhatsApp messages list |
| `/imap-scan` | POST | Manual IMAP scan trigger (F-03) |
| `/ringover-scan` | POST | Manual Ringover scan trigger (F-04) |
| `/health` | GET | Health check with channel status |

---

## 14. Email Automation

**Base path**: `/api/email`
**Auth**: None (internal use by workflows)
**Source**: `src/backend/api/email/index.js`
**Stories**: E-01 to E-06

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/lead-confirmation` | POST | Send lead confirmation email (E-01) |
| `/quote-sent` | POST | Send quote email (E-02) |
| `/payment-confirmed` | POST | Send payment confirmation (E-03) |
| `/invoice-reminders` | POST | Send invoice reminders batch (E-04) |
| `/supplier-invoice-approved` | POST | Notify supplier invoice approved (E-05) |
| `/provider-reminder` | POST | Send provider reminder (E-06) |
| `/health` | GET | Health check |

All emails are sent via Mautic.

---

## 15. Workflows

**Base path**: `/api/workflows`
**Auth**: None (recommended to add)
**Source**: `src/backend/api/workflows/index.js`
**Stories**: 7.3 to 7.7

### Sub-routers

| Path | Story | Description |
|------|-------|-------------|
| `/lead-qualification/*` | 7.3 | AI lead qualification |
| `/quote-signed/*` | 7.4 | DocuSeal signed -> deposit invoice |
| `/payment/*` | 7.5 | Revolut payment -> project activation |
| `/monthly-report/*` | 7.7 | Monthly report with AI summary |

### Top-level

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Workflow engine health |
| `/executions` | GET | Recent workflow executions. Query: `limit` (max 200), `workflow`, `status` |

---

## 16. Notifications

**Base path**: `/api/notifications`
**Auth**: None (recommended to add)
**Source**: `src/backend/api/notifications/index.js`
**Story**: 7.8

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | List notifications. Query: `type`, `read` (`true`/`false`), `limit`, `offset` |
| `/:id/read` | PATCH | Mark notification as read |
| `/mark-all-read` | POST | Mark all unread as read |
| `/unread-count` | GET | Count of unread notifications |
| `/stream` | GET | **SSE** real-time notification stream (polls every 10s) |
| `/` | POST | Create notification (internal). Body: `title` (required), `type`, `body`, `metadata`, `recipient`, `priority` |
| `/health` | GET | Health check with SSE client count |

SSE stream format:
```
data: {"type":"notification","notification":{...}}
data: {"type":"connected","timestamp":"..."}
: heartbeat 2026-02-21T...
```

---

## 17. Integrations

**Base path**: `/api/integrations`
**Auth**: JWT (authMiddleware)
**Source**: `src/backend/api/integrations/index.js`

### DocuSeal

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/docuseal/signature/quote/:quoteId` | POST | Create signature for quote |
| `/docuseal/signature/cgv/:acceptanceId` | POST | Create signature for CGV |
| `/docuseal/signature/:submissionId/status` | GET | Signature status |
| `/docuseal/signature/:submissionId/embed` | GET | Embed URL |
| `/docuseal/signature/:submissionId/cancel` | POST | Cancel signature |
| `/docuseal/signature/:submissionId/remind` | POST | Send reminder |
| `/docuseal/webhook` | POST | DocuSeal webhook |

### Invoice Ninja (Orchestrated)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/invoice-ninja/sync/:invoiceId` | POST | Sync invoice |
| `/invoice-ninja/deposit/:quoteId` | POST | Create deposit |
| `/invoice-ninja/pdf/:invoiceId` | GET | Get invoice PDF |
| `/invoice-ninja/email/:invoiceId` | POST | Email invoice |
| `/invoice-ninja/invoices` | GET | List invoices |
| `/invoice-ninja/webhook` | POST | Invoice Ninja webhook |

### Mautic (Orchestrated)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/mautic/sync/contact` | POST | Sync contact to Mautic |
| `/mautic/sync/lead/:leadId` | POST | Sync lead |
| `/mautic/trigger/quote-sent/:quoteId` | POST | Trigger quote sent campaign |
| `/mautic/trigger/quote-followup/:quoteId` | POST | Trigger followup campaign |
| `/mautic/trigger/payment-reminder/:invoiceId` | POST | Trigger payment reminder |
| `/mautic/trigger/welcome/:contactId` | POST | Trigger welcome campaign |
| `/mautic/campaign/:campaignId/stats` | GET | Campaign stats |
| `/mautic/segment/:segmentId/stats` | GET | Segment stats |
| `/mautic/dashboard` | GET | Mautic dashboard data |

### Orchestration (Multi-service)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/orchestrate/quote-sent/:quoteId` | POST | Orchestrate: Quote sent (DocuSeal + Mautic + IN) |
| `/orchestrate/quote-signed/:quoteId` | POST | Orchestrate: Quote signed (deposit + project) |
| `/orchestrate/payment-received/:invoiceId` | POST | Orchestrate: Payment received (activate project) |
| `/orchestrate/lead-created/:leadId` | POST | Orchestrate: New lead (Mautic + qualification) |

### GET /api/integrations/health

All integrations health check.

---

## 18. Invoice Ninja (Direct)

**Base path**: `/api/invoice-ninja`
**Auth**: None (uses IN API token internally)
**Source**: `src/backend/api/invoice-ninja/index.js`

### Clients

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/clients` | GET | List clients |
| `/clients/:id` | GET | Client detail |
| `/clients` | POST | Create client |
| `/clients/:id` | PUT | Update client |
| `/clients/:id` | DELETE | Delete client |

### Invoices

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/invoices` | GET | List invoices |
| `/invoices/:id` | GET | Invoice detail |
| `/invoices` | POST | Create invoice |
| `/invoices/:id` | PUT | Update invoice |
| `/invoices/:id/send` | POST | Send invoice |
| `/invoices/:id/mark-paid` | POST | Mark as paid |
| `/invoices/:id/pdf` | GET | Download PDF |

### Payments

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/payments` | GET | List payments |
| `/payments` | POST | Create payment |

### Products

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/products` | GET | List products |
| `/products` | POST | Create product |

### Quotes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/quotes` | GET | List quotes |
| `/quotes` | POST | Create quote |
| `/quotes/:id/convert` | POST | Convert quote to invoice |

### Sync

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/sync/contact` | POST | Sync Directus contact to IN |
| `/sync/invoice` | POST | Sync Directus invoice to IN |
| `/sync/bulk` | POST | Bulk sync |

### Other

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/webhook` | POST | IN webhook handler |
| `/dashboard` | GET | IN dashboard data |
| `/health` | GET | Health check |
| `/test` | GET | Connection test |

---

## 19. Revolut

**Base path**: `/api/revolut`
**Auth**: None (uses Revolut OAuth2 internally)
**Source**: `integrations/revolut/index.js`

### Token Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/token-status` | GET | Token diagnostic. Query: `company` |
| `/token-status/all` | GET | All company token statuses |
| `/refresh` | POST | Force token refresh. Body: `company` |
| `/token` | POST | Store new token (after OAuth2). Body: `access_token`, `refresh_token`, `expires_in`, `company` |

### Accounts

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/balance` | GET | Treasury balance (main widget endpoint). Query: `company`. Falls back to Directus if token expired |
| `/accounts` | GET | List accounts. Falls back to Directus |
| `/accounts/:id` | GET | Account detail |
| `/accounts/:id/bank-details` | GET | Account bank details (IBAN, etc.) |

### Transactions

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/transactions` | GET | List transactions. Query: `from`, `to`, `count`, `type`. Falls back to Directus |
| `/transactions/:id` | GET | Transaction detail |

### Payments

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/payments` | POST | Create payment |
| `/payments/schedule` | POST | Schedule payment |

### Counterparties

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/counterparties` | GET | List counterparties |
| `/counterparties` | POST | Create counterparty |
| `/counterparties/:id` | DELETE | Delete counterparty |

### Exchange Rates

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/exchange-rate` | GET | Get exchange rate. Query: `from`, `to`, `amount` |
| `/exchange` | POST | Execute currency exchange |

### Dashboard and Webhooks

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/dashboard` | GET | Revolut dashboard data |
| `/webhooks` | GET | List webhooks |
| `/webhooks` | POST | Create webhook. Body: `url`, `events` |
| `/webhooks/:id` | DELETE | Delete webhook |

### Phase G -- Reconciliation

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/webhook-receiver/*` | POST | Revolut webhook receiver (raw body for HMAC) |
| `/sync-transactions` | POST | Manual sync. Body: `hours` (default 24) |
| `/sync` | POST | Sync for TreasuryWidget. Body: `hours` |
| `/reconcile` | POST | Manual reconciliation. Body: `transaction_id`, `invoice_id` |
| `/check-alerts` | POST | Check unmatched transaction alerts |

### Other

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check with token status and Phase G status |
| `/test` | GET | Connection test |

---

## 20. ERPNext

**Base path**: `/api/erpnext`
**Auth**: None (uses ERPNext API keys internally)
**Source**: `src/backend/api/erpnext/index.js`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/kpis` | GET | KPIs dashboard |
| `/chart/revenue` | GET | Revenue chart data |
| `/chart/company-breakdown` | GET | Company breakdown chart |
| `/activities` | GET | Recent activities |
| `/sync` | POST | Trigger sync |
| `/migrate` | POST | Migration from Directus |
| `/test` | GET | Connection test |
| `/health` | GET | Health check |

---

## 21. Mautic (Direct)

**Base path**: `/api/mautic`
**Auth**: None (uses Mautic credentials internally)
**Source**: `src/backend/api/mautic/router.js`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/sync-contact` | POST | Sync contact to Mautic |
| `/add-to-campaign` | POST | Add contact to campaign |
| `/bulk-import` | POST | Bulk import from Directus |
| `/stats` | GET | Mautic statistics |
| `/campaigns` | GET | Active campaigns |
| `/webhook` | POST | Mautic webhook handler |
| `/test` | GET | Connection test |
| `/health` | GET | Health check |

---

## 22. Reports

**Base path**: `/api/reports`
**Auth**: Flexible (JWT or API Key)
**Source**: `src/backend/api/reports/ceo-report.routes.js`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ceo-daily` | GET | Generate CEO daily report. Query: `company` (optional UUID) |
| `/health` | GET | Health check |

---

## 23. Health Check

**Base path**: `/health` and `/api/health`
**Auth**: None (public)
**Source**: `src/backend/api/health/health.routes.js`

### GET /health

Returns overall system health with per-service status.

**Response** (200 or 503):
```json
{
  "status": "ok",
  "timestamp": "2026-02-21T10:00:00.000Z",
  "version": "2.1.0",
  "uptime_seconds": 86400,
  "services": {
    "directus": { "status": "ok", "latency_ms": 45 },
    "redis": { "status": "ok", "latency_ms": 3 },
    "database": { "status": "ok", "latency_ms": 120 }
  }
}
```

Status codes: `200` (ok/degraded), `503` (down -- both Directus and DB are down).

---

## 24. OCR (Legacy)

**Base path**: `/api/ocr`
**Auth**: None
**Source**: `src/backend/server.js` (inline)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ocr/scan-invoice` | POST | Scan invoice via OpenAI Vision. Body: `image` (base64) |
| `/api/ocr/status` | GET | OCR service status |

> Note: The Finance module at `/api/finance/ocr/*` provides a more comprehensive OCR pipeline.

---

## 25. Directus Proxy

**Base path**: `/api/directus`
**Auth**: Uses admin token internally
**Source**: `src/backend/server.js` (inline)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/directus/items/:collection` | GET | Proxy to Directus items API |

Additionally, these paths are proxied directly to Directus (port 8055):
- `/admin/*` -- Directus admin panel
- `/items/*` -- Directus items API
- `/auth/*` -- Directus authentication
- `/graphql/*` -- Directus GraphQL

---

## Common Response Format

All custom API endpoints follow this response format:

### Success
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error
```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "MACHINE_CODE",
  "details": "Optional technical details"
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error / Bad request |
| 401 | Authentication required |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |
| 409 | Conflict (e.g., duplicate) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
| 502 | Bad gateway (external service error) |
| 503 | Service unavailable |

---

## Company Codes

All multi-company endpoints accept one of these company codes:

| Code | Company | Domain |
|------|---------|--------|
| `HYPERVISUAL` | Hypervisual Agency Sarl | Digital signage / LED / Holograms |
| `DAINAMICS` | Dainamics Sarl | Technology / SaaS |
| `LEXAIA` | Lexaia Sarl | Legal services |
| `ENKI_REALTY` | Enki Realty SA | Real estate |
| `TAKEOUT` | TakeOut Factory Sarl | Food tech |

---

## Swiss Compliance Notes

- **TVA rates**: 8.1% (normal), 2.6% (reduced), 3.8% (accommodation) -- never hardcoded
- **Currency**: CHF primary, EUR/USD supported
- **QR-Invoice**: SIX Group IG v2.3 compliant
- **Interest calculation**: Swiss CO Art. 104 (default 5% p.a.)
- **LP/Poursuites**: SchKG/LP integration for debt collection
- **Audit logging**: CO Art. 958f compliant via `automation_logs` collection
