# Structure du projet

```
GOOSEE/
├── templates/
│   ├── front/                              # Front Next.js (Admin et site client)
│   └── back/
│       ├── api-gateway/                    # API Gateway NestJS (point d'entrée HTTP)
│       └── services/                       # Microservices NestJS
│           ├── auth-service/               # Authentification, JWT, sessions
│           ├── user-service/               # Gestion des utilisateurs
│           ├── page-service/               # Pages, menus, settings, uploads
│           ├── product-service/            # Produits, categories, tags, images
│           ├── order-service/              # Commandes clients
│           ├── cart-service/               # Panier d'achat
│           ├── payment-service/            # Paiement (Stripe, mode test)
│           ├── stock-service/              # Gestion des stocks
│           ├── ticket-service/             # Tickets de support
│           ├── assistant-service/          # Chatbot d'aide (Gemini) base sur docs/guide-utilisateur.md
│           ├── notifier-service/           # Envoi d'emails, SMS, push
│           └── log-service/                # Centralisation des logs (RabbitMQ)
│
├── docker/
│   ├── dev/                                # Compose pour l'environnement de dev
│   │   ├── docker-compose.front.dev.yml
│   │   ├── docker-compose.infra.dev.yml    # rabbitmq, minio, mailhog, adminer
│   │   └── docker-compose.back.dev.yml     # api-gateway + microservices + dbs
│   ├── tenant/                             # Compose isolé par boutique, routes Traefik
│   ├── observability/                      # Prometheus, Alertmanager, cibles
│   ├── buildkitd.toml                      # Limite de parallélisme du builder
│   └── prod/                               # Compose pour l'environnement de prod
│       ├── docker-compose.front.prod.yml
│       ├── docker-compose.infra.prod.yml
│       └── docker-compose.back.prod.yml
│
├── env/
│   ├── .env.dev                            # Variables de dev (gitignored)
│   ├── .env.prod                           # Variables de prod (gitignored)
│   └── .env.example                        # Template versionné
│
├── k8s/goosee-tenant/                      # Chart Helm (k3s via k3d en local)
├── scripts/                                # Builds, provisioning, démo, seed et contrôles
├── load/                                   # Scénarios k6 et profils poc/smoke/load
├── .github/workflows/                      # CI, sécurité et notifications
├── yarn.lock                               # Dépendances figées, versionnées
├── turbo.json                              # Orchestration des workspaces
│
├── docs/                                   # Documentation technique (FR)
│
├── package.json                            # Workspaces yarn + scripts globaux
├── .gitignore
└── README.md
```

## Stack technique

- **Frontend** : Next.js 15, React 19, TailwindCSS, Shadcn/ui, React Query (MobX figure dans les dépendances mais n'est utilisé nulle part dans le code, dépendance morte)
- **Backend** : NestJS 11, TypeORM, PostgreSQL (10 bases par tenant ; notifier et assistant sans base)
- **Communication inter-services** : HTTP pour les échanges synchrones, RabbitMQ pour les événements
- **Stockage objets** : MinIO (uploads d'images, fichiers)
- **Mail** : Mailhog en dev, SMTP réel en prod
- **Conteneurisation** : Docker Compose ou chart Helm sur Kubernetes (k3s en local)
