set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SERVICES_DIR="$ROOT_DIR/templates/back/services"

if ! command -v yarn >/dev/null 2>&1; then
  echo "yarn n'est pas installé ou introuvable dans le PATH. Installez Yarn d'abord." >&2
  exit 1
fi

FRONT_DIR="$ROOT_DIR/templates/front"
API_GATEWAY_DIR="$ROOT_DIR/templates/back/api-gateway"

# Installation du frontend
echo "\n=== Installation des dépendances pour: frontend ==="
if [ -f "$FRONT_DIR/package.json" ]; then
  yarn --cwd "$FRONT_DIR" install || {
    echo "Échec de yarn install dans frontend" >&2
    exit 1
  }
else
  echo "Skipping frontend (pas de package.json)"
fi

# Installation de l'API Gateway
echo "\n=== Installation des dépendances pour: api-gateway ==="
if [ -f "$API_GATEWAY_DIR/package.json" ]; then
  yarn --cwd "$API_GATEWAY_DIR" install || {
    echo "Échec de yarn install dans api-gateway" >&2
    exit 1
  }
else
  echo "Skipping api-gateway (pas de package.json)"
fi

# Installation des microservices
echo "\n🔍 Recherche des services dans: $SERVICES_DIR"
if [ ! -d "$SERVICES_DIR" ]; then
  echo "Le dossier services/ est introuvable: $SERVICES_DIR" >&2
  exit 1
fi

for d in "$SERVICES_DIR"/*/; do
  [ -d "$d" ] || continue
  service_name="$(basename "$d")"
  if [ -f "$d/package.json" ]; then
    echo "\n=== Installation des dépendances pour: $service_name ==="
    yarn --cwd "$d" install || {
      echo "Échec de yarn install dans $service_name" >&2
      exit 1
    }
  else
    echo "Skipping $service_name (pas de package.json)"
  fi
done

echo "\n✅ Installation terminée pour le frontend, l'API Gateway et tous les microservices."
