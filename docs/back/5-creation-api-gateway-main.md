# 🚀 Créer une API Gateway NestJS (Goosee Project)

Ce guide explique **pas à pas** comment créer une **API Gateway NestJS** moderne,
qui centralise la communication HTTP entre ton frontend et tes microservices (User, Order, etc.).
Elle servira aussi de point d’entrée unique pour Swagger et la configuration.

---

## 🧩 Étape 1 — Initialisation du projet

### Créer un nouveau projet NestJS
```bash
nest new api-gateway-goosee
```

💡 Cela génère la structure de base NestJS avec un `AppModule`, `main.ts`, et la configuration TypeScript.

---

## 📦 Étape 2 — Installer les dépendances

### Dépendances principales
```bash
yarn add @nestjs/common @nestjs/core @nestjs/config @nestjs/axios @nestjs/microservices @nestjs/swagger axios reflect-metadata rxjs
```

### Dépendances de développement
```bash
yarn add -D @nestjs/cli typescript ts-node ts-loader eslint prettier
```

---

## ⚙️ Étape 3 — Configuration du `package.json`

```json
{
  "name": "api-gateway-goosee",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "start": "nest start",
    "dev": "nest start --watch",
    "build": "nest build",
    "start:prod": "node dist/main",
    "lint": "eslint \"src/**/*.ts\" --fix",
    "test": "jest"
  },
  "dependencies": {
    "@nestjs/axios": "^4.0.1",
    "@nestjs/common": "^11.1.6",
    "@nestjs/config": "^4.0.2",
    "@nestjs/core": "^11.0.1",
    "@nestjs/microservices": "^11.1.6",
    "@nestjs/platform-express": "^11.0.1",
    "@nestjs/swagger": "^11.2.1",
    "axios": "^1.12.2",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "typescript": "^5.7.3",
    "eslint": "^9.18.0",
    "prettier": "^3.4.2"
  }
}
```

---

## 🧱 Étape 4 — Structure du projet

```
src/
│
├── main.ts                # Entrée principale de l’application
├── app.module.ts          # Module racine
│
├── config/                # Fichiers de configuration centralisés
│   ├── routes.config.ts
│   └── services.config.ts
│
└── services/
    └── user/
        ├── usecases/
        │   └── get-user/
        │       ├── get-user.controller.ts
        │       └── get-user.service.ts
        └── user.module.ts
```

---

## ⚙️ Étape 5 — Fichier `main.ts` : Point d’entrée de l’application

🧠 **Résumé :**
Ce fichier est la **porte d’entrée** de ton application NestJS.  
Il initialise le serveur HTTP, configure Swagger en mode développement et lit la configuration via `ConfigService`.  
C’est ici que ton API Gateway démarre réellement.

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const port = configService.get<number>('API_GATEWAY_PORT', 3001);

  if (nodeEnv === 'development') {
    app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);

    const config = new DocumentBuilder()
      .setTitle('Projet Goosee API Gateway')
      .setDescription('API Gateway centralisée pour le projet Goosee')
      .setVersion('1.0.0')
      .addTag('User', 'Gestion des utilisateurs')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
  } else {
    app.useLogger(['error', 'warn']);
  }

  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log('=====================================');
  logger.log(`🚀 API Gateway running in ${nodeEnv.toUpperCase()} mode`);
  logger.log(`🌐 HTTP: http://localhost:${port}`);
  logger.log('=====================================');
}

bootstrap();
```

---

## 🧩 Étape 6 — Fichier `app.module.ts` : Module racine de l’application

🧠 **Résumé :**
Le `AppModule` centralise tous les modules de ton application.  
On y importe `ConfigModule` (pour charger les variables d’environnement) et le `UserModule` (qui gère la logique utilisateur).  
C’est le **cerveau** de ton application.

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './services/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // disponible dans tous les modules
    }),
    UserModule, // ajout de notre module utilisateur
  ],
})
export class AppModule {}
```

---

## 🌍 Étape 7 — Fichier `src/config/services.config.ts` : Définir les URLs des microservices

🧠 **Résumé :**
Ce fichier centralise la configuration des URLs vers les différents microservices.  
On construit dynamiquement les URLs HTTP à partir des variables d’environnement (`USER_SERVICE_HOST`, `USER_SERVICE_PORT`, etc.).  
C’est ce que le Gateway utilisera pour appeler les autres services.

```ts
import { ConfigService } from '@nestjs/config';

export const serviceUrl = (config: ConfigService) => ({
  user: `http://${config.get('USER_SERVICE_HOST')}:${config.get('USER_SERVICE_PORT')}`,
});
```

---

## 🛣️ Étape 8 — Fichier `src/config/routes.config.ts` : Organisation des routes

🧠 **Résumé :**
Ce fichier sert à **standardiser les chemins d’API** pour chaque service.  
Tu définis ici toutes les routes de ton API Gateway, avec leurs `path` et leurs fonctions `link`  
pour générer dynamiquement les URLs complètes vers les microservices.

```ts
const userBasePath = '/user';

export const routesConfig = {
  user: {
    root: userBasePath,
    byId: {
      path: `${userBasePath}/:id`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${userBasePath}/${id}`,
    },
  },
};
```

---

## 🐳 Étape 9 — Dockerisation de l’API Gateway

### 🧠 Résumé
Docker permet d’exécuter ton API Gateway dans un environnement isolé, reproductible et portable.  
Tu vas créer **deux Dockerfiles** :
- `Dockerfile.dev` → pour le développement local (avec hot reload)
- `Dockerfile` → pour la production (build optimisé et léger)

---

### 🧰 Dockerfile.dev — Environnement de développement

Ce fichier est conçu pour le mode **développement**, avec `yarn dev` et le rechargement automatique via `--watch`.

📄 **Fichier : `Dockerfile.dev`**
```Dockerfile
FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN yarn install

COPY . .

EXPOSE 3000

CMD ["yarn", "dev"]
```

🧩 **Explications :**
- `FROM node:22-alpine` → image légère basée sur Node 22
- `WORKDIR` → dossier de travail dans le conteneur
- `COPY package*.json ./` → copie uniquement les fichiers nécessaires pour installer les dépendances
- `RUN yarn install` → installe les dépendances
- `COPY . .` → copie le reste du code source
- `EXPOSE 3000` → ouvre le port 3000 (configurable via `.env`)
- `CMD ["yarn", "dev"]` → lance NestJS en mode développement avec hot reload

---

### 🚀 Dockerfile — Environnement de production

Ce fichier optimise le build grâce à une architecture **multi-étape** :
1. Étape `builder` → build complet du code TypeScript
2. Étape `runner` → exécution uniquement du code compilé (`dist`) avec les dépendances nécessaires

📄 **Fichier : `Dockerfile`**
```Dockerfile
# Étape 1 — Build de l’application
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build
RUN yarn cache clean

# Étape 2 — Exécution en production
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile && yarn cache clean

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
```

🧩 **Explications :**
- **Étape `builder`**
    - Compile le code TypeScript (`yarn build`)
    - Nettoie le cache Yarn pour réduire la taille de l’image
- **Étape `runner`**
    - Installe uniquement les dépendances de production
    - Copie uniquement le dossier `dist` depuis le builder
    - Démarre NestJS via `node dist/main.js`
- Résultat : une image **plus rapide, plus légère et plus sécurisée** ✅


---

✅ **Résultat final :**
Tu as maintenant une API Gateway :
- 🌐 qui expose un Swagger à `http://localhost:3001/api-docs`
- ⚙️ qui lit automatiquement ses variables depuis `.env`
- 🧠 qui appelle les microservices via HTTP
- 🧩 prête à accueillir RabbitMQ ou d’autres transports plus tard
