# Guide utilisateur

Ce guide explique comment utiliser un site créé avec Goosee, du côté des clients (la boutique publique) comme du côté de l'équipe qui gère le site (l'espace d'administration). Chaque section est autoportante : vous pouvez la lire seule pour répondre à une question précise.

## Sommaire

- [Partie 1 : utiliser le site en tant que client](#partie-1--utiliser-le-site-en-tant-que-client)
  - [L'en-tête et le pied de page](#len-tête-et-le-pied-de-page)
  - [La page d'accueil et les autres pages](#la-page-daccueil-et-les-autres-pages)
  - [Le catalogue et les produits mis en avant](#le-catalogue-et-les-produits-mis-en-avant)
  - [La fiche produit](#la-fiche-produit)
  - [Créer un compte client, se connecter, mot de passe oublié](#créer-un-compte-client-se-connecter-mot-de-passe-oublié)
  - [Le panier](#le-panier)
  - [Passer une commande et payer](#passer-une-commande-et-payer)
  - [Mon compte](#mon-compte)
  - [La page Contact](#la-page-contact)
- [Partie 2 : administrer le site](#partie-2--administrer-le-site)
  - [Se connecter à l'administration](#se-connecter-à-ladministration)
  - [Mot de passe oublié (administration)](#mot-de-passe-oublié-administration)
  - [Se repérer dans l'administration](#se-repérer-dans-ladministration)
  - [La recherche rapide](#la-recherche-rapide)
  - [Mon compte administrateur et le support](#mon-compte-administrateur-et-le-support)
  - [Droits d'accès : rôles et permissions](#droits-daccès--rôles-et-permissions)
  - [Tableau de bord](#tableau-de-bord)
  - [Statistiques](#statistiques)
  - [Produits](#produits)
  - [Catégories](#catégories)
  - [Stock](#stock)
  - [Commandes](#commandes)
  - [Caisse](#caisse)
  - [Historique des ventes](#historique-des-ventes)
  - [Clients](#clients)
  - [Retour clients](#retour-clients)
  - [Utilisateurs (équipe d'administration)](#utilisateurs-équipe-dadministration)
  - [Rôles](#rôles)
  - [Journal (Logs)](#journal-logs)
  - [Pages](#pages)
  - [L'éditeur de page et les blocs](#léditeur-de-page-et-les-blocs)
  - [Templates (modèles de site)](#templates-modèles-de-site)
  - [Menu](#menu)
  - [Paramètres du site](#paramètres-du-site)
  - [L'assistant IA](#lassistant-ia)
- [Questions fréquentes](#questions-fréquentes)
- [Ce que l'administration ne permet pas encore](#ce-que-ladministration-ne-permet-pas-encore)

---

## Partie 1 : utiliser le site en tant que client

### L'en-tête et le pied de page

L'en-tête est présent sur toutes les pages du site. De gauche à droite, il contient :

- le logo et le nom du site (un clic ramène à l'accueil) ;
- le menu de navigation, dont les liens sont définis par l'équipe du site (voir la section « Menu » de la partie 2). Un lien peut avoir des sous-liens, qui apparaissent au survol ;
- le bouton « Connexion » si vous n'êtes pas connecté, ou votre avatar (vos initiales) si vous l'êtes. L'avatar ouvre un petit menu : « Mon profil », « Mes commandes », « Déconnexion » ;
- l'icône du panier, avec une pastille indiquant le nombre d'articles qu'il contient. Un clic ouvre le panier sur le côté de l'écran.

Sur téléphone, le menu, le compte et le panier sont regroupés dans un menu latéral accessible par le bouton en haut à droite.

Le pied de page reprend le logo, la navigation et les coordonnées de contact du site, avec la mention de copyright de l'année en cours.

### La page d'accueil et les autres pages

Les pages du site (accueil, catalogue, à propos, contact, etc.) sont entièrement construites par l'équipe du site à partir de blocs (grand visuel d'accueil, texte, images, produits mis en avant, témoignages, bannière promotionnelle, avantages, formulaire de contact…). Leur contenu varie donc d'un site à l'autre.

Seules les pages **publiées** sont visibles. Une page encore en brouillon renvoie une page « introuvable ». Si aucune page d'accueil n'est publiée, le site affiche le message « Aucune page d'accueil publiée ».

### Le catalogue et les produits mis en avant

Il n'y a pas de page catalogue figée : les produits sont affichés par des blocs « Produits vedettes » placés sur les pages par l'équipe du site (en général sur la page d'accueil et sur une page « Catalogue »). Chaque bloc affiche les vrais produits du catalogue, éventuellement limités à une catégorie, triés et limités en nombre.

Chaque produit est présenté sous forme de carte avec sa photo principale, son nom et son prix. Un produit indisponible ou dont le stock est à zéro porte la mention « Épuisé » et ne peut pas être ajouté au panier. Un bouton d'ajout rapide permet d'ajouter le produit au panier (une unité) sans quitter la page ; un clic sur la carte ouvre la fiche produit.

### La fiche produit

La fiche produit affiche :

- la galerie de photos (la photo principale en grand, les autres en miniatures cliquables) ;
- un badge « En stock » ou « Indisponible », et les étiquettes (tags) associées au produit ;
- le nom, le prix et la description ;
- les caractéristiques renseignées par le vendeur (par exemple « Poids : 250 g » ou « Allergènes : gluten ») ;
- un sélecteur de quantité (boutons − et +) et le bouton « Ajouter au panier ». Ajouter un produit ouvre automatiquement le panier ;
- l'alerte « Plus que X en stock ! » lorsqu'il reste 5 unités ou moins ;
- des produits similaires (de la même catégorie) en bas de page.

Un produit qui n'existe plus affiche « Produit introuvable » avec un bouton de retour à l'accueil.

### Créer un compte client, se connecter, mot de passe oublié

Le bouton « Connexion » de l'en-tête ouvre une fenêtre « Mon compte » avec deux onglets.

**Onglet Connexion**

1. Saisissez votre e-mail et votre mot de passe (l'icône en forme d'œil permet de l'afficher).
2. Cliquez sur « Se connecter ». En cas d'erreur, le message « Identifiants incorrects » s'affiche.

**Onglet Inscription**

1. Saisissez votre prénom, votre nom, votre e-mail, puis un mot de passe et sa confirmation.
2. Le mot de passe doit contenir **au moins 6 caractères** et les deux saisies doivent être identiques, sinon un message d'erreur s'affiche.
3. Cliquez sur « Créer mon compte ». Un message « Inscription réussie ! » confirme qu'un e-mail de vérification vous a été envoyé : ouvrez-le pour activer votre compte avant de vous connecter.

**Mot de passe oublié (client)**

1. Dans l'onglet Connexion, cliquez sur « Mot de passe oublié ? ».
2. Saisissez votre e-mail et cliquez sur « Envoyer le code » : un code de vérification vous est envoyé par e-mail.
3. Saisissez le code reçu, un nouveau mot de passe (6 caractères minimum) et sa confirmation, puis cliquez sur « Réinitialiser ».
4. Le message « Mot de passe réinitialisé ! » s'affiche et vous êtes ramené à l'onglet Connexion. Si le code est incorrect ou périmé, le message « Code invalide ou expiré » apparaît : recommencez la demande.

Il n'est pas nécessaire d'avoir un compte pour remplir un panier ; il faudra en revanche fournir un e-mail au moment de la commande.

### Le panier

Le panier s'ouvre en glissant depuis le côté droit de l'écran, soit automatiquement après un ajout, soit en cliquant sur l'icône du panier. Pour chaque article : photo, nom (cliquable vers la fiche), prix unitaire, boutons − et + pour modifier la quantité, et une corbeille pour retirer l'article. Le total s'affiche en bas, avec le bouton « Passer commande ».

Le panier est conservé sur votre appareil : vous le retrouvez si vous revenez plus tard. Les quantités ajoutées au panier sont réservées temporairement sur le stock du vendeur ; une réservation non confirmée par une commande est libérée automatiquement au bout d'une trentaine de minutes.

### Passer une commande et payer

La page « Finaliser la commande » se déroule en deux étapes. Le récapitulatif (articles avec leur photo, quantités, total) reste affiché sur le côté pendant tout le processus.

**Étape 1 — Coordonnées et facturation**

1. Adresse e-mail : c'est là que seront envoyés le récapitulatif et la facture. Elle est pré-remplie si vous êtes connecté.
2. Adresse de facturation : nom complet, adresse, code postal, ville, pays. Tous les champs sont obligatoires (au moins 2 caractères chacun). Si vous êtes connecté et que votre profil contient une adresse, elle est pré-remplie.
3. Cliquez sur « Continuer vers le paiement ». Un e-mail invalide ou une adresse incomplète bloque le passage à l'étape suivante avec un message explicite.

**Étape 2 — Paiement**

1. Le formulaire de carte bancaire s'affiche (paiement sécurisé par Stripe). Tant que le site est en mode test, utilisez la carte 4242 4242 4242 4242, une date d'expiration future et n'importe quel code CVC.
2. Cliquez sur « Payer X € ». Un paiement refusé affiche le motif du refus et vous pouvez réessayer.
3. Après validation, la page « Merci pour votre commande ! » affiche votre numéro de commande (par exemple CMD-A1B2C3D4). Le panier est vidé et un e-mail de confirmation vous est envoyé.

Un panier vide affiche « Votre panier est vide » avec un bouton de retour à la boutique.

### Mon compte

Une fois connecté, « Mon profil » (menu de l'avatar) ouvre votre espace personnel, avec quatre onglets :

| Onglet | Contenu |
| --- | --- |
| **Mon profil** | Prénom, nom, e-mail (obligatoires), téléphone, adresse, code postal, ville, pays. Bouton « Enregistrer ». |
| **Mes commandes** | Toutes vos commandes : référence, date, statut, articles, total, et un bouton « Facture ». |
| **Sécurité** | Changer de mot de passe : ancien mot de passe, nouveau (6 caractères minimum), confirmation. |
| **Préférences** | Langue d'affichage (Français / English), interrupteurs « Newsletter » et « Notifications ». |

**Statuts d'une commande vus par le client** : En attente (paiement non confirmé), Payée, Préparée, Livrée (remise au client), Annulée.

**Facture** : le bouton « Facture » ouvre une facture au format A4 dans un nouvel onglet, avec les coordonnées du vendeur (telles que renseignées dans les paramètres du site), vos coordonnées de facturation, le détail des articles et le total TTC. Le bouton « Imprimer / Enregistrer en PDF » utilise l'impression du navigateur.

À noter : les préférences « Newsletter » et « Notifications » sont mémorisées sur votre appareil uniquement ; elles ne déclenchent pas d'envoi pour l'instant.

Si vous n'êtes pas connecté, l'espace « Mon compte » affiche « Connectez-vous » et vous invite à utiliser le bouton « Connexion » de l'en-tête.

### La page Contact

La page Contact est une page construite par l'équipe du site. Si elle n'a pas été créée, un bloc de contact par défaut s'affiche (titre, e-mail, téléphone et adresse du commerce).

---

## Partie 2 : administrer le site

### Se connecter à l'administration

L'administration se trouve à une adresse séparée du site public : l'adresse du site suivie de `/fr/goosee-admin` (ou `/en/goosee-admin` en anglais). Elle possède son propre écran de connexion.

1. Saisissez votre e-mail et votre mot de passe.
2. Cliquez sur « Se connecter ». Vous arrivez sur le tableau de bord.

Conditions d'accès :

- Seul un compte disposant d'au moins une permission d'administration peut entrer (voir « Droits d'accès »). Un compte client (rôle « Client ») est refusé.
- Un message d'erreur en rouge s'affiche au-dessus du formulaire en cas d'identifiants incorrects ou de compte introuvable (« User not found »).
- Après 5 tentatives de connexion en une minute, les tentatives suivantes sont bloquées temporairement : attendez une minute avant de réessayer.
- Si votre session expire, vous êtes automatiquement renvoyé vers l'écran de connexion.

Les administrateurs qui arrivent depuis le portail Goosee peuvent être connectés automatiquement par un lien d'accès. Si ce lien est périmé, le message « Lien d'accès invalide ou expiré » s'affiche avec un bouton « Aller à la connexion ».

### Mot de passe oublié (administration)

1. Sur l'écran de connexion, cliquez sur « Mot de passe oublié ? ».
2. Saisissez votre e-mail et cliquez sur « Envoyer le code ». Le message « Si un compte existe pour cet email, un code vous a été envoyé » s'affiche (le message est le même que l'e-mail existe ou non, par sécurité).
3. Saisissez le code de vérification reçu par e-mail, le nouveau mot de passe et sa confirmation, puis cliquez sur « Réinitialiser le mot de passe ». Les deux mots de passe doivent être identiques.
4. Le message « Votre mot de passe a été réinitialisé » s'affiche et vous êtes ramené à l'écran de connexion.

Le lien « Retour à la connexion » permet d'abandonner à tout moment.

### Se repérer dans l'administration

L'écran est organisé en trois zones.

**La barre latérale (à gauche)** affiche le logo et le nom du site, puis le menu, regroupé par thème. Seules les entrées autorisées par votre rôle apparaissent.

| Section | Entrées |
| --- | --- |
| Général | Tableau de bord, Statistiques |
| Catalogue | Produits, Catégories, Stock |
| Commandes | Commandes, Historiques, Caisse |
| Communauté | Clients, Retour clients |
| Personnalisation | Pages, Templates, Menu |
| Accès | Utilisateurs, Rôles, Logs |
| Bas de la barre | Voir le site (ouvre le site public dans un nouvel onglet), Paramètres |

La barre peut être réduite à des icônes avec le bouton en haut à gauche de l'écran ; le nom de chaque entrée s'affiche alors au survol.

**L'en-tête (en haut)** contient le bouton de réduction de la barre latérale, la barre de recherche rapide et, à droite, votre nom, votre rôle et le menu de votre profil.

**La zone principale** affiche l'écran sélectionné. Sur les écrans de liste (produits, commandes, clients…), un tableau propose : une recherche par texte, des filtres, la possibilité de masquer des colonnes (« Colonnes »), un bouton pour annuler les filtres, et une pagination (« Précédent », « Suivant », nombre de lignes par page). Le bouton « ⋯ » en bout de ligne ouvre les actions disponibles (Modifier, Supprimer…).

Conseil : naviguez avec le menu plutôt qu'en retapant une adresse, et utilisez les liens de navigation pour ne pas risquer d'être déconnecté.

### La recherche rapide

La barre de recherche en haut de l'écran (raccourci clavier Ctrl+K, ou ⌘K sur Mac) ouvre une fenêtre de recherche qui regroupe :

- **Actions rapides** : Nouveau produit, Nouvelle catégorie, Nouvel utilisateur, Nouvelle page ;
- **Navigation** : toutes les sections de l'administration auxquelles vous avez droit ;
- **Produits, Catégories, Utilisateurs, Clients, Commandes, Pages, Rôles** : les éléments existants. Choisir un produit, un utilisateur, un client ou une commande ouvre directement sa fiche détaillée ; choisir une page ouvre son éditeur.

Tapez quelques lettres pour filtrer les résultats. Seuls les premiers éléments de chaque groupe sont proposés : pour une recherche exhaustive, utilisez la recherche de l'écran concerné.

### Mon compte administrateur et le support

Le menu de votre profil (en haut à droite) propose trois entrées.

- **Paramètres** ouvre une fenêtre avec trois onglets : « Compte » (votre nom, votre e-mail, et les boutons « Changer » l'e-mail et « Modifier » le mot de passe), « Préférences » (langue de l'administration : Français / English ; thème : Clair, Sombre ou Système) et « Sécurité ».
- **Support** affiche l'e-mail et le téléphone de l'équipe Goosee.
- **Déconnexion** ferme votre session.

Important : le changement d'e-mail et le changement de mot de passe depuis cette fenêtre ne sont pas encore opérationnels (voir « Ce que l'administration ne permet pas encore »). Pour changer votre mot de passe, utilisez la procédure « Mot de passe oublié » depuis l'écran de connexion.

### Droits d'accès : rôles et permissions

L'accès à l'administration fonctionne par **rôles**. Chaque compte possède un rôle ; chaque rôle donne accès à un ensemble d'écrans (ses **permissions**). Un compte sans aucune permission ne peut pas entrer dans l'administration.

**Rôles fournis d'origine (non modifiables, marqués « Système » avec un cadenas)** :

| Rôle | Libellé affiché | Accès |
| --- | --- | --- |
| OWNER | Propriétaire | Tous les écrans, y compris Statistiques et Journal |
| CUSTOMER | Client | Aucun accès à l'administration (rôle attribué automatiquement aux clients du site) |

**Permissions attribuables à un rôle personnalisé**, telles qu'elles apparaissent dans le formulaire de rôle :

| Groupe | Permissions |
| --- | --- |
| Général | Tableau de bord |
| Accès | Utilisateurs, Rôles |
| Clients | Clients, Retours clients |
| Catalogue | Produits, Catégories, Stock |
| Ventes | Commandes, Historique des ventes |
| Personnalisation | Pages, Menus, Paramètres, Templates |

Règles à connaître :

- L'écran « Caisse » est couvert par la permission « Commandes ».
- L'assistant IA est disponible dès que le rôle possède la permission « Tableau de bord ».
- Les écrans « Statistiques » et « Journal (Logs) » ne figurent pas dans la liste des permissions du formulaire : seul le Propriétaire y accède aujourd'hui.
- Un rôle personnalisé ne voit que les entrées de menu correspondant à ses permissions. S'il tente d'ouvrir un écran interdit, il est renvoyé au tableau de bord.
- **Après un changement de rôle, la personne concernée doit se déconnecter puis se reconnecter** pour que ses nouveaux droits soient pris en compte.

### Tableau de bord

C'est le premier écran affiché après la connexion. Il présente :

- quatre compteurs : Administrateurs, Clients, Produits, Catégories (le sous-titre indique le nombre de produits en catalogue) ;
- « Activité récente » : les dernières actions enregistrées dans le journal, avec un lien « Voir tout » vers le journal complet ;
- « Accès rapides » : Gérer les produits, Gérer les catégories, Gérer les utilisateurs, Gérer les pages.

### Statistiques

L'écran « Statistiques » donne une vue chiffrée de l'activité de la boutique, calculée à partir des commandes réelles du site.

**Choix de la période** : une liste déroulante propose « Toute la période », « 7 derniers jours », « 30 derniers jours », « Ce mois-ci » et « Personnalisé ». Le bouton avec l'icône calendrier ouvre un sélecteur de deux mois pour choisir une plage de dates précise (ce qui bascule automatiquement en « Personnalisé »).

**Indicateurs** :

| Indicateur | Calcul |
| --- | --- |
| Chiffre d'affaires | Total des commandes non annulées sur la période, avec le nombre d'articles vendus |
| Commandes | Nombre de commandes sur la période, avec le pourcentage de commandes annulées |
| Panier moyen | Chiffre d'affaires divisé par le nombre de commandes non annulées |
| Clients | Nombre total de comptes clients (indépendant de la période) |

**Graphiques** : « Chiffre d'affaires par jour » (commandes non annulées), « Commandes par statut », « Meilleures ventes » (les 6 produits les plus vendus en quantité, avec leur chiffre d'affaires) et « Catalogue par catégorie » (nombre de produits par catégorie).

Un badge « Données de démonstration » est affiché en haut de l'écran à titre indicatif ; les chiffres proviennent bien des commandes enregistrées sur le site.

### Produits

L'écran « Produits » liste le catalogue avec, pour chaque produit : sa photo, son nom, sa catégorie, son prix, sa disponibilité (« Disponible » / « Indisponible ») et sa date de création. Vous pouvez rechercher un produit par son nom et filtrer par catégorie et par disponibilité ; le bouton « Réinitialiser » annule les filtres.

**Créer un produit**

1. Cliquez sur « Ajouter un produit » (ou utilisez l'action rapide « Nouveau produit » de la recherche).
2. Renseignez le formulaire, organisé en sections :

| Section | Champs | Règles |
| --- | --- | --- |
| Identité | Nom du produit, Description, Catégorie | Nom : 2 à 150 caractères. Au moins une catégorie, plusieurs possibles (cliquer sur les pastilles). S'il n'existe aucune catégorie, créez-en une d'abord. |
| Tarification | Prix (€) | Minimum 1 €, centimes acceptés |
| Logistique | Temps de préparation (minutes), Taille / Contenance et son unité (cl, ml, L, g, kg, cm, m, pcs), Stock initial | Temps 0 = immédiat. Le stock initial n'est demandé qu'à la création ; ensuite le stock se gère depuis l'écran Stock. |
| Visibilité | Interrupteur « Produit disponible à la vente » | Désactivé, le produit reste dans le catalogue de l'administration mais ne peut plus être acheté sur le site (il apparaît « Épuisé »). |

3. Cliquez sur « Créer le produit ». Le message « Produit créé avec succès » confirme l'enregistrement.

**Photos et caractéristiques** : elles ne peuvent pas être ajoutées à la création. Enregistrez d'abord le produit, puis rouvrez-le avec « Modifier » :

- **Images** : glissez-déposez ou cliquez pour sélectionner une ou plusieurs images (PNG, JPG, WEBP, GIF, 5 Mo maximum par image). La première image devient l'image principale (badge « Principale ») ; au survol d'une autre image, l'étoile « Définir comme principale » la remplace, et la corbeille la supprime. La dernière image restante ne peut pas être supprimée.
- **Caractéristiques** : saisissez un nom (par exemple « Poids ») et une valeur (« 250 g »), puis cliquez sur « + » (ou appuyez sur Entrée). Chaque caractéristique peut être supprimée avec sa corbeille. Elles s'affichent sur la fiche produit du site.

**Modifier un produit** : menu « ⋯ » puis « Modifier ». Tous les champs sont modifiables sauf le stock initial.

**Supprimer un produit** : menu « ⋯ » puis « Supprimer », puis confirmation. L'action est irréversible.

### Catégories

Les catégories organisent le catalogue ; un produit doit appartenir à au moins une catégorie. L'écran liste chaque catégorie avec son image, le nombre de produits qu'elle contient, son ordre d'affichage, son statut (Actif / Inactif) et sa date de création. Filtre par statut et recherche par nom.

**Créer ou modifier une catégorie** (« Ajouter une catégorie » ou « ⋯ » puis « Modifier ») :

| Section | Champs | Règles |
| --- | --- | --- |
| Identité | Nom, Description | Nom : 2 à 100 caractères. Description : 255 caractères maximum. |
| Visuel | URL de l'image | Lien vers une image déjà hébergée en ligne (optionnel). Il n'y a pas de téléversement pour les catégories. |
| Organisation | Catégorie parente, Ordre d'affichage, Catégorie active | Choisir une catégorie parente crée une sous-catégorie. L'ordre (nombre) sert à trier l'affichage. Une catégorie inactive n'est pas affichée sur le site. |

**Supprimer une catégorie** : « ⋯ » puis « Supprimer », avec confirmation. Vérifiez d'abord que ses produits sont rattachés à une autre catégorie.

### Stock

L'écran « Stock » liste tous les produits du catalogue avec deux nombres :

- **Quantité** : la quantité physique en stock ;
- **Disponible** : ce qui peut encore être vendu, c'est-à-dire la quantité moins ce qui est réservé dans des paniers ou des commandes en cours. Une réservation de panier non transformée en commande est libérée automatiquement au bout d'une trentaine de minutes.

Un produit dont le stock n'a jamais été initialisé apparaît à 0.

**Ajuster le stock**

1. Menu « ⋯ » puis « Ajuster ».
2. Saisissez l'ajustement : un nombre **positif pour réassortir**, **négatif pour retirer** (par exemple +20 ou −3). On n'indique jamais la quantité finale, uniquement la variation. La valeur 0 est refusée.
3. Cliquez sur « Valider ». Le message « Stock ajusté avec succès » confirme.

**Historique des mouvements** : menu « ⋯ » puis « Historique ». Chaque ligne indique la date, la quantité (en vert pour une entrée, en rouge pour une sortie), le type (Vente, Réassort ou Correction manuelle) et, pour une vente, la commande à l'origine du mouvement. Le bouton « Retour au stock » ramène à la liste.

Les ventes décrémentent le stock automatiquement : il n'y a rien à faire à la main après une commande.

### Commandes

L'écran « Commandes » liste toutes les commandes du site : référence, client (nom et e-mail), nombre d'articles, total, statut et date. Vous pouvez rechercher (référence, nom du client…) et filtrer par statut.

**Statuts d'une commande**

| Statut | Signification |
| --- | --- |
| En attente | Commande créée, paiement pas encore confirmé |
| Payée | Paiement confirmé, commande à préparer |
| Préparée | Commande prête, en attente de remise au client |
| Livrée | Commande remise au client (retrait en boutique ou drive) |
| Annulée | Commande annulée ; elle n'est pas comptée dans le chiffre d'affaires |

**Consulter et faire évoluer une commande**

1. Cliquez sur « Voir » en bout de ligne. La fiche affiche le statut, la date, le client, le détail des articles (produit, quantité, prix unitaire, sous-total, total) et les notes éventuelles.
2. Dans la zone « Mettre à jour le statut », choisissez le nouveau statut dans la liste. Le changement est enregistré immédiatement (« Statut de la commande mis à jour »). Tous les statuts sont sélectionnables, dans n'importe quel ordre.
3. Cliquez sur « Fermer ».

Les commandes ne se créent pas depuis l'administration : elles proviennent uniquement des achats faits sur le site.

### Caisse

La « Caisse » est l'écran du comptoir : elle présente sous forme de cartes toutes les commandes **en cours** (en attente, payées ou préparées), c'est-à-dire tout ce qui reste à remettre au client. Les commandes livrées ou annulées n'y apparaissent plus.

Chaque carte affiche la référence, le nom et l'e-mail du client, l'heure de la commande, la liste des articles avec leurs quantités, le total, une liste déroulante pour changer le statut et un grand bouton « Marquer comme livré ».

Pour remettre une commande à un client : cliquez sur « Marquer comme livré ». La carte disparaît de la caisse et la commande passe au statut « Livrée » (message « Commande remise au client »).

Quand il n'y a rien à remettre, l'écran affiche « Rien à remettre » : les commandes payées apparaîtront ici, prêtes à être remises au client.

### Historique des ventes

L'entrée « Historiques » du menu Commandes est prévue pour consulter l'historique des ventes. Elle n'affiche pour l'instant que son titre : la fonctionnalité n'est pas encore disponible. Pour retrouver les ventes passées, utilisez l'écran « Commandes » (filtre « Livrée ») ou « Statistiques ».

### Clients

L'écran « Clients » liste les comptes clients du site : prénom, nom, e-mail, rôle, statut et date de création. Recherche par texte et filtre par rôle.

**Créer un client** (« Ajouter un client ») : prénom et nom (2 à 50 caractères), e-mail, téléphone (optionnel, 6 à 20 caractères), adresse, code postal, ville et pays (optionnels). Aucun rôle n'est à choisir : un client reçoit automatiquement le rôle « Client ». Message de confirmation : « Client créé avec succès ».

**Modifier un client** : « ⋯ » puis « Modifier ». La fiche affiche en plus les informations du compte (membre depuis, dernière mise à jour, identifiant).

**Supprimer un client** : « ⋯ » puis « Supprimer », avec confirmation. L'action est irréversible ; ses commandes passées restent dans l'historique des commandes.

Un client qui s'inscrit lui-même depuis le site apparaît automatiquement dans cette liste.

### Retour clients

L'entrée « Retour clients » (menu Communauté) est prévue pour gérer les retours et réclamations. Elle n'affiche pour l'instant que son titre : la fonctionnalité n'est pas encore disponible.

### Utilisateurs (équipe d'administration)

L'écran « Utilisateurs » gère les comptes de l'équipe qui administre le site (à distinguer des clients). Chaque ligne affiche l'avatar et le nom, l'e-mail, le ou les rôles, le statut (Actif, Inactif ou Banni) et la date de création. Recherche par texte et filtre par rôle.

**Créer un administrateur**

1. Cliquez sur « Ajouter un utilisateur » (le formulaire s'intitule « Nouvel administrateur »).
2. Renseignez l'identité (prénom, nom), le contact (e-mail, téléphone optionnel), l'adresse (optionnelle) et, dans la section « Permissions », le **rôle** choisi parmi les rôles existants.
3. Cliquez sur « Créer le compte ».

**Modifier** (« ⋯ » puis « Modifier ») permet de changer toutes ces informations, y compris le rôle. Rappel : après un changement de rôle, la personne doit se reconnecter.

**Supprimer** (« ⋯ » puis « Supprimer ») demande une confirmation ; l'action est irréversible.

Il n'est pas possible de définir le mot de passe d'un utilisateur depuis cet écran : la personne utilise « Mot de passe oublié ? » sur l'écran de connexion pour choisir le sien.

### Rôles

L'écran « Rôles » liste les rôles avec leur nom, leur description et le nombre de pages autorisées. Les rôles « Système » (Propriétaire, Client) portent un cadenas et ne peuvent être ni modifiés ni supprimés.

**Créer un rôle**

1. Cliquez sur « Ajouter un rôle ».
2. Saisissez un nom (2 à 64 caractères, par exemple « REDACTEUR ») et une description facultative (255 caractères maximum).
3. Cochez les permissions, groupe par groupe (voir le tableau de la section « Droits d'accès »). Le bouton « Tout cocher » / « Tout décocher » sélectionne ou désélectionne l'ensemble.
4. Cliquez sur « Créer ».

**Modifier ou supprimer un rôle** : « ⋯ » puis « Modifier » ou « Supprimer ». Avant de supprimer un rôle, réattribuez un autre rôle aux utilisateurs qui le possèdent.

Exemples de rôles utiles : un rôle « Catalogue » avec Produits, Catégories et Stock ; un rôle « Comptoir » avec Tableau de bord et Commandes (qui donne aussi la Caisse) ; un rôle « Rédacteur » avec Pages, Menus et Templates.

### Journal (Logs)

L'écran « Journal (Logs) », dans la section Accès, conserve la trace des actions importantes effectuées sur le site : création, modification ou suppression d'un produit, d'une catégorie, d'une page, d'un compte, changement de statut de commande, etc.

Chaque ligne indique la date, le niveau (Info, Succès, Avertissement, Erreur, Critique, Débogage), le service concerné, un message descriptif et l'utilisateur à l'origine de l'action quand il est connu. Le journal peut être filtré par niveau et par service, et recherché par texte.

À noter : les connexions et déconnexions ne sont pas enregistrées dans le journal.

### Pages

L'écran « Pages » liste toutes les pages du site avec leur titre et leur statut (« Brouillon » ou « Publié »), avec un filtre par statut. Deux boutons en haut : « Appliquer un template » (voir « Templates ») et « Ajouter une page ».

**Créer une page**

1. Cliquez sur « Ajouter une page » : l'éditeur s'ouvre sur une page vide.
2. Ouvrez les paramètres de la page (bouton avec l'icône d'engrenage) et renseignez :

| Champ | Rôle |
| --- | --- |
| Titre | Nom de la page. Sur une nouvelle page, l'adresse (slug) se remplit automatiquement à partir du titre. |
| Slug | La fin de l'adresse de la page sur le site (par exemple `a-propos` pour `/fr/a-propos`). Doit être unique. |
| Type | Accueil, Catalogue, Contact ou Personnalisée. Il ne peut exister qu'**une seule** page de type Accueil, une seule de type Catalogue et une seule de type Contact. |
| Meta titre, Meta description | Textes utilisés par les moteurs de recherche. |

3. Ajoutez des blocs (voir la section suivante).
4. Choisissez le statut dans la liste en haut à droite (« Brouillon » ou « Publié ») et cliquez sur « Enregistrer ».

Messages d'erreur possibles : « Une page avec ce slug existe déjà » (changez le slug) et « Une page de ce type existe déjà (Accueil, Catalogue, Contact sont uniques) » (choisissez le type Personnalisée ou modifiez la page existante).

**Modifier une page** : « ⋯ » puis « Modifier ». Le bouton avec l'icône de lien externe ouvre la page sur le site public (si elle est publiée). **Supprimer une page** : « ⋯ » puis « Supprimer », avec confirmation.

La page d'accueil du site est la page de type « Accueil » publiée ; la page Contact est celle dont le slug est `contact`.

### L'éditeur de page et les blocs

Une page est une pile de blocs empilés verticalement, avec un aperçu en direct. Trois tailles d'aperçu sont proposées : Desktop, Tablette, Mobile.

**Ajouter un bloc** : cliquez sur « Ajouter un bloc » (entre deux blocs ou en bas de page), puis choisissez dans la bibliothèque, filtrable par recherche :

| Famille | Blocs |
| --- | --- |
| Mise en page | Hero (grand visuel d'accueil), Espacement, Vidéo, Grille, Header |
| Basique | Titre, Texte, Image, Bouton, Séparateur, Citation, Liste |
| E-commerce | Produits vedettes, Témoignages, Bannière promo, Avantages, Contact |

**Agir sur un bloc** : au survol, une barre d'outils propose Déplacer (glisser-déposer pour changer l'ordre), Modifier, Dupliquer et Supprimer.

**Modifier un bloc** ouvre un panneau avec trois volets :

- **Contenu** : les textes et éléments du bloc (titre, sous-titre, texte du bouton, lien, image et texte alternatif…). Pour les blocs à liste (Témoignages, Avantages), « Ajouter un élément » crée une entrée à remplir.
- **Style** : couleurs de fond et de texte, type de fond (couleur unie, image, dégradé), alignement, taille, espacement interne, coins arrondis…
- **Options** : réglages propres au bloc (niveau de titre H1 à H6, nombre de colonnes, format d'image, style de liste, etc.).

**Le bloc « Produits vedettes »** affiche les vrais produits du catalogue. Ses options permettent de limiter à une catégorie, de fixer un nombre maximum de produits, de choisir le tri et de n'afficher que les produits disponibles. La liste de produits saisie à la main dans le volet Contenu ne sert que de secours lorsque le catalogue est vide.

**Le bloc « Header »** reprend automatiquement le logo, le nom du site et le menu définis ailleurs ; ses options concernent la position du logo, l'alignement du menu, les couleurs et le comportement fixé au défilement.

N'oubliez pas d'« Enregistrer » : les modifications de blocs ne sont pas sauvegardées automatiquement.

### Templates (modèles de site)

Un template est un site complet prêt à l'emploi : plusieurs pages déjà construites, un menu et une couleur principale. Quatre modèles sont proposés, adaptés à différents commerces :

| Template | Pour qui |
| --- | --- |
| Drive Moderne | Drive ou commerce de proximité, style épuré |
| Boulangerie Artisan | Boulangerie-pâtisserie |
| Restaurant Signature | Restaurant |
| Salon Élégance | Salon de beauté, coiffure ou esthétique |

**Appliquer un template** : depuis l'écran « Templates » (menu Personnalisation) ou le bouton « Appliquer un template » de l'écran Pages, choisissez un modèle et confirmez.

**Attention, cette action remplace le site existant** : toutes les pages actuelles sont remplacées ou supprimées, tous les liens du menu sont recréés, et la couleur principale du site est modifiée. Les produits, catégories, commandes et comptes ne sont pas touchés. Il n'y a pas d'annulation : n'appliquez un template que sur un site neuf ou dont vous acceptez de perdre les pages.

Après application, vous pouvez modifier librement chaque page et chaque lien du menu.

### Menu

L'écran « Menu » gère les liens de navigation affichés dans l'en-tête et le pied de page du site. Chaque ligne indique le libellé, le type (Page ou Lien externe), le statut (Actif / Inactif) et l'ordre.

**Ajouter ou modifier un lien** (« Ajouter un item » ou « ⋯ » puis « Modifier ») :

| Champ | Rôle |
| --- | --- |
| Libellé | Le texte affiché (par exemple « Accueil ») |
| Type de lien | « Page interne » (choisir une page du site dans la liste) ou « Lien externe » (saisir une adresse complète, `https://…`) |
| Menu parent | « Aucun (niveau racine) » pour un lien principal, ou un lien existant pour créer un sous-menu |
| Actif | Un lien inactif est conservé mais n'est pas affiché sur le site |
| Nouvel onglet | Ouvre le lien dans un nouvel onglet du navigateur |

**Supprimer un lien** : « ⋯ » puis « Supprimer », avec confirmation.

Seuls les liens actifs de niveau racine apparaissent dans la barre de navigation ; leurs sous-liens s'affichent au survol.

### Paramètres du site

L'écran « Paramètres » (tout en bas de la barre latérale, permission « Paramètres ») regroupe l'identité du site, avec un aperçu en direct sur le côté.

| Section | Champs |
| --- | --- |
| Identité du site | Titre du site (obligatoire), Description (utilisée pour le référencement) |
| Identité visuelle | Logo (JPEG, PNG, GIF, WEBP ou SVG, affiché dans l'en-tête du site et de l'administration), Favicon (ICO, PNG ou SVG, 1 Mo maximum, affiché dans l'onglet du navigateur) — téléversement par glisser-déposer ou clic |
| Thème | Couleur principale, choisie avec le sélecteur de couleur ou saisie en code hexadécimal ; utilisée pour les boutons et les accents du site |
| Entreprise (facturation) | Adresse, code postal, ville, pays, e-mail, téléphone, SIRET, numéro de TVA intracommunautaire : ces informations apparaissent sur les factures des clients |

Les boutons « Enregistrer » et « Réinitialiser » ne sont actifs qu'après une modification. Message de confirmation : « Paramètres enregistrés avec succès ».

### L'assistant IA

Un bouton violet « Assistant IA » est affiché en permanence en bas à droite de toutes les pages de l'administration. Il ouvre une fenêtre de discussion dans laquelle vous pouvez poser vos questions sur l'utilisation du site : « Comment ajouter un produit ? », « Où changer le logo ? », « Que veut dire le statut Préparée ? », etc.

- L'assistant répond uniquement à partir de ce guide utilisateur. Si la réponse n'y figure pas, il vous le dit et vous propose de contacter le support.
- Tapez votre question puis appuyez sur Entrée ou sur le bouton d'envoi ; Maj+Entrée insère un retour à la ligne. Une question peut faire jusqu'à 2 000 caractères.
- La conversation garde le fil des derniers échanges tant que la fenêtre n'est pas rechargée, ce qui permet de poser des questions de suite (« et pour le supprimer ? »).
- L'assistant est disponible pour tout rôle possédant la permission « Tableau de bord ». Il est limité à 20 questions par minute.
- Si l'assistant n'est pas configuré ou est temporairement indisponible, le message « L'assistant est indisponible pour le moment » s'affiche : réessayez un peu plus tard ou consultez ce guide.

Le bouton « Fermer l'assistant » (ou la croix) referme la fenêtre.

---

## Questions fréquentes

**J'ai oublié mon mot de passe administrateur.**
Sur l'écran de connexion, cliquez sur « Mot de passe oublié ? », saisissez votre e-mail, puis le code reçu et votre nouveau mot de passe. Si vous ne recevez pas le code, vérifiez que l'e-mail saisi est bien celui de votre compte (le message de confirmation s'affiche même pour un e-mail inconnu).

**Je n'arrive pas à me connecter à l'administration avec mon compte client.**
C'est normal : un compte de rôle « Client » n'a aucun accès à l'administration. Demandez à un administrateur de vous créer un compte dans « Utilisateurs » avec un rôle adapté.

**Le message « User not found » s'affiche à la connexion.**
L'e-mail saisi ne correspond à aucun compte. Vérifiez l'orthographe ou demandez à un administrateur de créer votre compte.

**Je suis bloqué après plusieurs tentatives de connexion.**
Après 5 tentatives en une minute, la connexion est temporairement refusée. Attendez une minute puis réessayez.

**Un produit n'apparaît pas sur le site.**
Vérifiez, dans cet ordre : que l'interrupteur « Produit disponible à la vente » est activé ; que son stock disponible est supérieur à zéro (écran Stock) ; que sa catégorie est active ; et que la page qui l'affiche contient un bloc « Produits vedettes » dont les options (catégorie, limite, « disponibles seulement ») n'excluent pas ce produit.

**Comment ajouter des photos à un produit ?**
Créez d'abord le produit, puis rouvrez-le avec « Modifier » : la section « Images » permet de glisser-déposer des images (5 Mo maximum) et de choisir l'image principale.

**Comment mettre un produit en rupture sans le supprimer ?**
Désactivez « Produit disponible à la vente » dans sa fiche, ou ramenez son stock à zéro depuis l'écran Stock. Il apparaît alors « Épuisé » sur le site.

**Pourquoi « Disponible » est inférieur à « Quantité » dans le stock ?**
La différence correspond aux articles réservés dans des paniers ou des commandes en cours. Les réservations de panier non confirmées sont libérées automatiquement au bout d'une trentaine de minutes.

**Comment corriger une erreur de stock ?**
Écran Stock, « ⋯ » puis « Ajuster » : saisissez la variation (par exemple −2 pour retirer deux unités), jamais la quantité finale. Le mouvement apparaît dans l'historique comme « Correction manuelle ».

**Une commande reste « En attente », que faire ?**
Le paiement n'a pas été confirmé. Si le client a bien payé, ouvrez la commande (« Voir ») et passez-la manuellement en « Payée ». Si le client a abandonné, passez-la en « Annulée » : elle ne comptera pas dans le chiffre d'affaires.

**Comment remettre une commande à un client au comptoir ?**
Ouvrez « Caisse », retrouvez la carte de la commande et cliquez sur « Marquer comme livré ».

**Comment créer un compte pour un employé avec des droits limités ?**
1. Dans « Rôles », créez un rôle (par exemple « Comptoir ») en cochant uniquement les permissions utiles. 2. Dans « Utilisateurs », créez le compte et choisissez ce rôle. 3. L'employé définit son mot de passe via « Mot de passe oublié ? » sur l'écran de connexion.

**J'ai changé le rôle d'un utilisateur mais il ne voit pas les nouveaux écrans.**
Il doit se déconnecter puis se reconnecter : les droits sont lus à la connexion.

**Comment changer le logo, le nom ou les couleurs du site ?**
Dans « Paramètres » (bas de la barre latérale) : téléversez le logo et le favicon dans « Identité visuelle », modifiez le titre dans « Identité du site » et la couleur principale dans « Thème », puis cliquez sur « Enregistrer ».

**Les coordonnées sur les factures sont vides.**
Renseignez la section « Entreprise (facturation) » des Paramètres : adresse, e-mail, téléphone, SIRET, numéro de TVA.

**Comment modifier la page d'accueil ?**
Écran « Pages », ligne de la page de type Accueil, « ⋯ » puis « Modifier ». Ajoutez, déplacez ou modifiez les blocs, puis « Enregistrer ». La page doit être au statut « Publié » pour être visible.

**J'ai créé une page mais elle est introuvable sur le site.**
Vérifiez qu'elle est au statut « Publié » et qu'un lien vers elle existe dans « Menu » (type « Page interne »). Une page publiée sans lien reste accessible par son adresse (`/fr/son-slug`).

**Puis-je appliquer un template sans perdre mes pages ?**
Non. Appliquer un template remplace toutes les pages et tout le menu. Les produits, catégories, commandes et comptes sont conservés.

**Comment ajouter un lien vers un site extérieur dans le menu ?**
Écran « Menu », « Ajouter un item », type « Lien externe », saisissez l'adresse complète et cochez « Nouvel onglet » si vous le souhaitez.

**Comment retrouver rapidement une commande ou un client ?**
Utilisez la recherche rapide (Ctrl+K ou ⌘K) et tapez la référence ou le nom : le résultat ouvre directement la fiche.

**Où voir qui a supprimé un produit ?**
Dans « Journal (Logs) » (section Accès, réservé au Propriétaire) : filtrez par service ou recherchez le nom du produit ; la colonne « Utilisateur » indique l'auteur quand il est connu.

**Le client dit ne pas avoir reçu l'e-mail de vérification ou le code de réinitialisation.**
Demandez-lui de vérifier ses courriers indésirables et de refaire la demande. Si le problème persiste, contactez le support Goosee (menu du profil, « Support »).

**Comment supprimer définitivement un compte client ?**
Écran « Clients », « ⋯ » puis « Supprimer », puis confirmation. Ses commandes restent visibles dans « Commandes ».

---

## Ce que l'administration ne permet pas encore

- **Historique des ventes** et **Retour clients** : ces deux écrans existent dans le menu mais ne contiennent encore aucune fonctionnalité.
- **Changement d'e-mail et de mot de passe depuis « Paramètres » du profil** : les formulaires s'affichent mais n'enregistrent rien. Utilisez « Mot de passe oublié ? » sur l'écran de connexion pour changer de mot de passe ; le changement d'e-mail d'un administrateur passe par un autre administrateur (écran « Utilisateurs », « Modifier »).
- **Statistiques et Journal pour les rôles personnalisés** : ces deux écrans ne peuvent pas être attribués à un rôle créé dans l'administration ; seul le Propriétaire y accède.
- **Définir ou réinitialiser le mot de passe d'un utilisateur** depuis l'écran Utilisateurs : impossible, chacun passe par « Mot de passe oublié ? ».
- **Statut Actif / Inactif / Banni des utilisateurs** : il est affiché mais ne peut pas être modifié depuis l'administration.
- **Créer une commande à la main** (vente au comptoir sans passage par le site) : impossible, la Caisse ne fait que remettre des commandes existantes.
- **Notes sur une commande** : elles s'affichent si elles existent mais ne peuvent pas être saisies depuis l'administration.
- **Image de catégorie** : uniquement par adresse d'une image déjà en ligne, pas de téléversement.
- **Annuler l'application d'un template** ou restaurer une page supprimée : aucune corbeille ni historique de versions.
- **Newsletter et notifications clients** : les préférences existent côté client mais aucun envoi n'est effectué.
- **Étiquettes (tags) des produits** : elles s'affichent sur la fiche produit du site mais ne se gèrent pas encore depuis l'écran Produits.
- **Plusieurs langues de contenu** : l'interface existe en français et en anglais, mais le contenu des pages et des produits n'est saisi que dans une seule langue.
