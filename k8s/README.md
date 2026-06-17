# Goosee sur Kubernetes (k3d) — forfait scalable

Chart Helm déployant la **pile e-commerce isolée d'un tenant** (site généré) sur un cluster
Kubernetes local **k3d**. Alternative scalable au déploiement Docker Compose (`docker/tenant/`).

> Statut : Lot 6 en cours. 6.1 (chart + workloads + bases + infra) ✅.

## Prérequis

- Docker Desktop
- [`k3d`](https://k3d.io) et [`helm`](https://helm.sh) (binaires user-space suffisent)

## 1. Créer le cluster

k3s embarque **Traefik** (ingress) et **metrics-server** (pour l'HPA), pas besoin de les
installer. On épingle l'API sur `127.0.0.1` pour éviter un kubeconfig pointant sur un
`host.docker.internal` non résolu sous Windows :

```bash
k3d cluster create goosee \
  --api-port 127.0.0.1:6445 \
  -p "8081:80@loadbalancer" -p "8443:443@loadbalancer" \
  --agents 0
```

> Si le cluster a été créé sans `--api-port` et que `kubectl` ne répond pas, repointer la
> kubeconfig sur le port publié du serveur (voir `docker ps` → `k3d-goosee-serverlb` 6443) :
> `kubectl config set-cluster k3d-goosee --server=https://127.0.0.1:<port>`.

## 2. Construire et importer les images

```bash
bash scripts/build-images.sh          # construit goosee/*:local (une fois)
k3d image import -c goosee \
  goosee/api-gateway:local goosee/front:local \
  goosee/auth-service:local goosee/user-service:local goosee/page-service:local \
  goosee/log-service:local goosee/product-service:local goosee/order-service:local \
  goosee/cart-service:local goosee/payment-service:local goosee/notifier-service:local
```

## 3. Déployer un tenant

Un tenant = un **namespace** dédié + une release Helm. Les secrets sont générés par
l'orchestrateur (ne jamais laisser les valeurs par défaut : les services refusent de démarrer
en production avec un mot de passe par défaut).

```bash
helm install <slug> k8s/goosee-tenant -n tenant-<slug> --create-namespace \
  --set tenant.slug=<slug> \
  --set secrets.dbPassword=$(openssl rand -hex 16) \
  --set secrets.jwtSecret=$(openssl rand -hex 16) \
  --set secrets.jwtAccessSecret=$(openssl rand -hex 16) \
  --set secrets.jwtRefreshSecret=$(openssl rand -hex 16) \
  --set secrets.internalApiToken=$(openssl rand -hex 16) \
  --set secrets.minioRootUser=goosee-$(openssl rand -hex 4) \
  --set secrets.minioRootPassword=$(openssl rand -hex 16)
```

Les microservices jouent leurs migrations TypeORM au démarrage (`migrationsRun` en prod) et
attendent leur base ; le premier boot peut donc redémarrer une fois avant d'être `Running`.

## 4. Vérifier

```bash
kubectl get pods -n tenant-<slug>
kubectl logs -n tenant-<slug> deploy/order   # « Order Service is running on … »
```

## Structure du chart

```
k8s/goosee-tenant/
  Chart.yaml
  values.yaml                 # slug, domaine, secrets, images, listes services/bases
  templates/
    _helpers.tpl              # image, labels, hosts
    configmap.yaml            # env non sensible partagé (hosts = Services k8s)
    secret.yaml               # secrets tenant (DB, JWT, MinIO, Stripe, jeton interne)
    databases.yaml            # 1 StatefulSet Postgres par service (database-per-service)
    infra.yaml                # RabbitMQ, MinIO (StatefulSets), Mailhog
    workloads.yaml            # gateway, microservices, notifier, front (Deployments)
```

Tout passe par `envFrom` (ConfigMap + Secret), comme le fichier `.env` côté Compose : chaque
workload reçoit l'env complet, les hôtes pointant vers les Services du namespace.
