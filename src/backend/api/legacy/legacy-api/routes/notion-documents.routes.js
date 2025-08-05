/**
 * Notion Documents Routes
 * Routes spécifiques pour chaque type de document
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');
const DirectusAdapter = require('../adapters/directus-adapter');
const notionService = new DirectusAdapter();

const router = express.Router();

/**
 * POST /api/notion/save-facture-fournisseur
 * Sauvegarder une facture fournisseur
 */
router.post('/save-facture-fournisseur', [
    body('NuméroFacture').notEmpty().withMessage('Numéro de facture requis'),
    body('Fournisseur').notEmpty().withMessage('Fournisseur requis'),
    body('DateFacture').notEmpty().withMessage('Date facture requise'),
    body('MontantTTC').notEmpty().withMessage('Montant TTC requis')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const data = req.body;
        
        // Préparer les propriétés Notion
        const properties = {
            'Numéro Facture': {
                title: [{
                    text: { content: data.NuméroFacture }
                }]
            },
            'Fournisseur': {
                rich_text: [{
                    text: { content: data.Fournisseur }
                }]
            },
            'Date Facture': {
                date: {
                    start: data.DateFacture
                }
            },
            'Date Échéance': data.DateÉchéance ? {
                date: {
                    start: data.DateÉchéance
                }
            } : undefined,
            'Montant HT': data.MontantHT ? {
                number: parseFloat(data.MontantHT)
            } : undefined,
            'Montant TTC': {
                number: parseFloat(data.MontantTTC)
            },
            'TVA': data.TVA ? {
                number: parseFloat(data.TVA)
            } : undefined,
            'Taux TVA': data.TauxTVA ? {
                select: {
                    name: data.TauxTVA
                }
            } : undefined,
            'Devise': data.Devise ? {
                select: {
                    name: data.Devise
                }
            } : undefined,
            'Catégorie': data.Catégorie ? {
                select: {
                    name: data.Catégorie
                }
            } : undefined,
            'Entité Groupe': data.EntitéGroupe ? {
                select: {
                    name: data.EntitéGroupe
                }
            } : undefined,
            'Statut': {
                select: {
                    name: data.Statut || 'À valider'
                }
            }
        };

        // Nettoyer les propriétés undefined
        Object.keys(properties).forEach(key => 
            properties[key] === undefined && delete properties[key]
        );

        // Créer dans Notion
        const result = await notionService.createDocumentDirect(
            '237adb95-3c6f-80de-9f92-c795334e5561', // DB Factures Fournisseurs
            properties,
            data.fileUrl
        );

        logger.info('Facture fournisseur créée dans Notion', {
            notionId: result.notionPageId,
            numero: data.NuméroFacture
        });

        res.json(result);

    } catch (error) {
        logger.error('Erreur sauvegarde facture fournisseur:', error);
        res.status(500).json({
            error: 'Erreur lors de la sauvegarde',
            message: error.message
        });
    }
});

/**
 * POST /api/notion/save-facture-client
 * Sauvegarder une facture client
 */
router.post('/save-facture-client', [
    body('Client').notEmpty().withMessage('Client requis'),
    body('Numéro').notEmpty().withMessage('Numéro requis'),
    body('Date').notEmpty().withMessage('Date requise'),
    body('MontantTTC').notEmpty().withMessage('Montant TTC requis')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const data = req.body;
        
        // Préparer les propriétés Notion
        const properties = {
            'Titre': {
                title: [{
                    text: { content: data.Titre || `Facture ${data.Numéro}` }
                }]
            },
            'Client': {
                rich_text: [{
                    text: { content: data.Client }
                }]
            },
            'Numéro': {
                rich_text: [{
                    text: { content: data.Numéro }
                }]
            },
            'Date': {
                date: {
                    start: data.Date
                }
            },
            'Montant HT': data.MontantHT ? {
                number: parseFloat(data.MontantHT)
            } : undefined,
            'Montant TTC': {
                number: parseFloat(data.MontantTTC)
            },
            'TVA': data.TVA ? {
                number: parseFloat(data.TVA)
            } : undefined,
            'Devise': data.Devise ? {
                select: {
                    name: data.Devise
                }
            } : undefined,
            'Entité': data.Entité ? {
                select: {
                    name: data.Entité
                }
            } : undefined,
            'Statut': {
                select: {
                    name: data.Statut || 'Brouillon'
                }
            }
        };

        // Nettoyer les propriétés undefined
        Object.keys(properties).forEach(key => 
            properties[key] === undefined && delete properties[key]
        );

        // Créer dans Notion
        const result = await notionService.createDocumentDirect(
            '226adb95-3c6f-8011-a9bb-ca31f7da8e6a', // DB Factures Clients
            properties,
            data.fileUrl
        );

        logger.info('Facture client créée dans Notion', {
            notionId: result.notionPageId,
            numero: data.Numéro
        });

        res.json(result);

    } catch (error) {
        logger.error('Erreur sauvegarde facture client:', error);
        res.status(500).json({
            error: 'Erreur lors de la sauvegarde',
            message: error.message
        });
    }
});

/**
 * POST /api/notion/save-contrat
 * Sauvegarder un contrat
 */
router.post('/save-contrat', [
    body('NomContrat').notEmpty().withMessage('Nom du contrat requis'),
    body('PartieContractante').notEmpty().withMessage('Partie contractante requise'),
    body('DateDébut').notEmpty().withMessage('Date de début requise')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const data = req.body;
        
        // Préparer les propriétés Notion
        const properties = {
            'Nom Contrat': {
                title: [{
                    text: { content: data.NomContrat }
                }]
            },
            'Type Contrat': data.TypeContrat ? {
                select: {
                    name: data.TypeContrat
                }
            } : undefined,
            'Partie Contractante': {
                rich_text: [{
                    text: { content: data.PartieContractante }
                }]
            },
            'Valeur Contrat': data.ValeurContrat ? {
                number: parseFloat(data.ValeurContrat)
            } : undefined,
            'Devise': data.Devise ? {
                select: {
                    name: data.Devise
                }
            } : undefined,
            'Date Début': {
                date: {
                    start: data.DateDébut
                }
            },
            'Date Fin': data.DateFin ? {
                date: {
                    start: data.DateFin
                }
            } : undefined,
            'Durée': data.Durée ? {
                rich_text: [{
                    text: { content: data.Durée }
                }]
            } : undefined,
            'Juridiction': data.Juridiction ? {
                select: {
                    name: data.Juridiction
                }
            } : undefined,
            'Niveau Risque': data.NiveauRisque ? {
                select: {
                    name: data.NiveauRisque
                }
            } : undefined,
            'Entité Signataire': data.EntitéSignataire ? {
                select: {
                    name: data.EntitéSignataire
                }
            } : undefined,
            'Statut': {
                select: {
                    name: data.Statut || 'À signer'
                }
            }
        };

        // Nettoyer les propriétés undefined
        Object.keys(properties).forEach(key => 
            properties[key] === undefined && delete properties[key]
        );

        // Créer dans Notion
        const result = await notionService.createDocumentDirect(
            '22eadb95-3c6f-8099-81fe-d4890db02d9c', // DB Contrats
            properties,
            data.fileUrl
        );

        logger.info('Contrat créé dans Notion', {
            notionId: result.notionPageId,
            nom: data.NomContrat
        });

        res.json(result);

    } catch (error) {
        logger.error('Erreur sauvegarde contrat:', error);
        res.status(500).json({
            error: 'Erreur lors de la sauvegarde',
            message: error.message
        });
    }
});

/**
 * POST /api/notion/save-note-frais
 * Sauvegarder une note de frais
 */
router.post('/save-note-frais', [
    body('Description').notEmpty().withMessage('Description requise'),
    body('Montant').notEmpty().withMessage('Montant requis'),
    body('Date').notEmpty().withMessage('Date requise'),
    body('Employé').notEmpty().withMessage('Employé requis')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const data = req.body;
        
        // Préparer les propriétés Notion
        const properties = {
            'Description': {
                title: [{
                    text: { content: data.Description }
                }]
            },
            'Type Dépense': data.TypeDépense ? {
                select: {
                    name: data.TypeDépense
                }
            } : undefined,
            'Montant': {
                number: parseFloat(data.Montant)
            },
            'Devise': data.Devise ? {
                select: {
                    name: data.Devise
                }
            } : undefined,
            'Date': {
                date: {
                    start: data.Date
                }
            },
            'Employé': {
                rich_text: [{
                    text: { content: data.Employé }
                }]
            },
            'Client Refacturé': data.ClientRefacturé ? {
                rich_text: [{
                    text: { content: data.ClientRefacturé }
                }]
            } : undefined,
            'Projet': data.Projet ? {
                rich_text: [{
                    text: { content: data.Projet }
                }]
            } : undefined,
            'Statut': {
                select: {
                    name: data.Statut || 'À valider'
                }
            }
        };

        // Nettoyer les propriétés undefined
        Object.keys(properties).forEach(key => 
            properties[key] === undefined && delete properties[key]
        );

        // Créer dans Notion
        const result = await notionService.createDocumentDirect(
            '237adb95-3c6f-804b-a530-e44d07ac9f7b', // DB Notes de Frais
            properties,
            data.fileUrl
        );

        logger.info('Note de frais créée dans Notion', {
            notionId: result.notionPageId,
            description: data.Description
        });

        res.json(result);

    } catch (error) {
        logger.error('Erreur sauvegarde note de frais:', error);
        res.status(500).json({
            error: 'Erreur lors de la sauvegarde',
            message: error.message
        });
    }
});

module.exports = router;