# Modèle de données

**Une base PostgreSQL par service persistant.** Aucune clé étrangère ne traverse une frontière de service :
les références croisées sont des UUID nus, que rien ne contraint au niveau du moteur.

Ce document montre donc **dix bases métier séparées pour un tenant**, pas un schéma d'ensemble — parce qu'il n'en
existe pas.

---

## Pourquoi aucun schéma global

Un schéma unique laisserait croire qu'on peut faire une jointure entre une commande et un
produit. On ne peut pas : ils vivent dans deux bases distinctes, sur deux conteneurs distincts.

Ce que ça coûte, ce que ça achète :

| | |
| --- | --- |
| **Coût** | Pas d'intégrité référentielle inter-services. Un `productId` peut pointer vers un produit supprimé. La cohérence est applicative, portée par les événements |
| **Gain** | Chaque service évolue, migre et se déploie seul. Un verrou sur la table des produits ne bloque pas les commandes. Une panne de la base des logs n'empêche pas de vendre |

Le compromis est assumé : c'est ce qui permet de déployer douze services indépendamment (dix avec une base, notifier et assistant sans base).

---

## Identité — `auth` et `user`

```mermaid
erDiagram
    AUTH ||--o{ AUTH_TOKEN : "émet"
    AUTH {
        uuid id PK
        string email UK
        string password "bcrypt, coût 12"
        string_array role
        boolean isVerified
        int tokenVersion "invalide les jetons émis"
    }
    AUTH_TOKEN {
        uuid id PK
        uuid authId FK
        string token
        date expiresAt
    }
```

```mermaid
erDiagram
    USER }o--|| ROLE : "porte"
    USER {
        uuid id PK
        uuid authId "vers auth-service, sans FK"
        string email
        string firstName
        string lastName
        string_array role
    }
    ROLE {
        uuid id PK
        string name
        string_array pageKeys "droits par écran"
    }
```

**Deux bases pour une même personne.** `auth` détient les identifiants, `user` le profil. La
synchronisation passe par `auth.registered`, `user.updated` et `user.deleted`.

Ce découpage isole les secrets : une fuite de la base `user` n'expose aucun mot de passe. Il
coûte en revanche une cohérence à terme entre les deux — un profil peut exister quelques
instants avant que ses identifiants ne soient à jour.

`tokenVersion` permet d'invalider d'un coup tous les jetons émis pour un compte, sans liste de
révocation.

---

## Catalogue — `product`

Le seul service dont le modèle est relationnel à l'intérieur.

```mermaid
erDiagram
    PRODUCT }o--|| CATEGORY : "appartient à"
    PRODUCT ||--o{ PRODUCT_IMAGE : "illustré par"
    PRODUCT ||--o{ PRODUCT_ATTRIBUTE : "décrit par"
    PRODUCT ||--o{ PRODUCT_TAG : ""
    TAG ||--o{ PRODUCT_TAG : ""

    PRODUCT {
        uuid id PK
        string name
        string description
        decimal price
        int preparationTime
        float sizeValue
        string sizeUnit
        boolean isAvailable
        uuid categoryId FK
        uuid_array categoryIds "catégories secondaires"
    }
    CATEGORY {
        uuid id PK
        string name
        string slug
    }
    PRODUCT_IMAGE {
        uuid id PK
        uuid productId FK
        string url "objet MinIO"
        boolean isMain
    }
    PRODUCT_ATTRIBUTE {
        uuid id PK
        uuid productId FK
        string name
        string value
    }
    TAG {
        uuid id PK
        string name
    }
```

---

## Commerce — `cart`, `order`, `payment`, `stock`

```mermaid
erDiagram
    CART {
        uuid id PK
        string sessionKey "panier anonyme"
        uuid customerId "nullable, vers user"
        jsonb items "CartItem[]"
        int totalCents
    }
    ORDER {
        uuid id PK
        uuid customerId "nullable, vers user"
        string customerEmail
        jsonb items "OrderItem[]"
        int totalCents
        jsonb billingAddress
        string status "pending paid cancelled"
    }
    PAYMENT {
        uuid id PK
        uuid orderId "vers order, sans FK"
        string providerRef "identifiant Stripe"
        int amountCents
        string status
    }
```

```mermaid
erDiagram
    STOCK ||--o{ STOCK_MOVEMENT : "historise"
    STOCK ||--o{ STOCK_RESERVATION : "immobilise"
    STOCK {
        uuid id PK
        uuid productId "vers product, sans FK"
        int quantity
    }
    STOCK_MOVEMENT {
        uuid id PK
        uuid stockId FK
        int delta
        string reason
    }
    STOCK_RESERVATION {
        uuid id PK
        uuid stockId FK
        string sessionKey
        int quantity
        date expiresAt "balayée périodiquement"
    }
```

### La décision qui mérite d'être défendue : les lignes en `jsonb`

`cart.items` et `order.items` ne sont pas des tables liées. Ce sont des tableaux JSON qui
**recopient** le nom et le prix unitaire du produit au moment de l'ajout.

C'est volontaire, et pour deux raisons distinctes :

**Pour la commande, c'est une obligation.** Une commande est un document comptable. Si elle
pointait vers le produit par référence, un changement de prix six mois plus tard réécrirait le
montant d'une facture déjà émise. La copie fige ce qui a été vendu, à quel prix, sous quel nom.

**Pour le panier, c'est de la performance.** Afficher un panier ne demande aucun appel au
service produit : tout est dans la ligne. Contrepartie assumée — un prix modifié pendant qu'un
panier dort n'est pas répercuté. À la création de la commande, le code vérifie la disponibilité des produits et réserve le stock, mais calcule le total avec les prix unitaires reçus dans la requête. Il ne relit pas le prix du catalogue pour le substituer : cette limite du POC reste à corriger dans le code.

`stock_reservation` porte un `expiresAt` balayé chaque minute. La réservation est liée à une
commande créée au checkout, pas au panier ; elle expire après le délai configuré
(`STOCK_RESERVATION_TTL_MINUTES`, 30 minutes par défaut).

---

## Contenu et support — `page`, `ticket`, `log`

```mermaid
erDiagram
    PAGE ||--o{ MENU : "référencée par"
    PAGE {
        uuid id PK
        string title
        string slug UK
        jsonb blocks "blocs du page-builder"
        boolean isPublished
    }
    MENU {
        uuid id PK
        string label
        string href
        int position
    }
    SITE_SETTINGS {
        uuid id PK
        string siteName
        jsonb theme "couleurs, typographie"
    }
```

```mermaid
erDiagram
    TICKET {
        uuid id PK
        uuid customerId "vers user, sans FK"
        string subject
        string status
    }
    LOG {
        uuid id PK
        string level
        string service
        string message
        jsonb context
        date createdAt
    }
```

`page.blocks` contient le contenu produit par le page-builder. **C'est la donnée à l'origine
d'ANO-012** : elle est rendue en HTML sans assainissement, ce qui en fait un vecteur de XSS
stocké. Voir le registre des anomalies du dépôt `goosee-vitrine`.

`notifier-service` n'apparaît pas : il ne persiste rien, il consomme des événements et envoie
des courriels.

---

## Le registre du control plane

Une base à part, dans `goosee-vitrine`, qui ne contient aucune donnée métier de client.

```mermaid
erDiagram
    TENANT {
        uuid id PK
        string slug UK
        string ownerEmail
        uuid projectId "vers la base du portail"
        string plan
        string infra "docker | k8s"
        string status "PENDING PROVISIONING ACTIVE STOPPED FAILED"
        string instanceUrl
        jsonb resources "cpu memory replicas"
        string secretsRef "chemin du fichier d'environnement"
    }
```

`resources` est **l'allocation déclarée**, pas l'allocation appliquée. Rien ne garantit
aujourd'hui qu'elle corresponde à l'état du cluster : si `helm upgrade` échoue, la valeur est
enregistrée quand même. C'est la faiblesse F2 de l'[audit du SI](../audit-si.md#5-faiblesses-darchitecture) —
correction visée par la décision n° 7, réconciliation entre état déclaré et état réel.

---

## Où regarder dans le dépôt

```bash
find templates/back/services -name "*.entity.ts" | grep -v node_modules
```

Les migrations TypeORM de chaque service sont dans `src/migrations/`. Le schéma n'est jamais
créé par `synchronize` en production : chaque tenant démarre sur une base vierge dont le schéma
est monté par migrations versionnées.

Le service assistant ne possède pas de base PostgreSQL : il charge le guide embarqué et appelle Gemini.
