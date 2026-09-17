# Essais de reprise sur la démonstration locale

Cette annexe concerne uniquement la répétition sur k3d/Docker Desktop.
La référence de production est [Résilience et reprise](resilience-reprise.md).
Ces essais sont à exécuter et ne constituent pas une validation de production.

## Procédure légère de vérification

Exécuter les étapes **successivement**, sur le tenant de démonstration Mode Bob,
sans charge k6 ni reconstruction d'images. Garder un seul onglet de navigateur.
Les délais de 180 secondes ci-dessous bornent l'attente de la commande ; ils ne
constituent pas un engagement de reprise.

### 1. Relever l'état initial

```powershell
kubectl --context k3d-goosee get pods,pvc -n tenant-mode-bob
kubectl --context k3d-goosee get deployment product -n tenant-mode-bob
```

Vérifier que les pods sont prêts et les PVC liés. Dans la boutique et son
administration, noter l'identifiant, le nom et le prix d'un produit existant,
ainsi qu'une commande existante et son statut. Ne pas lancer de nouvel achat
pendant l'essai. Accès et comptes : [guide de démonstration](../demo-infra.md).

### 2. Remplacer un pod applicatif

```powershell
$productPods = kubectl --context k3d-goosee get pods -n tenant-mode-bob -l app.kubernetes.io/name=product -o json | ConvertFrom-Json
$productPod = $productPods.items | Select-Object -First 1
if (-not $productPod) { throw 'Aucun pod product trouvé' }
kubectl --context k3d-goosee delete pod $productPod.metadata.name -n tenant-mode-bob
kubectl --context k3d-goosee rollout status deployment/product -n tenant-mode-bob --timeout=180s
kubectl --context k3d-goosee get pods -n tenant-mode-bob -l app.kubernetes.io/name=product
```

Confirmer le remplacement du pod, puis ouvrir le catalogue et le produit témoin.
Noter la durée d'indisponibilité observée, ou l'absence de coupure visible.
Ce test démontre la recréation du pod ; il ne teste pas le déclenchement d'une
sonde de vie sur une application bloquée.

### 3. Redémarrer la base produits en conservant le PVC

```powershell
kubectl --context k3d-goosee delete pod product-db-0 -n tenant-mode-bob
kubectl --context k3d-goosee wait --for=condition=Ready pod/product-db-0 -n tenant-mode-bob --timeout=180s
kubectl --context k3d-goosee get pods,pvc -n tenant-mode-bob
```

Si le pod n'est pas encore recréé lorsque `wait` démarre, vérifier son apparition
avec `get pods`, puis relancer l'attente. Ne supprimer ni PVC, ni namespace,
ni cluster. Relire le produit témoin : identifiant, nom et prix doivent être
identiques. Vérifier aussi le retour du catalogue et de la commande témoin.
Ne pas lancer le seed entre les relevés : il pourrait masquer une perte de données.

### 4. Si la reprise échoue

```powershell
kubectl --context k3d-goosee get events -n tenant-mode-bob --sort-by=.lastTimestamp
kubectl --context k3d-goosee logs deployment/product -n tenant-mode-bob --tail=80
kubectl --context k3d-goosee logs pod/product-db-0 -n tenant-mode-bob --tail=80
kubectl --context k3d-goosee describe pod product-db-0 -n tenant-mode-bob
```

Chercher un manque de mémoire, une image absente, un PVC non monté ou un échec
de connexion. Si la base est prête mais le service ne se reconnecte pas, un
`kubectl --context k3d-goosee rollout restart deployment/product -n tenant-mode-bob`
est une reprise manuelle possible. La consigner comme telle, puis vérifier de
nouveau la disponibilité et les données. Éviter les redémarrages globaux répétés.

### 5. Après arrêt de Docker Desktop ou du PC

Redémarrer Docker Desktop et attendre sa disponibilité. Si le cluster existe mais
est arrêté, utiliser `k3d cluster start goosee`. Vérifier les pods avant de relancer
les contrôles du [guide de démonstration](../demo-infra.md). Un service Compose
explicitement arrêté peut nécessiter une relance manuelle.

La commande de présentation avec `--skip-build` peut remettre la démo en route,
mais elle exécute aussi le seed : elle ne prouve pas la conservation des données.
Après perte du stockage, le seed permet seulement de recréer des exemples ; les
données antérieures ne sont pas récupérées par ce mécanisme.

## Consigner le résultat

Ajouter à la [validation POC](../validation-poc-tests.md) la date, le commit,
le scénario, le délai observé, les données comparées et toute intervention manuelle.
Ne marquer un scénario réussi qu'après vérification applicative et des données.

| Scénario | État à la rédaction |
| --- | --- |
| Remplacement du pod product | À exécuter |
| Redémarrage de product-db avec conservation des données | À exécuter |
| Reprise après arrêt du PC | Non validée dans cette passe |
| Restauration après perte du disque | Non couverte |

