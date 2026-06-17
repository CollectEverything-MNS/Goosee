#!/usr/bin/env bash
# Construit une fois les images du site généré, réutilisées par chaque tenant.
# Usage : bash scripts/build-images.sh  (ou yarn build:images)
set -euo pipefail
cd "$(dirname "$0")/.."

build() {
  local name="$1" dockerfile="$2" extra="${3:-}"
  echo "==> build goosee/${name}:local"
  docker build $extra -f "$dockerfile" -t "goosee/${name}:local" .
}

# Clé publique Stripe (test) à inliner dans le front (depuis env/.env.dev si présent).
STRIPE_PK=$(grep -E '^NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=' env/.env.dev 2>/dev/null | cut -d= -f2- || true)

build api-gateway      templates/back/api-gateway/Dockerfile
build auth-service     templates/back/services/auth-service/Dockerfile
build user-service     templates/back/services/user-service/Dockerfile
build page-service     templates/back/services/page-service/Dockerfile
build log-service      templates/back/services/log-service/Dockerfile
build product-service  templates/back/services/product-service/Dockerfile
build order-service    templates/back/services/order-service/Dockerfile
build cart-service     templates/back/services/cart-service/Dockerfile
build payment-service  templates/back/services/payment-service/Dockerfile
build notifier-service templates/back/services/notifier-service/Dockerfile
build front            templates/front/Dockerfile "--build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${STRIPE_PK}"

echo "✅ Toutes les images goosee/*:local sont construites."
