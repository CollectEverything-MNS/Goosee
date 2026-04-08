# 🐰 Étape 9 — Communication RabbitMQ entre microservices

RabbitMQ est le **bus de messages** central de Goosee. Il permet aux microservices de communiquer **sans se connaître directement** : un service publie un message dans une queue, un autre le consomme, sans couplage HTTP.

---

## 🎯 Quand utiliser RabbitMQ vs HTTP ?

| Cas                                              | Préférer        |
|--------------------------------------------------|-----------------|
| Le frontend appelle le backend                   | **HTTP** (via API Gateway) |
| Un microservice doit notifier d'autres services  | **RMQ EventPattern** |
| Un microservice attend une réponse d'un autre    | **RMQ MessagePattern** OU HTTP direct |
| Notifier (mail, log, push) en arrière-plan       | **RMQ EventPattern** |

Règle d'or : **si la donnée n'est pas critique pour la réponse de l'utilisateur final, passer par RabbitMQ**.

---

## 📡 Les deux patterns NestJS

### 1. `@EventPattern` — fire-and-forget

Le producer publie et n'attend rien. Plusieurs consumers peuvent écouter le même event.

**Producer (user-service)** :
```ts
@Inject('LOG_CLIENT') private readonly client: ClientProxy;

this.client.emit('log.created', {
  service: 'user-service',
  level: 'SUCCESS',
  message: 'Utilisateur créé',
});
```

**Consumer (log-service)** :
```ts
@Controller()
export class CreateLogEventsListener {
  constructor(private readonly useCase: CreateLogUseCase) {}

  @EventPattern('log.created')
  async handle(@Payload() data: CreateLogPayload) {
    await this.useCase.execute(data);
  }
}
```

✅ Avantages :
- Découplage total
- Le producer continue même si le consumer est down
- Messages persistés dans la queue tant que personne ne les a consommés (queue `durable`)

---

### 2. `@MessagePattern` — request/response

Le producer publie et attend une réponse synchrone via une *reply queue* RabbitMQ.

**Producer** :
```ts
const logs = await lastValueFrom(
  this.client.send('log.list', {})
);
```

**Consumer (log-service)** :
```ts
@Controller()
export class ListLogsController {
  constructor(private readonly useCase: ListLogsUseCase) {}

  @MessagePattern('log.list')
  async handle() {
    return this.useCase.execute();
  }
}
```

⚠️ À utiliser avec parcimonie :
- introduit un couplage temporel (le producer attend)
- moins résilient qu'HTTP direct
- préférable seulement si on veut éviter d'exposer un endpoint HTTP

---

## 🏗️ Configuration côté NestJS

### Côté **consumer** (`main.ts`)
```ts
app.connectMicroservice<RmqOptions>({
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RABBITMQ_URL!],
    queue: 'log_events',
    queueOptions: { durable: true },
  },
});

await app.startAllMicroservices();
```

### Côté **producer** (`app.module.ts`)
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

Puis injection dans un usecase :
```ts
constructor(@Inject('LOG_CLIENT') private readonly client: ClientProxy) {}
```

---

## 🗂️ Conventions de nommage

### Queues
| Queue              | Owner            | Usage                                  |
|--------------------|------------------|----------------------------------------|
| `auth_events`      | auth-service     | Events liés à l'authentification       |
| `user_events`      | user-service     | Events liés aux utilisateurs           |
| `log_events`       | log-service      | Events de logging applicatif           |
| `notifications_queue` | notifier-service | Demandes d'envoi de notifications    |

### Patterns
Format : `<domaine>.<action>` en kebab-case

Exemples :
- `auth.registered`
- `user.updated`
- `user.deleted`
- `log.created`
- `log.list`
- `send_notification`

---

## 🛡️ Bonnes pratiques

1. **Toujours `durable: true`** sur les queues : sinon les messages sont perdus au redémarrage de RabbitMQ.
2. **`emit()` au lieu de `send()`** sauf si tu as besoin d'une réponse — c'est plus performant et résilient.
3. **Idempotence** : un message peut être livré plusieurs fois (au moins une fois). Le consumer doit être capable de retraiter sans dégât (ex: vérifier l'existence avant de créer).
4. **Pas de boucles** : un service ne doit pas réagir à un event qu'il a lui-même émis.
5. **Healthcheck** : toujours mettre `goosee-rabbitmq-dev` dans `depends_on` avec `condition: service_healthy` pour les services qui consomment ou émettent.
6. **Logging** : utiliser le `log-service` (qui passe par RMQ) pour tracer les opérations métier importantes.

---

## 🔍 Debug RabbitMQ

### Interface web
```
http://localhost:15672
user / password : guest / guest (en dev)
```

Onglets utiles :
- **Queues** : voir les queues, leur taille, le débit
- **Connections** : voir quels services sont connectés
- **Exchanges** : voir le routage des messages

### Lignes de logs typiques

✅ Connexion OK :
```
[ClientProxy] Successfully connected to RMQ broker
```

⚠️ Pattern non géré :
```
ERROR [Server] There is no matching event handler defined in the remote service.
Event pattern: user.updated
```
→ Le producer émet sur un pattern qu'aucun consumer n'écoute. Soit ajouter le handler, soit retirer l'`emit()`.

---

## 📚 Voir aussi

- [8. Microservice Log](./8-log-service.md) — exemple complet d'utilisation de `@EventPattern`
- [Documentation NestJS Microservices](https://docs.nestjs.com/microservices/rabbitmq)
