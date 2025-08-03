/**
 * OCR Debug - Script de débogage pour le drag & drop
 */
console.log('🔍 OCR Debug activé');

// Vérifier les éléments
setTimeout(() => {
    const dropzone = document.getElementById('dropzone');
    console.log('Dropzone trouvée:', dropzone);
    
    if (dropzone) {
        // Tester les event listeners
        const events = ['dragenter', 'dragover', 'dragleave', 'drop'];
        events.forEach(event => {
            dropzone.addEventListener(event, (e) => {
                console.log(`📌 Event ${event} sur dropzone:`, {
                    defaultPrevented: e.defaultPrevented,
                    type: e.type,
                    target: e.target.className
                });
            });
        });
        
        // Tester sur document
        document.addEventListener('drop', (e) => {
            console.log('📌 Drop sur document:', {
                defaultPrevented: e.defaultPrevented,
                files: e.dataTransfer?.files?.length || 0
            });
        }, true);
    }
    
    // Vérifier OCRProcessor
    console.log('OCRProcessor disponible:', typeof window.OCRProcessor);
    console.log('Dropzone.js disponible:', typeof window.Dropzone);
}, 1000);