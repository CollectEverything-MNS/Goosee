# Fonctionnement de Goosee Generator

## Objectif

Le projet **Goosee Generator** a pour objectif d'automatiser la génération complète d'une infrastructure microservices.
Il permet de créer rapidement une plateforme basée sur le modèle Goosee, tout en garantissant la modularité, la sécurité et la scalabilité de l'ensemble.

## Concept

Actuellement, le projet sert de **template technique** : la base de référence utilisée par le générateur pour produire de nouvelles plateformes complètes.
Il définit les standards techniques et structurels communs à toutes les instances Goosee.

---

## Architecture haut-niveau

```
                      ┌──────────────┐
                      │  Frontend    │  Next.js 15
                      │  :3000       │  (Admin + Site client)
                      └──────┬───────┘
                             │ HTTP/REST
                             ▼
                      ┌──────────────┐
                      │ API Gateway  │  NestJS
                      │  :3001       │  CORS, validation, Swagger
                      └──────┬───────┘
                             │
        ┌────────────────────┼─────────────────────┐
        │ HTTP               │ HTTP                │ HTTP
        ▼                    ▼                     ▼
  ┌──────────┐         ┌──────────┐          ┌──────────┐
  │  auth    │         │  user    │          │  page    │
  │ :3003    │         │  :3002   │          │  :3004   │
  └────┬─────┘         └────┬─────┘          └────┬─────┘
       │                    │                     │
       │ ──── RabbitMQ ─────┼─────── RabbitMQ ────┤
       │                    │                     │
       │                    ▼                     ▼
       │              ┌──────────┐          ┌──────────┐
       └─────────────▶│ notifier │          │   log    │
                      │  (RMQ)   │          │  :3005   │
                      └──────────┘          └──────────┘

  Chaque microservice ↔ sa propre base PostgreSQL (database-per-service)
```

---

## Principes directeurs

### 1. Database-per-service
Chaque microservice possède sa propre base PostgreSQL. Aucun service ne lit la base d'un autre. Les références cross-services se font par UUID, sans foreign key.

### 2. Communication : HTTP pour la gateway, événements entre services
- **Front → Gateway** et **Gateway → chaque microservice** : HTTP request/response (la gateway
  doit répondre au navigateur de façon synchrone).
- **Service ↔ service** : les opérations sans réponse immédiate (notifications, logs,
  synchronisation user/auth) passent par **RabbitMQ** (`@EventPattern`/`@MessagePattern`).
  Un service peut tomber sans bloquer les autres.
- **Exception paiement** : `payment-service` reste en **HTTP pur, sans event** (intention +
  webhook Stripe) — pour ne jamais risquer de perdre un paiement dans le bus asynchrone.

### 3. Clean Architecture
Chaque microservice suit la même structure : `entities` → `repositories` (interface + impl) → `usecases` → `controllers`. Voir [Étape 1](./back/1-structure-micro-service.md).

### 4. Une seule porte d'entrée
Le frontend ne parle qu'à l'API Gateway. La gateway route ensuite vers les microservices internes. Voir [Étape 2](./back/2-structure-api-gateway.md).

### 5. Infra en Docker, services en natif
L'infra (Postgres, RabbitMQ, MinIO, Mailhog) tourne dans Docker via `yarn infra` — pas
d'install locale de ces briques. Le front, l'API Gateway et les microservices tournent en
natif sur l'hôte via `yarn dev` (turbo), qui se connecte à cette infra dockerisée.

---

## Microservices fournis

| Service          | Port  | Rôle                                              |
|------------------|-------|---------------------------------------------------|
| api-gateway      | 3001  | Façade HTTP unique pour le frontend               |
| user-service     | 3002  | Gestion des utilisateurs (CRUD, rôles)            |
| auth-service     | 3003  | Authentification, JWT, sessions                   |
| page-service     | 3004  | Pages, menus, settings, uploads d'images          |
| log-service      | 3005  | Centralisation des logs via RabbitMQ              |
| product-service  | 3006  | Produits, catégories, tags, attributs, images     |
| order-service    | 3007  | Commandes (statuts, KPI commandes/CA)             |
| cart-service     | 3008  | Panier serveur (par sessionKey)                   |
| payment-service  | 3009  | Paiement Stripe + webhook (HTTP pur, sans event)  |
| notifier-service | —     | Envoi d'emails, SMS, push (RMQ-only, pas d'HTTP)  |

---

## Pour aller plus loin

- [Structure du projet](./structure-projet.md)
- [Structure d'un microservice](./back/1-structure-micro-service.md)
- [Structure de l'API Gateway](./back/2-structure-api-gateway.md)
- [Communication RabbitMQ](./back/9-rabbitmq-patterns.md)
