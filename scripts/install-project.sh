#!/bin/bash
set -e

# Install Front dependencies
echo "-----------------------------------------------------------------"
echo "📦 Installation des dépendances du projet de front"
echo "-----------------------------------------------------------------"
cd apps/front/ && yarn install && cd ../../../

# Install Service dependencies
echo "-----------------------------------------------------------------"
echo "📦 Installation du micro service : _template"
echo "-----------------------------------------------------------------"
cd apps/back/_template && yarn install && cd ../../../


echo "✅ Installation complete."
