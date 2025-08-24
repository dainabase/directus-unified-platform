#!/bin/bash

# Mode développement simple sans PM2
echo "🔧 Mode développement"

# Terminal 1: Backend
osascript -e 'tell app "Terminal" to do script "cd /Users/jean-mariedelaunay/directus-unified-platform && docker-compose up"'

# Terminal 2: Frontend
osascript -e 'tell app "Terminal" to do script "cd /Users/jean-mariedelaunay/directus-unified-platform/src/frontend && npm run dev"'

echo "✅ Serveurs de développement lancés"
echo "React: http://localhost:3000"
echo "Directus: http://localhost:8055"