# Tests end-to-end — parcours d'achat

`parcours-achat.e2e-spec.ts` déroule le parcours client complet contre une **stack
réelle** (aucun mock d'infra) :

```
prépa catalogue (OWNER) → signup → refus login (non vérifié)
  → vérification e-mail (MailHog) → login → panier → commande
  → intention de paiement (Stripe mock) → webhook « succeeded » → commande « paid »
```

## Pré-requis

| Élément                                         | Pourquoi                                                                                            |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `yarn infra` + `docker-compose.back.dev.yml` up | gateway + microservices + bases + RabbitMQ + MailHog                                                |
| `yarn init:user`                                | crée l'OWNER (`admin@goosee.dev` / `goosee`) utilisé pour créer catégorie/produit/stock             |
| **pas** de `STRIPE_SECRET_KEY`                  | le provider tombe en mode mock : le webhook se pilote avec `{ providerRef, status }` sans signature |

La vérification d'e-mail est faite en boîte noire : le test lit la boîte MailHog
(`/api/v2/search`), extrait le token du lien `/auth/verify-email?token=…` et appelle
l'endpoint. Ça valide au passage la chaîne `register → RabbitMQ → notifier → SMTP`.

## Lancer

```bash
# 1. stack
yarn infra
docker compose --env-file env/.env.dev -f docker/dev/docker-compose.back.dev.yml up -d --build
# 2. OWNER
yarn init:user
# 3. e2e (depuis la racine)
yarn e2e
```

## Configuration (variables d'environnement)

| Variable             | Défaut                  |
| -------------------- | ----------------------- |
| `E2E_BASE_URL`       | `http://localhost:3001` |
| `E2E_MAILHOG_URL`    | `http://localhost:8025` |
| `E2E_OWNER_EMAIL`    | `admin@goosee.dev`      |
| `E2E_OWNER_PASSWORD` | `goosee`                |

## Portée

Suite **manuelle**, lancée en local avec la stack dev debout — pas branchée sur la CI
(elle monte une dizaine de conteneurs et build les images : trop lourd pour tourner à
chaque PR, et le projet est académique).

Chaque exécution utilise des identifiants uniques (`e2e+<timestamp>@goosee.test`,
`e2e-session-<timestamp>`) : la suite est ré-exécutable sans nettoyage.
