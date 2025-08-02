// Configuration complète du mapping 62 bases Notion → 48 collections Directus
// Avec stratégies de fusion et optimisations

export const MIGRATION_CONFIG = {
  // Configuration globale
  global: {
    batch_size: 50,
    retry_attempts: 3,
    deduplication_fields: ['email', 'name', 'code'],
    default_status: 'active',
    preserve_notion_ids: true
  },

  // Module 1: CRM & Contacts (12→8)
  crm: {
    companies: {
      notion_sources: [
        'DB-CONTACTS-ENTREPRISES',
        'DB-CLIENTS-ENTREPRISES'
      ],
      merge_strategy: 'deduplicate',
      dedupe_key: 'email',
      field_mapping: {
        'Nom': 'name',
        'Email': 'email',
        'Téléphone': 'phone',
        'Site Web': 'website',
        'Adresse': 'address',
        'Type': {
          field: 'type',
          transform: (value) => {
            const typeMap = {
              'Client': 'client',
              'Prospect': 'prospect',
              'Fournisseur': 'supplier',
              'Partenaire': 'partner'
            };
            return typeMap[value] || 'prospect';
          }
        },
        'Statut': {
          field: 'status',
          default: 'active'
        },
        'Secteur': {
          field: 'sector',
          relation: 'sectors'
        }
      },
      post_process: async (item) => {
        // Générer un code unique si manquant
        if (!item.code) {
          item.code = `CMP-${item.name.substring(0, 3).toUpperCase()}-${Date.now()}`;
        }
        return item;
      }
    },

    people: {
      notion_sources: [
        'DB-CONTACTS-PERSONNES',
        'DB-CLIENTS-CONTACTS'
      ],
      merge_strategy: 'deduplicate',
      dedupe_key: 'email',
      field_mapping: {
        'Prénom': 'first_name',
        'Nom': 'last_name',
        'Email': 'email',
        'Téléphone': 'phone',
        'Mobile': 'mobile',
        'Fonction': 'job_title',
        'Entreprise': {
          field: 'company',
          relation: 'companies',
          match_by: 'name'
        },
        'Type': {
          field: 'type',
          transform: (value) => {
            const typeMap = {
              'Employé': 'employee',
              'Contact': 'contact',
              'Freelance': 'freelance'
            };
            return typeMap[value] || 'contact';
          }
        }
      }
    },

    providers: {
      notion_sources: [
        'DB-PRESTATAIRES',
        'DB-PRESTATAIRES-CONTACTS'
      ],
      merge_strategy: 'merge_by_company',
      field_mapping: {
        'Entreprise': {
          field: 'company',
          relation: 'companies',
          required: true
        },
        'Spécialités': {
          field: 'specialties',
          relation: 'specialties',
          type: 'm2m'
        },
        'Note': 'rating',
        'Certifications': {
          field: 'certifications',
          type: 'json'
        }
      }
    },

    partners: {
      notion_sources: [
        'DB-REVENDEURS',
        'DB-PARTENAIRES'
      ],
      merge_strategy: 'deduplicate',
      dedupe_key: 'company_name',
      field_mapping: {
        'Entreprise': {
          field: 'company',
          relation: 'companies',
          required: true
        },
        'Type Partenariat': {
          field: 'partnership_type',
          transform: (value) => {
            const typeMap = {
              'Revendeur': 'reseller',
              'Affilié': 'affiliate',
              'Stratégique': 'strategic'
            };
            return typeMap[value] || 'reseller';
          }
        },
        'Taux Commission': 'commission_rate',
        'Territoires': {
          field: 'territories',
          relation: 'territories',
          type: 'm2m'
        }
      }
    }
  },

  // Module 2: Finance & Facturation (10→7)
  finance: {
    invoices: {
      notion_sources: [
        'DB-FACTURES',
        'DB-FACTURES-ARCHIVES'
      ],
      merge_strategy: 'keep_all', // Garder toutes les factures
      field_mapping: {
        'Numéro': 'number',
        'Date': 'date',
        'Date Échéance': 'due_date',
        'Client': {
          field: 'company',
          relation: 'companies',
          match_by: 'name'
        },
        'Montant HT': 'amount_ht',
        'Montant TTC': 'amount_ttc',
        'Statut': {
          field: 'status',
          transform: (value) => {
            const statusMap = {
              'Brouillon': 'draft',
              'Envoyée': 'sent',
              'Payée': 'paid',
              'En retard': 'overdue',
              'Annulée': 'cancelled'
            };
            return statusMap[value] || 'draft';
          }
        },
        'Type': {
          field: 'type',
          default: 'invoice'
        }
      },
      post_process: async (item) => {
        // Calculer le statut si date échue
        if (item.status === 'sent' && new Date(item.due_date) < new Date()) {
          item.status = 'overdue';
        }
        return item;
      }
    },

    quotes: {
      notion_sources: [
        'DB-DEVIS',
        'DB-PROPOSITIONS'
      ],
      merge_strategy: 'deduplicate',
      dedupe_key: 'number',
      field_mapping: {
        'Numéro': 'number',
        'Date': 'date',
        'Validité': 'valid_until',
        'Client': {
          field: 'company',
          relation: 'companies',
          match_by: 'name'
        },
        'Montant HT': 'amount_ht',
        'Montant TTC': 'amount_ttc',
        'Statut': {
          field: 'status',
          transform: (value) => {
            const statusMap = {
              'Brouillon': 'draft',
              'Envoyé': 'sent',
              'Accepté': 'accepted',
              'Refusé': 'rejected',
              'Expiré': 'expired'
            };
            return statusMap[value] || 'draft';
          }
        },
        'Facture Liée': {
          field: 'converted_to',
          relation: 'invoices',
          match_by: 'number'
        }
      }
    },

    payments: {
      notion_sources: [
        'DB-PAIEMENTS',
        'DB-TRANSACTIONS'
      ],
      merge_strategy: 'keep_all',
      field_mapping: {
        'Référence': 'reference',
        'Date': 'date',
        'Montant': 'amount',
        'Méthode': {
          field: 'method',
          transform: (value) => {
            const methodMap = {
              'Virement': 'bank_transfer',
              'CB': 'credit_card',
              'Carte': 'credit_card',
              'Chèque': 'check',
              'Espèces': 'cash'
            };
            return methodMap[value] || 'bank_transfer';
          }
        },
        'Statut': {
          field: 'status',
          transform: (value) => {
            const statusMap = {
              'En attente': 'pending',
              'Complété': 'completed',
              'Terminé': 'completed',
              'Échoué': 'failed',
              'Remboursé': 'refunded'
            };
            return statusMap[value] || 'pending';
          }
        },
        'Facture': {
          field: 'invoice',
          relation: 'invoices',
          match_by: 'number'
        },
        'Données Transaction': {
          field: 'transaction_data',
          type: 'json'
        }
      }
    }
  },

  // Module 3: Projets & Tâches (8→6)
  projects: {
    projects: {
      notion_sources: [
        'DB-PROJETS',
        'DB-PROJETS-TEMPLATES'
      ],
      merge_strategy: 'keep_all',
      field_mapping: {
        'Nom': 'name',
        'Code': 'code',
        'Description': 'description',
        'Statut': {
          field: 'status',
          transform: (value) => {
            const statusMap = {
              'Planification': 'planning',
              'Actif': 'active',
              'En cours': 'active',
              'En pause': 'on_hold',
              'Terminé': 'completed',
              'Annulé': 'cancelled'
            };
            return statusMap[value] || 'planning';
          }
        },
        'Type': {
          field: 'type',
          transform: (value) => {
            if (value === 'Template') return 'template';
            if (value === 'Interne') return 'internal';
            return 'client';
          }
        },
        'Client': {
          field: 'company',
          relation: 'companies',
          match_by: 'name'
        },
        'Chef de Projet': {
          field: 'manager',
          relation: 'people',
          match_by: 'email'
        },
        'Budget': 'budget',
        'Progression': {
          field: 'progress',
          transform: (value) => parseInt(value) || 0
        }
      }
    },

    tasks: {
      notion_sources: [
        'DB-TACHES',
        'DB-SOUS-TACHES'
      ],
      merge_strategy: 'keep_all_with_hierarchy',
      field_mapping: {
        'Titre': 'title',
        'Description': 'description',
        'Projet': {
          field: 'project',
          relation: 'projects',
          match_by: 'code'
        },
        'Tâche Parente': {
          field: 'parent_task',
          relation: 'tasks',
          match_by: 'notion_id'
        },
        'Assigné à': {
          field: 'assigned_to',
          relation: 'people',
          match_by: 'email'
        },
        'Statut': {
          field: 'status',
          transform: (value) => {
            const statusMap = {
              'À faire': 'todo',
              'En cours': 'in_progress',
              'En révision': 'review',
              'Terminé': 'done',
              'Bloqué': 'blocked'
            };
            return statusMap[value] || 'todo';
          }
        },
        'Priorité': {
          field: 'priority',
          transform: (value) => {
            const priorityMap = {
              'Basse': 'low',
              'Normale': 'medium',
              'Haute': 'high',
              'Critique': 'critical'
            };
            return priorityMap[value] || 'medium';
          }
        },
        'Date Échéance': 'due_date',
        'Temps Passé': {
          field: 'time_tracked',
          transform: (value) => {
            // Convertir en minutes
            if (typeof value === 'string' && value.includes('h')) {
              const [hours, minutes] = value.split('h');
              return (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0);
            }
            return parseInt(value) || 0;
          }
        }
      }
    },

    milestones: {
      notion_sources: ['DB-MILESTONES'],
      merge_strategy: 'keep_all',
      field_mapping: {
        'Nom': 'name',
        'Projet': {
          field: 'project',
          relation: 'projects',
          match_by: 'code'
        },
        'Date Cible': 'target_date',
        'Date Réelle': 'actual_date',
        'Statut': {
          field: 'status',
          transform: (value) => {
            return value === 'Atteint' ? 'completed' : 'pending';
          }
        }
      }
    }
  },

  // Module 4: Documents & Médias (6→4)
  documents: {
    documents: {
      notion_sources: [
        'DB-DOCUMENTS',
        'DB-FICHIERS',
        'DB-MEDIAS'
      ],
      merge_strategy: 'keep_all',
      field_mapping: {
        'Titre': 'title',
        'Type': {
          field: 'type',
          transform: (value) => {
            const typeMap = {
              'Contrat': 'contract',
              'Facture': 'invoice',
              'Rapport': 'report',
              'Média': 'media',
              'Image': 'media',
              'Vidéo': 'media',
              'Template': 'template',
              'Modèle': 'template'
            };
            return typeMap[value] || 'other';
          }
        },
        'Fichier': {
          field: 'file',
          type: 'file',
          download: true // Télécharger depuis Notion
        },
        'Taille': 'size',
        'Tags': {
          field: 'tags',
          relation: 'tags',
          type: 'm2m',
          create_if_missing: true
        },
        'Entité Liée': {
          field: 'entity_type',
          transform: (value) => {
            // Déterminer le type d'entité
            if (value?.includes('Facture')) return 'invoices';
            if (value?.includes('Projet')) return 'projects';
            if (value?.includes('Client')) return 'companies';
            return null;
          }
        }
      },
      post_process: async (item, context) => {
        // Ajouter OCR pour les documents scannés
        if (item.type === 'invoice' && item.file) {
          item.ocr_required = true;
        }
        
        // Calculer le mime_type
        if (item.file) {
          const ext = item.file.split('.').pop()?.toLowerCase();
          const mimeTypes = {
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png'
          };
          item.mime_type = mimeTypes[ext] || 'application/octet-stream';
        }
        
        return item;
      }
    }
  },

  // Collections système
  system: {
    tags: {
      auto_create: true,
      fields: {
        name: { type: 'string', unique: true },
        color: { type: 'string', default: '#2196F3' },
        usage_count: { type: 'integer', default: 0 }
      }
    },
    
    sectors: {
      notion_sources: ['DB-SECTEURS'],
      field_mapping: {
        'Nom': 'name',
        'Code': 'code',
        'Description': 'description'
      }
    },
    
    specialties: {
      notion_sources: ['DB-SPECIALITES'],
      field_mapping: {
        'Nom': 'name',
        'Catégorie': 'category',
        'Description': 'description'
      }
    },
    
    territories: {
      notion_sources: ['DB-TERRITOIRES'],
      field_mapping: {
        'Nom': 'name',
        'Région': 'region',
        'Pays': 'country',
        'Code': 'code'
      }
    }
  }
};

// Fonction helper pour obtenir toutes les collections à créer
export function getAllCollections() {
  const collections = [];
  
  Object.values(MIGRATION_CONFIG).forEach(module => {
    if (typeof module === 'object' && !Array.isArray(module)) {
      Object.keys(module).forEach(collectionName => {
        if (collectionName !== 'global') {
          collections.push(collectionName);
        }
      });
    }
  });
  
  return collections;
}

// Fonction pour obtenir le mapping d'une base Notion spécifique
export function getNotionMapping(notionDbName) {
  const mappings = [];
  
  Object.entries(MIGRATION_CONFIG).forEach(([moduleName, module]) => {
    if (typeof module === 'object' && !Array.isArray(module)) {
      Object.entries(module).forEach(([collectionName, config]) => {
        if (config.notion_sources?.includes(notionDbName)) {
          mappings.push({
            module: moduleName,
            collection: collectionName,
            config: config
          });
        }
      });
    }
  });
  
  return mappings;
}

// Export pour les tests
export default MIGRATION_CONFIG;
