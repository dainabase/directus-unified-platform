# Directus Unified Platform

## 🚀 Installation rapide

### 1. Cloner le repository
```bash
git clone https://github.com/dainabase/directus-unified-platform.git
cd directus-unified-platform
```

### 2. Configurer l'environnement
```bash
cp .env.example .env
# Éditer .env avec vos valeurs
```

### 3. Lancer Directus
```bash
docker compose up -d
```

### 4. Accéder à Directus
- URL: http://localhost:8055
- Email: (celui dans .env)
- Password: (celui dans .env)

## 📁 Structure du projet

```
.
├── docker-compose.yml     # Configuration Docker
├── .env                   # Variables d'environnement
├── migration/             # Scripts de migration Notion
├── dashboard/             # Dashboard importé
└── directus/              # Configuration Directus
```

## 🔧 Commandes utiles

```bash
# Voir les logs
docker compose logs -f directus

# Arrêter les services
docker compose down

# Réinitialiser complètement
docker compose down -v
```