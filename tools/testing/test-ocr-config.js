require('dotenv').config();
console.log('OCR Config Check:');
console.log('- OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Missing');
console.log('- OCR_OPENAI_API_KEY:', process.env.OCR_OPENAI_API_KEY ? '✅ Configured' : '❌ Missing');
console.log('- Length:', process.env.OPENAI_API_KEY?.length || 0);
console.log('- Starts with:', process.env.OPENAI_API_KEY?.substring(0, 7));

// Vérifier aussi le fichier de config
const apiKeys = require('./backend/config/api-keys.js');
console.log('\nConfig file check:');
console.log('- OpenAI from config:', apiKeys.openai?.apiKey ? 'Configured' : 'Missing');
