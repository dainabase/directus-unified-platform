const { Directus } = require('@directus/sdk');
const ERPNextAPI = require('../../../src/services/erpnext-api');

const directus = new Directus('http://localhost:8055');
const erpnext = new ERPNextAPI({
  apiKey: process.env.ERPNEXT_API_KEY,
  apiSecret: process.env.ERPNEXT_API_SECRET
});

async function migrateContacts() {
  console.log('🔄 Migration des contacts...');
  
  // Récupérer contacts depuis Directus
  await directus.auth.static(process.env.DIRECTUS_TOKEN);
  const contacts = await directus.items('contacts').readByQuery({
    limit: -1
  });

  for (const contact of contacts.data) {
    try {
      if (contact.type === 'client') {
        // Créer client dans ERPNext
        const customer = await erpnext.createCustomer({
          name: `${contact.first_name} ${contact.last_name}`,
          company: mapCompany(contact.company_id),
          tax_id: contact.tax_id,
          primary_contact: {
            first_name: contact.first_name,
            last_name: contact.last_name,
            email_id: contact.email,
            phone: contact.phone
          }
        });
        
        // Mettre à jour Directus avec l'ID ERPNext
        await directus.items('contacts').updateOne(contact.id, {
          erpnext_customer_id: customer.name
        });
        
        console.log(`✅ Client migré: ${customer.name}`);
      } else if (contact.type === 'fournisseur') {
        // Créer fournisseur
        const supplier = await erpnext.createSupplier({
          name: contact.company_name || `${contact.first_name} ${contact.last_name}`,
          company: mapCompany(contact.company_id),
          tax_id: contact.tax_id
        });
        
        await directus.items('contacts').updateOne(contact.id, {
          erpnext_supplier_id: supplier.name
        });
        
        console.log(`✅ Fournisseur migré: ${supplier.name}`);
      }
    } catch (error) {
      console.error(`❌ Erreur migration contact ${contact.id}:`, error);
    }
  }
}

async function migrateProducts() {
  console.log('🔄 Migration des produits...');
  
  const products = await directus.items('products').readByQuery({
    limit: -1
  });

  for (const product of products.data) {
    try {
      const item = await erpnext.createItem({
        code: product.sku || `PROD-${product.id}`,
        name: product.name,
        description: product.description,
        group: product.category,
        rate: product.price,
        company: mapCompany(product.company_id),
        is_stock: product.track_inventory,
        warehouse: 'Stores - ' + mapCompanyAbbr(product.company_id)
      });
      
      await directus.items('products').updateOne(product.id, {
        erpnext_item_code: item.item_code
      });
      
      console.log(`✅ Produit migré: ${item.item_code}`);
    } catch (error) {
      console.error(`❌ Erreur migration produit ${product.id}:`, error);
    }
  }
}

async function migrateInvoices() {
  console.log('🔄 Migration des factures...');
  
  const invoices = await directus.items('client_invoices').readByQuery({
    limit: -1,
    fields: ['*', 'items.*']
  });

  for (const invoice of invoices.data) {
    try {
      // Récupérer le client ERPNext
      const contact = await directus.items('contacts').readOne(invoice.client_id);
      
      if (!contact.erpnext_customer_id) {
        console.log(`⚠️ Client non migré pour facture ${invoice.invoice_number}`);
        continue;
      }

      const erpInvoice = await erpnext.createSalesInvoice({
        company: mapCompany(invoice.company_id),
        customer: contact.erpnext_customer_id,
        date: invoice.invoice_date,
        due_date: invoice.due_date,
        currency: invoice.currency,
        items: invoice.items.map(item => ({
          code: item.product_code,
          description: item.description,
          quantity: item.quantity,
          rate: item.unit_price,
          amount: item.total
        })),
        remarks: `Migré depuis Directus - ${invoice.invoice_number}`
      });
      
      await directus.items('client_invoices').updateOne(invoice.id, {
        erpnext_invoice_id: erpInvoice.name
      });
      
      console.log(`✅ Facture migrée: ${erpInvoice.name}`);
    } catch (error) {
      console.error(`❌ Erreur migration facture ${invoice.id}:`, error);
    }
  }
}

// Mapping des entreprises
function mapCompany(companyId) {
  const mapping = {
    'hypervisual': 'HyperVisual',
    'dynamics': 'Dynamics',
    'lexia': 'Lexia',
    'nkreality': 'NKReality',
    'etekout': 'Etekout'
  };
  return mapping[companyId] || 'HyperVisual';
}

function mapCompanyAbbr(companyId) {
  const mapping = {
    'hypervisual': 'HV',
    'dynamics': 'DYN',
    'lexia': 'LEX',
    'nkreality': 'NKR',
    'etekout': 'ETK'
  };
  return mapping[companyId] || 'HV';
}

// Exécuter la migration
async function runMigration() {
  console.log('🚀 Début de la migration vers ERPNext...');
  
  // Vérifier les arguments
  const args = process.argv.slice(2);
  const isTest = args.includes('--test');
  const limit = args.find(arg => arg.startsWith('--limit='))?.split('=')[1];
  
  if (isTest) {
    console.log('⚠️ Mode test activé');
  }
  
  try {
    await migrateContacts();
    await migrateProducts();
    await migrateInvoices();
    
    console.log('✅ Migration terminée!');
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

// Export pour utilisation dans d'autres scripts
module.exports = {
  migrateContacts,
  migrateProducts,
  migrateInvoices,
  mapCompany,
  mapCompanyAbbr
};

// Exécuter si appelé directement
if (require.main === module) {
  runMigration().catch(console.error);
}