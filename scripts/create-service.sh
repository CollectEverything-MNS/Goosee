#!/bin/bash
set -e

# --- CONFIG ---
TEMPLATE_DIR="templates/back/services/_template"
TARGET_DIR="templates/back/services"
ENV_FILE="env/.env.dev"
DOCKER_COMPOSE_FILE="docker/dev/docker-compose.back.dev.yml"
# ---------------

# Vérification des arguments
if [ -z "$1" ]; then
  echo "❌ Erreur : tu dois donner un nom de service."
  echo "👉 Exemple : ./scripts/create-service.sh user-service"
  exit 1
fi

SERVICE_NAME=$1
NEW_SERVICE_DIR="${TARGET_DIR}/${SERVICE_NAME}"

# Crée le dossier cible s’il n’existe pas
mkdir -p "$TARGET_DIR"

# Vérifie que le dossier de destination n’existe pas déjà
if [ -d "$NEW_SERVICE_DIR" ]; then
  echo "❌ Le service '${SERVICE_NAME}' existe déjà."
  exit 1
fi

# Vérifie que le template existe
if [ ! -d "$TEMPLATE_DIR" ]; then
  echo "❌ Le dossier $TEMPLATE_DIR n'existe pas. Crée ton template d'abord."
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

# --- AJOUT AUTOMATIQUE AU FICHIER .env ---
if [ -f "$ENV_FILE" ]; then
  echo "🌱 Mise à jour du fichier $ENV_FILE..."

  SERVICE_ENV_NAME=$(echo "$SERVICE_NAME" | tr '[:lower:]' '[:upper:]' | tr '-' '_')

  # Calcul d’un port auto (prend le dernier utilisé)
  LAST_PORT=$(grep "_SERVICE_PORT" "$ENV_FILE" | awk -F= '{print $2}' | sort -n | tail -1)
  if [ -z "$LAST_PORT" ]; then
    NEXT_PORT=3000
  else
    NEXT_PORT=$((LAST_PORT + 1))
  fi

  {
    echo ""
    echo "# ${SERVICE_ENV_NAME}"
    echo "${SERVICE_ENV_NAME}_HOST=goosee-${SERVICE_NAME}-dev"
    echo "${SERVICE_ENV_NAME}_PORT=${NEXT_PORT}"
  } >> "$ENV_FILE"

  echo "✅ Variables ajoutées dans $ENV_FILE :"
  echo "   ${SERVICE_ENV_NAME}_HOST=goosee-${SERVICE_NAME}-dev"
  echo "   ${SERVICE_ENV_NAME}_PORT=${NEXT_PORT}"
else
  echo "⚠️  Fichier $ENV_FILE introuvable, variables non ajoutées."
fi

# --- AJOUT AUTOMATIQUE DES ENV DANS L'API GATEWAY ---
if [ -f "$DOCKER_COMPOSE_FILE" ]; then
  echo "🔄 Ajout des variables du nouveau service dans goosee-api-gateway-dev..."

  if grep -q "goosee-api-gateway-dev:" "$DOCKER_COMPOSE_FILE"; then
    awk -v e="$SERVICE_ENV_NAME" '
      BEGIN {in_gateway=0}
      /^  goosee-api-gateway-dev:/ {in_gateway=1}
      in_gateway && /^[[:space:]]+environment:/ {
        print;
        print "      " e "_HOST: ${" e "_HOST}";
        print "      " e "_PORT: ${" e "_PORT}";
        in_gateway=0;
        next
      }
      {print}
    ' "$DOCKER_COMPOSE_FILE" > "${DOCKER_COMPOSE_FILE}.tmp" && mv "${DOCKER_COMPOSE_FILE}.tmp" "$DOCKER_COMPOSE_FILE"

    echo "✅ Variables ${SERVICE_ENV_NAME}_HOST et ${SERVICE_ENV_NAME}_PORT ajoutées à goosee-api-gateway-dev."
  else
    echo "⚠️  Service goosee-api-gateway-dev introuvable dans $DOCKER_COMPOSE_FILE, ajout manuel requis."
  fi
fi

# --- AJOUT AUTOMATIQUE AU DOCKER-COMPOSE ---
if [ -f "$DOCKER_COMPOSE_FILE" ]; then
  echo "🐳 Mise à jour du fichier docker-compose.back.dev.yml..."

  SERVICE_CONTAINER="goosee-${SERVICE_NAME}-dev"

  if grep -q "${SERVICE_CONTAINER}:" "$DOCKER_COMPOSE_FILE"; then
    echo "⚠️  Le service '${SERVICE_CONTAINER}' existe déjà dans docker-compose. Aucun ajout effectué."
  else
    if grep -q "^networks:" "$DOCKER_COMPOSE_FILE"; then
      echo "🔧 Insertion du nouveau service dans docker-compose..."

      awk -v f="$NEW_SERVICE_DIR" -v s="$SERVICE_NAME" -v e="$SERVICE_ENV_NAME" '
        /^networks:/ {
          print "";
          print "  goosee-" s "-dev:";
          print "    container_name: goosee-" s "-dev";
          print "    build:";
          print "      context: ../../" f;
          print "      dockerfile: Dockerfile.dev";
          print "    command: yarn dev";
          print "    environment:";
          print "      NODE_ENV: ${NODE_ENV}";
          print "      " e "_PORT: ${" e "_PORT}";
          print "    expose:";
          print "      - \"${" e "_PORT}\"";
          print "    healthcheck:";
          print "      test: [\"CMD-SHELL\", \"nc -z localhost ${" e "_PORT}\"]";
          print "      interval: 5s";
          print "      timeout: 3s";
          print "      retries: 10";
          print "      start_period: 5s";
          print "    networks:";
          print "      - goosee_net";
          print "";
        }
        { print; }
      ' "$DOCKER_COMPOSE_FILE" > "${DOCKER_COMPOSE_FILE}.tmp" && mv "${DOCKER_COMPOSE_FILE}.tmp" "$DOCKER_COMPOSE_FILE"

      echo "✅ Bloc ajouté dans docker-compose.back.dev.yml"
    else
      echo -e "\n# Docker Compose: ajout manuel requis (pas de bloc networks trouvé)" >> "$DOCKER_COMPOSE_FILE"
    fi
  fi
else
  echo "⚠️  Fichier $DOCKER_COMPOSE_FILE introuvable, Docker non mis à jour."
fi

# Nettoyage final
echo "✨ Service '${SERVICE_NAME}' créé avec succès !"
echo "➡️  Dossier : ${NEW_SERVICE_DIR}"
echo "➡️  Pour l’installer : cd ${NEW_SERVICE_DIR} && yarn install"
