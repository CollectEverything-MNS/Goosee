# Plan POC Goosee — feuille de route détaillée

> Mis à jour le 2026-06-16.
> Plan **vivant** : le statut de chaque tâche est mis à jour au fil des features
> livrées (voir aussi `journal-dev.md`). Estimations en **jours-homme (j)** pour 1
> développeur familier de la stack, fourchettes basse–haute, hors UI/UX (traité en
> dernier, lot 8).
>
> Légende statut : ✅ fait · 🟡 partiel · ⬜ à faire.

---

## 1. Objectif du POC

Démontrer, **100 % en local** (PC ~35 Go), le cycle complet :

> un client crée son compte sur la vitrine → choisit un forfait → paie (Stripe test)
> → une instance **isolée** du site généré est déployée automatiquement → il reçoit
> ses identifiants par e-mail → il a un **lien direct** vers son site → les superadmins
> supervisent tous les sites en temps réel.

Contraintes actées : isolation **totale** par tenant (1 Postgres/service + MinIO +
RabbitMQ + réseau/volumes dédiés), **scale-to-zero** pour la tenue mémoire, domaine
simulé en local (`slug.127.0.0.1.nip.io`), Stripe en mode test réel.

---

## 2. État des lieux (implémentation réelle au 2026-06-16)

### 2.1 Repo `Goosee` (le site généré) — back très avancé

| Domaine | État |
|---|---|
| auth-service (login, register, refresh, revoke, verify-email, forget/change password, update-email, token-version, soft-delete) | ✅ |
| user-service (CRUD users, rôles CRUD, list admins/customers, get-by-auth) | ✅ |
| page-service (pages, menus, settings, upload MinIO, seed-pages) | ✅ |
| product-service (produits, catégories, tags, attributs, images, stock) | ✅ |
| log-service (create/list logs via RabbitMQ) | ✅ |
| API Gateway (routing + guards JWT/roles + role-access) | ✅ |
| Front admin `goosee-admin` (dashboard, analytics, access, clients, produits, perso/page-builder) | ✅ (UI présente) |
| Front storefront `(site)` (accueil, contact, pages dynamiques, compte, produit) | ✅ (UI présente) |
| **Commandes / panier / paiement** | 🟡 **mock front uniquement** (`my-orders.mock.ts`, pas de back) |
| **Migrations TypeORM** | ⬜ inexistantes (schéma via `synchronize` en dev) |
| **/health, /metrics, /internal/kpi** | ⬜ inexistants |
| **Config multi-tenant par env (slug, branding)** | ⬜ partielle |
| **Images de prod + entrypoint de provisioning** | ⬜ inexistants |

### 2.2 Repo `goosee-vitrine` — fondations posées, cœur métier à construire

| Domaine | État |
|---|---|
| `apps/api` user (login, register, forget/change password, soft-delete) | ✅ |
| `apps/api` billing (entités subscription + invoice, get-my-billing) | 🟡 entités prêtes, logique à brancher |
| `apps/api` project (entité + get-my-project, update-my-project) | 🟡 voir champs manquants ci-dessous |
| **Migrations TypeORM** | ✅ présentes (`apps/api/src/migrations`) |
| `apps/web` (accueil, onboarding, profil, reset-password) | 🟡 base UI seulement |
| **Stripe / paiement** | ⬜ |
| **Orchestrateur (`apps/orchestrator`)** | ⬜ |
| **Rôles CLIENT / SUPERADMIN + guards d'ownership** | ⬜ |
| **« Mes sites » + lien direct** | ⬜ |
| **Espace superadmin (supervision + alloc K8s)** | ⬜ |

Entité `Project` actuelle : `userId, businessName, businessType, siret,
businessAddress, domainType, subdomain, customDomain, plan`. **Manquent** : `status`,
type d'infra (docker/k8s), URL de l'instance déployée, ressources allouées, références
de secrets, dates de provisioning.

### 2.3 Synthèse des écarts

Le **site généré** est une boutique quasi complète côté back/admin, mais **non
provisionnable** (pas de migrations, pas de santé/métriques, pas d'entrypoint) et **sans
commandes réelles**. La **vitrine** a les fondations de données mais **aucun** des
mécanismes du POC (Stripe, orchestrateur, multi-sites, superadmin).

---

## 3. Plan détaillé par lot

### Lot 0 — Rendre le site généré provisionnable (repo `Goosee`) — 8–11 j
*Bloquant pour tout le reste.*

| # | Tâche | Estim. | Statut |
|---|---|---|---|
| 0.1 | Migrations TypeORM sur les 5 services à DB (auth, user, page, product, log) | 2–4 j | ✅ |
| 0.2 | Config 100 % par env + garde-fous (refus `synchronize` hors dev, validation secrets au boot) | 1 j | ✅ |
| 0.3 | Endpoints `/health` (readiness/liveness) gateway + services | 0.5 j | ✅ |
| 0.4 | Endpoint `/metrics` Prometheus (gateway + services) | 1 j | ✅ |
| 0.5 | Endpoint `/internal/kpi` (KPI d'usage pour scalabilité) protégé par secret partagé | 1 j | ✅ |
| 0.6 | Images de prod (`Dockerfile.prod`) + entrypoint unattended (migrate → `init:user` → callback statut) | 1.5–2 j | ✅ |
| 0.7 | Quick wins sécu : `helmet`, `@nestjs/throttler`, timeouts `HttpModule` | 1 j | ✅ |

**Exemples :**
- Générer une migration : `yarn workspace auth-service typeorm migration:generate src/migrations/Init -d src/orm.config.ts`
- `/health` (NestJS Terminus) : `GET /health` → `{ status: 'ok' }`.
- `/metrics` : exposer un registre `prom-client` (compteurs requêtes, latence).

### Lot 1 — Modèle de données vitrine + rôles (repo `goosee-vitrine`) — 3–4 j

| # | Tâche | Estim. | Statut |
|---|---|---|---|
| 1.1 | Étendre `Project` : `status` (PENDING/PROVISIONING/ACTIVE/STOPPED/FAILED), `infra` (docker/k8s), `instanceUrl`, `resources`, refs secrets, dates + migration | 1 j | ✅ |
| 1.2 | Rôles `CLIENT` / `SUPERADMIN` + guards (rôle **et** ownership : un client ne voit que ses projets) | 1–2 j | ✅ |
| 1.3 | Catalogue de forfaits (starter/commerce/enterprise + option `scalable`) | 0.5–1 j | ✅ |

**Exemple de guard d'ownership :** refuser `GET /projects/:id` si `project.userId !== currentUser.id` et rôle ≠ SUPERADMIN.

### Lot 2 — Paiement Stripe en mode test (repo `goosee-vitrine`) — 3–4 j
*Le compte Stripe doit être créé d'abord (guidé, ~0.5 j hors dev).*

| # | Tâche | Estim. | Statut |
|---|---|---|---|
| 2.1 | Checkout Session (clés `*_test`) créée **après connexion**, metadata = forfait + slug | 1 j | ⬜ |
| 2.2 | Webhook `checkout.session.completed` signé → crée/maj `Project` PENDING → déclenche l'orchestrateur | 1–1.5 j | ⬜ |
| 2.3 | Pages succès/échec + doc cartes de test | 0.5 j | ⬜ |

**Exemples :** clés `sk_test_…` / `pk_test_…` ; webhook local : `stripe listen --forward-to localhost:4000/webhooks/stripe` ; carte test `4242 4242 4242 4242`.

### Lot 3 — Orchestrateur + registre des tenants (`goosee-vitrine/apps/orchestrator`) — 7–11 j

| # | Tâche | Estim. | Statut |
|---|---|---|---|
| 3.1 | Scaffold `apps/orchestrator` (NestJS) + DB registre des tenants | 1–2 j | ✅ |
| 3.2 | Génération des secrets/env par tenant (JWT, mots de passe DB, noms de bases, slug) | 1 j | ✅ |
| 3.3 | Provisioning Docker : `docker compose -p tenant-<id> up` + route Traefik | 2–3 j | ✅ |
| 3.4 | Suivi d'avancement temps réel (SSE) `BUILDING → MIGRATED → SEEDED → HEALTHY` | 1–2 j | ⬜ |
| 3.5 | Scale-to-zero (`start`/`stop`) + dé-provisioning | 1–2 j | ✅ |
| 3.6 | Hook de fin : seed owner + e-mail creds (Mailhog) + statut `ACTIVE` | 1 j | 🟡 seed owner + statut ACTIVE faits ; e-mail creds à faire |
| 3.7 | Câblage vitrine → orchestrateur (`POST /me/project/provision`) | 1 j | ✅ |

**Exemple :** un endpoint `POST /tenants` qui, à partir d'un `Project`, génère `env/tenant-<id>.env` puis lance la pile isolée et renvoie un flux SSE de progression.

### Lot 4 — Réseau & exposition locale (Traefik + nip.io) — 4–6 j

| # | Tâche | Estim. | Statut |
|---|---|---|---|
| 4.1 | Traefik central, routage par `Host` (provider **fichier**, pas labels Docker — KO Docker Desktop) | 1.5–2 j | ✅ |
| 4.2 | Slug → host `slug.127.0.0.1.nip.io` + TLS mkcert | 0.5–1 j | 🟡 host nip.io fait ; TLS mkcert à faire (HTTP suffit pour le POC) |
| 4.3 | Template « tenant Docker » : pile complète isolée (réseau + volumes dédiés) | 2–3 j | ✅ |

> **Jalon 1** après les lots 0→4 (+2) : « payer → site Docker **isolé** en ligne sur
> `slug.127.0.0.1.nip.io` → e-mail des identifiants ». **Le POC fonctionne sur le
> chemin Docker.**

### Lot 5 — Commandes réelles + KPI business dans le site généré (repo `Goosee`) — 5–8 j
*Nécessaire pour que la supervision affiche de vrais KPI (commandes/CA), aujourd'hui mockés.*

| # | Tâche | Estim. | Statut |
|---|---|---|---|
| 5.1 | `cart-service` (panier) : microservice dédié + DB + usecases, route gateway | 2–3 j | ✅ |
| 5.2 | `order-service` (commandes) : microservice dédié + DB + usecases (remplace le mock front) | 3–5 j | ✅ |
| 5.3 | `payment-service` (paiement boutique, Stripe) : microservice dédié + webhook | 3–4 j | 🟡 scaffold (Stripe à brancher par Florent) |
| 5.4 | Brancher `/internal/kpi` sur les données réelles (clients, produits, commandes) | 0.5 j | ⬜ |
| 5.5 | Storefront : panier + passage de commande (logique, hors fioritures UI) | 2–3 j | ⬜ |

### Lot 6 — Forfait scalable Kubernetes (k3d + Helm) — 10–16 j

| # | Tâche | Estim. | Statut |
|---|---|---|---|
| 6.1 | Chart Helm paramétrable (workloads + StatefulSets Postgres + MinIO + RabbitMQ) | 3–4 j | ⬜ |
| 6.2 | ConfigMap/Secret par tenant, `Ingress` host, cert-manager/Traefik | 2–3 j | ⬜ |
| 6.3 | Probes HTTP, `requests`/`limits`, **HPA** | 1.5–2 j | ⬜ |
| 6.4 | Jobs de migration + de seed au déploiement | 1.5–2 j | ⬜ |
| 6.5 | Isolation : namespace + `NetworkPolicy` + `ResourceQuota` | 2–3 j | ⬜ |

### Lot 7 — Superadmin : supervision temps réel + allocation (vitrine, sans fioritures UI) — 8–11 j

| # | Tâche | Estim. | Statut |
|---|---|---|---|
| 7.1 | Espace `SUPERADMIN` + routes protégées | 1 j | ⬜ |
| 7.2 | Prometheus central + scrape `/metrics` et `/internal/kpi` → API d'agrégation (infra + business par tenant) | 3–4 j | ⬜ |
| 7.3 | Allocation ressources K8s **manuelle** (requests/limits/HPA) | 2–3 j | ⬜ |
| 7.4 | Allocation **intelligente** (recommandation heuristique selon l'usage observé) | 2–3 j | ⬜ |

> **Jalon 2** après les lots 5→7 : forfait scalable + supervision temps réel
> opérationnels. **POC fonctionnellement complet.**

### Lot 8 — UI/UX (EN DERNIER, via le plugin magic/21st.dev) — 12–16 j

| # | Tâche | Estim. | Statut |
|---|---|---|---|
| 8.1 | Vitrine client : pages forfaits, « Mes sites » + lien direct, suivi de génération | 4–5 j | ⬜ |
| 8.2 | Dashboards superadmin (temps réel, graphes) | 4–5 j | ⬜ |
| 8.3 | Storefront : finition panier/checkout + pages succès/échec | 2–3 j | ⬜ |
| 8.4 | Cohérence visuelle, i18n, responsive | 2–3 j | ⬜ |

### Transverse — Documentation continue & qualité — étalé

| # | Tâche | Estim. | Statut |
|---|---|---|---|
| T.1 | Documentation continue (`plan-poc.md` + `journal-dev.md` tenus à jour à chaque feature) | au fil de l'eau | 🟡 en place |
| T.2 | Tests + CI (lint/test/build) sur les dépôts | 3–5 j | ⬜ |

---

## 4. Estimation globale

| Bloc | Temps |
|---|---|
| Lots 0–4 (Jalon 1 : démo Docker) | 25–36 j |
| Lots 5–7 (Jalon 2 : scalable + supervision) | 23–35 j |
| Lot 8 (UI/UX) | 12–16 j |
| Transverse (tests/CI) | 3–5 j |
| **Total POC complet** | **≈ 63 à 92 j** |

---

## 5. Ordre de priorité conseillé

> Principe : **faire fonctionner d'abord, soigner l'UI en dernier.** Réorganisable.

1. **Lot 0** — socle du site généré (bloquant).
2. **Lot 1** — modèle vitrine + rôles/guards.
3. **Lot 3 + Lot 4** — orchestrateur + réseau Docker (cœur du provisioning ; testés
   d'abord avec un déclenchement manuel).
4. **Lot 2** — Stripe : on câble le paiement comme déclencheur réel. → **Jalon 1**.
5. **Lot 5** — commandes réelles + KPI business (pour nourrir la supervision).
6. **Lot 7** — supervision superadmin + allocation (logique, sans fioritures).
7. **Lot 6** — forfait scalable K8s (k3d). → **Jalon 2**.
8. **Lot 8** — **UI/UX en dernier**.
9. **Transverse** — tests/CI et doc continue, en parallèle tout du long.
