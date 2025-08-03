#!/bin/bash
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ $LOCAL = $REMOTE ]; then
    echo "✅ Synchronisé avec GitHub"
else
    echo "❌ PAS SYNCHRONISÉ ! Faire : ./auto-save.sh"
    git status -s
fi