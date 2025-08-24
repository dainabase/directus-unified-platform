#!/bin/bash

echo "🔄 RESTAURATION IMMÉDIATE DES BRANCHES"
echo "======================================"
echo ""
echo "Restauration de feat/design-system-apple depuis le backup..."

# Restaurer la branche depuis le backup
git push origin backup/feat-design-system-apple-20250811:feat/design-system-apple

echo "✅ Branche restaurée !"
echo ""
echo "Pour restaurer feat/design-system-v1.0.0 :"
echo "git push origin ea3f7e3:feat/design-system-v1.0.0"
