# Configuration des environnements

La référence des variables de développement est [env/.env.example](../../env/.env.example).
Copier ce fichier vers `env/.env.dev` pour une nouvelle installation, puis adapter les
valeurs locales. Ne pas écraser un fichier déjà configuré. Les fichiers `.env.dev` et
`.env.prod` sont ignorés par Git.

## Développement natif

`yarn infra` démarre PostgreSQL, RabbitMQ, MinIO et MailHog dans Docker.
`yarn dev` charge `env/.env.dev` avec dotenv-cli et lance les applications via Turbo.
Dans ce mode, les services et bases sont joints par `localhost`, sur les ports publiés.

| Service | HTTP | PostgreSQL publié sur l'hôte |
|---|---:|---:|
| front | 3000 | — |
| gateway | 3001 | — |
| user | 3002 | 5434 |
| auth | 3003 | 5433 |
| page | 3004 | 5435 |
| log | 3005 | 5436 |
| product | 3006 | 5437 |
| order | 3007 | 5438 |
| cart | 3008 | 5439 |
| payment | 3009 | 5441 |
| ticket | 3010 | 5442 |
| stock | 3011 | 5443 |
| assistant | 3012 | — |
| notifier | — | — |

RabbitMQ : 5672 / interface 15672. MinIO : 9000 / console 9001.
MailHog : SMTP 1025 / interface 8025. Adminer : 8080.

Extraits du modèle natif :

```dotenv
USER_SERVICE_HOST=localhost
USER_SERVICE_PORT=3002
USER_DB_HOST=localhost
USER_DB_PORT=5434
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
ORDER_SERVICE_PORT=3007
STOCK_SERVICE_PORT=3011
STOCK_RESERVATION_TTL_MINUTES=30
ASSISTANT_SERVICE_PORT=3012
GEMINI_API_KEY=
```

## Applications conteneurisées

Dans un conteneur, localhost désigne ce conteneur. Les Compose doivent donc fournir les
noms DNS internes et le port PostgreSQL interne 5432. Ne pas réutiliser tels quels les
hôtes et ports du développement natif. Passer explicitement `--env-file` à Compose ;
le fichier dotenv n'est pas injecté automatiquement dans tous les services.

## Démonstration Docker + k3s

`yarn presentation` lit `env/.env.dev`, réutilise les secrets locaux dans
`docker/tenant/envs/` et prépare un tenant Docker et un tenant k3s par défaut.
La vitrine voisine utilise son propre `.env`, y compris les noms de bases et les ports.
Les accès de notre configuration sont 3100 pour la vitrine, 3102 pour son API et 4000
pour l'orchestrateur ; voir le [guide infra](../demo-infra.md).

Gemini est activé par défaut et utilise `GEMINI_API_KEY` et `GEMINI_MODEL`.
`PRESENTATION_ASSISTANT=0` permet une répétition sans chatbot.
Le launcher configure le paiement simulé, avec `NEXT_PUBLIC_DEMO_PAYMENT` au build
Next.js et sans clé Stripe côté prestataire. Hors présentation, le mode Stripe utilise
ses clés dédiées ; une variable publique Next.js nécessite une reconstruction du front.

## Ajouter des variables

Mettre à jour le modèle, la configuration locale, les variables transmises par Turbo,
les Compose et le chart Helm concernés. Utiliser un port libre au-delà de ceux du tableau.
Les valeurs secrètes restent dans les fichiers locaux ou les Secrets Kubernetes.
