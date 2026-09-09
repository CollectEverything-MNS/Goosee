# Audit d'accessibilité RGAA 4 / WAI Goosee

Audit d'accessibilité mené sur le dépôt Goosee, dans le cadre du lot accessibilité RGAA 4 / WAI (bloc 4).

## Périmètre

- **Dépôt audité** : `Goosee` (ce dépôt), site public (`(site)/`) et espace admin (`goosee-admin/`).
- **Hors périmètre** : le dépôt séparé `goosee-vitrine` (site public d'abonnement et espace superadmin), à auditer séparément par l'équipe.
- **Pages échantillon citées dans la tâche** : accueil, liste produits, fiche produit, checkout, login admin. Vérification élargie ponctuellement à d'autres pages quand c'était pertinent (les 19 pages admin, la page contact).

## Grille de conformité

| # | Critère | Statut | Détail |
|---|---|---|---|
| 1 | Lien d'évitement (RGAA 12.7 / WCAG 2.4.1) | Corrigé | Voir ci-dessous |
| 2 | Hiérarchie des titres (h1 unique, sans saut) | Conforme après corrections | Voir ci-dessous |
| 3 | Navigation clavier / focus | Pas encore audité | |
| 4 | Audit axe-core / Lighthouse (5 pages clés) | Pas encore fait | |

## 1. Lien d'évitement

**Constat de départ** : aucun lien d'évitement n'existait dans le front, vérifié par recherche dans tout le code.

**Correction appliquée** :
- `templates/front/src/app/[locale]/(site)/layout.tsx` : lien caché "Aller au contenu principal" avec zone d'arrivée (`id="contenu-principal"`), appliqué automatiquement à toutes les pages publiques (accueil, produits, checkout, compte, contact...).
- `templates/front/src/components/layout/admin/components/layout.tsx` : même principe côté admin (`id="contenu-principal-admin"`), appliqué à toutes les pages admin protégées (dashboard, clients, commandes, produits, stock, paramètres...).
- **Non ajouté sur la page de login admin**, volontairement : cette page ne passe par aucun des deux layouts ci-dessus (juste `AuthProvider`, sans menu), donc il n'y a rien à sauter avant le formulaire de connexion.

## 2. Hiérarchie des titres

**Pages avec titre écrit en dur, vérifiées individuellement, toutes conformes** (un seul `h1`, pas de saut de niveau) :
- Checkout (`(site)/checkout/page.tsx`) et sa page de succès.
- Fiche produit (`(site)/produits/[id]/page.tsx`) : `h1` puis `h2` puis `h3` (produits suggérés), cohérent.
- Compte (`(site)/compte/page.tsx`) : un seul `h1` selon l'état connecté ou non connecté, jamais les deux en même temps.
- Login admin (`components/login-form.tsx`) : un seul `h1`.
- Les 19 pages admin protégées (dashboard, clients, commandes, produits, stock, paramètres, rôles, logs, etc.) : toutes utilisent un composant partagé `AdminTitle` avec `size="h1"`, exactement une fois par page, cohérent sur l'ensemble de l'admin.

**Ecart trouvé et corrigé** : dans le constructeur de page (page-builder), le bloc "Titre" (`HeadingBlock`) proposait "h1" comme choix libre dans sa liste déroulante, en plus du bloc "Hero" qui affiche déjà systématiquement un `h1`. Un admin combinant les deux avec "h1" sur le bloc Titre créait deux `h1` sur la même page. Corrigé : l'option "h1" a été retirée de la liste déroulante (`page-builder-component-editor.tsx`). Le "h1" reste réservé au bloc Hero ou au titre de la page elle-même.

**Deuxième écart trouvé et corrigé** : à l'inverse, si un admin supprime le bloc Hero d'une page (celui qui contient le seul `h1` garanti), la page se retrouve sans aucun `h1`. C'était notamment le cas de la page contact en l'absence de contenu publié, qui affichait un bloc de secours (`ContactBlock`) sans aucun titre.

**Correction appliquée** : chaque page construite dynamiquement (accueil, pages personnalisées, contact) vérifie désormais si elle contient un bloc Hero. Si non, un `h1` de secours (invisible visuellement, lu par un lecteur d'écran) est ajouté automatiquement avec le titre de la page. Fichiers modifiés : `(site)/page.tsx`, `(site)/[slug]/page.tsx`, `(site)/contact/page.tsx`. Résultat : chaque page a garanti exactement un `h1`, sans doublon et sans absence, peu importe les blocs ajoutés ou supprimés.

**Troisième écart trouvé et corrigé** : même en évitant les deux problèmes ci-dessus, un admin pouvait encore choisir un niveau qui saute une étape pour le bloc Titre (par exemple "h4" directement après un "h2", sans "h3" entre les deux).

**Correction appliquée** : le sélecteur de niveau du bloc Titre calcule maintenant le niveau le plus profond déjà utilisé par les blocs placés avant lui sur la page (chaque type de bloc a un niveau de base connu : Hero = h1, Produits vedettes et Avis clients descendent jusqu'à h3, etc.), et ne propose que les niveaux suivants valides, sans saut possible. Fichiers modifiés : `page-builder-component-editor.tsx` (calcul et filtrage), `page-builder.tsx` et `page-builder-stack.tsx` (transmission de la liste complète des blocs de la page à l'éditeur).

## Prochaines étapes

3. Vérifier la navigation clavier et la visibilité du focus sur le parcours d'achat et l'admin.
4. Passer axe-core / Lighthouse sur les 5 pages clés, une fois du contenu réel publié.
5. Compléter ce document avec les résultats des points 3 et 4.
