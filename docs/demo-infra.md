# Démonstration infra POC

## Lancer

Prérequis : Docker Desktop démarré, Node.js, Corepack/Yarn, k3d, Helm et kubectl.
Le dépôt `goosee-vitrine` doit être voisin de `Goosee`, avec son `.env` configuré.
Les ports 80, 3100, 3102, 4000, 6445, 8081, 8090, 9090 et 9093 doivent être disponibles.
Le port PostgreSQL de la vitrine dépend de son `.env`.

```powershell
node scripts/presentation.js --preflight
yarn presentation
```

Le lancement construit les images une par une dans un builder plafonné à **2 CPU et
4 Go**, démarre la vitrine, un tenant Docker et un tenant Kubernetes, puis charge
quatre produits et trois commandes payées par le prestataire simulé. Le serveur
k3d est plafonné à 2 CPU et 5 Gio ; Next.js utilise un worker pour les builds.
Ces limites ne sont pas un plafond global pour Docker Desktop et la vitrine.
Les noms des bases de la vitrine sont lus dans son `.env`.

Les paiements de cette présentation sont **simulés**, sans appel à Stripe.
Les alertes restent visibles localement ; aucun message Discord n'est envoyé.
Gemini est activé : la clé `GEMINI_API_KEY` et le modèle `GEMINI_MODEL` sont lus dans
`env/.env.dev`. Le lancement échoue clairement si la clé manque. Pour une répétition
volontairement sans chatbot, définir `PRESENTATION_ASSISTANT=0`.

## Accès

| Écran | URL | Compte / mot de passe de démonstration |
|---|---|---|
| Vitrine | http://localhost:3100/fr | alice@goosee.dev / Demo#2026 |
| Superadmin | http://localhost:3100/fr/superadmin | superadmin@goosee.dev / Superadmin#2026 |
| Boutique Docker | http://atelier-alice.127.0.0.1.nip.io/fr | alice@goosee.dev / Demo#2026 |
| Boutique Kubernetes | http://mode-bob.127.0.0.1.nip.io:8081/fr | bob@goosee.dev / Demo#2026 |
| Prometheus | http://localhost:9090 | aucun |
| Alertmanager | http://localhost:9093 | aucun |

Administration des boutiques : ajouter `/fr/goosee-admin` au domaine du site.

## Répéter sans reconstruire

```powershell
node scripts/presentation.js --skip-build
node scripts/check-demo.js --chatbot
```

Ne pas utiliser `--skip-build` après une modification du code applicatif.
Le seed retrouve les produits et commandes de démonstration existants. Les secrets
restent dans `docker/tenant/envs/` (ignoré par Git) : conserver ces fichiers avec les volumes.

Pour tester seulement les tenants sans démarrer la vitrine :

```powershell
node scripts/presentation.js --tenants-only --skip-build
```

Pour une passe Docker seule, définir `$env:PRESENTATION_K8S_COUNT='0'` ; remettre
`'1'` pour la répétition complète. Les options équivalentes existent pour Docker
avec `PRESENTATION_DOCKER_COUNT`. La configuration de référence est 1 + 1.

## Scénario à présenter

1. Ouvrir la vitrine et la liste des sites d'Alice/Bob.
2. Ouvrir chaque boutique, ses produits puis son administration.
3. Montrer les commandes payées et les stocks ; consulter les tickets.
   Poser au chatbot une question du guide, par exemple « Comment ajouter un produit ? ».
4. Montrer les pods Kubernetes et leurs métriques, puis les cibles UP de Prometheus.
5. Relancer la présentation avec `--skip-build` et vérifier les mêmes données.

Le script `check-demo.js` contrôle les réponses HTTP du front/admin, la connexion,
le catalogue, les stocks, les tickets, l'ajout/retrait au panier, les commandes payées
et les cibles Prometheus. Il ne remplace pas la vérification visuelle du navigateur.
Le provisioning d'un nouveau client en direct est un scénario distinct de cette
répétition centrée sur les deux sites préchargés.

## Diagnostic et arrêt

```powershell
docker compose -p tenant-atelier-alice --env-file docker/tenant/envs/atelier-alice.env -f docker/tenant/docker-compose.tenant.yml ps
docker compose -p tenant-atelier-alice --env-file docker/tenant/envs/atelier-alice.env -f docker/tenant/docker-compose.tenant.yml logs --tail 50
kubectl --context k3d-goosee get pods,hpa -n tenant-mode-bob
kubectl --context k3d-goosee top pods -n tenant-mode-bob
yarn presentation:down
```

L'arrêt conserve les volumes Docker et les données du cluster. Il laisse la vitrine
disponible ; ses logs sont dans `goosee-vitrine/.presentation-logs/`. La relance
réutilise les processus déjà à l'écoute pour éviter des doublons.

## Résultats de répétition

La passe complète de tests unitaires, intégration, E2E et charge légère est consignée
dans [validation-poc-tests.md](validation-poc-tests.md).

Validé le 17 septembre 2026 :

- Construction des 14 images ; lint Helm et rendu avec/sans assistant ; configuration Compose.
- Trois tests du rôle OWNER réussis avec un seul worker.
- Front/admin, connexion, catalogue, stock, tickets, panier et commandes payées sur les deux sites.
- Vraies réponses Gemini sur Docker et Kubernetes (option `--chatbot` du contrôle).
- Achat Docker au navigateur jusqu'au succès du paiement simulé ; connexion admin.
- Connexion vitrine et « Mes sites » au navigateur ; API superadmin et KPI disponibles.
- Prometheus UP et métriques des pods accessibles.
- Arrêt/relance : identifiants des produits et commandes conservés, sans doublon.

Les mises à jour des pods ne créent aucun pod supplémentaire pendant leur remplacement ;
une interruption courte est possible. La charge légère est validée (deux utilisateurs) ;
la saturation, l'autoscaling et le provisioning d'un troisième site en direct ne sont pas testés.
Voir aussi le [plan réalisé](plan-demo-infra.md).
