# 🧱 Étape 1 — Structure d'un microservice

Tous les microservices Goosee suivent une **architecture en couches (Clean Architecture)** pour rester modulaires, testables et faciles à maintenir.

---

## 📁 Arborescence type

```
templates/back/services/<mon-service>/
├── Dockerfile                     # Image de production (multi-stage)
├── Dockerfile.dev                 # Image de développement (hot reload)
├── nest-cli.json
├── package.json
├── tsconfig.json
└── src/
    ├── main.ts                    # Point d'entrée (HTTP + RMQ microservice)
    ├── app.module.ts              # Module racine NestJS
    │
    ├── config/
    │   └── orm.config.ts          # DataSource TypeORM (migrations CLI)
    │
    ├── entities/                  # Modèles de données (TypeORM)
    │   └── user.entity.ts
    │
    ├── repositories/              # Couche d'accès aux données
    │   ├── user.repository.ts          # interface abstraite (port)
    │   └── implements/
    │       └── user.impl.repository.ts # implémentation TypeORM (adapter)
    │
    ├── usecases/                  # Logique métier (un dossier par cas d'usage)
    │   ├── create-user/
    │   │   ├── create-user.controller.ts   # HTTP ou RMQ (entrée)
    │   │   ├── create-user.usecase.ts      # logique pure
    │   │   ├── create-user.dto.ts          # validation (class-validator)
    │   │   └── create-user.event.ts        # listener RabbitMQ (si besoin)
    │   ├── update-user/
    │   ├── delete-user/
    │   └── ...
    │
    └── shared/                    # Helpers transverses
        └── log-client.service.ts  # Émetteur de logs vers le log-service
```

---

## 🧠 Principes

### 1. Séparation des responsabilités
| Couche       | Rôle                                                                 |
|--------------|----------------------------------------------------------------------|
| `entities`   | Définit la forme des données (TypeORM)                               |
| `repositories` | Abstrait l'accès à la base (interface + impl)                      |
| `usecases`   | Contient la logique métier, **pas** d'accès direct à TypeORM         |
| `controllers`| Reçoit les requêtes HTTP/RMQ et délègue au usecase                   |
| `dto`        | Valide les entrées avec `class-validator`                            |

### 2. Inversion de dépendances
Les usecases dépendent d'**interfaces** (`IUserRepository`), pas d'implémentations.
L'implémentation TypeORM est injectée par NestJS via :

```ts
providers: [
  { provide: IUserRepository, useClass: TypeOrmUserRepository },
],
```

→ rend le code **testable** (mock du repo) et **portable** (changer de base = changer l'impl).

### 3. Un dossier = un cas d'usage
Chaque opération métier (`create-user`, `update-user`, `delete-user`...) a son propre dossier contenant tous ses fichiers.

---

## 🌐 Communication

Un microservice peut exposer ses fonctionnalités de **deux façons** :

| Mode               | Décorateur            | Usage                                  |
|--------------------|-----------------------|----------------------------------------|
| HTTP REST          | `@Controller`, `@Get` | Appels synchrones depuis l'API Gateway |
| RabbitMQ (event)   | `@EventPattern`       | Fire-and-forget, asynchrone            |
| RabbitMQ (request) | `@MessagePattern`     | Request/response, asynchrone           |

**Exemple `main.ts`** d'un service mixte (HTTP + RMQ) :

```ts
const app = await NestFactory.create(AppModule);

app.connectMicroservice<RmqOptions>({
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RABBITMQ_URL!],
    queue: 'user_events',
    queueOptions: { durable: true },
  },
});

await app.startAllMicroservices();
await app.listen(process.env.USER_SERVICE_PORT!);
```

---

## 🗃️ Base de données

Chaque microservice possède **sa propre base PostgreSQL** (pattern *database-per-service*). Aucune relation cross-base : les références vers d'autres entités utilisent uniquement des `id` (UUID), pas des foreign keys.

⚠️ `synchronize: true` est **uniquement** activé en développement. En production, utiliser des migrations TypeORM.

---

## ✅ Checklist de création

- [ ] `Dockerfile` + `Dockerfile.dev`
- [ ] `package.json` avec dépendances NestJS + TypeORM + amqplib (si RMQ)
- [ ] `main.ts` configurant HTTP et/ou RMQ
- [ ] `app.module.ts` avec `TypeOrmModule` et providers
- [ ] Au moins une entité dans `entities/`
- [ ] Une interface repository + une implémentation
- [ ] Au moins un usecase complet (`controller` + `usecase` + `dto`)
- [ ] Variables d'env ajoutées dans `env/.env.dev` et `env/.env.prod`
- [ ] Service ajouté dans `docker/dev/docker-compose.back.dev.yml` et l'équivalent prod
