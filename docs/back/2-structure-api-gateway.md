# 🚪 Étape 2 — Structure de l'API Gateway

L'**API Gateway** est le **point d'entrée HTTP unique** du backend Goosee. Le frontend (Next.js) ne parle qu'à elle ; elle se charge ensuite de router les requêtes vers les microservices appropriés (en HTTP ou via RabbitMQ).

---

## 🎯 Rôle

- **Façade unifiée** : un seul host/port pour le frontend (`http://localhost:3001`)
- **Routage** vers les microservices internes
- **CORS** centralisé
- **Validation** des entrées (DTO + class-validator)
- **Documentation Swagger** auto-générée (en dev)
- Plus tard : authentification, rate-limiting, logging des requêtes

---

## 📁 Arborescence

```
templates/back/api-gateway/
├── Dockerfile
├── Dockerfile.dev
├── package.json
└── src/
    ├── main.ts                          # Boot HTTP, CORS, Swagger
    ├── app.module.ts                    # Module racine, importe tous les services
    │
    ├── config/
    │   ├── routes.config.ts             # Tous les paths centralisés
    │   └── services.config.ts           # URLs des microservices internes
    │
    ├── shared/
    │   └── services/
    │       └── http-proxy.service.ts    # Wrapper Axios partagé
    │
    └── services/                        # Un dossier par microservice consommé
        ├── auth/
        │   ├── auth.module.ts
        │   └── usecases/
        │       ├── login/
        │       │   └── login.controller.ts
        │       ├── register/
        │       └── ...
        ├── user/
        │   ├── user.module.ts
        │   └── usecases/
        │       ├── create-user/
        │       ├── list-users/
        │       └── ...
        ├── pages/
        ├── menus/
        ├── settings/
        └── upload/
```

---

## 🧠 Concepts clés

### 1. Un module par microservice consommé
Chaque dossier dans `services/` correspond à un microservice. Il contient :
- **un module** (`xxx.module.ts`) qui regroupe les controllers
- **des controllers** organisés par usecase, qui reçoivent la requête HTTP du front et la **proxient** vers le microservice cible

### 2. Configuration centralisée des routes
Toutes les routes du backend sont déclarées dans `config/routes.config.ts` :

```ts
const usersBasePath = '/users';

export const routesConfig = {
  user: {
    createUser: {
      path: `${usersBasePath}/create-user`,
      link: (serviceUrl: string) => `${serviceUrl}${usersBasePath}/create-user`,
    },
    // ...
  },
};
```

→ Le `path` est ce que le front voit ; le `link()` construit l'URL interne vers le microservice. Tout est typé et auto-complété.

### 3. URLs des microservices typées
`config/services.config.ts` lit les variables d'environnement et expose un objet typé :

```ts
export type ServiceUrls = {
  user: string;
  auth: string;
  page: string;
};

export const serviceUrl = (config: ConfigService): ServiceUrls => ({
  user: `http://${config.get('USER_SERVICE_HOST')}:${config.get('USER_SERVICE_PORT')}`,
  // ...
});
```

### 4. Proxy HTTP partagé
`shared/services/http-proxy.service.ts` enveloppe `axios` (méthodes `get`, `post`, `put`, `delete`) avec une gestion d'erreur uniforme. Tous les controllers l'utilisent pour relayer les appels.

---

## 🔌 Exemple d'un controller de gateway

```ts
@ApiTags('User')
@Controller()
export class ListUsersController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService,
  ) {
    this.services = serviceUrl(this.config);
  }

  @Get(routesConfig.user.getUsers.path)
  @ApiOperation({ summary: 'Récupérer la liste des utilisateurs' })
  async getUsers() {
    const url = routesConfig.user.getUsers.link(this.services.user);
    return this.httpProxy.get(url, 'Get user failed');
  }
}
```

---

## 🌐 Frontend ↔ Gateway

Le front configure son client HTTP avec :

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

et appelle directement les routes définies dans `routes.config.ts`. La gateway s'occupe ensuite de tout le routage interne.

---

## ✅ Checklist d'ajout d'un nouveau microservice dans la gateway

- [ ] Créer un dossier `services/<nom-service>/`
- [ ] Créer un module `<nom-service>.module.ts`
- [ ] Ajouter les controllers usecase par usecase dans `usecases/`
- [ ] Ajouter le base path et les routes dans `config/routes.config.ts`
- [ ] Ajouter l'URL du service dans `config/services.config.ts` + le type `ServiceUrls`
- [ ] Importer le module dans `app.module.ts`
- [ ] Ajouter les vars `*_SERVICE_HOST` / `*_SERVICE_PORT` dans `.env.dev`
