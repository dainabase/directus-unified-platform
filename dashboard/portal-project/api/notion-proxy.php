<?php
/**
 * Proxy API Notion - Permet les appels depuis le frontend
 * Gère l'authentification et les CORS
 */

// Configuration CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Gestion des requêtes OPTIONS pour CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Charger la configuration si elle existe
if (file_exists(__DIR__ . '/config-notion.php')) {
    require_once __DIR__ . '/config-notion.php';
}

// Configuration Notion
define('NOTION_API_VERSION', '2022-06-28');
define('NOTION_BASE_URL', 'https://api.notion.com/v1');

// Récupérer la clé API depuis plusieurs sources possibles
$apiKey = null;

// 1. Depuis le fichier de config
if (defined('NOTION_INTEGRATION_TOKEN')) {
    $apiKey = NOTION_INTEGRATION_TOKEN;
}

// 2. Depuis l'en-tête Authorization
if (!$apiKey && isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $apiKey = $_SERVER['HTTP_AUTHORIZATION'];
}

// 3. Depuis le corps de la requête
if (!$apiKey) {
    $input = json_decode(file_get_contents('php://input'), true);
    if (isset($input['api_key'])) {
        $apiKey = $input['api_key'];
    }
}

// Validation de la clé
if (!$apiKey || (!str_starts_with($apiKey, 'secret_') && !str_starts_with($apiKey, 'ntn_'))) {
    http_response_code(401);
    echo json_encode(['error' => 'Clé API Notion manquante ou invalide']);
    exit();
}

// Récupérer les données de la requête
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Données invalides']);
    exit();
}

// Déterminer l'action
$action = $input['action'] ?? 'create_page';

try {
    switch ($action) {
        case 'create_page':
            $result = createNotionPage($apiKey, $input['data']);
            break;
            
        case 'get_databases':
            $result = getNotionDatabases($apiKey);
            break;
            
        case 'verify_database':
            $result = verifyNotionDatabase($apiKey, $input['database_id']);
            break;
            
        case 'query_database':
            $result = queryNotionDatabase($apiKey, $input['database_id'], $input['query'] ?? []);
            break;
            
        case 'append_blocks':
            $result = appendNotionBlocks($apiKey, $input['page_id'], $input['blocks']);
            break;
            
        default:
            throw new Exception('Action non supportée');
    }
    
    echo json_encode($result);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

/**
 * Créer une page Notion
 */
function createNotionPage($apiKey, $pageData) {
    $ch = curl_init(NOTION_BASE_URL . '/pages');
    
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $apiKey,
            'Notion-Version: ' . NOTION_API_VERSION,
            'Content-Type: application/json'
        ],
        CURLOPT_POSTFIELDS => json_encode($pageData),
        CURLOPT_TIMEOUT => 30
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        $error = json_decode($response, true);
        throw new Exception($error['message'] ?? 'Erreur Notion: ' . $httpCode);
    }
    
    return json_decode($response, true);
}

/**
 * Récupérer les databases
 */
function getNotionDatabases($apiKey) {
    $ch = curl_init(NOTION_BASE_URL . '/search');
    
    $searchData = [
        'filter' => [
            'value' => 'database',
            'property' => 'object'
        ],
        'sort' => [
            'direction' => 'ascending',
            'timestamp' => 'last_edited_time'
        ]
    ];
    
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $apiKey,
            'Notion-Version: ' . NOTION_API_VERSION,
            'Content-Type: application/json'
        ],
        CURLOPT_POSTFIELDS => json_encode($searchData),
        CURLOPT_TIMEOUT => 30
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        $error = json_decode($response, true);
        throw new Exception($error['message'] ?? 'Erreur Notion: ' . $httpCode);
    }
    
    return json_decode($response, true);
}

/**
 * Vérifier une database
 */
function verifyNotionDatabase($apiKey, $databaseId) {
    $ch = curl_init(NOTION_BASE_URL . '/databases/' . $databaseId);
    
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $apiKey,
            'Notion-Version: ' . NOTION_API_VERSION
        ],
        CURLOPT_TIMEOUT => 30
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        return ['exists' => false, 'error' => 'Database non trouvée'];
    }
    
    $database = json_decode($response, true);
    return [
        'exists' => true,
        'title' => $database['title'][0]['plain_text'] ?? 'Sans titre',
        'properties' => array_keys($database['properties'] ?? [])
    ];
}

/**
 * Requête sur une database Notion
 */
function queryNotionDatabase($apiKey, $databaseId, $query = []) {
    $ch = curl_init(NOTION_BASE_URL . '/databases/' . $databaseId . '/query');
    
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $apiKey,
            'Notion-Version: ' . NOTION_API_VERSION,
            'Content-Type: application/json'
        ],
        CURLOPT_POSTFIELDS => json_encode($query),
        CURLOPT_TIMEOUT => 30
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        $errorData = json_decode($response, true);
        error_log('Notion Query Error: ' . json_encode($errorData));
        throw new Exception($errorData['message'] ?? 'Erreur Notion: ' . $httpCode);
    }
    
    return json_decode($response, true);
}

/**
 * Ajouter des blocs à une page Notion
 */
function appendNotionBlocks($apiKey, $pageId, $blocks) {
    $ch = curl_init(NOTION_BASE_URL . '/blocks/' . $pageId . '/children');
    
    $data = [
        'children' => $blocks
    ];
    
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => 'PATCH',
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $apiKey,
            'Notion-Version: ' . NOTION_API_VERSION,
            'Content-Type: application/json'
        ],
        CURLOPT_POSTFIELDS => json_encode($data),
        CURLOPT_TIMEOUT => 30
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        $errorData = json_decode($response, true);
        throw new Exception($errorData['message'] ?? 'Erreur Notion: ' . $httpCode);
    }
    
    return json_decode($response, true);
}