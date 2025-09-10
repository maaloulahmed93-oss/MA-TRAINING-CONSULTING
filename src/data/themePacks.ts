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
    packId: "marketing-digital",
    name: "Pack Marketing Digital",
    description: "Maîtrisez le marketing digital de A à Z",
    image: "/images/marketing.png",
    details: {
      price: 500,
      originalPrice: 750,
      savings: 250,
      themes: [
        {
          themeId: "seo",
          name: "SEO et Référencement",
          startDate: "2025-09-01",
          endDate: "2025-09-07",
          modules: [
            { moduleId: "m1", title: "Introduction au SEO" },
            { moduleId: "m2", title: "Optimisation On-Page" },
            { moduleId: "m3", title: "Backlinks & Autorité" },
          ],
        },
        {
          themeId: "ads",
          name: "Publicité Digitale",
          startDate: "2025-09-08",
          endDate: "2025-09-15",
          modules: [
            { moduleId: "m1", title: "Google Ads" },
            { moduleId: "m2", title: "Facebook & Instagram Ads" },
          ],
        },
        {
          themeId: "social-media",
          name: "Réseaux Sociaux",
          startDate: "2025-09-16",
          endDate: "2025-09-22",
          modules: [
            { moduleId: "m1", title: "Stratégie Social Media" },
            { moduleId: "m2", title: "Community Management" },
            { moduleId: "m3", title: "Création de contenu" },
          ],
        },
        {
          themeId: "email-marketing",
          name: "Email Marketing",
          startDate: "2025-09-23",
          endDate: "2025-09-30",
          modules: [
            { moduleId: "m1", title: "Campagnes Email" },
            { moduleId: "m2", title: "Automation Marketing" },
          ],
        },
      ],
      advantages: [
        "Accès 1 an aux contenus",
        "Certificats officiels inclus",
        "Coaching personnalisé",
        "Réseau d'experts & job board",
        "Projets réels d'entreprises",
        "Support technique 24/7",
      ],
    },
  },
  {
    packId: "developpement-web",
    name: "Pack Développement Web",
    description: "Devenez développeur full-stack expert",
    image: "/images/development.png",
    details: {
      price: 650,
      originalPrice: 950,
      savings: 300,
      themes: [
        {
          themeId: "frontend",
          name: "Développement Frontend",
          startDate: "2025-10-01",
          endDate: "2025-10-15",
          modules: [
            { moduleId: "m1", title: "HTML5 & CSS3 Avancé" },
            { moduleId: "m2", title: "JavaScript ES6+" },
            { moduleId: "m3", title: "React.js & Hooks" },
            { moduleId: "m4", title: "TypeScript" },
          ],
        },
        {
          themeId: "backend",
          name: "Développement Backend",
          startDate: "2025-10-16",
          endDate: "2025-10-30",
          modules: [
            { moduleId: "m1", title: "Node.js & Express" },
            { moduleId: "m2", title: "Bases de données (MongoDB, SQL)" },
            { moduleId: "m3", title: "APIs REST & GraphQL" },
          ],
        },
        {
          themeId: "devops",
          name: "DevOps & Déploiement",
          startDate: "2025-11-01",
          endDate: "2025-11-08",
          modules: [
            { moduleId: "m1", title: "Git & GitHub" },
            { moduleId: "m2", title: "Docker & Containerisation" },
            { moduleId: "m3", title: "Déploiement Cloud (AWS, Vercel)" },
          ],
        },
      ],
      advantages: [
        "Portfolio de 5 projets complets",
        "Mentorat avec développeurs seniors",
        "Accès aux outils de développement premium",
        "Certification reconnue par l'industrie",
        "Aide à la recherche d'emploi",
        "Communauté de développeurs active",
      ],
    },
  },
  {
    packId: "data-science",
    name: "Pack Data Science & IA",
    description: "Maîtrisez l'analyse de données et l'intelligence artificielle",
    image: "/images/data-science.png",
    details: {
      price: 750,
      originalPrice: 1100,
      savings: 350,
      themes: [
        {
          themeId: "python-basics",
          name: "Python pour Data Science",
          startDate: "2025-09-15",
          endDate: "2025-09-22",
          modules: [
            { moduleId: "m1", title: "Python Fondamentaux" },
            { moduleId: "m2", title: "NumPy & Pandas" },
            { moduleId: "m3", title: "Matplotlib & Seaborn" },
          ],
        },
        {
          themeId: "machine-learning",
          name: "Machine Learning",
          startDate: "2025-09-23",
          endDate: "2025-10-07",
          modules: [
            { moduleId: "m1", title: "Algorithmes de ML" },
            { moduleId: "m2", title: "Scikit-learn" },
            { moduleId: "m3", title: "Évaluation de modèles" },
            { moduleId: "m4", title: "Régression & Classification" },
          ],
        },
        {
          themeId: "deep-learning",
          name: "Deep Learning & IA",
          startDate: "2025-10-08",
          endDate: "2025-10-22",
          modules: [
            { moduleId: "m1", title: "Réseaux de neurones" },
            { moduleId: "m2", title: "TensorFlow & Keras" },
            { moduleId: "m3", title: "Vision par ordinateur" },
          ],
        },
      ],
      advantages: [
        "Projets avec datasets réels",
        "Accès aux GPU pour l'entraînement",
        "Certification IBM Data Science",
        "Portfolio GitHub complet",
        "Mentorat par des Data Scientists",
        "Accès aux outils premium (Tableau, etc.)",
      ],
    },
  },
  {
    packId: "design-ux-ui",
    name: "Pack Design UX/UI",
    description: "Créez des expériences utilisateur exceptionnelles",
    image: "/images/design.png",
    details: {
      price: 450,
      originalPrice: 650,
      savings: 200,
      themes: [
        {
          themeId: "ux-research",
          name: "Recherche UX",
          startDate: "2025-09-10",
          endDate: "2025-09-17",
          modules: [
            { moduleId: "m1", title: "Méthodes de recherche utilisateur" },
            { moduleId: "m2", title: "Personas & User Journey" },
            { moduleId: "m3", title: "Tests utilisateurs" },
          ],
        },
        {
          themeId: "ui-design",
          name: "Design d'Interface",
          startDate: "2025-09-18",
          endDate: "2025-09-25",
          modules: [
            { moduleId: "m1", title: "Principes de design" },
            { moduleId: "m2", title: "Figma avancé" },
            { moduleId: "m3", title: "Design Systems" },
            { moduleId: "m4", title: "Prototypage interactif" },
          ],
        },
        {
          themeId: "mobile-design",
          name: "Design Mobile",
          startDate: "2025-09-26",
          endDate: "2025-10-03",
          modules: [
            { moduleId: "m1", title: "Design responsive" },
            { moduleId: "m2", title: "Applications mobiles" },
            { moduleId: "m3", title: "Micro-interactions" },
          ],
        },
      ],
      advantages: [
        "Portfolio de 10 projets design",
        "Accès aux outils Adobe Creative Suite",
        "Mentorat avec designers seniors",
        "Certification UX/UI reconnue",
        "Templates et ressources exclusives",
        "Feedback personnalisé sur vos créations",
      ],
    },
  },
  {
    packId: "business-entrepreneuriat",
    name: "Pack Business & Entrepreneuriat",
    description: "Lancez et développez votre entreprise avec succès",
    image: "/images/business.png",
    details: {
      price: 400,
      originalPrice: 600,
      savings: 200,
      themes: [
        {
          themeId: "business-plan",
          name: "Création d'Entreprise",
          startDate: "2025-09-05",
          endDate: "2025-09-12",
          modules: [
            { moduleId: "m1", title: "Business Model Canvas" },
            { moduleId: "m2", title: "Étude de marché" },
            { moduleId: "m3", title: "Plan financier" },
          ],
        },
        {
          themeId: "marketing-business",
          name: "Marketing & Ventes",
          startDate: "2025-09-13",
          endDate: "2025-09-20",
          modules: [
            { moduleId: "m1", title: "Stratégie marketing" },
            { moduleId: "m2", title: "Techniques de vente" },
            { moduleId: "m3", title: "Négociation commerciale" },
          ],
        },
        {
          themeId: "leadership",
          name: "Leadership & Management",
          startDate: "2025-09-21",
          endDate: "2025-09-28",
          modules: [
            { moduleId: "m1", title: "Management d'équipe" },
            { moduleId: "m2", title: "Communication efficace" },
            { moduleId: "m3", title: "Gestion de projet" },
          ],
        },
      ],
      advantages: [
        "Accompagnement personnalisé",
        "Réseau d'entrepreneurs",
        "Templates business exclusifs",
        "Sessions de coaching individuel",
        "Accès aux investisseurs",
        "Suivi post-formation 6 mois",
      ],
    },
  },
];

// Fonction pour convertir le prix selon la devise
export const convertPrice = (price: number, currency: string): string => {
  switch (currency) {
    case 'EUR':
      return `${price}€`;
    case 'USD':
      return `$${Math.round(price * 1.1)}`;
    case 'DTN':
      return `${Math.round(price * 3.3)} DT`;
    default:
      return `${price}€`;
  }
};
