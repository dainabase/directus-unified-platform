<?php
/**
 * Configuration Notion - NE PAS COMMITER CE FICHIER
 * Ajoutez ce fichier à .gitignore
 */

// Clé d'intégration Notion
define('NOTION_INTEGRATION_TOKEN', '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');

// Configuration des databases (à mettre à jour avec vos IDs réels)
define('NOTION_DATABASES', [
    'FACTURE_CLIENT' => '226adb95-3c6f-8011-a9bb-ca31f7da8e6a',
    'FACTURE_FOURNISSEUR' => '237adb95-3c6f-80de-9f92-c795334e5561',
    'NOTE_FRAIS' => '237adb95-3c6f-804b-a530-e44d07ac9f7b',
    'CONTRAT' => '22eadb95-3c6f-8099-81fe-d4890db02d9c',
    'DOCUMENT_GENERAL' => '230adb95-3c6f-80eb-9903-ff117c2a518f',
    'TRANSACTION_BANCAIRE' => '237adb95-3c6f-803c-9ead-e6156b991db4'
]);