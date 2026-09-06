# Stratégie de tests & couverture

> Périmètre couvert par ce document : tests **unitaires** des microservices métier et
> **portail bloquant en CI**. La suite end-to-end et la campagne de charge font l'objet
> de documents séparés (`cahier-de-recette.md`, `analyse-performance.md`).

## 1. Ce qui est testé

Les microservices suivent une architecture *clean* : toute la logique métier vit dans
`src/usecases/<nom>/<nom>.usecase.ts`, isolée derrière des interfaces (repositories,
providers, clients HTTP/AMQP). Les tests unitaires portent **exclusivement sur ces
usecases**, avec toutes les dépendances mockées (aucune base de données, aucun réseau).

| Service | Usecases testés |
|---|---|
| `payment-service` | `create-payment`, `get-payment`, `handle-webhook` |
| `order-service` | `create-order`, `update-order-status`, `get-order`, `list-orders` |
| `cart-service` | `add-item`, `update-item`, `remove-item`, `clear-cart`, `get-cart` |

> `product-service` suit la même règle ; ses tests sont pris en charge séparément et
> seront ajoutés au portail CI de la même manière (script `test:ci` + `coverageThreshold`).

Les fichiers hors logique métier ne sont **pas** dans le périmètre de mesure :
`*.controller.ts` (délégation pure vers le usecase), `*.dto.ts` (déclaratif),
`*.entity.ts`, `*.module.ts`, `main.ts`, migrations, `config/`. Cf. `collectCoverageFrom`
dans le `package.json` de chaque service : `["usecases/**/*.usecase.ts"]`.

## 2. Le seuil : 70 % par service

La CI échoue si **un** service métier passe sous **70 %** de couverture (branches,
fonctions, lignes, instructions), mesuré sur le périmètre ci-dessus. Configuré via
`jest.coverageThreshold.global` dans le `package.json` de chaque service — Jest sort en
code ≠ 0 tout seul, il n'y a pas de script de vérification maison.

### Pourquoi 70 % et pas 60 %

60 % laisse passer un usecase critique entièrement non testé tant que les autres
compensent. 70 % sur la seule logique métier garantit que chaque usecase a au moins ses
chemins nominal + erreurs principaux couverts.

### Pourquoi 70 % et pas 100 %

- **Rendements décroissants.** Passer de ~80 % à 100 % oblige à tester des branches
  défensives (`if (!x) throw`), des cas d'erreur rares et du code trivial : beaucoup
  d'effort, très peu de bugs attrapés en plus.
- **Effet pervers sur la qualité des tests.** Un objectif de 100 % pousse à écrire des
  tests qui *exécutent* les lignes sans réellement *vérifier* le comportement, juste
  pour le chiffre.
- **Coût de maintenance.** Chaque refactoring casse alors des tests à faible valeur, et
  on finit par parsemer le code de `/* istanbul ignore */`.
- **CI bloquante pour de mauvaises raisons.** Une PR légitime se retrouve rejetée parce
  qu'une ligne de log ou une garde improbable n'est pas couverte.

Le seuil est un **plancher bloquant**, pas une cible : en pratique les usecases testés
sont à 95–100 %. Viser plus haut est encouragé, mais non imposé par la CI.

### Par service et non agrégé

Le seuil s'applique **service par service**. Une moyenne globale permettrait à un
service bien testé (90 %) de masquer un service à 20 %. Chaque service doit tenir seul
ses 70 %.

## 3. Exécution

| Commande | Effet |
|---|---|
| `yarn test` | tous les tests de tous les workspaces (turbo), sans couverture |
| `yarn test:ci` | `turbo run test:ci` → `jest --coverage --ci` sur les services qui déclarent le script (payment, order, cart) ; **applique le seuil** |
| `yarn workspace <service> test` | tests d'un seul service |

Localement, `yarn test:ci` reproduit exactement ce que fait la CI.

## 4. Intégration continue

Workflow : [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

- **Déclencheurs** : `pull_request` vers `develop`, `push` sur `develop`.
- **Étapes** : checkout → Node 22 (+ cache yarn) → `yarn install --frozen-lockfile`
  → `yarn test:ci`.
- **Critère d'échec** : un test qui casse **ou** un service sous 70 % de couverture.
- Pas de base de données ni de conteneur de service : les tests unitaires mockent
  toutes les I/O.

`turbo run test:ci` ne cible que les workspaces déclarant le script `test:ci`. Ajouter
un service au portail = ajouter `"test:ci": "jest --coverage --ci"` et le bloc
`coverageThreshold` à son `package.json`.

Le workflow `discord-commit.yml` est indépendant et n'est pas modifié.
