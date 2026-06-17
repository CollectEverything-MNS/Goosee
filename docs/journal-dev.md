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













