# Guide utilisateur

Ce guide explique comment utiliser le site généré par Goosee, aussi bien du côté client (la boutique publique) que du côté de l'équipe qui gère le site (l'espace d'administration).

## Sommaire

- [Partie 1 : utiliser le site en tant que client](#partie-1--utiliser-le-site-en-tant-que-client)
- [Partie 2 : administrer le site](#partie-2--administrer-le-site)

---

## Partie 1 : utiliser le site en tant que client

### La page d'accueil

La page d'accueil présente le site en quelques mots (un titre, un sous-titre, un bouton "Découvrir le catalogue") et une image de mise en avant. Le menu du haut, présent sur toutes les pages du site, donne accès à l'accueil, au catalogue, à une page "À propos", à une page "Contact", au bouton de connexion, et à l'icône du panier.

### Créer un compte ou se connecter

Le bouton "Connexion", en haut à droite, ouvre une fenêtre avec deux onglets :

- **Connexion** : e-mail et mot de passe pour un client qui a déjà un compte. Un lien "Mot de passe oublié ?" permet de réinitialiser son mot de passe en cas d'oubli.
- **Inscription** : prénom, nom, e-mail et mot de passe (au moins 6 caractères, à confirmer une deuxième fois) pour créer un nouveau compte.

### Parcourir le catalogue

La page "Catalogue" liste tous les produits regroupés par catégorie (par exemple "Fruits & Légumes", "Boissons"). Chaque produit est présenté sous forme de carte avec sa photo, un badge "Promo" quand il est en promotion, son nom, son prix, et un bouton pour l'ajouter directement au panier sans quitter la liste.

En cliquant sur un produit, on arrive sur sa fiche détaillée : galerie de photos, des badges d'information (en stock, de saison, fait maison...), le nom, le prix, la description, les caractéristiques propres au produit (par exemple les allergènes), un sélecteur de quantité, et le bouton "Ajouter au panier".

### Le panier

L'icône de panier, en haut à droite du site, affiche le nombre d'articles actuellement dedans. Ajouter un produit ouvre automatiquement un tiroir récapitulatif, sans quitter la page où l'on se trouve.

### Passer une commande

Depuis le panier, le bouton pour finaliser l'achat mène à la page de paiement, qui demande dans l'ordre :

1. L'adresse e-mail (pré-remplie si le client est déjà connecté).
2. L'adresse de facturation (nom complet, adresse, code postal, ville, pays).
3. Le paiement par carte bancaire, via Stripe (en mode test pour l'instant).

Le résumé de la commande (articles et total) reste affiché sur le côté pendant toute cette étape.

### Gérer son compte

Une fois connecté, l'espace "Mon compte" (en cliquant sur son nom en haut à droite) regroupe quatre onglets :

- **Mon profil** : coordonnées personnelles (prénom, nom, e-mail, téléphone, adresse complète), modifiables à tout moment via le bouton "Enregistrer".
- **Mes commandes** : l'historique des commandes déjà passées par le client.
- **Sécurité** : changer son mot de passe, en indiquant l'ancien puis le nouveau (au moins 6 caractères, à confirmer).
- **Préférences** : la langue d'affichage du site, et deux interrupteurs séparés pour recevoir ou non la newsletter et les notifications de suivi de commande.

---

## Partie 2 : administrer le site

### Se connecter à l'espace d'administration

L'espace d'administration se trouve à une adresse séparée du site public, avec son propre écran de connexion. Seul un compte ayant un rôle donnant accès à l'administration peut s'y connecter (voir "Gérer les rôles et les utilisateurs" plus bas). Une fois connecté, naviguer en cliquant sur les liens du menu plutôt qu'en tapant une nouvelle adresse à chaque fois, pour ne pas risquer d'être déconnecté.

Le menu de navigation, sur la gauche de l'écran, est organisé par thème :

- **Général** : tableau de bord, statistiques.
- **Catalogue** : produits, catégories, stock.
- **Commandes** : commandes, caisse.
- **Communauté** : clients.
- **Personnalisation** : pages, menu.
- **Accès** : utilisateurs, rôles.
- **Système** : journal d'activité.
- Tout en bas : accès rapide au site public, et aux paramètres généraux du site.

### Le tableau de bord

C'est la première page affichée en arrivant dans l'administration. Elle donne une vue d'ensemble rapide : nombre d'administrateurs, de clients, de produits et de catégories, un flux d'activité récente, et des raccourcis vers les sections les plus utilisées (gérer les produits, les catégories, les utilisateurs).

### Gérer les pages

La section "Pages" liste toutes les pages du site avec leur statut (publié ou brouillon).

Modifier une page ouvre un éditeur avec un aperçu en direct de son contenu, avec un choix d'affichage bureau, tablette ou mobile. Une page est construite à partir de blocs empilés les uns sur les autres. Au survol, chaque bloc affiche une petite barre d'outils pour le modifier, le dupliquer, le déplacer ou le supprimer, et un bouton "Ajouter un bloc" apparaît entre chaque section pour en insérer un nouveau, en choisissant parmi une bibliothèque de blocs prêts à l'emploi :

- **Mise en page** : en-tête, grand visuel d'accueil (Hero), espacement, vidéo, grille.
- **Basique** : titre, texte, image, bouton, séparateur, citation, liste.
- **Pensés pour la vente** : produits mis en avant, témoignages clients, bannière promotionnelle, avantages, bloc de contact.

Modifier le contenu d'un bloc ouvre une fenêtre avec généralement trois parties : le **contenu** à proprement parler (les textes et éléments propres au bloc ; pour le bloc "produits mis en avant" par exemple, les éléments affichés se saisissent à la main un par un, ce ne sont pas automatiquement les vrais produits du catalogue), l'**apparence** (les couleurs de fond et de texte), et des **options** supplémentaires selon le bloc concerné.

Un bouton "Appliquer un template" permet de démarrer rapidement avec une mise en page complète toute prête, au choix parmi plusieurs modèles adaptés à différents types de commerce (par exemple une boutique de type drive, une boulangerie, un restaurant ou un salon de beauté). Attention : appliquer un template remplace entièrement les pages déjà existantes, ce n'est pas un simple ajout à ce qui est en place.

La section "Menu" gère les liens affichés dans le menu de navigation du site : leur libellé, s'ils pointent vers une page du site ou vers un lien externe, leur ordre d'affichage, s'ils sont actifs, et s'ils doivent s'ouvrir dans un nouvel onglet. Un lien peut aussi être rattaché à un autre pour créer un sous-menu.

### Gérer les produits

La section "Produits" liste le catalogue avec, pour chaque produit, sa catégorie, son prix, sa disponibilité et sa date de création. Un produit peut être recherché par nom, ou filtré par catégorie et par disponibilité.

Ajouter un produit demande, dans l'ordre : son nom et sa description, une ou plusieurs catégories, son prix, un temps de préparation, éventuellement une taille ou une contenance, la quantité de stock de départ, et s'il est disponible à la vente. Les photos et les caractéristiques détaillées ne peuvent pas être ajoutées à la création : il faut d'abord enregistrer le produit, puis le rouvrir en modification pour les compléter.

Les catégories se gèrent dans leur propre section, avec un nom, une description, une image (un lien vers une image déjà hébergée), un ordre d'affichage, et la possibilité de rattacher une catégorie à une autre pour créer des sous-catégories.

Le stock de chaque produit se consulte depuis la section "Stock", qui affiche pour chacun sa quantité totale et sa quantité réellement disponible (la différence entre les deux correspond à ce qui est réservé dans des paniers en cours). La quantité s'ajuste en indiquant seulement la variation (un nombre positif pour réapprovisionner, négatif pour retirer), jamais la quantité finale directement. Un historique détaillé des mouvements de stock est disponible pour chaque produit, avec la commande à l'origine du mouvement quand c'est le cas.

### Gérer les commandes

La section "Commandes" liste l'ensemble des commandes passées sur le site, avec leur référence, le client concerné, les articles commandés, le montant total, leur statut et leur date. Les commandes peuvent être filtrées par statut et recherchées.

La section "Caisse" ne sert pas à encaisser de nouvelles ventes : elle affiche les commandes déjà payées, en attente d'être remises au client, pour un retrait en boutique ou en drive.

### Gérer les rôles et les utilisateurs

L'accès à l'espace d'administration fonctionne par rôles. Un rôle regroupe un ensemble de permissions, organisées par thème : accès général au tableau de bord, gestion des accès (utilisateurs, rôles), gestion de la communauté (clients, retours clients), gestion du catalogue (produits, catégories, stock), gestion des ventes (commandes, historique des ventes), et personnalisation (pages, menus, paramètres, templates). Deux rôles existent par défaut et ne peuvent pas être modifiés : "Propriétaire" (accès complet à tout) et "Client" (aucun accès à l'administration).

Un nouveau rôle se crée avec un nom, une description facultative, et la liste des permissions à cocher une par une, ou toutes d'un coup.

La section "Utilisateurs" gère les comptes de l'équipe qui administre le site : chaque compte y est créé avec son identité, ses coordonnées, et un rôle choisi parmi ceux disponibles. La section "Clients" fonctionne de façon presque identique pour les comptes des clients du site, à la différence près qu'aucun rôle n'a besoin d'être choisi : un client reçoit automatiquement le rôle "Client".

**Point important à retenir** : après avoir changé le rôle d'un compte, la personne concernée doit se reconnecter pour que le changement soit réellement pris en compte.

### Consulter les statistiques

La section "Statistiques" donne une vue chiffrée des performances de la boutique : chiffre d'affaires, nombre de commandes (et pourcentage de commandes annulées), panier moyen, et nombre de clients, sur une période choisie (toute la période, ou une plage de dates personnalisée). Deux graphiques complètent cette vue : l'évolution du chiffre d'affaires jour par jour, et la répartition des commandes par statut. Un indicateur signale quand les chiffres affichés sont encore des données de démonstration, faute d'assez de vraies commandes.

### Consulter le journal d'activité

La section "Journal", dans la partie Système du menu, garde une trace des actions importantes effectuées sur le site : création, modification ou suppression d'un produit, d'une catégorie, d'une page ou d'un compte, par exemple. Chaque ligne indique la date, le niveau de gravité (information, succès, avertissement, erreur), le service concerné, un message descriptif, et l'utilisateur à l'origine de l'action quand elle est connue. Le journal peut être filtré par niveau ou par service. À noter : les connexions et déconnexions n'y apparaissent pas, seules les actions de gestion du catalogue, des pages et des comptes y sont enregistrées.

### Paramètres du site

La section "Paramètres", accessible tout en bas du menu, regroupe la configuration générale du site, avec un aperçu en direct du rendu sur le côté :

- **Identité du site** : titre et description (utilisée pour le référencement).
- **Identité visuelle** : le logo et le favicon (la petite icône affichée dans l'onglet du navigateur).
- **Thème** : la couleur principale du site, utilisée pour les boutons et les accents visuels.
- **Entreprise** : les informations qui apparaissent sur les factures envoyées aux clients (adresse, téléphone, e-mail, SIRET, numéro de TVA intracommunautaire).
