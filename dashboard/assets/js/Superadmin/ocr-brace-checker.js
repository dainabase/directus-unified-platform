/**
 * Vérificateur d'accolades pour ocr-premium-interface.js
 */

const fs = require('fs');

const checkBraces = (filename) => {
    const content = fs.readFileSync(filename, 'utf8');
    const lines = content.split('\n');
    
    let braceCount = 0;
    let classStartLine = -1;
    let inClass = false;
    const braceStack = [];
    
    lines.forEach((line, index) => {
        const lineNum = index + 1;
        
        // Détecter le début de la classe
        if (line.includes('class OCRPremiumInterface')) {
            classStartLine = lineNum;
            inClass = true;
            console.log(`Classe commence à la ligne ${lineNum}`);
        }
        
        // Compter les accolades
        for (const char of line) {
            if (char === '{') {
                braceCount++;
                braceStack.push({ line: lineNum, char: '{' });
            } else if (char === '}') {
                braceCount--;
                const opening = braceStack.pop();
                
                if (inClass && braceCount === 0) {
                    console.log(`Classe se termine à la ligne ${lineNum}`);
                    console.log(`Accolade fermante correspondant à l'ouverture ligne ${opening?.line}`);
                    inClass = false;
                }
            }
        }
        
        // Afficher les lignes importantes
        if (lineNum >= 865 && lineNum <= 880) {
            console.log(`${lineNum}: ${line.substring(0, 60)}... [braces: ${braceCount}]`);
        }
    });
    
    console.log(`\nNombre final d'accolades: ${braceCount}`);
    console.log(`Accolades non fermées: ${braceStack.length}`);
    
    if (braceStack.length > 0) {
        console.log('\nAcoolades non fermées:');
        braceStack.forEach(brace => {
            console.log(`  Ligne ${brace.line}: ${brace.char}`);
        });
    }
};

// Si exécuté directement
if (require.main === module) {
    const file = process.argv[2] || './ocr-premium-interface.js';
    checkBraces(file);
}