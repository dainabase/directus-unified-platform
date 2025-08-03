#!/bin/bash

# Remplacez YOUR_API_KEY par votre clé API
API_KEY="YOUR_API_KEY_HERE"

echo "Testing Twenty CRM API with API Key..."

# Test simple pour récupérer les companies
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "query": "{ companies(first: 5) { edges { node { id name domainName { primaryLinkUrl primaryLinkLabel } createdAt } } } }"
  }' | jq

echo -e "\n\nTesting REST API..."

# Test REST API
curl -X GET "http://localhost:3000/rest/companies?limit=5" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Accept: application/json" | jq