// src/data/themePacks.ts

export interface Module {
  moduleId: string;
  title: string;
}

export interface Theme {
  themeId: string;
  name: string;
  startDate: string;
  endDate: string;
  modules: Module[];
}

export interface PackDetails {
  themes: Theme[];
  advantages: string[];
  price: number;
  originalPrice: number;
  savings: number;
}

export interface Pack {
  packId: string;
  name: string;
  description: string;
  image: string;
  details: PackDetails;
}

export const themePacks: Pack[] = [
  {
    packId: "compte-premium-qhse",
    name: "Compte Premium QHSE",
    description: "Compte Premium QHSE & Management Industriel",
    image: "/images/qhse.png",
    details: {
      price: 49,
      originalPrice: 99,
      savings: 50,
      themes: [
        {
          themeId: "qhse-guides",
          name: "Guides & Référentiels QSE",
          startDate: "2025-09-01",
          endDate: "2025-09-30",
          modules: [
            { moduleId: "m1", title: "Fondamentaux QHSE" },
            { moduleId: "m2", title: "Systèmes de management" },
            { moduleId: "m3", title: "Conformité réglementaire" },
          ],
        },
        {
          themeId: "iso-models",
          name: "Modèles ISO 9001 / 14001 / 45001",
          startDate: "2025-09-01",
          endDate: "2025-09-30",
          modules: [
            { moduleId: "m1", title: "ISO 9001 - Qualité" },
            { moduleId: "m2", title: "ISO 14001 - Environnement" },
            { moduleId: "m3", title: "ISO 45001 - Sécurité" },
          ],
        },
        {
          themeId: "audit-tools",
          name: "Checklists & Outils d'audit",
          startDate: "2025-09-01",
          endDate: "2025-09-30",
          modules: [
            { moduleId: "m1", title: "Checklists d'audit" },
            { moduleId: "m2", title: "Outils de contrôle" },
            { moduleId: "m3", title: "Rapports d'audit" },
          ],
        },
      ],
      advantages: [
        "📘 Guides & Référentiels QSE",
        "📄 Modèles ISO 9001 / 14001 / 45001",
        "🧰 Checklists & outils d'audit",
        "🎥 Vidéos enregistrées (procédures + méthodologies)",
        "📊 Tableaux Excel prêts à l'usage",
        "🔓 Accès illimité",
      ],
    },
  },
  {
    packId: "compte-premium-marketing",
    name: "Compte Premium Marketing Digital",
    description: "Compte Premium Marketing & Communication Digitale",
    image: "/images/marketing-digital.png",
    details: {
      price: 59,
      originalPrice: 119,
      savings: 60,
      themes: [
        {
          themeId: "social-strategies",
          name: "Modèles de stratégies Facebook/Instagram",
          startDate: "2025-09-01",
          endDate: "2025-09-30",
          modules: [
            { moduleId: "m1", title: "Stratégie Facebook" },
            { moduleId: "m2", title: "Stratégie Instagram" },
            { moduleId: "m3", title: "Contenu viral" },
          ],
        },
        {
          themeId: "digital-videos",
          name: "Vidéos enregistrées (Ads, SEO, Content)",
          startDate: "2025-09-01",
          endDate: "2025-09-30",
          modules: [
            { moduleId: "m1", title: "Tutoriels Ads" },
            { moduleId: "m2", title: "Stratégies SEO" },
            { moduleId: "m3", title: "Création de contenu" },
          ],
        },
        {
          themeId: "email-marketing",
          name: "Modèles Email Marketing",
          startDate: "2025-09-01",
          endDate: "2025-09-30",
          modules: [
            { moduleId: "m1", title: "Templates Email" },
            { moduleId: "m2", title: "Automation Email" },
            { moduleId: "m3", title: "Segmentation" },
          ],
        },
      ],
      advantages: [
        "📄 Modèles de stratégies Facebook/Instagram",
        "🎥 Vidéos enregistrées (Ads, SEO, Content…)",
        "🧰 Templates de contenu & planning",
        "📨 Modèles Email Marketing",
        "📊 Tableurs Excel pour les campagnes",
        "🔓 Accès illimité",
      ],
    },
  },
  {
    packId: "compte-premium-web-it",
    name: "Compte Premium Développement Web",
    description: "Compte Premium Technologies & Développement Web",
    image: "/images/web-development.png",
    details: {
      price: 69,
      originalPrice: 139,
      savings: 70,
      themes: [
        {
          themeId: "web-guides",
          name: "Guides HTML / CSS / JS / Python",
          startDate: "2025-09-01",
          endDate: "2025-09-30",
          modules: [
            { moduleId: "m1", title: "Guide HTML5" },
            { moduleId: "m2", title: "Guide CSS3" },
            { moduleId: "m3", title: "Guide JavaScript" },
            { moduleId: "m4", title: "Guide Python" },
          ],
        },
        {
          themeId: "web-videos",
          name: "Vidéos enregistrées (Front & Back)",
          startDate: "2025-09-01",
          endDate: "2025-09-30",
          modules: [
            { moduleId: "m1", title: "Tutoriels Frontend" },
            { moduleId: "m2", title: "Tutoriels Backend" },
            { moduleId: "m3", title: "Intégration API" },
          ],
        },
        {
          themeId: "web-projects",
          name: "Modèles de projets réels & Snippets",
          startDate: "2025-09-01",
          endDate: "2025-09-30",
          modules: [
            { moduleId: "m1", title: "Projets complets" },
            { moduleId: "m2", title: "Code réutilisable" },
            { moduleId: "m3", title: "Outils d'apprentissage" },
          ],
        },
      ],
      advantages: [
        "📘 Guides HTML / CSS / JS / Python",
        "🎥 Vidéos enregistrées (Front & Back)",
        "📄 Modèles de projets réels",
        "🧰 Snippets & code réutilisable",
        "📁 Fichiers + outils d'apprentissage",
        "🔓 Accès illimité",
      ],
    },
  },
];

// Fonction pour convertir le prix selon la devise
export const convertPrice = (price: number, currency: string): string => {
  switch (currency) {
    case '€':
      return `${price}€`;
    case '$':
      return `$${Math.round(price * 1.08)}`;
    case 'TND':
      return `${Math.round(price * 3.35)} TND`;
    default:
      return `${price}€`;
  }
};
