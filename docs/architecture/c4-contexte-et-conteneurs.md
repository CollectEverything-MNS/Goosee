# Contexte et conteneurs

## Niveau 1 — Contexte

Qui se sert de Goosee, et avec quoi la plateforme dialogue à l'extérieur.

```mermaid
graph TB
    marchand["<b>Client Goosee</b><br/>commerçant abonné<br/>achète un forfait, gère sa boutique"]
    acheteur["<b>Acheteur final</b><br/>client du commerçant<br/>navigue, commande, paie"]
    superadmin["<b>Superadmin Goosee</b><br/>équipe plateforme<br/>supervise la flotte"]

    goosee["<b>Plateforme Goosee</b><br/><br/>Vend des forfaits, provisionne un site<br/>e-commerce isolé par client, et le supervise"]

    gemini["<b>Gemini</b><br/>assistant du guide"]
    stripe["<b>Stripe</b><br/>paiement et webhooks"]
    smtp["<b>Serveur SMTP</b><br/>courriels transactionnels"]
    registre["<b>Registre npm</b><br/>dépendances des images"]

    marchand -->|"achète un forfait,<br/>administre sa boutique"| goosee
    acheteur -->|"navigue et commande<br/>sur la boutique"| goosee
    superadmin -->|"supervise, alloue<br/>les ressources"| goosee

    goosee -->|"question et guide"| gemini
    goosee -->|"mode Stripe uniquement"| stripe
    stripe -->|"webhooks de confirmation"| goosee
    goosee -->|"vérification d'adresse,<br/>réinitialisation"| smtp
    goosee -->|"construction des images"| registre

    classDef acteur fill:#e8eef7,stroke:#3b5580,stroke-width:1px,color:#1a2740
    classDef systeme fill:#3b5580,stroke:#26364f,stroke-width:1px,color:#ffffff
    classDef externe fill:#f0f0f0,stroke:#999,stroke-width:1px,color:#333
    class marchand,acheteur,superadmin acteur
    class goosee systeme
    class stripe,smtp,registre,gemini externe
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
        web["<b>web</b> · Next.js 15<br/>:3100 (démo)<br/>vitrine, espace client, superadmin"]
        api["<b>api</b> · NestJS<br/>:3102 (démo)<br/>comptes, projets, facturation"]
        orch["<b>orchestrator</b> · NestJS<br/>:4000, boucle locale<br/>provisionne et supervise"]
        dbportail[("PostgreSQL<br/>portail")]
        dborch[("PostgreSQL<br/>registre des tenants")]
    end

    subgraph tenant["Site généré — dépôt Goosee, un déploiement par client"]
        front["<b>front</b> · Next.js 15<br/>:3000<br/>boutique + administration"]
        gw["<b>gateway</b> · NestJS<br/>:3001<br/>seule porte d'entrée"]
        services["<b>12 microservices</b> · NestJS<br/>:3002 à :3012, notifier sans HTTP"]
        dbs[("10 bases PostgreSQL<br/>services persistants")]
        bus{{"RabbitMQ"}}
        minio[("MinIO<br/>fichiers")]
    end

    prom["<b>Prometheus</b><br/>+ Alertmanager"]
    traefik["<b>Traefik</b><br/>routage par sous-domaine"]
    gemini["Gemini"]
    stripe["Stripe, hors paiement simulé"]

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
    services -->|"HTTP direct,<br/>mode Stripe"| stripe
    services -->|"assistant, HTTPS"| gemini

    prom -->|"GET /metrics"| gw

    classDef acteur fill:#e8eef7,stroke:#3b5580,color:#1a2740
    classDef appli fill:#4a6fa5,stroke:#2f4870,color:#ffffff
    classDef donnees fill:#6b8cae,stroke:#3b5580,color:#ffffff
    classDef infra fill:#f0f0f0,stroke:#999,color:#333
    class marchand,acheteur,superadmin acteur
    class web,api,orch,front,gw,services appli
    class dbportail,dborch,dbs,minio,bus donnees
    class prom,traefik,stripe,gemini infra
```

### Ce que ce diagramme fixe

**Une seule porte d'entrée par site.** Le front ne parle qu'à la passerelle ; les services internes ne sont pas exposés par une route publique dédiée. L'authentification, la validation et le contrôle de rôle vivent au
même endroit.

**La supervision utilise les endpoints internes du tenant.** L'orchestrateur déploie et
interroge des indicateurs agrégés via le jeton interne du tenant. La collecte de KPI passe par `/internal/kpi`, sans lecture directe des bases métier.
Le provisioning et les scripts de démonstration peuvent toutefois initialiser le compte
propriétaire directement dans les bases : cette opération est distincte de la supervision.

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
| Les 12 services | `Goosee/templates/back/services/` |
| Traefik, Prometheus | `Goosee/docker/tenant/`, `Goosee/docker/observability/` |

Les ports vitrine 3100/3102 reflètent la configuration locale de la démonstration et
restent configurables dans son .env. Les ports du tenant sont des ports internes.
Le paiement de la démo est simulé ; Gemini est activé avec la clé locale.
