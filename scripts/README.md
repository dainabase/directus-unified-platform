# 📁 Scripts Directory Structure

## Overview
This directory contains all scripts for the Directus Unified Platform project, organized by functionality.

## 🗂️ Directory Structure

```
scripts/
├── testing/        # Test scripts and validation tools
├── migration/      # Data migration and schema updates
├── deployment/     # Deployment and server management
├── utilities/      # Utility scripts and helpers
├── monitoring/     # Health checks and monitoring
├── setup/          # Initial setup and configuration
├── maintenance/    # Maintenance and cleanup scripts
├── populate-data/  # Data population scripts
├── kpis-personnalization/  # KPI customization
└── archive/        # Archived/deprecated scripts
```

## 📂 Folder Descriptions

### 🧪 testing/
Test scripts for validating functionality:
- API testing
- Dashboard validation
- Permission checks
- Connection tests
- OCR testing

### 🔄 migration/
Scripts for data migration and schema management:
- Collection creation
- Relation management
- Data import/export
- Schema synchronization
- Owner company migration

### 🚀 deployment/
Deployment and server management:
- Docker compose configurations
- Start/stop scripts
- Publishing scripts
- Server configuration

### 🛠️ utilities/
General utility scripts:
- Repository cleanup
- Token management
- Git helpers
- File organization

### 📊 monitoring/
System monitoring and health checks:
- Health monitoring
- Performance tracking
- Error logging

### ⚙️ setup/
Initial setup and configuration:
- Environment setup
- MCP installation
- Database initialization

### 🧹 maintenance/
Maintenance and cleanup:
- Branch cleanup
- File cleanup
- Workflow management

### 📦 populate-data/
Data population scripts:
- Sample data creation
- Test data generation
- Initial data seeding

### 📈 kpis-personnalization/
KPI customization scripts:
- Dashboard KPI setup
- Metric configuration
- Report generation

### 🗄️ archive/
Archived or deprecated scripts:
- Old migration scripts
- Deprecated utilities
- Legacy configurations

## 🎯 Usage Examples

### Running a test script
```bash
node scripts/testing/test-connection.js
```

### Running a migration
```bash
node scripts/migration/create-collections.js
```

### Starting the platform
```bash
./scripts/deployment/start-platform.sh
```

### Running utilities
```bash
./scripts/utilities/cleanup-repository.sh
```

## 📝 Script Naming Convention

- **test-*** : Test scripts
- **create-*** : Creation scripts
- **migrate-*** : Migration scripts
- **fix-*** : Bug fix scripts
- **validate-*** : Validation scripts
- **check-*** : Check/verification scripts
- **cleanup-*** : Cleanup scripts
- **start-/stop-*** : Service management

## 🔐 Important Scripts

### Critical for Operation
- `deployment/start-platform.sh` - Start entire platform
- `deployment/docker-compose.yml` - Docker configuration
- `migration/create-collections.js` - Create Directus collections
- `testing/validate-full-system.js` - Complete system validation

### Frequently Used
- `utilities/get-directus-token.js` - Get authentication token
- `testing/test-connection.js` - Test Directus connection
- `populate-data/populate-directus.js` - Populate with sample data

## ⚠️ Notes

1. Always run scripts from the project root directory
2. Ensure environment variables are set before running scripts
3. Some scripts require admin privileges
4. Migration scripts should be run in order
5. Always backup before running migration scripts

## 🔗 Related Documentation

- [Main README](../README.md)
- [Setup Guide](../docs/guides/SETUP.md)
- [Migration Guide](../docs/guides/MIGRATION.md)
- [Testing Guide](../docs/guides/TESTING.md)

---

Last updated: December 24, 2024
