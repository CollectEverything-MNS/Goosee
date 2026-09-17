# Dossier d'architecture

Diagrammes de la plateforme Goosee, en **mermaid dans le dépôt**.

## Pourquoi mermaid et pas un outil de dessin

Un export d'image se périme sans prévenir : le code bouge, le schéma reste. Ici les diagrammes
sont du texte versionné — ils se relisent en diff, se corrigent dans la même pull request que
le code qu'ils décrivent, et GitHub les rend nativement sans outil ni greffon.

C'est la mise en œuvre de la décision n° 8 de l'[audit du SI](../audit-si.md#6-traçabilité--du-constat-à-la-décision-darchitecture) :
*« la documentation vieillit avec le code, pas à côté »*.

## Les documents

| Document | Ce qu'il répond |
| --- | --- |
| [Contexte et conteneurs](c4-contexte-et-conteneurs.md) | Qui utilise la plateforme, avec quels systèmes extérieurs elle dialogue, et de quels blocs déployables elle se compose |
| [Composants d'un site généré](c4-composants-tenant.md) | Ce qu'il y a dans un site client, et comment ses services communiquent entre eux |
| [Déploiement](deploiement.md) | Comment un site est réellement déployé, et **en quoi les deux forfaits diffèrent** |
| [Séquences](sequences.md) | Parcours d'achat, provisionnement d'un client, auto-connexion à l'administration |
| [Résilience et reprise](resilience-reprise.md) | Redémarrage des services, conservation des données, limites et essais de panne à exécuter |
| [Modèle de données](modele-donnees.md) | Les entités de chaque service, et pourquoi il n'y a aucune clé étrangère entre services |

## Convention de lecture

Les trois premiers documents suivent le modèle **C4** — on descend d'un niveau de détail à
chaque fois, sans jamais tout montrer d'un coup :

1. **Contexte** — la plateforme vue comme une boîte, avec ses acteurs et ses voisins
2. **Conteneurs** — les blocs déployables indépendamment
3. **Composants** — l'intérieur d'un bloc

Un schéma qui montre tout à la fois ne montre rien. Chaque diagramme répond à **une** question.

## Tenir les diagrammes à jour

Ils décrivent un état vérifiable. Les valeurs qu'ils portent — ports, événements, entités — ont
été relevées dans le code, et sont recontrôlables :

```bash
# Ports
grep -hoE "^[A-Z_]*PORT=[0-9]+" env/.env.example | sort -u

# Événements AMQP émis et consommés
grep -rhoE "emit\('[a-z_.]+'" --include="*.ts" templates/back | sort -u
grep -rhoE "@EventPattern\('[a-z_.]+'\)" --include="*.ts" templates/back | sort -u

# Entités par service
find templates/back/services -name "*.entity.ts" | grep -v node_modules
```

**Règle** : un service ajouté, un événement introduit ou une entité créée se répercute ici dans
la même pull request. Un diagramme faux est pire que pas de diagramme — on lui fait confiance.
