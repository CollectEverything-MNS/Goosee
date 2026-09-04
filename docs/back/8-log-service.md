# 📜 Étape 8 — Microservice Log (centralisation des logs via RabbitMQ)

Le **log-service** centralise les logs applicatifs de tous les microservices du projet Goosee.
Il consomme des événements RabbitMQ émis par les autres services et les persiste dans sa propre base PostgreSQL.

---

## 🎯 Objectif

- **Découpler** la production de logs (les autres services) de leur stockage (le log-service).
- **Fire-and-forget** : un service qui logge n'attend jamais de réponse.
- **Résilient** : si le log-service est indisponible, les messages s'accumulent dans RabbitMQ et seront traités au redémarrage.

---

## 🏗️ Architecture

```
┌────────────────┐                 ┌──────────────────────┐
│ user-service   │                 │                      │
│ page-service   │ ──emit log──▶   │  RabbitMQ            │
│ notifier-svc   │                 │  queue: log_events   │
│ ...            │                 │  (durable)           │
└────────────────┘                 └──────────┬───────────┘
                                              │
                                              ▼
                                   ┌──────────────────────┐
                                   │  log-service         │
                                   │  @EventPattern       │
                                   │  ('log.created')     │
                                   └──────────┬───────────┘
                                              │
                                              ▼
                                   ┌──────────────────────┐
                                   │  PostgreSQL (log_db) │
                                   │  table: log          │
                                   └──────────────────────┘
```

---

## 📁 Structure du service

```
templates/back/services/log-service/
├── Dockerfile
├── Dockerfile.dev
├── package.json
└── src/
    ├── main.ts                                  # boot HTTP + RMQ microservice
    ├── app.module.ts
    ├── entities/
    │   └── log.entity.ts                        # Log + enum LogLevel
    ├── repositories/
    │   ├── log.repository.ts
    │   └── implements/log.impl.repository.ts
    └── usecases/
        ├── create-log/
        │   ├── create-log.usecase.ts
        │   └── create-log.event.ts              # @EventPattern('log.created')
        └── list-logs/
            ├── list-logs.usecase.ts
            └── list-logs.controller.ts          # @MessagePattern('log.list')
```

---

## 🧩 Entité `Log`

| Champ       | Type       | Nullable | Description                                  |
|-------------|------------|----------|----------------------------------------------|
| `id`        | uuid       | non      | Identifiant unique                           |
| `service`   | string     | oui      | Nom du service émetteur (ex: `user-service`) |
| `level`     | LogLevel   | oui      | Niveau du log                                |
| `message`   | text       | non      | Contenu du log                               |
| `userId`    | string     | oui      | Identifiant de l'utilisateur concerné        |
| `createdAt` | timestamp  | non      | Date de création                             |
| `updatedAt` | timestamp  | non      | Date de mise à jour                          |

### Niveaux disponibles (`LogLevel`)
`INFO` · `SUCCESS` · `WARNING` · `ERROR` · `CRITICAL` · `DEBUG`

---

## 📡 Patterns RabbitMQ

| Pattern        | Type            | Usage                                                              |
|----------------|-----------------|--------------------------------------------------------------------|
| `log.created`  | `@EventPattern` | Création d'un log (fire-and-forget, depuis tous les services)      |
| `log.list`     | `@MessagePattern` | Récupération des logs (request/response, pour usage admin futur) |

Queue : **`log_events`** (durable, messages persistants).

---

## 🔌 Émettre un log depuis un autre microservice

Chaque service qui veut émettre des logs doit :

1. Enregistrer un `ClientProxy` `LOG_CLIENT` dans son `app.module.ts` :

```ts
ClientsModule.registerAsync([
  {
    name: 'LOG_CLIENT',
    inject: [ConfigService],
    useFactory: (cfg: ConfigService) => ({
      transport: Transport.RMQ,
      options: {
        urls: [cfg.get<string>('RABBITMQ_URL')!],
        queue: 'log_events',
        queueOptions: { durable: true },
      },
    }),
  },
]),
```

2. Créer un helper `LogClient` (`src/shared/log-client.service.ts`) qui expose des méthodes simples :

```ts
@Injectable()
export class LogClient {
  constructor(@Inject('LOG_CLIENT') private readonly client: ClientProxy) {}

  success(payload: { message: string; userId?: string }) {
    this.client.emit('log.created', {
      service: 'user-service',
      level: 'SUCCESS',
      ...payload,
    });
  }
  // info, warning, error, critical, debug...
}
```

3. L'injecter dans les use cases :

```ts
constructor(
  private readonly userRepo: IUserRepository,
  private readonly logClient: LogClient,
) {}

async execute(dto: CreateUserDto) {
  const user = await this.userRepo.save(...);
  this.logClient.success({
    message: `Utilisateur créé : ${user.email}`,
    userId: user.id,
  });
}
```

---

## 🐳 Variables d'environnement

À ajouter dans `env/.env.dev` (et `env/.env.prod`) :

```
# LOG SERVICE
LOG_SERVICE_HOST=goosee-log-service-dev
LOG_SERVICE_PORT=3005

# LOG DATABASE
LOG_DB_HOST=goosee-log-db-dev
LOG_DB_PORT=5432
LOG_DB_USER=postgres
LOG_DB_PASSWORD=postgres
LOG_DB_NAME=log_db
```

⚠️ Tout service qui utilise `LOG_CLIENT` doit aussi recevoir `RABBITMQ_URL` dans son `environment` Docker.

---

## ✅ Tester

1. Démarrer la stack :
```bash
yarn infra
yarn dev
```

2. Déclencher une opération qui logge (ex: créer un user via le front).

3. Vérifier dans la base :
```bash
docker exec -it goosee-log-db-dev psql -U postgres -d log_db \
  -c "SELECT service, level, message, \"createdAt\" FROM log ORDER BY \"createdAt\" DESC LIMIT 10;"
```

4. Côté RabbitMQ UI (`http://localhost:15672`, `guest`/`guest`) → onglet **Queues** → vérifier `log_events`.

---

## 🧠 Bonnes pratiques

- **Ne jamais bloquer** un use case sur l'émission d'un log → toujours `emit()`, jamais `send()` côté producer.
- **Le log-service ne logge pas vers lui-même** : utiliser `console.log` ou le `Logger` Nest local pour éviter les boucles.
- **Index DB** sur `(service, createdAt)`, `(level, createdAt)`, `(userId, createdAt)` → déjà en place dans l'entité.
- Pour la **rétention** des logs (purge périodique), prévoir un cron ou un TTL applicatif — non implémenté par défaut.
