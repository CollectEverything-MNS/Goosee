# Documentation Goosee

## Références actuelles

- [Démonstration infra](demo-infra.md) : lancement, comptes, ressources et arrêt.
- [Validation POC](validation-poc-tests.md) : tests réellement exécutés le 17 septembre 2026.
- [Plan de démonstration](plan-demo-infra.md) : périmètre réalisé et limites.
- [Fonctionnement](fonctionnement.md) et [structure](structure-projet.md) : vue du dépôt.
- [Architecture](architecture/README.md) : diagrammes Mermaid et modèle de données.
- [Résilience et reprise après panne](architecture/resilience-reprise.md) : protections présentes, limites et procédure de vérification.
- [Guide utilisateur](guide-utilisateur.md) : boutique, administration et chatbot.
- [Matrice des accès](roles-endpoints-matrix.md) : 99 routes et gardes déclarées.
- [Postman](postman/procedure-tests-roles-dynamiques.md) : configuration et requêtes manuelles.
- [Stratégie de tests](strategie-tests.md) et [performance](analyse-performance.md).
- [Configuration des environnements](back/6-env-configuration.md) et [ajout d'un service](back/3-creation-micro-service-script.md).

## Historique et relevés datés

Le [plan POC initial](plan-poc.md), l'[audit du SI](audit-si.md) et le
[journal de développement](journal-dev.md) conservent leurs constats à la date indiquée.
Les anciens résultats de performance et d'accessibilité restent des relevés historiques,
pas une certification de la version courante. Les constats non recontrôlés restent ouverts.

## Maintenance

Une modification du guide utilisateur doit aussi mettre à jour la copie
`templates/back/services/assistant-service/src/knowledge/guide-utilisateur.md`.
Le build Nest copie ce document dans dist ; les images et services déjà lancés continuent
à utiliser l'ancienne copie jusqu'à leur reconstruction et redéploiement.

Les sources Mermaid sont conservées dans les fichiers Markdown. Les routes et accès
se vérifient dans les contrôleurs de la gateway ; les exemples Postman ne sont pas une
suite E2E automatique et ne doivent pas être lancés en bloc sur des données à conserver.
