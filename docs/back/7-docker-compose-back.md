# 🐳 Étape 7 — Configuration Docker Compose (Back-end)

> ⚠️ En développement courant, le back tourne en **natif** via `yarn infra` + `yarn dev` (voir
> [README](../../README.md)) — aucun script `yarn` ne lance plus ce fichier automatiquement.
> Il reste utile comme référence de structure (et pour `docker-compose.back.prod.yml`, son
> équivalent prod, qui lui est bien utilisé par `yarn start:prod`) et peut être lancé
> manuellement (`docker compose -f docker/dev/docker-compose.back.dev.yml ... up`) si tu veux
> tester le backend entièrement dockerisé.

Le fichier `docker/dev/docker-compose.back.dev.yml` lance l'ensemble du backend dans un même réseau Docker (`goosee_net`) :

- l'**API Gateway** (point d'entrée HTTP)
- les **microservices** (`auth-service`, `user-service`, `page-service`, `notifier-service`, `log-service`)
- une **base PostgreSQL dédiée** par microservice (database-per-service)

L'infrastructure partagée (RabbitMQ, MinIO, Mailhog, Adminer) est définie séparément dans `docker-compose.infra.dev.yml`.

---

## 📁 Emplacement

```
docker/dev/docker-compose.back.dev.yml
```

---

## 🧠 Modèle d'un service backend

Chaque microservice suit le même schéma :

```yaml
goosee-<nom>-service-dev:
  container_name: goosee-<nom>-service-dev
  build:
    context: ../..
    dockerfile: templates/back/services/<nom>-service/Dockerfile.dev
  command: yarn dev
  environment:
    NODE_ENV: ${NODE_ENV}
    RABBITMQ_URL: ${RABBITMQ_URL}            # si le service utilise RMQ
    <NOM>_SERVICE_PORT: ${<NOM>_SERVICE_PORT}
    <NOM>_DB_HOST: ${<NOM>_DB_HOST}
    <NOM>_DB_PORT: ${<NOM>_DB_PORT}
    <NOM>_DB_USER: ${<NOM>_DB_USER}
    <NOM>_DB_PASSWORD: ${<NOM>_DB_PASSWORD}
    <NOM>_DB_NAME: ${<NOM>_DB_NAME}
  expose:
    - "${<NOM>_SERVICE_PORT}"
  depends_on:
    goosee-<nom>-db-dev:
      condition: service_healthy
    goosee-rabbitmq-dev:                     # si RMQ
      condition: service_healthy
  healthcheck:
    test: ["CMD-SHELL", "nc -z localhost ${<NOM>_SERVICE_PORT}"]
    interval: 5s
    timeout: 3s
    retries: 10
    start_period: 5s
  networks:
    - goosee_net

goosee-<nom>-db-dev:
  image: postgres:16-alpine
  container_name: goosee-<nom>-db-dev
  restart: unless-stopped
  environment:
    POSTGRES_USER: ${<NOM>_DB_USER}
    POSTGRES_PASSWORD: ${<NOM>_DB_PASSWORD}
    POSTGRES_DB: ${<NOM>_DB_NAME}
  volumes:
    - <nom>_db_data:/var/lib/postgresql/data
  expose:
    - "${<NOM>_DB_PORT}"
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ${<NOM>_DB_USER} -d ${<NOM>_DB_NAME}"]
    interval: 5s
    timeout: 3s
    retries: 10
  networks:
    - goosee_net
```

---

## 🔑 Concepts clés

### `build.context`
Les Dockerfiles de dev utilisent le **contexte racine du repo** (`../..`) afin de pouvoir copier `package.json` + `yarn.lock` à la racine et bénéficier des **workspaces yarn**. C'est pour ça qu'on voit :

```yaml
build:
  context: ../..
  dockerfile: templates/back/services/user-service/Dockerfile.dev
```

### `expose` vs `ports`
| Clé      | Effet                                                              |
|----------|--------------------------------------------------------------------|
| `ports`  | Ouvre le port sur la machine hôte (ex: l'API Gateway)              |
| `expose` | Rend le port visible **uniquement** dans `goosee_net` (microservices) |

→ Seul l'**API Gateway** utilise `ports`. Les microservices restent `expose`-only.

### `depends_on` + `condition: service_healthy`
Permet d'attendre que la base postgres et/ou rabbitmq soient **réellement prêts** avant de démarrer le microservice — pas seulement "container démarré".

### `healthcheck`
- Microservices : test TCP (`nc -z localhost <port>`)
- Postgres : `pg_isready`
- RabbitMQ : `rabbitmq-diagnostics ping`

### Volumes nommés
Chaque base postgres a son propre volume nommé pour persister les données entre redémarrages :

```yaml
volumes:
  auth_db_data:
  user_db_data:
  page_db_data:
  log_db_data:
```

### Réseau partagé `goosee_net`
Tous les containers backend, frontend et infra sont sur ce réseau bridge. La résolution DNS se fait par `container_name`, donc l'API Gateway contacte le user-service via :

```
http://goosee-user-service-dev:${USER_SERVICE_PORT}
```

---

## ➕ Ajouter un nouveau microservice

1. Définir les vars d'env (étape 6)
2. Ajouter le bloc service + le bloc db dans `docker-compose.back.dev.yml`
3. Ajouter le volume nommé dans la section `volumes:` en bas
4. Si le service utilise RabbitMQ, ne pas oublier `RABBITMQ_URL` + `depends_on goosee-rabbitmq-dev`
5. Faire la même chose dans `docker-compose.back.prod.yml` (en utilisant le `Dockerfile` prod, pas `Dockerfile.dev`)

---

## ✅ Commandes utiles

```bash
# Flux de dev courant : infra en Docker, back+front en natif
yarn infra
yarn dev

# Arrêter l'infra / reset complet (supprime les volumes — perte de données)
yarn infra:down
yarn infra:clean

# Entrer dans la base d'un service (conteneur fourni par l'infra)
docker exec -it goosee-log-db-dev psql -U postgres -d log_db

# Lancer ce fichier manuellement pour tester le back entièrement dockerisé
docker compose --env-file env/.env.dev -f docker/dev/docker-compose.back.dev.yml -f docker/dev/docker-compose.infra.dev.yml up --build
```
