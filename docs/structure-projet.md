# Structure du projet

```
GOOSEE/
├── apps/
│   ├── api-gateway/                # API Gateway NestJS — point d’entrée des microservices
│   └── front/
│       ├── goosee-client-admin/    # Front back-office client (Next.js)
│       ├── goosee-client-vitrine/  # Front public client (Next.js)
│       └── goosee-vitrine/         # Front principal Goosee (Next.js)
│
├── services/                       # Dossier des microservices NestJS (ex: user-service, auth-service…)
│
├── docker/
│   ├── dev/                        # Configs Docker Compose pour l'environnement de développement
│   ├── prod/                       # Configs Docker Compose pour l'environnement de production
│   └── docker-compose.yml          # Fichier de composition principal
│
├── env/
│   ├── .env.dev                    # Variables d'environnement de développement
│   └── .env.prod                   # Variables d'environnement de production
│
├── scripts/
│   └── install-project.sh          # Script d’installation multi-projets
│
├── docs/                           # Documentation technique et fonctionnelle
│
├── package.json                    # Définition des workspaces et scripts globaux
├── .gitignore
└── README.md
```
