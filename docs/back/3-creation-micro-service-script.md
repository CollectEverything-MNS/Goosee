# Création d'un micro service 

## Étape n°1 - Initialiser le projet
Mettez vous a la racine du projet et faire la commande suivante :
```
yarn generate:service <user-service>
```
Cela va créer un dossier `user-service` dans le dossier `templates/back/services` avec la structure de base d'un micro service à partir du dossier model `_template`.

Il va aussi générer ls variables d'environnements nécessaires dans le fichier `.env.dev`.

Et ajouter le service / db dans le `docker-compose.dev.yml`.

## Étape n°2 - Configurer le service dans l'API Gateway
- Rendez-vous dans le dossier `templates/back/api-gateway/src/` et copier le dossier `_template`

- Renommer le dossier copié avec le nom de votre service ainsi que tous les fichiers à l'intérieur.

- Dans le fichier module modifier tous les .env / nom de module pour correspondre à votre service.
- Dans le controller modifier le nom du controller et mettre un message pattern non utlisé par un autre service.


## Étape n°3 - Configurer le service
- Rendez-vous dans le dossier `templates/back/services/<mon-service>/src`, 
- Modifier les variables dans le fichier `main.ts` pour correspondre à votre service.
- Dans le controller modifier le nom du controller et mettre le message pattern utilisé par l'api gateway. `ex:   @MessagePattern({ cmd: 'getUser' })`
