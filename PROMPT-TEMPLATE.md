# TEMPLATE PROMPT — À coller au début de CHAQUE prompt Claude Code

> **Instructions architecte** : Copier le bloc ci-dessous au début de chaque prompt donné à Claude Code.  
> Remplacer les `[PLACEHOLDERS]` avant d'envoyer.  
> Ce template garantit que Claude Code consulte les skills et déclare ses choix.

---

## TEMPLATE (à copier-coller)

```
## 🔴 ÉTAPE 0 — OBLIGATOIRE AVANT TOUT CODE

Lire dans cet ordre AVANT d'écrire la première ligne de code :

1. SKILLS-QUICK-INDEX.md (repo racine) → identifier les skills pertinents
2. Les SKILL.md des skills choisis (minimum 2)
3. Vérifier les champs Directus via MCP : directus:get_collection_items([COLLECTION], limit=1)
4. Lire ROADMAP.md pour confirmer le statut de la story

Ta PREMIÈRE réponse doit OBLIGATOIREMENT commencer par ce bloc :

---
## 🎯 SKILLS SÉLECTIONNÉS
- **Story** : [X.X — Nom de la story]
- **Skills lus** :
  1. [nom-skill] → [chemin exact]
  2. [nom-skill] → [chemin exact]
  3. [nom-skill optionnel] → [chemin exact]
- **MCP utilisés** : [Directus MCP / PostgreSQL MCP / Context7 / ...]
- **Collections vérifiées** : [nom_collection → champs confirmés]
- **Décision design** : [Résumé de l'approche UI choisie, si applicable]
---

Si tu ne peux pas lire un fichier → STOP et signale l'erreur. Ne jamais deviner.

---

## 📋 TÂCHE : [NOM DE LA STORY]

### Contexte
[Décrire ce qui existe déjà, ce qui fonctionne, ce qui est cassé]

### Objectif
[Ce que doit faire ce code exactement]

### Spécifications techniques
- Collections Directus : [lister les collections concernées]
- Composants React : [lister les composants à créer/modifier]
- Fichiers à modifier : [lister les fichiers]
- Design System : Apple Premium Monochromatic — src/styles/design-system.css

### Critères de validation
- [ ] [Critère 1]
- [ ] [Critère 2]
- [ ] [Critère 3]

## 📋 ÉTAPE FINALE — OBLIGATOIRE APRÈS TOUT CODE

Mettre à jour ROADMAP.md :
- Passer la story [Story-ID] de [ ] → [V] avec date YYYY-MM-DD
- Logger toute découverte inattendue dans la section DÉCOUVERTES
- Commit : `feat(phase-X): story X.X — description courte`
```

---

## EXEMPLE REMPLI (Phase 1, Story 1.1)

```
## 🔴 ÉTAPE 0 — OBLIGATOIRE AVANT TOUT CODE

Lire dans cet ordre AVANT d'écrire la première ligne de code :

1. SKILLS-QUICK-INDEX.md (repo racine) → identifier les skills pertinents
2. Les SKILL.md des skills choisis (minimum 2)
3. Vérifier les champs Directus via MCP si applicable
4. Lire ROADMAP.md pour confirmer le statut de la story

Ta PREMIÈRE réponse doit OBLIGATOIREMENT commencer par le BLOC DE DÉCLARATION.

---

## 📋 TÂCHE : Phase 1 — Story 1.1 — Design System CSS

### Contexte
Le projet passe de l'ancien glassmorphism vers Apple Premium Monochromatic.
Aucun fichier design-system.css n'existe encore.
Le frontend est dans src/frontend/src/styles/.

### Objectif
Créer src/frontend/src/styles/design-system.css avec tous les tokens CSS
conformes au CDC §14 (Section 14 du Cahier des Charges v1.3).

### Spécifications techniques
- Fichier à créer : src/frontend/src/styles/design-system.css
- Tokens requis : couleurs (#F5F5F7, #1D1D1F, #0071E3...), typography, spacing, shadows, border-radius
- Référence : CDC_v1.3.md Section 14
- Design System : Apple Premium Monochromatic — ZERO glassmorphism, ZERO gradients décoratifs

### Critères de validation
- [ ] Toutes les variables CSS de la Section 14 CDC implémentées
- [ ] Importé dans src/frontend/src/styles/index.css ou App.jsx
- [ ] Aucune couleur décorative (uniquement zinc/slate/white + sémantiques pour statuts)
- [ ] Commentaires en français

## 📋 ÉTAPE FINALE
Mettre à jour ROADMAP.md : passer story 1.1 de [ ] → [V] avec date du jour.
Commit : `feat(phase-1): story 1.1 — design-system.css tokens Apple Premium`
```

---

## RÈGLES DE L'ARCHITECTE

1. **Toujours inclure l'ÉTAPE 0** dans chaque prompt — sans exception
2. **Toujours spécifier la story** par son numéro exact (ex: 1.1, 2.3, 7.4)
3. **Toujours lister les collections Directus** concernées — Claude Code doit les vérifier via MCP
4. **Si Claude Code répond sans le BLOC DE DÉCLARATION** → Lui redemander : "Tu n'as pas produit le BLOC DE DÉCLARATION. Recommence depuis le début."
5. **Jamais accepter un prompt partiel** sans ÉTAPE 0 — c'est la garantie qualité
