# 🧩 Créer un Microservice NestJS à la main (Goosee Project)

> Exemple pédagogique simplifié, pas une copie de l'implémentation courante.
> Pour ajouter un service au dépôt, suivre [la procédure monorepo](3-creation-micro-service-script.md).
> Les Dockerfiles effectifs utilisent le contexte racine et les workspaces ; les secrets,
> migrations, contrôles d'accès et endpoints de santé doivent suivre les services existants.

Ce guide explique **comment construire un microservice complet NestJS** à la main,  
dans l’architecture Goosee (basée sur microservices).  
Chaque microservice est **autonome**, contient son propre module, contrôleur, usecase, repository et configuration.  
Tu peux ensuite le connecter à l’API Gateway ou l’orchestrer via Docker.

---

## 🌱 Étape 1 — Initialisation du microservice

### Créer le dossier du service
```bash
mkdir services/user-service && cd services/user-service
nest new .
```

💡 Cela génère la base NestJS avec `main.ts`, `app.module.ts`, et la config TypeScript.

### Nettoyer les fichiers inutiles
Supprime les répertoires `test/` et les exemples générés par défaut.

---

## ⚙️ Étape 2 — Installer les dépendances

Installe les packages nécessaires à ton microservice :
```bash
yarn add @nestjs/common @nestjs/core @nestjs/config @nestjs/typeorm typeorm pg reflect-metadata rxjs
```

Et les dépendances de développement :
```bash
yarn add -D @nestjs/cli typescript ts-node ts-loader eslint prettier
```

---

## 🏗️ Étape 3 — Structure du projet

Voici la structure recommandée pour un microservice Goosee :

```
src/
│
├── main.ts
├── app.module.ts
│
├── config/
│   ├── orm.config.ts
│   └── routes.config.ts
│
├── entities/
│   └── user.entity.ts
│
├── repositories/
│   ├── user.repository.ts
│   └── implements/
│       └── user.impl.repository.ts
│
└── usecases/
    └── get-user/
        ├── get-user.controller.ts
        ├── get-user.dto.ts
        └── get-user.usecase.ts
```

---

## 🚀 Étape 4 — Fichier `main.ts`

Le point d’entrée du microservice : il démarre le serveur et charge les pipes globaux.

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = Number(process.env.USER_SERVICE_PORT);
  if (!port) throw new Error('❌ USER_SERVICE_PORT is not defined');

  await app.listen(port);

  const logger = new Logger('UserService');
  logger.log(`🚀 User Service running on http://localhost:${port}`);
}

bootstrap();
```

🧠 **Explication :**
- `ValidationPipe` applique une validation automatique aux DTOs.
- `USER_SERVICE_PORT` vient de `.env`.
- `Logger` affiche un message clair au démarrage.

---

## 🧩 Étape 5 — Fichier `app.module.ts`

C’est le cœur du microservice.  
On y importe les modules et configure les dépendances (repository, usecase, controller…).

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InMemoryUserRepository } from './repositories/implements/user.impl.repository';
import { IUserRepository } from './repositories/user.repository';
import { GetUserController } from './usecases/get-user/get-user.controller';
import { GetUserUseCase } from './usecases/get-user/get-user.usecase';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [GetUserController],
  providers: [
    {
      provide: IUserRepository,
      useClass: InMemoryUserRepository,
    },
    GetUserUseCase,
  ],
})
export class AppModule {}
```

🧠 **Explication :**
- `ConfigModule` rend les variables d’environnement globales.
- `IUserRepository` (interface) est liée à son implémentation concrète `InMemoryUserRepository`.
- `GetUserUseCase` contient la logique métier.

---

## 🗺️ Étape 6 — Configuration du service

### `src/config/routes.config.ts`
Ce fichier centralise les chemins HTTP de ton service :
```ts
export const routesConfig = {
  user: {
    root: '/user',
    byId: '/user/:id',
  },
};
```

### `src/config/orm.config.ts`
Connexion TypeORM à la base de données (PostgreSQL) :
```ts
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USER'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  entities: [User],
  synchronize: configService.get('NODE_ENV') === 'development',
});
```

---

## 🧬 Étape 7 — Entité `user.entity.ts`

Les entités définissent la structure des données (table ou modèle).

```ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
```

---

## 🧠 Étape 8 — Repository

### Interface abstraite (`user.repository.ts`)
```ts
import { User } from '../entities/user.entity';

export abstract class IUserRepository {
  abstract save(user: User): Promise<User>;
  abstract findAll(): Promise<User[]>;
  abstract deleteById(id: string): Promise<void>;
}
```

### Implémentation en mémoire (`user.impl.repository.ts`)
```ts
import { IUserRepository } from '../user.repository';
import { User } from '../../entities/user.entity';

export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];

  async save(user: User): Promise<User> {
    this.users.push(user);
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.users;
  }

  async deleteById(id: string): Promise<void> {
    this.users = this.users.filter(u => u.id !== id);
  }
}
```

---

## 🧩 Étape 9 — Use Case (`get-user.usecase.ts`)

Le **usecase** contient la logique métier de ton action.

```ts
import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../repositories/user.repository';
import { GetUserDto } from './get-user.dto';

@Injectable()
export class GetUserUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(id: string): Promise<GetUserDto> {
    // Exemple simplifié
    return {
      id,
      name: 'Romain',
      email: 'test@example.com',
    };
  }
}
```

---

## 🎯 Étape 10 — Controller (`get-user.controller.ts`)

Le controller reçoit la requête HTTP et délègue au usecase.

```ts
import { Controller, Get, Param } from '@nestjs/common';
import { GetUserUseCase } from './get-user.usecase';
import { routesConfig } from '../../config/routes.config';

@Controller()
export class GetUserController {
  constructor(private readonly getUserUseCase: GetUserUseCase) {}

  @Get(routesConfig.user.byId)
  async getUser(@Param('id') id: string) {
    return this.getUserUseCase.execute(id);
  }
}
```

---

## 📦 Étape 11 — Dockerisation du microservice

### `Dockerfile`
```Dockerfile
FROM node:22-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build
RUN yarn cache clean

EXPOSE 3000
ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
```

### `Dockerfile.dev`
```Dockerfile
FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN yarn install

COPY . .

EXPOSE 3000

CMD ["yarn", "dev"]
```
