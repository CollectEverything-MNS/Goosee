# Procedure Postman - Tests Roles Dynamiques

## Fichiers a importer

- Collection: `docs/postman/goosee-api-gateway.postman_collection.json`
- Environnement: `docs/postman/goosee-api-gateway-local.postman_environment.json`

## Principe

- Les requetes protegees utilisent un header `x-role` (`owner`, `manager`, `customer`).
- Un pre-script de collection injecte automatiquement le bon `Authorization: Bearer ...`.
- Les tokens sont alimentes par le dossier `00 - Setup`.

## Prerequis

1. Lancer l'infra et le back.
2. Selectionner l'environnement `goosee-api-gateway-local` dans Postman.

## Cas DB vide (premiere initialisation)

1. Creer les comptes via `Auth > Register Customer` en changeant `customer_email/customer_password` pour chaque profil:

- owner
- manager
- customer

2. Verifier les emails via MailHog.
3. Promouvoir le compte owner une seule fois:

- `auth_db.auth.role = {OWNER}`
- `user_db.user.role = {OWNER}`

4. Mettre `manager_user_id` dans l'environnement.

## Execution du setup automatique

Executer les requetes du dossier `00 - Setup` dans l'ordre:

1. `Login Owner`
2. `Login Manager`
3. `Login Customer`
4. `Create Role USER_MANAGER (Owner)`
5. `Assign USER_MANAGER to Manager User (Owner)`
6. `Re-Login Manager (refresh role claims)`

## Recuperer manuellement les IDs utiles

1. `manager_user_id` / `user_id`:

- lancer `Users > List Users (Owner)`
- copier les UUID depuis la reponse JSON vers l'environnement

2. `role_id`:

- lancer `Roles > List Roles (Owner)`
- copier l'`id` du role cible

3. `page_id`:

- lancer `Pages > Create Page (Owner)` ou `GET /pages`
- copier l'`id` de la page

4. `menu_id`:

- lancer `Menus > Create Menu (Owner)` ou `GET /menus`
- copier l'`id` du menu

## Scenarios de test recommandes

### 1) Controle d'acces Users

1. `Users > List Customers (Manager)` -> attendu `200`
2. `Users > List Customers (Customer should fail)` -> attendu `403`
3. `Users > List Admins (Manager)` -> attendu `200`

### 2) Controle d'acces Roles

1. `Roles > List Roles (Owner)` -> attendu `200`
2. Rejouer `Roles > List Roles (Owner)` en mettant `x-role=customer` -> attendu `403`
3. Pour `GET/PUT/DELETE /roles/:id`, renseigner `role_id` manuellement avant appel

### 3) Controle d'acces Pages / Menus / Settings / Upload

1. `Pages > Create Page (Owner)` -> attendu `201/200`
2. `Menus > Create Menu (Owner)` -> attendu `201/200`
3. `Settings > Update Settings (Owner)` -> attendu `200`
4. `Upload > Upload File (Owner)` -> attendu `201/200`
5. Rejouer Pages et Upload avec `x-role=customer` -> attendu `403`. Les écritures Menus et Settings ne portent actuellement aucune garde JWT/pageKey ; ne pas attendre `403` sur ces routes. Voir la matrice pour cette limite.
6. Pour les routes par id (`/pages/:id`, `/menus/:id`), renseigner `page_id` / `menu_id` manuellement

### 4) Cas tokens

1. Si `401 Token expired`, lancer `Auth > Refresh Customer Token` ou re-login role concerné.
2. Apres changement de role, toujours relancer le login du user concerné.

## Depannage rapide

1. `401 JWT secret is not configured`:

- verifier `JWT_*` dans `env/.env.dev`
- verifier `turbo.json` contient les variables JWT dans `globalPassThroughEnv`
- redemarrer `yarn dev`

2. `401 Token expired`:

- relogin ou refresh token

3. `403 Insufficient role`:

- verifier le `pageKey` du role en base (`/roles`)
- verifier le `x-role` de la requete

## Référence étendue et tenants de démonstration

La collection contient également Products, Categories, Tags, Orders, Cart, Payments,
Stock, Tickets, Assistant, RGPD, Internal, Health, Metrics et Logs. Les accès effectifs
sont dans la [matrice](../roles-endpoints-matrix.md), y compris les routes sans garde.
Le header x-role sert au script Postman à choisir le Bearer token ; il ne confère
aucun rôle côté serveur.

Pour la démo, remplacer base_url par http://api.atelier-alice.127.0.0.1.nip.io ou
http://api.mode-bob.127.0.0.1.nip.io:8081. Utiliser respectivement alice@goosee.dev ou
bob@goosee.dev, mot de passe Demo#2026, dans les variables de connexion OWNER.
Les comptes manager/customer du setup historique doivent être préparés séparément.

Exécuter les requêtes ajoutées individuellement. Renseigner les variables product_id,
category_id, order_id, payment_id, ticket_id et customer_id avec les réponses obtenues.
Ces exemples ne capturent pas automatiquement les identifiants et ne constituent pas
une suite Runner prête à exécuter en bloc. Les suppressions et l'effacement RGPD doivent
viser des données synthétiques de test. Le webhook JSON fourni est réservé au paiement
simulé ; il ne remplace pas un webhook Stripe signé.

La variable internal_api_token est vide par défaut : la renseigner localement pour les
routes Internal, sans exporter ni versionner un secret. Gemini utilise la clé du tenant,
pas une clé envoyée dans la requête Postman.
