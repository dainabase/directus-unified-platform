#\!/bin/bash
echo "🔍 Vérification absence de Twenty..."
echo "================================="

for url in "/" "/superadmin" "/client" "/prestataire" "/revendeur"; do
  response=$(curl -s http://localhost:3000$url)
  if echo "$response" | grep -i "twenty" > /dev/null; then
    echo "❌ Twenty détecté sur $url"
  else
    echo "✅ $url : OK (pas de Twenty)"
  fi
done

echo ""
echo "📊 Test des titres de pages :"
for url in "/" "/superadmin" "/client" "/prestataire" "/revendeur"; do
  title=$(curl -s http://localhost:3000$url | grep -o "<title>.*</title>" | sed 's/<[^>]*>//g')
  echo "  $url → $title"
done
