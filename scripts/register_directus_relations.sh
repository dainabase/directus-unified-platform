#!/bin/bash

# Register Directus Relations Script
# Enregistre toutes les nouvelles relations FK dans Directus
# Date: 2024-12-13

TOKEN="dashboard-api-token-2025"
BASE_URL="http://localhost:8055"

echo "🔄 Enregistrement des relations Finance dans Directus..."

# 1. bank_accounts → owner_companies
echo "📦 bank_accounts → owner_companies"
curl -s -X POST "$BASE_URL/relations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "bank_accounts",
    "field": "owner_company_id",
    "related_collection": "owner_companies",
    "meta": {
      "many_collection": "bank_accounts",
      "many_field": "owner_company_id",
      "one_collection": "owner_companies",
      "one_field": "bank_accounts",
      "one_deselect_action": "nullify"
    }
  }' | jq '.'

# 2. client_invoices → owner_companies
echo "📄 client_invoices → owner_companies"
curl -s -X POST "$BASE_URL/relations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "client_invoices",
    "field": "owner_company_id",
    "related_collection": "owner_companies",
    "meta": {
      "many_collection": "client_invoices",
      "many_field": "owner_company_id",
      "one_collection": "owner_companies",
      "one_field": "client_invoices",
      "one_deselect_action": "nullify"
    }
  }' | jq '.'

# 3. supplier_invoices → owner_companies
echo "📋 supplier_invoices → owner_companies"
curl -s -X POST "$BASE_URL/relations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "supplier_invoices",
    "field": "owner_company_id",
    "related_collection": "owner_companies",
    "meta": {
      "many_collection": "supplier_invoices",
      "many_field": "owner_company_id",
      "one_collection": "owner_companies",
      "one_field": "supplier_invoices",
      "one_deselect_action": "nullify"
    }
  }' | jq '.'

# 4. payments → owner_companies
echo "💳 payments → owner_companies"
curl -s -X POST "$BASE_URL/relations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "payments",
    "field": "owner_company_id",
    "related_collection": "owner_companies",
    "meta": {
      "many_collection": "payments",
      "many_field": "owner_company_id",
      "one_collection": "owner_companies",
      "one_field": "payments",
      "one_deselect_action": "nullify"
    }
  }' | jq '.'

# 5. bank_transactions → owner_companies
echo "🏦 bank_transactions → owner_companies"
curl -s -X POST "$BASE_URL/relations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "bank_transactions",
    "field": "owner_company_id",
    "related_collection": "owner_companies",
    "meta": {
      "many_collection": "bank_transactions",
      "many_field": "owner_company_id",
      "one_collection": "owner_companies",
      "one_field": "bank_transactions",
      "one_deselect_action": "nullify"
    }
  }' | jq '.'

# 6. expenses → owner_companies
echo "💰 expenses → owner_companies"
curl -s -X POST "$BASE_URL/relations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "expenses",
    "field": "owner_company_id",
    "related_collection": "owner_companies",
    "meta": {
      "many_collection": "expenses",
      "many_field": "owner_company_id",
      "one_collection": "owner_companies",
      "one_field": "expenses",
      "one_deselect_action": "nullify"
    }
  }' | jq '.'

# 7. payments → bank_transactions
echo "💳 payments → bank_transactions"
curl -s -X POST "$BASE_URL/relations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "payments",
    "field": "bank_transaction_id",
    "related_collection": "bank_transactions",
    "meta": {
      "many_collection": "payments",
      "many_field": "bank_transaction_id",
      "one_collection": "bank_transactions",
      "one_field": "payments",
      "one_deselect_action": "nullify"
    }
  }' | jq '.'

# 8. bank_transactions → supplier_invoices
echo "🏦 bank_transactions → supplier_invoices"
curl -s -X POST "$BASE_URL/relations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "bank_transactions",
    "field": "supplier_invoice_id",
    "related_collection": "supplier_invoices",
    "meta": {
      "many_collection": "bank_transactions",
      "many_field": "supplier_invoice_id",
      "one_collection": "supplier_invoices",
      "one_field": "bank_transactions",
      "one_deselect_action": "nullify"
    }
  }' | jq '.'

# 9. expenses → supplier_invoices
echo "💰 expenses → supplier_invoices"
curl -s -X POST "$BASE_URL/relations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "expenses",
    "field": "supplier_invoice_id",
    "related_collection": "supplier_invoices",
    "meta": {
      "many_collection": "expenses",
      "many_field": "supplier_invoice_id",
      "one_collection": "supplier_invoices",
      "one_field": "expenses",
      "one_deselect_action": "nullify"
    }
  }' | jq '.'

# 10. expenses → bank_transactions
echo "💰 expenses → bank_transactions"
curl -s -X POST "$BASE_URL/relations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "expenses",
    "field": "bank_transaction_id",
    "related_collection": "bank_transactions",
    "meta": {
      "many_collection": "expenses",
      "many_field": "bank_transaction_id",
      "one_collection": "bank_transactions",
      "one_field": "expenses",
      "one_deselect_action": "nullify"
    }
  }' | jq '.'

echo "✅ Toutes les relations ont été enregistrées dans Directus!"
echo "🔍 Vérifiez dans l'interface Directus > Settings > Data Model"