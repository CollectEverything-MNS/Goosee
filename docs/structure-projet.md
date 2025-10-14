# Structure du projet

```
GOOSEE/
├── templates/
│   ├── front/                      # Front (Admin et web du site client)
│   └── back/
│       ├── api-gateway/            # Projet de l'API Gateway
│       └── services/               # Dossier qui contient tous les micro services
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
│   ├── create-service.sh           # Script de génération d'un micro service configuré
│   └── install-project.sh          # Script d’installation multi-projets
│
├── docs/                           # Documentation technique et fonctionnelle
│
├── package.json                    # Définition des workspaces et scripts globaux
├── .gitignore
└── README.md
```
