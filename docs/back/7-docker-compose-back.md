# Docker Compose et backend

## Développement courant

`yarn infra` démarre les bases et l'infrastructure avec
`docker/dev/docker-compose.infra.dev.yml`. `yarn dev` lance le front, la gateway et les
microservices en natif. Les hôtes sont alors localhost ; voir
[la configuration d'environnement](6-env-configuration.md).

## Backend conteneurisé

`docker/dev/docker-compose.back.dev.yml` définit la gateway et les douze microservices,
y compris stock, ticket et assistant. Les bases sont dans le Compose infra.
Ce mode est distinct du lancement natif : adapter les variables SERVICE_HOST et DB_HOST
aux noms DNS des conteneurs, et DB_PORT au port interne 5432. Ne pas reprendre tels quels
les localhost du modèle natif. Le nom de fichier ci-dessous est une configuration locale
à préparer pour ce mode, pas un fichier livré :

```powershell
docker compose --env-file env/.env.docker.local -f docker/dev/docker-compose.infra.dev.yml -f docker/dev/docker-compose.back.dev.yml up -d --build
```

La gateway publie son port HTTP ; les microservices sont accessibles sur le réseau
`goosee_net`. `expose` documente un port interne, mais ne constitue pas une règle de
filtrage réseau. Les volumes PostgreSQL conservent les données et les dépendances avec
`condition: service_healthy` attendent les services déclarés prêts.

Les Dockerfiles des applications doivent être construits depuis la racine du monorepo
pour accéder aux workspaces et au lockfile. Chaque service définit son healthcheck dans
le Compose ; PostgreSQL utilise pg_isready.

## Démonstration multi-tenant

Pour la démo validée, utiliser `yarn presentation` : le launcher prépare les paramètres
internes du Compose tenant et du chart Helm. Il ne repose pas sur le Compose de dev.
Voir [demo-infra.md](../demo-infra.md) pour les limites CPU/mémoire, le paiement simulé,
Gemini et les commandes de diagnostic. Les Compose prod restent accessibles via
`yarn start:prod`, avec leur configuration propre ; ils ne constituent pas une
validation de durcissement production.

## Ajouter un service

Compléter le Compose applicatif et sa base éventuelle dans le Compose infra, puis les
cibles prod, tenant et Helm concernées. Suivre la
[procédure d'ajout](3-creation-micro-service-script.md) pour les autres fichiers à aligner.
