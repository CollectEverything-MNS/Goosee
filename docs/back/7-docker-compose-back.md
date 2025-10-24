# 🐳 Étape 7 — Configuration Docker Compose (Back-end)

Ce fichier permet de lancer automatiquement :
- l’**API Gateway**
- le **User Service**  
  dans un même réseau Docker (`goosee_net`) afin qu’ils puissent communiquer entre eux sans configuration manuelle.

---

## 📁 Emplacement

Chemin :
```
/docker/dev/docker-compose.back.dev.yml
```

---

## ⚙️ Contenu complet

```
services:
  goosee-api-gateway-dev:
    container_name: goosee-api-gateway-dev
    build:
      context: ../../templates/back/api-gateway
      dockerfile: Dockerfile.dev
    command: yarn dev
    ports:
      - "${API_GATEWAY_PORT}:${API_GATEWAY_PORT}"
    environment:
      NODE_ENV: ${NODE_ENV}
      USER_SERVICE_PORT: ${USER_SERVICE_PORT}
      USER_SERVICE_HOST: ${USER_SERVICE_HOST}
    depends_on:
      - goosee-user-service-dev
    networks:
      - goosee_net

  goosee-user-service-dev:
    container_name: goosee-user-service-dev
    build:
      context: ../../templates/back/services/_template
      dockerfile: Dockerfile.dev
    command: yarn dev
    environment:
      NODE_ENV: ${NODE_ENV}
      USER_SERVICE_PORT: ${USER_SERVICE_PORT}
    expose:
      - "${USER_SERVICE_PORT}"
    healthcheck:
      test: ["CMD-SHELL", "nc -z localhost ${USER_SERVICE_PORT}"]
      interval: 5s
      timeout: 3s
      retries: 10
      start_period: 5s
    networks:
      - goosee_net

networks:
  goosee_net:
    driver: bridge
```

---

## 🧠 Explication des sections

### 🔹 `services`
Définit la liste des containers à exécuter.  
Ici :
- `goosee-api-gateway-dev` → API principale (point d’entrée HTTP)
- `goosee-user-service-dev` → Microservice utilisateur

---

### 🔹 `build`
Indique où Docker doit aller chercher les fichiers du projet :
- `context:` → chemin du dossier racine du service
- `dockerfile:` → chemin du Dockerfile à utiliser (`Dockerfile.dev` pour le mode développement)

---

### 🔹 `command`
La commande exécutée à l’intérieur du container (ici `yarn dev` pour le hot reload).

---

### 🔹 `ports` / `expose`
| Clé | Utilisation |
|------|--------------|
| `ports:` | Expose un port à l’extérieur du container (pour l’hôte local). |
| `expose:` | Rends le port visible uniquement **dans le réseau Docker** (communication interne). |

👉 Exemple :
- API Gateway : `ports` (accessible depuis ton navigateur)
- User Service : `expose` (interne, accessible uniquement par la Gateway)

---

### 🔹 `environment`
Injecte les variables d’environnement définies dans `.env.dev` :
- `NODE_ENV`
- `USER_SERVICE_HOST`
- `USER_SERVICE_PORT`

Ces valeurs sont utilisées dans ton code NestJS via `process.env`.

---

### 🔹 `depends_on`
Indique à Docker que la **Gateway** dépend du **User Service** :  
→ le service user doit être prêt avant de démarrer la Gateway.

---

### 🔹 `healthcheck`
Permet de vérifier que le container du microservice répond bien sur son port interne avant de le considérer comme “up”.

---

### 🔹 `networks`
Crée un réseau privé Docker (`goosee_net`) pour la communication entre services.  
Cela permet à la Gateway de contacter le User Service via :
```
http://goosee-user-service-dev:${USER_SERVICE_PORT}
```

---

## 🧩 Bonnes pratiques
- Nommer les containers avec le même préfixe (`goosee-`) pour faciliter la maintenance.
- Utiliser un réseau unique (`goosee_net`) partagé entre tous les services.
- Utiliser `depends_on` pour contrôler l’ordre de démarrage.
- Garder les Dockerfile des services dans leurs templates dédiés.

---

## ✅ Commandes utiles

Lancer le backend complet :
```bash
docker compose -f docker/dev/docker-compose.back.dev.yml --env-file env/.env.dev up --build
```

Arrêter les containers :
```bash
docker compose -f docker/dev/docker-compose.back.dev.yml down
```

Rebuilder uniquement l’API Gateway :
```bash
docker compose -f docker/dev/docker-compose.back.dev.yml build goosee-api-gateway-dev
```