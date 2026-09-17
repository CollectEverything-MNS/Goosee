# Matrice des rôles et endpoints

Relevé des contrôleurs de la gateway au 17 septembre 2026. Les routes et gardes sont
vérifiées dans le code ; « Public » décrit une absence de garde JWT/interne, pas une
recommandation d'exposition. Les endpoints publics restent soumis à la validation des DTO.

Le JWT porte les rôles. RolesGuard résout les pageKeys autorisés en base et exige toutes
les permissions déclarées par le contrôleur. Jeton interne désigne la protection dédiée
aux routes /internal/* ; ce jeton ne doit pas être intégré au navigateur.

**Limites actuelles :** menus (lecture et écriture), settings (lecture et écriture),
logs et lecture du stock n'ont pas de garde JWT dans leurs contrôleurs. Les anciennes
mentions JWT + menu/settings ne décrivaient pas le code. Cette documentation n'ajoute
aucune protection applicative.

## admin

| Méthode | Chemin | Accès déclaré |
|---|---|---|
| GET | `/admin/rgpd/archived-orders` | JWT + rgpd |
| POST | `/admin/rgpd/erase/:customerId` | JWT + rgpd |
| GET | `/admin/rgpd/export/:customerId` | JWT + rgpd |

## assistant

| Méthode | Chemin | Accès déclaré |
|---|---|---|
| POST | `/assistant/ask` | JWT + dashboard |
| GET | `/assistant/guide` | JWT + dashboard |

## auth

| Méthode | Chemin | Accès déclaré |
|---|---|---|
| PUT | `/auth/change-password` | JWT |
| PUT | `/auth/forget-password-confirm` | Public |
| PUT | `/auth/forget-password-request` | Public |
| POST | `/auth/login` | Public |
| POST | `/auth/refresh-token` | Public |
| POST | `/auth/register` | Public |
| POST | `/auth/resend-verification-email` | Public |
| POST | `/auth/revoke-token` | Public |
| POST | `/auth/sso` | Public |
| GET | `/auth/verify-email` | Public |

## cart

| Méthode | Chemin | Accès déclaré |
|---|---|---|
| DELETE | `/cart/:sessionKey` | Public |
| GET | `/cart/:sessionKey` | Public |
| POST | `/cart/:sessionKey/items` | Public |
| DELETE | `/cart/:sessionKey/items/:productId` | Public |
| PATCH | `/cart/:sessionKey/items/:productId` | Public |

## categories

| Méthode | Chemin | Accès déclaré |
|---|---|---|
| GET | `/categories` | Public |
| POST | `/categories` | JWT + categories |
| DELETE | `/categories/:id` | JWT + categories |
| GET | `/categories/:id` | Public |
| PATCH | `/categories/:id` | JWT + categories |
| GET | `/categories/:id/products` | Public |

## health

| Méthode | Chemin | Accès déclaré |
|---|---|---|
| GET | `/health` | Public |

## internal

| Méthode | Chemin | Accès déclaré |
|---|---|---|
| GET | `/internal/kpi` | Jeton interne |
| POST | `/internal/rgpd/erase/:customerId` | Jeton interne |
| GET | `/internal/rgpd/export/:customerId` | Jeton interne |

## logs

| Méthode | Chemin | Accès déclaré |
|---|---|---|
| GET | `/logs` | Public |

## menus

| Méthode | Chemin | Accès déclaré |
|---|---|---|
| GET | `/menus` | Public |
| POST | `/menus` | Public |
| DELETE | `/menus/:id` | Public |
| PUT | `/menus/:id` | Public |
| PUT | `/menus/reorder` | Public |

## metrics

| Méthode | Chemin | Accès déclaré |
|---|---|---|
| GET | `/metrics` | Public |

## orders

| Méthode | Chemin | Accès déclaré |
|---|---|---|
| GET | `/orders` | JWT + orders |
| POST | `/orders` | Public |
| GET | `/orders/:id` | Public |
| PATCH | `/orders/:id/status` | JWT + orders |

## pages

| Méthode | Chemin | Accès déclaré |
|---|---|---|
| GET | `/pages` | Public |
| POST | `/pages` | JWT + pages |
| DELETE | `/pages/:id` | JWT + pages |
| GET | `/pages/:id` | Public |
| PUT | `/pages/:id` | JWT + pages |
| POST | `/pages/seed` | JWT + pages |
| GET | `/pages/slug/:slug` | Public |

## payments

| Méthode | Chemin | Accès déclaré |
|---|---|---|
| POST | `/payments` | Public |
| GET | `/payments/:id` | Public |
| POST | `/payments/webhook` | Public |

## products

| Méthode | Chemin | Accès déclaré |
|---|---|---|
| GET | `/products` | Public |
| POST | `/products` | JWT + products |
| DELETE | `/products/:id` | JWT + products |
| GET | `/products/:id` | Public |
| PATCH | `/products/:id` | JWT + products |
| GET | `/products/:id/attributes` | Public |
| POST | `/products/:id/attributes` | JWT + products |
| DELETE | `/products/:id/attributes/:attributeId` | JWT + products |
| GET | `/products/:id/attributes/:attributeId` | Public |
| GET | `/products/:id/images` | Public |
| POST | `/products/:id/images` | JWT + products |
| DELETE | `/products/:id/images/:imageId` | JWT + products |
| PUT | `/products/:id/images/:imageId/main` | JWT + products |
| GET | `/products/:id/tags` | Public |
| POST | `/products/:id/tags` | JWT + products |
| DELETE | `/products/:id/tags/:tagId` | JWT + products |

## roles

| Méthode | Chemin | Accès déclaré |
|---|---|---|
| GET | `/roles` | JWT + roles |
| POST | `/roles` | JWT + roles |
| DELETE | `/roles/:id` | JWT + roles |
| GET | `/roles/:id` | JWT + roles |
| PUT | `/roles/:id` | JWT + roles |

## settings

| Méthode | Chemin | Accès déclaré |
|---|---|---|
| GET | `/settings` | Public |
| PUT | `/settings` | Public |

## stock

| Méthode | Chemin | Accès déclaré |
|---|---|---|
| GET | `/stock` | Public |
| GET | `/stock/:id` | Public |
| PATCH | `/stock/:id` | JWT + stock |
| GET | `/stock/:id/movements` | JWT + stock |

## tags

| Méthode | Chemin | Accès déclaré |
|---|---|---|
| GET | `/tags` | Public |
| POST | `/tags` | JWT + products |
| DELETE | `/tags/:id` | JWT + products |
| GET | `/tags/:id` | Public |

## tickets

| Méthode | Chemin | Accès déclaré |
|---|---|---|
| GET | `/tickets` | JWT + tickets |
| POST | `/tickets` | JWT + tickets |
| DELETE | `/tickets/:id` | JWT + tickets |
| GET | `/tickets/:id` | JWT + tickets |
| PATCH | `/tickets/:id/assign` | JWT + tickets |
| PATCH | `/tickets/:id/close` | JWT + tickets |
| PATCH | `/tickets/:id/status` | JWT + tickets |

## upload

| Méthode | Chemin | Accès déclaré |
|---|---|---|
| POST | `/upload` | JWT + pages |

## users

| Méthode | Chemin | Accès déclaré |
|---|---|---|
| GET | `/users` | JWT + users |
| GET | `/users/admins` | JWT + users |
| POST | `/users/create-user` | JWT + users |
| GET | `/users/customers` | JWT + users |
| DELETE | `/users/delete-user/:id` | JWT + users |
| GET | `/users/get-user/:id` | JWT + users |
| GET | `/users/me` | JWT |
| PATCH | `/users/me` | JWT |
| PATCH | `/users/update-user/:id` | JWT + users |

## Notes de validation

- Login, inscription et demande de réinitialisation : limite déclarée de 5 requêtes/minute.
- SSO : 10 requêtes/minute ; assistant/ask : 20 requêtes/minute, JWT + dashboard.
- En mode Stripe, le webhook fait vérifier sa signature côté payment-service ; en mode
  simulé, il reçoit le JSON de simulation. La route n'utilise pas de JWT.
- Après changement des rôles d'un utilisateur, se reconnecter pour renouveler les claims.
- La permission tickets est fournie au rôle OWNER par le seeder.
- Gemini utilise GEMINI_API_KEY/GEMINI_MODEL et le guide embarqué dans assistant-service.

Sources : [contrôleurs](../templates/back/api-gateway/src/services),
[routes communes](../templates/back/api-gateway/src/config/routes.config.ts),
[garde des rôles](../templates/back/api-gateway/src/shared/services/roles.guard.ts).
