<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Configuration
$NOTION_API_KEY = $_ENV['NOTION_API_KEY'] ?? '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';
$NOTION_VERSION = '2022-06-28';

function makeNotionRequest($url, $data = null, $method = 'GET', $headers = []) {
    global $NOTION_API_KEY, $NOTION_VERSION;
    
    $defaultHeaders = [
        "Authorization: Bearer $NOTION_API_KEY",
        "Notion-Version: $NOTION_VERSION",
        "Content-Type: application/json"
    ];
    
    $allHeaders = array_merge($defaultHeaders, $headers);
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $allHeaders,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_TIMEOUT => 30
    ]);
    
    if ($data && in_array($method, ['POST', 'PUT', 'PATCH'])) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, is_string($data) ? $data : json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'success' => $httpCode >= 200 && $httpCode < 300,
        'data' => json_decode($response, true),
        'httpCode' => $httpCode,
        'raw' => $response
    ];
}

// Étape 1: Créer une URL d'upload de fichier
function createFileUpload($filename, $size) {
    $data = [
        'name' => $filename,
        'size' => (int)$size
    ];
    
    $result = makeNotionRequest('https://api.notion.com/v1/files/uploads', $data, 'POST');
    
    if (!$result['success']) {
        throw new Exception('Erreur lors de la création de l\'upload: ' . json_encode($result['data']));
    }
    
    return $result['data'];
}

// Étape 2: Upload du fichier vers l'URL présignée
function uploadFileToPresignedUrl($uploadData, $fileContent) {
    $ch = curl_init();
    
    // Préparer les champs du formulaire
    $postFields = [];
    foreach ($uploadData['upload_details']['form_fields'] as $field) {
        $postFields[$field['name']] = $field['value'];
    }
    
    // Ajouter le fichier
    $postFields['file'] = new CURLFile('data://application/pdf;base64,' . base64_encode($fileContent), 'application/pdf', $uploadData['name']);
    
    curl_setopt_array($ch, [
        CURLOPT_URL => $uploadData['upload_details']['upload_url'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $postFields,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_TIMEOUT => 60
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 204) {
        throw new Exception("Erreur lors de l'upload du fichier: HTTP $httpCode - $response");
    }
    
    return true;
}

// Router principal
$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    switch ($action) {
        case 'create_upload':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception('Méthode non autorisée');
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            $filename = $input['filename'] ?? '';
            $size = $input['size'] ?? 0;
            
            if (empty($filename) || $size <= 0) {
                throw new Exception('Nom de fichier et taille requis');
            }
            
            $uploadData = createFileUpload($filename, $size);
            
            echo json_encode([
                'success' => true,
                'data' => $uploadData
            ]);
            break;
            
        case 'upload_file':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception('Méthode non autorisée');
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            $uploadData = $input['uploadData'] ?? null;
            $fileContent = $input['fileContent'] ?? '';
            
            if (!$uploadData || empty($fileContent)) {
                throw new Exception('Données d\'upload et contenu du fichier requis');
            }
            
            // Décoder le contenu base64
            $decodedContent = base64_decode($fileContent);
            if ($decodedContent === false) {
                throw new Exception('Contenu de fichier base64 invalide');
            }
            
            uploadFileToPresignedUrl($uploadData, $decodedContent);
            
            echo json_encode([
                'success' => true,
                'message' => 'Fichier uploadé avec succès'
            ]);
            break;
            
        case 'get_file_id':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception('Méthode non autorisée');
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            $uploadId = $input['uploadId'] ?? '';
            
            if (empty($uploadId)) {
                throw new Exception('ID d\'upload requis');
            }
            
            // Récupérer les détails du fichier uploadé
            $result = makeNotionRequest("https://api.notion.com/v1/files/uploads/$uploadId");
            
            if (!$result['success']) {
                throw new Exception('Erreur lors de la récupération du fichier: ' . json_encode($result['data']));
            }
            
            echo json_encode([
                'success' => true,
                'data' => $result['data']
            ]);
            break;
            
        default:
            throw new Exception('Action non reconnue');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>