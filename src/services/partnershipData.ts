import { 
  Partner, 
  PartnershipProject, 
  CoAnimatedFormation, 
  PartnershipEvent, 
  PartnershipMessage,
  PartnershipStats 
} from '../types/partnership';

// Email de l'administrateur pour les communications
const ADMIN_EMAIL = 'admin@siteen.com';

// Données mock des partenaires
export const mockPartners: Partner[] = [
  {
    id: 'PARTNER123',
    name: 'TechCorp Solutions',
    email: 'contact@techcorp.com',
    type: 'Entreprise',
    contactPerson: 'Sarah Martinez',
    phone: '+33 1 23 45 67 89',
    address: '123 Avenue des Champs-Élysées, 75008 Paris',
    website: 'https://techcorp.com',
    joinDate: '2023-06-15',
    description: 'Entreprise leader dans les solutions technologiques innovantes'
  },
  {
    id: 'ENTREPRISE456',
    name: 'École Supérieure de Commerce',
    email: 'partenariats@esc-business.edu',
    type: 'École',
    contactPerson: 'Dr. Michel Dubois',
    phone: '+33 1 98 76 54 32',
    address: '456 Boulevard Saint-Germain, 75006 Paris',
    website: 'https://esc-business.edu',
    joinDate: '2023-03-20',
    description: 'École de commerce reconnue pour l\'excellence de ses programmes'
  }
];

// Données mock des projets de partenariat
export const mockPartnershipProjects: PartnershipProject[] = [
  {
    id: '1',
    title: 'Programme de Formation IA & Machine Learning',
    description: 'Développement d\'un programme complet de formation en intelligence artificielle pour les employés de TechCorp',
    partnerId: 'PARTNER123',
    status: 'in_progress',
    progress: 65,
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    budget: 45000,
    participants: ['Sarah Martinez', 'Jean Dupont', 'Marie Claire', 'Ahmed Ben Ali'],
    objectives: [
      'Former 50 employés aux bases de l\'IA',
      'Créer un centre d\'excellence interne',
      'Développer 3 projets pilotes',
      'Établir une roadmap technologique'
    ],
    deliverables: [
      'Modules de formation interactifs',
      'Certification interne',
      'Documentation technique',
      'Projets pratiques'
    ]
  },
  {
    id: '2',
    title: 'Cursus Digital Marketing Avancé',
    description: 'Création d\'un cursus spécialisé en marketing digital pour les étudiants de l\'ESC',
    partnerId: 'ENTREPRISE456',
    status: 'planning',
    progress: 25,
    startDate: '2024-03-01',
    endDate: '2024-12-15',
    budget: 32000,
    participants: ['Dr. Michel Dubois', 'Prof. Claire Martin', 'Directeur Pédagogique'],
    objectives: [
      'Intégrer le digital dans le cursus',
      'Former les professeurs',
      'Créer des partenariats entreprises',
      'Développer des cas pratiques'
    ],
    deliverables: [
      'Programme pédagogique complet',
      'Supports de cours',
      'Plateforme e-learning',
      'Évaluations et certifications'
    ]
  },
  {
    id: '3',
    title: 'Innovation Lab Collaboratif',
    description: 'Mise en place d\'un laboratoire d\'innovation partagé pour l\'expérimentation',
    partnerId: 'PARTNER123',
    status: 'completed',
    progress: 100,
    startDate: '2023-09-01',
    endDate: '2024-01-31',
    budget: 28000,
    participants: ['Équipe Innovation', 'Consultants externes', 'Étudiants stagiaires'],
    objectives: [
      'Créer un espace d\'innovation',
      'Développer des prototypes',
      'Tester de nouvelles technologies',
      'Favoriser la collaboration'
    ],
    deliverables: [
      'Espace physique équipé',
      '5 prototypes développés',
      'Méthodologie d\'innovation',
      'Rapport d\'impact'
    ]
  }
];

// Données mock des formations co-animées
export const mockCoAnimatedFormations: CoAnimatedFormation[] = [
  {
    id: '1',
    title: 'Leadership Digital & Transformation',
    description: 'Formation intensive sur le leadership dans l\'ère digitale',
    partnerId: 'PARTNER123',
    trainers: ['Expert Siteen 1', 'Expert Siteen 2'],
    partnerTrainers: ['Sarah Martinez', 'CTO TechCorp'],
    date: '2024-02-20',
    duration: 16,
    location: 'hybrid',
    participants: 25,
    status: 'completed',
    materials: ['Slides de présentation', 'Cas d\'étude', 'Templates', 'Ressources vidéo']
  },
  {
    id: '2',
    title: 'Data Science pour les Managers',
    description: 'Initiation à la data science pour les profils non-techniques',
    partnerId: 'ENTREPRISE456',
    trainers: ['Data Scientist Siteen', 'Formateur BI'],
    partnerTrainers: ['Prof. Claire Martin', 'Intervenant externe'],
    date: '2024-03-15',
    duration: 24,
    location: 'onsite',
    participants: 30,
    status: 'scheduled',
    materials: ['Datasets d\'exemple', 'Outils d\'analyse', 'Guides pratiques']
  },
  {
    id: '3',
    title: 'Stratégie Digitale & Innovation',
    description: 'Atelier sur les stratégies d\'innovation digitale',
    partnerId: 'PARTNER123',
    trainers: ['Consultant Stratégie', 'Expert Innovation'],
    partnerTrainers: ['Directeur Innovation', 'Chef de Projet Digital'],
    date: '2024-04-10',
    duration: 12,
    location: 'online',
    participants: 20,
    status: 'scheduled',
    materials: ['Framework stratégique', 'Outils d\'innovation', 'Benchmarks sectoriels']
  }
];

// Données mock des événements
export const mockPartnershipEvents: PartnershipEvent[] = [
  {
    id: '1',
    title: 'Conférence Innovation & IA',
    description: 'Grande conférence sur les dernières innovations en intelligence artificielle',
    type: 'conference',
    partnerId: 'PARTNER123',
    date: '2024-03-25',
    time: '09:00',
    duration: 8,
    location: 'Centre de Conférences Paris La Défense',
    maxParticipants: 200,
    currentParticipants: 156,
    status: 'upcoming',
    organizers: ['Équipe Siteen', 'TechCorp Solutions', 'Partenaires externes'],
    agenda: [
      '09:00 - Accueil et networking',
      '10:00 - Keynote: L\'avenir de l\'IA',
      '11:30 - Table ronde: IA et éthique',
      '14:00 - Ateliers pratiques',
      '16:30 - Présentation de projets',
      '18:00 - Cocktail de clôture'
    ]
  },
  {
    id: '2',
    title: 'Séminaire Marketing Digital',
    description: 'Séminaire intensif sur les nouvelles tendances du marketing digital',
    type: 'seminar',
    partnerId: 'ENTREPRISE456',
    date: '2024-04-12',
    time: '14:00',
    duration: 4,
    location: 'Campus ESC Business School',
    maxParticipants: 50,
    currentParticipants: 38,
    status: 'upcoming',
    organizers: ['Professeurs ESC', 'Experts Siteen Marketing'],
    agenda: [
      '14:00 - Introduction aux nouvelles tendances',
      '15:00 - Social Media Marketing avancé',
      '16:00 - Pause networking',
      '16:30 - Marketing automation',
      '17:30 - Q&A et discussions'
    ]
  },
  {
    id: '3',
    title: 'Workshop Agile & Scrum',
    description: 'Atelier pratique sur les méthodologies agiles',
    type: 'workshop',
    partnerId: 'PARTNER123',
    date: '2024-02-28',
    time: '10:00',
    duration: 6,
    location: 'Locaux TechCorp Solutions',
    maxParticipants: 30,
    currentParticipants: 30,
    status: 'completed',
    organizers: ['Scrum Master Siteen', 'Équipe Agile TechCorp'],
    agenda: [
      '10:00 - Principes Agile',
      '11:30 - Framework Scrum',
      '14:00 - Mise en pratique',
      '15:30 - Retour d\'expérience',
      '16:00 - Plan d\'action'
    ]
  }
];

// Données mock des messages
export const mockPartnershipMessages: PartnershipMessage[] = [
  {
    id: '1',
    from: 'admin@siteen.com',
    to: 'contact@techcorp.com',
    subject: 'Suivi du projet IA & Machine Learning',
    content: 'Bonjour Sarah,\n\nJ\'espère que vous allez bien. Je souhaitais faire le point sur l\'avancement du projet de formation IA...',
    timestamp: '2024-02-15T10:30:00Z',
    status: 'read',
    priority: 'medium'
  },
  {
    id: '2',
    from: 'contact@techcorp.com',
    to: 'admin@siteen.com',
    subject: 'Demande d\'ajustement du planning',
    content: 'Bonjour,\n\nSuite à notre réunion de ce matin, nous souhaiterions ajuster le planning de formation...',
    timestamp: '2024-02-14T16:45:00Z',
    status: 'read',
    priority: 'high'
  }
];

// Statistiques mock du partenariat
export const mockPartnershipStats: PartnershipStats = {
  totalProjects: 8,
  activeProjects: 3,
  completedProjects: 5,
  totalFormations: 12,
  upcomingEvents: 4,
  totalParticipants: 156,
  partnershipDuration: 9, // mois
  satisfactionRate: 94
};

// Fonctions CRUD pour les partenaires
export const getPartners = (): Partner[] => {
  return mockPartners;
};

export const getPartnerById = (partnerId: string): Partner | undefined => {
  return mockPartners.find(partner => partner.id === partnerId);
};

// Fonctions CRUD pour les projets
export const getPartnershipProjects = (partnerId?: string): PartnershipProject[] => {
  if (partnerId) {
    return mockPartnershipProjects.filter(project => project.partnerId === partnerId);
  }
  return mockPartnershipProjects;
};

// Fonctions CRUD pour les formations
export const getCoAnimatedFormations = (partnerId?: string): CoAnimatedFormation[] => {
  if (partnerId) {
    return mockCoAnimatedFormations.filter(formation => formation.partnerId === partnerId);
  }
  return mockCoAnimatedFormations;
};

// Fonctions CRUD pour les événements
export const getPartnershipEvents = (partnerId?: string): PartnershipEvent[] => {
  if (partnerId) {
    return mockPartnershipEvents.filter(event => event.partnerId === partnerId);
  }
  return mockPartnershipEvents;
};

// Fonctions CRUD pour les messages
export const getPartnershipMessages = (partnerEmail?: string): PartnershipMessage[] => {
  if (partnerEmail) {
    return mockPartnershipMessages.filter(
      message => message.from === partnerEmail || message.to === partnerEmail
    );
  }
  return mockPartnershipMessages;
};

// Fonction pour obtenir les statistiques
export const getPartnershipStats = (_partnerId?: string): PartnershipStats => {
  // Pour la démo, on retourne les stats globales
  // En production, on filtrerait par partnerId
  return mockPartnershipStats;
};

// Fonction pour envoyer un email (simulation)
export const sendPartnershipEmail = (
  to: string,
  subject: string,
  content: string,
  _attachments?: string[]
): string => {
  const partner = getPartnerById(to);
  const recipientEmail = partner ? partner.email : ADMIN_EMAIL;
  
  const body = `${content}\n\n---\nEnvoyé depuis l'Espace Partenariat Siteen`;
  
  return `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};
