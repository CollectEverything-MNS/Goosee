#!/usr/bin/env bash
# Construit une fois les images du site généré, réutilisées par chaque tenant.
# Usage : bash scripts/build-images.sh  (ou yarn build:images)
set -euo pipefail
cd "$(dirname "$0")/.."

build() {
  local name="$1" dockerfile="$2"
  echo "==> build goosee/${name}:local"
  docker build -f "$dockerfile" -t "goosee/${name}:local" .
}

build api-gateway      templates/back/api-gateway/Dockerfile
build auth-service     templates/back/services/auth-service/Dockerfile
build user-service     templates/back/services/user-service/Dockerfile
build page-service     templates/back/services/page-service/Dockerfile
build log-service      templates/back/services/log-service/Dockerfile
build product-service  templates/back/services/product-service/Dockerfile
build order-service    templates/back/services/order-service/Dockerfile
build notifier-service templates/back/services/notifier-service/Dockerfile
build front            templates/front/Dockerfile

echo "✅ Toutes les images goosee/*:local sont construites."
