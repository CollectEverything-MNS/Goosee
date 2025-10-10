#!/bin/bash
set -e

# Install Front dependencies
echo "-----------------------------------------------------------------"
echo "📦 Installation des dépendances du projet : Front Goosee Vitrine"
echo "-----------------------------------------------------------------"
cd apps/front/goosee-vitrine && yarn install && cd ../../../

echo "-----------------------------------------------------------------"
echo "📦 Installation des dépendances du projet : Goosee Client Admin"
echo "-----------------------------------------------------------------"
cd apps/front/goosee-client-admin && yarn install && cd ../../../

echo "-----------------------------------------------------------------"
echo "📦 Installation des dépendances du projet : Goosee Admin Vitrine"
echo "-----------------------------------------------------------------"
cd apps/front/goosee-client-vitrine && yarn install && cd ../../../


echo "✅ Installation complete."
