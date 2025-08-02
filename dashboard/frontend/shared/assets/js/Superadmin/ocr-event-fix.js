/**
 * OCR Event Fix - Script pour forcer l'attachement des events
 * @version 1.0.0
 */

console.log('🔧 === OCR EVENT FIX ===');

// Attendre que le DOM soit prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOCREvents);
} else {
  initOCREvents();
}

function initOCREvents() {
  console.log('🚀 Initialisation des events OCR...');
  
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  
  if (!dropzone) {
    console.error('❌ Dropzone non trouvée');
    return;
  }
  
  if (!fileInput) {
    console.error('❌ Input file non trouvé');
    return;
  }
  
  console.log('✅ Éléments trouvés:', { dropzone, fileInput });
  
  // 1. Event click sur dropzone pour ouvrir le sélecteur
  dropzone.addEventListener('click', (e) => {
    // Ne pas déclencher si on clique sur un bouton
    if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
      console.log('🖱️ Click sur dropzone - ouverture sélecteur');
      fileInput.click();
    }
  });
  
  // 2. Event change sur input file
  fileInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    console.log('📁 Fichiers sélectionnés:', files.length);
    files.forEach(file => {
      console.log(`- ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // Traiter avec OCRProcessor si disponible
    if (window.OCRProcessor && window.OCRProcessor.processSingleFile) {
      console.log('🤖 Lancement traitement OCR...');
      
      // Créer des éléments preview si nécessaire
      for (const file of files) {
        try {
          // Ajouter propriété preview pour compatibilité
          file.previewElement = createPreviewElement(file);
          await window.OCRProcessor.processSingleFile(file);
        } catch (error) {
          console.error('❌ Erreur traitement:', error);
          alert(`Erreur traitement ${file.name}: ${error.message}`);
        }
      }
    } else {
      // Fallback simple
      alert(`Fichiers détectés (${files.length}):\n${files.map(f => f.name).join('\n')}`);
      console.warn('⚠️ OCRProcessor non disponible - affichage simple');
    }
    
    // Réinitialiser l'input pour permettre de resélectionner le même fichier
    e.target.value = '';
  });
  
  // 3. Events drag & drop
  const dragEvents = ['dragenter', 'dragover', 'dragleave', 'drop'];
  
  // Empêcher comportement par défaut sur toute la page
  dragEvents.forEach(eventName => {
    document.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
  });
  
  // Events spécifiques sur la dropzone
  dropzone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
    console.log('🎯 Drag enter');
  });
  
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });
  
  dropzone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    // Vérifier qu'on quitte vraiment la zone
    const rect = dropzone.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX >= rect.right || 
        e.clientY < rect.top || e.clientY >= rect.bottom) {
      dropzone.classList.remove('dragover');
      console.log('🎯 Drag leave');
    }
  });
  
  dropzone.addEventListener('drop', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    dropzone.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    console.log('📥 Drop:', files.length, 'fichier(s)');
    
    if (files.length > 0) {
      // Simuler la sélection via l'input file
      const dataTransfer = new DataTransfer();
      files.forEach(file => dataTransfer.items.add(file));
      fileInput.files = dataTransfer.files;
      
      // Déclencher l'event change
      const changeEvent = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(changeEvent);
    }
  });
  
  console.log('✅ Events OCR attachés avec succès!');
  
  // Ajouter indicateur visuel
  dropzone.style.cursor = 'pointer';
  dropzone.title = 'Cliquez ou glissez des fichiers ici';
}

// Fonction globale pour test
// Fonction pour créer un élément preview
function createPreviewElement(file) {
  const preview = document.createElement('div');
  preview.className = 'alert alert-info mb-2';
  preview.innerHTML = `
    <div class="d-flex align-items-center">
      <div class="spinner-border spinner-border-sm me-2" role="status"></div>
      <div class="flex-fill">
        <strong>${file.name}</strong>
        <div class="text-secondary small">Traitement en cours...</div>
      </div>
    </div>
  `;
  
  // Ajouter au conteneur
  const container = document.getElementById('ocr-results-container') || 
                   document.querySelector('.dropzone') ||
                   document.querySelector('.card-body');
  
  if (container) {
    container.appendChild(preview);
  }
  
  return preview;
}

window.testOCREvents = function() {
  const fileInput = document.getElementById('file-input');
  if (fileInput) {
    fileInput.click();
  } else {
    console.error('Input file non trouvé');
  }
};

console.log('💡 Utilisez testOCREvents() pour tester');