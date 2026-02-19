# CAHIER DES CHARGES — HYPERVISUAL SWITZERLAND
## Plateforme Directus Unified Platform — Système de Gestion Agentique

**Version** : 1.2  
**Date** : Février 2026  
**Statut** : Document de référence — Validé & Enrichi  
**Auteur** : Jean (CEO HYPERVISUAL) + Claude (Architecte IA)  
**Confidentialité** : Usage interne uniquement

> **Changelog v1.2** : Ajout de 8 modules Finance avancés identifiés lors de l'audit du repository (infrastructure existante confirmée — aucune construction from scratch nécessaire) : Module 9 Facturation par Jalons, Module 10 Contrats Récurrents Avancés, Module 11 Avoirs & Remboursements, Module 12 Validation Factures Fournisseurs, Module 13 Suivi du Temps → Facturation, Module 14 Tickets Support → Facturation, Module 15 Dashboard KPI Finance Pré-alimenté, Module 16 Rapprochement Bancaire Renforcé. Les collections Directus correspondantes (deliverables, subscriptions, credits, debits, refunds, returns, approvals, time_tracking, support_tickets, kpis, reconciliations) sont déjà présentes dans la base avec des données réelles.

> **Scope V1** : HYPERVISUAL Switzerland uniquement. Les entreprises DAINAMICS, LEXAIA, ENKI REALTY et TAKEOUT seront intégrées après stabilisation de la V1. L'architecture doit anticiper cette extension multi-entreprises dès la conception.
>
> **Outil d'automatisation** : Décision en attente — Make.com / n8n / Directus Flows seront évalués au moment de l'implémentation selon les besoins spécifiques de chaque workflow.

---

## TABLE DES MATIÈRES

1. [Contexte Stratégique](#1-contexte-stratégique)
2. [Vision & Objectifs](#2-vision--objectifs)
3. [Personas & Utilisateurs](#3-personas--utilisateurs)
4. [Cycle de Vente Complet](#4-cycle-de-vente-complet)
5. [Exigences Fonctionnelles par Module](#5-exigences-fonctionnelles-par-module)
   - Module 1 — Gestion des Leads
   - Module 2 — Portail Prestataire
   - Module 3 — Création de Devis Client
   - Module 4 — Portail Client
   - Module 5 — Facturation & Paiements
   - Module 6 — Gestion de Projets
   - Module 7 — Dashboard SuperAdmin (CEO)
   - Module 8 — Facturation Récurrente & Maintenance
   - **Module 9 — Facturation par Jalons** *(nouveau v1.2)*
   - **Module 10 — Contrats Récurrents Avancés** *(nouveau v1.2)*
   - **Module 11 — Avoirs & Remboursements** *(nouveau v1.2)*
   - **Module 12 — Validation Factures Fournisseurs** *(nouveau v1.2)*
   - **Module 13 — Suivi du Temps → Facturation** *(nouveau v1.2)*
   - **Module 14 — Tickets Support → Facturation** *(nouveau v1.2)*
   - **Module 15 — Dashboard KPI Finance Pré-alimenté** *(nouveau v1.2)*
   - **Module 16 — Rapprochement Bancaire Renforcé** *(nouveau v1.2)*
6. [Automatisations & Logique Agentique](#6-automatisations--logique-agentique)
7. [Architecture Technique](#7-architecture-technique)
   - 7.1 Architecture Globale
   - 7.2 Collections Directus Clés
   - 7.3 Portails — Règles d'Accès
   - 7.4 Intégrations Externes — Rôles
   - **7.5 Connexions Finance ↔ Module Comptabilité Suisse** *(nouveau v1.2)*
8. [Exigences Non-Fonctionnelles](#8-exigences-non-fonctionnelles)
9. [Stack Technologique Validée](#9-stack-technologique-validée)
10. [Priorisation MoSCoW](#10-priorisation-moscow)
11. [Roadmap de Développement](#11-roadmap-de-développement)
12. [Critères d'Acceptation Globaux](#12-critères-dacceptation-globaux)
13. [Glossaire](#13-glossaire)

---

## 1. CONTEXTE STRATÉGIQUE

### 1.1 Présentation de l'Entreprise

**HYPERVISUAL Switzerland** est une entreprise suisse spécialisée dans la vente et la location de solutions d'affichage dynamique haut de gamme :

- Écrans LED géants (indoor/outdoor)
- Totems et kiosques interactifs
- Mobilier LED
- Écrans vitrines haute luminosité
- Hologrammes (partenariat Hypervision)
- Développement de software custom (SaaS : InMotion, DataVision)
- Intégration de systèmes interactifs avec analytics d'audience

**Structure opérationnelle** :
- CEO basé à Chypre (pilotage à distance)
- Zéro employé direct en Suisse
- Réseau de prestataires suisses et européens pour l'exécution terrain
- Fournisseurs hardware principalement en Chine
- Couverture : Suisse principalement, France, Europe ponctuellement

**Problème central** : 80 à 90% du temps du CEO est consommé par des tâches administratives manuelles (qualification de leads, coordination prestataires, facturation, suivi de projets), ne laissant que 10 à 20% du temps pour des activités génératrices de valeur (développement commercial, relations clients stratégiques, développement produit).

### 1.2 Situation Actuelle (État "Avant")

| Domaine | Situation actuelle | Problème |
|---|---|---|
| Facturation | Bexio (non apprécié) | Workflow inadapté, peu personnalisable |
| Factures prestataires | Fichiers éparpillés sur l'ordinateur | Pas de traçabilité, marges inconnues en temps réel |
| Qualification leads | Manuelle (appels, WhatsApp, email) | Chronophage, risque d'oubli |
| Coordination prestataires | Email/WhatsApp ad hoc | Pas de centralisation, relances manuelles |
| Suivi de projets | Aucun outil dédié | Dépend de la mémoire du CEO |
| Facturation récurrente | Inexistante | Chiffre d'affaires potentiel non capturé (maintenance, hébergement cloud, support) |
| Signature de documents | Processus non standardisé | Friction juridique, pas de traçabilité |

### 1.3 Entreprises du Groupe (hors scope immédiat)

Les entités suivantes seront intégrées ultérieurement, une fois HYPERVISUAL Switzerland stabilisé :
- DAINAMICS
- LEXAIA
- ENKI REALTY
- TAKEOUT

---

## 2. VISION & OBJECTIFS

### 2.1 Vision

Créer une **plateforme agentique** où l'intelligence artificielle gère automatiquement l'ensemble des processus opérationnels et administratifs récurrents, permettant au CEO de se concentrer exclusivement sur la stratégie, les relations clients à haute valeur, et la croissance.

**Ambition** : Réduire le temps administratif de 80-90% à moins de 20%, en 6 mois après le déploiement complet.

### 2.2 Objectifs Mesurables (KPIs)

| Objectif | Métrique | Cible 6 mois |
|---|---|---|
| Réduire le temps administratif | % du temps CEO sur tâches admin | < 20% |
| Accélérer les devis | Délai lead → devis envoyé | < 4h (vs 24-72h actuellement) |
| Zéro facture perdue | % factures prestataires enregistrées | 100% |
| Activer le récurrent | Contrats maintenance/hébergement actifs | > 5 contrats |
| Améliorer la visibilité financière | Marge nette visible par projet en temps réel | 100% des projets |
| Réduire les oublis de relance | % leads relancés automatiquement | 100% |

### 2.3 Ce que la Plateforme N'est PAS

- ❌ Un ERP généraliste (pas de gestion de stock physique complexe)
- ❌ Un outil de gestion comptable complet (Invoice Ninja gère la comptabilité)
- ❌ Une plateforme d'automatisation marketing (Mautic gère l'email marketing)
- ❌ Un outil de gestion RH (pas d'employés directs)

---

## 3. PERSONAS & UTILISATEURS

### 3.1 SuperAdmin — Jean (CEO, Chypre)

**Profil** : Entrepreneur à distance, pilote 5 entreprises, disponibilité limitée pour l'administratif.

**Besoins clés** :
- Vue d'ensemble en temps réel sur toutes les activités
- Validation rapide des devis (Human in the Loop)
- Visibilité immédiate sur la trésorerie et les marges
- Alertes sur les situations critiques uniquement
- Minimum de clics pour accomplir les tâches

**Niveau de tolérance à la complexité** : Faible. L'interface doit être intuitive.

**Accès** : Dashboard SuperAdmin — portail privé

### 3.2 Client — Entreprises/Professionnels Suisses

**Profils typiques** :
- Agences événementielles
- Architectes et cabinets de design
- Multinationales (services marketing)
- Artisans et commerçants (vitrine interactive)
- Organisateurs de salons et d'expositions
- Marques directement

**Besoins clés** :
- Recevoir et signer un devis en ligne (frictionless)
- Suivre l'avancement de son projet
- Accéder à ses factures et historique
- Uploader des documents (plans d'architecture, briefs créatifs, visuels)
- Communication directe avec HYPERVISUAL

**Niveau de tolérance à la complexité** : Très faible. Interface minimaliste, accès sans formation.

**Accès** : Portail Client — invitation par lien sécurisé

### 3.3 Prestataire — Techniciens et Sociétés Suisses/Européens

**Profil** : Techniciens audio-visuels, installateurs LED, standistes, sociétés événementielles suisses ou européennes.

**Besoins clés** :
- Recevoir des demandes de devis claires et complètes
- Soumettre un devis directement dans la plateforme
- Accéder à tous les détails du projet assigné (plans, adresse, dates, spécifications)
- Recevoir les bons de commande et conditions
- Voir le statut de paiement de sa prestation

**Niveau de tolérance à la complexité** : Moyen. Peut apprendre une interface simple.

**Accès** : Portail Prestataire — compte dédié par prestataire

### 3.4 Revendeur (usage futur — hors scope V1)

Portail à développer ultérieurement pour les partenaires commerciaux qui revendent les solutions HYPERVISUAL.

---

## 4. CYCLE DE VENTE COMPLET

### 4.1 Vue d'Ensemble du Flux

```
LEAD ENTRANT
     │
     ▼
QUALIFICATION AUTOMATIQUE (IA)
     │
     ▼
REVUE CEO + ASSIGNATION PRESTATAIRE
     │
     ▼
DEMANDE DEVIS PRESTATAIRE (via portail)
     │
     ▼
RÉCEPTION DEVIS PRESTATAIRE
     │
     ▼
CRÉATION DEVIS CLIENT (CEO valide + ajuste marge)
     │
     ▼
ENVOI DEVIS CLIENT (via portail)
     │
     ▼
SIGNATURE ÉLECTRONIQUE (CGV intégrées)
     │
     ▼
GÉNÉRATION FACTURE ACOMPTE AUTOMATIQUE
     │
     ▼
PAIEMENT ACOMPTE (Revolut Business)
     │
     ▼
ACTIVATION PROJET (portails client + prestataire)
     │
     ├── COMMANDE HARDWARE CHINE (si applicable)
     │
     ├── DÉVELOPPEMENT SOFTWARE (si applicable)
     │
     └── COORDINATION INSTALLATION/ÉVÉNEMENT
          │
          ▼
     LIVRAISON / ÉVÉNEMENT
          │
          ▼
     FACTURE SOLDE AUTOMATIQUE
          │
          ▼
     PAIEMENT SOLDE
          │
          ▼
     CLÔTURE PROJET + ACTIVATION RÉCURRENT (si applicable)
```

### 4.2 Sources de Leads et Qualification

**Sources d'entrée** :
1. **Formulaire WordPress multi-étapes** (principal) — formulaire conditionnel qui qualifie automatiquement la demande avec questions détaillées
2. **WhatsApp Business** — messages entrants
3. **Email** — boîte info@hypervisual.ch
4. **Téléphone Ringover** — appels transcrits et enregistrés automatiquement

**Qualification automatique par IA** :
- À partir du formulaire : extraction automatique des données du champ et création d'un lead dans Directus
- À partir de WhatsApp/Email : un LLM analyse le message, extrait les informations clés et crée un lead qualifié
- À partir de Ringover : transcription automatique + résumé LLM de la demande en 3-5 lignes, extraction des infos clés (type de projet, budget estimé, délai, localisation)

**Données capturées par lead** :
- Type de demande (location / achat / installation fixe / développement software)
- Type de matériel souhaité (écran LED, totem, hologramme, etc.)
- Dimensions / Surface souhaitée
- Localisation du projet (ville, région)
- Date de l'événement / Deadline d'installation
- Budget approximatif
- Coordonnées complètes
- Entreprise et secteur d'activité
- Documents joints (plans, brief créatif)
- Score de qualification automatique (High / Medium / Low)

### 4.3 Conditions de Paiement

| Type de projet | Acompte | Solde |
|---|---|---|
| Achat matériel | 60% à la signature du devis | 40% à la livraison |
| Location < 5'000 CHF | 100% à la commande | — |
| Location > 5'000 CHF | 60-70% à la commande | Solde après l'événement |
| Installation fixe (projet complexe) | 60% à la commande | 40% à la livraison/réception |
| Maintenance/Hébergement récurrent | 100% mensuel en avance | — |

### 4.4 Typologies de Projets

**Type A — Location simple** : Écran LED pour un événement unique. Durée : quelques heures à quelques jours. Gestion : HYPERVISUAL + 1 prestataire local.

**Type B — Installation fixe** : Écran ou système intégré dans un espace permanent (cabinet dentaire, showroom, boutique). Gestion : HYPERVISUAL pilote, prestataire installe, possibilité de maintenance récurrente.

**Type C — Projet clé en main** : Conception, commande hardware Chine, développement software, installation, formation, support. Exemple : Creative Circle (9 bijouteries). Gestion : HYPERVISUAL de A à Z.

**Type D — Logiciel / SaaS** : Déploiement InMotion ou DataVision avec hébergement cloud et contrat de support mensuel.

---

## 5. EXIGENCES FONCTIONNELLES PAR MODULE

### MODULE 1 — GESTION DES LEADS

**REQ-LEAD-001** (MUST) : Le système DOIT créer automatiquement un lead dans Directus à partir de chaque soumission du formulaire WordPress.

**REQ-LEAD-002** (MUST) : Le système DOIT créer automatiquement un lead dans Directus à partir de chaque message WhatsApp Business entrant, avec résumé LLM de la demande.

**REQ-LEAD-003** (MUST) : Le système DOIT créer automatiquement un lead dans Directus à partir de chaque appel Ringover, avec transcription et résumé LLM.

**REQ-LEAD-004** (MUST) : Le système DOIT créer automatiquement un lead dans Directus à partir de chaque email entrant à l'adresse info@hypervisual.ch.

**REQ-LEAD-005** (MUST) : Chaque lead DOIT recevoir un score de qualification automatique (High / Medium / Low) basé sur les critères : budget estimé, délai, complétude des informations.

**REQ-LEAD-006** (MUST) : Le CEO DOIT recevoir une notification immédiate pour chaque nouveau lead High, avec le résumé de la demande.

**REQ-LEAD-007** (MUST) : Le système DOIT envoyer un email de confirmation automatique au prospect dans les 5 minutes suivant la réception du lead.

**REQ-LEAD-008** (SHOULD) : Le tableau de bord des leads DOIT permettre de filtrer par source, score, statut, type de projet et date.

**REQ-LEAD-009** (SHOULD) : Si aucune action n'est prise sur un lead High sous 24h, le CEO DOIT recevoir un rappel automatique.

### MODULE 2 — PORTAIL PRESTATAIRE

**REQ-PREST-001** (MUST) : Le CEO DOIT pouvoir créer une demande de devis vers un prestataire en moins de 3 clics, avec toutes les informations du projet pré-remplies depuis le lead.

**REQ-PREST-002** (MUST) : La demande envoyée au prestataire DOIT contenir : description du projet, dimensions/spécifications techniques, adresse du site, dates de l'événement/installation, deadline de réponse souhaitée, documents joints (plans, brief).

**REQ-PREST-003** (MUST) : Le prestataire DOIT pouvoir soumettre son devis directement dans son portail (PDF uploadé + montant saisi).

**REQ-PREST-004** (MUST) : Si le prestataire n'a pas répondu sous 24h, le système DOIT lui envoyer un rappel automatique par email.

**REQ-PREST-005** (MUST) : À réception du devis prestataire, le CEO DOIT recevoir une notification immédiate.

**REQ-PREST-006** (MUST) : Le portail prestataire DOIT afficher pour chaque projet assigné : statut, toutes les informations techniques, les documents, les dates clés, le bon de commande une fois le projet activé.

**REQ-PREST-007** (MUST) : Le prestataire DOIT voir le statut de paiement de sa prestation (en attente / payé).

**REQ-PREST-008** (SHOULD) : Le CEO DOIT pouvoir gérer plusieurs prestataires pour un même projet (ex : standiste + technicien LED).

**REQ-PREST-009** (SHOULD) : L'historique complet des projets et devis DOIT être consultable par prestataire.

### MODULE 3 — CRÉATION DE DEVIS CLIENT

**REQ-DEVIS-001** (MUST) : Après réception du devis prestataire, la plateforme DOIT générer automatiquement un devis client pré-rempli en appliquant la marge définie par le CEO.

**REQ-DEVIS-002** (MUST) : Le CEO DOIT pouvoir ajuster tous les éléments du devis avant envoi (montants, descriptions, conditions, délais).

**REQ-DEVIS-003** (MUST) : Le devis client DOIT intégrer les CGV (Conditions Générales de Vente et de Location) dans le même document signable.

**REQ-DEVIS-004** (MUST) : Le devis DOIT être signable électroniquement en ligne (conforme au droit suisse — CO Art. 14).

**REQ-DEVIS-005** (MUST) : À signature, le client DOIT recevoir automatiquement une copie du devis signé par email.

**REQ-DEVIS-006** (MUST) : La plateforme DOIT supporter les devis multi-postes (matériel + transport + installation + software + formation).

**REQ-DEVIS-007** (SHOULD) : La plateforme DOIT permettre d'enregistrer des gabarits de devis réutilisables par type de projet.

**REQ-DEVIS-008** (SHOULD) : La plateforme DOIT calculer et afficher automatiquement la marge brute par devis (prix client - prix prestataire).

**REQ-DEVIS-009** (COULD) : Un configurateur de prix assisté DOIT permettre une estimation rapide basée sur paramètres (surface en m², type d'écran, durée de location, localisation, transport estimé).

### MODULE 4 — PORTAIL CLIENT

**REQ-CLIENT-001** (MUST) : Le client DOIT recevoir un email d'invitation à son portail une fois que son premier devis est prêt (et non à la création du contact).

**REQ-CLIENT-002** (MUST) : Le portail client DOIT afficher en temps réel : statut du projet, étapes complétées, prochaines étapes.

**REQ-CLIENT-003** (MUST) : Le portail client DOIT permettre de consulter et télécharger tous les documents liés au projet (devis, factures, bon de commande, photos d'installation).

**REQ-CLIENT-004** (MUST) : Le portail client DOIT permettre d'uploader des documents (plans d'architecture, visuels, briefs créatifs).

**REQ-CLIENT-005** (MUST) : Le portail client DOIT afficher l'état des paiements (acompte reçu / solde en attente / payé).

**REQ-CLIENT-006** (MUST) : Le client DOIT pouvoir signer son devis directement depuis son portail.

**REQ-CLIENT-007** (SHOULD) : Pour les projets complexes (Type C), le client DOIT voir les étapes de commande hardware, développement software, et installation séparément.

**REQ-CLIENT-008** (SHOULD) : Le client DOIT pouvoir envoyer un message à HYPERVISUAL depuis son portail (messagerie interne simple).

### MODULE 5 — FACTURATION & PAIEMENTS

**REQ-FACT-001** (MUST) : À signature du devis, la plateforme DOIT générer automatiquement la facture d'acompte (selon les règles définies par type de projet).

**REQ-FACT-002** (MUST) : La facture DOIT être conforme aux exigences suisses : numéro séquentiel, TVA 8.1% (taux standard), numéro TVA, coordonnées légales complètes.

**REQ-FACT-003** (MUST) : La plateforme DOIT générer des factures QR-Invoice v2.3 (standard suisse ISO 20022) pour les paiements par virement bancaire.

**REQ-FACT-004** (MUST) : La facture DOIT être envoyée automatiquement au client par email à sa génération.

**REQ-FACT-005** (MUST) : La plateforme DOIT enregistrer automatiquement les transactions Revolut Business et les associer aux projets correspondants.

**REQ-FACT-006** (MUST) : À réception du paiement acompte (confirmé via Revolut API), le projet DOIT être automatiquement activé. Un email d'accusé de réception DOIT être envoyé automatiquement au client confirmant le paiement reçu, le numéro de facture et le nom du projet.

**REQ-FACT-006b** (MUST) : Un projet ne DOIT démarrer officiellement (portails client et prestataire activés, bon de commande émis) qu'après réception confirmée de l'acompte ou du montant total selon le type de projet. Aucune activation sur simple signature sans paiement.

**REQ-FACT-007** (MUST) : La facture de solde DOIT être générée automatiquement à la livraison/fin de l'événement.

**REQ-FACT-008** (MUST) : Les factures reçues des prestataires DOIVENT être uploadables dans la plateforme et associées au projet correspondant.

**REQ-FACT-009** (MUST) : La plateforme DOIT afficher la marge réelle par projet (revenus client - coûts prestataires - coûts hardware).

**REQ-FACT-010** (SHOULD) : Si une facture client n'est pas payée à l'échéance, un rappel automatique DOIT être envoyé (J+7, J+14, J+30 selon procédure de recouvrement suisse).

**REQ-FACT-011** (SHOULD) : La plateforme DOIT gérer la facturation récurrente mensuelle (maintenance, hébergement cloud, support) avec génération et envoi automatiques.

**REQ-FACT-012** (COULD) : Intégration Invoice Ninja pour la génération et la gestion des factures avec personnalisation complète.

### MODULE 6 — GESTION DE PROJETS

**REQ-PROJ-001** (MUST) : Un projet DOIT être créé automatiquement dans la plateforme à la signature du devis.

**REQ-PROJ-002** (MUST) : Chaque projet DOIT avoir un statut clair : Devis envoyé / Signé / Acompte reçu / En préparation / Commande hardware / En installation / Livré / Clôturé.

**REQ-PROJ-003** (MUST) : Le CEO DOIT pouvoir voir tous les projets actifs avec leur statut sur un tableau de bord centralisé.

**REQ-PROJ-004** (MUST) : Chaque projet DOIT avoir un espace de stockage documentaire (plans, photos, fichiers techniques, correspondances).

**REQ-PROJ-005** (MUST) : Le CEO DOIT pouvoir ajouter des notes et des jalons à chaque projet.

**REQ-PROJ-006** (SHOULD) : Pour les projets avec commande hardware en Chine, la plateforme DOIT permettre d'enregistrer : fournisseur, numéro de commande, date de commande, mode de transport (avion/bateau), date estimée d'arrivée, statut de la commande.

**REQ-PROJ-007** (SHOULD) : La plateforme DOIT afficher un calendrier des projets avec les dates clés (livraison, événement, installation).

**REQ-PROJ-008** (COULD) : La plateforme DOIT pouvoir signaler automatiquement les conflits de planning entre projets impliquant le même prestataire.

### MODULE 7 — DASHBOARD SUPERADMIN (CEO)

**REQ-CEO-001** (MUST) : Le dashboard DOIT afficher en temps réel : leads nouveaux, devis en attente de validation, projets actifs, factures impayées, trésorerie Revolut.

**REQ-CEO-002** (MUST) : Le dashboard DOIT afficher les KPIs financiers clés : chiffre d'affaires mensuel, marge brute, factures en attente, paiements reçus dans les 7 derniers jours.

**REQ-CEO-003** (MUST) : Le dashboard DOIT afficher une liste des actions requises par le CEO (validation devis, réponse à un prestataire, relance manuelle).

**REQ-CEO-004** (SHOULD) : Le dashboard DOIT afficher une prévision de trésorerie à 30/60/90 jours basée sur les devis signés et les paiements attendus.

**REQ-CEO-005** (SHOULD) : Le dashboard DOIT afficher les performances commerciales : taux de conversion lead → devis signé, délai moyen de signature, valeur moyenne des projets.

**REQ-CEO-006** (COULD) : Le dashboard DOIT envoyer un rapport quotidien automatique par email au CEO avec le résumé de la journée.

### MODULE 8 — FACTURATION RÉCURRENTE & MAINTENANCE

**REQ-REC-001** (MUST) : La plateforme DOIT permettre de créer des contrats de maintenance/hébergement avec facturation mensuelle automatique.

**REQ-REC-002** (MUST) : Chaque contrat récurrent DOIT avoir : client associé, projet associé, montant mensuel, date de début, date de fin (optionnelle), fréquence.

**REQ-REC-003** (MUST) : Les factures récurrentes DOIVENT être générées et envoyées automatiquement sans intervention du CEO.

**REQ-REC-004** (SHOULD) : Le CEO DOIT recevoir une notification mensuelle récapitulant les factures récurrentes émises et les paiements reçus.

### MODULE 9 — FACTURATION PAR JALONS *(nouveau v1.2)*

> **Base existante** : collection `deliverables` — 550 enregistrements réels (HYPERVISUAL : 301, DAINAMICS : 62, LEXAIA : 65). Infrastructure prête, aucune construction from scratch.

**REQ-JALON-001** (MUST) : Pour les projets de Type C (clé en main), le CEO DOIT pouvoir définir un plan de facturation par jalons directement dans la plateforme (ex : 30% livraison hardware Chine, 30% installation, 40% réception finale).

**REQ-JALON-002** (MUST) : Lorsqu'un livrable (`deliverable`) est marqué "Complété" dans la plateforme, une facture intermédiaire DOIT être générée automatiquement pour le jalon correspondant, conforme au standard QR-Invoice v2.3.

**REQ-JALON-003** (MUST) : Le CEO DOIT valider chaque facture de jalon avant envoi (Human in the Loop) — la génération est automatique mais l'envoi nécessite une approbation.

**REQ-JALON-004** (MUST) : Le portail client DOIT afficher un tableau récapitulatif des jalons avec : montant, statut (À venir / Facturé / Payé), date prévue, progression globale.

**REQ-JALON-005** (SHOULD) : La plateforme DOIT calculer en temps réel le montant restant à facturer sur chaque projet (total devis - somme jalons facturés).

**REQ-JALON-006** (SHOULD) : Si un livrable est marqué complété mais que la facture de jalon n'est pas payée sous 10 jours, le workflow de rappel de paiement standard DOIT s'activer automatiquement.

**REQ-JALON-007** (COULD) : La plateforme DOIT suggérer automatiquement un découpage en jalons basé sur le type de projet et le montant total du devis.

---

### MODULE 10 — CONTRATS RÉCURRENTS AVANCÉS *(nouveau v1.2)*

> **Base existante** : collection `subscriptions` — 120 enregistrements réels pour HYPERVISUAL. Ces données sont déjà présentes ; il s'agit de connecter et d'enrichir, pas de construire.

**REQ-ABONNEMENT-001** (MUST) : La plateforme DOIT afficher et gérer les 120 abonnements/contrats existants depuis la collection `subscriptions`, avec vue consolidée par client, par service et par montant.

**REQ-ABONNEMENT-002** (MUST) : Chaque contrat récurrent DOIT supporter un panier de services multi-lignes (ex : hébergement InMotion 150 CHF/mois + support niveau 1 100 CHF/mois + mise à jour contenu 50 CHF/mois = total 300 CHF/mois sur une facture unique).

**REQ-ABONNEMENT-003** (MUST) : La plateforme DOIT appliquer automatiquement une revalorisation annuelle configurable au 1er janvier de chaque année (défaut : +3%, paramétrable par contrat par le CEO).

**REQ-ABONNEMENT-004** (MUST) : Une alerte DOIT être envoyée au CEO 30 jours avant la date d'expiration de chaque contrat, avec proposition de renouvellement automatique au client.

**REQ-ABONNEMENT-005** (MUST) : Le CEO DOIT voir un dashboard récurrent dédié : MRR (Monthly Recurring Revenue) total, ARR (Annual Recurring Revenue), contrats expirant ce mois, taux de renouvellement.

**REQ-ABONNEMENT-006** (SHOULD) : La plateforme DOIT calculer et afficher la valeur vie client (LTV) par client basée sur la somme des contrats récurrents actifs et l'historique de facturation.

**REQ-ABONNEMENT-007** (SHOULD) : Le client DOIT pouvoir consulter ses contrats actifs, les détails des services inclus et l'historique des factures récurrentes depuis son portail.

**REQ-ABONNEMENT-008** (COULD) : La plateforme DOIT proposer des alertes d'upselling automatiques lorsqu'un client a 2+ contrats actifs ou dépasse un seuil de consommation défini.

---

### MODULE 11 — AVOIRS & REMBOURSEMENTS *(nouveau v1.2)*

> **Base existante** : collections `credits`, `debits`, `refunds`, `returns` présentes dans Directus. Pour une activité de location événementielle, les annulations et modifications sont fréquentes — ce module est critique pour la conformité CO.

**REQ-AVOIR-001** (MUST) : En cas d'annulation totale ou partielle d'une commande par le client, le CEO DOIT pouvoir générer un avoir (note de crédit) directement dans la plateforme, conforme au standard QR-Invoice et au CO suisse.

**REQ-AVOIR-002** (MUST) : L'avoir DOIT être automatiquement lié à la facture originale et DOIT déduire le montant correspondant dans la balance comptable du client.

**REQ-AVOIR-003** (MUST) : La plateforme DOIT gérer deux types de remboursement : avoir comptable (déduction sur prochaine facture) et remboursement direct (virement Revolut vers le client).

**REQ-AVOIR-004** (MUST) : Pour les remboursements via Revolut, la plateforme DOIT générer la transaction sortante dans Revolut Business avec référence à la facture originale et à l'avoir.

**REQ-AVOIR-005** (MUST) : Le portail client DOIT afficher les avoirs disponibles et leur statut (en attente d'application / appliqué sur facture X / remboursé).

**REQ-AVOIR-006** (SHOULD) : La plateforme DOIT appliquer automatiquement un avoir disponible en déduction lors de la génération de la prochaine facture du même client.

**REQ-AVOIR-007** (SHOULD) : Le dashboard CEO DOIT afficher le total des avoirs en cours (montants à déduire ou à rembourser) dans le bloc trésorerie, pour une visibilité des engagements financiers sortants.

**REQ-AVOIR-008** (MUST) : Toutes les opérations d'avoir et de remboursement DOIVENT être tracées avec horodatage, motif, montant et référence à la facture originale (conformité CO Art. 958f — 10 ans de conservation).

---

### MODULE 12 — VALIDATION FACTURES FOURNISSEURS *(nouveau v1.2)*

> **Base existante** : collection `approvals` prête dans Directus, 375 factures fournisseurs (supplier_invoices) déjà enregistrées pour HYPERVISUAL. Ce module transforme un workflow manuel en processus structuré.

**REQ-APPRO-001** (MUST) : Chaque facture fournisseur uploadée DOIT suivre un workflow de validation en 3 étapes : OCR & extraction automatique → Vérification CEO → Paiement programmé.

**REQ-APPRO-002** (MUST) : Le CEO DOIT voir une file d'attente des factures fournisseurs à valider, avec pour chaque facture : montant extrait par OCR, prestataire, projet associé, date d'échéance, et comparaison avec le devis prestataire initial.

**REQ-APPRO-003** (MUST) : Le CEO DOIT pouvoir approuver ou rejeter une facture en un clic depuis le dashboard, avec possibilité d'ajouter un commentaire en cas de rejet.

**REQ-APPRO-004** (MUST) : À approbation, la plateforme DOIT automatiquement programmer le paiement dans Revolut Business à la date d'échéance définie (ou immédiatement si délai dépassé).

**REQ-APPRO-005** (MUST) : Le prestataire DOIT recevoir une notification automatique à l'approbation de sa facture, indiquant la date de paiement prévue.

**REQ-APPRO-006** (SHOULD) : La plateforme DOIT détecter automatiquement les écarts entre le montant de la facture fournisseur et le devis prestataire approuvé (tolérance configurable, défaut : ±5%) et alerter le CEO en cas de dépassement.

**REQ-APPRO-007** (SHOULD) : La plateforme DOIT calculer et afficher pour chaque projet la marge nette actualisée en temps réel en intégrant les factures fournisseurs validées.

**REQ-APPRO-008** (COULD) : Un rapport mensuel automatique DOIT synthétiser les paiements fournisseurs du mois, les délais moyens de paiement, et les prestataires les plus fréquents.

---

### MODULE 13 — SUIVI DU TEMPS → FACTURATION *(nouveau v1.2)*

> **Base existante** : collection `time_tracking` présente dans Directus. Applicable principalement aux projets logiciels (InMotion, DataVision) et aux prestations de support facturées en régie (Type D).

**REQ-TEMPS-001** (MUST) : La plateforme DOIT permettre d'enregistrer les heures travaillées sur un projet en liant chaque entrée à : projet, type de prestation, taux horaire applicable, date, description.

**REQ-TEMPS-002** (MUST) : Pour les projets en régie (facturation aux heures), la plateforme DOIT générer automatiquement en fin de mois une facture récapitulative des heures travaillées, avec détail ligne par ligne des interventions.

**REQ-TEMPS-003** (MUST) : Le CEO DOIT valider le récapitulatif des heures avant génération de la facture mensuelle (Human in the Loop).

**REQ-TEMPS-004** (MUST) : La facture de temps générée DOIT être conforme au standard QR-Invoice v2.3 et intégrer le numéro TVA ainsi que les mentions légales suisses.

**REQ-TEMPS-005** (SHOULD) : La plateforme DOIT afficher pour chaque projet en régie : heures consommées vs budget heures alloué, budget restant, projection de dépassement si tendance actuelle maintenue.

**REQ-TEMPS-006** (SHOULD) : Le portail client DOIT afficher pour les projets concernés un résumé mensuel des heures facturées, accessible en consultation.

**REQ-TEMPS-007** (COULD) : Le prestataire DOIT pouvoir saisir ses propres heures depuis son portail pour les projets où il intervient en sous-traitance de développement, soumises à validation CEO avant intégration dans la facturation.

---

### MODULE 14 — TICKETS SUPPORT → FACTURATION *(nouveau v1.2)*

> **Base existante** : collection `support_tickets` présente dans Directus. Applicable aux clients ayant des contrats de maintenance — permet de facturer automatiquement les interventions hors contrat.

**REQ-SUPPORT-001** (MUST) : La plateforme DOIT permettre d'enregistrer les tickets support avec : client, projet, description de l'intervention, durée réelle, type (dans contrat / hors contrat), date de résolution.

**REQ-SUPPORT-002** (MUST) : Pour chaque ticket marqué "Hors contrat" et "Résolu", la plateforme DOIT générer automatiquement une facture d'intervention selon le tarif horaire du contrat de maintenance ou le tarif ponctuel défini (défaut : 150 CHF/h).

**REQ-SUPPORT-003** (MUST) : Le CEO DOIT valider chaque facture d'intervention avant envoi au client (Human in the Loop) — la génération est automatique, l'envoi est manuel.

**REQ-SUPPORT-004** (MUST) : Le portail client DOIT afficher l'historique des tickets support avec leur statut (Ouvert / En cours / Résolu / Facturé / Payé).

**REQ-SUPPORT-005** (SHOULD) : La plateforme DOIT cumuler les tickets hors contrat du mois et les regrouper sur une facture mensuelle unique plutôt que de générer une facture par ticket (paramétrable : facture unitaire ou mensuelle cumulée).

**REQ-SUPPORT-006** (SHOULD) : Le dashboard CEO DOIT afficher le volume de tickets ce mois, le taux de résolution, le montant facturable en attente de validation, et les clients les plus sollicitants.

**REQ-SUPPORT-007** (COULD) : La plateforme DOIT détecter automatiquement si un client dépasse un seuil d'interventions hors contrat (configurable) et alerter le CEO pour proposer une mise à niveau vers un contrat de maintenance supérieur.

---

### MODULE 15 — DASHBOARD KPI FINANCE PRÉ-ALIMENTÉ *(nouveau v1.2)*

> **Base existante** : collection `kpis` — 240 enregistrements réels (HYPERVISUAL : 48, DAINAMICS : 48, LEXAIA : 48, etc.). Les KPIs sont déjà calculés en base — il s'agit de les afficher correctement, pas de les reconstruire.

**REQ-KPI-001** (MUST) : Le dashboard CEO DOIT afficher les KPIs financiers déjà calculés dans la collection `kpis` en temps réel, sans recalcul côté frontend : ARR, MRR, EBITDA, Runway (mois de trésorerie), LTV, CAC, NPS.

**REQ-KPI-002** (MUST) : Les KPIs DOIVENT être affichés avec comparaison N vs N-1 (mois précédent et année précédente) pour chaque indicateur, en exploitant l'historique déjà présent en base.

**REQ-KPI-003** (MUST) : Chaque KPI DOIT afficher une tendance visuelle (flèche verte/rouge, sparkline) pour permettre une lecture instantanée de l'évolution sans analyse manuelle.

**REQ-KPI-004** (MUST) : Le dashboard DOIT permettre de filtrer les KPIs par entreprise (HYPERVISUAL uniquement en V1, puis multi-entreprises), par période (mois, trimestre, année glissante, personnalisé).

**REQ-KPI-005** (SHOULD) : Le CEO DOIT pouvoir définir des seuils d'alerte par KPI (ex : MRR < 50'000 CHF → alerte rouge ; Runway < 3 mois → alerte critique) et recevoir une notification automatique en cas de franchissement.

**REQ-KPI-006** (SHOULD) : Un rapport KPI mensuel automatique DOIT être généré et envoyé au CEO par email le 1er de chaque mois avec les performances du mois écoulé et les objectifs du mois à venir.

**REQ-KPI-007** (COULD) : Un graphique d'évolution sur 12 mois (Recharts) DOIT permettre de visualiser la trajectoire de croissance et d'identifier les patterns saisonniers.

---

### MODULE 16 — RAPPROCHEMENT BANCAIRE RENFORCÉ *(nouveau v1.2)*

> **Base existante** : collection `reconciliations` présente, 3'230 transactions bancaires vs 1'043 factures clients. Les données sont en base — ce module enrichit le moteur de matching déjà implémenté.

**REQ-RECO-001** (MUST) : Le moteur de rapprochement DOIT utiliser un algorithme multi-critères : montant exact + référence QR à 27 chiffres + date (±3 jours) + nom du payeur (fuzzy match à 80%) pour maximiser le taux de matching automatique.

**REQ-RECO-002** (MUST) : Le dashboard de rapprochement DOIT afficher en temps réel : taux de rapprochement automatique (cible > 90%), montant total rapproché ce mois, transactions non rapprochées avec montant total, écarts détectés.

**REQ-RECO-003** (MUST) : Pour chaque transaction non rapprochée automatiquement, le CEO DOIT voir une liste de suggestions de factures potentiellement correspondantes (top 3 par score de similarité) et pouvoir effectuer le rapprochement manuel en un clic.

**REQ-RECO-004** (MUST) : Toute transaction bancaire non rapprochée depuis plus de 5 jours DOIT générer une alerte dans le dashboard CEO pour investigation manuelle.

**REQ-RECO-005** (MUST) : Le système DOIT gérer les paiements partiels : une transaction peut être rapprochée avec une partie d'une facture, avec création automatique d'un solde restant dû.

**REQ-RECO-006** (SHOULD) : Un rapport mensuel de rapprochement DOIT être généré automatiquement : transactions rapprochées, transactions orphelines, paiements en double détectés, écarts de montants.

**REQ-RECO-007** (SHOULD) : La plateforme DOIT détecter et alerter le CEO en cas de transaction suspecte : montant inhabituel (>3 σ de la moyenne), payeur inconnu, double paiement pour une même facture.

**REQ-RECO-008** (COULD) : Un modèle d'apprentissage DOIT améliorer progressivement le matching automatique en mémorisant les rapprochements manuels effectués par le CEO pour entraîner les prochaines suggestions.

---

## 6. AUTOMATISATIONS & LOGIQUE AGENTIQUE

### 6.1 Principes de Base

**Human in the Loop obligatoire pour** :
- Validation finale d'un devis avant envoi au client
- Ajustement des marges et des prix
- Sélection du prestataire pour un projet
- Décision de recouvrement contentieux (au-delà des relances automatiques)
- Signature de tout document contractuel externe

**Automatisation complète (sans intervention) pour** :
- Création de leads depuis tous les canaux
- Envoi d'emails de confirmation aux prospects
- Rappels aux prestataires non répondants (J+1)
- Génération et envoi des factures (acompte, solde, récurrent)
- Rappels de paiement aux clients (J+7, J+14, J+30)
- Génération du rapport quotidien CEO
- Mise à jour des statuts de projet à chaque étape

### 6.2 Workflows Automatisés Prioritaires

**Workflow 1 — Nouveau Lead**
```
Trigger : Formulaire soumis / WhatsApp reçu / Email reçu / Appel Ringover terminé
→ LLM extrait et structure les informations
→ Lead créé dans Directus avec score de qualification
→ Email de confirmation envoyé au prospect (via Mautic)
→ Notification CEO (si score High)
→ [Si pas d'action CEO sous 24h] → Rappel automatique CEO
```

**Workflow 2 — Devis Prestataire**
```
Trigger : CEO sélectionne prestataire + clique "Envoyer demande"
→ Email de demande envoyé au prestataire avec toutes les infos
→ Accès portail prestataire activé pour ce projet
→ [Si pas de réponse sous 24h] → Rappel automatique prestataire
→ [À réception du devis] → Notification CEO
```

**Workflow 3 — Signature Devis Client**
```
Trigger : Client signe le devis en ligne
→ Copie signée archivée dans Directus
→ Email de confirmation au client
→ Facture acompte générée automatiquement (selon règles)
→ Facture envoyée au client par email
→ Notification CEO
→ [À réception paiement Revolut] → Projet activé automatiquement
→ Bon de commande envoyé au prestataire
→ Notification prestataire
```

**Workflow 4 — Relance Paiement**
```
Trigger : Échéance de paiement dépassée
→ J+7 : Email de rappel poli (via Mautic)
→ J+14 : Email de rappel avec mention des conditions (via Mautic)
→ J+30 : Notification CEO pour décision (mise en demeure / recouvrement)
```

**Workflow 5 — Facturation Récurrente**
```
Trigger : 1er du mois (ou date définie par contrat)
→ Facture mensuelle générée pour chaque contrat actif
→ Facture envoyée au client par email
→ [À réception paiement] → Statut mis à jour
→ [Si non payé sous 7 jours] → Rappel automatique
```

**Workflow 6 — Facturation par Jalons** *(nouveau v1.2)*
```
Trigger : Livrable marqué "Complété" dans la plateforme
→ Facture de jalon générée automatiquement (QR-Invoice)
→ Notification CEO pour validation (Human in the Loop)
→ [CEO approuve] → Facture envoyée au client + portail client mis à jour
→ [Si non payée sous 10 jours] → Workflow relance standard activé
→ Marge projet recalculée et mise à jour en temps réel
```

**Workflow 7 — Validation Facture Fournisseur** *(nouveau v1.2)*
```
Trigger : Facture fournisseur uploadée (OCR déclenché automatiquement)
→ OpenAI Vision extrait : montant, date, prestataire, IBAN
→ Facture ajoutée à la file d'attente CEO avec comparaison devis original
→ [Écart > 5%] → Alerte spécifique CEO "Dépassement détecté"
→ [CEO approuve] → Paiement programmé dans Revolut à date d'échéance
→ Prestataire notifié par email avec date de paiement
→ Marge projet actualisée automatiquement
```

**Workflow 8 — Ticket Support Hors Contrat** *(nouveau v1.2)*
```
Trigger : Ticket support résolu + marqué "Hors contrat"
→ Durée et description enregistrées
→ [Cumul mensuel activé] → Ajout au récapitulatif mensuel du client
→ [Facturation unitaire activée] → Facture générée immédiatement
→ CEO notifié pour validation avant envoi
→ [CEO approuve] → Facture envoyée au client
→ [Seuil d'interventions dépassé] → Alerte CEO pour upselling maintenance
```

**Workflow 9 — Alerte KPI Seuil** *(nouveau v1.2)*
```
Trigger : Calcul KPI périodique (horaire)
→ Chaque KPI comparé aux seuils d'alerte définis
→ [Seuil franchi] → Notification CEO immédiate avec détail et tendance
→ [Fin de mois] → Rapport KPI mensuel généré et envoyé par email
```

**Workflow 10 — Rapprochement Bancaire Automatique** *(nouveau v1.2)*
```
Trigger : Nouvelle transaction Revolut synchronisée
→ Algorithme multi-critères appliqué (montant + QR + date + payeur)
→ [Match > 95%] → Rapprochement automatique, facture marquée "Payée"
→ [Match 60-95%] → Suggestion présentée au CEO pour validation manuelle
→ [Match < 60% ou > 5 jours] → Alerte "Transaction orpheline" dans dashboard
→ [Double paiement détecté] → Alerte critique CEO immédiate
```

### 6.3 Intégration LLM (Claude API)

Les cas d'usage LLM dans la plateforme :

| Use case | Données en entrée | Sortie attendue |
|---|---|---|
| Qualification lead WhatsApp/Email | Message brut du prospect | Données structurées + score qualification |
| Résumé appel Ringover | Transcription complète | Résumé 5 lignes + infos clés extraites |
| Suggestion de prestataire | Type de projet, localisation, historique | Recommandation prestataire avec justification |
| Estimation de prix | Paramètres du projet | Fourchette de prix indicative pour pré-devis |
| Rédaction email client | Contexte du projet, objet | Brouillon d'email personnalisé (à valider par CEO) |
| Détection écart facture fournisseur | Facture OCR + devis original | Alerte si écart > seuil + analyse des raisons possibles |
| Analyse ticket support | Description ticket + historique client | Classification (dans contrat / hors contrat) + durée estimée |
| Alerte rapprochement bancaire | Transaction orpheline + historique | Suggestions de correspondance + signalement anomalies |
| Prévision MRR | Historique abonnements + renouvellements | Projection MRR 3 mois + risques de churn détectés |

---

## 7. ARCHITECTURE TECHNIQUE

### 7.1 Architecture Globale

```
┌─────────────────────────────────────────────────────────┐
│                    COUCHE PRÉSENTATION                   │
├───────────┬──────────────┬───────────────┬──────────────┤
│ Dashboard │    Portail   │    Portail    │   Portail    │
│ SuperAdmin│    Client    │  Prestataire  │  Revendeur   │
│ (CEO)     │              │               │  (futur)     │
└───────────┴──────┬───────┴───────┬───────┴──────────────┘
                   │               │
         React 18.2 + Vite + Tabler.io
                   │               │
┌──────────────────▼───────────────▼──────────────────────┐
│                    COUCHE API                            │
│              Directus 10.x (REST + GraphQL)             │
│              156 endpoints custom                        │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                    COUCHE DONNÉES                        │
│              PostgreSQL 15 (82+ collections)            │
│              Row-Level Security par entreprise           │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                COUCHE AUTOMATISATIONS                    │
├────────────────┬─────────────────────────────────────── ┤
│ Directus Flows │  Automatisation externe (Make.com/n8n/Flows — à définir) │
│ (logique interne)│  Claude API (LLM)                    │
└────────────────┴──────────────────────────────────────── ┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│               SERVICES EXTERNES INTÉGRÉS                │
├──────────┬──────────┬──────────┬──────────┬────────────-┤
│ Invoice  │ Revolut  │  Mautic  │ Ringover │  DocuSeal   │
│  Ninja   │ Business │ (email)  │ (téléph) │ (signature) │
└──────────┴──────────┴──────────┴──────────┴─────────────┘
```

### 7.2 Collections Directus Clés

**Domaine Commercial** :
- `contacts` — Tous les contacts (clients, prestataires, prospects)
- `companies` — Entreprises clientes et prestataires
- `leads` — Leads entrants avec score et source
- `quotes` — Devis (client et prestataire)
- `projects` — Projets actifs et archivés

**Domaine Financier** :
- `client_invoices` — Factures émises aux clients (1'043 enregistrements)
- `supplier_invoices` — Factures reçues des prestataires (375 enregistrements)
- `payments` — Paiements reçus et envoyés (100 enregistrements)
- `bank_transactions` — Transactions Revolut synchronisées (3'230 enregistrements)
- `recurring_contracts` — Contrats de maintenance/hébergement
- `subscriptions` — Abonnements actifs (120 enregistrements) *(v1.2)*
- `credits` — Avoirs émis aux clients *(v1.2)*
- `debits` — Débits et ajustements *(v1.2)*
- `refunds` — Remboursements traités *(v1.2)*
- `returns` — Retours et annulations *(v1.2)*
- `approvals` — Workflow de validation factures fournisseurs *(v1.2)*
- `reconciliations` — Rapprochements bancaires *(v1.2)*
- `kpis` — Indicateurs financiers pré-calculés (240 enregistrements) *(v1.2)*

**Domaine Opérationnel** :
- `hardware_orders` — Commandes hardware (Chine et autres)
- `project_milestones` — Étapes et jalons de projet
- `project_documents` — Documents liés aux projets
- `prestataire_assignments` — Assignations prestataires aux projets
- `deliverables` — Livrables par projet (550 enregistrements) *(v1.2)*
- `time_tracking` — Heures travaillées par projet et prestataire *(v1.2)*
- `support_tickets` — Tickets support clients *(v1.2)*

### 7.3 Portails — Règles d'Accès

| Portail | Accès | Données visibles |
|---|---|---|
| SuperAdmin | CEO uniquement (MFA) | Tout |
| Client | Par invitation (email + lien sécurisé) | Ses projets uniquement |
| Prestataire | Compte dédié par prestataire | Projets qui lui sont assignés uniquement |

### 7.4 Intégrations Externes — Rôles

| Service | Rôle dans la plateforme |
|---|---|
| **Invoice Ninja** | Génération et gestion des factures professionnelles |
| **Revolut Business** | Synchronisation des transactions bancaires, confirmation de paiement |
| **Mautic** | Envoi de tous les emails transactionnels et marketing |
| **Ringover** | Transcription des appels téléphoniques |
| **DocuSeal** | Signature électronique des devis et contrats |
| **Make.com / n8n / Directus Flows** | Orchestration des workflows inter-services — *outil à définir au moment de l'implémentation* |
| **Claude API** | Qualification LLM des leads, résumés, suggestions |
| **OpenAI Vision** | OCR des documents scannés (factures prestataires) |

### 7.5 Connexions Finance ↔ Module Comptabilité Suisse

> Le module Comptabilité (backend complet, frontend à créer) est un module distinct mais fortement couplé au pôle Finance. Les connexions suivantes sont planifiées et doivent être anticipées dans l'architecture dès la V1.

**Flux Finance → Comptabilité (unidirectionnel ou bidirectionnel)**

| Événement Finance | Action Comptabilité générée automatiquement |
|---|---|
| Facture client émise | Écriture débit `Créances clients 1100` / crédit `Produits 3200` |
| Paiement client reçu (Revolut) | Écriture débit `Banque 1020` / crédit `Créances clients 1100` |
| Avoir émis | Contre-écriture automatique sur les comptes concernés |
| Facture fournisseur validée | Écriture débit `Charges prestataires 4xxx` / crédit `Dettes fournisseurs 2000` |
| Paiement fournisseur envoyé | Écriture débit `Dettes fournisseurs 2000` / crédit `Banque 1020` |
| Facture avec TVA | Alimentation automatique Formulaire AFC 200 (taux 8.1% / 2.6% / 3.8%) |
| Clôture projet | Génération du récapitulatif comptable du projet |

**Principes de conception pour l'intégration**

- Les collections Finance (`client_invoices`, `supplier_invoices`, `payments`, `bank_transactions`) sont la **source de vérité** — la comptabilité en découle, pas l'inverse.
- Le module Comptabilité utilise le plan comptable PME Käfer/Sterchi via `chart-of-accounts.js` (déjà implémenté en backend).
- Toute facture émise depuis le module Finance DOIT déclencher une écriture comptable dans `accounting_entries` via hook Directus.
- Le Formulaire TVA AFC 200 (Formulaire 200) est généré à partir des données Finance — `form-200-generator.js` et `afc-codes.js` sont déjà en place.
- Les données comptables sont **en lecture seule** depuis le portail Finance — modifications uniquement depuis le module Comptabilité (séparation des responsabilités).

**REQ-COMPTA-INT-001** (MUST) : Chaque facture client émise DOIT générer automatiquement les écritures comptables correspondantes dans `accounting_entries` selon le plan PME Käfer.

**REQ-COMPTA-INT-002** (MUST) : La TVA collectée sur chaque facture DOIT alimenter automatiquement les totaux du Formulaire AFC 200 selon la période fiscale concernée.

**REQ-COMPTA-INT-003** (MUST) : Le dashboard Finance DOIT afficher un indicateur de synchronisation comptable (✅ Comptabilité à jour / ⚠️ X écritures en attente) pour que le CEO sache en permanence si Finance et Comptabilité sont alignés.

**REQ-COMPTA-INT-004** (SHOULD) : En cas d'erreur de génération d'écriture comptable, le CEO DOIT recevoir une alerte immédiate — aucune facture ne doit rester sans écriture comptable associée.

**REQ-COMPTA-INT-005** (SHOULD) : Le dashboard Comptabilité DOIT pouvoir être ouvert directement depuis une facture dans le module Finance (lien contextuel) pour investigation ou correction.

### 8.1 Performance

- Dashboard SuperAdmin : temps de chargement < 2 secondes
- API Directus : temps de réponse < 200ms au P95
- Workflows automatisés : exécution < 30 secondes de bout en bout
- Disponibilité : 99.5% (hors maintenances planifiées)

### 8.2 Sécurité

- Authentification multi-facteurs (MFA) obligatoire pour le SuperAdmin
- Chiffrement des données au repos et en transit (TLS 1.3)
- Isolation des données par portail (Row-Level Security PostgreSQL)
- Aucune donnée financière sensible stockée en clair
- Conformité RGPD : droit à l'effacement, portabilité des données
- Logs d'audit pour toutes les actions sensibles (création facture, modification prix, signature)

### 8.3 Conformité Suisse

- Factures conformes au droit suisse (CO, LTVA)
- QR-Invoice v2.3 (ISO 20022) pour les virements bancaires suisses
- TVA suisse 2025 : taux normal 8.1%, taux réduit 2.6%, taux spécial 3.8%
- Numéro TVA HYPERVISUAL intégré dans tous les documents fiscaux
- CGV conformes au droit suisse (LCD Art. 8 — clauses abusives interdites)
- Signature électronique conforme ZertES / eIDAS
- Délai de conservation des documents comptables : 10 ans (CO Art. 958f)

### 8.4 Utilisabilité

- Interface responsive (desktop prioritaire, tablet compatible)
- Portail client accessible sans formation
- Onboarding prestataire < 10 minutes
- Disponible en français (langue principale), possibilité d'extension en allemand et anglais

### 8.5 Hébergement & Infrastructure

- Infrastructure hébergée en Europe (Suisse ou EU)
- Backup automatique quotidien avec rétention 30 jours
- Possibilité de récupération des données en cas de défaillance (RTO < 4h, RPO < 24h)

---

## 9. STACK TECHNOLOGIQUE VALIDÉE

| Couche | Technologie | Version | Justification |
|---|---|---|---|
| **Backend** | Directus | 10.x | Headless CMS, REST+GraphQL, flows natifs |
| **Base de données** | PostgreSQL | 15 | Robustesse, RLS, relations complexes |
| **Frontend** | React | 18.2 | Composants réutilisables, portails séparés |
| **Build** | Vite | 5.0 | Performances de développement |
| **UI** | Tabler.io | 1.0.0-beta20 | Template professionnel acheté, via CDN |
| **Graphiques** | Recharts | 2.10 | Intégration React native (PAS ApexCharts) |
| **HTTP Client** | Axios | dernière | Requêtes API Directus |
| **Navigation** | React Router | v6 | Routing multi-portails |
| **Automatisations internes** | Directus Flows | natif | Logique métier dans Directus |
| **Automatisations externes** | À définir | — | Make.com / n8n / Directus Flows — décision au moment de l'implémentation |
| **LLM** | Claude API (Anthropic) | Sonnet | Qualification leads, résumés, suggestions |
| **Facturation** | Invoice Ninja | v5 | API-first, personnalisable, multi-templates |
| **Banking** | Revolut Business API | v2 | Multi-comptes, synchronisation temps réel |
| **Email** | Mautic | 5.x | Marketing + transactionnel, auto-hébergé |
| **Téléphonie** | Ringover | — | Transcription automatique, API disponible |
| **Signature** | DocuSeal | — | Open source, conforme eIDAS/ZertES |
| **OCR** | OpenAI Vision | — | Extraction factures prestataires |
| **Containerisation** | Docker | — | Orchestration des services |

---

## 10. PRIORISATION MOSCOW

### MUST HAVE — V1 (démarrage opérationnel)

- Capture automatique des leads (formulaire + email)
- Qualification LLM basique des leads
- Tableau de bord leads pour CEO
- Portail prestataire (demande de devis + réception devis)
- Création et envoi de devis client
- Signature électronique du devis avec CGV
- Génération automatique de la facture d'acompte
- Portail client (devis + suivi statut basique)
- Intégration Revolut (confirmation de paiement)
- Gestion documentaire basique (upload/download)
- Facturation QR-Invoice conforme Suisse
- **Dashboard KPI pré-alimenté depuis collection `kpis` existante** *(v1.2)*
- **Workflow validation factures fournisseurs (collection `approvals`)** *(v1.2)*

### SHOULD HAVE — V1.5 (efficacité opérationnelle)

- Capture WhatsApp automatique
- Intégration Ringover + résumé LLM des appels
- Rappels automatiques prestataires (J+1)
- Rappels automatiques paiements clients (J+7, J+14)
- Dashboard CEO complet avec KPIs financiers
- Enregistrement et association des factures prestataires
- Affichage marge par projet en temps réel
- Calendrier des projets
- Commandes hardware Chine (enregistrement et suivi)
- Messagerie interne client ↔ HYPERVISUAL
- **Facturation par jalons (livrables → factures automatiques)** *(v1.2)*
- **Avoirs & remboursements (annulations événementielles)** *(v1.2)*
- **Contrats récurrents avancés (panier multi-services, revalorisation +3%)** *(v1.2)*
- **Rapprochement bancaire renforcé (matching multi-critères + alertes)** *(v1.2)*
- **Tickets support → facturation hors contrat** *(v1.2)*

### COULD HAVE — V2 (valeur ajoutée)

- Configurateur de prix assisté (estimation rapide)
- Rapport quotidien automatique CEO par email
- Gabarits de devis par type de projet
- Prévision de trésorerie 30/60/90 jours
- Gestion des conflits de planning prestataires
- Interface en allemand et anglais
- **Suivi du temps → facturation en régie** *(v1.2)*
- **Alertes seuils KPI configurables par le CEO** *(v1.2)*
- **Modèle d'apprentissage pour améliorer le matching bancaire** *(v1.2)*
- **Upselling automatique maintenance (basé sur volume tickets)** *(v1.2)*

### WON'T HAVE (hors scope de ce projet)

- Application mobile native
- Gestion des autres entités du groupe (DAINAMICS, LEXAIA, etc.) — à planifier séparément
- Module comptable complet (géré par Invoice Ninja + comptable externe)
- CRM marketing avancé (géré par Mautic)
- Gestion de stock physique

---

## 11. ROADMAP DE DÉVELOPPEMENT

### Phase 0 — Fondation (Semaines 1-2)

**Objectif** : Infrastructure solide et données de base

- Configuration Docker (Directus + PostgreSQL + Redis)
- Création de toutes les collections PostgreSQL avec relations
- Configuration Row-Level Security
- Authentification multi-portails (4 rôles)
- Scaffold React avec routing par portail
- Intégration Tabler.io via CDN

**Livrable** : Plateforme accessible avec authentification fonctionnelle

### Phase 1 — Lead & Devis (Semaines 3-5)

**Objectif** : Cycle commercial de base fonctionnel

- Capture formulaire WordPress → Lead Directus
- Capture email → Lead Directus
- Dashboard leads CEO avec score
- Portail prestataire : demande de devis + réception
- Création devis client + signature DocuSeal
- Génération facture acompte QR-Invoice

**Livrable** : Premier devis signé et première facture générée via la plateforme

### Phase 2 — Portails & Automatisations (Semaines 6-8)

**Objectif** : Expérience complète clients et prestataires

- Portail client complet (suivi projet, documents, paiements)
- Activation automatique projet à paiement reçu (Revolut)
- Rappels automatiques (prestataires + clients)
- Intégration Mautic pour tous les emails transactionnels
- Tableau de bord CEO avec KPIs financiers
- **Module 12 : Workflow validation factures fournisseurs** *(v1.2)*
- **Module 15 : Dashboard KPI depuis collection `kpis` existante** *(v1.2)*
- **Module 16 : Rapprochement bancaire renforcé (algo multi-critères)** *(v1.2)*

**Livrable** : Premier projet géré de A à Z sans sortir de la plateforme

### Phase 3 — LLM & Intelligence (Semaines 9-11)

**Objectif** : Automatisation maximale via IA

- Intégration Claude API pour qualification leads
- Intégration Ringover + résumé LLM des appels
- Intégration WhatsApp Business → Lead automatique
- OCR factures prestataires (OpenAI Vision)
- Suggestion de prestataire basée sur l'historique

**Livrable** : Leads qualifiés automatiquement depuis tous les canaux

### Phase 4 — Récurrent & Optimisation (Semaines 12-14)

**Objectif** : Revenus récurrents et raffinement

- Module facturation récurrente (maintenance, hébergement)
- Suivi commandes hardware Chine
- Rappels de paiement automatiques avancés
- Rapport quotidien CEO automatique
- Tests de charge et optimisation performance
- Audit sécurité
- **Module 9 : Facturation par jalons (deliverables → factures)** *(v1.2)*
- **Module 10 : Contrats récurrents avancés (panier multi-services + revalorisation)** *(v1.2)*
- **Module 11 : Avoirs & remboursements** *(v1.2)*

**Livrable** : Premiers contrats de maintenance facturés automatiquement + facturation par jalons active

### Phase 5 — Modules Avancés (Semaines 15-17) *(nouveau v1.2)*

**Objectif** : Couverture complète du cycle Finance

- **Module 13 : Suivi du temps → facturation en régie (projets Type D)**
- **Module 14 : Tickets support → facturation hors contrat**
- Alertes seuils KPI configurables
- Modèle d'apprentissage matching bancaire (itération #1)
- Documentation technique complète des 16 modules

**Livrable** : Tous les flux de facturation automatisés — zéro facture créée manuellement

---

## 12. CRITÈRES D'ACCEPTATION GLOBAUX

La plateforme sera considérée comme opérationnelle (V1 validée) lorsque :

1. ✅ Un lead provenant du formulaire WordPress est créé automatiquement dans Directus en moins de 30 secondes
2. ✅ Le CEO peut créer et envoyer une demande de devis à un prestataire en moins de 3 minutes
3. ✅ Un client peut signer son devis en ligne sans formation ni aide externe
4. ✅ Une facture d'acompte conforme au droit suisse est générée automatiquement à la signature
5. ✅ Le portail client affiche le statut du projet en temps réel
6. ✅ Une facture prestataire peut être uploadée et associée à un projet en moins de 2 minutes
7. ✅ La marge brute d'un projet est visible en temps réel dans le dashboard CEO
8. ✅ Le CEO peut gérer un projet complet depuis Chypre sans email ni appel supplémentaire
9. ✅ Les 240 KPIs existants en base sont affichés correctement dans le dashboard sans recalcul *(v1.2)*
10. ✅ Une facture fournisseur suit le workflow complet : OCR → validation CEO → paiement Revolut programmé *(v1.2)*
11. ✅ Taux de rapprochement bancaire automatique ≥ 85% sur les 3'230 transactions existantes *(v1.2)*
12. ✅ Un avoir est générable en moins de 3 clics et conforme QR-Invoice *(v1.2)*

---

## 13. GLOSSAIRE

| Terme | Définition |
|---|---|
| **Lead** | Prospect ayant manifesté un intérêt pour les solutions HYPERVISUAL |
| **Prestataire** | Technicien ou société suisse/européenne exécutant les projets sur le terrain pour le compte de HYPERVISUAL |
| **Devis prestataire** | Offre de prix que le prestataire soumet à HYPERVISUAL pour une prestation spécifique |
| **Devis client** | Offre de prix que HYPERVISUAL soumet au client, incluant la marge de HYPERVISUAL |
| **Marge** | Différence entre le prix facturé au client et le coût total (prestataire + hardware + frais) |
| **Acompte** | Paiement partiel effectué à la signature du devis pour sécuriser la prestation |
| **QR-Invoice** | Format de facture suisse standardisé (ISO 20022 v2.3) incluant un code QR pour faciliter les virements bancaires |
| **Activation projet** | Moment où le projet devient officiellement actif dans les portails client et prestataire, déclenché par le paiement de l'acompte |
| **Facturation récurrente** | Facturation automatique mensuelle pour les contrats de maintenance, hébergement cloud, ou support |
| **Human in the Loop** | Point d'approbation humaine obligatoire dans un processus autrement automatisé |
| **Make.com / n8n / Directus Flows** | Plateformes d'automatisation candidates pour orchestrer les workflows inter-services — décision à prendre au moment de l'implémentation selon les besoins spécifiques de chaque workflow |
| **Type A/B/C/D** | Typologies de projets HYPERVISUAL (voir section 4.4) |
| **CGV** | Conditions Générales de Vente et de Location — document contractuel intégré au devis |
| **Jalon de facturation** | Étape prédéfinie d'un projet (Type C) déclenchant automatiquement la génération d'une facture intermédiaire *(v1.2)* |
| **Avoir / Note de crédit** | Document financier conforme CO émis en cas d'annulation ou de modification d'une facture, déduisant un montant dû au client *(v1.2)* |
| **MRR** | Monthly Recurring Revenue — chiffre d'affaires récurrent mensuel généré par les contrats d'abonnement actifs *(v1.2)* |
| **ARR** | Annual Recurring Revenue — annualisation du MRR, indicateur de stabilité des revenus récurrents *(v1.2)* |
| **Rapprochement bancaire** | Processus de mise en correspondance automatique entre les transactions Revolut reçues et les factures clients émises *(v1.2)* |
| **Ticket hors contrat** | Intervention de support qui dépasse les prestations incluses dans le contrat de maintenance d'un client, donnant lieu à facturation *(v1.2)* |
| **Régie** | Mode de facturation basé sur les heures travaillées (time & materials), par opposition à la facturation au forfait *(v1.2)* |

---

*Document généré en février 2026 — Version 1.2 enrichie avec 8 modules Finance avancés basés sur l'audit du repository existant.*  
*Aucun contenu de la v1.1 n'a été supprimé. Toutes les additions sont marquées *(v1.2)*.*  
*Version suivante prévue : Architecture Technique Détaillée (ATD) + Stories de Développement pour les 16 modules.*
