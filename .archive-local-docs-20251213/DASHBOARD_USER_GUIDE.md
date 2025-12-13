# 👥 Guide d'Utilisation - Dashboard CEO

## 🎯 Vue d'ensemble

Le Dashboard CEO offre une vue consolidée de tous les aspects critiques de l'entreprise en temps réel. Conçu pour les dirigeants, il présente les informations essentielles pour la prise de décision stratégique.

## 🚀 Accès au Dashboard

### 1. Lancement de l'Application
```bash
cd src/frontend
npm run dev
```
L'application sera accessible sur **http://localhost:3000**

### 2. Navigation vers le Dashboard CEO
- **Sélecteur de Portail**: Cliquer sur "SuperAdmin" dans le header
- **Sélecteur d'Entreprise**: Choisir "Toutes les entreprises" ou une entreprise spécifique

## 📊 Structure du Dashboard

### Zone 1: Alertes Prioritaires (Haut)

#### 🚨 3 Actions Urgentes
- **Couleur**: Rouge (danger)  
- **Contenu**: Actions à effectuer aujourd'hui
- **Action**: Cliquer pour voir le détail des tâches

#### ⏰ 5 Deadlines Cette Semaine  
- **Couleur**: Orange (warning)
- **Contenu**: Échéances importantes avec projets critiques
- **Action**: Voir le planning détaillé

#### 💰 2 Alertes Financières
- **Couleur**: Bleu (info)
- **Contenu**: Factures impayées > 30 jours
- **Action**: Accéder au module factures

### Zone 2: Colonnes Opérationnelles

#### Colonne 1: 🔧 Opérationnel

**📋 Tâches & Actions**
- **Tâches totales actives**: 47
- **Cette semaine**: 14  
- **En retard**: 3 (badge rouge - attention requise)
- **À faire aujourd'hui**: 5

**TOP 3 PRIORITÉS**:
1. Valider devis LEXAIA
2. Call client ENKI  
3. Review code PR #234

**📁 Projets & Deliverables**
- **Projets actifs**: 8
- **En cours**: 5 (badge bleu)
- **En attente**: 3 (badge orange)
- **Livraisons cette semaine**: 2

**PROCHAINS JALONS**:
- Ven: Livraison App Mobile
- Lun: Demo client HYPERVISUAL

#### Colonne 2: 📈 Commercial & Marketing

**🎯 Pipeline Commercial**
- **Pipeline total**: €1.2M (valeur globale)
- **24 opportunités actives**
- **Devis actifs**: 7 - €340K
- **Taux conversion**: 32% ↑ (tendance positive)
- **Closing prévu ce mois**: €450K

**HOT LEADS** (prospects chauds):
- TechCorp - €125K - 80% (probabilité élevée)
- StartupXYZ - €85K - 60%

**📊 Marketing & Acquisition**
- **Visiteurs aujourd'hui**: 1,847
- **Leads cette semaine**: 124
- **Taux conversion**: 6.7%
- **CAC ce mois**: €320 (coût d'acquisition client)

**TOP SOURCES** (avec barres de progression):
- Google Ads: 45% (source principale)
- LinkedIn: 30%
- Direct: 25%

#### Colonne 3: 💰 Finance & Comptabilité

**💵 Trésorerie & Cash**
- **Cash disponible**: €847K (montant principal)
- **Entrées prévues (7j)**: +€127K (vert - positif)
- **Sorties prévues (7j)**: -€85K (rouge - attention)
- **Burn rate mensuel**: €115K
- **Runway**: 7.3 mois (badge vert - situation saine)

**Graphique CASH FLOW 7 JOURS**:
- **Vert**: Entrées d'argent
- **Rouge**: Sorties d'argent
- **Tendance**: Visualisation sur la semaine

**📄 Factures & Paiements**
- **Factures impayées**: 12 - €45K
  - **> 30 jours**: 3 - €18K (priorité - texte rouge)
- **À émettre cette semaine**: 8
- **Paiements en attente**: €127K

**ACTIONS REQUISES**:
- **Bouton "Relancer factures"**: Action immédiate
- **Bouton "Émettre factures"**: Création de nouvelles factures

### Zone 3: KPI Sidebar (Droite)

#### 📊 5 MÉTRIQUES CEO

Chaque KPI inclut:
- **Valeur actuelle** (grande)
- **Unité** (petite)
- **Tendance visuelle** (mini-graphique sur 7 jours)

**1. CASH RUNWAY**: 7.3m
- **Signification**: Durée avant épuisement des fonds
- **Tendance**: Ligne orange (stabilité)
- **Seuil critique**: < 6 mois

**2. ARR / MRR**: €2.4M  
- **Signification**: Revenus récurrents annuels/mensuels
- **Tendance**: Ligne verte (croissance)
- **Objectif**: Croissance constante

**3. EBITDA MARGIN**: 18.5%
- **Signification**: Rentabilité opérationnelle
- **Tendance**: Ligne bleue (amélioration)
- **Benchmark**: > 15% = bon

**4. LTV:CAC RATIO**: 4.2:1
- **Signification**: Valeur client / coût acquisition
- **Tendance**: Ligne violette (optimisation)
- **Seuil santé**: > 3:1

**5. NPS GLOBAL**: 72
- **Signification**: Satisfaction client (Net Promoter Score)  
- **Tendance**: Ligne verte foncé (progression)
- **Excellence**: > 70

## 🎯 Interprétation des Données

### Codes Couleurs
- **🟢 Vert**: Situation positive, objectifs atteints
- **🟠 Orange**: Attention requise, surveillance
- **🔴 Rouge**: Action immédiate nécessaire
- **🔵 Bleu**: Information, état normal

### Badges de Status
- **Danger (rouge)**: Urgence
- **Warning (orange)**: Attention  
- **Info (bleu)**: Information
- **Success (vert)**: Objectif atteint

### Interprétation des Tendances
- **📈 Flèche montante**: Amélioration
- **📉 Flèche descendante**: Dégradation
- **➡️ Flèche horizontale**: Stabilité

## 🔄 Actions Recommandées

### Alertes Rouges (Action Immédiate)
1. **3 tâches en retard** → Réprioriser les ressources
2. **Factures > 30 jours** → Relancer immédiatement
3. **Cash flow négatif** → Analyser les sorties

### Alertes Oranges (Surveillance)
1. **Deadlines cette semaine** → Vérifier les ressources
2. **3 projets en attente** → Débloquer les obstacles
3. **Burn rate élevé** → Optimiser les coûts

### Opportunités (Action Proactive)
1. **Hot leads à 80%** → Finaliser rapidement
2. **Taux conversion 32%** → Capitaliser sur la dynamique
3. **NPS à 72** → Leverager la satisfaction client

## 📱 Utilisation Mobile/Tablette

### Adaptation Responsive
- **Desktop**: 4 colonnes côte à côte
- **Tablette**: 2x2 colonnes empilées
- **Mobile**: 1 colonne, défilement vertical

### Navigation Mobile
- **Swipe horizontal**: Entre les sections
- **Tap**: Détail des métriques
- **Scroll**: Navigation verticale

## ⚡ Raccourcis et Tips

### Raccourcis Clavier
- **F5**: Actualiser les données
- **Tab**: Navigation entre sections
- **Esc**: Fermer les détails

### Tips d'Utilisation
1. **Priorité visuelle**: Rouge → Orange → Bleu
2. **Tendances**: Observer les sparklines sur 7 jours
3. **Seuils critiques**: Cash runway < 6 mois = alerte
4. **Actions**: Boutons bleus = actions disponibles

## 🔧 Personnalisation

### Sélecteur d'Entreprise
- **"Toutes les entreprises"**: Vue consolidée
- **Entreprise spécifique**: Données filtrées
- **Changement**: Mise à jour automatique

### Période d'Analyse
- **Sparklines**: 7 derniers jours
- **Cash flow**: Semaine courante
- **Métriques**: Temps réel (dernière sync)

## ❓ FAQ

**Q: Quelle fréquence de mise à jour des données?**
R: Les données sont actuellement mockées. En production, mise à jour temps réel.

**Q: Comment interpréter le Cash Runway?**
R: 7.3 mois = durée avant épuisement des fonds au rythme actuel.

**Q: Que signifie LTV:CAC 4.2:1?**
R: Pour 1€ investi en acquisition, nous générons 4.2€ de valeur client.

**Q: Les boutons d'action fonctionnent-ils?**
R: Actuellement désactivés (données mockées). En production, ils déclencheront des actions réelles.

**Q: Comment exporter les données?**
R: Fonctionnalité prévue dans une version future.

## 🆘 Support

### En cas de problème
1. **Rafraîchir la page** (F5)
2. **Vérifier la console** (F12) pour erreurs
3. **Redémarrer l'application** si nécessaire

### Contacts
- **Support technique**: Équipe Dev
- **Questions métier**: CEO Operations
- **Formation**: Équipe Formation

---

**Guide créé le**: 2025-08-06  
**Version Dashboard**: 1.0.0  
**Public cible**: Dirigeants et équipes exécutives