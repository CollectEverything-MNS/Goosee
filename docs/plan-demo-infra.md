# Plan infra de démonstration POC

Objectif : lancer et rejouer une démonstration avec un site Docker, un site
Kubernetes, des données préchargées et une supervision accessible.
Pas de chantier de durcissement production, sauvegarde automatisée ou CI complète.

## Contraintes

- Builds séquentiels, builder limité à 2 CPU, tests à un worker.
- Un tenant Docker et un tenant Kubernetes par défaut.
- Préserver les conteneurs et données des autres projets.
- Un commit par fonctionnalité ; noter les validations réelles et les blocages.
- Aucun envoi de notification externe pendant les vérifications.

## Étapes et commits prévus

1. **Aligner les images et services** (`feat(infra): align demo service images`).
   Inventorier les dépendances ; inclure stock, tickets et assistant nécessaires
   aux parcours ; corriger les Dockerfiles et limiter les ressources de build.
2. **Valider le tenant Docker** (`feat(infra): complete Docker demo stack`).
   Compléter les services et connexions ; démarrer un site, vérifier le compte
   propriétaire, les produits et une commande avec paiement de test ou simulé.
3. **Valider le tenant Kubernetes** (`feat(infra): complete Kubernetes demo stack`).
   Aligner Helm, déployer sur k3d, vérifier disponibilité et métriques.
4. **Fiabiliser le lancement et les données** (`feat(demo): make demo startup repeatable`).
   Préflight, secrets réutilisés, seed rejouable, lancement à une commande,
   comptes et URLs documentés ; vérifier l'intégration avec goosee-vitrine.
5. **Répéter et documenter** (`test(demo): verify complete POC scenario`).
   Exécuter le scénario complet, relancer sans perte de données, consigner les
   résultats et les commandes de diagnostic / arrêt.

## Suivi

- Plan écrit avant implémentation.
- État initial : develop propre, à jour ; outils Docker/k3d/Helm/kubectl présents.
- Aucun conteneur Goosee actif au début ; conteneurs d'un autre projet à préserver.
- Écarts initiaux : stock/ticket/assistant absents des tenants Docker et Helm ;
  Dockerfile assistant non adapté au contexte monorepo ; liste des images incomplète.

## Réalisation au 17 septembre 2026

- [x] 14 images alignées, builds séquentiels plafonnés à 2 CPU et 4 Go.
- [x] Tenant Docker complet : stock, tickets, assistant, achat simulé au navigateur.
- [x] Tenant k3s complet, serveur plafonné à 2 CPU et 5 Gio, métriques disponibles.
- [x] Lancement rejouable, secrets conservés, bases vitrine lues dans son .env.
- [x] Gemini validé sur les deux tenants avec la clé locale.
- [x] Arrêt/relance et comparaison des identifiants : données conservées sans doublon.
- [x] Guide et contrôles dans [demo-infra.md](demo-infra.md) et scripts/check-demo.js.

Les fonctionnalités et correctifs ont des commits séparés. Le dépôt voisin
Goosee-vitrine contient aussi un commit limitant les builds Next.js à un worker.
La création en direct d'un nouveau client et les tests de charge restent hors de
la répétition validée ; la démonstration utilise les deux boutiques préchargées.
