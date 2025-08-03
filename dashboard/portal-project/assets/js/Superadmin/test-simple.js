/**
 * Test de la version simple OCR
 */

console.log('🧪 === TEST OCR SIMPLE ===\n');

// Vérifier que tout est chargé
console.log('✅ Vérifications:');
console.log('- OCRSimple existe ?', typeof OCRSimple !== 'undefined' ? '✅' : '❌');
console.log('- ocrSimple existe ?', typeof window.ocrSimple !== 'undefined' ? '✅' : '❌');
console.log('- Tesseract existe ?', typeof Tesseract !== 'undefined' ? '✅' : '❌');
console.log('- PDF.js existe ?', typeof pdfjsLib !== 'undefined' ? '✅' : '❌');

// Test de syntaxe
try {
    console.log('\n📝 Test de syntaxe JavaScript...');
    eval('const test = "OK"; console.log("Syntaxe:", test);');
} catch (e) {
    console.error('❌ Erreur de syntaxe:', e);
}

// Instructions
console.log('\n💡 Pour tester:');
console.log('1. Cliquez sur la zone de dépôt');
console.log('2. Sélectionnez votre PDF');
console.log('3. Attendez les résultats');

// Vérifier la dropzone
setTimeout(() => {
    const dropzone = document.getElementById('dropzone');
    if (dropzone) {
        console.log('\n✅ Dropzone trouvée et prête');
        dropzone.style.border = '3px solid #28a745';
        setTimeout(() => {
            dropzone.style.border = '2px dashed var(--tblr-border-color)';
        }, 2000);
    } else {
        console.error('❌ Dropzone non trouvée!');
    }
}, 1000);