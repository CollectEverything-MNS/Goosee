#!/usr/bin/env bash
#
# Rebuild UNIQUEMENT les images dont le code a changé depuis le dernier tag (la dernière
# version). Léger, natif, aucun registry : on ne reconstruit que ce qui a bougé.
#
# Usage :
#   bash scripts/rebuild-changed.sh            # depuis le dernier tag jusqu'au working tree
#   bash scripts/rebuild-changed.sh <ref>      # depuis une référence précise
#
# Déclenché automatiquement après un `git pull`/merge (hook husky post-merge), et dispo en
# manuel via `yarn rebuild`.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BASE="${1:-$(git describe --tags --abbrev=0 2>/dev/null || true)}"
if [ -z "$BASE" ]; then
  echo "[rebuild] aucun tag de référence — rien à reconstruire."
  exit 0
fi

CHANGED="$(git diff --name-only "$BASE" 2>/dev/null || true)"
if [ -z "$CHANGED" ]; then
  echo "[rebuild] aucun changement depuis $BASE."
  exit 0
fi

# Mappe les fichiers changés vers les images concernées (dédoublonné).
targets=""
add() { case " $targets " in *" $1 "*) ;; *) targets="$targets $1" ;; esac; }
while IFS= read -r f; do
  case "$f" in
    templates/front/*) add front ;;
    templates/back/api-gateway/*) add api-gateway ;;
    templates/back/services/*/*)
      add "$(printf '%s' "$f" | sed -E 's#templates/back/services/([^/]+)/.*#\1#')" ;;
  esac
done <<EOF
$CHANGED
EOF
targets="$(echo $targets)" # trim

if [ -z "$targets" ]; then
  echo "[rebuild] aucun service impacté depuis $BASE (changements hors images)."
  exit 0
fi

echo "[rebuild] services changés depuis $BASE : $targets"
if node scripts/build-demo-images.js $targets; then
  echo "[rebuild] OK — pense à « Mettre à jour » les sites concernés dans la supervision."
else
  echo "[rebuild] échec du build (voir ci-dessus) — les sites gardent leurs images actuelles." >&2
fi
