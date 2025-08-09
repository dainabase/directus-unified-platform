#!/bin/bash

echo "🔍 TEST ERPNEXT STATUS"
echo "======================"
echo ""

# 1. Containers
echo "📦 Containers Docker:"
docker ps --format "table {{.Names}}\t{{.Status}}" | grep erpnext
echo ""

# 2. Ports
echo "🔌 Ports actifs:"
netstat -an | grep -E "8083|9000|8001" | grep LISTEN 2>/dev/null || lsof -i :8083 2>/dev/null || echo "Aucun port ERPNext détecté"
echo ""

# 3. Accès HTTP
echo "🌐 Test HTTP:"
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8083)
if [ "$response" = "200" ] || [ "$response" = "302" ]; then
    echo "✅ ERPNext accessible (HTTP $response)"
elif [ "$response" = "404" ]; then
    echo "⚠️ ERPNext répond mais aucun site configuré (HTTP $response)"
else
    echo "❌ ERPNext inaccessible (HTTP $response)"
fi
echo ""

# 4. Logs récents
echo "📜 Derniers logs:"
CONTAINER_NAME=$(docker ps | grep -E "erpnext" | awk '{print $NF}' | head -1)
if [ ! -z "$CONTAINER_NAME" ]; then
    docker logs $CONTAINER_NAME --tail 10 2>&1
else
    echo "Aucun container ERPNext actif"
fi
echo ""

echo "======================"
echo "✅ Test terminé"