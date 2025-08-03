#!/usr/bin/env python3
"""
Serveur HTTP simple avec support du proxy Notion intégré
Lance automatiquement le proxy Notion pour permettre l'utilisation de l'OCR
"""

import http.server
import socketserver
import os
import threading
import time
import subprocess
import sys
import json
from urllib.parse import urlparse

# Configuration
HTTP_PORT = 8000
PROXY_PORT = 5000
NODE_SERVER_URL = "http://localhost:3000"

class NotionProxyHandler(http.server.SimpleHTTPRequestHandler):
    """Handler HTTP avec support du proxy Notion intégré"""
    
    def do_POST(self):
        """Gérer les requêtes POST vers l'API Notion"""
        if self.path.startswith('/api/notion/'):
            self.proxy_to_node()
        else:
            self.send_error(404, "Not Found")
    
    def do_GET(self):
        """Gérer les requêtes GET"""
        if self.path.startswith('/api/notion/'):
            self.proxy_to_node()
        else:
            # Comportement par défaut pour servir les fichiers
            super().do_GET()
    
    def proxy_to_node(self):
        """Rediriger les requêtes vers le serveur Node.js"""
        try:
            import requests
            
            # Construire l'URL cible
            target_url = f"{NODE_SERVER_URL}{self.path}"
            
            # Lire le body si présent
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length) if content_length > 0 else None
            
            # Préparer les headers
            headers = {
                'Content-Type': self.headers.get('Content-Type', 'application/json'),
                'Authorization': self.headers.get('Authorization', 'Bearer demo-token')
            }
            
            # Faire la requête vers Node.js
            if self.command == 'POST':
                response = requests.post(target_url, data=body, headers=headers)
            else:
                response = requests.get(target_url, headers=headers)
            
            # Retourner la réponse
            self.send_response(response.status_code)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(response.content)
            
        except requests.exceptions.ConnectionError:
            error_response = {
                'error': 'Serveur Node.js non disponible',
                'message': 'Le serveur Node.js doit être démarré sur le port 3000',
                'solution': 'Exécutez: cd portal-project/server && npm start'
            }
            self.send_response(503)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(error_response).encode())
        except ImportError:
            # Si requests n'est pas installé, utiliser urllib
            self.send_error(503, "Module 'requests' non installé. Installez-le avec: pip install requests")
        except Exception as e:
            self.send_error(500, f"Erreur proxy: {str(e)}")
    
    def end_headers(self):
        """Ajouter les headers CORS"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

def check_node_server():
    """Vérifier si le serveur Node.js est actif"""
    try:
        import requests
        response = requests.get(f"{NODE_SERVER_URL}/health", timeout=2)
        return response.ok
    except:
        return False

def main():
    """Démarrer le serveur HTTP avec support proxy Notion"""
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    print("\n🌐 Démarrage du serveur HTTP Python avec proxy Notion intégré")
    print(f"📍 Port HTTP: {HTTP_PORT}")
    print(f"🔗 Proxy Notion: /api/notion/* → {NODE_SERVER_URL}/api/notion/*")
    
    # Vérifier si le serveur Node.js est actif
    if check_node_server():
        print("✅ Serveur Node.js détecté et actif")
    else:
        print("\n⚠️  ATTENTION: Le serveur Node.js n'est pas détecté!")
        print("   Pour utiliser l'OCR, vous devez démarrer le serveur Node.js:")
        print("   1. Ouvrez un nouveau terminal")
        print("   2. cd portal-project/server")
        print("   3. npm start")
        print("\n   Ou utilisez directement le serveur Node.js au lieu de Python:")
        print("   http://localhost:3000/superadmin/finance/ocr-premium-dashboard-fixed.html")
    
    # Créer le serveur HTTP
    with socketserver.TCPServer(("", HTTP_PORT), NotionProxyHandler) as httpd:
        print(f"\n🚀 Serveur démarré sur http://localhost:{HTTP_PORT}")
        print("📄 OCR disponible sur: http://localhost:8000/superadmin/finance/ocr-premium-dashboard-fixed.html")
        print("\n📝 Logs des requêtes:")
        print("-" * 50)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n⏹️  Arrêt du serveur...")
            httpd.shutdown()
            print("✅ Serveur arrêté")

if __name__ == "__main__":
    main()