# Stratégie de tests & couverture

> Périmètre couvert par ce document : tests **unitaires** des microservices métier et
> **portail bloquant en CI**. La suite end-to-end et la campagne de charge font l'objet
> de documents séparés (`cahier-de-recette.md`, `analyse-performance.md`).

## 1. Ce qui est testé

Les microservices suivent une architecture _clean_ : toute la logique métier vit dans
`src/usecases/<nom>/<nom>.usecase.ts`, isolée derrière des interfaces (repositories,
providers, clients HTTP/AMQP). Les tests unitaires portent **exclusivement sur ces
usecases**, avec toutes les dépendances mockées (aucune base de données, aucun réseau).

| Service           | Usecases testés                                                    |
| ----------------- | ------------------------------------------------------------------ |
| `payment-service` | `create-payment`, `get-payment`, `handle-webhook`                  |
| `order-service`   | `create-order`, `update-order-status`, `get-order`, `list-orders`  |
| `cart-service`    | `add-item`, `update-item`, `remove-item`, `clear-cart`, `get-cart` |
| `product-service` | les 24 usecases produits, catégories, tags, attributs et images    |

### Services techniques : tests joués en CI, sans seuil de couverture

`api-gateway`, `stock-service`, `auth-service` et `user-service` ne suivent pas
l'architecture usecase pure ci-dessus (gateway : controllers/interceptors ; les autres :
`collectCoverageFrom` couvre tout `src/**/*.(t|j)s`, pas seulement les usecases). Leurs
tests existants sont joués en CI (`"test:ci": "jest --coverage --ci"`, sans
`coverageThreshold`), pour qu'un test qui casse fasse échouer la CI — mais sans imposer
un seuil de 70 % qui n'a pas de sens tant que la mesure porte sur tout le code plutôt que
sur la seule logique métier (ex. gateway : 1,1 % de couverture globale même avec ses
tests existants tous verts, car controllers/modules/proxy sont comptés).

Les fichiers hors logique métier ne sont **pas** dans le périmètre de mesure :
`*.controller.ts` (délégation pure vers le usecase), `*.dto.ts` (déclaratif),
`*.entity.ts`, `*.module.ts`, `main.ts`, migrations, `config/`. Cf. `collectCoverageFrom`
dans le `package.json` de chaque service : `["usecases/**/*.usecase.ts"]`.

## 2. Le seuil : 70 % par service

La CI échoue si **un** service métier passe sous **70 %** de couverture (branches,
fonctions, lignes, instructions), mesuré sur le périmètre ci-dessus. Configuré via
`jest.coverageThreshold.global` dans le `package.json` de chaque service — Jest sort en
code ≠ 0 tout seul, il n'y a pas de script de vérification maison.

### Pourquoi 70 % et pas 100 %

- **Rendements décroissants.** Passer de ~80 % à 100 % oblige à tester des branches
  défensives (`if (!x) throw`), des cas d'erreur rares et du code trivial : beaucoup
  d'effort, très peu de bugs attrapés en plus.
- **Effet pervers sur la qualité des tests.** Un objectif de 100 % pousse à écrire des
  tests qui _exécutent_ les lignes sans réellement _vérifier_ le comportement, juste
  pour le chiffre.
- **Coût de maintenance.** Chaque refactoring casse alors des tests à faible valeur, et
  on finit par parsemer le code de `/* istanbul ignore */`.
- **CI bloquante pour de mauvaises raisons.** Une PR légitime se retrouve rejetée parce
  qu'une ligne de log ou une garde improbable n'est pas couverte.

### Par service et non agrégé

Le seuil s'applique **service par service**. Une moyenne globale permettrait à un
service bien testé (90 %) de masquer un service à 20 %. Chaque service doit tenir seul
ses 70 %.

## 3. Exécution

| Commande                        | Effet                                                                                                                                                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yarn test`                     | tous les tests de tous les workspaces (turbo), sans couverture                                                                                                                                                                        |
| `yarn test:ci`                  | `turbo run test:ci` → `jest --coverage --ci` sur les services qui déclarent le script. Seuil 70 % appliqué pour payment/order/cart/product ; api-gateway, stock-service, auth-service et user-service jouent leurs tests sans seuil (voir §1) |
| `yarn workspace <service> test` | tests d'un seul service                                                                                                                                                                                                               |

Localement, `yarn test:ci` reproduit exactement ce que fait la CI.

## 4. Intégration continue

Workflow : [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

- **Déclencheurs** : `pull_request` vers `develop`, `push` sur `develop`.
- **Étapes** : checkout → Node 22 → restauration du cache des tarballs yarn
  (clé = hash des `package.json`) → `yarn install --non-interactive` → `yarn test:ci`.
- **Critère d'échec** : un test qui casse **ou** un service sous 70 % de couverture.
- Pas de base de données ni de conteneur de service : les tests unitaires mockent
  toutes les I/O.

> `yarn.lock` n'est pas versionné (`.gitignore`). La CI ne peut donc utiliser ni
> `cache: yarn` de `setup-node` ni `--frozen-lockfile`. Elle met seulement en
> cache le dossier de tarballs de yarn (`yarn cache dir`) : `yarn install`
> reconstruit `node_modules` à chaque run mais sans téléchargement réseau. Le
> cache est invalidé dès qu'un `package.json` change.

`turbo run test:ci` ne cible que les workspaces déclarant le script `test:ci`. Ajouter
un service au portail = ajouter `"test:ci": "jest --coverage --ci"` et le bloc
`coverageThreshold` à son `package.json`.

Le workflow `discord-commit.yml` est indépendant et n'est pas modifié.
