# Ajouter un microservice au monorepo

Le dépôt ne fournit actuellement ni commande `yarn generate:service` ni dossier modèle
`_template`. L'ajout est manuel. Prendre un service existant de rôle proche comme référence
(structure NestJS, configuration, Dockerfiles), sans copier ses données ou secrets.

1. Créer `templates/back/services/<nom>-service` avec un package au nom unique.
   Les workspaces racine incluent déjà `templates/back/services/*`.
2. Définir son module, ses DTO, contrôleurs HTTP et usecases. Pour un service persistant,
   ajouter entités, repositories et migrations. Les exemples pédagogiques du
   [guide manuel](4-creation-micro-service-main.md) doivent être adaptés au monorepo.
3. Ajouter ses variables à `env/.env.example` et à la configuration locale, puis ses
   variables de développement à `turbo.json`. Les ports 3001 à 3012 sont déjà attribués.
4. Ajouter ses URLs et routes dans la gateway, les contrôleurs proxy HTTP et les gardes
   JWT/pageKeys appropriés. La gateway appelle les services en HTTP ; RabbitMQ sert
   aux événements internes et aux notifications, pas au routage HTTP de la gateway.
5. Ajouter la base éventuelle à `docker/dev/docker-compose.infra.dev.yml`, et les
   définitions applicatives aux Compose concernés (dev, prod et tenant).
6. Adapter les Dockerfiles au contexte racine et au lockfile partagé. Ajouter l'image
   à la liste de `scripts/build-demo-images.js` si elle participe à la démonstration.
7. Compléter le chart `k8s/goosee-tenant` : workload, service, environnement, base éventuelle,
   santé et ressources. Les services sans base n'en nécessitent pas artificiellement.
8. Ajouter les tests et, si pertinent, `test:ci` et un seuil de couverture. Actualiser
   l'inventaire, les diagrammes, la matrice des accès et la collection Postman.

Pour le lancement courant, voir [la configuration d'environnement](6-env-configuration.md)
et [la démonstration](../demo-infra.md).
