const { Directus } = require('@directus/sdk');

async function updateDirectusSchema() {
  console.log('🔄 Mise à jour du schéma Directus pour Mautic...');
  
  const directus = new Directus('http://localhost:8055');
  
  try {
    // S'authentifier
    await directus.auth.static(process.env.DIRECTUS_TOKEN || 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW');
    
    // Ajouter les champs Mautic à la collection contacts
    const fieldsToAdd = [
      {
        collection: 'contacts',
        field: 'mautic_id',
        type: 'integer',
        meta: {
          interface: 'input',
          display: 'raw',
          readonly: true,
          hidden: false,
          sort: 50,
          width: 'half',
          group: 'marketing',
          note: 'ID du contact dans Mautic'
        },
        schema: {
          is_nullable: true,
          is_unique: false
        }
      },
      {
        collection: 'contacts',
        field: 'mautic_score',
        type: 'integer',
        meta: {
          interface: 'input',
          display: 'raw',
          readonly: true,
          hidden: false,
          sort: 51,
          width: 'half',
          group: 'marketing',
          note: 'Score du lead dans Mautic',
          display_options: {
            suffix: ' points'
          }
        },
        schema: {
          is_nullable: true,
          default_value: 0
        }
      },
      {
        collection: 'contacts',
        field: 'mautic_sync_date',
        type: 'timestamp',
        meta: {
          interface: 'datetime',
          display: 'datetime',
          readonly: true,
          hidden: false,
          sort: 52,
          width: 'half',
          group: 'marketing',
          note: 'Dernière synchronisation avec Mautic'
        },
        schema: {
          is_nullable: true
        }
      },
      {
        collection: 'contacts',
        field: 'mautic_last_active',
        type: 'timestamp',
        meta: {
          interface: 'datetime',
          display: 'datetime',
          readonly: true,
          hidden: false,
          sort: 53,
          width: 'half',
          group: 'marketing',
          note: 'Dernière activité dans Mautic'
        },
        schema: {
          is_nullable: true
        }
      },
      {
        collection: 'contacts',
        field: 'email_opted_in',
        type: 'boolean',
        meta: {
          interface: 'boolean',
          display: 'boolean',
          hidden: false,
          sort: 54,
          width: 'half',
          group: 'marketing',
          note: 'Consentement pour recevoir des emails marketing'
        },
        schema: {
          is_nullable: false,
          default_value: true
        }
      },
      {
        collection: 'contacts',
        field: 'marketing_tags',
        type: 'json',
        meta: {
          interface: 'tags',
          display: 'tags',
          hidden: false,
          sort: 55,
          width: 'full',
          group: 'marketing',
          note: 'Tags marketing pour segmentation'
        },
        schema: {
          is_nullable: true,
          default_value: '[]'
        }
      }
    ];
    
    // Créer les champs
    for (const field of fieldsToAdd) {
      try {
        await directus.fields.createOne(field.collection, field);
        console.log(`✅ Champ créé: ${field.field}`);
      } catch (error) {
        if (error.message && error.message.includes('already exists')) {
          console.log(`⚠️ Champ ${field.field} existe déjà`);
        } else {
          console.error(`❌ Erreur création champ ${field.field}:`, error.message);
        }
      }
    }
    
    // Créer un groupe de champs "Marketing" dans l'interface
    try {
      const contactsCollection = await directus.collections.readOne('contacts');
      const meta = contactsCollection.meta || {};
      
      if (!meta.display_template) {
        meta.display_template = '{{first_name}} {{last_name}}';
      }
      
      // Ajouter le groupe marketing si pas déjà présent
      if (!meta.group) {
        meta.group = {};
      }
      
      meta.group.marketing = {
        name: 'Marketing & Automation',
        icon: 'mail',
        color: '#9C27B0'
      };
      
      await directus.collections.updateOne('contacts', { meta });
      console.log('✅ Groupe Marketing ajouté à la collection contacts');
    } catch (error) {
      console.log('⚠️ Impossible de mettre à jour le groupe:', error.message);
    }
    
    console.log('\n✅ Schéma Directus mis à jour!');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter
if (require.main === module) {
  updateDirectusSchema().catch(console.error);
}

module.exports = updateDirectusSchema;