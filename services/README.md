# 📁 Services

Ce dossier contient tous les services autonomes de la plateforme.

## Structure

```
services/
├── ocr/          # Service OCR complet avec scripts et documentation
├── notion/       # Proxy Notion pour l'intégration
└── [autres services futurs...]
```

## Services disponibles

### OCR Service
- **Localisation** : `/services/ocr/`
- **Description** : Service complet d'OCR avec support Notion
- **Documentation** : Voir `/services/ocr/README-OCR.md`

### Notion Proxy
- **Localisation** : `/services/notion/`
- **Description** : Proxy pour l'intégration avec Notion API
- **Script principal** : `notion_proxy.py`
