import { Participant, ParticipantStats } from '../types/participant';

// Mock comprehensive participant data
export const mockParticipantsData: Participant[] = [
  {
    id: "PART-2024-001",
    fullName: "Ahmed Benali",
    firstName: "Ahmed",
    lastName: "Benali",
    email: "ahmed.benali@email.com",
    phone: "+216 20 123 456",
    address: "Tunis, Tunisie",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    status: "active",
    enrollmentDate: "2024-01-15",
    lastActivity: "2024-03-10",
    totalProgress: 75,
    formations: [
      {
        id: "FORM-001",
        title: "Développement Web Full Stack",
        description: "Formation complète en développement web moderne",
        domain: "Développement Web",
        level: "Avancé",
        duration: "6 mois",
        progress: 85,
        status: "in_progress",
        enrollmentDate: "2024-01-15",
        courses: [
          {
            id: "COURSE-001",
            title: "HTML & CSS Avancé",
            description: "Maîtrise complète du HTML5 et CSS3",
            progress: 100,
            isCompleted: true,
            duration: "4 semaines",
            sessions: [],
            modules: [
              {
                id: "MOD-001",
                title: "Introduction au HTML5",
                description: "Les bases du HTML5 moderne",
                duration: "2h",
                isCompleted: true,
                isLocked: false,
                type: "video",
                dataLinks: [
                  {
                    id: "LINK-001",
                    title: "Vidéo de cours - Introduction HTML5",
                    url: "https://example.com/video/html5-intro",
                    type: "video",
                    description: "Cours vidéo complet sur HTML5",
                    duration: "45min"
                  },
                  {
                    id: "LINK-002",
                    title: "Documentation HTML5",
                    url: "https://example.com/docs/html5.pdf",
                    type: "document",
                    description: "Guide complet HTML5",
                    fileSize: "2.5MB"
                  },
                  {
                    id: "LINK-003",
                    title: "Exercices pratiques",
                    url: "https://example.com/exercises/html5",
                    type: "exercise",
                    description: "Exercices pratiques HTML5"
                  }
                ]
              },
              {
                id: "MOD-002",
                title: "CSS3 et Flexbox",
                description: "Mise en page moderne avec CSS3",
                duration: "3h",
                isCompleted: true,
                isLocked: false,
                type: "video",
                dataLinks: [
                  {
                    id: "LINK-004",
                    title: "Cours CSS3 Flexbox",
                    url: "https://example.com/video/css3-flexbox",
                    type: "video",
                    duration: "1h30min"
                  },
                  {
                    id: "LINK-005",
                    title: "Cheat Sheet Flexbox",
                    url: "https://example.com/docs/flexbox-cheat.pdf",
                    type: "resource",
                    fileSize: "1.2MB"
                  }
                ]
              }
            ]
          },
          {
            id: "COURSE-002",
            title: "JavaScript Moderne",
            description: "ES6+ et programmation moderne",
            progress: 70,
            isCompleted: false,
            duration: "6 semaines",
            sessions: [],
            modules: [
              {
                id: "MOD-003",
                title: "ES6 Features",
                description: "Nouvelles fonctionnalités ES6",
                duration: "4h",
                isCompleted: true,
                isLocked: false,
                type: "video",
                dataLinks: [
                  {
                    id: "LINK-006",
                    title: "Cours ES6 Complet",
                    url: "https://example.com/video/es6-complete",
                    type: "video",
                    duration: "2h15min"
                  }
                ]
              },
              {
                id: "MOD-004",
                title: "Async/Await",
                description: "Programmation asynchrone moderne",
                duration: "3h",
                isCompleted: false,
                isLocked: false,
                type: "video",
                dataLinks: [
                  {
                    id: "LINK-007",
                    title: "Async Programming Guide",
                    url: "https://example.com/video/async-await",
                    type: "video",
                    duration: "1h45min"
                  }
                ]
              }
            ]
          }
        ],
        thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop"
      }
    ],
    projects: [
      {
        id: "PROJ-001",
        title: "Site E-commerce React",
        description: "Développer une boutique en ligne complète avec panier et paiement",
        formationId: "FORM-001",
        formationTitle: "Développement Web Full Stack",
        status: "accepted",
        submittedDate: "2024-06-15",
        dueDate: "2024-07-01",
        feedback: "Excellent travail ! Interface utilisateur très bien conçue.",
        grade: 18,
        files: [
          {
            id: "FILE-001",
            name: "ecommerce-project.zip",
            size: "2.5 MB",
            type: "application/zip",
            uploadDate: "2024-06-15",
            url: "https://example.com/files/ecommerce-project.zip"
          }
        ],
        createdAt: "2024-05-01T10:00:00Z",
        updatedAt: "2024-06-15T14:30:00Z"
      }
    ],
    coachingResources: [
      {
        id: "COACH-001",
        title: "CV Template Moderne",
        description: "Modèle de CV professionnel pour développeurs",
        type: "CV Template",
        category: "Templates",
        thumbnail: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=300&h=200&fit=crop",
        downloadUrl: "https://example.com/cv-template.docx",
        assignedDate: "2024-02-01",
        accessedDate: "2024-02-05",
        isCompleted: true,
        dataLinks: [
          {
            id: "RES-001",
            title: "Télécharger Template CV",
            url: "https://example.com/cv-template.docx",
            type: "download",
            description: "Template CV Word moderne",
            fileSize: "1.2MB"
          },
          {
            id: "RES-002",
            title: "Guide d'utilisation",
            url: "https://example.com/cv-guide.pdf",
            type: "download",
            description: "Guide pour personnaliser le CV",
            fileSize: "800KB"
          }
        ]
      },
      {
        id: "COACH-002",
        title: "Communication Efficace",
        description: "Améliorer ses compétences de communication",
        type: "Vidéo Soft Skills",
        category: "Soft Skills",
        duration: "45 min",
        thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop",
        assignedDate: "2024-02-10",
        isCompleted: false,
        dataLinks: [
          {
            id: "RES-003",
            title: "Vidéo - Communication Efficace",
            url: "https://example.com/video/communication",
            type: "video",
            description: "Formation vidéo complète",
            duration: "45min"
          },
          {
            id: "RES-004",
            title: "Exercices pratiques",
            url: "https://example.com/exercises/communication",
            type: "interactive",
            description: "Exercices interactifs de communication"
          }
        ]
      }
    ],
    notifications: [
      {
        id: "NOTIF-001",
        title: "Nouvel examen disponible",
        message: "L'examen final de JavaScript Moderne est maintenant disponible",
        type: "info",
        date: "2024-07-28",
        isRead: false,
        actionUrl: "/formations/FORM-001/courses/COURSE-002",
        dataLinks: [
          {
            id: "NOT-001",
            title: "Accéder à l'examen",
            url: "/formations/FORM-001/courses/COURSE-002/exam",
            type: "action",
            description: "Passer l'examen JavaScript"
          }
        ]
      },
      {
        id: "NOTIF-002",
        title: "Projet accepté",
        message: "Félicitations ! Votre projet Site E-commerce React a été accepté",
        type: "info",
        date: "2024-07-25",
        isRead: true
      },
      {
        id: "NOTIF-003",
        title: "Offre d'emploi - Développeur React Senior",
        message: "Notre partenaire TechCorp recherche un développeur React Senior. Salaire: 45K-55K MAD.",
        type: "job",
        date: "2024-08-05",
        isRead: false,
        actionUrl: "contact-team",
        company: "TechCorp",
        jobTitle: "Développeur React Senior",
        salary: "45K-55K MAD",
        dataLinks: [
          {
            id: "NOT-002",
            title: "Voir l'offre complète",
            url: "/jobs/techcorp-react-senior",
            type: "external",
            description: "Détails complets de l'offre d'emploi"
          },
          {
            id: "NOT-003",
            title: "Contacter l'équipe",
            url: "/contact-team",
            type: "action",
            description: "Contacter notre équipe d'orientation"
          }
        ]
      }
    ],
    notes: "Étudiant très motivé avec d'excellents résultats. Montre un grand intérêt pour les nouvelles technologies.",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-03-10T14:30:00Z"
  },
  {
    id: "PART-2024-002",
    fullName: "Fatima El Mansouri",
    firstName: "Fatima",
    lastName: "El Mansouri",
    email: "fatima.elmansouri@email.com",
    phone: "+216 21 456 789",
    address: "Sfax, Tunisie",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face",
    status: "active",
    enrollmentDate: "2024-02-10",
    lastActivity: "2024-03-08",
    totalProgress: 60,
    formations: [
      {
        id: "FORM-002",
        title: "Marketing Digital Avancé",
        description: "Stratégies marketing digitales modernes",
        domain: "Marketing",
        level: "Intermédiaire",
        duration: "4 mois",
        progress: 60,
        status: "in_progress",
        enrollmentDate: "2024-02-10",
        courses: [
          {
            id: "COURSE-003",
            title: "SEO & SEM",
            description: "Optimisation pour les moteurs de recherche",
            progress: 80,
            isCompleted: false,
            duration: "3 semaines",
            sessions: [],
            modules: [
              {
                id: "MOD-005",
                title: "Bases du SEO",
                description: "Fondamentaux du référencement naturel",
                duration: "2h30",
                isCompleted: true,
                isLocked: false,
                type: "video",
                dataLinks: [
                  {
                    id: "LINK-008",
                    title: "Cours SEO Complet",
                    url: "https://example.com/video/seo-basics",
                    type: "video",
                    duration: "2h30min"
                  }
                ]
              }
            ]
          }
        ],
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop"
      }
    ],
    projects: [
      {
        id: "PROJ-002",
        title: "Campagne Marketing Digital",
        description: "Créer une stratégie marketing complète pour une startup",
        formationId: "FORM-002",
        formationTitle: "Marketing Digital Avancé",
        status: "in_progress",
        dueDate: "2024-08-15",
        files: [],
        createdAt: "2024-07-01T10:00:00Z",
        updatedAt: "2024-07-15T14:30:00Z"
      }
    ],
    coachingResources: [
      {
        id: "COACH-003",
        title: "Guide Entretien d'Embauche",
        description: "Préparer et réussir ses entretiens",
        type: "Guide",
        category: "Carrière",
        thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop",
        downloadUrl: "https://example.com/interview-guide.pdf",
        assignedDate: "2024-03-01",
        isCompleted: false,
        dataLinks: [
          {
            id: "RES-005",
            title: "Guide PDF",
            url: "https://example.com/interview-guide.pdf",
            type: "download",
            fileSize: "1.8MB"
          }
        ]
      }
    ],
    notifications: [
      {
        id: "NOTIF-004",
        title: "Date limite approche",
        message: "Il vous reste 3 jours pour soumettre votre Campagne Marketing Digital",
        type: "info",
        date: "2024-07-30",
        isRead: false,
        actionUrl: "/projets/PROJ-002"
      }
    ],
    notes: "Très créative dans ses approches marketing. Besoin d'accompagnement technique.",
    createdAt: "2024-02-10T10:00:00Z",
    updatedAt: "2024-03-08T14:30:00Z"
  },
  {
    id: "PART-2024-003",
    fullName: "Youssef Trabelsi",
    firstName: "Youssef",
    lastName: "Trabelsi",
    email: "youssef.trabelsi@example.com",
    phone: "+216 22 789 012",
    address: "Sousse, Tunisie",
    avatar: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=150&h=150&fit=crop&crop=face",
    status: "inactive",
    enrollmentDate: "2024-03-12",
    lastActivity: "2024-05-20",
    totalProgress: 42,
    formations: [
      {
        id: "FORM-003",
        title: "Data Science & ML",
        description: "Bases data science, Python, et machine learning",
        domain: "Data",
        level: "Débutant",
        duration: "5 mois",
        progress: 40,
        status: "in_progress",
        enrollmentDate: "2024-03-12",
        courses: [
          {
            id: "COURSE-004",
            title: "Python pour la Data",
            description: "Numpy, Pandas, visualisation",
            progress: 55,
            isCompleted: false,
            duration: "4 semaines",
            sessions: [],
            modules: [
              {
                id: "MOD-006",
                title: "Pandas Essentials",
                description: "Manipulation de données avec Pandas",
                duration: "3h",
                isCompleted: false,
                isLocked: false,
                type: "video",
                dataLinks: [
                  {
                    id: "LINK-009",
                    title: "Tutoriel Pandas",
                    url: "https://example.com/video/pandas-basics",
                    type: "video",
                    duration: "1h20min"
                  },
                  {
                    id: "LINK-010",
                    title: "Notebook d'exemples",
                    url: "https://example.com/notebooks/pandas.ipynb",
                    type: "resource"
                  }
                ]
              }
            ]
          },
          {
            id: "COURSE-005",
            title: "Introduction au Machine Learning",
            description: "Régression, classification, pipelines",
            progress: 25,
            isCompleted: false,
            duration: "6 semaines",
            sessions: [],
            modules: [
              {
                id: "MOD-007",
                title: "Régression Linéaire",
                description: "Théorie et pratique",
                duration: "2h30",
                isCompleted: false,
                isLocked: false,
                type: "video",
                dataLinks: [
                  {
                    id: "LINK-011",
                    title: "Cours - Régression Linéaire",
                    url: "https://example.com/video/linear-reg",
                    type: "video",
                    duration: "1h15min"
                  },
                  {
                    id: "LINK-012",
                    title: "Dataset d'exemple",
                    url: "https://example.com/data/housing.csv",
                    type: "resource"
                  }
                ]
              }
            ]
          }
        ],
        thumbnail: "https://images.unsplash.com/photo-1516387938699-a93567ec168e?w=300&h=200&fit=crop"
      }
    ],
    projects: [
      {
        id: "PROJ-003",
        title: "Prédiction de prix immobiliers",
        description: "Construire un modèle de régression",
        formationId: "FORM-003",
        formationTitle: "Data Science & ML",
        status: "not_started",
        dueDate: "2024-09-10",
        files: [],
        createdAt: "2024-07-20T09:00:00Z",
        updatedAt: "2024-07-20T09:00:00Z"
      }
    ],
    coachingResources: [
      {
        id: "COACH-004",
        title: "Guide Git Professionnel",
        description: "Bonnes pratiques Git et workflows",
        type: "Guide",
        category: "Ressources",
        thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=300&h=200&fit=crop",
        assignedDate: "2024-04-01",
        isCompleted: false,
        dataLinks: [
          {
            id: "RES-006",
            title: "Guide PDF Git",
            url: "https://example.com/git-guide.pdf",
            type: "download",
            fileSize: "2.1MB"
          }
        ]
      }
    ],
    notifications: [
      {
        id: "NOTIF-005",
        title: "Nouvelle ressource assignée",
        message: "Un guide Git a été ajouté à vos ressources",
        type: "info",
        date: "2024-04-01",
        isRead: false
      },
      {
        id: "NOTIF-006",
        title: "Offre d'emploi - Data Analyst Junior",
        message: "DataWorks recrute un Data Analyst Junior",
        type: "job",
        date: "2024-08-01",
        isRead: false,
        company: "DataWorks",
        position: "Data Analyst Junior",
        salary: "3.0K-3.8K TND",
        actionUrl: "/jobs/dataworks-analyst",
        dataLinks: [
          {
            id: "NOT-004",
            title: "Voir l'offre",
            url: "/jobs/dataworks-analyst",
            type: "external"
          }
        ]
      }
    ],
    notes: "Besoin de rattrapage sur les modules ML.",
    createdAt: "2024-03-12T10:00:00Z",
    updatedAt: "2024-05-20T12:45:00Z"
  }
];

export const mockParticipantStats: ParticipantStats = {
  total: 156,
  active: 134,
  graduated: 22,
  suspended: 0,
  newThisMonth: 12,
  averageProgress: 68
};

// Helper functions
export const getParticipantById = (id: string): Participant | undefined => {
  return mockParticipantsData.find(participant => participant.id === id);
};

export const getParticipantsByStatus = (status: Participant['status']): Participant[] => {
  return mockParticipantsData.filter(participant => participant.status === status);
};

export const searchParticipants = (query: string): Participant[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockParticipantsData.filter(participant =>
    participant.fullName.toLowerCase().includes(lowercaseQuery) ||
    participant.email.toLowerCase().includes(lowercaseQuery) ||
    participant.id.toLowerCase().includes(lowercaseQuery)
  );
};
