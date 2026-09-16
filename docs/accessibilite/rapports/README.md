# Rapports d'audit automatique d'accessibilité (axe-core)

Rapports versionnés pour le critère « conformité aux standards WAI » (bloc 4). Les fichiers JSON sont une version compactée de la sortie de `@axe-core/cli` : pour chaque page, le nombre de règles passées, les règles non conclusives et le détail de chaque violation (règle, impact, éléments concernés).

## Campagne du 16 septembre 2026

- **Commande** : `npx @axe-core/cli --chromedriver-path <chromedriver 152> <urls> --save <fichier>` (axe-core 4.x, Chrome 152, WCAG 2.x niveau AA par défaut).
- **Avant** (`2026-09-16-axe-avant.json`) : code de `develop` (f6b8ae4), front sur http://localhost:3000.
- **Après** (`2026-09-16-axe-apres.json`) : branche `feat/a11y-formulaires`, front sur http://localhost:3100, même API.
- **Pages auditées** (non authentifiées) : accueil `/fr`, contact `/fr/contact`, checkout `/fr/checkout`, connexion admin `/fr/goosee-admin/login`, mot de passe oublié `/fr/goosee-admin/forgot-password`.

| Page | Violations avant | Violations après | Détail |
|---|---|---|---|
| `/fr` | 2 | 2 | `landmark-one-main`, `page-has-heading-one` |
| `/fr/contact` | 2 | 2 | `landmark-one-main`, `page-has-heading-one` |
| `/fr/checkout` | 0 | 0 | — |
| `/fr/goosee-admin/login` | 0 | 0 | — |
| `/fr/goosee-admin/forgot-password` | 4 | 4 | `landmark-one-main`, `region` ×3 |

## Lecture des résultats

- Les corrections de cette branche portent sur les **noms accessibles des champs et boutons** (133 champs sur 133 avec libellé, contre 83 avant ; boutons icône nommés). Ces champs se trouvent presque tous dans l'administration authentifiée et dans « Mon compte », que l'audit automatique non authentifié ne parcourt pas : les chiffres par page ci-dessus sont donc identiques avant/après, et la preuve du gain est le comptage statique (`docs/accessibilite-rgaa4.md`, section 5).
- Les violations restantes sur `/fr` et `/fr/contact` correspondent à l'état de chargement : le contenu de ces pages est chargé côté client et axe capture le DOM avant l'apparition du `<main>` et du `h1` (les deux sont bien présents une fois la page chargée, voir la section 4 du même document). La page « mot de passe oublié » n'est encadrée par aucun layout et n'a ni `<main>` ni régions : écart réel, à corriger.
- Périmètre non audité automatiquement : les 19 écrans de l'administration (nécessitent une session) et le dépôt `goosee-vitrine`.
