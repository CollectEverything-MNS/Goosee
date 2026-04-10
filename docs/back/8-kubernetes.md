# ☸️ Étape 8 — Kubernetes (K8s)

> **K8s est optionnel.** La template fonctionne parfaitement avec Docker Compose seul (voir étape 7). Kubernetes est pertinent si tu veux tester un déploiement proche de la production, travailler avec des réplicas, ou préparer une infrastructure cloud. Si tu débutes ou que tu n'as pas ce besoin, saute cette étape.

---

## 1. Activer Kubernetes dans Docker Desktop

### Prérequis
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et en cours d'exécution

### Activation
1. Ouvrir **Docker Desktop**
2. Aller dans **Settings** (icône engrenage) → **Kubernetes**
3. Cocher **Enable Kubernetes**
4. Cliquer sur **Apply & Restart**
5. Attendre que Docker Desktop redémarre et que le statut Kubernetes passe au vert

> ⚠️ L'activation télécharge les composants K8s (~300 Mo). Prévoir quelques minutes selon la connexion.

### Vérifier que Kubernetes est bien lancé

```bash
kubectl config current-context   # doit afficher docker-desktop
kubectl get nodes                 # doit afficher un node "Ready"
```

---

## 2. Concepts clés

| Concept | Description |
|---------|-------------|
| **Namespace** | Espace d'isolation logique pour regrouper les ressources (ex: `goosee-dev`) |
| **Secret** | Stocke des données sensibles encodées en base64 (mots de passe, tokens) |
| **ConfigMap** | Stocke des configurations non sensibles (ports, URLs internes) |
| **Deployment** | Décrit comment déployer un service avec un nombre de réplicas |
| **Service** | Expose un Deployment en interne (ClusterIP) ou en externe (NodePort) |
| **Réplicas** | Nombre d'instances d'un même pod en parallèle |

---

## 3. Structure des manifests

Les manifests K8s sont **colocalisés avec les templates** des services, pas dans un dossier séparé à la racine du projet.

```
templates/back/
├── k8s/                          ← Ressources globales partagées par tous les services
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml              ← gitignored (valeurs réelles, dev local uniquement)
│   ├── secrets.example.yaml      ← commité (valeurs vides, à copier)
│   └── infra/                    ← Infra optionnelle pour dev local (DBs, RabbitMQ…)
│       ├── 10-rabbitmq.yaml
│       ├── 10-mailhog.yaml
│       ├── 11-user-db.yaml
│       ├── 11-auth-db.yaml
│       ├── 11-page-db.yaml
│       └── 12-minio.yaml
│
├── api-gateway/
│   └── k8s/
│       ├── deployment.yaml
│       └── service.yaml
│
└── services/
    ├── _template/                ← Copié par yarn generate:service
    │   └── k8s/
    │       ├── deployment.yaml   ← contient des placeholders __SERVICE_NAME__, __SERVICE_PORT__
    │       └── service.yaml
    ├── user-service/
    │   └── k8s/
    │       ├── deployment.yaml
    │       └── service.yaml
    ├── auth-service/
    │   └── k8s/ ...
    ├── page-service/
    │   └── k8s/ ...
    └── notifier-service/
        └── k8s/
            └── deployment.yaml   ← pas de Service (consumer RabbitMQ pur, pas d'HTTP)
```

> **Note infra** : en production, les bases de données ne tournent **pas** dans K8s. On utilise des services managés (AWS RDS, Cloud SQL, etc.). Le dossier `infra/` sert uniquement au dev local pour avoir toute la stack dans K8s si besoin.

---

## 4. Quand tu crées un nouveau service

> `yarn generate:service` copiera automatiquement le `_template` à terme. En attendant, copie manuellement un service existant.

### 4.1 — Copier le template K8s et remplacer les valeurs

```bash
# Copier les manifests du _template dans ton nouveau service
cp -r templates/back/services/_template/k8s templates/back/services/mon-service/k8s

# Remplacer les placeholders (SERVICE_NAME, SERVICE_PORT, IMAGE_NAME)
sed -i 's/SERVICE_NAME/mon-service/g' templates/back/services/mon-service/k8s/*.yaml
sed -i 's/SERVICE_PORT/3005/g'        templates/back/services/mon-service/k8s/*.yaml
sed -i 's|IMAGE_NAME|dev-goosee-mon-service-dev:latest|g' templates/back/services/mon-service/k8s/deployment.yaml
```

> En dev, le nom d'image suit le pattern `dev-goosee-<service-name>-dev:latest` (généré par Docker Compose).

### 4.2 — Mettre à jour le `Dockerfile.dev`

Le `Dockerfile.dev` copié fait référence à l'ancien nom de service. Mettre à jour :

```bash
sed -i 's/ancien-service/mon-service/g' templates/back/services/mon-service/Dockerfile.dev
```

### 4.3 — Mettre à jour `main.ts`

Le `main.ts` copié lit la variable de port de l'ancien service (`USER_SERVICE_PORT`, etc.). Renommer :

```bash
# Remplacer la variable de port dans main.ts
sed -i 's/USER_SERVICE_PORT/MON_SERVICE_PORT/g' templates/back/services/mon-service/src/main.ts
```

### 4.4 — Ajouter au ConfigMap

```yaml
# Dans templates/back/k8s/configmap.yaml
MON_SERVICE_HOST: "mon-service"
MON_SERVICE_PORT: "3005"
MON_DB_HOST: "mon-db"
MON_DB_PORT: "5432"
```

### 4.5 — Ajouter aux secrets

Dans `templates/back/k8s/secrets.yaml` (dev local) :
```yaml
MON_DB_USER: "postgres"
MON_DB_PASSWORD: "postgres"
MON_DB_NAME: "mon_db"
```

Dans `templates/back/k8s/secrets.example.yaml` (valeurs vides, commité) :
```yaml
MON_DB_USER: ""
MON_DB_PASSWORD: ""
MON_DB_NAME: ""
```

---

## 5. Environnement dev local

### Étape 1 — Préparer les secrets

```bash
cp templates/back/k8s/secrets.example.yaml templates/back/k8s/secrets.yaml
# Remplir templates/back/k8s/secrets.yaml avec les vraies valeurs
```

### Étape 2 — Builder les images localement

```bash
docker build -t dev-goosee-api-gateway-dev:latest ./templates/back/api-gateway
docker build -t dev-goosee-user-service-dev:latest ./templates/back/services/user-service
# … idem pour chaque service
```

### Étape 3 — Appliquer les manifests

```bash
# Ressources globales
kubectl apply -f templates/back/k8s/namespace.yaml
kubectl apply -f templates/back/k8s/configmap.yaml
kubectl apply -f templates/back/k8s/secrets.yaml

# Infrastructure optionnelle (sinon laisser Docker Compose gérer l'infra)
kubectl apply -f templates/back/k8s/infra/

# Services applicatifs
kubectl apply -f templates/back/api-gateway/k8s/
kubectl apply -f templates/back/services/user-service/k8s/
kubectl apply -f templates/back/services/auth-service/k8s/
kubectl apply -f templates/back/services/page-service/k8s/
kubectl apply -f templates/back/services/notifier-service/k8s/
```

### Étape 4 — Vérifier

```bash
kubectl get pods -n goosee-dev       # tous les pods doivent être Running
kubectl get services -n goosee-dev   # vérifier les ports exposés
```

| Service | URL locale |
|---------|-----------|
| API Gateway | http://localhost:30001 (Swagger : `/api-docs`) |
| RabbitMQ Management | http://localhost:30672 |
| Mailhog UI | http://localhost:30825 |
| MinIO Console | http://localhost:30901 |

---

## 6. Environnement de production (GitHub Actions)

En production, les secrets ne viennent **jamais** de fichiers — ils viennent des **GitHub Secrets** du dépôt, injectés par le pipeline CI/CD.

### Déclarer les secrets GitHub

Dans le dépôt GitHub : **Settings → Secrets and variables → Actions → New repository secret**

Créer un secret pour chaque valeur sensible :

| Nom du secret GitHub | Contenu |
|---------------------|---------|
| `KUBECONFIG` | Contenu du kubeconfig encodé en base64 (`cat ~/.kube/config \| base64`) |
| `REGISTRY_URL` | URL du registry Docker (ex: `ghcr.io/mon-org`) |
| `REGISTRY_USER` | Login du registry |
| `REGISTRY_PASSWORD` | Mot de passe du registry |
| `USER_DB_USER` | Utilisateur PostgreSQL du user-service |
| `USER_DB_PASSWORD` | Mot de passe PostgreSQL du user-service |
| `USER_DB_NAME` | Nom de la base de données |
| `AUTH_DB_USER` | … idem pour auth-service |
| `AUTH_DB_PASSWORD` | |
| `AUTH_DB_NAME` | |
| `PAGE_DB_USER` | … idem pour page-service |
| `PAGE_DB_PASSWORD` | |
| `PAGE_DB_NAME` | |
| `RABBITMQ_URL` | URL complète RabbitMQ (ex: `amqp://user:pass@host:5672`) |
| `RABBITMQ_ERLANG_COOKIE` | Cookie de clustering RabbitMQ |
| `MINIO_ROOT_USER` | Accès MinIO |
| `MINIO_ROOT_PASSWORD` | |
| `SMTP_USER` | Credentials SMTP |
| `SMTP_PASSWORD` | |

### Le workflow de déploiement

Le fichier `.github/workflows/k8s-deploy.yml` se déclenche sur chaque push sur `main`. Il :

1. Configure le contexte `kubectl` depuis le secret `KUBECONFIG`
2. Builde et pousse les images Docker vers le registry avec le tag du commit (`github.sha`)
3. Crée le Secret K8s à partir des GitHub Secrets (via `kubectl create secret --dry-run | kubectl apply`)
4. Applique les manifests et met à jour l'image de chaque Deployment
5. Vérifie le rollout

```bash
# Ce que fait le pipeline côté secrets (jamais un fichier secrets.yaml en prod)
kubectl create secret generic goosee-secrets \
  --namespace=goosee-dev \
  --from-literal=USER_DB_PASSWORD="${{ secrets.USER_DB_PASSWORD }}" \
  ... \
  --dry-run=client -o yaml | kubectl apply -f -
```

> Le `--dry-run=client -o yaml | kubectl apply -f -` permet de créer **ou mettre à jour** le secret sans erreur si il existe déjà.

---

## 7. Différences dev / prod

| Aspect | Dev local | Production |
|--------|-----------|------------|
| Secrets | `templates/back/k8s/secrets.yaml` gitignored | GitHub Secrets → pipeline CI/CD |
| Images | Locales (`imagePullPolicy: Never`) | Registry versionné (`imagePullPolicy: IfNotPresent`) |
| Exposition | NodePort (`localhost:300XX`) | Ingress + domaine + TLS |
| Bases de données | Dans K8s via `infra/` (optionnel) | Services managés (RDS, Cloud SQL…) |
| Réplicas | 1 | 2+ pour la haute disponibilité |

---

## 8. Commandes utiles au quotidien

```bash
# État des pods
kubectl get pods -n goosee-dev

# Logs en temps réel
kubectl logs -n goosee-dev deployment/api-gateway -f

# Redéployer après un rebuild d'image
docker build -t dev-goosee-user-service-dev:latest ./templates/back/services/user-service
kubectl rollout restart deployment/user-service -n goosee-dev

# Déboguer un pod en erreur
kubectl describe pod <pod-name> -n goosee-dev

# Ouvrir un shell dans un pod
kubectl exec -it deployment/user-service -n goosee-dev -- sh

# Reset complet du namespace
kubectl delete all --all -n goosee-dev
```
