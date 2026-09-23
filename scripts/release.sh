#!/usr/bin/env bash
#
# Release Goosee : construit les images du template et les fige sous un tag de version
# immuable (goosee/<service>:<version>), puis écrit la version dans le fichier VERSION.
#
# Une fois la release faite, la supervision (ou la bannière du client) déploie cette version :
# l'orchestrateur détecte l'image goosee/front:<version> et lance `IMAGE_TAG=<version> compose up`.
# Rollback : relancer une montée de version en pointant une version précédente encore taguée.
#
# Usage : bash scripts/release.sh <version>     ex. bash scripts/release.sh 1.1.0
set -euo pipefail

VERSION="${1:-}"
if [[ -z "$VERSION" ]]; then
  echo "Usage : bash scripts/release.sh <version>  (ex. 1.1.0)" >&2
  exit 1
fi
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+([-.][0-9A-Za-z]+)*$ ]]; then
  echo "Version invalide : '$VERSION' (attendu du semver, ex. 1.1.0 ou 1.2.0-rc.1)" >&2
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "▸ Construction des images du template (:local)…"
yarn build:images

echo "▸ Marquage des images sous le tag $VERSION…"
# Toutes les images goosee/*:local produites par le build sont figées sous :<version>.
mapfile -t IMAGES < <(docker images --format '{{.Repository}}:{{.Tag}}' 'goosee/*:local')
if [[ ${#IMAGES[@]} -eq 0 ]]; then
  echo "Aucune image goosee/*:local trouvée après le build." >&2
  exit 1
fi
for img in "${IMAGES[@]}"; do
  repo="${img%:local}"
  docker tag "$img" "${repo}:${VERSION}"
  echo "   ${repo}:${VERSION}"
done

echo "$VERSION" > VERSION
echo "▸ VERSION=$VERSION"
echo
echo "✓ Release $VERSION prête."
echo "  Déploie-la sur un site depuis la supervision (bouton « Mettre à jour »)"
echo "  ou laisse le client l'installer via sa bannière."
