# Goosee Generator

[![CI](https://github.com/CollectEverything-MNS/Goosee/actions/workflows/ci.yml/badge.svg)](https://github.com/CollectEverything-MNS/Goosee/actions/workflows/ci.yml)
[![Sécurité](https://github.com/CollectEverything-MNS/Goosee/actions/workflows/security.yml/badge.svg)](https://github.com/CollectEverything-MNS/Goosee/actions/workflows/security.yml)

**Template d'un site e-commerce multi-tenant** : une pile microservices complète (front
Next.js + API Gateway + microservices NestJS + infra) qui sert de **site généré** pour
chaque client de la plateforme Goosee. Déployable en **Docker** (forfait standard) ou en
**Kubernetes** (forfait scalable). Projet en français.

> Vue d'ensemble : [docs/fonctionnement.md](docs/fonctionnement.md) ·
> Plan & journal du POC : [docs/plan-poc.md](docs/plan-poc.md), [docs/journal-dev.md](docs/journal-dev.md)

## Architecture (résumé)

```
Front (Next.js) ─HTTP→ API Gateway ─HTTP→ microservices (user, auth, page, log,
                                          product, order, cart, payment, notifier)
```
- **Gateway = seule porte d'entrée HTTP.** Gateway → chaque microservice : HTTP.
- **Service ↔ service** : événements **RabbitMQ** (logs, notifications, sync user/auth).
- **Paiement** : `payment-service` en **HTTP pur** (Stripe + webhook) pour ne jamais perdre
  un paiement dans le bus asynchrone.
- **Database-per-service** : une base PostgreSQL par microservice (références par UUID).

## Prérequis

- Docker Desktop, Node.js 22, Yarn 1.22 (`corepack`)
- Pour le forfait Kubernetes : [`k3d`](https://k3d.io) + [`helm`](https://helm.sh) (binaires
  user-space suffisent) — voir [k8s/README.md](k8s/README.md).

## Démarrage rapide (développement)

```bash
yarn install                  # dépendances
yarn infra                    # infra en Docker (rabbitmq, minio, mailhog, dbs, adminer)
yarn dev                      # front + api-gateway + microservices en natif (turbo)
yarn init:user                # crée l'OWNER par défaut (admin@goosee.dev / goosee)
```
Front : http://localhost:3000 · API : http://localhost:3001 · Admin : `/fr/goosee-admin`.
Arrêt de l'infra : `yarn infra:down`. Reset volumes : `yarn infra:clean`.

## 🎬 Présentation tout-en-un

Monte une démo complète en une commande : plateforme (Traefik + Prometheus), **1 client
Docker** et **N clients Kubernetes** (forfait scalable), chacun isolé, avec OWNER seedé.

```bash
yarn presentation                       # 1 tenant Docker + 1 tenant k3s (défaut)
PRESENTATION_K8S_COUNT=3 yarn presentation
yarn presentation:down                  # démontage
```
Le script construit/importe les images, crée le cluster k3d au besoin, déploie les tenants
et affiche un récapitulatif (URLs, identifiants OWNER, Prometheus, commandes HPA/charge).
Prérequis : `docker`, `k3d`, `helm`, `kubectl` sur le PATH.

- Sites Docker : `http://<slug>.127.0.0.1.nip.io`
- Sites K8s : `http://<slug>.127.0.0.1.nip.io:8081`
- Prometheus : http://localhost:9090 · HPA : `kubectl get hpa -A` · conso : `kubectl top pods -A`

> La supervision **superadmin** (KPI + allocation cross-tenant) vit dans le portail vitrine
> (repo `goosee-vitrine`) ; les tenants y apparaissent quand ils sont provisionnés via son
> orchestrateur.

Le [guide de démonstration](docs/demo-infra.md) détaille les comptes, les contrôles et
la relance. Builds séquentiels limités à 2 CPU ; serveur k3d limité à 2 CPU et 5 Gio.
La présentation utilise des paiements simulés et Gemini configuré dans `env/.env.dev`.
La vitrine locale est accessible sur http://localhost:3100/fr.

## Paiement Stripe (test)

`payment-service` utilise Stripe en mode test. Renseigner dans `env/.env.dev` (gitignoré) :
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` et `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`. Pour
recevoir les webhooks en local : `stripe listen --forward-to localhost:3009/payments/webhook`
(renseigner le `whsec_...` affiché dans `STRIPE_WEBHOOK_SECRET`). Sans clé, le provider
retombe en mode mock.

## Commandes utiles

| Commande | Rôle |
|---|---|
| `yarn infra` / `infra:down` / `infra:clean` | infra de dev en Docker (rabbitmq, minio, mailhog, dbs) |
| `yarn dev` | front + back en natif via turbo (nécessite `yarn infra`) |
| `yarn init:user` | crée/maj l'OWNER par défaut |
| `yarn build:images` | construit les images `goosee/*:local` |
| `yarn observability` / `:down` | Prometheus central + Alertmanager (alertes → Discord) |
| `yarn presentation` / `:down` | démo multi-tenant (Docker + k8s) |
| `yarn build` / `lint` / `test` / `format` | turbo sur tous les workspaces |
| `yarn test:ci` | tests unitaires + seuil de couverture 70 % (services métier) |
| `yarn e2e` | parcours d'achat de bout en bout (stack dev requise) |
| `yarn load:gateway` / `load:navigation` | tests de charge k6 (via Docker, stack dev requise) |

## Documentation

- [Audit du SI](docs/audit-si.md) — état des lieux mesuré, constats, et traçabilité des
  décisions d'architecture
- [Dossier d'architecture](docs/architecture/README.md) — diagrammes C4, déploiement,
  séquences et modèle de données, en mermaid versionné
- [Fonctionnement](docs/fonctionnement.md) · [Structure du projet](docs/structure-projet.md)
- [Plan POC](docs/plan-poc.md) · [Journal de dev](docs/journal-dev.md)
- [Stratégie de tests & couverture](docs/strategie-tests.md) · [Tests e2e](templates/back/api-gateway/test/README.md) · [Tests de charge k6](load/README.md) · [Analyse de performance](docs/analyse-performance.md)
- [Observabilité — Prometheus & Alertmanager](docker/observability/README.md)
- [Forfait Kubernetes (k3d + Helm)](k8s/README.md)
- Back : [microservice](docs/back/1-structure-micro-service.md) ·
  [API Gateway](docs/back/2-structure-api-gateway.md) ·
  [RabbitMQ](docs/back/9-rabbitmq-patterns.md)
