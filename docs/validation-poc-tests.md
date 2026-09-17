# Validation du POC — 17 septembre 2026

Validation locale effectuée sur la version de démonstration Docker + k3s.
Les suites sont exécutées successivement, sans reconstruire ni lancer une seconde stack.

## Résultats

| Suite | Résultat |
|---|---|
| Unitaires Jest : gateway et 11 services | 81 suites, 312 tests réussis ; couverture et seuils configurés respectés |
| Intégration PostgreSQL du service produits | 7 suites, 29 tests réussis |
| E2E HTTP des catégories | 1 suite, 9 tests réussis |
| E2E achat sur Docker | 9 étapes réussies |
| E2E achat sur k3s | 9 étapes réussies |
| Navigateur Edge sur k3s | Catalogue → produit → panier → checkout → succès du paiement simulé ; connexion admin ; aucune erreur JavaScript |
| Contrôle final des deux tenants | Front/admin, connexion, catalogue, stock, tickets, panier, commandes payées et Prometheus OK |

Les unitaires couvrent gateway, assistant, auth, cart, log, order, page, payment,
product, stock, ticket et user. Le front et notifier n'ont pas de suite unitaire
existante à exécuter. L'achat E2E vérifie aussi inscription, refus de connexion avant
vérification, réception de l'email dans MailHog, validation de l'email et webhook de paiement.
Les réponses réelles Gemini avaient été validées dans la répétition précédente ;
cette passe exécute également ses tests unitaires.

## Charge légère

Profil `poc` : montée sur 5 s, deux utilisateurs pendant 20 s, descente sur 5 s.
Chaque scénario est exécuté séparément, avec les seuils du script conservés.

| Cible | Scénario | Requêtes | Erreurs HTTP | Latence p95 globale |
|---|---|---:|---:|---:|
| Docker | Lecture | 148 | 0 | 11,66 ms |
| Docker | Navigation + panier | 198 | 0 | 12,31 ms |
| k3s | Lecture | 151 | 0 | 10,96 ms |
| k3s | Navigation + panier | 198 | 0 | 13,72 ms |

Les assertions fonctionnelles et les seuils de latence passent sur les quatre essais.
Ces mesures valident le fonctionnement sous faible charge locale. Elles ne mesurent
ni la capacité maximale ni l'autoscaling, et ne constituent pas une comparaison
de performance représentative entre Docker et k3s.

## Ressources et données

- Jest : un seul processus de test à la fois, `--runInBand`, heap Node limité à 1536 Mio,
  affinité du processus PowerShell et de ses enfants limitée à deux processeurs logiques.
- k6 : conteneur limité à 0,5 CPU et 256 Mio, deux utilisateurs maximum.
- PostgreSQL de test : conteneur jetable limité à 0,5 CPU et 256 Mio, base
  `goosee_product_test` séparée des bases de démonstration, retiré après les tests.
- Navigateur : une page, mode headless, deux processus de rendu maximum, lancé après k6.
- Environ 6 à 6,6 Gio de mémoire physique libre aux relevés effectués pendant la passe ;
  ces relevés ponctuels ne constituent pas une mesure du pic mémoire.

Les E2E d'achat laissent leurs comptes, articles et commandes synthétiques identifiables
par le préfixe E2E ; l'achat navigateur utilise une adresse `browser-poc-…@goosee.test`.
Les données préchargées de démonstration sont conservées. La démo reste active.
Les relais MailHog et les conteneurs de test ont été arrêtés.

## Rejouer avec une consommation limitée

Exemple PowerShell pour la suite unitaire CI, depuis la racine :

```powershell
$env:NODE_OPTIONS='--max-old-space-size=1536'
(Get-Process -Id $PID).ProcessorAffinity = 3
yarn test:ci --concurrency=1 -- --runInBand
# page-service n'a pas de script test:ci :
yarn workspace page-service test --runInBand
```

La passe consignée ci-dessus a invoqué Jest séparément dans chaque service avec
`--coverage --ci --runInBand`, incluant page-service. Les logs de cette passe sont
dans le dossier temporaire Windows, sous `goosee-unit-*.log`, `goosee-product-*.log`,
`goosee-e2e-*.log`, `goosee-load-*.log` et `goosee-browser-k3s.log`.

Exemple de charge plafonnée sur le tenant Docker, depuis la racine :

```powershell
docker run --rm --cpus 0.5 --memory 256m `
  --add-host api.atelier-alice.127.0.0.1.nip.io:host-gateway `
  -v "${PWD}/load:/scripts:ro" `
  -e BASE_URL=http://api.atelier-alice.127.0.0.1.nip.io `
  -e SCENARIO=poc -e OWNER_EMAIL=alice@goosee.dev -e 'OWNER_PASSWORD=Demo#2026' `
  grafana/k6:latest run /scripts/parcours-navigation.js
```

Pour la lecture, remplacer le script par `gateway-lecture.js`. Pour k3s, remplacer
le domaine par `api.mode-bob.127.0.0.1.nip.io`, ajouter `:8081` dans BASE_URL et
utiliser `bob@goosee.dev`. Exécuter les scénarios successivement.

L'E2E achat existant est configurable via `E2E_BASE_URL`, `E2E_OWNER_EMAIL`,
`E2E_OWNER_PASSWORD` et `E2E_MAILHOG_URL` ; voir le
[guide E2E](../templates/back/api-gateway/test/README.md). Cette passe a utilisé un
relais local vers MailHog Docker et un port-forward temporaire pour MailHog k3s.
