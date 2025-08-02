#!/usr/bin/env python3
"""
Serveur proxy Notion en Python
Remplace le proxy PHP pour les tests locaux
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.request
import urllib.parse
import ssl

# Configuration
NOTION_API_KEY = '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'
NOTION_API_VERSION = '2022-06-28'
NOTION_BASE_URL = 'https://api.notion.com/v1'
PORT = 8080

class NotionProxyHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Gestion des requêtes OPTIONS pour CORS"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def do_POST(self):
        """Gestion des requêtes POST vers l'API Notion"""
        # Headers CORS
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        
        # Lire le body de la requête
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
            action = data.get('action', 'create_page')
            
            if action == 'create_page':
                result = self.create_notion_page(data.get('data', {}))
            elif action == 'get_databases':
                result = self.get_notion_databases()
            elif action == 'verify_database':
                result = self.verify_notion_database(data.get('database_id'))
            else:
                result = {'error': 'Action non supportée'}
            
            self.wfile.write(json.dumps(result).encode('utf-8'))
            
        except Exception as e:
            error_response = {'error': str(e)}
            self.wfile.write(json.dumps(error_response).encode('utf-8'))
    
    def do_GET(self):
        """Servir les fichiers statiques"""
        if self.path == '/':
            self.path = '/test-local-notion.html'
        
        try:
            # Construire le chemin du fichier
            file_path = '.' + self.path
            
            # Déterminer le type MIME
            if file_path.endswith('.html'):
                content_type = 'text/html'
            elif file_path.endswith('.js'):
                content_type = 'application/javascript'
            elif file_path.endswith('.css'):
                content_type = 'text/css'
            elif file_path.endswith('.json'):
                content_type = 'application/json'
            else:
                content_type = 'text/plain'
            
            # Lire et envoyer le fichier
            with open(file_path, 'rb') as f:
                self.send_response(200)
                self.send_header('Content-Type', content_type)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(f.read())
                
        except FileNotFoundError:
            self.send_error(404, 'File not found')
        except Exception as e:
            self.send_error(500, str(e))
    
    def create_notion_page(self, page_data):
        """Créer une page dans Notion"""
        headers = {
            'Authorization': f'Bearer {NOTION_API_KEY}',
            'Content-Type': 'application/json',
            'Notion-Version': NOTION_API_VERSION
        }
        
        req = urllib.request.Request(
            f'{NOTION_BASE_URL}/pages',
            data=json.dumps(page_data).encode('utf-8'),
            headers=headers,
            method='POST'
        )
        
        try:
            # Ignorer la vérification SSL pour les tests locaux
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            
            with urllib.request.urlopen(req, context=ctx) as response:
                return json.loads(response.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            return json.loads(error_body)
    
    def get_notion_databases(self):
        """Récupérer les databases Notion"""
        headers = {
            'Authorization': f'Bearer {NOTION_API_KEY}',
            'Content-Type': 'application/json',
            'Notion-Version': NOTION_API_VERSION
        }
        
        search_data = {
            'filter': {
                'value': 'database',
                'property': 'object'
            }
        }
        
        req = urllib.request.Request(
            f'{NOTION_BASE_URL}/search',
            data=json.dumps(search_data).encode('utf-8'),
            headers=headers,
            method='POST'
        )
        
        try:
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            
            with urllib.request.urlopen(req, context=ctx) as response:
                return json.loads(response.read().decode('utf-8'))
        except Exception as e:
            return {'error': str(e)}
    
    def verify_notion_database(self, database_id):
        """Vérifier une database Notion"""
        headers = {
            'Authorization': f'Bearer {NOTION_API_KEY}',
            'Notion-Version': NOTION_API_VERSION
        }
        
        req = urllib.request.Request(
            f'{NOTION_BASE_URL}/databases/{database_id}',
            headers=headers
        )
        
        try:
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            
            with urllib.request.urlopen(req, context=ctx) as response:
                data = json.loads(response.read().decode('utf-8'))
                return {
                    'exists': True,
                    'title': data.get('title', [{}])[0].get('plain_text', 'Sans titre')
                }
        except:
            return {'exists': False}

def main():
    print(f"""
🚀 Serveur Proxy Notion démarré !
==================================
✅ Port: {PORT}
✅ URL: http://localhost:{PORT}
✅ Clé API Notion configurée

📋 URLs disponibles:
- Test: http://localhost:{PORT}/test-local-notion.html
- OCR: http://localhost:{PORT}/superadmin/finance/ocr-premium-dashboard.html

Appuyez sur Ctrl+C pour arrêter
""")
    
    server = HTTPServer(('localhost', PORT), NotionProxyHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n✋ Serveur arrêté')
        server.shutdown()

if __name__ == '__main__':
    main()