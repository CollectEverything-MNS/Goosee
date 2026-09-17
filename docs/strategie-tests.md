# Stratégie de tests et couverture

Référence mise à jour le 17 septembre 2026. Les résultats exécutés sont consignés dans
[validation-poc-tests.md](validation-poc-tests.md).

## Périmètre

Les tests unitaires Jest portent sur les usecases et, selon le service, les clients,
les gardes auxiliaires, les DTO, les seeders ou les contrôleurs. Les dépendances externes
sont simulées ; cette suite ne requiert pas de stack Docker.

| Workspaces | Passage en CI | Seuil de couverture |
|---|---|---|
| product, order, cart, payment | Oui | 70 % branches, fonctions, lignes et instructions |
| assistant | Oui | 70 % branches, fonctions, lignes et instructions |
| api-gateway, auth, user, stock, log, ticket | Oui | Aucun seuil configuré |
| page | Tests présents, mais pas de script test:ci | Aucun seuil configuré |
| front, notifier | Aucune suite unitaire existante | Sans objet |

Les noms des services ci-dessus correspondent aux workspaces suffixés par `-service` ;
la gateway utilise `api-gateway-goosee`. Le périmètre de couverture est défini dans
`jest.collectCoverageFrom` du package de chaque workspace. Les quatre services commerce
avec seuil mesurent leurs usecases ; assistant mesure aussi `shared/**/*.ts`.
Le seuil est appliqué à chaque service concerné, sans moyenne globale entre services.

## Commandes

| Commande | Effet |
|---|---|
| `yarn test` | Suites unitaires des workspaces déclarant test |
| `yarn test:ci` | Suites déclarant test:ci, avec couverture et seuils configurés |
| `yarn workspace page-service test --runInBand` | Tests de page, absents de la commande CI |
| `yarn e2e` | Parcours d'achat HTTP sur une stack démarrée |
| `yarn workspace product-service test:integration` | Repositories et migration sur une base PostgreSQL de test |
| `yarn workspace product-service test:e2e` | Contrôleurs catégories sur une base PostgreSQL de test |
| `node scripts/check-demo.js --chatbot` | Contrôle des deux tenants de démo avec appels Gemini réels |

Pour limiter le CPU et la mémoire, exécuter les suites successivement :

```powershell
$env:NODE_OPTIONS='--max-old-space-size=1536'
(Get-Process -Id $PID).ProcessorAffinity = 3
yarn test:ci --concurrency=1 -- --runInBand
yarn workspace page-service test --runInBand
```

Les tests PostgreSQL exigent une base jetable dont le nom contient `test` : ils
synchronisent et vident les tables. Configurer les variables PRODUCT_DB_* pour cette base.
Ne pas les pointer vers les bases de la démo.

## Intégration continue

Le [workflow CI](../.github/workflows/ci.yml) tourne sur push et pull request vers develop :
Node 22, cache des téléchargements Yarn indexé par le hash de `yarn.lock`, installation
`yarn install --frozen-lockfile --non-interactive`, puis `yarn test:ci`.
Le lockfile est versionné. Un test en échec ou un seuil configuré non atteint bloque le job.
Ajouter un service à cette suite nécessite son script `test:ci` ; un seuil se configure
séparément selon le périmètre mesuré.

## Intégration, E2E et charge

Ces suites restent manuelles et ne sont pas lancées par le workflow unitaire :

- [E2E achat](../templates/back/api-gateway/test/README.md) : inscription, email MailHog,
  connexion, panier, commande, paiement simulé et webhook. La cible est configurable.
- [Charge](analyse-performance.md) : k6 lecture et navigation, profils poc/smoke/load.
- [Validation POC](validation-poc-tests.md) : 312 unitaires, 29 intégration,
  9 E2E catégories, 9 étapes d'achat sur chaque tenant et vérification navigateur.

La vérification navigateur consignée dans ce dernier rapport a utilisé un script temporaire ;
elle ne constitue pas encore une suite navigateur versionnée et branchée à la CI.
