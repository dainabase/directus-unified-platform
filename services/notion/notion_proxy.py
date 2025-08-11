"""
Proxy pour rediriger les requêtes Notion vers le serveur Node.js
Ce proxy permet d'utiliser l'interface OCR depuis le serveur Python
en redirigeant les appels API vers le serveur Node.js qui gère Notion
"""

import json
import requests
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=['http://localhost:8000', 'http://127.0.0.1:8000'])

# Configuration
NODE_SERVER_URL = "http://localhost:3000"
DEFAULT_AUTH_TOKEN = "demo-token"  # Token par défaut pour les tests

@app.route('/api/notion/<path:path>', methods=['GET', 'POST', 'PATCH', 'PUT', 'DELETE'])
def proxy_notion(path):
    """Proxy toutes les requêtes Notion vers le serveur Node.js"""
    try:
        # Construire l'URL cible
        target_url = f"{NODE_SERVER_URL}/api/notion/{path}"
        
        # Récupérer les headers de la requête originale
        headers = {
            'Content-Type': request.headers.get('Content-Type', 'application/json'),
            'Authorization': request.headers.get('Authorization', f'Bearer {DEFAULT_AUTH_TOKEN}')
        }
        
        # Récupérer les données de la requête
        data = None
        if request.method in ['POST', 'PATCH', 'PUT']:
            if request.is_json:
                data = request.get_json()
            else:
                data = request.data
        
        # Faire la requête vers le serveur Node.js
        response = requests.request(
            method=request.method,
            url=target_url,
            headers=headers,
            json=data if request.is_json else None,
            data=data if not request.is_json else None,
            params=request.args
        )
        
        # Retourner la réponse
        return make_response(
            response.content,
            response.status_code,
            {'Content-Type': response.headers.get('Content-Type', 'application/json')}
        )
        
    except requests.exceptions.ConnectionError:
        return jsonify({
            'error': 'Serveur Node.js non disponible',
            'message': 'Assurez-vous que le serveur Node.js est démarré sur le port 3000',
            'solution': 'Exécutez: cd portal-project/server && npm start'
        }), 503
    except Exception as e:
        return jsonify({
            'error': 'Erreur proxy',
            'message': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check du proxy"""
    # Vérifier si le serveur Node.js est accessible
    try:
        node_health = requests.get(f"{NODE_SERVER_URL}/health", timeout=2)
        node_status = node_health.json() if node_health.ok else {'status': 'error'}
    except:
        node_status = {'status': 'offline'}
    
    return jsonify({
        'proxy_status': 'ok',
        'node_server': node_status,
        'configuration': {
            'node_url': NODE_SERVER_URL,
            'proxy_port': 5000
        }
    })

if __name__ == '__main__':
    print("\n🔄 Proxy Notion démarré")
    print(f"📍 Port: 5000")
    print(f"🔗 Redirige vers: {NODE_SERVER_URL}")
    print(f"🚀 URL du proxy: http://localhost:5000/api/notion/*")
    print("\n⚠️  Assurez-vous que le serveur Node.js est démarré sur le port 3000!")
    print("   Commande: cd portal-project/server && npm start\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)