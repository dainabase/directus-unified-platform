#!/bin/bash

# Configuration
BACKUP_DIR="./backups"
RETENTION_DAYS=7
CONTAINER_NAME="hypervisual-redis"

# Créer le dossier de backup si nécessaire
mkdir -p $BACKUP_DIR

# Date pour le nom du fichier
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/redis_$DATE.rdb"

echo "🔄 Démarrage du backup Redis..."

# Déclencher le backup dans Redis
docker exec $CONTAINER_NAME redis-cli BGSAVE

# Attendre que le backup soit terminé
echo "⏳ Attente de la fin du backup..."
sleep 2

# Vérifier que le backup est terminé
while [ $(docker exec $CONTAINER_NAME redis-cli LASTSAVE | xargs -I {} date -d @{} +%s) -lt $(date -d "2 seconds ago" +%s) ]; do
  echo "⏳ Backup en cours..."
  sleep 1
done

# Copier le fichier dump
docker cp $CONTAINER_NAME:/data/dump.rdb $BACKUP_FILE

if [ -f "$BACKUP_FILE" ]; then
  # Compresser le backup
  gzip $BACKUP_FILE
  echo "✅ Backup créé: ${BACKUP_FILE}.gz"
  
  # Afficher la taille
  SIZE=$(ls -lh ${BACKUP_FILE}.gz | awk '{print $5}')
  echo "📦 Taille: $SIZE"
else
  echo "❌ Erreur: Impossible de créer le backup"
  exit 1
fi

# Nettoyer les anciens backups
echo "🗑️  Nettoyage des backups > $RETENTION_DAYS jours..."
find $BACKUP_DIR -name "redis_*.rdb.gz" -mtime +$RETENTION_DAYS -delete

# Lister les backups disponibles
echo -e "\n📁 Backups disponibles:"
ls -lh $BACKUP_DIR/redis_*.rdb.gz 2>/dev/null | tail -5

# Statistiques Redis
echo -e "\n📊 Statistiques Redis:"
docker exec $CONTAINER_NAME redis-cli INFO memory | grep -E "used_memory_human|used_memory_peak_human"
docker exec $CONTAINER_NAME redis-cli DBSIZE