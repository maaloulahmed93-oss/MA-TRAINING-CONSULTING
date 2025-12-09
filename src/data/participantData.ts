import { Participant, Formation, Project, CoachingResource, Notification, FAQ } from '../types/participant';

// Données mock pour les participants
export const mockParticipants: Record<string, Participant> = {
  'PART-2024-001': {
    id: 'PART-2024-001',
    name: 'Ahmed Benali',
    email: 'ahmed.benali@email.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    enrolledDate: '2024-01-15',
    totalProgress: 85,
    completedCourses: 12,
    totalCourses: 15,
    studyTime: 60,
    achievedGoals: 15,
    totalGoals: 18
  },
  'PART-2024-002': {
    id: 'PART-2024-002',
    name: 'Fatima El Mansouri',
    email: 'fatima.elmansouri@email.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
    enrolledDate: '2024-02-10',
    totalProgress: 92,
    completedCourses: 18,
    totalCourses: 20,
    studyTime: 90,
    achievedGoals: 22,
    totalGoals: 24
  },
  'PART-2024-003': {
    id: 'PART-2024-003',
    name: 'Youssef Trabelsi',
    email: 'youssef.trabelsi@example.com',
    avatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=150&h=150&fit=crop&crop=face',
    enrolledDate: '2024-03-12',
    totalProgress: 67,
    completedCourses: 8,
    totalCourses: 12,
    studyTime: 40,
    achievedGoals: 10,
    totalGoals: 15
  },
  // 'PART-814809': {
  //   id: 'PART-814809',
  //   name: 'aziz ben ameur',
  //   email: 'ameur@gmail.com',
  //   avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  //   enrolledDate: '2024-01-15',
  //   totalProgress: 0,
  //   completedCourses: 0,
  //   totalCourses: 6,
  //   studyTime: 0,
  //   achievedGoals: 0,
  //   totalGoals: 6
  // } // تم تعطيل البيانات التجريبية
};

// IDs d'accès valides pour le mock
export const validAccessIds = ['PART-2024-001', 'PART-2024-002', 'PART-2024-003', 'DEMO-ACCESS', 'STUDENT-2024'];

// Formations mock
export const mockFormations: Formation[] = [
  {
    id: 'FORM-001',
    title: 'Développement Web Full Stack',
    description: 'Maîtrisez le développement web moderne avec React, Node.js et MongoDB',
    domain: 'Développement Web',
    progress: 85,
    totalCourses: 6,
    completedCourses: 5,
    level: 'Avancé',
    duration: '120h',
    thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=300&h=200&fit=crop',
    courses: [
      {
        id: 'COURSE-001',
        title: 'Fondamentaux HTML/CSS',
        description: 'Bases du développement web',
        duration: '20h',
        progress: 100,
        isCompleted: true,
        modules: [
          {
            id: 'MOD-001',
            title: 'Introduction au HTML',
            description: 'Structure et sémantique HTML',
            duration: '2h',
            isCompleted: true,
            isLocked: false,
            type: 'video'
          },
          {
            id: 'MOD-002',
            title: 'Styling avec CSS',
            description: 'Mise en forme et layout',
            duration: '3h',
            isCompleted: true,
            isLocked: false,
            type: 'video'
          }
        ]
      },
      {
        id: 'COURSE-002',
        title: 'JavaScript Moderne',
        description: 'ES6+ et programmation asynchrone',
        duration: '25h',
        progress: 80,
        isCompleted: false,
        modules: [
          {
            id: 'MOD-003',
            title: 'Variables et fonctions',
            description: 'Concepts de base JavaScript',
            duration: '2h',
            isCompleted: true,
            isLocked: false,
            type: 'video'
          },
          {
            id: 'MOD-004',
            title: 'Promises et Async/Await',
            description: 'Programmation asynchrone',
            duration: '3h',
            isCompleted: false,
            isLocked: false,
            type: 'video'
          }
        ]
      }
    ]
  },
  {
    id: 'FORM-002',
    title: 'Marketing Digital Avancé',
    description: 'Stratégies marketing pour l\'ère numérique',
    domain: 'Marketing',
    progress: 60,
    totalCourses: 4,
    completedCourses: 2,
    level: 'Intermédiaire',
    duration: '80h',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop',
    courses: [
      {
        id: 'COURSE-003',
        title: 'SEO et référencement',
        description: 'Optimisation pour moteurs de recherche',
        duration: '20h',
        progress: 100,
        isCompleted: true,
        modules: [
          {
            id: 'MOD-005',
            title: 'Fondamentaux SEO',
            description: 'Bases du référencement naturel',
            duration: '2h',
            isCompleted: true,
            isLocked: false,
            type: 'video'
          }
        ]
      }
    ]
  },
  {
    id: 'FORM-003',
    title: 'Data Science & ML',
    description: 'Bases data science, Python, et machine learning',
    domain: 'Data',
    progress: 40,
    totalCourses: 2,
    completedCourses: 0,
    level: 'Débutant',
    duration: '100h',
    thumbnail: 'https://images.unsplash.com/photo-1516387938699-a93567ec168e?w=300&h=200&fit=crop',
    courses: [
      {
        id: 'COURSE-004',
        title: 'Python pour la Data',
        description: 'Numpy, Pandas, visualisation',
        duration: '20h',
        progress: 55,
        isCompleted: false,
        modules: [
          {
            id: 'MOD-006',
            title: 'Pandas Essentials',
            description: 'Manipulation de données avec Pandas',
            duration: '3h',
            isCompleted: false,
            isLocked: false,
            type: 'video'
          }
        ]
      },
      {
        id: 'COURSE-005',
        title: 'Introduction au Machine Learning',
        description: 'Régression, classification, pipelines',
        duration: '25h',
        progress: 25,
        isCompleted: false,
        modules: [
          {
            id: 'MOD-007',
            title: 'Régression Linéaire',
            description: 'Théorie et pratique',
            duration: '2h30',
            isCompleted: false,
            isLocked: false,
            type: 'video'
          }
        ]
      }
    ]
  }
];

// Projets mock
export const mockProjects: Project[] = [
  {
    id: 'PROJ-001',
    title: 'Site E-commerce React',
    description: 'Développer une boutique en ligne complète avec panier et paiement',
    formationId: 'FORM-001',
    formationTitle: 'Développement Web Full Stack',
    status: 'Accepté',
    submittedDate: '2024-06-15',
    dueDate: '2024-07-01',
    feedback: 'Excellent travail ! Interface utilisateur très bien conçue.',
    grade: 18,
    projectUrl: 'https://github.com/ahmed-benali/ecommerce-react-project',
    files: [
      {
        id: 'FILE-001',
        name: 'ecommerce-project.zip',
        size: '2.5 MB',
        type: 'application/zip',
        uploadDate: '2024-06-15'
      }
    ]
  },
  {
    id: 'PROJ-002',
    title: 'Campagne Marketing Digital',
    description: 'Créer une stratégie marketing complète pour une startup',
    formationId: 'FORM-002',
    formationTitle: 'Marketing Digital Avancé',
    status: 'En attente',
    dueDate: '2024-08-15',
    projectUrl: 'https://docs.google.com/presentation/d/1234567890/edit',
    files: []
  },
  {
    id: 'PROJ-003',
    title: 'Prédiction de prix immobiliers',
    description: 'Construire un modèle de régression',
    formationId: 'FORM-003',
    formationTitle: 'Data Science & ML',
    status: 'En attente',
    dueDate: '2024-09-10',
    projectUrl: 'https://colab.research.google.com/drive/1abcdef123456',
    files: []
  }
];

// Ressources de coaching mock
export const mockCoachingResources: CoachingResource[] = [
  {
    id: 'COACH-001',
    title: 'CV Template Moderne',
    description: 'Modèle de CV professionnel pour développeurs',
    type: 'CV Template',
    category: 'Templates',
    thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=300&h=200&fit=crop',
    downloadUrl: '#'
  },
  {
    id: 'COACH-002',
    title: 'Lettre de Motivation Tech',
    description: 'Exemple de lettre pour postes techniques',
    type: 'Lettre de motivation',
    category: 'Templates',
    thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300&h=200&fit=crop',
    downloadUrl: '#'
  },
  {
    id: 'COACH-003',
    title: 'Communication Efficace',
    description: 'Améliorer ses compétences de communication',
    type: 'Vidéo Soft Skills',
    category: 'Soft Skills',
    duration: '45 min',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop'
  },
  {
    id: 'COACH-004',
    title: 'Guide Entretien d\'Embauche',
    description: 'Préparer et réussir ses entretiens',
    type: 'Guide',
    category: 'Carrière',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
    downloadUrl: '#'
  },
  {
    id: 'COACH-005',
    title: 'Quiz Leadership Interactif',
    description: 'Jeu éducatif pour développer son leadership',
    type: 'Jeux Éducatifs',
    category: 'Soft Skills',
    duration: '30 min',
    thumbnail: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=200&fit=crop',
    downloadUrl: '#'
  },
  {
    id: 'COACH-006',
    title: 'Simulation Entretien Client',
    description: 'Scénario réaliste de gestion client difficile',
    type: 'Scénarios',
    category: 'Soft Skills',
    duration: '25 min',
    thumbnail: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=300&h=200&fit=crop',
    downloadUrl: '#'
  },
  {
    id: 'COACH-007',
    title: 'Bibliothèque Numérique RH',
    description: 'Collection de livres et articles sur les RH',
    type: 'Bibliothèque Online',
    category: 'Ressources',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
    downloadUrl: '#'
  },
  {
    id: 'COACH-008',
    title: 'Podcast Carrière Tech',
    description: 'Série de podcasts sur l\'industrie tech',
    type: 'Podcast',
    category: 'Carrière',
    duration: '120 min',
    thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=300&h=200&fit=crop',
    downloadUrl: '#'
  },
  {
    id: 'COACH-009',
    title: 'Atelier Gestion du Stress',
    description: 'Cycle interactive de gestion du stress au travail',
    type: 'Atelier Interactif',
    category: 'Soft Skills',
    duration: '60 min',
    thumbnail: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=300&h=200&fit=crop',
    downloadUrl: '#'
  },
  {
    id: 'COACH-010',
    title: 'Cas d\'Etude Marketing',
    description: 'Analyse de campagnes marketing réussies',
    type: 'Cas d\'Etude',
    category: 'Marketing',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop',
    downloadUrl: '#'
  },
  {
    id: 'COACH-011',
    title: 'Webinaire Innovation',
    description: 'Conférence en ligne sur l\'innovation digitale',
    type: 'Webinaire',
    category: 'Innovation',
    duration: '90 min',
    thumbnail: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=300&h=200&fit=crop',
    downloadUrl: '#'
  },
  {
    id: 'COACH-012',
    title: 'Outils Productivité',
    description: 'Collection d\'outils pour améliorer sa productivité',
    type: 'Outils',
    category: 'Productivité',
    thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop',
    downloadUrl: '#'
  }
];

// Notifications mock
export const mockNotifications: Notification[] = [
  {
    id: 'NOTIF-001',
    title: 'Nouvel examen disponible',
    message: 'L\'examen final de JavaScript Moderne est maintenant disponible',
    type: 'info',
    date: '2024-07-28',
    isRead: false,
    actionUrl: '/formations/FORM-001/courses/COURSE-002'
  },
  {
    id: 'NOTIF-002',
    title: 'Projet accepté',
    message: 'Félicitations ! Votre projet Site E-commerce React a été accepté',
    type: 'success',
    date: '2024-07-25',
    isRead: true
  },
  {
    id: 'NOTIF-003',
    title: 'Date limite approche',
    message: 'Il vous reste 3 jours pour soumettre votre Campagne Marketing Digital',
    type: 'warning',
    date: '2024-07-30',
    isRead: false,
    actionUrl: '/projets/PROJ-002'
  },
  {
    id: 'NOTIF-004',
    title: 'Nouveau contenu disponible',
    message: 'De nouvelles ressources de coaching ont été ajoutées',
    type: 'info',
    date: '2024-07-26',
    isRead: true,
    actionUrl: '/coaching'
  },
  {
    id: 'NOTIF-005',
    title: 'Offre d\'emploi - Développeur React Senior',
    message: 'Notre partenaire TechCorp recherche un développeur React Senior. Salaire: 45K-55K MAD. Veuillez contacter notre équipe d\'organisation si vous êtes intéressé.',
    type: 'job',
    date: '2024-08-05',
    isRead: false,
    actionUrl: 'contact-team',
    company: 'TechCorp',
    position: 'Développeur React Senior',
    salary: '45K-55K MAD'
  },
  {
    id: 'NOTIF-006',
    title: 'Offre d\'emploi - Chef de Projet Digital',
    message: 'DigitalSolutions cherche un Chef de Projet Digital expérimenté. CDI, télétravail possible. Veuillez contacter notre équipe d\'organisation si vous êtes intéressé.',
    type: 'job',
    date: '2024-08-04',
    isRead: false,
    actionUrl: 'contact-team',
    company: 'DigitalSolutions',
    position: 'Chef de Projet Digital',
    contract: 'CDI'
  },
  {
    id: 'NOTIF-007',
    title: 'Offre d\'emploi - Marketing Manager',
    message: 'StartupInnovante recrute un Marketing Manager créatif. Startup dynamique, équipe jeune. Veuillez contacter notre équipe d\'organisation si vous êtes intéressé.',
    type: 'job',
    date: '2024-08-03',
    isRead: true,
    actionUrl: 'contact-team',
    company: 'StartupInnovante',
    position: 'Marketing Manager',
    environment: 'Startup'
  },
  {
    id: 'NOTIF-008',
    title: 'Offre d\'emploi - Consultant RH',
    message: 'ConseilRH recherche un Consultant RH junior. Formation continue assurée. Veuillez contacter notre équipe d\'organisation si vous êtes intéressé.',
    type: 'job',
    date: '2024-08-02',
    isRead: false,
    actionUrl: 'contact-team',
    company: 'ConseilRH',
    position: 'Consultant RH Junior',
    benefits: 'Formation continue'
  }
];

// FAQ mock
export const mockFAQ: FAQ[] = [
  {
    id: 'FAQ-001',
    question: 'Comment accéder à mes formations ?',
    answer: 'Vous pouvez accéder à vos formations depuis la section "Mes Parcours" de votre tableau de bord. Cliquez sur une formation pour voir les cours et modules disponibles.',
    category: 'Formations',
    isPopular: true
  },
  {
    id: 'FAQ-002',
    question: 'Comment soumettre un projet ?',
    answer: 'Rendez-vous dans la section "Projets", sélectionnez le projet concerné et cliquez sur "Uploader un projet". Vous pouvez télécharger plusieurs fichiers.',
    category: 'Projets',
    isPopular: true
  },
  {
    id: 'FAQ-003',
    question: 'Que faire si j\'ai oublié mon ID d\'accès ?',
    answer: 'Contactez notre support à support@matrainingconsulting.com avec votre nom complet et email d\'inscription.',
    category: 'Compte',
    isPopular: false
  },
  {
    id: 'FAQ-004',
    question: 'Comment télécharger les ressources de coaching ?',
    answer: 'Dans la section "Coaching & Orientation", cliquez sur la ressource souhaitée puis sur le bouton "Télécharger".',
    category: 'Coaching',
    isPopular: true
  }
];
