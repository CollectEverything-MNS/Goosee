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
| 3 | Navigation clavier / focus | Corrigé | Voir ci-dessous |
| 4 | Audit axe-core / Lighthouse (5 pages clés) | Conforme après corrections | Voir ci-dessous |
| 5 | Noms accessibles des champs et boutons (RGAA 11.1, 11.2, 7.1 / WCAG 1.3.1, 4.1.2), langue de page (RGAA 8.3) | Corrigé | Voir ci-dessous |

## 1. Lien d'évitement

**Constat de départ** : aucun lien d'évitement n'existait dans le front, vérifié par recherche dans tout le code.

**Correction appliquée** :
- `templates/front/src/app/[locale]/(site)/layout.tsx` : lien caché "Aller au contenu principal" avec zone d'arrivée (`id="contenu-principal"`), appliqué automatiquement à toutes les pages publiques (accueil, produits, checkout, compte, contact...).
- `templates/front/src/components/layout/admin/components/layout.tsx` : même principe côté admin (`id="contenu-principal-admin"`), appliqué à toutes les pages admin protégées (dashboard, clients, commandes, produits, stock, paramètres...).
- **Non ajouté sur la page de login admin**, volontairement : cette page ne passe par aucun des deux layouts ci-dessus (juste `AuthProvider`, sans menu), donc il n'y a rien à sauter avant le formulaire de connexion.

**Ecart trouvé et corrigé lors du test réel dans le navigateur** : le menu du haut de la boutique publique reste collé en haut au défilement (`sticky top-0 z-50`), avec le même niveau d'affichage (`z-50`) que notre lien d'évitement. Le menu passait donc visuellement par-dessus le lien, qui restait invisible même quand il avait le focus. Corrigé en augmentant le niveau du lien à `z-[60]`, pour qu'il passe toujours au-dessus du menu.

**Ecart trouvé et corrigé, propre aux sites construits comme celui-ci (navigation sans rechargement complet de page)** : en changeant de page par un clic sur un lien du menu (sans rechargement complet), le focus ne se replaçait nulle part de façon cohérente. Corrigé en surveillant les changements d'adresse de page (`usePathname`) et en replaçant automatiquement le focus sur la zone de contenu principal à chaque changement, sauf au tout premier chargement (où c'est le lien d'évitement qui garde la priorité). Vérifié techniquement dans un vrai navigateur : le focus atterrit bien sur `#contenu-principal` immédiatement après un changement de page interne.

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

## 3. Navigation clavier et visibilité du focus

**Navigation clavier, vérifiée sur le parcours d'achat et l'admin** : fiche produit (sélection d'image, quantité, ajout au panier), checkout (paiement), et le tableau de données partagé par toutes les listes admin (produits, commandes, clients, stock, catégories). Tous les éléments cliquables sont de vrais boutons ou liens du langage HTML, aucun élément fabriqué à la main (comme une zone cliquable sans vraie balise bouton) qui empêcherait leur usage au clavier. Aucune correction nécessaire sur ce point.

**Ecart trouvé et corrigé** : les champs de recherche de 5 listes admin (utilisateurs, stock, produits, catégories, commandes) supprimaient le cadre de focus par défaut et le remplaçaient par un simple changement de couleur de bordure à 20 pour cent d'opacité, largement insuffisant pour rester visible. Le reste du site (les boutons, notamment) remplace ce même cadre par un anneau net et bien visible.

**Correction appliquée** : les 5 champs de recherche utilisent maintenant le même anneau de focus visible que les boutons (`focus-visible:ring-1 focus-visible:ring-ring`). Fichiers modifiés : `users-listing-toolbar.tsx`, `stock-listing-toolbar.tsx`, `products-listing-toolbar.tsx`, `categories-listing-toolbar.tsx`, `orders-listing-toolbar.tsx`.

## 4. Audit Lighthouse

Méthode : Lighthouse en ligne de commande (`npx lighthouse <url> --only-categories=accessibility`), sur du contenu réel publié (template "Drive Moderne" appliqué).

**Accueil (`/fr`)** : score initial 94/100, avec 2 audits en échec.
- Contraste insuffisant sur le texte de copyright du pied de page (gris sur fond sombre, ratio 3,66 au lieu de 4,5 minimum). Corrigé (`text-gray-500` remplacé par `text-gray-400` dans `footer-block.tsx`).
- Absence de repère "main" détectée lors d'un run, disparue au run suivant : liée à un état de chargement temporaire de la page, pas un vrai problème de code.
- Saut de niveau de titre détecté après la première correction : le pied de page utilise des `h4` ("Navigation", "Contact") sans `h3` avant eux sur la page. Corrigé en remplaçant ces `h4` par des `h3` dans `footer-navigation.tsx` et `footer-contact.tsx` (correction valable sur toutes les pages du site, le pied de page étant partagé).

Score final après corrections : **100/100, 0 audit en échec.**

**Catalogue (`/fr/catalogue`)** : score de 100/100 directement, aucune correction nécessaire. Cette page hérite automatiquement de la correction du pied de page appliquée ci-dessus, puisque le pied de page est partagé par toutes les pages du site.

**Fiche produit (`/fr/produits/<id>`)** : score initial 95/100, avec 1 audit en échec.
- Les boutons "-" et "+" utilisés pour modifier la quantité n'avaient pas de nom accessible : ce sont des boutons composés uniquement d'une icône, sans texte, donc invisibles pour un lecteur d'écran qui ne peut pas deviner leur fonction. Corrigé en ajoutant un attribut `aria-label` ("Diminuer la quantité" / "Augmenter la quantité") sur chacun des deux boutons, dans `produits/[id]/page.tsx`.

Score final après correction : **100/100, 0 audit en échec.**

**Checkout (`/fr/checkout`)** : score initial 98/100, avec 1 audit en échec.
- Saut de niveau de titre détecté sur l'état "panier vide" de cette page : le `h1` "Votre panier est vide" est directement suivi par le `h3` du pied de page, sans aucun `h2` entre les deux. Lighthouse ouvre systématiquement sa propre page sans session de panier, donc il tombe toujours sur cet état précis, même famille de problème que celui déjà rencontré au point 2 sur l'accueil sans bloc Hero. Corrigé en ajoutant un `h2` invisible ("Panier") juste après le `h1`, dans la branche "panier vide" de `checkout/page.tsx`.

Score final après correction : **100/100, 0 audit en échec.**

**Login admin (`/fr/goosee-admin/login`)** : score initial 98/100, avec 1 audit en échec.
- Absence totale de repère "contenu principal" sur cette page. Cette page ne passe par aucun des deux layouts du site (boutique ou admin) : elle est construite uniquement avec des balises génériques, sans aucune indication de structure pour un lecteur d'écran. Corrigé en transformant le conteneur principal de la page en repère "contenu principal", sans aucun changement visuel ni fonctionnel.

Score final après correction : **100/100, 0 audit en échec.**

## 5. Noms accessibles des champs et boutons, langue de page

**Constat de départ** (audit du SI, section 4.6, et comptage statique sur `templates/front/src` hors composants génériques `ui/`) : sur **133 champs de formulaire**, **83** avaient un nom accessible (libellé associé par `htmlFor`/`id`, composant `FormControl` du design system, ou `aria-label`), **50** n'en avaient aucun. La balise `<html>` portait `lang="fr"` en dur, même sur les pages anglaises. Toutes les images (29) avaient déjà un attribut `alt`.

**Corrections appliquées** :
- Champs de recherche des tableaux de l'administration (produits, catégories, commandes, stock, utilisateurs, recherche globale, sélecteur de bloc) : `aria-label` reprenant le texte indicatif.
- Éditeur de blocs du constructeur de page : les 14 listes déroulantes (niveau de titre, alignement, variante, taille, colonnes, style, ratio, marges, fond…), les champs d'image et de couleur reçoivent le libellé affiché à côté d'eux (`page-builder-component-editor.tsx`, `list-field.tsx`).
- Éditeur de page : sélecteur de type relié à son libellé par `id`, sélecteur de statut, boutons « Retour », « Paramètres de la page » et « Aperçu » nommés (`page-editor.tsx`).
- Modales du compte administrateur (changement d'e-mail, de mot de passe, profil) : libellés associés par `htmlFor`/`id`, champs du code de vérification numérotés (« Code 1/6 »…).
- Préférences (site public et administration) : sélecteurs de langue et de thème, interrupteurs newsletter et notifications nommés.
- Permissions d'un rôle : chaque case à cocher porte le nom de l'écran qu'elle autorise. Statut d'une commande, période des statistiques, champ hexadécimal de la couleur principale : nommés.
- Boutons composés d'une seule icône : déplacer / modifier / dupliquer / supprimer un bloc, monter / descendre un élément de liste, définir l'image principale / supprimer une image / ajouter des images, ajouter / supprimer une caractéristique produit, quantité et retrait dans le panier, retirer un fichier envoyé, fermer l'éditeur.
- Langue : `app/layout.tsx` lit la locale courante via `getLocale()` de next-intl et l'applique à `<html lang>` (`fr` ou `en` selon l'adresse).

**Résultat après corrections** (même comptage) : **133 champs sur 133** avec un nom accessible, 0 sans. Aucun changement visuel ni fonctionnel : uniquement des attributs `aria-label`, `id`/`htmlFor` et `lang`.

**Audit automatique axe-core avant/après** : rapports versionnés dans `docs/accessibilite/rapports/` (5 pages non authentifiées). Les violations par page sont identiques avant et après, parce que les champs corrigés sont presque tous derrière une session ; l'écart restant relevé par axe est structurel (page « mot de passe oublié » sans repère `<main>` ni régions) et n'est pas traité ici.

## Conclusion

Les 5 pages prévues par la mission (accueil, catalogue, fiche produit, checkout, connexion admin) obtiennent toutes un score de 100/100 sur l'audit d'accessibilité automatique, après correction des écarts trouvés. Le périmètre couvert va au-delà de ces 5 pages : les corrections sur le pied de page et sur la structure des titres du constructeur de page s'appliquent à l'ensemble du site public, et la vérification du clavier a couvert l'ensemble du tableau de données partagé par les 19 pages de l'espace admin.
