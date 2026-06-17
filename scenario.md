# Scénario de présentation — Goosee

Démo de bout en bout de l'écosystème : **vitrine** (portail + superadmin) → **provisioning**
(control plane) → **sites générés** isolés (Docker ou Kubernetes) → **supervision** temps réel.

Tout se lance avec **`yarn presentation`** (repo `Goosee`) : plateforme (Traefik + Prometheus),
cluster k3d, portail vitrine (api + orchestrateur + web) et les données des 3 scénarios.
Démontage : `yarn presentation:down`.

> Pas de serveur mail : les e-mails (identifiants, confirmations) sont **simulés et affichés
> dans un toast** côté vitrine. Tous les mots de passe sont en clair ci-dessous pour une démo
> fluide.

## URLs

| Élément | URL |
|---|---|
| Vitrine (portail + superadmin) | http://localhost:3000 |
| API portail | http://localhost:3002 · Orchestrateur : http://localhost:4000 |
| Prometheus | http://localhost:9090 |
| Site généré (Docker) | `http://<slug>.127.0.0.1.nip.io` |
| Site généré (K8s) | `http://<slug>.127.0.0.1.nip.io:8081` |
| Admin d'un site généré | `<url du site>/fr/goosee-admin` |

## Comptes (mots de passe en clair)

Le **même e-mail/mot de passe** sert pour le portail vitrine **et** pour l'admin du site
généré correspondant (le propriétaire du site = le compte vitrine).

| Compte | Vitrine (portail) | Mot de passe | Sites possédés |
|---|---|---|---|
| **Superadmin** | `superadmin@goosee.dev` | `Superadmin#2026` | — (supervise tous les tenants) |
| **Alice** (scénario 1) | `alice@goosee.dev` | `Demo#2026` | 1 site **Docker** (`atelier-alice`), pré-rempli |
| **Bob** (scénario 2) | `bob@goosee.dev` | `Demo#2026` | 5 sites : 1 Docker (`resto-bob`) + 4 **K8s** (`mode-bob`, `tech-bob`, `deco-bob`, `sport-bob`), pré-remplis |
| **Charlie** (scénario 3) | _créé en live_ | `Demo#2026` | crée son site pendant la démo (vide) |

Les sites d'Alice et Bob ont déjà **clients, produits et commandes** (KPI/CA non nuls). Le
site créé par Charlie démarre **vide**.

> **Scale-to-zero** : les sites pré-provisionnés sont déployés, peuplés, puis **arrêtés** pour
> tenir sur une seule machine. Ils apparaissent dans le superadmin ; on **démarre** celui
> qu'on veut montrer juste avant (bouton « Démarrer » dans le superadmin, ou
> `docker compose -p tenant-<slug> start` / `kubectl scale ... --replicas=1`).

## Scénario 1 — Client avec un seul site (Docker)

1. **Vitrine** http://localhost:3000 → se connecter avec `alice@goosee.dev` / `Demo#2026`.
2. Aller dans **« Mes sites »** : Alice voit son site `atelier-alice` (statut, forfait, infra).
3. Cliquer **« Administrer »** → redirection vers `http://atelier-alice.127.0.0.1.nip.io/fr/goosee-admin`.
4. Se connecter à l'admin du site (`alice@goosee.dev` / `Demo#2026`) → tableau de bord,
   **commandes**, **analytics** (CA, top ventes) déjà peuplés.
5. Côté **storefront** (`http://atelier-alice.127.0.0.1.nip.io`) : parcourir le catalogue,
   ajouter au panier, passer une commande (paiement Stripe test : carte `4242 4242 4242 4242`).

## Scénario 2 — Client multi-sites (1 Docker + 4 K8s) + supervision superadmin

1. **Vitrine** → `bob@goosee.dev` / `Demo#2026` → **« Mes sites »** : 5 sites listés
   (badges Docker/K8s + statut).
2. Démarrer un ou deux sites (scale-to-zero) puis **« Administrer »** l'un d'eux.
3. **Superadmin** : se connecter `superadmin@goosee.dev` / `Superadmin#2026` → `/fr/superadmin`.
   - Vue d'ensemble de **tous** les tenants (Alice + Bob).
   - Par tenant : **KPI métier** (CA, commandes, clients), **infra live** (CPU/mémoire/pods),
     **allocation** (CPU/mémoire/replicas) et **recommandation intelligente** applicable en 1 clic.
   - **Prometheus** http://localhost:9090 + `kubectl get hpa -A` : montée en charge auto des sites K8s.

## Scénario 3 — Nouveau client (live, site vide)

1. **Vitrine** → **S'inscrire** : `charlie@goosee.dev` / `Demo#2026`.
   - Un **toast** simule l'e-mail de bienvenue.
2. Choisir un forfait, renseigner le nom/sous-domaine du site, lancer la **création**.
   - Le control plane provisionne le site ; un **toast** simule l'e-mail contenant les
     identifiants OWNER du site (affichés en clair).
3. **« Mes sites »** → le nouveau site apparaît `PROVISIONING` puis `ACTIVE` → **« Administrer »**.
4. L'admin du site est **vide** (aucune commande, catalogue à créer) — contraste avec Alice/Bob.
5. (Superadmin) : le nouveau tenant apparaît dans la supervision avec des KPI à zéro.

## Démontage

```bash
yarn presentation:down     # arrête tenants + plateforme (cluster k3d conservé)
```

## Récapitulatif technique des liaisons

```
web (vitrine, :3000) → api (:3002) → orchestrator (:4000)
                                          ├─ Docker : docker compose -p tenant-<slug> (+ route Traefik)
                                          └─ K8s    : helm install -n tenant-<slug> (ingress k3s :8081)
superadmin → api /superadmin/* → orchestrator /tenants/* (registre, KPI, infra, allocation)
Projet vitrine (projects.instanceUrl) ⇄ Tenant control plane (tenants.slug) — référence par UUID
```
