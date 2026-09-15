# Contexte et conteneurs

## Niveau 1 — Contexte

Qui se sert de Goosee, et avec quoi la plateforme dialogue à l'extérieur.

```mermaid
graph TB
    marchand["<b>Client Goosee</b><br/>commerçant abonné<br/>achète un forfait, gère sa boutique"]
    acheteur["<b>Acheteur final</b><br/>client du commerçant<br/>navigue, commande, paie"]
    superadmin["<b>Superadmin Goosee</b><br/>équipe plateforme<br/>supervise la flotte"]

    goosee["<b>Plateforme Goosee</b><br/><br/>Vend des forfaits, provisionne un site<br/>e-commerce isolé par client, et le supervise"]

    stripe["<b>Stripe</b><br/>paiement et webhooks"]
    smtp["<b>Serveur SMTP</b><br/>courriels transactionnels"]
    registre["<b>Registre npm</b><br/>dépendances des images"]

    marchand -->|"achète un forfait,<br/>administre sa boutique"| goosee
    acheteur -->|"navigue et commande<br/>sur la boutique"| goosee
    superadmin -->|"supervise, alloue<br/>les ressources"| goosee

    goosee -->|"intentions de paiement"| stripe
    stripe -->|"webhooks de confirmation"| goosee
    goosee -->|"vérification d'adresse,<br/>réinitialisation"| smtp
    goosee -->|"construction des images"| registre

    classDef acteur fill:#e8eef7,stroke:#3b5580,stroke-width:1px,color:#1a2740
    classDef systeme fill:#3b5580,stroke:#26364f,stroke-width:1px,color:#ffffff
    classDef externe fill:#f0f0f0,stroke:#999,stroke-width:1px,color:#333
    class marchand,acheteur,superadmin acteur
    class goosee systeme
    class stripe,smtp,registre externe
```

**Trois acteurs, trois usages distincts.** Le commerçant est le client payant ; l'acheteur ne
sait même pas que Goosee existe, il voit une boutique ; le superadmin ne touche jamais aux
données métier d'un client, il pilote de la capacité.

---

## Niveau 2 — Conteneurs

Les blocs déployables indépendamment. Deux ensembles : le **control plane**, unique, et les
**sites générés**, un par client.

```mermaid
graph TB
    marchand(["Client Goosee"])
    acheteur(["Acheteur final"])
    superadmin(["Superadmin"])

    subgraph portail["Control plane — dépôt goosee-vitrine"]
        web["<b>web</b> · Next.js 15<br/>:3000<br/>vitrine, espace client, superadmin"]
        api["<b>api</b> · NestJS<br/>:3002<br/>comptes, projets, facturation"]
        orch["<b>orchestrator</b> · NestJS<br/>:4000, boucle locale<br/>provisionne et supervise"]
        dbportail[("PostgreSQL<br/>portail")]
        dborch[("PostgreSQL<br/>registre des tenants")]
    end

    subgraph tenant["Site généré — dépôt Goosee, un déploiement par client"]
        front["<b>front</b> · Next.js 15<br/>:3000<br/>boutique + administration"]
        gw["<b>gateway</b> · NestJS<br/>:3001<br/>seule porte d'entrée"]
        services["<b>11 microservices</b> · NestJS<br/>:3002 à :3011"]
        dbs[("11 bases PostgreSQL<br/>une par service")]
        bus{{"RabbitMQ"}}
        minio[("MinIO<br/>fichiers")]
    end

    prom["<b>Prometheus</b><br/>+ Alertmanager"]
    traefik["<b>Traefik</b><br/>routage par sous-domaine"]
    stripe["Stripe"]

    marchand --> web
    superadmin --> web
    acheteur --> traefik
    marchand -->|"administration"| traefik
    traefik --> front
    traefik --> gw

    web -->|"HTTP"| api
    api -->|"HTTP + jeton interne"| orch
    api --- dbportail
    orch --- dborch
    orch -->|"docker compose · helm · kubectl"| tenant
    orch -->|"KPI métier via jeton interne"| gw

    front -->|"HTTP"| gw
    gw -->|"HTTP"| services
    services --- dbs
    services -.->|"AMQP"| bus
    bus -.-> services
    services --- minio
    services -->|"HTTP direct,<br/>jamais par le bus"| stripe

    gw -->|"/metrics"| prom

    classDef acteur fill:#e8eef7,stroke:#3b5580,color:#1a2740
    classDef appli fill:#4a6fa5,stroke:#2f4870,color:#ffffff
    classDef donnees fill:#6b8cae,stroke:#3b5580,color:#ffffff
    classDef infra fill:#f0f0f0,stroke:#999,color:#333
    class marchand,acheteur,superadmin acteur
    class web,api,orch,front,gw,services appli
    class dbportail,dborch,dbs,minio,bus donnees
    class prom,traefik,stripe infra
```

### Ce que ce diagramme fixe

**Une seule porte d'entrée par site.** Le front ne parle qu'à la passerelle ; aucun microservice
n'est joignable directement. L'authentification, la validation et le contrôle de rôle vivent au
même endroit.

**Le control plane ne touche jamais aux données d'un client.** L'orchestrateur déploie et
interroge des indicateurs agrégés via le jeton interne du tenant. Il ne lit aucune base
métier — la supervision repose sur un point d'entrée `/internal/kpi` exposé par la passerelle,
pas sur un accès direct.

**L'orchestrateur n'écoute qu'en boucle locale.** Il exécute `docker`, `helm` et `kubectl` sur
l'hôte : c'est le composant le plus privilégié de la plateforme, et le seul que l'API du portail
peut joindre. Voir ANO-001 du registre des anomalies (dépôt `goosee-vitrine`).

**Le paiement sort du bus.** Les microservices communiquent en AMQP pour tout ce qui tolère
l'asynchrone. Stripe est appelé en HTTP direct : une intention de paiement perdue dans une file
serait une commande encaissée sans trace, ou l'inverse.

### Correspondance avec les dépôts

| Conteneur | Emplacement |
| --- | --- |
| `web`, `api`, `orchestrator` | `goosee-vitrine/apps/` |
| `front` | `Goosee/templates/front/` |
| `gateway` | `Goosee/templates/back/api-gateway/` |
| Les 11 services | `Goosee/templates/back/services/` |
| Traefik, Prometheus | `Goosee/docker/tenant/`, `Goosee/docker/observability/` |
