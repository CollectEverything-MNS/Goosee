#!/bin/bash
set -e

# Install Front dependencies
echo "-----------------------------------------------------------------"
echo "📦 Installation des dépendances du projet de front"
echo "-----------------------------------------------------------------"
cd templates/front/ && yarn install && cd ../../

# Install Service dependencies
echo "-----------------------------------------------------------------"
echo "📦 Installation du micro service : _template"
echo "-----------------------------------------------------------------"
cd templates/back/services/_template && yarn install && cd ../../../../


echo "✅ Installation complete."
