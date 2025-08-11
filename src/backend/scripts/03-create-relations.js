#!/usr/bin/env node

/**
 * 🔗 SCRIPT DE CRÉATION DES RELATIONS ENTRE COLLECTIONS
 * 
 * Mission : Établir les liens logiques entre toutes les collections
 * pour créer un écosystème de données cohérent et interconnecté
 */

import { Directus } from '@directus/sdk';

// Configuration Directus
const DIRECTUS_URL = 'http://localhost:8055';
const DIRECTUS_TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

// Mode dry-run par défaut
const DRY_RUN = process.argv.includes('--dry-run') || !process.argv.includes('--execute');

let stats = {
    relations_created: 0,
    items_updated: 0,
    collections_processed: 0,
    errors: 0
};

// Types de relations à créer
const RELATION_TYPES = {
    // Relations principales
    CONTACT_TO_COMPANY: 'contact_company',
    LEAD_TO_CONTACT: 'lead_contact', 
    PROJECT_TO_CLIENT: 'project_client',
    TASK_TO_PROJECT: 'task_project',
    INVOICE_TO_PROJECT: 'invoice_project',
    DOCUMENT_TO_PROJECT: 'document_project',
    
    // Relations secondaires
    MEETING_TO_CONTACT: 'meeting_contact',
    OPPORTUNITY_TO_LEAD: 'opportunity_lead',
    QUOTE_TO_OPPORTUNITY: 'quote_opportunity',
    SERVICE_TO_COMPANY: 'service_company',
    
    // Relations métier
    CAMPAIGN_TO_LEADS: 'campaign_leads',
    ACTIVITY_TO_ENTITY: 'activity_entity',
    NOTE_TO_ENTITY: 'note_entity'
};

async function initDirectus() {
    console.log('🔗 Connexion à Directus...');
    const directus = new Directus(DIRECTUS_URL);
    
    try {
        await directus.auth.static(DIRECTUS_TOKEN);
        await directus.items('directus_collections').readByQuery({ limit: 1 });
        console.log('✅ Connexion Directus établie');
        return directus;
    } catch (error) {
        console.error('❌ Erreur connexion Directus:', error.message);
        process.exit(1);
    }
}

async function getItemsByCompany(directus, collection, ownerCompanyId) {
    try {
        const response = await directus.items(collection).readByQuery({
            filter: { owner_company: { _eq: ownerCompanyId } },
            limit: -1
        });
        const items = response.data || response;
        return items || [];
    } catch (error) {
        console.log(`   ⚠️  Collection "${collection}" non accessible:`, error.message);
        return [];
    }
}

async function linkContactsToCompanies(directus, companies) {
    console.log('\n👥 Liaison des contacts aux entreprises...');
    
    for (const company of companies) {
        const contacts = await getItemsByCompany(directus, 'contacts', company.id);
        
        console.log(`   🏢 ${company.name}: ${contacts.length} contacts`);
        
        for (const contact of contacts) {
            if (!contact.company) {
                try {
                    if (!DRY_RUN) {
                        await directus.items('contacts').updateOne(contact.id, {
                            company: company.id,
                            updated_at: new Date().toISOString()
                        });
                    }
                    stats.items_updated++;
                    console.log(`      ✅ ${contact.first_name} ${contact.last_name} → ${company.name}`);
                } catch (error) {
                    console.error(`      ❌ Erreur liaison contact ${contact.id}:`, error.message);
                    stats.errors++;
                }
            }
        }
        stats.relations_created += contacts.length;
    }
}

async function linkLeadsToContacts(directus, companies) {
    console.log('\n🎯 Liaison des leads aux contacts...');
    
    for (const company of companies) {
        const leads = await getItemsByCompany(directus, 'leads', company.id);
        const contacts = await getItemsByCompany(directus, 'contacts', company.id);
        
        console.log(`   🏢 ${company.name}: ${leads.length} leads, ${contacts.length} contacts`);
        
        if (contacts.length === 0) continue;
        
        for (let i = 0; i < leads.length; i++) {
            const lead = leads[i];
            const contact = contacts[i % contacts.length]; // Rotation des contacts
            
            if (!lead.contact) {
                try {
                    if (!DRY_RUN) {
                        await directus.items('leads').updateOne(lead.id, {
                            contact: contact.id,
                            updated_at: new Date().toISOString()
                        });
                    }
                    stats.items_updated++;
                    console.log(`      ✅ Lead "${lead.title}" → ${contact.first_name} ${contact.last_name}`);
                } catch (error) {
                    console.error(`      ❌ Erreur liaison lead ${lead.id}:`, error.message);
                    stats.errors++;
                }
            }
        }
        stats.relations_created += leads.length;
    }
}

async function linkProjectsToClients(directus, companies) {
    console.log('\n📋 Liaison des projets aux clients...');
    
    for (const company of companies) {
        const projects = await getItemsByCompany(directus, 'projects', company.id);
        const contacts = await getItemsByCompany(directus, 'contacts', company.id);
        
        console.log(`   🏢 ${company.name}: ${projects.length} projets`);
        
        for (let i = 0; i < projects.length; i++) {
            const project = projects[i];
            const contact = contacts.length > 0 ? contacts[i % contacts.length] : null;
            
            const updates = {
                client_company: company.id,
                updated_at: new Date().toISOString()
            };
            
            if (contact && !project.client_contact) {
                updates.client_contact = contact.id;
            }
            
            try {
                if (!DRY_RUN) {
                    await directus.items('projects').updateOne(project.id, updates);
                }
                stats.items_updated++;
                console.log(`      ✅ Projet "${project.name}" → Client: ${company.name}`);
            } catch (error) {
                console.error(`      ❌ Erreur liaison projet ${project.id}:`, error.message);
                stats.errors++;
            }
        }
        stats.relations_created += projects.length;
    }
}

async function linkTasksToProjects(directus, companies) {
    console.log('\n✅ Liaison des tâches aux projets...');
    
    for (const company of companies) {
        const tasks = await getItemsByCompany(directus, 'tasks', company.id);
        const projects = await getItemsByCompany(directus, 'projects', company.id);
        const contacts = await getItemsByCompany(directus, 'contacts', company.id);
        
        console.log(`   🏢 ${company.name}: ${tasks.length} tâches, ${projects.length} projets`);
        
        if (projects.length === 0) continue;
        
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            const project = projects[i % projects.length]; // Rotation des projets
            const contact = contacts.length > 0 ? contacts[i % contacts.length] : null;
            
            const updates = {
                updated_at: new Date().toISOString()
            };
            
            if (!task.project) {
                updates.project = project.id;
            }
            
            if (contact && !task.assigned_to) {
                updates.assigned_to = contact.id;
            }
            
            try {
                if (!DRY_RUN) {
                    await directus.items('tasks').updateOne(task.id, updates);
                }
                stats.items_updated++;
                console.log(`      ✅ Tâche "${task.name}" → Projet: ${project.name}`);
            } catch (error) {
                console.error(`      ❌ Erreur liaison tâche ${task.id}:`, error.message);
                stats.errors++;
            }
        }
        stats.relations_created += tasks.length;
    }
}

async function linkInvoicesToProjects(directus, companies) {
    console.log('\n🧾 Liaison des factures aux projets...');
    
    for (const company of companies) {
        const invoices = await getItemsByCompany(directus, 'invoices', company.id);
        const projects = await getItemsByCompany(directus, 'projects', company.id);
        
        console.log(`   🏢 ${company.name}: ${invoices.length} factures, ${projects.length} projets`);
        
        for (let i = 0; i < invoices.length; i++) {
            const invoice = invoices[i];
            const project = projects.length > 0 ? projects[i % projects.length] : null;
            
            if (project && !invoice.project) {
                try {
                    if (!DRY_RUN) {
                        await directus.items('invoices').updateOne(invoice.id, {
                            project: project.id,
                            updated_at: new Date().toISOString()
                        });
                    }
                    stats.items_updated++;
                    console.log(`      ✅ Facture "${invoice.invoice_number}" → Projet: ${project.name}`);
                } catch (error) {
                    console.error(`      ❌ Erreur liaison facture ${invoice.id}:`, error.message);
                    stats.errors++;
                }
            }
        }
        stats.relations_created += invoices.length;
    }
}

async function createMeetings(directus, companies) {
    console.log('\n📅 Création de réunions et liaison aux contacts...');
    
    const meetingTemplates = [
        {
            title: 'Réunion de lancement projet',
            description: 'Présentation équipe et définition objectifs',
            duration: 60,
            type: 'project_kickoff'
        },
        {
            title: 'Point d\'avancement hebdomadaire',
            description: 'Revue des livrables et planning',
            duration: 30,
            type: 'status_update'
        },
        {
            title: 'Validation finale client',
            description: 'Présentation résultats et validation',
            duration: 90,
            type: 'client_review'
        }
    ];
    
    for (const company of companies) {
        const contacts = await getItemsByCompany(directus, 'contacts', company.id);
        const projects = await getItemsByCompany(directus, 'projects', company.id);
        
        if (contacts.length === 0) continue;
        
        for (let i = 0; i < Math.min(2, meetingTemplates.length); i++) {
            const template = meetingTemplates[i];
            const contact = contacts[0];
            const project = projects.length > 0 ? projects[0] : null;
            
            const meeting = {
                ...template,
                attendee_contact: contact.id,
                owner_company: company.id,
                project: project?.id,
                date: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
                status: i === 0 ? 'completed' : 'scheduled',
                created_at: new Date().toISOString()
            };
            
            try {
                if (!DRY_RUN) {
                    await directus.items('meetings').createOne(meeting);
                }
                console.log(`      ✅ Réunion "${meeting.title}" → ${contact.first_name} ${contact.last_name}`);
                stats.relations_created++;
            } catch (error) {
                // Ignore si collection meetings n'existe pas
                if (!error.message.includes('not found')) {
                    console.error(`      ❌ Erreur création réunion:`, error.message);
                    stats.errors++;
                }
            }
        }
    }
}

async function createActivities(directus, companies) {
    console.log('\n📱 Création d\'activités et notes...');
    
    const activityTemplates = [
        { type: 'call', description: 'Appel téléphonique de suivi' },
        { type: 'email', description: 'Envoi proposition commerciale' },
        { type: 'meeting', description: 'Rendez-vous client sur site' },
        { type: 'task', description: 'Préparation documentation technique' }
    ];
    
    for (const company of companies) {
        const contacts = await getItemsByCompany(directus, 'contacts', company.id);
        
        for (const contact of contacts.slice(0, 2)) { // Limiter à 2 contacts par entreprise
            for (let i = 0; i < 2; i++) {
                const template = activityTemplates[i % activityTemplates.length];
                
                const activity = {
                    type: template.type,
                    description: template.description,
                    contact: contact.id,
                    owner_company: company.id,
                    date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'completed',
                    created_at: new Date().toISOString()
                };
                
                try {
                    if (!DRY_RUN) {
                        await directus.items('activities').createOne(activity);
                    }
                    console.log(`      ✅ Activité "${activity.type}" → ${contact.first_name} ${contact.last_name}`);
                    stats.relations_created++;
                } catch (error) {
                    // Ignore si collection activities n'existe pas
                    if (!error.message.includes('not found')) {
                        console.error(`      ❌ Erreur création activité:`, error.message);
                        stats.errors++;
                    }
                }
            }
        }
    }
}

async function main() {
    console.log('🔗 CRÉATION DES RELATIONS ENTRE COLLECTIONS');
    console.log('============================================\n');
    
    if (DRY_RUN) {
        console.log('🔍 MODE DRY-RUN ACTIVÉ - Aucune modification réelle');
        console.log('💡 Utilisez --execute pour créer les relations\n');
    } else {
        console.log('⚠️  MODE EXÉCUTION - Les relations seront RÉELLES\n');
    }
    
    const directus = await initDirectus();
    
    // Récupérer les 5 entreprises propriétaires
    console.log('🏢 Récupération des entreprises propriétaires...');
    const response = await directus.items('companies').readByQuery({
        filter: {
            name: { 
                _in: ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'TAKEOUT'] 
            }
        },
        limit: -1
    });
    const companies = response.data || response;
    
    console.log(`   ✅ ${companies.length} entreprises trouvées`);
    if (companies.length === 0) {
        console.error('❌ Aucune entreprise propriétaire trouvée. Créez d\'abord les données avec le script 02.');
        process.exit(1);
    }
    
    // Créer les relations principales
    await linkContactsToCompanies(directus, companies);
    await linkLeadsToContacts(directus, companies);
    await linkProjectsToClients(directus, companies);
    await linkTasksToProjects(directus, companies);
    await linkInvoicesToProjects(directus, companies);
    
    // Créer du contenu supplémentaire avec relations
    await createMeetings(directus, companies);
    await createActivities(directus, companies);
    
    stats.collections_processed = 7; // Nombre de types de relations créées
    
    // Statistiques finales
    console.log('\n✅ CRÉATION DES RELATIONS TERMINÉE');
    console.log('==================================');
    console.log(`Entreprises traitées: ${companies.length}`);
    console.log(`Types de relations: ${stats.collections_processed}`);
    console.log(`Relations créées: ${stats.relations_created}`);
    console.log(`Items mis à jour: ${stats.items_updated}`);
    
    if (stats.errors > 0) {
        console.log(`\n⚠️  ${stats.errors} erreur(s) rencontrée(s)`);
    }
    
    if (DRY_RUN) {
        console.log('\n💡 Relancer avec --execute pour créer les relations réelles');
    } else {
        console.log('\n🎯 Relations créées avec succès!');
        console.log('\n🔍 Résumé des relations établies:');
        console.log('   👥 Contacts → Entreprises');
        console.log('   🎯 Leads → Contacts');
        console.log('   📋 Projets → Clients');
        console.log('   ✅ Tâches → Projets');
        console.log('   🧾 Factures → Projets');
        console.log('   📅 Réunions → Contacts & Projets');
        console.log('   📱 Activités → Contacts');
    }
}

// Gestion des erreurs
process.on('uncaughtException', (error) => {
    console.error('\n💥 Erreur critique:', error.message);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    console.error('\n💥 Promesse rejetée:', error.message);
    process.exit(1);
});

// Lancement du script
main().catch(error => {
    console.error('\n💥 Erreur lors de l\'exécution:', error.message);
    process.exit(1);
});