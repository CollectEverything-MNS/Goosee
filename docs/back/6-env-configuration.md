# 🌍 Étape 6 — Configuration de l’environnement (.env.dev)

Ce fichier contient toutes les **variables d’environnement** nécessaires au bon fonctionnement de l’écosystème Goosee en mode **développement**.  
Il est utilisé par **Docker Compose** pour injecter dynamiquement les ports, hôtes et configurations dans les containers.

---

## 📁 Emplacement

Chemin :
```
/env/.env.dev
```

Ce fichier est partagé entre tous les services backend, frontend et infrastructure :
- `docker/dev/docker-compose.back.dev.yml`
- `docker/dev/docker-compose.front.dev.yml`
- `docker/dev/docker-compose.infra.dev.yml`

---

## 🧩 Contenu du fichier `.env.dev`

```
# Mode global
NODE_ENV=development

# 🔹 FRONT (Next.js)
NEXT_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3001

# 🔹 API Gateway
API_GATEWAY_PORT=3001

# 🔹 USER SERVICE
USER_SERVICE_HOST=goosee-user-service-dev
USER_SERVICE_PORT=3002
```

---

## 🧠 Détail des variables

### 🏗️ Global
| Variable | Description | Exemple |
|-----------|-------------|----------|
| `NODE_ENV` | Définit le mode d’exécution global (dev, prod, test) | `development` |

---

### 💻 Frontend
| Variable | Description | Exemple |
|-----------|-------------|----------|
| `NEXT_PORT` | Port local de l’application Next.js | `3000` |
| `NEXT_PUBLIC_API_URL` | URL publique de l’API Gateway (exposée côté client) | `http://localhost:3001` |

---

### 🚪 API Gateway
| Variable | Description | Exemple |
|-----------|-------------|----------|
| `API_GATEWAY_PORT` | Port d’écoute de l’API Gateway | `3001` |

---

### 👤 User Service
| Variable | Description | Exemple |
|-----------|-------------|----------|
| `USER_SERVICE_HOST` | Nom du container Docker du microservice User | `goosee-user-service-dev` |
| `USER_SERVICE_PORT` | Port exposé dans Docker du User Service | `3002` |

---

## 🧩 Exemple pour un futur service

Si tu ajoutes un `ORDER_SERVICE`, tu ajouteras simplement :
```
# 🔹 ORDER SERVICE
ORDER_SERVICE_HOST=goosee-order-service-dev
ORDER_SERVICE_PORT=3003
```

et dans ton code API Gateway :
```ts
const url = `http://${process.env.ORDER_SERVICE_HOST}:${process.env.ORDER_SERVICE_PORT}`;
```

