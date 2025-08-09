#!/bin/bash

# Script de démarrage de tous les services
# Directus Unified Platform

echo "🚀 DÉMARRAGE DE TOUS LES SERVICES"
echo "=================================="
echo ""

# Couleurs pour l'output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction de vérification
check_service() {
  local name=$1
  local url=$2
  local port=$3
  
  if curl -s -o /dev/null -w "%{http_code}" $url | grep -q "200\|302"; then
    echo -e "${GREEN}✅ $name${NC} : $url"
  else
    echo -e "${YELLOW}⏳ $name${NC} : Démarrage sur port $port..."
  fi
}

# 1. Directus
echo "1️⃣ Directus CMS"
docker-compose up -d
check_service "Directus" "http://localhost:8055" "8055"

# 2. Invoice Ninja
echo -e "\n2️⃣ Invoice Ninja"
cd integrations/invoice-ninja
docker-compose up -d
sleep 5
check_service "Invoice Ninja" "http://localhost:8090" "8090"

# 3. Mautic
echo -e "\n3️⃣ Mautic Marketing"
cd ../mautic
docker-compose up -d
sleep 5
check_service "Mautic" "http://localhost:8084" "8084"

# 4. ERPNext (si disponible)
echo -e "\n4️⃣ ERPNext ERP"
cd ../erpnext
if [ -f "docker-compose-fixed.yml" ]; then
  docker-compose -f docker-compose-fixed.yml up -d
  sleep 10
  check_service "ERPNext" "http://localhost:8083" "8083"
else
  echo -e "${YELLOW}⚠️ ERPNext non configuré${NC}"
fi

# 5. Revolut Webhooks
echo -e "\n5️⃣ Revolut API"
cd ../revolut
if [ -f "package.json" ]; then
  # Démarrer en arrière-plan avec PM2 si disponible
  if command -v pm2 &> /dev/null; then
    pm2 start npm --name "revolut-webhooks" -- run webhooks
    echo -e "${GREEN}✅ Revolut Webhooks${NC} : Port 3002 (PM2)"
  else
    nohup npm run webhooks > revolut.log 2>&1 &
    echo -e "${GREEN}✅ Revolut Webhooks${NC} : Port 3002 (nohup)"
  fi
else
  echo -e "${YELLOW}⚠️ Revolut non configuré${NC}"
fi

# Retour au dossier racine
cd ../..

# Résumé final
echo ""
echo "📊 TABLEAU DE BORD DES SERVICES"
echo "================================"
echo -e "${GREEN}Directus CMS${NC}      : http://localhost:8055"
echo -e "${GREEN}Invoice Ninja${NC}     : http://localhost:8090"
echo -e "${GREEN}Mautic Marketing${NC}  : http://localhost:8084"
echo -e "${GREEN}ERPNext ERP${NC}       : http://localhost:8083"
echo -e "${GREEN}Revolut Webhooks${NC}  : Port 3002"
echo -e "${GREEN}Frontend React${NC}    : http://localhost:5173"
echo ""
echo "📝 Credentials par défaut :"
echo "- Directus : admin@example.com / password"
echo "- Invoice : admin@example.com / password"
echo "- Mautic  : admin / Admin@Mautic2025"
echo "- ERPNext : Administrator / Admin@ERPNext2025"
echo ""
echo "🎉 Tous les services sont démarrés !"