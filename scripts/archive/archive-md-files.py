#!/usr/bin/env python3
"""
Script d'archivage des fichiers .md de la racine vers /docs/archive/
Date: 23 Août 2025
Branche: cleanup-architecture
"""

import os
import shutil
from pathlib import Path

# Configuration des mappages
FILE_MAPPINGS = {
    'context': [
        'CONTEXT-DESIGN-SYSTEM-11-08-2025.md',
        'CONTEXT-FINAL-CORRIGE-11-08-2025.md',
        'CONTEXT-REPRISE-11-08-2025-0135.md',
        'CONTEXTE-REPRISE-SESSION-11-08-2025-1040.md',
        'CONTEXT_PROMPT_20250812_0840.md',
        'CONTEXT_PROMPT_20250812_0852.md',
        'CONTEXT_PROMPT_20250812_0922.md',
        'CONTEXT_PROMPT_20250812_0943.md',
        'CONTEXT_PROMPT_CRITICAL_20250812_0910.md',
        'CONTEXT_PROMPT_DESIGN_SYSTEM.md',
        'CONTEXT_PROMPT_PRODUCTION_READY_20250812.md',
        'CONTEXT_PROMPT_SESSION_4.md',
        'CONTEXT_PROMPT_SESSION_5.md',
        'CONTEXT_PROMPT_ULTRA_DETAILED.md',
        'PROMPT_CONTEXTE_SESSION_15.md'
    ],
    'sessions': [
        'SESSION_13_CONTEXT_PROMPT.md',
        'SESSION_15_CONTEXT_PROMPT.md',
        'SESSION_15_CONTEXT_PROMPT.txt',
        'SESSION_25_PROMPT_CONTEXT.md',
        'SESSION_38_CLEANUP_COMPLETE.md',
        'SESSION_39_CONTEXT.md',
        'SESSION_39_VERIFICATION_REPORT.md',
        'SESSION_40_CONTEXT_PROMPT.md',
        'SESSION_REPORT_20250812_0921.md',
        'SESSION_REPORT_20250812_0934.md',
        'SESSION_REPORT_20250812_0942.md',
        'SESSION_REPORT_DOCUMENTATION_20250812_0955.md'
    ],
    'dashboard': [
        'DASHBOARD-CEO-README.md',
        'DASHBOARD-V3-README.md',
        'DASHBOARD_CEO_HOTFIX.md',
        'DASHBOARD_CEO_IMPLEMENTATION.md',
        'DASHBOARD_DEMO_MODE.md',
        'DASHBOARD_REFACTORING_COMPLETE.md',
        'DASHBOARD_USER_GUIDE.md',
        'DASHBOARD_V3_PREMIUM_COMPLETE.md',
        'DASHBOARD_V3_PREMIUM_SETUP.md',
        'DASHBOARD_V4_STATUS.md',
        'DASHBOARD_V4_VALIDATION.json',
        'DASHBOARD_VISUAL_COMPARISON.md',
        'README_DASHBOARD_V4.md',
        'SAUVEGARDE_DASHBOARD_V4.md'
    ],
    'reports': [
        'CLEANUP_ANALYSIS.md',
        'CLEANUP_BRANCH_PLAN.md',
        'CLEANUP_EXECUTION_STATUS.md',
        'CLEANUP_REPORT.md',
        'CLEANUP_REPORT_2025-08-11.md',
        'CLEANUP_SCRIPT.md',
        'CLEANUP_STATUS.md',
        'FINAL_CLEANUP_STATUS.md',
        'AUDIT-CORRECTION-EXPLICATION.md',
        'CLARIFICATION-DEUX-AUDITS.md',
        'CLAUDE_CODE_ANALYSIS.md',
        'COLLECTIONS_STATUS.md',
        'COMMIT_HISTORY.md',
        'DEPLOYMENT_REPORT.md',
        'FINAL_REPORT_V040.md',
        'REVOLUT_CLEANUP_REPORT.md',
        'WORKFLOW_VALIDATION_REPORT.md',
        'WORKFLOW_VALIDATION_TRACKER.md'
    ],
    'guides': [
        'GETTING_STARTED.md',
        'GUIDE-AJOUT-OWNER-COMPANY.md',
        'GUIDE_SIMPLE.md',
        'QUICK_START_GUIDE.md',
        'BUNDLE_OPTIMIZATION_GUIDE.md',
        'CHROMATIC_SETUP_GUIDE.md',
        'CORS_SOLUTION_GUIDE.md',
        'CSS_CONFLICTS_TROUBLESHOOTING.md',
        'DEVELOPER_WORKFLOW_GUIDE.md',
        'MUTATION_TESTING_GUIDE.md',
        'NEXT_ACTIONS_GUIDE.md',
        'TROUBLESHOOTING_GUIDE.md'
    ],
    'migrations': [
        'MIGRATION-OWNER-COMPANY-COMPLETE.md',
        'MIGRATION_STATUS.md',
        'OWNER_COMPANY_STATUS.md',
        'RAPPORT-SITUATION-OWNER-COMPANY.md',
        'SOLUTION-SQL-OWNER-COMPANY.md',
        'add-owner-company-final.js',
        'add-owner-company-simple-format.js',
        'add-owner-company-simplified.js',
        'add-owner-company.sql'
    ],
    'misc': [
        'API_CONNECTION_SUCCESS.md',
        'CHANGELOG.md',
        'CONTRIBUTING.md',
        'DESIGN_SYSTEM_CLEANUP.md',
        'DESIGN_SYSTEM_INTEGRATION.md',
        'DESIGN_SYSTEM_STRUCTURE.md',
        'DEVELOPMENT_ROADMAP_2025.md',
        'DIRECTUS_RELATIONS_STATUS.md',
        'DONNEES_TEST_CREEES.md',
        'FINAL_DOCUMENTATION_INDEX.md',
        'GET_DIRECTUS_TOKEN.md',
        'GITHUB_COMPLETE_DOCUMENTATION.md',
        'GITHUB_DASHBOARD_EVOLUTION.md',
        'GITHUB_RELEASE_v1.0.0-beta.1.md',
        'GITHUB_SESSION_6_DOCUMENTATION.md',
        'INSTALLATION_PM2.md',
        'INTEGRATIONS_STATUS.md',
        'MCP_CONFIG_BACKUP.json',
        'MCP_DIRECTUS_FINAL_CONFIG.md',
        'PERFORMANCE_DASHBOARD.md',
        'PM2_PERSISTENT_SERVER_SOLUTION.md',
        'POINT-SITUATION-08-08-2024.md',
        'PRODUCTION_READY_CHECKLIST.md',
        'PROJECT_SUCCESS_SUMMARY.md',
        'PROMPT-REPRISE-RAPIDE.md',
        'PUBLICATION_STATUS.md',
        'RELEASE_ACTIONS_NOW.md',
        'RELEASE_COPY_PASTE.md',
        'RELEASE_NOTES_v1.0.0-beta.1.md',
        'RELEASE_NOW.sh',
        'REORGANIZATION_MAP.md',
        'RESTORE-BRANCHES-NOW.sh',
        'RESTRUCTURATION_COMPLETE.md',
        'SERVER_PERSISTENCE_ISSUE.md',
        'SERVEUR_PERSISTANT.md',
        'TEST_API_CONNECTION.md',
        'TEST_TRIGGER.md',
        'TRIGGER_PUBLISH_V040',
        'auto-save.sh'
    ]
}

def main():
    """Fonction principale pour archiver les fichiers"""
    
    # Chemin de base
    base_path = Path('.')
    archive_base = base_path / 'docs' / 'archive'
    
    # Compteurs
    total_files = sum(len(files) for files in FILE_MAPPINGS.values())
    moved_files = 0
    errors = []
    
    print(f"🚀 Début de l'archivage de {total_files} fichiers...")
    print(f"📁 Destination: /docs/archive/\n")
    
    # Traiter chaque catégorie
    for category, files in FILE_MAPPINGS.items():
        dest_dir = archive_base / category
        
        # Créer le répertoire s'il n'existe pas
        dest_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"\n📂 Traitement de {category} ({len(files)} fichiers)...")
        
        for file_name in files:
            src_file = base_path / file_name
            dest_file = dest_dir / file_name
            
            if src_file.exists():
                try:
                    # Utiliser git mv pour préserver l'historique
                    os.system(f'git mv "{src_file}" "{dest_file}"')
                    moved_files += 1
                    print(f"  ✅ {file_name}")
                except Exception as e:
                    errors.append(f"{file_name}: {str(e)}")
                    print(f"  ❌ {file_name}: {str(e)}")
            else:
                print(f"  ⚠️  {file_name} - Fichier non trouvé")
    
    # Rapport final
    print(f"\n{'='*60}")
    print(f"📊 RAPPORT FINAL")
    print(f"{'='*60}")
    print(f"✅ Fichiers archivés: {moved_files}/{total_files}")
    print(f"❌ Erreurs: {len(errors)}")
    
    if errors:
        print(f"\n⚠️  Erreurs détaillées:")
        for error in errors:
            print(f"  - {error}")
    
    # Créer un commit pour chaque catégorie
    print(f"\n💾 Création des commits...")
    for category in FILE_MAPPINGS.keys():
        commit_msg = f"chore: Archive {category} files to /docs/archive/{category}/"
        os.system(f'git add docs/archive/{category}/')
        os.system(f'git commit -m "{commit_msg}"')
        print(f"  ✅ Commit créé pour {category}")
    
    print(f"\n✨ Archivage terminé!")
    print(f"📝 N'oubliez pas de:")
    print(f"  1. Vérifier les changements avec 'git status'")
    print(f"  2. Créer une Pull Request")
    print(f"  3. Mettre à jour le README.md principal")

if __name__ == "__main__":
    main()
