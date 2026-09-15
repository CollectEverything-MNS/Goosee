# Déploiement

Le forfait choisi détermine la cible d'infrastructure. Un seul orchestrateur pilote les deux,
derrière la même interface — mais **les deux ne se valent pas**, et ce document existe surtout
pour rendre cet écart visible.

```
planInfra(plan) = plan === 'enterprise' ? 'k8s' : 'docker'
```

## Forfait standard — Docker Compose

Un projet Compose par client, avec ses propres bases, son stockage objet et ses secrets.

```mermaid
graph TB
    internet(["Internet"])
    traefik["<b>Traefik</b><br/>routage par sous-domaine<br/>conteneur partagé"]

    subgraph platform["réseau goosee_platform — PARTAGÉ"]
        gwA["gateway client A"]
        frontA["front client A"]
        gwB["gateway client B"]
        frontB["front client B"]
        prom["Prometheus"]
    end

    subgraph netA["tenant_net client A — isolé"]
        svcA["11 microservices"]
        dbA[("11 bases")]
        busA{{"RabbitMQ"}}
        minioA[("MinIO")]
    end

    subgraph netB["tenant_net client B — isolé"]
        svcB["11 microservices"]
        dbB[("11 bases")]
        busB{{"RabbitMQ"}}
        minioB[("MinIO")]
    end

    internet --> traefik
    traefik --> frontA
    traefik --> gwA
    traefik --> frontB
    traefik --> gwB
    gwA --> svcA
    svcA --- dbA
    svcA --- busA
    svcA --- minioA
    gwB --> svcB
    svcB --- dbB
    svcB --- busB
    svcB --- minioB
    prom -.->|scrape| gwA
    prom -.->|scrape| gwB

    gwA -.->|"joignable !"| gwB

    classDef partage fill:#c9a227,stroke:#8a6f1a,color:#1a1a1a
    classDef isole fill:#4a6fa5,stroke:#2f4870,color:#ffffff
    classDef infra fill:#f0f0f0,stroke:#999,color:#333
    class gwA,frontA,gwB,frontB,prom partage
    class svcA,svcB,dbA,dbB,busA,busB,minioA,minioB isole
    class traefik,internet infra
```

**Ce qui est isolé** : bases, bus de messages, stockage objet, volumes. Un client ne peut pas
lire les données d'un autre.

**Ce qui ne l'est pas** : les passerelles et les fronts de **tous** les clients partagent le
réseau `goosee_platform`, avec des alias DNS `<slug>-gateway`. La passerelle du client A résout
et joint directement celle du client B.

C'est nécessaire pour que Traefik et Prometheus les atteignent — mais la conséquence est que le
rayon d'explosion d'une passerelle compromise couvre toute la flotte. C'est
ANO-011 du registre des anomalies (dépôt `goosee-vitrine`), et la flèche jaune du schéma est
là pour qu'on ne puisse pas l'oublier.

## Forfait scalable — Kubernetes

Un namespace par client, déployé par chart Helm.

```mermaid
graph TB
    internet(["Internet"])
    ingress["<b>Ingress Traefik</b><br/>k3s"]

    subgraph nsA["namespace tenant-A"]
        direction TB
        npA["<b>NetworkPolicy</b><br/>ingress refusé hors namespace"]
        gwA["gateway<br/>HPA 1→N"]
        frontA["front<br/>HPA 1→N"]
        svcA["11 microservices<br/>HPA 1→N"]
        dbA[("bases · bus · MinIO")]
        rqA["ResourceQuota<br/>plafond CPU et mémoire"]
    end

    subgraph nsB["namespace tenant-B"]
        direction TB
        npB["<b>NetworkPolicy</b><br/>ingress refusé hors namespace"]
        gwB["gateway"]
        svcB["11 microservices"]
        dbB[("bases · bus · MinIO")]
    end

    internet --> ingress
    ingress --> frontA
    ingress --> gwA
    ingress --> gwB
    gwA --> svcA
    svcA --- dbA
    gwB --> svcB
    svcB --- dbB

    gwA -. "refusé par NetworkPolicy" .-x gwB

    classDef protege fill:#3f7d50,stroke:#2a5637,color:#ffffff
    classDef appli fill:#4a6fa5,stroke:#2f4870,color:#ffffff
    classDef infra fill:#f0f0f0,stroke:#999,color:#333
    class npA,npB,rqA protege
    class gwA,frontA,svcA,gwB,svcB,dbA,dbB appli
    class ingress,internet infra
```

Trois garde-fous que le chemin Docker n'a pas :

| Objet | Rôle |
| --- | --- |
| `NetworkPolicy` | Refuse tout ingress hors du namespace, sauf depuis le contrôleur d'ingress |
| `ResourceQuota` | Plafonne CPU, mémoire et nombre de pods — un client ne peut pas consommer tout le cluster |
| `HorizontalPodAutoscaler` | Ajuste le nombre de réplicas sur l'usage CPU |

## L'écart entre les deux forfaits

| | Docker (standard) | Kubernetes (scalable) |
| --- | --- | --- |
| Bases, bus, stockage | isolés | isolés |
| **Réseau entre clients** | **partagé** | **refusé par NetworkPolicy** |
| Plafond de ressources | aucun | `ResourceQuota` |
| Mise à l'échelle | manuelle | HPA automatique |
| Mise en veille | `compose stop` | réplicas à zéro |

Les deux dernières lignes sont des **différences de service assumées** : c'est ce qui distingue
les forfaits, le client sait ce qu'il achète.

La ligne en gras, non. Un client au forfait standard n'a pas choisi une isolation réseau plus
faible, et rien dans l'offre ne le lui dit. C'est un écart de conception, pas une option
commerciale — et c'est le forfait le moins cher qui est le moins protégé.

**Correction visée** : un réseau d'edge par client, rejoint uniquement par Traefik et
Prometheus, pour aligner le chemin Docker sur ce que la `NetworkPolicy` assure déjà côté
Kubernetes. Décision n° 3 de l'[audit du SI](../audit-si.md#6-traçabilité--du-constat-à-la-décision-darchitecture).

## Ce qui est cassé aujourd'hui

La construction d'images échoue en intégration continue : 26 des 30 Dockerfiles copient un
`yarn.lock` que le dépôt ne versionne pas. Les images se construisent sur un poste de
développement, où le fichier existe, et nulle part ailleurs.

Détail et mesures dans l'[audit du SI, §4.4](../audit-si.md#44-reproductibilité-des-livrables).

## Où regarder dans le dépôt

| Élément | Fichier |
| --- | --- |
| Compose d'un tenant | `docker/tenant/docker-compose.tenant.yml` |
| Traefik et routes dynamiques | `docker/tenant/docker-compose.traefik.yml`, `docker/tenant/dynamic/` |
| Chart Helm | `k8s/goosee-tenant/` |
| Politique réseau, quota, autoscaling | `k8s/goosee-tenant/templates/{networkpolicy,resourcequota,hpa}.yaml` |
| Choix de la cible | `goosee-vitrine/apps/orchestrator/src/modules/tenant/plan-infra.ts` |
