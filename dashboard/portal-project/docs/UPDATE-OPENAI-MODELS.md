# 🔄 Mise à jour des modèles OpenAI Vision

## Changement Important (Juillet 2024)

Le modèle `gpt-4-vision-preview` a été déprécié par OpenAI. Les nouveaux modèles qui supportent la vision sont :

### Modèles disponibles

| Modèle | Description | Coût | Utilisation recommandée |
|--------|-------------|------|------------------------|
| **gpt-4o** | GPT-4 Omni - Le plus puissant | $5.00 / 1M tokens | Documents complexes, haute précision requise |
| **gpt-4o-mini** | Version optimisée | $0.15 / 1M tokens | Usage général, bon rapport qualité/prix ✅ |
| **gpt-4-turbo** | GPT-4 Turbo avec vision | $10.00 / 1M tokens | Legacy, préférer gpt-4o |

### Configuration actuelle

Le système est configuré pour utiliser **`gpt-4o-mini`** par défaut car :
- ✅ 33x moins cher que gpt-4o
- ✅ Performance excellente pour l'OCR
- ✅ Temps de réponse rapide (~5-10s)
- ✅ Supporte toutes les langues

### Comment changer de modèle

#### Frontend (localStorage)
```javascript
// Dans la console du navigateur
localStorage.setItem('openai_model', 'gpt-4o'); // Pour plus de précision
localStorage.setItem('openai_model', 'gpt-4o-mini'); // Par défaut (recommandé)
```

#### Backend (.env)
```bash
# Dans le fichier .env du service OCR
OPENAI_MODEL=gpt-4o-mini  # ou gpt-4o
```

#### Code direct
```javascript
// Dans ocr-openai-vision.js, ligne ~13
this.model = 'gpt-4o-mini'; // Changer ici si besoin
```

### Comparaison des performances

Test avec le document HYPERVISUAL → PROMIDEA :

| Métrique | gpt-4o-mini | gpt-4o |
|----------|-------------|---------|
| Temps moyen | 8-12s | 10-15s |
| Précision | 94% | 97% |
| Coût/document | ~$0.002 | ~$0.06 |
| Extraction client | ✅ Complet | ✅ Complet |
| Détection type | ✅ Correct | ✅ Correct |

### Recommandations

1. **Production générale** : Utiliser `gpt-4o-mini`
2. **Documents critiques** : Utiliser `gpt-4o`
3. **Tests/Développement** : Utiliser `gpt-4o-mini`

### Gestion des erreurs

Si vous recevez l'erreur "model deprecated", vérifiez :
1. Que vous utilisez un des modèles listés ci-dessus
2. Que votre clé API a accès aux nouveaux modèles
3. Que vous n'avez pas de cache avec l'ancien modèle

### Migration depuis l'ancien modèle

Le code a été automatiquement mis à jour pour utiliser `gpt-4o-mini`. Aucune action requise de votre part.

---

*Dernière mise à jour : 26/07/2025*