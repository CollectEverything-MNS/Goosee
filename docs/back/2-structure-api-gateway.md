# Structure de l'API Gateway

L'API Gateway est le **seul point d'entrée** du backend.
Il reçoit toutes les requêtes HTTP du frontend et les redirige vers les micro-services appropriés.
Il ne contient **aucune logique métier** ni accès direct à une base de données.

---

## Rôle

```
Frontend (Next.js :3000)
         │
         │  HTTP/REST
         ▼
 API Gateway (:3001)          ← seul port exposé au frontend
    ├── /users/*       ──────▶  user-service  (:3002)
    ├── /auth/*        ──────▶  auth-service  (:3003)
    ├── /pages/*       ──────▶  page-service  (:3004)
    ├── /menus/*       ──────▶  page-service  (:3004)
    ├── /settings/*    ──────▶  page-service  (:3004)
    └── /upload/*      ──────▶  page-service  (:3004)
```

---

## Arborescence

```
src/
├── main.ts                           # Bootstrap : CORS, cookies, Swagger, validation
├── app.module.ts                     # Module racine — importe tous les modules de service
├── config/
│   ├── routes.config.ts              # Centralise les chemins et URL builders
│   └── services.config.ts            # Construit les URL des micro-services depuis l'env
├── shared/
│   └── services/
│       └── http-proxy.service.ts     # Service partagé pour appeler les micro-services
└── services/                         # Un dossier par domaine fonctionnel
    ├── auth/                         # Pattern "usecase par usecase"
    │   ├── auth.module.ts
    │   └── usecases/
    │       ├── login/
    │       │   ├── login.controller.ts
    │       │   └── login.dto.ts
    │       ├── register/
    │       ├── revoke-token/
    │       ├── refresh-token/
    │       ├── change-password/
    │       ├── forget-password-request/
    │       ├── forget-password-confirm/
    │       ├── verify-email/
    │       └── resend-verification-email/
    ├── user/                         # Pattern "usecase par usecase"
    │   ├── user.module.ts
    │   └── usecases/
    │       ├── create-user/
    │       ├── get-user/
    │       ├── list-users/
    │       ├── list-admins/
    │       ├── list-customers/
    │       ├── update-user/
    │       └── delete-user/
    ├── pages/                        # Pattern "controller + service"
    │   ├── pages.module.ts
    │   ├── pages.controller.ts
    │   ├── pages.service.ts
    │   └── dto/
    ├── menus/                        # Pattern "controller + service"
    │   ├── menus.module.ts
    │   ├── menus.controller.ts
    │   ├── menus.service.ts
    │   └── dto/
    ├── settings/                     # Pattern "controller + service"
    │   ├── settings.module.ts
    │   ├── settings.controller.ts
    │   ├── settings.service.ts
    │   └── dto/
    └── upload/                       # Pattern "controller + service"
        ├── upload.module.ts
        ├── upload.controller.ts
        └── upload.service.ts
```

---

## Deux patterns de structure

### Pattern A — Usecase par usecase (auth, user)

Utilisé pour les domaines avec beaucoup de cas d'usage distincts.
Chaque endpoint a **son propre controller + DTO**.

```
services/auth/
└── usecases/
    └── login/
        ├── login.controller.ts   ← @Post('/auth/login')
        └── login.dto.ts          ← validation du body
```

```typescript
// login.controller.ts
@ApiTags('Auth')
@Controller()
export class LoginController {
  @Post(routesConfig.auth.login.path)            // POST /auth/login
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.httpProxy.post<LoginResponse>(url, dto, 'Login failed');

    // Pose le cookie HTTP-only après authentification réussie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      expires: new Date(result.expiredAt),
    });

    return result;
  }
}
```

Le module déclare **un controller par usecase** :

```typescript
// auth.module.ts
@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [
    LoginController,
    RegisterController,
    RevokeTokenController,
    RefreshTokenController,
    // ...
  ],
  providers: [HttpProxyService],
})
export class AuthModule {}
```

---

### Pattern B — Controller + Service (pages, menus, settings, upload)

Utilisé pour les domaines CRUD standard.
Un seul controller regroupe toutes les routes, et un service intermédiaire
gère les appels au micro-service.

```
services/pages/
├── pages.module.ts
├── pages.controller.ts   ← @Controller('pages') — GET, POST, PUT, DELETE
├── pages.service.ts      ← appelle page-service via HttpProxyService
└── dto/
    ├── create-page.dto.ts
    └── update-page.dto.ts
```

```typescript
// pages.controller.ts
@ApiTags('Pages')
@Controller('pages')
export class PagesController {
  @Get()        async getAll()              { return this.pagesService.getAll(); }
  @Get(':id')   async getById(@Param('id')) { return this.pagesService.getById(id); }
  @Post()       async create(@Body() dto)   { return this.pagesService.create(dto); }
  @Put(':id')   async update(...)           { return this.pagesService.update(id, dto); }
  @Delete(':id') async delete(...)          { return this.pagesService.delete(id); }
}
```

```typescript
// pages.service.ts
@Injectable()
export class PagesService {
  private readonly pageServiceUrl: string;

  constructor(private readonly httpProxy: HttpProxyService, config: ConfigService) {
    this.pageServiceUrl = `http://${config.get('PAGE_SERVICE_HOST')}:${config.get('PAGE_SERVICE_PORT')}`;
  }

  async getAll() {
    return this.httpProxy.get(`${this.pageServiceUrl}/pages`, 'Failed to fetch pages');
  }

  async create(dto: CreatePageDto) {
    return this.httpProxy.post(`${this.pageServiceUrl}/pages`, dto, 'Failed to create page');
  }
  // ...
}
```

---

## Services partagés

### `http-proxy.service.ts` — Proxy HTTP mutualisé

Wrapping d'Axios utilisé par **tous** les controllers/services pour appeler
les micro-services. Gère la propagation des erreurs HTTP.

```typescript
@Injectable()
export class HttpProxyService {
  async get<T>(url: string, errorMessage?: string): Promise<T>
  async post<T>(url: string, body: unknown, errorMessage?: string): Promise<T>
  async put<T>(url: string, body: unknown, errorMessage?: string): Promise<T>
  async patch<T>(url: string, body: unknown, errorMessage?: string): Promise<T>
  async delete<T>(url: string, errorMessage?: string): Promise<T>
  async postWithConfig<T>(url: string, body: unknown, config: AxiosRequestConfig, errorMessage?: string): Promise<T>
}
```

En cas d'erreur Axios, le service relance une `HttpException` avec le code HTTP
original du micro-service → le frontend reçoit le bon statut (400, 401, 404…).

---

### `config/services.config.ts` — URLs des micro-services

Construit les URLs à partir des variables d'environnement.
Utilisé par tous les controllers au démarrage.

```typescript
export const serviceUrl = (config: ConfigService): ServiceUrls => ({
  user: `http://${config.get('USER_SERVICE_HOST')}:${config.get('USER_SERVICE_PORT')}`,
  auth: `http://${config.get('AUTH_SERVICE_HOST')}:${config.get('AUTH_SERVICE_PORT')}`,
  page: `http://${config.get('PAGE_SERVICE_HOST')}:${config.get('PAGE_SERVICE_PORT')}`,
});
```

---

### `config/routes.config.ts` — Chemins centralisés

Évite la duplication des chaînes de caractères dans les controllers.
Chaque route expose deux propriétés :
- `path` : chemin NestJS (ex: `'/auth/login'`)
- `link(serviceUrl)` : URL complète vers le micro-service (ex: `'http://auth-service:3003/auth/login'`)

```typescript
export const routesConfig = {
  auth: {
    login: {
      path: '/auth/login',
      link: (serviceUrl: string) => `${serviceUrl}/auth/login`,
    },
    token: {
      revoke: {
        path: '/auth/revoke-token',
        link: (serviceUrl: string) => `${serviceUrl}/auth/revoke-token`,
      },
    },
    // ...
  },
  user: {
    getUser: {
      path: '/users/get-user/:id',
      link: (serviceUrl: string, id: string) => `${serviceUrl}/users/${id}`,
    },
    // ...
  },
};
```

---

## `main.ts` — Configuration globale

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Validation automatique de tous les DTOs via class-validator
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const webUrl = configService.get<string>('NEXT_PUBLIC_WEB_URL');

  // Empêche un démarrage silencieusement mal configuré en production
  if (nodeEnv === 'production' && !webUrl) {
    throw new Error('NEXT_PUBLIC_WEB_URL must be defined in production');
  }

  // CORS : autorise uniquement le domaine frontend
  app.enableCors({
    origin: webUrl || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,     // Nécessaire pour envoyer les cookies HTTP-only
  });

  // Swagger uniquement en développement
  if (nodeEnv === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Projet Goosee Generator - development')
      .setVersion('1.0')
      .build();
    SwaggerModule.setup('api-docs', app, SwaggerModule.createDocument(app, config));
  }

  await app.listen(configService.get<number>('API_GATEWAY_PORT', 3001));
}
```

---

## `app.module.ts` — Module racine

Importe un module par domaine fonctionnel. Aucun provider global ici.

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    PagesModule,
    MenusModule,
    SettingsModule,
    UploadModule,
  ],
})
export class AppModule {}
```

---

## Flux d'une requête

```
Browser
  │
  │  POST /auth/login  { email, password }  + cookie 'token' (si déjà connecté)
  ▼
API Gateway — main.ts
  │  ValidationPipe valide le body
  ▼
LoginController
  │  httpProxy.post('http://auth-service:3003/auth/login', dto)
  ▼
auth-service → LoginUseCase → PostgreSQL
  │
  │  { token, expiredAt }
  ▼
LoginController
  │  res.cookie('token', token, { httpOnly: true, ... })
  ▼
Browser  ←  HTTP 200 { token, expiredAt } + Set-Cookie: token=...
```