import { Page, PageStatus, PageType } from '../entities/page.entity';

export const DEFAULT_PAGES: Partial<Page>[] = [
  {
    title: 'Accueil',
    slug: 'accueil',
    status: PageStatus.PUBLISHED,
    type: PageType.HOME,
    metaTitle: 'Bienvenue sur notre boutique',
    metaDescription: 'Découvrez notre sélection de produits de qualité',
    components: [
      {
        id: 'hero-1',
        type: 'hero',
        order: 0,
        props: {
          title: 'Bienvenue sur notre boutique',
          subtitle: 'Découvrez nos produits exceptionnels',
          backgroundImage: '',
          buttonText: 'Voir le catalogue',
          buttonLink: '/catalog',
          alignment: 'center',
        },
      },
    ],
  },
  {
    title: 'Catalogue',
    slug: 'catalogue',
    status: PageStatus.PUBLISHED,
    type: PageType.CATALOG,
    metaTitle: 'Notre catalogue de produits',
    metaDescription: 'Parcourez notre large sélection de produits',
    components: [
      {
        id: 'hero-catalog',
        type: 'hero',
        order: 0,
        props: {
          title: 'Notre Catalogue',
          subtitle: 'Découvrez tous nos produits',
          backgroundImage: '',
          buttonText: '',
          buttonLink: '',
          alignment: 'center',
        },
      },
    ],
  },
  {
    title: 'Contact',
    slug: 'contact',
    status: PageStatus.PUBLISHED,
    type: PageType.CONTACT,
    metaTitle: 'Contactez-nous',
    metaDescription: 'Une question ? Contactez notre équipe',
    components: [
      {
        id: 'contact-main',
        type: 'contact',
        order: 0,
        props: {
          title: 'Contactez-nous',
          subtitle:
            'Une question, une suggestion ? Notre équipe vous répond sous 24h.',
          email: 'contact@votresite.com',
          phone: '01 23 45 67 89',
          address: '123 Rue du Commerce, 57000 Metz',
        },
      },
    ],
  },
  {
    title: 'Mentions légales',
    slug: 'mentions-legales',
    status: PageStatus.PUBLISHED,
    type: PageType.CUSTOM,
    metaTitle: 'Mentions légales',
    metaDescription: "Informations légales relatives à l'éditeur et à l'hébergeur du site",
    components: [
      {
        id: 'mentions-legales-heading',
        type: 'heading',
        order: 0,
        props: {
          content: 'Mentions légales',
          level: 'h1',
          alignment: 'left',
        },
      },
      {
        id: 'mentions-legales-content',
        type: 'text',
        order: 1,
        props: {
          alignment: 'left',
          content: `
            <h2>Éditeur du site</h2>
            <p>
              Le présent site est édité par <strong>[Nom de la société]</strong>,
              [forme juridique] au capital de [montant] euros, immatriculée au
              Registre du Commerce et des Sociétés de [ville] sous le numéro
              [SIRET], dont le siège social est situé au [adresse complète].
            </p>
            <p>
              Numéro de TVA intracommunautaire : [numéro de TVA]<br />
              Directeur de la publication : [nom du responsable]<br />
              Contact : [email de contact] — [téléphone]
            </p>
            <h2>Hébergement</h2>
            <p>
              Le site est hébergé par <strong>[Nom de l'hébergeur]</strong>,
              [adresse de l'hébergeur], [téléphone de l'hébergeur].
            </p>
            <h2>Propriété intellectuelle</h2>
            <p>
              L'ensemble des contenus présents sur ce site (textes, images,
              logos, vidéos, éléments graphiques) est protégé par le droit
              d'auteur et reste la propriété exclusive de [Nom de la société],
              sauf mention contraire. Toute reproduction, représentation,
              modification ou exploitation, totale ou partielle, sans
              autorisation préalable est interdite.
            </p>
            <h2>Responsabilité</h2>
            <p>
              [Nom de la société] s'efforce d'assurer l'exactitude des
              informations diffusées sur ce site, mais ne saurait être tenue
              responsable des erreurs, omissions ou de l'indisponibilité des
              informations et services.
            </p>
          `.trim(),
        },
      },
    ],
  },
  {
    title: 'Politique de confidentialité',
    slug: 'politique-de-confidentialite',
    status: PageStatus.PUBLISHED,
    type: PageType.CUSTOM,
    metaTitle: 'Politique de confidentialité',
    metaDescription:
      'Comment vos données personnelles sont collectées, utilisées et protégées',
    components: [
      {
        id: 'politique-confidentialite-heading',
        type: 'heading',
        order: 0,
        props: {
          content: 'Politique de confidentialité',
          level: 'h1',
          alignment: 'left',
        },
      },
      {
        id: 'politique-confidentialite-content',
        type: 'text',
        order: 1,
        props: {
          alignment: 'left',
          content: `
            <h2>Responsable du traitement</h2>
            <p>
              Le responsable du traitement des données collectées sur ce site
              est <strong>[Nom de la société]</strong>, joignable à l'adresse
              [email de contact].
            </p>
            <h2>Données collectées</h2>
            <p>
              Nous collectons les données que vous nous transmettez
              directement (nom, email, adresse postale, historique de
              commandes) ainsi que des données techniques de navigation
              (cookies, adresse IP) nécessaires au bon fonctionnement du site.
            </p>
            <h2>Finalités et base légale</h2>
            <p>
              Ces données sont traitées pour la gestion des commandes et de la
              relation client (exécution du contrat), l'amélioration du site
              (intérêt légitime) et, le cas échéant, l'envoi de communications
              commerciales (consentement).
            </p>
            <h2>Durée de conservation</h2>
            <p>
              Les données sont conservées pendant la durée nécessaire aux
              finalités pour lesquelles elles sont collectées, et
              conformément aux obligations légales de conservation
              applicables (comptables, fiscales).
            </p>
            <h2>Vos droits</h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données
              (RGPD), vous disposez d'un droit d'accès, de rectification, de
              suppression, de limitation et d'opposition au traitement de vos
              données, ainsi que d'un droit à la portabilité. Vous pouvez
              exercer ces droits en nous contactant à [email de contact].
            </p>
            <h2>Cookies</h2>
            <p>
              Ce site utilise des cookies nécessaires à son fonctionnement
              ainsi que, le cas échéant, des cookies de mesure d'audience.
              Vous pouvez à tout moment configurer votre navigateur pour
              refuser les cookies.
            </p>
            <h2>Contact</h2>
            <p>
              Pour toute question relative à cette politique de
              confidentialité, vous pouvez nous contacter à [email de
              contact].
            </p>
          `.trim(),
        },
      },
    ],
  },
];
