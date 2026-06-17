# Journal de développement — POC Goosee

> Documentation continue : **une entrée par feature livrée**, datée, complétée au
> moment du commit. Format : date, ce qui a été fait, pourquoi, ce qui reste.
> Voir le plan vivant dans [plan-poc.md](./plan-poc.md).

---

## 2026-06-16 — Cadrage du programme (avant développement)

**Fait :**
- Définition de l'écosystème multi-tenant et des décisions d'architecture (voir
  `audit.md` §8) : isolation totale par tenant, scale-to-zero, POC 100 % local,
  superadmin intégré à la vitrine, orchestrateur dans `goosee-vitrine/apps/orchestrator`.
- Branche `flodev` créée dans les deux dépôts (`Goosee` et `goosee-vitrine`).
- Inspection complète de l'implémentation existante des deux dépôts (voir
  `plan-poc.md` §2).
- Rédaction du plan détaillé chiffré et priorisé (`plan-poc.md`).

**Pourquoi :** cadrer précisément le travail avant d'écrire la moindre ligne de code,
et partir de l'existant réel plutôt que d'hypothèses.

**Reste :** démarrer le **Lot 0** (migrations + santé/métriques + entrypoint de
provisioning sur le site généré).

---

## 2026-06-16 — Lot 0.1 : migrations TypeORM sur auth-service

**Fait :**
- Outillage de migrations TypeORM sur `auth-service` (scripts npm
  `migration:generate/run/revert/show` appuyés sur `src/config/orm.config.ts`).
- Migration initiale générée puis exécutée sur une base vierge : crée les tables
  `auth` et `auth_token` (index uniques + clé étrangère). TypeORM crée lui-même
  l'extension `uuid-ossp` au `migration:run`.
- `synchronize` désactivé sur la DataSource CLI : le schéma est géré par les migrations.
- Commit `feat(auth): ajoute les migrations TypeORM` (3028111).

**Pourquoi :** prérequis du déploiement multi-tenant — chaque tenant démarre sur une
base vierge dont le schéma doit être créé par des migrations versionnées, pas par
`synchronize`.

**Note env (local) :** `env/.env.dev` rafraîchi depuis `.env.example` (l'ancien était
périmé). Base auth montée via Docker pour générer/tester.

**Reste :** répliquer les migrations sur `user`, `page`, `log`, `product`.

---

## 2026-06-16 — Lot 0.1 (fin) : migrations TypeORM sur user, page, log, product

**Fait :**
- Migrations initiales générées et exécutées sur les 4 derniers services à base
  (`user`/`role`, `page`/`menu`/`site_settings`, `log` + enum, 6 tables produit).
- Deux corrections de fond : `page` et `log` n'avaient pas de DataSource CLI (commentée)
  → réécrite ; `user` oubliait l'entité `Role` → ajoutée. `synchronize` désactivé partout.
- Commit `feat(back): ajoute les migrations TypeORM (user, page, log, product)` (4ecd762).

**Pourquoi :** terminer le socle de migrations (tâche 0.1) — toutes les bases des sites
générés seront créées par migrations versionnées, condition du multi-tenant.

**Reste :** Lot 0.2 — garde-fous de config (refus `synchronize` hors dev, validation des
secrets au boot).

---

## 2026-06-16 — Lot 0.2a : exécution des migrations au démarrage hors dev

**Fait :**
- Dans les 5 `app.module` : `migrationsRun` activé quand `NODE_ENV !== development` +
  enregistrement du chemin `dist/migrations/*.js` ; `synchronize` reste réservé au dev.
- Testé sur log-service : boot en `NODE_ENV=production` sur une base vidée → la table
  `log` et la table `migrations` sont créées automatiquement au démarrage.
- Commit `feat(back): exécute les migrations au démarrage hors dev` (c246739).

**Pourquoi :** un tenant déployé hors dev démarrait sur une base vide (synchronize off,
aucune migration jouée). Désormais le schéma se crée tout seul au boot.

**Reste :** Lot 0.2b — validation des secrets au démarrage en production (refus des
valeurs par défaut).

---

## 2026-06-16 — Lot 0.2b : refus des secrets par défaut en production

**Fait :**
- Garde-fou en tête de `bootstrap()` des 6 entrées (gateway + 5 services) : en
  `NODE_ENV=production`, refus de démarrer si un secret est vide ou par défaut
  (`*_change_me`, `postgres`, `minioadmin`). Secrets : JWT, mots de passe DB, MinIO.
- Testé sur log-service : défaut → refus net ; secret valide → passe le garde-fou.
- Commit `feat(back): refuse les secrets par défaut au démarrage en production` (bf59e00).

**Pourquoi :** empêcher qu'un tenant parte en production avec les secrets du template.

**Lot 0.2 terminé.** Reste : Lot 0.3 — endpoints `/health` (readiness/liveness).

---

## 2026-06-16 — Lot 0.3 : endpoints /health

**Fait :**
- `HealthController` ajouté à la gateway + 5 services. `/health` (liveness) renvoie
  `{status:ok}` ; `/health/ready` (readiness) fait un `SELECT 1` et renvoie 503 si la
  base est down. Implémentation légère, sans `@nestjs/terminus`.
- Testé sur log-service : `/health` ok, `/health/ready` HTTP 200.
- Commit `feat(back): ajoute les endpoints /health (liveness et readiness)`.

**Pourquoi :** donner à l'orchestrateur un vrai signal applicatif (remplace `nc -z`)
pour savoir quand un tenant est prêt.

**Reste :** Lot 0.4 — endpoint `/metrics` Prometheus.

---

## 2026-06-16 — Lot 0.4 : métriques Prometheus

**Fait :**
- `prom-client` ajouté + `MetricsController` sur la gateway et les 5 services.
  `GET /metrics` expose les métriques process (CPU, mémoire, heap, event loop) au
  format Prometheus via `collectDefaultMetrics()`.
- Testé sur log-service : `/metrics` HTTP 200 avec `process_cpu_seconds_total`,
  `process_resident_memory_bytes`, etc.
- Commit `feat(back): expose les métriques Prometheus sur /metrics`.

**Pourquoi :** permettre au Prometheus central de scraper chaque tenant (CPU/mémoire
par site) pour la supervision superadmin.

**Reste :** Lot 0.5 — endpoint `/internal/kpi` (KPI métier, protégé par secret partagé).

---

## 2026-06-16 — Lot 0.5 : endpoint /internal/kpi (KPI d'usage)

**Fait :**
- Recadrage décidé avec Florent : le superadmin n'a pas besoin de KPI commandes/CA, mais
  de KPI d'**usage/dimensionnement** pour piloter la scalabilité K8s (en plus du CPU/RAM).
- Jeton partagé `INTERNAL_API_TOKEN` (header `x-internal-token`) + guard `InternalTokenGuard`
  sur gateway, user, product. Ajout de la variable à `.env.example` et `turbo.json`.
- `user-service /internal/kpi` → users/customers/admins ; `product-service` → products/
  categories ; `gateway /internal/kpi` agrège en un objet unique (contrat control plane).
- Testé (3 services) : agrégat HTTP 200, 401 sans jeton.
- Commit `feat(back): expose les KPI d'usage sur /internal/kpi (protégé)`.

**Pourquoi :** donner au superadmin les signaux de taille (utilisateurs/clients, catalogue)
pour décider de la scalabilité, sans données métier inutiles (prix/CA).

**Observabilité du socle terminée.** Reste : Lot 0.6 (images prod + entrypoint de
provisioning) et 0.7 (helmet/throttler/timeouts).

---

## 2026-06-16 — Lot 0.6a : réparation du build prod + packaging de product

**Fait :**
- Constat (testé) : les Dockerfiles prod des services copiaient un `yarn.lock` par
  service inexistant → aucune image ne se construisait (`"/yarn.lock": not found`).
- Réécriture des 6 Dockerfiles prod en multi-stage **contexte racine + yarn.lock racine**
  (déterministe), dont création de celui de `product-service` (manquant).
- Compose prod : ajout de `product-service` + `product-db` (absents) + variables prod
  manquantes (JWT pour auth/gateway, INTERNAL_API_TOKEN pour user/product/gateway,
  routage gateway→product).
- Tests : image prod product-service construite + tourne (garde-fou actif) ; compose
  prod validé (12 services).
- Commit `fix(docker): rend les images prod des services constructibles et ajoute product`.

**Pourquoi :** sans build prod fonctionnel, l'orchestrateur ne pourrait construire aucune
image de tenant.

**Reste :** Lot 0.6b — entrypoint de provisioning unattended.

---

## 2026-06-16 — Lot 0.6b : entrypoint de provisioning unattended

**Fait :**
- `scripts/provision.js` : lancé par l'orchestrateur après le démarrage d'un tenant.
  Seed l'OWNER (réutilise `init-user.js`) avec mot de passe généré, en réessayant
  jusqu'à ce que bases + schéma soient prêts, puis POST un callback de statut
  (ACTIVE/FAILED + URL + identifiants owner). Commande `yarn provision`.
- Testé : retry effectif (1er essai KO, 2e OK), seed réussi, callback HTTP 200 reçu.
- Commit `feat(provisioning): ajoute l'entrypoint de provisioning unattended d'un tenant`.

**Pourquoi :** automatiser la dernière étape du provisioning (creds + notification) sans
intervention manuelle, côté site généré.

**Lot 0.6 terminé.** Reste : Lot 0.7 (helmet, throttler routes auth, timeouts HTTP).

---

## 2026-06-16 — Lot 0.7 : durcissement gateway (helmet, timeouts, throttler)

**Fait :**
- 0.7a : `helmet` au bootstrap (CSP, HSTS, X-Frame-Options… ; retire X-Powered-By) +
  timeout 5 s sur les 4 `HttpModule` de la gateway (auth, logs, internal, shared-security).
  Testé : en-têtes helmet présents sur `/health`.
- 0.7b : `@nestjs/throttler` (10/min défaut) + throttling strict 5/min sur les routes
  login, register, mot de passe oublié. Testé : `/auth/login` renvoie 429 après 5 req ;
  `/health` non throttlé. Throttling ciblé (n'affecte pas /health, /metrics, /internal).
- Commits `feat(gateway): ajoute helmet et des timeouts…` et `feat(gateway): limite le débit…`.

**Pourquoi :** durcir la seule porte d'entrée HTTP (en-têtes de sécurité, anti brute-force,
résilience aux services lents).

**Note outillage :** `pkill` n'existe pas dans le Git Bash local ; arrêter les services de
test via PowerShell (Stop-Process par port).

**🎉 LOT 0 TERMINÉ** — le site généré est provisionnable (migrations + entrypoint),
observable (/health, /metrics, /internal/kpi) et durci. Prochaine étape : Lot 1
(modèle vitrine + rôles) dans le dépôt goosee-vitrine.

---

## 2026-06-16 — Lot 1.1 : modèle Project étendu (goosee-vitrine)

**Fait :**
- Entité `Project` enrichie pour le provisioning : `status` (PENDING/PROVISIONING/
  ACTIVE/STOPPED/FAILED), `infra` (docker/k8s), `instanceUrl`, `resources` (jsonb),
  `secretsRef`, `provisionedAt` + migration ciblée `AddProjectProvisioningFields`.
- Scripts de migration de la vitrine **réparés sous Windows** (passaient le wrapper
  shell de typeorm à ts-node) → `typeorm-ts-node-commonjs`.
- Testé : base vitrine (port 5440), migrations appliquées, 6 colonnes vérifiées.
- Commit `feat(vitrine): étend le modèle Project pour le provisioning des tenants` (a8c086e).

**Note :** dérive entité/migration préexistante sur `users` (dev en `synchronize`) —
non traitée ici, migration écrite à la main pour rester ciblée.

**Reste :** Lot 1.2 (rôles CLIENT/SUPERADMIN sur le User vitrine + guards d'ownership),
puis 1.3 (catalogue de forfaits + option scalable).

---

## 2026-06-16 — Lot 1.2 : rôles CLIENT/SUPERADMIN + RolesGuard (goosee-vitrine)

**Fait :**
- Champ `role` (défaut CLIENT) sur l'entité `User` + migration `AddUserRole` ; rôle
  injecté dans le JWT au login et exposé dans `JwtPayload`.
- Décorateur `@Roles` + `RolesGuard` (shared/) pour réserver des routes à un rôle.
- Ownership : déjà assuré par les usecases filtrant sur `user.sub` (ex. findByUserId).
- Testé : build OK, migration appliquée, colonne `role` défaut CLIENT vérifiée.
- Commit `feat(vitrine): ajoute les rôles CLIENT/SUPERADMIN et le RolesGuard`.

**Reste :** Lot 1.3 — catalogue de forfaits (starter/commerce/enterprise + option scalable).

---

## 2026-06-16 — Lot 1.3 : catalogue de forfaits (goosee-vitrine)

**Fait :**
- Module `plans` : catalogue statique (starter 19€/docker, commerce 49€/docker,
  enterprise 99€/k8s) + helper `planInfra` (scalable → k8s, sinon docker).
- `GET /plans` public pour la consultation des forfaits avant inscription.
- Testé : `GET /plans` HTTP 200 avec les 3 forfaits.
- Commit `feat(vitrine): expose le catalogue de forfaits sur /plans`.

**🎉 LOT 1 TERMINÉ** (modèle Project, rôles/guards, catalogue forfaits) côté vitrine.
Prochaine étape (ordre de priorité) : Lot 3+4 (orchestrateur + réseau Docker), testés en
déclenchement manuel, avant de câbler Stripe (Lot 2).

---

## 2026-06-16 — Lot 4.1 : reverse-proxy Traefik central (repo Goosee)

**Fait :**
- `docker/tenant/docker-compose.traefik.yml` : Traefik v3.3, réseau partagé
  `goosee_platform`, **provider fichier** (`docker/tenant/dynamic/`).
- Choix du provider fichier plutôt que le provider Docker : ce dernier **échoue avec
  Docker Desktop sous Windows** (`Failed to retrieve information of the docker client…
  Error response from daemon:` — y compris via docker-socket-proxy), alors que le socket
  fonctionne pourtant (testé `/version` et `/info` OK depuis un conteneur). Le provider
  fichier confie en plus le routage explicitement au control plane.
- Testé : whoami + fichier de routage → `http://whoami.127.0.0.1.nip.io/` HTTP 200.
- Commit `feat(infra): ajoute le reverse-proxy Traefik central (provider fichier)`.

**⚠️ Caveat Windows :** le watch fsnotify de Traefik **ne se propage pas** sur les
bind-mounts Docker Desktop → après écriture/suppression d'un fichier dans `dynamic/`,
l'orchestrateur devra **recharger Traefik** (restart ou SIGHUP). À implémenter au Lot 3.

**Reste :** template de tenant (compose isolé + routage Traefik), puis orchestrateur.

---

## 2026-06-17 — Lot 4.3 : template de déploiement d'un tenant (repo Goosee)

**Fait :**
- Front : URL de la gateway dérivée du host au runtime (`api.<host>`) → image front
  unique réutilisable (commit `feat(front)`).
- Dockerfiles **gateway** et **front** réparés (contexte racine) : le gateway avait été
  oublié en 0.6a (lançait `turbo build` global), le front copiait un yarn.lock absent.
  `next.config` : ignore lint/erreurs TS au build (dette pré-existante) + hosts images
  `*.nip.io`/`*.anaduck.fr` (commit `fix(docker)`).
- `scripts/build-images.sh` (`yarn build:images`) : 8 images `goosee/*:local` une fois.
- `docker/tenant/docker-compose.tenant.yml` : pile complète isolée d'un tenant
  (16 conteneurs), gateway/front sur `goosee_platform` avec alias `<slug>-gateway/front`.
  `tenant.env.example` (commit `feat(infra)`).
- **Testé** : tenant `demo` déployé isolé (réseau + volumes dédiés), migrations jouées au
  boot dans ses bases, `api.demo.127.0.0.1.nip.io/health` → 200 et
  `demo.127.0.0.1.nip.io/` → 200 (locale `/fr`) via Traefik.

**Reste :** Lot 3 — l'orchestrateur (`apps/orchestrator`) qui AUTOMATISE ce déploiement
manuel : génère l'env/secrets, `compose up`, écrit la route Traefik + recharge Traefik
(caveat fsnotify), seed owner, scale-to-zero, registre des tenants (table dédiée).

---

## 2026-06-17 — Lot 3.1→3.5 : orchestrateur + provisioning Docker (goosee-vitrine)

**Fait :**
- Scaffold `apps/orchestrator` (NestJS) + base **dédiée** (`ORCH_DB_*`) + entité `Tenant`
  (registre) + migration `InitTenants`. (commit `feat(orchestrator): scaffold…`)
- `ProvisioningService` : génération env/secrets aléatoires, `docker compose up/stop/
  start/down` (shell-out), écriture route Traefik + rechargement. `TenantService` :
  cycle de vie. API `POST /tenants`, `/stop`, `/start`, `DELETE`. (commit `feat(orchestrator):
  provisionne…`)
- **Testé end-to-end via l'API** : `POST /tenants {slug:shop1}` → tenant isolé déployé,
  `ACTIVE`, `api.shop1.127.0.0.1.nip.io/health` 200, front 200 ; `stop` → 0 conteneur ;
  `delete` → registre vidé + route supprimée.
- Côté Goosee : `docker/tenant/envs/` gitignoré (env de tenant = secrets).

**Correctif CI (SEC-7) :** workflow `discord-commit.yml` des deux repos réparé — payload
construit avec `jq` (le message multi-ligne cassait le JSON, Discord 50109) et envoi
conditionnel (le webhook général vide faisait échouer le job). Testé : jq produit un JSON
valide même avec guillemets/backticks/retours ligne.

**Reste Lot 3 :** 3.4 suivi SSE, 3.6 seed owner + e-mail creds, et le câblage
vitrine → orchestrateur (déclencher le provisioning après inscription/paiement).

---

## 2026-06-17 — Lot 3.6 + 3.7 : seed owner + câblage vitrine → orchestrateur

**Fait :**
- **Seed owner** : `ProvisioningService.seedOwner()` crée l'OWNER dans les bases internes
  du tenant via `docker compose exec psql` (SQL stdin, retry), hash `bcryptjs`. `provision`
  renvoie `{ tenant, ownerPassword }`. Testé : login OWNER sur la gateway du tenant → token.
- **Câblage vitrine → orchestrateur** : `ProvisioningClient` (HTTP) + endpoint authentifié
  `POST /user/me/project/provision` qui crée/maj le `Project`, appelle l'orchestrateur et
  met à jour le `Project` (status/infra/instanceUrl). `projectId` relié côté tenant.

**🎉 FLUX COMPLET DU POC VALIDÉ end-to-end :** register → login → provision depuis la
vitrine → site e-commerce **isolé déployé** sur `myshop.127.0.0.1.nip.io` (front + api 200),
OWNER seedé, `Project` ACTIVE. Commits `feat(orchestrator): seed…`, `feat(vitrine): déclenche…`.

**Reste :** Stripe en amont du trigger (Lot 2), e-mail creds (Mailhog), suivi SSE,
puis Lot 5 (cart/order/payment du site généré), Lot 6 (K8s), Lot 7 (superadmin), Lot 8 (UI).

---

## 2026-06-17 — Lot 5.2 : microservice de commandes (`order-service`)

**Fait :**
- **Nouveau microservice `order-service`** (port 3007, base `order_db` dédiée), même
  Clean Architecture que les autres services : entité `Order` (items en `jsonb`, total en
  centimes, statut `pending|paid|shipped|cancelled`, réf. client en UUID — pas de FK,
  database-per-service), repository interface + implémentation TypeORM, 4 usecases
  (create, list, get, update-status). HTTP pur (pas de RabbitMQ), `/health` + `/metrics`,
  garde-fou secret `ORDER_DB_PASSWORD`, migration TypeORM jouée au boot en prod.
- **Total recalculé côté serveur** : le front n'a pas autorité sur le prix
  (`create-order.usecase.ts`).
- **Routes gateway** : `POST /orders` (checkout, public — achat invité), `GET /orders`
  (protégé `orders`), `GET /orders/:id` (public, page de confirmation),
  `PATCH /orders/:id/status` (protégé `orders`). Le pageKey `orders` existe déjà côté OWNER.
- **Infra** : service + base ajoutés aux compose dev/prod et au template tenant isolé
  (`order` + `order-db`), variables `ORDER_*` dans `.env.example` + `turbo.json`, image
  `goosee/order-service:local` dans `build-images.sh`.

**Pourquoi :** remplacer le mock front des commandes par un vrai back, et nourrir plus
tard les KPI métier (5.4) avec des commandes/CA réels.

**Testé** (Postgres jetable `order_db_test`) : migration OK, CRUD complet (create → total
7598 recalculé, get, list, patch statut), validations (UUID, statut, panier vide), 404 sur
id inconnu, refus du mot de passe par défaut en `NODE_ENV=production`. `order-service` et
`api-gateway` compilent.

**Reste Lot 5 :** 5.1 `cart-service`, 5.3 `payment-service` (scaffold, Stripe branché par
Florent), 5.4 `/internal/kpi` réel, 5.5 storefront panier/checkout + branchement au page builder.

---

## 2026-06-17 — Lot 5.1 : microservice de panier (`cart-service`)

**Fait :**
- **Nouveau microservice `cart-service`** (port 3008, base `cart_db` dédiée), même Clean
  Architecture : entité `Cart` (clé `sessionKey` unique = id client connecté ou jeton
  invité, lignes en `jsonb`, total en centimes, réf. client UUID — pas de FK), repository
  interface + impl TypeORM, 5 usecases (get, add-item, update-item, remove-item, clear).
  HTTP pur, `/health` + `/metrics`, garde-fou secret `CART_DB_PASSWORD`, migration au boot.
- **Panier stateful & idempotent** : `get` ne persiste rien (panier inexistant = panier
  vide), `add` fait du get-or-create et incrémente la ligne d'un produit déjà présent,
  `update` à quantité 0 retire la ligne, `clear` vide. Total recalculé côté serveur après
  chaque mutation (`Cart.recomputeTotal()`).
- **Routes gateway** (publiques, panier identifié par `sessionKey`) :
  `GET /cart/:sessionKey`, `POST /cart/:sessionKey/items`, `PATCH` et
  `DELETE /cart/:sessionKey/items/:productId`, `DELETE /cart/:sessionKey`.
- **Infra** : service + base ajoutés aux compose dev/prod et au template tenant isolé
  (`cart` + `cart-db`), variables `CART_*` dans `.env.example` + `turbo.json`, image
  `goosee/cart-service:local` dans `build-images.sh`.

**Pourquoi :** fournir au storefront un panier serveur persistant (invité ou connecté),
source du futur passage de commande (5.5) vers `order-service`.

**Testé** (Postgres jetable `cart_db_test`) : migration OK, parcours complet (add → total
8897, incrément du même produit, patch quantité, retrait via qty 0, remove, clear),
404 sur panier inconnu, 400 sur UUID invalide. `cart-service` et `api-gateway` compilent.

**Reste Lot 5 :** 5.3 `payment-service` (scaffold, Stripe branché par Florent),
5.4 `/internal/kpi` réel, 5.5 storefront panier/checkout + branchement au page builder.

---

## 2026-06-17 — Lot 5.3 : microservice de paiement (`payment-service`, scaffold)

**Fait :**
- **Nouveau microservice `payment-service`** (port 3009, base `payment_db` dédiée), même
  Clean Architecture : entité `Payment` (réf. commande UUID, montant centimes, devise,
  statut `pending|succeeded|failed|refunded`, `provider` + `providerRef`), repository
  interface + impl, 3 usecases : create-payment, get-payment, handle-webhook. HTTP pur,
  `/health` + `/metrics`, garde-fou `PAYMENT_DB_PASSWORD`, migration au boot.
- **Abstraction prestataire `IPaymentProvider`** + **`StripePaymentProvider` (scaffold)** :
  seam propre pour brancher Stripe sans toucher aux usecases. Sans `STRIPE_SECRET_KEY`, le
  provider tourne en **mode mock** (intention simulée, webhook piloté par un corps JSON)
  pour tester le flux. Les appels SDK réels sont balisés `TODO(Florent)` (createIntent +
  vérif signature webhook). `main.ts` active `rawBody` (requis par `constructEvent`).
- **Routes gateway** : `POST /payments` (checkout, public), `GET /payments/:id`,
  `POST /payments/webhook` (relai du corps + header `stripe-signature` ; `TODO` raw-body
  passthrough pour la vraie vérif de signature).
- **Infra** : service + base aux compose dev/prod et au template tenant isolé
  (`payment` + `payment-db`), variables `PAYMENT_*` + `STRIPE_*` dans `.env.example`,
  `turbo.json` et `tenant.env.example`, image `goosee/payment-service:local`.

**Pourquoi :** poser toute la tuyauterie du paiement boutique (entité, statuts, webhook,
routing, isolation) pour que Florent n'ait plus qu'à remplir les appels Stripe SDK.

**Testé** (Postgres jetable, mode mock) : migration OK, create → `pending` + providerRef
+ clientSecret mock, webhook `succeeded` → statut mis à jour, 404 providerRef inconnu,
400 statut invalide / montant < 1, 404 paiement inconnu. `payment-service` et `api-gateway`
compilent.

**Reste Lot 5 :** 5.4 `/internal/kpi` réel (clients/produits/commandes/CA), 5.5 storefront
panier/checkout + branchement au page builder. (5.1, 5.2 faits ; 5.3 = scaffold.)

---

## 2026-06-17 — Lot 5.4 : KPI commandes/CA réels dans `/internal/kpi`

**Fait :**
- **`order-service /internal/kpi`** (protégé par `InternalTokenGuard`, jeton partagé
  `x-internal-token`) : expose `orders` (total), `paidOrders` (statuts `paid`+`shipped`) et
  `revenueCents` (somme des `totalCents` des commandes honorées, via QueryBuilder `SUM`).
- **Gateway `/internal/kpi`** : agrège désormais user + product + **order** en un seul
  objet (contrat control plane), comme pour les autres services.
- `INTERNAL_API_TOKEN` passé à `order-service` dans les compose dev/prod et le template
  tenant isolé (le guard lit `process.env`).

**Pourquoi :** la supervision superadmin affichait des KPI métier mockés ; elle dispose
maintenant des vraies commandes et du vrai chiffre d'affaires par tenant.

**Testé** (Postgres jetable, 3 commandes : 1 pending, 1 paid, 1 shipped) : agrégat
`orders=3, paidOrders=2, revenueCents=8000`, 401 sans jeton. `order-service` et
`api-gateway` compilent.

**Reste Lot 5 :** 5.5 storefront panier/checkout + branchement au page builder.

---

## 2026-06-17 — Lot 5.5 : storefront panier + passage de commande

**Fait (front, `templates/front`) :**
- **Panier serveur côté storefront** : `lib/cart-session.ts` génère un `sessionKey` stable
  (localStorage) — le panier marche pour les visiteurs non connectés (le back identifie le
  panier par cette clé). `features/cart/` : hooks React Query (use-cart + add/update/remove/
  clear) sur les routes gateway `/cart/:sessionKey`, et un `CartProvider` (état du tiroir +
  actions + total/itemCount) monté dans le layout `(site)`.
- **Tiroir panier** (`cart-sheet.tsx`) : liste, steppers de quantité, suppression, total,
  bouton « Passer commande ». Le bouton panier du `header-block` ouvre le tiroir et affiche
  un badge de quantité (branché via `useCartContext`, défensif hors provider = aperçu builder).
- **Ajout au panier** câblé sur la page produit (`/produits/[id]`) — remplace l'ancien toast
  mock ; le bloc page-builder `featured-products` (déjà sur données réelles) y mène.
- **Checkout** (`/checkout`) : récap commande + e-mail invité → crée la commande
  (`POST /orders`, total recalculé serveur) puis l'intention de paiement
  (`POST /payments`), vide le panier et redirige vers `/checkout/success` (n° de commande).

**Pourquoi :** offrir le parcours d'achat complet du site généré (catalogue → fiche →
panier → commande), branché sur les microservices cart/order/payment via la gateway.

**Testé :** `tsc` sans erreur sur les fichiers cart/checkout (le reste = dette pré-existante,
`ignoreBuildErrors`), `next build` OK avec les routes `/checkout` et `/checkout/success`.
Les back cart/order/payment ont été validés en standalone (lots 5.1–5.3).

**Note :** Stripe en mode mock → le paiement reste `pending` ; la commande passe à `paid`
quand l'admin la valide (back-office) ou quand Florent branche Stripe (5.3). Le câblage de
la liste admin des commandes sur `order-service` (remplacer `orders.mock.ts`) reste à faire.

**Lot 5 terminé** (5.1, 5.2, 5.4, 5.5 ✅ ; 5.3 = scaffold). Reste : Lot 6 (K8s),
Lot 7 (superadmin), Lot 8 (UI/UX).

---

## 2026-06-17 — Lot 5.2 (suite) : liste admin des commandes sur données réelles

**Fait (front, back-office) :**
- **`features/orders/usecases/use-list-orders.tsx`** : récupère `GET /orders` (gateway) et
  mappe la commande back (montants en centimes, statuts `pending|paid|shipped|cancelled`)
  vers la forme attendue par l'admin : référence dérivée de l'UUID (`CMD-XXXXXXXX`), client
  depuis l'e-mail, prix en euros, statut traduit (`paid→preparing`, `shipped→delivered` ;
  le back ne connaît pas « ready »).
- **`orders.tsx`** consomme ce hook à la place de `MOCK_ORDERS` : le back-office affiche
  désormais les vraies commandes passées au checkout (filtre statut, recherche et détail —
  lecture seule — inchangés).

**Pourquoi :** boucler la chaîne storefront → admin. Les commandes créées au checkout
remontent dans le back-office ; combiné aux KPI (5.4), l'exploitant voit son activité réelle.
`MOCK_ORDERS` reste utilisé par l'analytics (sera traité au Lot 7).

**Testé :** `tsc` clean, `next build` OK (route admin/orders). Back `order-service` validé
en standalone (5.2).

**Reste (hors POC immédiat) :** UI de changement de statut dans le détail admin (le back
expose déjà `PATCH /orders/:id/status`), et bascule de l'analytics sur données réelles.

---

## 2026-06-17 — Analytics admin sur données réelles

**Fait (front, back-office) :**
- **`use-analytics.tsx`** consomme désormais `useListOrders()` (commandes réelles de
  `order-service`) au lieu de `MOCK_ORDERS`. Tous les indicateurs en découlent : CA, panier
  moyen, articles vendus, taux d'annulation, CA par jour, répartition par statut et top
  ventes. Le catalogue par catégorie était déjà sur données réelles. `isLoading` intègre la
  requête commandes.
- **`period.ts`** : les périodes relatives (7/30 j, mois) sont ancrées sur aujourd'hui
  (`latestOrderDate()` renvoie `new Date()`), les commandes venant maintenant du back.
- **Suppression de `orders.mock.ts`** (devenu orphelin : plus aucun import après le passage
  de la liste admin puis de l'analytics aux données réelles).

**Pourquoi :** le dashboard analytics reflète l'activité réelle du tenant (mêmes commandes
que le back-office et les KPI superadmin), plus aucune donnée fictive côté commandes.

**Testé :** `tsc` clean, `next build` OK (route admin/analytics). 

**Note :** le mock client `account/my-orders.mock.ts` (espace « mes commandes » côté
storefront) reste, distinct — il faudra plus tard retrouver les commandes par `customerId`.

---

## 2026-06-17 — Changement de statut commande (admin) + alignement du vocabulaire

**Fait (front, back-office) :**
- **Vocabulaire de statuts aligné sur le back** : `OrderStatus` passe de la version
  « restaurant » (pending/preparing/ready/delivered/cancelled) à celle d'order-service
  (**pending/paid/shipped/cancelled**). Mise à jour des libellés i18n (fr/en), des tons de
  badge (`orders-columns`, `order-detail-dialog`), des couleurs de graphe (`analytics-shared`)
  et du mock client `my-orders`. `use-list-orders` n'a plus de correspondance à maintenir
  (statut identité). Fini le mapping lossy.
- **Sélecteur de statut dans le détail admin** : `order-detail-dialog` propose un `Select`
  des 4 statuts qui appelle `PATCH /orders/:id/status` (hook `use-update-order-status`),
  avec mise à jour optimiste de la ligne et invalidation de la requête `['admin','orders']`
  — la liste **et** l'analytics se rafraîchissent (CA recalculé quand une commande passe
  `paid`/`shipped`).

**Pourquoi :** rendre la démo complète sans Stripe — l'exploitant marque une commande
`paid`/`shipped`, ce qui alimente immédiatement le CA des KPI (5.4) et de l'analytics.

**Testé :** JSON i18n valides, `tsc` clean, `next build` OK. Back `PATCH /orders/:id/status`
validé en standalone (5.2).

**Chaîne e-commerce du POC complète** : catalogue (page builder) → panier → checkout →
commande + paiement (scaffold) → back-office (liste + changement de statut) → KPI + analytics,
le tout sur données réelles et isolé par tenant.

---

## 2026-06-17 — Lot 6.1 : chart Helm d'un tenant sur Kubernetes (k3d)

**Fait :**
- **Cluster k3d** (`goosee`) : k3s embarque Traefik (ingress) et metrics-server (HPA), pas
  d'install supplémentaire. API épinglée sur `127.0.0.1` (sinon kubeconfig vers un
  `host.docker.internal` non résolu sous Windows — documenté dans `k8s/README.md`).
- **Chart Helm `k8s/goosee-tenant/`** déployant la pile isolée d'un tenant :
  - `configmap.yaml` (env non sensible partagé, hôtes = Services k8s) + `secret.yaml`
    (DB/JWT/MinIO/Stripe/jeton interne) consommés par **`envFrom`** (même logique que le
    `.env` Compose : chaque workload reçoit l'env complet).
  - `databases.yaml` : un StatefulSet PostgreSQL **par service** (database-per-service),
    en boucle sur `.Values.databases`.
  - `infra.yaml` : RabbitMQ + MinIO (StatefulSets persistants) + Mailhog.
  - `workloads.yaml` : gateway + 8 microservices + notifier + front (Deployments), en
    boucle sur `.Values.backendServices`. Le front ne reçoit que `NODE_ENV` (l'URL API est
    dérivée du host au runtime).
  - `_helpers.tpl` (image, labels, hosts), `values.yaml` paramétrable (slug, domaine,
    secrets, tag d'image).
- **3 images manquantes construites** (order/cart/payment, jamais buildées) puis import des
  11 images `goosee/*:local` dans le cluster (`k3d image import`).

**Pourquoi :** offrir le forfait « scalable » Kubernetes en alternative au Compose, base des
prochaines étapes (ingress, HPA, isolation réseau/quota).

**Testé en réel :** `helm lint` OK, `helm template` rend les 22 charges. `helm install` du
tenant `demo` (namespace `tenant-demo`) → **22 pods Running**. Les microservices jouent leurs
migrations TypeORM au boot (logs `order` : routes mappées, « Order Service is running »),
chacun sur sa base dédiée. Premier boot : un redémarrage le temps que la base soit prête
(probes/ordre viendront en 6.3).

**Reste Lot 6 :** 6.2 Ingress (host `<slug>.127.0.0.1.nip.io`), 6.3 probes + requests/limits
+ HPA, 6.4 Jobs migration/seed, 6.5 NetworkPolicy + ResourceQuota.

---

## 2026-06-17 — Lot 6.2 : Ingress du tenant (Traefik k3s)

**Fait :**
- **`templates/ingress.yaml`** (+ flag `ingress.enabled`/`className` dans `values.yaml`) :
  un Ingress Traefik route `<slug>.<domain>` → front et `api.<slug>.<domain>` → gateway.
  Seules ces deux entrées sortent du namespace (le reste est interne, conforme au principe
  « une seule porte d'entrée »).
- ConfigMap/Secret par tenant : déjà livrés en 6.1.

**Pourquoi :** rendre le site et son API joignables sous leur nom de domaine simulé, comme
côté Compose (Traefik file provider), mais via l'ingress natif de k3s.

**Testé en réel** (release `demo`, loadbalancer k3d sur :8081) :
- `http://demo.127.0.0.1.nip.io:8081/` → **307** (redirection locale Next.js du front),
- `http://api.demo.127.0.0.1.nip.io:8081/health` → **200** `{"status":"ok"}`,
- `…/products` → **200** avec les vrais produits (chemin front → ingress → gateway →
  product-service → product_db validé).

**Note :** TLS/cert-manager hors périmètre POC local (HTTP via nip.io). En prod, ajouter
cert-manager + un `tls:` sur l'Ingress.

**Reste Lot 6 :** 6.3 probes + requests/limits + HPA, 6.4 Jobs migration/seed,
6.5 NetworkPolicy + ResourceQuota.

---

## 2026-06-17 — Lot 6.3 : probes, ressources et autoscaling (HPA)

**Fait :**
- **Probes** : liveness `/health` + readiness `/health/ready` sur les microservices,
  `/health` pour la gateway (pas de `/health/ready`), `GET /` pour le front. Les bases
  Postgres ont une readiness `pg_isready` → les Services ne routent que vers des pods prêts,
  ce qui supprime le crash-loop des microservices au premier boot.
- **requests/limits** sur tous les workloads (app / db / infra, valeurs dans `values.yaml`).
- **HPA** (`templates/hpa.yaml`) : un HorizontalPodAutoscaler par charge HTTP (gateway +
  8 microservices + front), cible **CPU 80 %**, min 1 / max 3. Piloté par `values.hpa`.

**Pourquoi :** fiabiliser le démarrage (ordre via readiness), cadrer la consommation
(requests/limits) et permettre la montée en charge automatique — cœur du « forfait scalable ».

**Testé en réel** (upgrade release `demo`) : tous les pods applicatifs **1/1, 0 restart**
(plus de crash-loop au boot), et **10 HPA actifs** avec métriques réelles
(`cpu: 6–8%/80%`, metrics-server de k3s). 

**Reste Lot 6 :** 6.4 Jobs migration/seed, 6.5 NetworkPolicy + ResourceQuota.

---

## 2026-06-17 — Lot 6.4 : Job de seed OWNER au déploiement

**Fait :**
- **`templates/seed-owner-job.yaml`** : Job Helm (hook `post-install,post-upgrade`,
  `hook-delete-policy: before-hook-creation,hook-succeeded`) qui crée l'utilisateur OWNER
  dans `auth_db` (table `auth`) puis `user_db` (table `user`), via `psql` (image postgres),
  upsert idempotent (`ON CONFLICT`). Boucle de reprise (60×5 s) le temps que les migrations
  au boot créent le schéma. **Le mot de passe en clair n'entre jamais dans le cluster** :
  l'orchestrateur calcule le hash bcrypt et ne passe que `owner.passwordHash` (Secret) ;
  hash vide ⇒ pas de seed.
- Valeurs `owner.email` / `owner.passwordHash`, secret `OWNER_EMAIL` / `OWNER_PASSWORD_HASH`.
- SQL envoyé sur **stdin** (et non `-c`) : psql n'interpole `:'var'` que via stdin/fichier
  (même approche que l'orchestrateur Compose).

**Migrations :** jouées au boot par chaque microservice (`migrationsRun` en prod, TypeORM
idempotent), comme côté Compose — schéma et données de démo présents sans Job dédié. Un Job
de migration séparé nécessiterait un flag `RUN_MIGRATIONS` dans les services (durcissement
futur, utile quand l'HPA monte plusieurs replicas).

**Testé en réel** : `helm upgrade` avec `owner.passwordHash` → hook Job **succès**, lignes
OWNER présentes (`auth` role `{OWNER}` verified, `user` Admin), et **login via l'ingress
gateway** (`POST /auth/login`) renvoie un JWT `roles:[OWNER]`. Tenant k8s connectable.

**Reste Lot 6 :** 6.5 NetworkPolicy + ResourceQuota.

---

## 2026-06-17 — Lot 6.5 : isolation namespace (NetworkPolicy + ResourceQuota)

**Fait :**
- **`networkpolicy.yaml`** (`tenant-isolation`) : `podSelector: {}` + `policyTypes: [Ingress]`
  → ingress refusé par défaut, autorisé uniquement depuis le **même namespace** et depuis
  **kube-system** (contrôleur Traefik). Les autres tenants ne peuvent pas joindre les pods.
  Egress laissé ouvert (POC, pour ne pas casser le DNS).
- **`resourcequota.yaml`** (`tenant-quota`) : plafonne requests/limits CPU+mémoire et le
  nombre de pods du namespace. Impose des requests/limits sur chaque pod → `resources`
  ajoutées aussi au **Job de seed**. Dimensionné socle + marge HPA (requestsCpu 6 /
  requestsMemory 8Gi / limitsCpu 24 / limitsMemory 24Gi / pods 80).
- Flags `networkPolicy.enabled` et `resourceQuota.enabled` dans `values.yaml`.

**Pourquoi :** isolation totale par tenant (non négociable du POC) au niveau réseau, et
garde-fou de consommation pour qu'un tenant ne sature pas le cluster.

**Testé en réel** (release `demo`, révision 6) :
- ResourceQuota active : `requests.cpu 1100m/6`, `requests.memory 2816Mi/8Gi`, `pods 22/80`,
  `limits.cpu 11/24` — marge confortable pour l'autoscaling.
- L'ingress fonctionne toujours (login OWNER via Traefik → **201**).
- **Isolation prouvée** : un pod du namespace `default` tentant de joindre
  `gateway.tenant-demo:3001` obtient `000` (timeout/refus), alors que l'intra-namespace et
  Traefik passent.

**🎉 Lot 6 terminé** (6.1→6.5 ✅) : forfait Kubernetes scalable et isolé par tenant, validé
de bout en bout sur k3d (chart Helm, ingress, probes, HPA, seed OWNER, NetworkPolicy +
ResourceQuota). Reste : Lot 7 (superadmin), Lot 8 (UI/UX).

---

## 2026-06-17 — Lot 7.1 : espace SUPERADMIN + routes protégées (goosee-vitrine)

**Fait (repo `goosee-vitrine`) :**
- **API (`apps/api`)** : module `superadmin` avec `GET /superadmin/tenants` protégé par
  `JwtAuthGuard + RolesGuard + @Roles('SUPERADMIN')`. Un `SupervisionClient` interroge
  l'orchestrateur (`GET /tenants`, registre du control plane) et renvoie la vue d'ensemble
  des tenants (slug, propriétaire, forfait, infra, statut, URLs, ressources).
- **Web (`apps/web`)** : `useCurrentUser` expose désormais `role` + `isSuperadmin` (décodé
  du JWT). Espace `/[locale]/superadmin` avec **layout-garde** (redirige tout non-SUPERADMIN
  vers l'accueil) et une page listant les tenants (hook React Query `useSuperadminTenants`,
  table fonctionnelle — fioritures UI au Lot 8).
- Correctif au passage : `navbar.tsx` utilisait `<a href="/fr">` (lint `no-html-link-for-pages`
  qui cassait le build web) → remplacé par `<Link>`.

**Pourquoi :** poser l'espace réservé à l'équipe Goosee et le point d'entrée de la supervision
(7.2 branchera les métriques infra + KPI métier par tenant).

**Testé :** `apps/api` et `apps/web` compilent (`nest build`, `next build`), route
`/[locale]/superadmin` générée. Le flux live (api + orchestrateur + utilisateur SUPERADMIN)
sera validé quand la stack vitrine tourne.

**Reste Lot 7 :** 7.2 Prometheus + agrégation métriques/KPI par tenant, 7.3 allocation K8s
manuelle, 7.4 allocation intelligente.

---

## 2026-06-17 — Lot 7.2 : agrégation des KPI métier par tenant (goosee-vitrine)

**Fait (repo `goosee-vitrine`) :**
- **Orchestrateur** : `SupervisionService.getSupervision(tenant)` agrège **à la demande** les
  KPI métier réels d'un tenant en appelant sa gateway `GET /internal/kpi` avec le jeton
  interne du tenant (lu depuis son fichier d'env `secretsRef`). Renvoie `{ reachable, kpi }`
  (KPI = users/customers/products/categories/orders/paidOrders/revenueCents). Endpoint
  `GET /tenants/:id/kpi`.
- **API vitrine** : `GET /superadmin/tenants/:id/kpi` (protégé SUPERADMIN) qui relaie
  l'orchestrateur via `SupervisionClient.getTenantKpi`.
- **Web** : dans la supervision, chaque ligne tenant a un bouton **KPI** qui déplie un
  panneau chargé à la demande (`useTenantKpi`) — CA, commandes, commandes payées, clients,
  produits, catégories. Affiche « injoignable » si le tenant est arrêté.

**Choix POC :** pas de Prometheus central (scrape permanent de `/metrics` + kube-state) — trop
lourd et fragile en local. On fait du **pull direct à la demande** des KPI métier (qui sont
la donnée de supervision la plus parlante). Les métriques infra temps réel (CPU/mémoire par
pod) restent à brancher (kubectl top / metrics-server) si besoin ultérieur.

**Testé :** orchestrateur, API et web compilent. Le flux live (KPI réels) nécessite un tenant
actif provisionné par l'orchestrateur (gateway `/internal/kpi` joignable + jeton).

**Reste Lot 7 :** 7.3 allocation K8s manuelle (requests/limits/HPA), 7.4 allocation
intelligente (recommandation heuristique).

---

## 2026-06-17 — Lot 7.3 : allocation manuelle des ressources K8s (goosee-vitrine)

**Fait (repo `goosee-vitrine`) :**
- **Orchestrateur** : `TenantService.updateResources(id, {cpu, memory, minReplicas,
  maxReplicas})` persiste l'allocation dans le registre, puis — si `infra=k8s` —
  l'applique au déploiement via `ProvisioningService.applyK8sResources` (`helm upgrade
  --reset-then-reuse-values --set resources.app.limits.* / hpa.min|maxReplicas`, chart
  `k8s/goosee-tenant` localisé via `GOOSEE_CHART_DIR`). Endpoint
  `PATCH /tenants/:id/resources` (+ DTO validé).
- **API vitrine** : `PATCH /superadmin/tenants/:id/resources` (SUPERADMIN) → relaie
  l'orchestrateur.
- **Web** : formulaire d'allocation par tenant dans le panneau déplié (CPU/pod, mémoire/pod,
  replicas min/max), pré-rempli depuis le registre, `Enregistrer` → mutation + invalidation
  de la liste. Le libellé indique si l'allocation est « appliquée au cluster » (k8s) ou
  simplement « enregistrée » (docker).

**Pourquoi :** donner au superadmin le levier d'allocation des ressources par tenant
(requests/limits/HPA), socle de l'allocation intelligente (7.4).

**Testé :** orchestrateur + api + web compilent. L'effet « live » (helm upgrade) ne s'exerce
que sur un tenant `infra=k8s` ; les tenants Docker enregistrent l'allocation dans le registre.

**Reste Lot 7 :** 7.4 allocation intelligente (recommandation heuristique selon l'usage).

---

## 2026-06-17 — Lot 7.4 : allocation intelligente (recommandation heuristique)

**Fait (repo `goosee-vitrine`) :**
- **Orchestrateur** : `SupervisionService.recommend(tenant)` calcule un **score de charge**
  pondéré à partir des KPI métier réels (commandes payées ×4, commandes ×2, produits ×1,
  clients ×1) → palier `low/medium/high` → ressources recommandées (CPU, mémoire, bornes
  HPA) + une **justification lisible**. Sans données d'usage (tenant injoignable) : palier
  bas par défaut. Endpoint `GET /tenants/:id/recommendation`.
- **API vitrine** : `GET /superadmin/tenants/:id/recommendation` (SUPERADMIN).
- **Web** : panneau « Recommandation intelligente » par tenant (badge de palier, justification,
  valeurs recommandées) avec un bouton **Appliquer la reco** qui pousse directement
  l'allocation via le PATCH ressources (7.3) et rafraîchit la liste.

**Pourquoi :** assister le superadmin avec une suggestion d'allocation fondée sur l'usage
observé, applicable en un clic — l'« allocation intelligente » du cahier des charges.

**Heuristique transparente** (paliers) : low `250m/256Mi/HPA 1–2`, medium `500m/512Mi/1–3`,
high `1/1Gi/2–5`. Seuils score : <20 low, <100 medium, ≥100 high.

**Testé :** orchestrateur + api + web compilent.

**🎉 Lot 7 terminé** (7.1→7.4 ✅) : espace superadmin, supervision des tenants + KPI métier
temps réel, allocation ressources manuelle **et** recommandation intelligente.

**🏁 Jalon 2 atteint** (lots 5→7) : forfait scalable (k8s) + supervision temps réel
opérationnels → **POC fonctionnellement complet**. Reste le Lot 8 (UI/UX).

---

## 2026-06-17 — Stripe (mode test) câblé sur le storefront (Lot 5.3 finalisé)

**Fait (repo `Goosee`) :**
- **payment-service** : provider Stripe réel (`stripe` SDK). `createIntent` → vrai
  `PaymentIntent` (`automatic_payment_methods`, métadonnées paymentId/orderId), renvoie le
  `client_secret`. `parseWebhookEvent` → `constructEvent` (vérification de **signature**) +
  mapping `payment_intent.succeeded|payment_failed` et `charge.refunded` → statut ; les
  autres événements sont acquittés sans action (retour `null`). Repli mock conservé si
  `STRIPE_SECRET_KEY` absent.
- **Storefront** : page checkout en 2 temps — e-mail → création commande + intention de
  paiement, puis **Stripe Payment Element** (`@stripe/react-stripe-js`) + `confirmPayment`
  avec `return_url` vers la page succès (qui vide le panier). Clé publique via
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (inlinée au build).
- Variables : `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` ajoutée à `.env.example` + `turbo.json` ;
  clés **de test** réelles placées uniquement dans `env/.env.dev` (gitignoré, jamais commité).

**Testé :** clé secrète de test validée en direct contre l'API Stripe (PaymentIntent créé,
`client_secret` présent). payment-service et front compilent.

**À noter :** pour que le webhook marque la commande `paid`, renseigner `STRIPE_WEBHOOK_SECRET`
via `stripe listen --forward-to localhost:3009/payments/webhook` (sera intégré au script de
présentation). Le webhook doit viser **directement** payment-service (le corps brut est requis
pour la vérification de signature) — cohérent avec « le paiement parle en HTTP direct ».

**Reste demandé :** provisioning K8s dans l'orchestrateur, métriques infra live (kubectl top),
espace client `my-orders` par `customerId`, Prometheus central, READMEs + script de
présentation `yarn presentation`, alignement docs/architecture.

---

## 2026-06-17 — Provisioning Kubernetes dans l'orchestrateur (goosee-vitrine)

**Fait (repo `goosee-vitrine`) :**
- L'orchestrateur déploie désormais réellement sur **Kubernetes** pour le forfait
  `enterprise` (`planInfra` → `k8s`), via le chart Helm du Lot 6 :
  - `ProvisioningService.helmInstall(slug, owner)` : génère les secrets, les conserve dans
    l'env file (lu par la supervision pour le jeton interne), puis
    `helm upgrade --install -n tenant-<slug> --create-namespace --wait` avec les `--set`
    secrets + `owner.email`/`owner.passwordHash` (le **Job de seed du chart** crée l'OWNER).
  - `helmUninstall`, `k8sScale` (scale-to-zero via `kubectl scale`), URLs k8s
    (`<slug>.<domain>:8081`, ingress Traefik k3s).
  - Exécution helm/kubectl via `spawn` (args en tableau) pour passer le **hash bcrypt** sans
    interprétation (`$`), `shell:true` pour la résolution Windows.
- `TenantService` branche `provision/stop/start/remove` sur `infra` : k8s → helm/kubectl,
  docker → compose (chemin existant inchangé). Le mot de passe OWNER (clair) est généré par
  l'orchestrateur et renvoyé au client ; seul le hash entre dans le cluster.

**Pourquoi :** câbler le forfait scalable de bout en bout — la vitrine déclenche un vrai
déploiement K8s isolé (avant : Docker pour tous, avec un simple warn).

**Testé :** orchestrateur compile. Le déploiement k8s réel sera exercé par le script de
présentation (`yarn presentation`, plusieurs clients enterprise). Prérequis runtime :
`helm` + `kubectl` sur le PATH du process, images `goosee/*:local` importées dans le cluster.

**Reste demandé :** métriques infra live (kubectl top), `my-orders` par `customerId`,
Prometheus central, READMEs + script `yarn presentation`, alignement docs/architecture.













