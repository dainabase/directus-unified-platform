/**
 * Configuration Template pour OCR Hybrid
 * 
 * INSTRUCTIONS:
 * 1. Renommez ce fichier en 'config.js'
 * 2. Remplacez les valeurs par vos vraies clés
 * 3. NE JAMAIS commiter ce fichier sur Git !
 */

// Configuration OCR Hybrid
const OCR_CONFIG = {
    // Clé API OpenAI
    OPENAI_API_KEY: 'sk-proj-REMPLACEZ_PAR_VOTRE_CLE',
    
    // Clé API Notion (optionnel)
    NOTION_API_KEY: 'secret_REMPLACEZ_PAR_VOTRE_CLE',
    
    // IDs des bases de données Notion
    NOTION_DATABASES: {
        'FACTURES-CLIENTS': 'id_base_factures_clients',
        'FACTURES-FOURNISSEURS': 'id_base_factures_fournisseurs',
        'NOTES-FRAIS': 'id_base_notes_frais',
        'DB-ENTREPRISES': 'id_base_entreprises',
        'DB-CONTACTS': 'id_base_contacts',
        'DB-PROJETS': 'id_base_projets',
        'DB-ENTITES': 'id_base_entites_groupe'
    },
    
    // Configuration OpenAI
    OPENAI_MODEL: 'gpt-4o',
    OPENAI_TEMPERATURE: 0.1,
    OPENAI_MAX_TOKENS: 2000,
    
    // Options de debug
    DEBUG_MODE: true,
    LOG_API_CALLS: false
};

// Auto-configuration au chargement
if (typeof window !== 'undefined') {
    // Configurer OpenAI si pas déjà fait
    if (!localStorage.getItem('openai_api_key') && OCR_CONFIG.OPENAI_API_KEY !== 'sk-proj-REMPLACEZ_PAR_VOTRE_CLE') {
        localStorage.setItem('openai_api_key', OCR_CONFIG.OPENAI_API_KEY);
        console.log('✅ Clé OpenAI configurée depuis config.js');
    }
    
    // Rendre la config accessible globalement
    window.OCR_CONFIG = OCR_CONFIG;
}