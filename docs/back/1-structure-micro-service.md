# Structure d'un micro-service

Chaque micro-service suit la même organisation basée sur la **Clean Architecture**.
L'`auth-service` sert de référence dans cette documentation.

---

## Arborescence

```
src/
├── main.ts                          # Point d'entrée : démarre HTTP + écoute RabbitMQ
├── app.module.ts                    # Module racine NestJS
├── config/
│   ├── orm.config.ts                # Configuration TypeORM (connexion PostgreSQL)
│   └── routes.config.ts             # Définition des chemins de routes HTTP du service
├── entities/                        # Entités TypeORM → tables PostgreSQL
│   ├── auth.entity.ts
│   └── auth-token.entity.ts
├── repositories/                    # Couche d'accès aux données
│   ├── auth.repository.ts           # Interface abstraite (contrat)
│   ├── auth-token.repository.ts
│   └── implements/                  # Implémentations concrètes avec TypeORM
│       ├── auth.impl.repository.ts
│       └── auth-token.impl.repository.ts
├── usecases/                        # Un dossier par cas d'usage métier
│   └── login/
│       ├── login.controller.ts      # Point d'entrée HTTP
│       ├── login.dto.ts             # Validation des données (class-validator)
│       ├── login.usecase.ts         # Logique métier pure
│       └── login.usecase.spec.ts    # Tests unitaires
└── shared/
    └── utils.ts                     # Fonctions utilitaires partagées
```

---

## Responsabilités de chaque couche

### `main.ts` — Point d'entrée

Démarre l'application en deux modes simultanés :
- **HTTP** : expose une API REST pour l'API Gateway (port configuré via `*_SERVICE_PORT`)
- **RabbitMQ** : écoute une queue pour recevoir des événements asynchrones des autres services

```typescript
// Connexion à la queue RabbitMQ propre au service
app.connectMicroservice<RmqOptions>({
  transport: Transport.RMQ,
  options: { urls: [url], queue: 'user_events', queueOptions: { durable: true } },
});
await app.startAllMicroservices();

// Démarrage du serveur HTTP
await app.listen(port);
```

---

### `app.module.ts` — Module racine

Configure l'ensemble du service :
- **TypeORM** → connexion à la base de données PostgreSQL dédiée au service
- **ClientsModule** → connexion aux queues RabbitMQ pour émettre des événements vers d'autres services
- **Providers** → injection des repositories (interface → implémentation) et des usecases

```typescript
@Module({
  imports: [
    TypeOrmModule.forRootAsync({ /* config PostgreSQL */ }),
    TypeOrmModule.forFeature([Auth, AuthToken]),
    ClientsModule.registerAsync([
      { name: 'RMQ_NOTIF_CLIENT', /* queue: 'notifications_queue' */ },
      { name: 'RMQ_AUTH_CLIENT',  /* queue: 'auth_events' */ },
    ]),
  ],
  controllers: [LoginController, RegisterController, /* ... */],
  providers: [
    { provide: IAuthRepository, useClass: TypeOrmAuthRepository }, // injection par interface
    LoginUseCase,
    RegisterUseCase,
    // ...
  ],
})
```

> **Note :** Le service ne se connecte qu'à **sa propre base de données**.
> La communication avec les autres services passe exclusivement par RabbitMQ (async)
> ou par l'API Gateway (sync). ( Utile pour un module de paiement par exemple ou on as besoin de sync)

---

### `entities/` — Modèles de données

Les entités TypeORM représentent les tables PostgreSQL.

```typescript
@Entity('auth')
export class Auth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;             // Hashé avec bcrypt (salt: 12)

  @Column({ default: false })
  isVerified: boolean;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn() deletedAt?: Date;  // Soft delete

  @OneToMany(() => AuthToken, (token) => token.auth)
  tokens: AuthToken[];
}
```

L'entité `AuthToken` gère trois types de tokens via `AUTH_TOKEN_TYPES` :

| Type | Usage |
|------|-------|
| `SESSION` | Token de session (login) |
| `PASSWORD_RESET` | Réinitialisation de mot de passe |
| `EMAIL_VERIFICATION` | Vérification de l'adresse email |

---

### `repositories/` — Accès aux données

Deux fichiers par agrégat : l'**interface** (contrat) et l'**implémentation** (TypeORM).

**Interface (`auth.repository.ts`)** — définit le contrat sans dépendre de TypeORM :

```typescript
export abstract class IAuthRepository {
  abstract save(auth: Auth): Promise<Auth>;
  abstract findByEmail(email: string): Promise<Auth | null>;
  abstract findById(id: string): Promise<Auth | null>;
  abstract softDeleteById(id: string): Promise<void>;
}
```

**Implémentation (`implements/auth.impl.repository.ts`)** — wrapping TypeORM :

```typescript
@Injectable()
export class TypeOrmAuthRepository implements IAuthRepository {
  constructor(@InjectRepository(Auth) private readonly repository: Repository<Auth>) {}

  async save(auth: Auth) { return this.repository.save(auth); }
  async findByEmail(email: string) { return this.repository.findOne({ where: { email } }); }
  // ...
}
```

> Le `app.module.ts` associe l'interface à son implémentation :
> `{ provide: IAuthRepository, useClass: TypeOrmAuthRepository }`
>
> Cela permet de changer d'ORM ou de base sans modifier les usecases.

---

### `usecases/` — Logique métier

Chaque cas d'usage est isolé dans son propre dossier et contient trois fichiers :

#### `login.controller.ts` — Reçoit la requête HTTP

```typescript
@Controller(authRoutes.root)           // @Controller('/auth')
export class LoginController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Post(authRoutes.auth.login)         // POST /auth/login
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }
}
```

Le controller ne contient **aucune logique métier** : il valide le DTO, appelle le usecase et retourne le résultat.

#### `login.dto.ts` — Validation des données

```typescript
export class LoginDto {
  @IsEmail()    email: string;
  @IsString()   password: string;
}

export class LoginResponseDto {
  token: string;
  expiredAt: Date;
}
```

La validation est assurée par `class-validator` via le `ValidationPipe` global.

#### `login.usecase.ts` — Logique métier pure

```typescript
@Injectable()
export class LoginUseCase {
  constructor(
    private readonly authRepo: IAuthRepository,         // injection par interface
    private readonly authTokenRepo: IAuthTokenRepository,
  ) {}

  async execute(dto: LoginDto): Promise<LoginResponseDto> {
    const auth = await this.authRepo.findByEmail(dto.email);
    if (!auth) throw new UnauthorizedException('User not found');
    if (!auth.isVerified) throw new UnauthorizedException('Email not verified');

    const isValid = await comparePassword(dto.password, auth.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    // Génère un token de session valable 24 h
    const token = crypto.randomBytes(32).toString('hex');
    const expiredAt = new Date();
    expiredAt.setHours(expiredAt.getHours() + 24);

    await this.authTokenRepo.save(new AuthToken({ authId: auth.id, token, expiredAt }));
    return { token, expiredAt };
  }
}
```

Le usecase ne dépend **ni de NestJS, ni de TypeORM, ni d'HTTP** : seulement des interfaces de repositories. C'est ce qui le rend facilement testable.

#### `login.usecase.spec.ts` — Tests unitaires

Les usecases sont testés en isolation avec des mocks des repositories.

---

### `config/routes.config.ts` — Définition des routes

Centralise tous les chemins du service pour éviter la duplication de chaînes :

```typescript
export const authRoutes = {
  root: '/auth',
  auth: {
    login: '/login',              // → POST /auth/login
    register: '/register',
    verifyEmail: '/verify-email',
    revokeToken: '/revoke-token',
    // ...
  },
};
```

---

## Flux d'une requête

```
API Gateway
    │
    │  HTTP POST /auth/login  { email, password }
    ▼
LoginController
    │  valide le DTO via ValidationPipe
    ▼
LoginUseCase.execute(dto)
    │  findByEmail() → comparePassword() → save(token)
    ├──▶ IAuthRepository (→ TypeOrmAuthRepository → PostgreSQL)
    └──▶ IAuthTokenRepository (→ TypeOrmAuthTokenRepository → PostgreSQL)
    │
    ▼
{ token, expiredAt }
    │
    ▼
LoginController → HTTP 200 { token, expiredAt }
    │
    ▼
API Gateway → pose le cookie HTTP-only sur la réponse
```

---

## Communication entre services via RabbitMQ

Certains usecases émettent des **événements** après leur exécution.
Par exemple, `register.usecase.ts` publie un événement sur la queue `notifications_queue`
pour que le `notifier-service` envoie l'email de vérification :

```typescript
// Dans RegisterUseCase
this.rmqNotifClient.emit('send_email', {
  to: dto.email,
  subject: 'Vérifiez votre compte',
  // ...
});
```

Le service récepteur déclare un `@EventPattern` ou `@MessagePattern` dans son controller pour traiter l'événement.
