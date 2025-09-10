export interface Program {
  id: string;
  title: string;
  description: string;
  sessions: { id: string; date: string; startDate: string; endDate: string }[];
  modules: string[];
  price?: number;
  duration: string;
  level: string;
  category: string;
  instructor: string;
  maxStudents: number;
  features: string[];
}

export const trainingPrograms: Program[] = [
  {
    id: "react-advanced",
    title: "Formation React Avancée",
    description: "Maîtrisez React avec les hooks avancés, la gestion d'état moderne et l'optimisation des performances pour créer des applications web robustes et évolutives.",
    sessions: [
      {
        id: "react-session-1",
        date: "20 Juin - 20 Septembre 2024",
        startDate: "2024-06-20",
        endDate: "2024-09-20"
      },
      {
        id: "react-session-2", 
        date: "1 Octobre - 2 Décembre 2024",
        startDate: "2024-10-01",
        endDate: "2024-12-02"
      },
      {
        id: "react-session-3",
        date: "15 Janvier - 15 Avril 2025",
        startDate: "2025-01-15",
        endDate: "2025-04-15"
      }
    ],
    modules: [
      "React Hooks Avancés",
      "Gestion d'état avec Redux Toolkit",
      "Optimisation des performances",
      "Tests unitaires avec Jest",
      "Déploiement et CI/CD",
      "Architecture composants"
    ],
    price: 2400,
    duration: "12 semaines",
    level: "Avancé",
    category: "Technologies",
    instructor: "Ahmed Benali",
    maxStudents: 25,
    features: [
      "Projets pratiques",
      "Mentorat personnalisé", 
      "Certificat de fin de formation",
      "Accès à vie aux ressources"
    ]
  },
  {
    id: "data-science-python",
    title: "Data Science avec Python",
    description: "Apprenez à analyser, visualiser et modéliser des données avec Python, pandas, scikit-learn et les techniques avancées de Machine Learning.",
    sessions: [
      {
        id: "data-session-1",
        date: "15 Août - 15 Novembre 2024",
        startDate: "2024-08-15",
        endDate: "2024-11-15"
      },
      {
        id: "data-session-2",
        date: "10 Janvier - 10 Avril 2025",
        startDate: "2025-01-10",
        endDate: "2025-04-10"
      },
      {
        id: "data-session-3",
        date: "1 Mai - 1 Août 2025",
        startDate: "2025-05-01",
        endDate: "2025-08-01"
      }
    ],
    modules: [
      "Nettoyage et préparation des données",
      "Analyse exploratoire avec pandas",
      "Machine Learning supervisé",
      "Machine Learning non supervisé",
      "Visualisation avancée avec Matplotlib/Seaborn",
      "Deep Learning avec TensorFlow"
    ],
    price: 2800,
    duration: "14 semaines",
    level: "Avancé",
    category: "Data Science",
    instructor: "Dr. Fatima El Mansouri",
    maxStudents: 20,
    features: [
      "Projets sur données réelles",
      "Accès aux outils cloud",
      "Portfolio de projets",
      "Certification IBM/Google"
    ]
  },
  {
    id: "leadership-management",
    title: "Leadership et Management",
    description: "Développez vos compétences en leadership stratégique, gestion d'équipe et prise de décision pour exceller dans vos responsabilités managériales.",
    sessions: [
      {
        id: "leadership-session-1",
        date: "5 Septembre - 5 Décembre 2024",
        startDate: "2024-09-05",
        endDate: "2024-12-05"
      },
      {
        id: "leadership-session-2",
        date: "20 Janvier - 20 Mars 2025",
        startDate: "2025-01-20",
        endDate: "2025-03-20"
      },
      {
        id: "leadership-session-3",
        date: "10 Avril - 10 Juillet 2025",
        startDate: "2025-04-10",
        endDate: "2025-07-10"
      }
    ],
    modules: [
      "Leadership stratégique et vision",
      "Gestion d'équipe et motivation",
      "Prise de décision et résolution de problèmes",
      "Communication et négociation",
      "Gestion du changement",
      "Intelligence émotionnelle"
    ],
    price: 1800,
    duration: "10 semaines",
    level: "Intermédiaire",
    category: "Business",
    instructor: "Mohamed Kharrat",
    maxStudents: 30,
    features: [
      "Études de cas réels",
      "Coaching individuel",
      "Certification PMI",
      "Réseau professionnel"
    ]
  },
  {
    id: "ux-ui-design",
    title: "UX/UI Design Professionnel",
    description: "Créez des expériences utilisateur exceptionnelles et des interfaces modernes avec Figma, les principes de design et les méthodologies UX.",
    sessions: [
      {
        id: "design-session-1",
        date: "10 Septembre - 10 Décembre 2024",
        startDate: "2024-09-10",
        endDate: "2024-12-10"
      },
      {
        id: "design-session-2",
        date: "25 Janvier - 25 Avril 2025",
        startDate: "2025-01-25",
        endDate: "2025-04-25"
      }
    ],
    modules: [
      "Recherche utilisateur et personas",
      "Wireframing et prototypage",
      "Design d'interface avec Figma",
      "Système de design et composants",
      "Tests utilisateur et itération",
      "Design responsive et mobile-first"
    ],
    price: 2200,
    duration: "12 semaines",
    level: "Intermédiaire",
    category: "Design",
    instructor: "Leila Trabelsi",
    maxStudents: 22,
    features: [
      "Portfolio professionnel",
      "Projets clients réels",
      "Mentorat design senior",
      "Certification Adobe"
    ]
  },
  {
    id: "marketing-digital",
    title: "Marketing Digital & Growth Hacking",
    description: "Maîtrisez les stratégies marketing modernes, l'acquisition client, l'analyse de données marketing et les techniques de croissance rapide.",
    sessions: [
      {
        id: "marketing-session-1",
        date: "1 Septembre - 1 Décembre 2024",
        startDate: "2024-09-01",
        endDate: "2024-12-01"
      },
      {
        id: "marketing-session-2",
        date: "15 Février - 15 Mai 2025",
        startDate: "2025-02-15",
        endDate: "2025-05-15"
      }
    ],
    modules: [
      "Stratégie marketing digitale",
      "SEO et référencement naturel",
      "Publicité Facebook et Google Ads",
      "Email marketing et automation",
      "Growth hacking et métriques",
      "Analytics et optimisation"
    ],
    price: 1900,
    duration: "11 semaines",
    level: "Intermédiaire",
    category: "Marketing",
    instructor: "Youssef Hadj",
    maxStudents: 28,
    features: [
      "Campagnes marketing réelles",
      "Outils premium inclus",
      "Certification Google/Facebook",
      "Suivi ROI personnalisé"
    ]
  },
  {
    id: "devops-cloud",
    title: "DevOps & Cloud Computing",
    description: "Automatisez vos déploiements, maîtrisez Docker, Kubernetes, AWS et les pratiques DevOps pour des infrastructures modernes et scalables.",
    sessions: [
      {
        id: "devops-session-1",
        date: "20 Août - 20 Novembre 2024",
        startDate: "2024-08-20",
        endDate: "2024-11-20"
      },
      {
        id: "devops-session-2",
        date: "5 Janvier - 5 Avril 2025",
        startDate: "2025-01-05",
        endDate: "2025-04-05"
      }
    ],
    modules: [
      "Introduction au DevOps et CI/CD",
      "Containerisation avec Docker",
      "Orchestration avec Kubernetes",
      "Cloud AWS/Azure",
      "Infrastructure as Code",
      "Monitoring et observabilité"
    ],
    price: 3200,
    duration: "13 semaines",
    level: "Avancé",
    category: "Technologies",
    instructor: "Omar Rachidi",
    maxStudents: 18,
    features: [
      "Labs cloud gratuits",
      "Projets d'infrastructure",
      "Certification AWS/Azure",
      "Mentorat DevOps senior"
    ]
  }
];

// Fonction utilitaire pour obtenir un programme par ID
export const getProgramById = (id: string): Program | undefined => {
  return trainingPrograms.find(program => program.id === id);
};

// Fonction utilitaire pour filtrer par catégorie
export const getProgramsByCategory = (category: string): Program[] => {
  return trainingPrograms.filter(program => program.category === category);
};

// Fonction utilitaire pour obtenir les sessions disponibles
export const getAvailableSessions = (programId: string): { id: string; date: string }[] => {
  const program = getProgramById(programId);
  if (!program) return [];
  
  const now = new Date();
  return program.sessions.filter(session => new Date(session.startDate) > now);
};
