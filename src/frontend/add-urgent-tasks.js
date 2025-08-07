// add-urgent-tasks.js - Ajouter les tâches urgentes avec le bon format
const axios = require('axios');

const API_URL = 'http://localhost:8055';
const TOKEN = 'dashboard-api-token-2025';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
});

const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - randomNumber(0, daysAgo));
  return date.toISOString().split('T')[0];
};

const taskTitles = [
  'Intégration API REST', 'Tests de performance critiques', 'Documentation API',
  'Revue de code urgent', 'Déploiement hotfix production', 'Configuration SSL',
  'Optimisation requêtes SQL', 'Formation client urgent', 'Audit sécurité critique',
  'Migration base de données'
];

async function addUrgentTasks() {
  console.log('🚨 Ajout de 10 tâches urgentes...\n');
  
  try {
    // Récupérer des projets et personnes
    const [projectsRes, peopleRes] = await Promise.all([
      api.get('/items/projects?limit=10'),
      api.get('/items/people?limit=10')
    ]);
    
    const projects = projectsRes.data.data;
    const people = peopleRes.data.data;
    
    let created = 0;
    for (let i = 0; i < 10; i++) {
      try {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + randomNumber(-5, 3)); // Dates proches ou dépassées
        
        await api.post('/items/deliverables', {
          title: taskTitles[i], // Utiliser "title" au lieu de "name"
          project_id: projects.length > 0 ? randomElement(projects).id : null,
          assigned_to: people.length > 0 ? randomElement(people).id : null,
          status: randomElement(['pending', 'in_progress', 'review']),
          priority: randomElement(['high', 'urgent']),
          due_date: dueDate.toISOString(),
          description: `${randomElement(['Bug critique', 'Deadline client', 'Problème production', 'Demande urgente'])} - Action requise immédiatement`,
          completion_percentage: randomNumber(0, 80),
          created_at: new Date().toISOString()
        });
        created++;
        console.log(`  ✅ Tâche urgente "${taskTitles[i]}" créée`);
      } catch (error) {
        console.log(`  ❌ Erreur tâche ${i}: ${error.response?.data?.errors?.[0]?.message || error.message}`);
      }
    }
    
    console.log(`\n✅ ${created} tâches urgentes créées avec succès !`);
    console.log('📊 Rechargez le dashboard pour voir les nouvelles tâches.');
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data?.errors?.[0]?.message || error.message);
  }
}

// Exécuter
addUrgentTasks();