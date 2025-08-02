<?php
// Serveur de test simple pour tester les endpoints d'upload de fichiers
// Usage: php -S localhost:8000 test-upload-server.php

$request_uri = $_SERVER['REQUEST_URI'];

// Routage simple
if (strpos($request_uri, '/api/notion-file-upload.php') !== false) {
    // Inclure le script d'upload
    include 'api/notion-file-upload.php';
} else if ($request_uri === '/') {
    // Page de test
    ?>
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Upload Notion API 2024</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .container { max-width: 800px; margin: 0 auto; }
            .test-section { margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            .result { margin-top: 10px; padding: 10px; border-radius: 4px; }
            .success { background-color: #d4edda; color: #155724; }
            .error { background-color: #f8d7da; color: #721c24; }
            .info { background-color: #d1ecf1; color: #0c5460; }
            button { padding: 10px 20px; margin: 5px; cursor: pointer; }
            .drop-zone { 
                border: 2px dashed #ccc; 
                padding: 40px; 
                text-align: center; 
                margin: 20px 0;
                border-radius: 8px;
            }
            .drop-zone:hover { border-color: #007bff; }
            pre { background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🧪 Test Upload Notion API 2024</h1>
            
            <div class="test-section">
                <h3>📤 Test Upload de Fichier PDF</h3>
                <div class="drop-zone" id="dropZone">
                    Glissez un fichier PDF ici ou cliquez pour sélectionner
                </div>
                <input type="file" id="fileInput" accept=".pdf" style="display: none;">
                <button onclick="testUpload()">🚀 Tester Upload</button>
                <div id="uploadResult" class="result" style="display: none;"></div>
            </div>

            <div class="test-section">
                <h3>🔧 Test des Endpoints</h3>
                <button onclick="testEndpoint('create_upload')">Test Création Upload</button>
                <button onclick="testEndpoint('health')">Test Santé API</button>
                <div id="endpointResult" class="result" style="display: none;"></div>
            </div>

            <div class="test-section">
                <h3>📊 Logs</h3>
                <pre id="logs"></pre>
            </div>
        </div>

        <script>
            let selectedFile = null;
            let logs = [];

            function log(message) {
                const timestamp = new Date().toLocaleTimeString();
                logs.push(`[${timestamp}] ${message}`);
                document.getElementById('logs').textContent = logs.join('\n');
                console.log(message);
            }

            // Configuration drag & drop
            const dropZone = document.getElementById('dropZone');
            const fileInput = document.getElementById('fileInput');

            dropZone.addEventListener('click', () => fileInput.click());
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.style.borderColor = '#007bff';
            });
            dropZone.addEventListener('dragleave', () => {
                dropZone.style.borderColor = '#ccc';
            });
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.style.borderColor = '#ccc';
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    handleFileSelection(files[0]);
                }
            });

            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    handleFileSelection(e.target.files[0]);
                }
            });

            function handleFileSelection(file) {
                selectedFile = file;
                log(`📁 Fichier sélectionné: ${file.name} (${formatFileSize(file.size)})`);
                dropZone.innerHTML = `✅ ${file.name} (${formatFileSize(file.size)})`;
            }

            function formatFileSize(bytes) {
                if (bytes === 0) return '0 Bytes';
                const k = 1024;
                const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
            }

            async function testUpload() {
                if (!selectedFile) {
                    showResult('uploadResult', 'error', 'Aucun fichier sélectionné');
                    return;
                }

                log('🚀 Début du test d\'upload...');
                
                try {
                    // Simulation du processus d'upload en 3 étapes
                    log('📋 Étape 1: Création de l\'URL d\'upload...');
                    
                    const createResponse = await fetch('/api/notion-file-upload.php?action=create_upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            filename: selectedFile.name,
                            size: selectedFile.size
                        })
                    });

                    if (!createResponse.ok) {
                        throw new Error(`Erreur création: ${createResponse.statusText}`);
                    }

                    const createResult = await createResponse.json();
                    log(`✅ URL d'upload créée: ${JSON.stringify(createResult)}`);

                    if (!createResult.success) {
                        throw new Error(`Erreur création: ${createResult.error}`);
                    }

                    // Étape 2: Conversion et upload du fichier
                    log('📋 Étape 2: Conversion et upload du fichier...');
                    
                    const fileContent = await fileToBase64(selectedFile);
                    const uploadResponse = await fetch('/api/notion-file-upload.php?action=upload_file', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            uploadData: createResult.data,
                            fileContent: fileContent.split(',')[1]
                        })
                    });

                    if (!uploadResponse.ok) {
                        throw new Error(`Erreur upload: ${uploadResponse.statusText}`);
                    }

                    const uploadResult = await uploadResponse.json();
                    log(`✅ Fichier uploadé: ${JSON.stringify(uploadResult)}`);

                    if (!uploadResult.success) {
                        throw new Error(`Erreur upload: ${uploadResult.error}`);
                    }

                    // Étape 3: Récupération de l'ID du fichier
                    log('📋 Étape 3: Récupération de l\'ID du fichier...');
                    
                    const fileIdResponse = await fetch('/api/notion-file-upload.php?action=get_file_id', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            uploadId: createResult.data.upload_id
                        })
                    });

                    if (!fileIdResponse.ok) {
                        throw new Error(`Erreur récupération ID: ${fileIdResponse.statusText}`);
                    }

                    const fileIdResult = await fileIdResponse.json();
                    log(`✅ ID du fichier récupéré: ${JSON.stringify(fileIdResult)}`);

                    showResult('uploadResult', 'success', `✅ Upload réussi! File ID: ${fileIdResult.data?.file_id || 'N/A'}`);

                } catch (error) {
                    log(`❌ Erreur: ${error.message}`);
                    showResult('uploadResult', 'error', `❌ Erreur: ${error.message}`);
                }
            }

            async function testEndpoint(action) {
                log(`🔧 Test endpoint: ${action}`);
                
                try {
                    let url = `/api/notion-file-upload.php?action=${action}`;
                    let options = { method: 'GET' };

                    if (action === 'create_upload') {
                        url = `/api/notion-file-upload.php?action=${action}`;
                        options = {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                filename: 'test.pdf',
                                size: 1024
                            })
                        };
                    }

                    const response = await fetch(url, options);
                    const result = await response.json();
                    
                    log(`📊 Réponse ${action}: ${JSON.stringify(result)}`);
                    showResult('endpointResult', response.ok ? 'success' : 'error', 
                        `${action}: ${response.ok ? '✅ OK' : '❌ Error'} - ${JSON.stringify(result)}`);

                } catch (error) {
                    log(`❌ Erreur endpoint ${action}: ${error.message}`);
                    showResult('endpointResult', 'error', `❌ ${action}: ${error.message}`);
                }
            }

            function showResult(elementId, type, message) {
                const element = document.getElementById(elementId);
                element.className = `result ${type}`;
                element.textContent = message;
                element.style.display = 'block';
            }

            function fileToBase64(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = error => reject(error);
                    reader.readAsDataURL(file);
                });
            }

            // Test initial
            log('🎯 Page de test chargée');
            log('💡 Sélectionnez un fichier PDF pour commencer les tests');
        </script>
    </body>
    </html>
    <?php
} else {
    // 404 pour les autres requêtes
    http_response_code(404);
    echo "Page non trouvée";
}
?>