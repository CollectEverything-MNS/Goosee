#!/bin/bash
set -e

# --- CONFIG ---
TEMPLATE_DIR="apps/services/_template"
TARGET_DIR="apps/services"
# ---------------

# Vérification des arguments
if [ -z "$1" ]; then
  echo "❌ Erreur : tu dois donner un nom de service."
  echo "👉 Exemple : ./scripts/create-service.sh user-service"
  exit 1
fi

SERVICE_NAME=$1
NEW_SERVICE_DIR="${TARGET_DIR}/${SERVICE_NAME}"

# Vérifie que le template existe
if [ ! -d "$TEMPLATE_DIR" ]; then
  echo "❌ Le dossier $TEMPLATE_DIR n'existe pas. Crée ton template d'abord."
  exit 1
fi

# Crée le dossier cible s’il n’existe pas
mkdir -p "$TARGET_DIR"

# Vérifie que le dossier de destination n’existe pas déjà
if [ -d "$NEW_SERVICE_DIR" ]; then
  echo "❌ Le service '${SERVICE_NAME}' existe déjà."
  exit 1
fi

# Copie du template sans node_modules ni dist
echo "📁 Copie du template vers ${NEW_SERVICE_DIR} (sans node_modules ni dist)..."
rsync -av --progress "$TEMPLATE_DIR/" "$NEW_SERVICE_DIR" \
  --exclude "node_modules" \
  --exclude "dist"

# Mise à jour du package.json
if [ -f "${NEW_SERVICE_DIR}/package.json" ]; then
  echo "🧩 Mise à jour du package.json..."
  sed -i.bak "s/\"name\": \".*\"/\"name\": \"${SERVICE_NAME}\"/" "${NEW_SERVICE_DIR}/package.json"
  rm "${NEW_SERVICE_DIR}/package.json.bak"
fi

# Nettoyage
echo "✨ Service '${SERVICE_NAME}' créé avec succès !"
echo "➡️  Dossier : ${NEW_SERVICE_DIR}"
echo "➡️  Pour l’installer : cd ${NEW_SERVICE_DIR} && yarn install"
