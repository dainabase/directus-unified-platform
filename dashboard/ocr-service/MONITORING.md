# 📊 Guide de Monitoring OCR Service

## 🚀 Démarrage rapide

### 1. Lancer le stack de monitoring

```bash
# Démarrer OCR + Monitoring
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d

# Vérifier que tout est lancé
docker-compose ps
```

### 2. Accéder aux interfaces

- **Grafana** : http://localhost:3000 (admin/admin)
- **Prometheus** : http://localhost:9090
- **OCR Service** : http://localhost:3001/health

### 3. Test de charge

```bash
# Installer dépendances
npm install axios form-data canvas

# Lancer le test
node load-test.js
```

## 📈 Métriques clés

### Performance
- **Documents/minute** : Throughput actuel (cible: >30)
- **Temps de traitement** : p50, p95, p99 (cible: p95 < 2s)
- **Queue size** : Documents en attente (alerte si > 10)
- **Workers actifs** : Utilisation des ressources (optimal: 3-4/4)

### Qualité
- **Confiance moyenne** : Précision OCR (cible: >95%)
- **Cache hit rate** : Efficacité du cache (cible: >30%)
- **Taux d'erreur** : Échecs de traitement (cible: <2%)

### Infrastructure
- **CPU usage** : Utilisation processeur
- **Memory usage** : Consommation mémoire
- **Redis memory** : Mémoire cache Redis
- **Network I/O** : Bande passante réseau

## 🔔 Alertes recommandées

### Créer dans Grafana

1. **Alerte Performance**
```
WHEN avg(ocr_processing_duration_seconds) > 3 FOR 5m
THEN alert "OCR trop lent"
```

2. **Alerte Queue**
```
WHEN ocr_queue_size > 20 FOR 2m
THEN alert "Queue OCR saturée"
```

3. **Alerte Erreurs**
```
WHEN rate(ocr_documents_processed_total{status="error"}[5m]) > 0.1
THEN alert "Taux erreur OCR élevé"
```

4. **Alerte Confiance**
```
WHEN avg(ocr_confidence_score) < 80 FOR 10m
THEN alert "Confiance OCR faible"
```

## 📊 Dashboard personnalisé

### Import dashboard
1. Ouvrir Grafana : http://localhost:3000
2. Aller dans Dashboards > Import
3. Charger `/monitoring/grafana/dashboards/ocr-dashboard.json`

### Panels disponibles
- Documents/minute (gauge)
- Confiance moyenne (gauge)
- Queue size (stat)
- Workers actifs (stat)
- Temps de traitement (time series)
- Cache hit rate (time series)

## 🔍 Requêtes Prometheus utiles

### Throughput
```promql
# Documents par minute
sum(rate(ocr_documents_processed_total[5m])) * 60

# Par type de document
sum by (document_type) (rate(ocr_documents_processed_total[5m])) * 60
```

### Performance
```promql
# Temps moyen de traitement
rate(ocr_processing_duration_seconds_sum[5m]) / rate(ocr_processing_duration_seconds_count[5m])

# Percentiles
histogram_quantile(0.95, rate(ocr_processing_duration_seconds_bucket[5m]))
```

### Erreurs
```promql
# Taux d'erreur
rate(ocr_documents_processed_total{status="error"}[5m]) / rate(ocr_documents_processed_total[5m])

# Erreurs par heure
increase(ocr_documents_processed_total{status="error"}[1h])
```

### Cache
```promql
# Hit rate
rate(ocr_cache_hits_total[5m]) / (rate(ocr_cache_hits_total[5m]) + rate(ocr_cache_misses_total[5m]))

# Économies grâce au cache
increase(ocr_cache_hits_total[1h]) * 2  # secondes économisées
```

## 🛠️ Optimisations basées sur les métriques

### Si temps de traitement > 3s
1. Augmenter le nombre de workers
2. Optimiser la taille des images
3. Activer le preprocessing

### Si queue > 20 documents
1. Scaler horizontalement (plus d'instances)
2. Augmenter les workers
3. Optimiser le cache

### Si confiance < 90%
1. Améliorer la qualité des scans
2. Ajuster les paramètres Tesseract
3. Nettoyer les images avant OCR

### Si cache hit < 20%
1. Augmenter TTL cache
2. Identifier patterns de re-soumission
3. Implémenter cache warming

## 📱 Alerting

### Configuration email
```yaml
# grafana/grafana.ini
[smtp]
enabled = true
host = smtp.gmail.com:587
user = alerts@hypervisual.ch
password = ${SMTP_PASSWORD}
```

### Webhook Slack
```json
{
  "url": "https://hooks.slack.com/services/XXX/YYY/ZZZ",
  "username": "OCR Monitor",
  "icon_emoji": ":robot_face:"
}
```

## 🔄 Backup monitoring

### Script automatique
```bash
# Lancer backup Redis
./scripts/backup-redis.sh

# Ajouter au cron
0 2 * * * /path/to/ocr-service/scripts/backup-redis.sh
```

### Restauration
```bash
# Arrêter Redis
docker-compose stop redis

# Restaurer backup
gunzip -c backups/redis_20250725_020000.rdb.gz > dump.rdb
docker cp dump.rdb hypervisual-redis:/data/

# Redémarrer
docker-compose start redis
```

## 📈 Rapports

### Export métriques
```bash
# Export CSV dernières 24h
curl -G 'http://localhost:9090/api/v1/query_range' \
  --data-urlencode 'query=ocr_documents_processed_total' \
  --data-urlencode 'start=24h' \
  --data-urlencode 'end=now' \
  --data-urlencode 'step=1h' \
  > metrics.json
```

### Rapport hebdomadaire
- Documents traités : `sum(increase(ocr_documents_processed_total[7d]))`
- Temps moyen : `avg(ocr_processing_duration_seconds)`
- Taux succès : `1 - (errors/total)`
- Économies cache : `heures * coût/heure`

## 🚨 Troubleshooting

### Logs temps réel
```bash
# OCR Service
docker-compose logs -f ocr-service --tail=100

# Filtrer erreurs
docker-compose logs ocr-service | grep ERROR

# Redis
docker-compose exec redis redis-cli MONITOR
```

### Debug performance
```bash
# Profiler Node.js
docker-compose exec ocr-service node --inspect=0.0.0.0:9229 src/server.js

# Analyser mémoire
docker stats hypervisual-ocr
```

### Reset métriques
```bash
# Clear Prometheus data
docker-compose exec prometheus rm -rf /prometheus/*
docker-compose restart prometheus
```