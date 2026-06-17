# Goosee Generator

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
yarn install:project          # dépendances
yarn start:dev                # stack complète (front + back + infra) en Docker
yarn init:user                # crée l'OWNER par défaut (admin@goosee.dev / goosee)
```
Front : http://localhost:3000 · API : http://localhost:3001 · Admin : `/fr/goosee-admin`.
Arrêt : `yarn stop:dev`. Reset volumes : `yarn clean:dev`.

## 🎬 Présentation tout-en-un

Monte une démo complète en une commande : plateforme (Traefik + Prometheus), **1 client
Docker** et **N clients Kubernetes** (forfait scalable), chacun isolé, avec OWNER seedé.

```bash
yarn presentation                       # 1 tenant Docker + 2 tenants k8s (défaut)
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

## Paiement Stripe (test)

`payment-service` utilise Stripe en mode test. Renseigner dans `env/.env.dev` (gitignoré) :
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` et `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`. Pour
recevoir les webhooks en local : `stripe listen --forward-to localhost:3009/payments/webhook`
(renseigner le `whsec_...` affiché dans `STRIPE_WEBHOOK_SECRET`). Sans clé, le provider
retombe en mode mock.

## Commandes utiles

| Commande | Rôle |
|---|---|
| `yarn start:dev` / `stop:dev` / `restart:dev` / `clean:dev` | stack Docker de dev |
| `yarn infra` | infra seule (rabbitmq, minio, mailhog, dbs) |
| `yarn init:user` | crée/maj l'OWNER par défaut |
| `yarn build:images` | construit les images `goosee/*:local` |
| `yarn observability` / `:down` | Prometheus central |
| `yarn presentation` / `:down` | démo multi-tenant (Docker + k8s) |
| `yarn build` / `lint` / `test` / `format` | turbo sur tous les workspaces |

## Documentation

- [Fonctionnement](docs/fonctionnement.md) · [Structure du projet](docs/structure-projet.md)
- [Plan POC](docs/plan-poc.md) · [Journal de dev](docs/journal-dev.md)
- [Forfait Kubernetes (k3d + Helm)](k8s/README.md)
- Back : [microservice](docs/back/1-structure-micro-service.md) ·
  [API Gateway](docs/back/2-structure-api-gateway.md) ·
  [RabbitMQ](docs/back/9-rabbitmq-patterns.md)
