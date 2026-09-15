# Matrice Roles & Endpoints (dynamique)

## Perimetre

Ce document couvre les endpoints exposes par l'API Gateway (`templates/back/api-gateway`).

La gestion d'acces est dynamique:

- le JWT contient une liste de roles (`roles: string[]`)
- chaque role est defini en base (`/roles`) avec des `pageKeys`
- chaque endpoint protege demande un ou plusieurs `pageKeys`

## Legende

- `Public`: pas de JWT requis
- `JWT`: JWT valide requis
- `JWT + pageKey`: JWT valide + role utilisateur possedant le `pageKey` requis

## Mapping pageKey -> endpoints

### `users`

| Methode  | Path                     | Acces         |
| -------- | ------------------------ | ------------- |
| `GET`    | `/users`                 | JWT + `users` |
| `GET`    | `/users/get-user/:id`    | JWT + `users` |
| `POST`   | `/users/create-user`     | JWT + `users` |
| `PATCH`  | `/users/update-user/:id` | JWT + `users` |
| `DELETE` | `/users/delete-user/:id` | JWT + `users` |
| `GET`    | `/users/customers`       | JWT + `users` |
| `GET`    | `/users/admins`          | JWT + `users` |

### `roles`

| Methode  | Path         | Acces         |
| -------- | ------------ | ------------- |
| `GET`    | `/roles`     | JWT + `roles` |
| `POST`   | `/roles`     | JWT + `roles` |
| `GET`    | `/roles/:id` | JWT + `roles` |
| `PUT`    | `/roles/:id` | JWT + `roles` |
| `DELETE` | `/roles/:id` | JWT + `roles` |

### `pages`

| Methode  | Path          | Acces         |
| -------- | ------------- | ------------- |
| `POST`   | `/pages`      | JWT + `pages` |
| `PUT`    | `/pages/:id`  | JWT + `pages` |
| `DELETE` | `/pages/:id`  | JWT + `pages` |
| `POST`   | `/pages/seed` | JWT + `pages` |

### `menu`

| Methode  | Path             | Acces        |
| -------- | ---------------- | ------------ |
| `POST`   | `/menus`         | JWT + `menu` |
| `PUT`    | `/menus/:id`     | JWT + `menu` |
| `DELETE` | `/menus/:id`     | JWT + `menu` |
| `PUT`    | `/menus/reorder` | JWT + `menu` |

### `settings`

| Methode | Path        | Acces            |
| ------- | ----------- | ---------------- |
| `PUT`   | `/settings` | JWT + `settings` |

### `pages` (Upload)

| Methode | Path      | Acces         |
| ------- | --------- | ------------- |
| `POST`  | `/upload` | JWT + `pages` |

## Endpoints Public/JWT sans pageKey

### Auth

| Methode | Path                              | Acces  | Notes                                   |
| ------- | --------------------------------- | ------ | --------------------------------------- |
| `POST`  | `/auth/register`                  | Public | Creation de compte                      |
| `POST`  | `/auth/login`                     | Public | Retourne `accessToken` + `refreshToken` |
| `GET`   | `/auth/verify-email?token=...`    | Public | Verification email                      |
| `POST`  | `/auth/resend-verification-email` | Public | Renvoi email de verification            |
| `PUT`   | `/auth/forget-password-request`   | Public | Envoi OTP de reinitialisation           |
| `PUT`   | `/auth/forget-password-confirm`   | Public | Confirmation OTP + nouveau mot de passe |
| `POST`  | `/auth/refresh-token`             | Public | Rotation du refresh token               |
| `POST`  | `/auth/revoke-token`              | Public | Revocation du refresh token             |
| `PUT`   | `/auth/change-password`           | JWT    | Utilise `sub` du token (`authId`)       |

### Pages/Menus/Settings lecture publique

| Methode | Path                | Acces  |
| ------- | ------------------- | ------ |
| `GET`   | `/pages`            | Public |
| `GET`   | `/pages/:id`        | Public |
| `GET`   | `/pages/slug/:slug` | Public |
| `GET`   | `/menus`            | Public |
| `GET`   | `/settings`         | Public |

### `assistant`

| Methode | Path             | Acces                                              |
| ------- | ---------------- | -------------------------------------------------- |
| `POST`  | `/assistant/ask` | JWT + `dashboard` (limite : 20 requetes/min par IP) |

Le chatbot d'aide repond a partir de `docs/guide-utilisateur.md` (copie embarquee dans `assistant-service`). Le modele est appele via l'API Gemini (`GEMINI_API_KEY`, `GEMINI_MODEL`).

## Regles metier importantes

- Apres modification des roles d'un utilisateur, il doit se reconnecter pour obtenir un nouveau JWT.
- Un role sans `pageKeys` n'a acces qu'aux endpoints publics et endpoints `JWT` sans pageKey.
