# Audit du système d'information

> Relevé des 12 et 13 septembre 2026, sur `develop` (`Goosee`) et `main` (`goosee-vitrine`).
> Toutes les valeurs chiffrées de ce document ont été mesurées ; la commande de contrôle est
> donnée pour chacune en annexe. Aucune n'est estimée.

Ce document répond à une dette : [`journal-dev.md`](journal-dev.md) renvoie depuis le
2026-06-16 à un fichier `audit.md` qui n'a jamais existé — vérifié par
`git log --all --diff-filter=A -- "**/audit.md"`, qui ne renvoie rien. Les décisions
d'architecture du programme ont donc été prises contre un audit jamais écrit. Le voici, établi
a posteriori sur l'existant réel.

---

## 1. Périmètre et méthode

### Périmètre

| Dépôt | Rôle | Volume mesuré |
| --- | --- | --- |
| `Goosee` | Générateur : le template déployé pour chaque client | 978 fichiers TS/TSX, ~53 700 lignes |
| `goosee-vitrine` | Control plane : portail, API, orchestrateur | 214 fichiers TS/TSX, ~13 200 lignes |

### Méthode

Quatre sources, croisées :

1. **Lecture de code** — orchestrateur intégralement (15 fichiers, 1 153 lignes), gardes et DTO
   des deux APIs, chart Helm, fichiers Compose, les 3 workflows d'intégration.
2. **Analyses outillées** — `yarn audit`, gitleaks, semgrep (`p/typescript`, `p/nodejs`,
   `p/owasp-top-ten`), Trivy en mode configuration. Rejouées en local sur un contexte
   reconstitué depuis `git ls-files`, puis **confrontées aux artefacts réels de la chaîne
   d'intégration** (voir
   [`goosee-vitrine/docs/preuves/ci/`](../../goosee-vitrine/docs/preuves/ci/README.md)).
3. **Exécution** — suites de tests, builds des 13 workspaces, démarrage réel du front avec
   chargement de pages, construction d'images Docker depuis un contexte git seul.
4. **Archéologie git** — historique des deux dépôts, branches distantes, commits supprimant
   des fichiers structurants.

### Ce que l'audit ne couvre pas

- **Aucun test dynamique.** Pas de DAST contre une instance en fonctionnement, pas de campagne
  manuelle d'intrusion. Les constats portent sur ce que le code et la configuration révèlent à
  la lecture et au démarrage.
- **Aucun `helm upgrade` réel** sur un cluster : le chemin Kubernetes est audité sur ses
  manifestes, pas sur son comportement observé.
- **Pas d'audit de conformité RGPD** au sens juridique — seulement le constat des mécanismes
  techniques présents ou absents.

---

## 2. Cartographie de l'existant

### Composants

```
                         goosee-vitrine (control plane)
   ┌──────────┐    HTTP   ┌──────────┐   HTTP+jeton   ┌──────────────┐
   │   web    │ ────────► │   api    │ ─────────────► │ orchestrator │
   │ Next 15  │           │  NestJS  │                │    NestJS    │
   └──────────┘           └────┬─────┘                └──────┬───────┘
                               │                             │
                          PostgreSQL                    PostgreSQL
                                                             │
                          docker compose  ◄──────────────────┤
                          helm / kubectl  ◄──────────────────┘
                               │
                               ▼
                    Goosee (un déploiement par client)
   ┌──────────┐    HTTP   ┌──────────┐   HTTP   ┌────────────────────────┐
   │  front   │ ────────► │ gateway  │ ───────► │ 11 microservices NestJS │
   │ Next 15  │           │  NestJS  │          └───────────┬────────────┘
   └──────────┘           └──────────┘                      │
                                              AMQP (RabbitMQ) ┤ 1 base PostgreSQL par service
                                                              ┤ MinIO · Mailhog
```

### Inventaire des services du site généré

`auth` · `user` · `page` · `log` · `product` · `order` · `cart` · `payment` · `stock` ·
`notifier` · `ticket` — **onze**, plus la passerelle et le front.

> [`structure-projet.md`](structure-projet.md) n'en documente que **cinq** (auth, log,
> notifier, page, user). Six manquent : cart, order, payment, product, stock, ticket.

### Choix structurants observés

| Décision | Mise en œuvre constatée |
| --- | --- |
| Passerelle unique | Le front ne parle qu'à la gateway ; elle seule route vers les services |
| Database-per-service | Une base PostgreSQL par microservice, références croisées par UUID sans clé étrangère |
| Asynchrone par défaut, sauf paiement | RabbitMQ pour logs, notifications et synchronisation ; `payment-service` en HTTP pur pour ne pas perdre une intention dans le bus |
| Clean architecture | `entities → repositories → usecases → controllers`, homogène sur les 11 services |
| Deux cibles de déploiement | Docker Compose pour le forfait standard, Helm/Kubernetes pour le forfait scalable, derrière une même interface d'orchestration |
| Isolation par client | Un projet Compose ou un namespace par tenant, avec ses bases, son stockage objet et ses secrets |

---

## 3. Matrice de maturité

Échelle : **0** absent · **1** amorcé · **2** opérationnel · **3** outillé et vérifié.

| Domaine | Niveau | Ce qui fonde la note |
| --- | --- | --- |
| Architecture applicative | **3** | Clean architecture homogène, séparation stricte des données, choix de communication argumentés |
| Conteneurisation et orchestration | **3** | 30 Dockerfiles multi-étapes, chart Helm avec HPA, quotas et politique réseau, deux cibles pilotées par un même orchestrateur |
| Observabilité | **2** | Métriques RED sur la passerelle, Prometheus, 6 règles d'alerte routées vers Discord. Pas de suivi d'incident, pas de tableaux de bord |
| Tests unitaires | **2** | 62 fichiers, seuil de 70 % bloquant sur 4 services métier. Mais 3 services sans aucun test, et 0 test sur le control plane |
| Tests de bout en bout | **1** | Une suite couvrant le parcours d'achat complet, non branchée sur la chaîne d'intégration |
| Performance | **2** | Campagne k6 documentée avec seuils et résultats — côté serveur uniquement. Rien sur le front |
| Intégration continue | **2** | Six tâches sur les deux dépôts, statut bloquant assumé par famille. Aucune livraison continue |
| Sécurité applicative | **2** | Gardes par rôle, bcrypt, HMAC, comparaison à temps constant, limitation de débit sur la passerelle. Écarts détaillés en §4 |
| Sécurité d'infrastructure | **1** | Aucun conteneur en utilisateur non privilégié, aucun contexte de sécurité, aucun TLS |
| Documentation technique | **2** | ~3 600 lignes, journal de développement de 1 030 lignes tenu par feature |
| **Conception et modélisation** | **0** | Aucun diagramme, aucun ADR, aucun export OpenAPI |
| **Accessibilité** | **0** | Aucun outillage, aucune grille, aucun critère dans les procédures |
| Protection des données | **1** | Deux pages légales générées. Ni consentement, ni export, ni durée de conservation |
| Reproductibilité des livrables | **1** | Le portail verrouille ses dépendances, le générateur non — conséquences en §4 |

**Lecture.** Le socle applicatif et l'orchestration sont matures ; ce qui manque se situe aux
deux extrémités — la **conception amont** (modélisation, décisions tracées) et la **finition
aval** (durcissement, accessibilité, reproductibilité).

---

## 4. Constats

Treize constats. Les fiches détaillées, avec vecteur CVSS et contre-test, sont au
[registre des anomalies](../../goosee-vitrine/docs/registre-anomalies.md).

### 4.1 Contrôle d'accès et secrets

| Réf | Constat | État |
| --- | --- | --- |
| ANO-001 | Control plane joignable sans authentification : création, suppression et accès administrateur de n'importe quel site client | Corrigé |
| ANO-002 | Secrets d'un tenant lisibles dans la table des processus pendant tout le déploiement | Corrigé |
| ANO-003 | Données saisies par le client interpolées dans une commande shell | Corrigé |
| ANO-004 | Même faille, chemin non couvert par le correctif d'ANO-003 | Corrigé |
| ANO-013 | `/metrics` sans garde, joignable publiquement sur chaque boutique | Ouvert |
| — | Fichier d'environnement du tenant écrit sans permissions restreintes, alors qu'il porte JWT, jeton interne, mot de passe de base et clés de paiement | Ouvert |
| — | API du portail sans `helmet` ni limitation de débit ; messages de connexion distincts permettant l'énumération de comptes | Ouvert |
| — | Jeton du portail valable 7 jours, en `localStorage`, cookie non `HttpOnly`, sans révocation — alors que le site généré dispose déjà d'un mécanisme access/refresh correct | Ouvert |
| — | Jeton d'auto-connexion annoncé « à usage unique » dans le code, sans mécanisme de rejeu | Ouvert |

**Ce que la répartition révèle.** Neuf constats sur treize touchent l'orchestrateur ou l'API du
portail. Le site généré, lui, dispose de gardes par rôle, d'une limitation de débit et d'un
cycle de jeton correct. **Le composant le plus privilégié de la plateforme était le moins
outillé** — parce qu'il a été écrit en dernier, sous contrainte de démonstration, et qu'aucune
analyse automatisée ne le couvrait.

### 4.2 Sécurité du produit livré

| Réf | Constat | État |
| --- | --- | --- |
| ANO-012 | Contenu du page-builder injecté sans assainissement : XSS stocké, exploitable par tout rôle portant le droit d'édition de pages | Ouvert |
| ANO-011 | Sur le forfait Docker, les passerelles de tous les clients partagent un réseau commun. Le forfait Kubernetes, lui, refuse l'ingress inter-namespace | Ouvert |

**Ce que ces deux constats révèlent.** L'audit initial s'était arrêté au control plane. Or
ANO-011 signifie que **deux clients au même catalogue n'ont pas la même posture d'isolation
selon leur forfait** — et que c'est le moins cher qui est le moins protégé. Pour une plateforme
vendue en multi-tenant, c'est un écart de conception, pas un détail d'implémentation.

### 4.3 Durcissement d'infrastructure

Mesuré par Trivy sur les fichiers versionnés, confirmé par les artefacts de la chaîne :

| Constat | Occurrences |
| --- | --- |
| Aucun `USER` dans les Dockerfiles — tout s'exécute en `root` | 30 sur 30 |
| Aucun contexte de sécurité dans le chart Helm | 44 |
| Système de fichiers racine inscriptible | 22 |
| Aucun `HEALTHCHECK` | 30 sur 30 |
| Aucun TLS : ni `certresolver` Traefik, ni bloc `tls` dans l'ingress | — |

### 4.4 Reproductibilité des livrables

`Goosee` exclut son `yarn.lock` du dépôt (commit `6d60eed`, 31/01/2026). Trois conséquences
mesurées :

1. **La construction d'images est cassée en intégration continue.** Le job échoue sur
   `COPY package.json yarn.lock ./` — or **26 des 30 Dockerfiles** copient ce fichier et
   installent en `--frozen-lockfile`. L'en-tête de celui de la passerelle indique même
   « install deterministe via le yarn.lock racine ». Les images sont donc écrites en supposant
   un fichier que le dépôt ne contient pas.
2. **L'audit de dépendances n'est pas reproductible.** Le même commit, le même jour, donne
   **22 avis dont 7 élevées** en intégration continue contre **43 dont 17** sur un poste. Les
   trois autres analyses, qui lisent le code source, concordent au constat près.
3. **Deux clients provisionnés à des dates différentes ne reçoivent pas le même logiciel**, sans
   qu'aucune trace ne permette de savoir en quoi ils diffèrent.

La cause d'origine du commit était réelle — trois lockfiles coexistaient, dont un vide sous
`api-gateway`, symptôme d'une installation lancée depuis un sous-dossier. Cette cause a disparu :
il n'en reste qu'un, à la racine, et `yarn install --frozen-lockfile` depuis la racine réussit
sans régénérer d'imbriqué.

### 4.5 Conception et pilotage

| Constat | Mesure |
| --- | --- |
| Aucun diagramme d'architecture | 0 fichier `.puml`, `.drawio`, `.mmd`, 0 bloc mermaid |
| Aucune décision d'architecture tracée | 0 ADR |
| Aucun contrat d'API exporté | Swagger servi à l'exécution, jamais figé en fichier |
| Bibliothèque logicielle partagée absente | `packages/*` déclaré dans le workspace du portail, **dossier inexistant** ; le socle technique est dupliqué dans les 11 services |
| Inventaire des services obsolète | 5 documentés sur 11 |
| Branche par défaut périmée | `main` de `Goosee` date du 10 avril, cinq mois derrière `develop` |

### 4.6 Accessibilité et conformité

| Constat | Mesure |
| --- | --- |
| `<html lang="fr">` codé en dur malgré le routage par locale | **Vérifié à l'exécution** : `/en` sert du contenu anglais en déclarant `lang="fr"` |
| Balises de structuration | 23 sur 325 fichiers |
| Champs de formulaire sans étiquette associée | 125 contrôles pour 35 `htmlFor` ; 6 fichiers identifiés sans étiquette ni `aria-label` |
| Règles d'accessibilité dans les procédures | Aucune : ni `eslint-plugin-jsx-a11y`, ni tâche d'intégration continue |
| Optimisation des images | **0 `next/image`** sur 440 fichiers, 16 balises `<img>` brutes |
| Protection des données | 2 pages légales générées ; ni consentement, ni export, ni suppression effective, ni durée de conservation |

---

## 5. Faiblesses d'architecture

Distinctes des anomalies : ce ne sont pas des failles, ce sont des choix de conception qui ne
tiennent pas à l'échelle visée.

**F1 — Aucune compensation sur échec de provisionnement.** En cas d'erreur, le tenant est marqué
`FAILED` mais laisse derrière lui un fichier de secrets, un projet Compose partiellement monté,
une route Traefik, une cible de supervision et un namespace. L'API renvoie néanmoins **201** :
le client croit son site créé.

**F2 — Le registre peut mentir.** L'allocation de ressources est persistée en base *même si*
`helm upgrade` échoue : l'erreur est journalisée puis ignorée. Le tableau de bord de supervision
affiche alors une valeur que le cluster n'applique pas.

**F3 — Opérations longues en requête synchrone.** Le provisionnement attend `helm --wait` jusqu'à
six minutes dans le cycle HTTP. L'allocation globale boucle séquentiellement sur toute la flotte.
La vue agrégée interroge chaque tenant **sans délai d'expiration** et lance un `kubectl top` par
client à chaque rafraîchissement, sans cache ni disjoncteur : un seul tenant qui ne répond pas
suspend le tableau de bord entier.

**F4 — Un redémarrage global pour un ajout local.** Chaque provisionnement Docker redémarre le
Traefik partagé : créer le douzième client interrompt brièvement les onze autres.

---

## 6. Traçabilité — du constat à la décision d'architecture

C'est la section qui relie l'audit à ce qui suit. Chaque décision découle d'un constat mesuré,
et non d'une préférence.

| # | Constat | Décision d'architecture | Effet attendu |
| --- | --- | --- | --- |
| 1 | 9 constats sur 13 concernent le control plane, seul composant sans garde, sans test et hors analyse (§4.1) | **Le control plane devient un composant de premier rang** : garde globale par défaut, refus de démarrer sans secret fort, écoute en boucle locale, et couverture de tests au même niveau que les services métier | Supprime la classe entière plutôt que ses instances |
| 2 | ANO-004 : le correctif d'ANO-003 avait traité un chemin sur deux (§4.1) | **Toute correction d'injection s'accompagne d'une recherche de la classe de faille dans le composant**, et la validation d'entrée est posée à *chaque* frontière, pas à la première rencontrée | Évite la fausse clôture |
| 3 | ANO-011 : isolation réseau différente selon le forfait (§4.2) | **La posture de sécurité devient une propriété de la plateforme, pas du forfait.** Un réseau d'edge par client sur le chemin Docker, pour rejoindre le niveau que la NetworkPolicy assure déjà côté Kubernetes | Un client paie une capacité, pas un niveau de protection |
| 4 | ANO-012 : le contenu client est rendu en HTML brut (§4.2) | **Le contenu produit par un client est traité comme non fiable**, assaini au rendu — la plateforme reste responsable de la sécurité des sites qu'elle génère | Déplace la responsabilité du client vers le générateur |
| 5 | 30 Dockerfiles en `root`, 44 contextes de sécurité absents (§4.3) | **Le durcissement est porté par le socle**, pas par chaque service : utilisateur non privilégié, capacités retirées, racine en lecture seule, appliqués au template et au chart | Un service nouveau hérite du durcissement |
| 6 | Les images exigent un lockfile absent du dépôt ; l'audit varie du simple au double (§4.4) | **Un livrable doit être reconstructible à l'identique** : verrouillage des dépendances versionné, à la racine uniquement, l'exclusion des imbriqués étant conservée pour la cause d'origine | Deux clients au même forfait reçoivent le même logiciel |
| 7 | F1 à F4 : pas de compensation, registre divergent, opérations longues en synchrone (§5) | **Le provisionnement devient une opération asynchrone réconciliée** : file de travaux, compensation sur échec, état déclaré confronté à l'état réel, délais et disjoncteurs sur la supervision | Le tableau de bord cesse de pouvoir mentir |
| 8 | Aucun diagramme, aucun ADR, socle dupliqué 11 fois, inventaire obsolète (§4.5) | **La conception devient un livrable versionné** : diagrammes en source dans le dépôt, décisions tracées à la prise, socle technique extrait en bibliothèque partagée | La documentation vieillit avec le code, pas à côté |
| 9 | Accessibilité nulle, et le produit **génère** des sites pour des tiers (§4.6) | **La conformité est garantie par construction** : règles d'accessibilité dans les procédures de développement, et garde-fous dans les outils d'édition — champ alternatif obligatoire, contrôle de contraste dans l'éditeur de thème | Un client ne peut pas produire un site non conforme sans le savoir |
| 10 | Analyses statiques uniquement, aucun test dynamique, audit centré sur l'infrastructure (§1, §4.2) | **La campagne de sécurité couvre le produit livré**, avec un plan de tests écrit, un périmètre assumé et un test de non-régression par anomalie corrigée | Le registre devient une preuve exécutable |

---

## 7. Ce qui est déjà engagé

Deux branches portent les premières décisions, avec leurs chaînes d'intégration au vert :

| Branche | Dépôt | Contenu |
| --- | --- | --- |
| `securite/durcissement-control-plane` | `goosee-vitrine` | Décisions 1, 2 — gardes, secrets hors ligne de commande, registre des anomalies, artefacts archivés |
| `ci/analyses-securite` | `Goosee` | Chaîne d'analyses de sécurité, porte recentrée sur les gravités critiques |

Les décisions 3 à 10 sont réparties dans le plan d'actions de l'équipe.

---

## Annexe — commandes de contrôle

```bash
# Volume et inventaire
find templates -name "*.ts" -o -name "*.tsx" | grep -v node_modules | wc -l
ls templates/back/services

# Durcissement
grep -rn "USER \|HEALTHCHECK" --include="Dockerfile*" . | grep -v node_modules
grep -rn "securityContext\|runAsNonRoot" k8s/goosee-tenant/templates/
grep -rn "websecure\|certresolver\|acme" docker/tenant k8s

# Isolation réseau des tenants (ANO-011)
grep -n "networks:" -A4 docker/tenant/docker-compose.tenant.yml

# Conception
find . \( -name "*.puml" -o -name "*.drawio" -o -name "*.mmd" \) -not -path "*/node_modules/*"
grep -rl '```mermaid' --include="*.md" .

# Accessibilité
grep -rn "<html" templates/front/src/app
grep -rno "htmlFor=" --include="*.tsx" templates/front/src | wc -l
grep -rn "jsx-a11y" --include="*.mjs" --include="*.json" .

# Reproductibilité
grep -c "COPY package.json yarn.lock" $(find . -name "Dockerfile*" -not -path "*/node_modules/*")
git log --all --oneline --diff-filter=D -- yarn.lock

# La dette que ce document ferme
git log --all --diff-filter=A -- "**/audit.md" "audit.md"   # ne renvoie rien
```
