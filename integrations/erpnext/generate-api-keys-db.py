#!/usr/bin/env python3
"""
Script pour générer les clés API directement via la base de données
"""
import pymysql
import hashlib
import secrets
import json

# Configuration base de données
DB_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'erpnext',
    'password': 'erpnext_secure_2025',
    'database': 'erpnext'
}

def generate_api_key():
    """Générer une clé API aléatoire"""
    return secrets.token_urlsafe(32)

def generate_api_secret():
    """Générer un secret API aléatoire"""
    return secrets.token_urlsafe(48)

def update_user_api_keys():
    """Mettre à jour les clés API pour Administrator"""
    try:
        # Connexion à la base de données
        connection = pymysql.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        # Générer les clés
        api_key = generate_api_key()
        api_secret = generate_api_secret()
        
        # Mettre à jour l'utilisateur Administrator
        update_query = """
        UPDATE tabUser 
        SET api_key = %s, api_secret = %s 
        WHERE name = 'Administrator'
        """
        
        cursor.execute(update_query, (api_key, api_secret))
        connection.commit()
        
        # Créer le fichier de résultat
        result = {
            "api_key": api_key,
            "api_secret": api_secret,
            "url": "http://localhost:8083",
            "username": "Administrator"
        }
        
        # Sauvegarder
        with open('erpnext-api-keys.json', 'w') as f:
            json.dump(result, f, indent=2)
        
        print("✅ Clés API générées avec succès !")
        print(json.dumps(result, indent=2))
        
        cursor.close()
        connection.close()
        
        return result
        
    except Exception as e:
        print(f"❌ Erreur : {str(e)}")
        return None

if __name__ == "__main__":
    print("🔑 Génération des clés API ERPNext...")
    update_user_api_keys()