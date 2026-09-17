# Scénario de présentation Goosee POC

Lancer `yarn presentation` depuis Goosee. La configuration garde une boutique Docker
et une boutique k3s actives. Comptes et diagnostics : [guide infra](docs/demo-infra.md).

## 1. Vitrine et boutique Docker

1. Ouvrir http://localhost:3100/fr avec alice@goosee.dev / Demo#2026.
2. Ouvrir « Mes sites » : L'Atelier d'Alice apparaît actif avec son infrastructure Docker.
3. Ouvrir http://atelier-alice.127.0.0.1.nip.io/fr et parcourir les produits.
4. Ajouter un produit au panier, remplir la commande puis cliquer sur
   « Simuler le paiement (aucun débit) ». Montrer la page de succès.
5. Ouvrir /fr/goosee-admin avec le même compte ; montrer commandes, stocks et tickets.
6. Poser au chatbot Gemini : « Comment ajouter un produit ? ».

## 2. Boutique Kubernetes et supervision

1. Ouvrir http://mode-bob.127.0.0.1.nip.io:8081/fr et montrer le catalogue.
2. Ouvrir /fr/goosee-admin avec bob@goosee.dev / Demo#2026 ; montrer les données et Gemini.
3. Dans la vitrine, utiliser superadmin@goosee.dev / Superadmin#2026 puis /fr/superadmin
   pour montrer les deux tenants actifs, les KPI et les métriques.
   Les autres sites du registre restent arrêtés pour cette démo.
4. Montrer les cibles UP dans http://localhost:9090 puis les pods :

```powershell
kubectl --context k3d-goosee get pods,hpa -n tenant-mode-bob
kubectl --context k3d-goosee top pods -n tenant-mode-bob
```

K3s est une distribution légère de Kubernetes ; k3d l'exécute dans Docker.
Le serveur du cluster est plafonné à 2 CPU et 5 Gio. Les services et leurs bases
conservent leur propre consommation.

## 3. Rejouer la démonstration

```powershell
yarn presentation:down
node scripts/presentation.js --skip-build
node scripts/check-demo.js --chatbot
```

L'arrêt conserve les volumes et le cluster et laisse la vitrine disponible.
La relance retrouve les mêmes produits et commandes. Utiliser --skip-build seulement
si le code applicatif n'a pas changé depuis le dernier build.

La création en direct d'un nouveau client, le scale-to-zero via l'interface et la
montée en charge sont des scénarios séparés, non validés dans cette répétition.
