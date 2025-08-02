/**
 * Notion Integration Example - Exemple d'intégration avec l'API Notion
 * À implémenter avec les vraies credentials
 * @version 1.0.0
 */

class NotionIntegration {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.notion.com/v1';
        this.version = '2022-06-28';
        
        // IDs des bases de données Notion (à remplacer par les vrais IDs)
        this.databases = {
            'FACTURES-CLIENTS': 'db_id_factures_clients',
            'FACTURES-FOURNISSEURS': 'db_id_factures_fournisseurs',
            'NOTES-FRAIS': 'db_id_notes_frais',
            'DB-ENTREPRISES': 'db_id_entreprises',
            'DB-CONTACTS': 'db_id_contacts',
            'DB-PROJETS': 'db_id_projets',
            'DB-ENTITES': 'db_id_entites_groupe'
        };
    }

    /**
     * Headers pour les requêtes Notion
     */
    getHeaders() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Notion-Version': this.version
        };
    }

    /**
     * Créer une facture client dans Notion
     */
    async createFactureClient(data) {
        console.log('📤 Création facture client dans Notion...');
        
        try {
            // 1. Vérifier/créer le client s'il n'existe pas
            const clientId = await this.findOrCreateClient(data.Client);
            
            // 2. Préparer les propriétés Notion
            const properties = {
                "Numéro": {
                    "title": [
                        {
                            "text": {
                                "content": data["Numéro"] || ''
                            }
                        }
                    ]
                },
                "Type": {
                    "select": {
                        "name": data["Type"] || 'Facture'
                    }
                },
                "Client": {
                    "relation": [
                        {
                            "id": clientId
                        }
                    ]
                },
                "Date Émission": {
                    "date": {
                        "start": data["Date Émission"] || new Date().toISOString().split('T')[0]
                    }
                },
                "Date Échéance": {
                    "date": {
                        "start": data["Date Échéance"] || ''
                    }
                },
                "Prix Client HT": {
                    "number": data["Prix Client HT"] || 0
                },
                "TVA %": {
                    "select": {
                        "name": data["TVA %"] || '8.1'
                    }
                },
                "Montant TTC": {
                    "number": data["Montant TTC"] || 0
                },
                "Statut": {
                    "select": {
                        "name": data["Statut"] || 'Brouillon'
                    }
                },
                "Mode Paiement": {
                    "select": {
                        "name": data["Mode Paiement"] || 'Virement'
                    }
                },
                "Entreprise": {
                    "select": {
                        "name": data["Entreprise"] || 'HYPERVISUAL'
                    }
                }
            };
            
            // 3. Créer la page dans Notion
            const response = await fetch(`${this.baseUrl}/pages`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    parent: {
                        database_id: this.databases['FACTURES-CLIENTS']
                    },
                    properties: properties
                })
            });
            
            if (!response.ok) {
                throw new Error(`Notion API error: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('✅ Facture client créée:', result.id);
            
            // 4. Upload du fichier PDF si disponible
            if (data._file) {
                await this.uploadFile(result.id, data._file);
            }
            
            return result;
            
        } catch (error) {
            console.error('❌ Erreur création facture client:', error);
            throw error;
        }
    }

    /**
     * Créer une facture fournisseur dans Notion
     */
    async createFactureFournisseur(data) {
        console.log('📥 Création facture fournisseur dans Notion...');
        
        try {
            // 1. Vérifier/créer le fournisseur
            const fournisseurId = await this.findOrCreateFournisseur(data["Fournisseur"]);
            
            // 2. Trouver l'entité du groupe
            const entiteId = await this.findEntiteGroupe(data["Entité Groupe"]);
            
            // 3. Préparer les propriétés
            const properties = {
                "Numéro Facture": {
                    "title": [
                        {
                            "text": {
                                "content": data["Numéro Facture"] || ''
                            }
                        }
                    ]
                },
                "Fournisseur": {
                    "relation": [
                        {
                            "id": fournisseurId
                        }
                    ]
                },
                "Entité Groupe": {
                    "relation": [
                        {
                            "id": entiteId
                        }
                    ]
                },
                "Date Facture": {
                    "date": {
                        "start": data["Date Facture"] || ''
                    }
                },
                "Date Échéance": {
                    "date": {
                        "start": data["Date Échéance"] || ''
                    }
                },
                "Montant HT": {
                    "number": data["Montant HT"] || 0
                },
                "TVA": {
                    "number": data["TVA"] || 0
                },
                "Montant TTC": {
                    "number": data["Montant TTC"] || 0
                },
                "Taux TVA": {
                    "select": {
                        "name": data["Taux TVA"] || '8.1%'
                    }
                },
                "Statut": {
                    "select": {
                        "name": data["Statut"] || 'À valider'
                    }
                },
                "Catégorie": {
                    "select": {
                        "name": data["Catégorie"] || 'Services'
                    }
                },
                "Document OCR": {
                    "rich_text": [
                        {
                            "text": {
                                "content": data["Document OCR"] || ''
                            }
                        }
                    ]
                }
            };
            
            // 4. Créer dans Notion
            const response = await fetch(`${this.baseUrl}/pages`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    parent: {
                        database_id: this.databases['FACTURES-FOURNISSEURS']
                    },
                    properties: properties
                })
            });
            
            if (!response.ok) {
                throw new Error(`Notion API error: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('✅ Facture fournisseur créée:', result.id);
            
            return result;
            
        } catch (error) {
            console.error('❌ Erreur création facture fournisseur:', error);
            throw error;
        }
    }

    /**
     * Rechercher ou créer un client
     */
    async findOrCreateClient(clientName) {
        if (!clientName) return null;
        
        console.log(`🔍 Recherche client: ${clientName}`);
        
        try {
            // 1. Rechercher le client existant
            const searchResponse = await fetch(`${this.baseUrl}/databases/${this.databases['DB-ENTREPRISES']}/query`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    filter: {
                        property: "Nom",
                        title: {
                            contains: clientName
                        }
                    }
                })
            });
            
            const searchResults = await searchResponse.json();
            
            if (searchResults.results && searchResults.results.length > 0) {
                console.log('✅ Client trouvé:', searchResults.results[0].id);
                return searchResults.results[0].id;
            }
            
            // 2. Créer le client s'il n'existe pas
            console.log('📝 Création nouveau client...');
            
            const createResponse = await fetch(`${this.baseUrl}/pages`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    parent: {
                        database_id: this.databases['DB-ENTREPRISES']
                    },
                    properties: {
                        "Nom": {
                            "title": [
                                {
                                    "text": {
                                        "content": clientName
                                    }
                                }
                            ]
                        },
                        "Type": {
                            "select": {
                                "name": "Client"
                            }
                        },
                        "Statut": {
                            "select": {
                                "name": "Actif"
                            }
                        }
                    }
                })
            });
            
            const newClient = await createResponse.json();
            console.log('✅ Nouveau client créé:', newClient.id);
            
            return newClient.id;
            
        } catch (error) {
            console.error('❌ Erreur recherche/création client:', error);
            return null;
        }
    }

    /**
     * Rechercher ou créer un fournisseur
     */
    async findOrCreateFournisseur(fournisseurName) {
        // Logique similaire à findOrCreateClient
        // mais avec Type = "Fournisseur"
        return await this.findOrCreateClient(fournisseurName);
    }

    /**
     * Trouver l'ID de l'entité du groupe
     */
    async findEntiteGroupe(entityName) {
        if (!entityName) return null;
        
        console.log(`🔍 Recherche entité groupe: ${entityName}`);
        
        try {
            const response = await fetch(`${this.baseUrl}/databases/${this.databases['DB-ENTITES']}/query`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    filter: {
                        property: "Nom",
                        title: {
                            contains: entityName
                        }
                    }
                })
            });
            
            const results = await response.json();
            
            if (results.results && results.results.length > 0) {
                return results.results[0].id;
            }
            
            console.warn('⚠️ Entité non trouvée:', entityName);
            return null;
            
        } catch (error) {
            console.error('❌ Erreur recherche entité:', error);
            return null;
        }
    }

    /**
     * Upload d'un fichier dans une page Notion
     */
    async uploadFile(pageId, file) {
        console.log(`📎 Upload fichier: ${file.name}`);
        
        // NOTE: L'API Notion ne supporte pas directement l'upload de fichiers
        // Il faut d'abord uploader sur un service externe (S3, Cloudinary, etc.)
        // puis ajouter l'URL dans Notion
        
        // Exemple avec un service d'upload fictif:
        /*
        const uploadUrl = await this.uploadToStorage(file);
        
        // Ajouter l'URL dans la propriété Files de la page
        await fetch(`${this.baseUrl}/pages/${pageId}`, {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify({
                properties: {
                    "Fichier PDF": {
                        "files": [
                            {
                                "name": file.name,
                                "external": {
                                    "url": uploadUrl
                                }
                            }
                        ]
                    }
                }
            })
        });
        */
        
        console.log('⚠️ Upload fichier: à implémenter avec service externe');
    }

    /**
     * Créer une note de frais
     */
    async createNoteFrais(data) {
        console.log('🧾 Création note de frais dans Notion...');
        
        // Logique similaire aux factures
        // À implémenter selon les besoins
    }

    /**
     * Test de connexion
     */
    async testConnection() {
        try {
            const response = await fetch(`${this.baseUrl}/users/me`, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Connexion échouée');
            }
            
            const user = await response.json();
            console.log('✅ Connexion Notion OK:', user.name);
            return true;
            
        } catch (error) {
            console.error('❌ Erreur connexion Notion:', error);
            return false;
        }
    }
}

// Exemple d'utilisation
/*
// 1. Initialiser avec la clé API
const notion = new NotionIntegration('secret_xxxxx');

// 2. Tester la connexion
await notion.testConnection();

// 3. Créer une facture depuis les données OCR
const ocrData = {
    "Numéro": "FAC-2025-001",
    "Client": "ACME Corp",
    "Date Émission": "2025-01-07",
    "Montant TTC": 5000,
    // ...
};

await notion.createFactureClient(ocrData);
*/

// Export
window.NotionIntegration = NotionIntegration;