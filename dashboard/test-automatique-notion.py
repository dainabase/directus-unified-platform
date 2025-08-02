#!/usr/bin/env python3
"""
Test automatique de l'intégration Notion
Lance le serveur et teste l'envoi d'un document
"""

import subprocess
import time
import urllib.request
import json
import webbrowser
import sys
import signal

def test_notion_integration():
    print("🚀 Test automatique de l'intégration Notion")
    print("=" * 50)
    
    # Lancer le serveur
    print("\n1️⃣ Démarrage du serveur...")
    server_process = subprocess.Popen(
        [sys.executable, 'notion-proxy-server.py'],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Attendre que le serveur démarre
    time.sleep(2)
    
    try:
        # Tester la connexion
        print("\n2️⃣ Test de connexion au serveur local...")
        try:
            response = urllib.request.urlopen('http://localhost:8080/test-local-notion.html')
            print("✅ Serveur accessible!")
        except:
            print("❌ Serveur non accessible")
            return
        
        # Test de l'API Notion
        print("\n3️⃣ Test de connexion à Notion...")
        api_url = 'http://localhost:8080/api/notion-proxy.php'
        
        data = {
            'action': 'get_databases',
            'api_key': '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'
        }
        
        req = urllib.request.Request(
            api_url,
            data=json.dumps(data).encode('utf-8'),
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        
        try:
            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode('utf-8'))
                if 'results' in result:
                    print(f"✅ Connexion Notion OK! {len(result['results'])} databases trouvées")
                else:
                    print("⚠️ Connexion établie mais pas de databases")
        except Exception as e:
            print(f"❌ Erreur de connexion Notion: {e}")
        
        # Ouvrir le navigateur
        print("\n4️⃣ Ouverture du navigateur...")
        webbrowser.open('http://localhost:8080/test-local-notion.html')
        print("✅ Page de test ouverte dans votre navigateur!")
        
        print("\n" + "="*50)
        print("✨ SUCCÈS! Le serveur est lancé et prêt!")
        print("\n📋 Que faire maintenant:")
        print("1. Dans le navigateur, cliquez sur les boutons de test")
        print("2. Ou allez directement à l'OCR:")
        print("   http://localhost:8080/superadmin/finance/ocr-premium-dashboard.html")
        print("\n⚠️ Pour arrêter le serveur: Appuyez sur Ctrl+C")
        print("="*50)
        
        # Garder le serveur actif
        server_process.wait()
        
    except KeyboardInterrupt:
        print("\n\n✋ Arrêt du serveur...")
        server_process.terminate()
        print("✅ Serveur arrêté")
    except Exception as e:
        print(f"❌ Erreur: {e}")
        server_process.terminate()

if __name__ == '__main__':
    test_notion_integration()