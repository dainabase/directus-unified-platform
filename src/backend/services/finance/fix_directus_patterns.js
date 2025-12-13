import fs from 'fs';

const filePath = 'bank-reconciliation.service.js';
let content = fs.readFileSync(filePath, 'utf8');

// Remplacements pour directus.request patterns
content = content.replace(/await directus\.request\(\s*updateItem\('([^']+)',\s*([^,]+),\s*(\{[^}]*\})\s*\)\s*\);?/g, 
    "await directus.items('$1').updateOne($2, $3);");

content = content.replace(/await directus\.request\(\s*createItem\('([^']+)',\s*(\{[^}]*\})\s*\)\s*\);?/g,
    "await directus.items('$1').createOne($2);");

content = content.replace(/directus\.request\(readItems\('([^']+)',\s*(\{[^}]*\})\)\)/g,
    "directus.items('$1').readMany($2)");

console.log('Corrections terminées');
fs.writeFileSync(filePath, content);
