# 🌍 Étape 6 — Configuration de l'environnement (.env.dev / .env.prod)

Ces fichiers contiennent toutes les **variables d'environnement** nécessaires à l'écosystème Goosee.
Ils sont injectés par **Docker Compose** dans tous les containers.

---

## 📁 Emplacement

```
env/
├── .env.dev         # Développement (gitignored)
├── .env.prod        # Production (gitignored)
└── .env.example     # Template versionné — toujours à jour
```

Ils sont partagés entre les 3 fichiers compose :
- `docker/dev/docker-compose.back.dev.yml`
- `docker/dev/docker-compose.front.dev.yml`
- `docker/dev/docker-compose.infra.dev.yml`

⚠️ `.env.dev` et `.env.prod` sont **gitignorés**. Pour partager une configuration de référence, mettre à jour `.env.example`.

---

## 🧩 Contenu type (`.env.dev`)

```bash
NODE_ENV=development

# 🔹 FRONT (Next.js)
NEXT_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WEB_URL=http://localhost:3000

# 🔹 API Gateway
API_GATEWAY_PORT=3001

# 🔹 RabbitMQ
RABBITMQ_PORT=5672
RABBITMQ_UI_PORT=15672
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672

# 🔹 USER SERVICE
USER_SERVICE_HOST=goosee-user-service-dev
USER_SERVICE_PORT=3002
USER_DB_HOST=goosee-user-db-dev
USER_DB_PORT=5432
USER_DB_USER=postgres
USER_DB_PASSWORD=postgres
USER_DB_NAME=user_db

# 🔹 AUTH SERVICE
AUTH_SERVICE_HOST=goosee-auth-service-dev
AUTH_SERVICE_PORT=3003
AUTH_DB_HOST=goosee-auth-db-dev
AUTH_DB_PORT=5432
AUTH_DB_USER=postgres
AUTH_DB_PASSWORD=postgres
AUTH_DB_NAME=auth_db

# 🔹 PAGE SERVICE
PAGE_SERVICE_HOST=goosee-page-service-dev
PAGE_SERVICE_PORT=3004
PAGE_DB_HOST=goosee-page-db-dev
PAGE_DB_PORT=5432
PAGE_DB_USER=postgres
PAGE_DB_PASSWORD=postgres
PAGE_DB_NAME=page_db

# 🔹 LOG SERVICE
LOG_SERVICE_HOST=goosee-log-service-dev
LOG_SERVICE_PORT=3005
LOG_DB_HOST=goosee-log-db-dev
LOG_DB_PORT=5432
LOG_DB_USER=postgres
LOG_DB_PASSWORD=postgres
LOG_DB_NAME=log_db

# 🔹 SMTP (Mailhog en dev)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=

# 🔹 MinIO (object storage)
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_ENDPOINT=goosee-minio-dev
MINIO_BUCKET=goosee-uploads
MINIO_USE_SSL=false
MINIO_PUBLIC_URL=http://localhost:9000

# 🔹 Outils dev
ADMINER_PORT=8080
MAILHOG_SMTP_PORT=1025
MAILHOG_HTTP_PORT=8025
```

---

## 🧠 Conventions de nommage

| Préfixe                     | Usage                                                                  |
|-----------------------------|------------------------------------------------------------------------|
| `<SERVICE>_SERVICE_HOST`    | Nom du container (utilisé pour la résolution DNS dans `goosee_net`)    |
| `<SERVICE>_SERVICE_PORT`    | Port d'écoute interne du microservice                                  |
| `<SERVICE>_DB_HOST`         | Nom du container postgres dédié au service                             |
| `<SERVICE>_DB_PORT`         | Port postgres (5432 par défaut)                                        |
| `<SERVICE>_DB_USER/PASSWORD/NAME` | Credentials de la base                                           |
| `RABBITMQ_URL`              | URL AMQP utilisée par tous les services qui consomment ou émettent     |

---

## 📊 Ports utilisés en dev

| Service             | Port  |
|---------------------|-------|
| Frontend (Next.js)  | 3000  |
| API Gateway         | 3001  |
| user-service        | 3002  |
| auth-service        | 3003  |
| page-service        | 3004  |
| log-service         | 3005  |
| RabbitMQ AMQP       | 5672  |
| RabbitMQ UI         | 15672 |
| Adminer             | 8080  |
| MinIO API           | 9000  |
| MinIO Console       | 9001  |
| Mailhog SMTP        | 1025  |
| Mailhog UI          | 8025  |

---

## ➕ Ajouter un nouveau microservice

1. Choisir un port libre (3006, 3007...)
2. Ajouter dans `.env.dev` et `.env.example` :
```bash
# 🔹 ORDER SERVICE
ORDER_SERVICE_HOST=goosee-order-service-dev
ORDER_SERVICE_PORT=3006
ORDER_DB_HOST=goosee-order-db-dev
ORDER_DB_PORT=5432
ORDER_DB_USER=postgres
ORDER_DB_PASSWORD=postgres
ORDER_DB_NAME=order_db
```
3. Mettre à jour `docker-compose.back.dev.yml` (voir étape 7)
4. Mettre à jour `services.config.ts` de l'API Gateway si le service est consommé par le front
