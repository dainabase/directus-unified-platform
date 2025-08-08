# 🐳 MCP Docker Integration pour Directus Unified Platform

## 📋 Vue d'ensemble

Cette intégration MCP (Model Context Protocol) Docker permet de gérer l'infrastructure Docker de Directus Unified Platform directement depuis Claude Desktop. Vous pouvez contrôler les containers, voir les logs, gérer les volumes et exécuter des commandes Docker via l'interface conversationnelle de Claude.

## 🚀 Installation rapide

```bash
# Cloner le repo si ce n'est pas déjà fait
git clone https://github.com/dainabase/directus-unified-platform.git
cd directus-unified-platform

# Rendre le script exécutable
chmod +x scripts/install-mcp-docker.sh

# Lancer l'installation
./scripts/install-mcp-docker.sh
```

## 📦 Composants installés

### 1. **MCP Docker Server**
- **Image**: `ghcr.io/ckreiling/mcp-server-docker:latest`
- **Container**: `directus-mcp-docker`
- **Fonction**: Gestion complète des containers Docker
- **Capacités**:
  - Lister/créer/arrêter/supprimer des containers
  - Voir les logs en temps réel
  - Gérer les images Docker
  - Gérer les volumes et réseaux
  - Exécuter des commandes dans les containers

### 2. **MCP Registry** (Optionnel)
- **Image**: `docker/mcp-registry:latest`
- **Container**: `directus-mcp-registry`
- **Port**: 9090
- **Fonction**: Découverte et gestion des MCP servers
- **Interface Web**: http://localhost:9090

## 🔧 Configuration

### Structure des fichiers

```
directus-unified-platform/
├── docker-compose.yml          # Config principale Directus
├── docker-compose.mcp.yml      # Extension MCP Docker
├── mcp/
│   ├── claude_desktop_config.json  # Config Claude Desktop
│   ├── INSTALLATION_REPORT.md      # Rapport d'installation
│   ├── config/                     # Configurations additionnelles
│   ├── data/                       # Données MCP
│   └── logs/                       # Logs MCP
├── scripts/
│   ├── install-mcp-docker.sh       # Script d'installation
│   └── test-mcp.sh                 # Tests MCP
└── mcp-data/                       # Données partagées
```

### Variables d'environnement

Créer/modifier le fichier `.env` :

```bash
# MCP Configuration
MCP_LOG_LEVEL=info
MCP_MAX_CONTAINERS=30
MCP_MEMORY_LIMIT=2g
MCP_CPU_LIMIT=2

# Directus
DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=dashboard-token-2025
```

## 💬 Commandes disponibles dans Claude

Une fois configuré, vous pouvez utiliser ces commandes dans Claude Desktop :

### Gestion des containers

```
"Liste tous les containers Docker"
"Montre les logs du container Directus"
"Redémarre le container PostgreSQL"
"Arrête tous les containers"
"Supprime les containers arrêtés"
```

### Monitoring

```
"Affiche l'utilisation CPU et mémoire des containers"
"Montre l'espace disque utilisé par Docker"
"Liste les volumes Docker"
"Vérifie la santé du système Docker"
```

### Maintenance

```
"Crée un backup de la base de données"
"Nettoie les images Docker non utilisées"
"Met à jour l'image Directus"
"Exporte les logs des dernières 24h"
```

### Exemples concrets

```
"Redémarre Directus et montre-moi les logs de démarrage"
"Vérifie si tous les services sont actifs et leur consommation mémoire"
"Liste les 10 dernières erreurs dans les logs PostgreSQL"
"Crée un nouveau container Redis pour le cache"
```

## 🛠️ Commandes CLI utiles

### Vérification du statut

```bash
# Voir tous les services MCP
docker compose -f docker-compose.yml -f docker-compose.mcp.yml ps

# Logs du MCP Docker
docker logs -f directus-mcp-docker

# Statistiques en temps réel
docker stats directus-mcp-docker
```

### Gestion des services

```bash
# Redémarrer le MCP Docker
docker compose -f docker-compose.yml -f docker-compose.mcp.yml restart mcp-docker

# Arrêter le MCP (sans affecter Directus)
docker compose -f docker-compose.yml -f docker-compose.mcp.yml stop mcp-docker

# Mise à jour des images
docker compose -f docker-compose.yml -f docker-compose.mcp.yml pull
docker compose -f docker-compose.yml -f docker-compose.mcp.yml up -d
```

### Debug et troubleshooting

```bash
# Voir la configuration effective
docker compose -f docker-compose.yml -f docker-compose.mcp.yml config

# Inspecter le container MCP
docker inspect directus-mcp-docker

# Accéder au shell du container
docker exec -it directus-mcp-docker sh
```

## 🔒 Sécurité

### Mesures de sécurité implémentées

1. **Socket Docker en lecture seule** : `-v /var/run/docker.sock:/var/run/docker.sock:ro`
2. **Limites de ressources** : CPU (2 cores) et RAM (2GB) maximum
3. **Réseau isolé** : Network dédié `directus-network`
4. **Pas de mode privilégié** : Aucun container en mode `--privileged`
5. **Limite du nombre de containers** : Maximum 30 containers simultanés

### Recommandations

- Ne jamais exposer le port Docker API publiquement
- Utiliser des secrets Docker pour les credentials sensibles
- Auditer régulièrement les logs MCP
- Maintenir les images à jour

## 🐛 Troubleshooting

### MCP non visible dans Claude Desktop

1. **Vérifier la configuration** :
   ```bash
   cat ~/.config/claude/claude_desktop_config.json  # Linux
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json  # macOS
   ```

2. **Redémarrer Claude Desktop complètement** :
   - Quitter Claude Desktop (pas juste fermer la fenêtre)
   - Relancer l'application

3. **Vérifier que le container MCP est actif** :
   ```bash
   docker ps | grep mcp-docker
   ```

### Erreur "Permission denied"

```bash
# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Appliquer les changements (ou redémarrer)
newgrp docker
```

### Container MCP ne démarre pas

```bash
# Voir les logs d'erreur
docker compose -f docker-compose.yml -f docker-compose.mcp.yml logs mcp-docker

# Recréer le container
docker compose -f docker-compose.yml -f docker-compose.mcp.yml up -d --force-recreate mcp-docker
```

### Port 9090 déjà utilisé

Modifier le port dans `docker-compose.mcp.yml` :
```yaml
ports:
  - "9091:9090"  # Changer 9091 par un port libre
```

## 📊 Monitoring et métriques

### Dashboard de monitoring

Accéder au MCP Registry : http://localhost:9090

### Métriques disponibles

- **Containers** : Nombre, statut, utilisation ressources
- **Images** : Liste, taille, dernière utilisation
- **Volumes** : Espace utilisé, montages
- **Réseaux** : Connexions, isolation
- **Logs** : Streaming temps réel, filtrage

## 🔄 Mises à jour

### Mise à jour du MCP Docker

```bash
# Pull la dernière version
docker pull ghcr.io/ckreiling/mcp-server-docker:latest

# Redémarrer avec la nouvelle image
docker compose -f docker-compose.yml -f docker-compose.mcp.yml up -d mcp-docker
```

### Mise à jour de la configuration

1. Modifier `docker-compose.mcp.yml`
2. Appliquer les changements :
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.mcp.yml up -d
   ```

## 📚 Ressources

### Documentation officielle
- [MCP Protocol](https://modelcontextprotocol.io)
- [Docker MCP Server](https://github.com/ckreiling/mcp-server-docker)
- [Docker MCP Registry](https://github.com/docker/mcp-registry)
- [Directus Documentation](https://docs.directus.io)

### Support
- [Issues GitHub](https://github.com/dainabase/directus-unified-platform/issues)
- [Discord MCP Community](https://discord.gg/mcp)
- [Forum Directus](https://github.com/directus/directus/discussions)

## 📄 License

MIT License - Voir [LICENSE](../LICENSE) pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! Voir [CONTRIBUTING.md](../CONTRIBUTING.md) pour les guidelines.

---

**Maintenu par** : [DAINAMICS Team](https://dainamics.ch)  
**Version** : 1.0.0  
**Dernière mise à jour** : 8 janvier 2025
