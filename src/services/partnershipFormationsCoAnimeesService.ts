/**
 * Service de gestion des formations co-animées
 * Utilise localStorage pour la persistance des données
 */

// Types Certificat
export type CertificateCategory = 'certificate' | 'diploma' | 'attestation';

export interface CertificateInfo {
  category: CertificateCategory; // certificat, diplôme, attestation
  type: string; // ex: de formation, de participation, de réussite, etc.
  issuer: string; // الجهة المانحة للشهادة
}

// Interface pour les formations co-animées
export interface FormationCoAnimee {
  id: string;
  title: string;
  date: string;
  trainers: string[];
  participants: { id: string; name: string; email: string }[];
  resources: { id: string; name: string; url: string }[];
  feedbacks: { id: string; author: string; comment: string; rating: number }[];
  certificateAvailable: boolean;
  certificateInfo?: CertificateInfo; // détails optionnels du certificat
  events?: EventItem[]; // Événements & Séminaires
}

export interface EventItem {
  id: string;
  title: string;
  date: string; // ISO date
  location?: string;
  description?: string;
}

// Clé pour le localStorage - maintenant avec support partnerId
const STORAGE_KEY = 'formationsCoAnimees';

// Fonction pour obtenir la clé spécifique au partenaire
const getPartnerStorageKey = (partnerId?: string): string => {
  if (partnerId) {
    return `${STORAGE_KEY}_${partnerId}`;
  }
  return STORAGE_KEY;
};

/**
 * Génère les données mock par défaut
 */
const generateMockData = (): FormationCoAnimee[] => {
  return [
    {
      id: 'formation-1',
      title: 'Formation Agile & Scrum',
      date: '2024-03-15',
      trainers: ['Marie Dubois', 'Ahmed Ben Ali'],
      participants: [
        { id: 'p1', name: 'Sophie Martin', email: 'sophie.martin@entreprise.com' },
        { id: 'p2', name: 'Thomas Leroy', email: 'thomas.leroy@startup.fr' },
        { id: 'p3', name: 'Fatima El Mansouri', email: 'fatima.elmansouri@digital.ma' }
      ],
      resources: [
        { id: 'r1', name: 'Guide Scrum Master.pdf', url: '#guide-scrum' },
        { id: 'r2', name: 'Présentation Agile.pptx', url: '#presentation-agile' },
        { id: 'r3', name: 'Exercices Pratiques Sprint.docx', url: '#exercices-sprint' },
        { id: 'r4', name: 'Templates User Stories.xlsx', url: '#templates-stories' }
      ],
      feedbacks: [
        { 
          id: 'f1', 
          author: 'Sophie Martin', 
          comment: 'Formation très enrichissante, les concepts sont bien expliqués avec des exemples concrets. Les ateliers pratiques m\'ont permis de mieux comprendre la méthodologie Scrum.', 
          rating: 5 
        },
        { 
          id: 'f2', 
          author: 'Thomas Leroy', 
          comment: 'Excellente formation ! Les formateurs sont très compétents et savent adapter le contenu aux besoins de chaque participant.', 
          rating: 5 
        },
        { 
          id: 'f3', 
          author: 'Fatima El Mansouri', 
          comment: 'Formation de qualité avec de bons exemples pratiques. J\'aurais aimé plus de temps sur les outils de gestion de projet.', 
          rating: 4 
        }
      ],
      certificateAvailable: true,
      events: []
    },
    {
      id: 'formation-2',
      title: 'Formation UX Design',
      date: '2024-04-20',
      trainers: ['Claire Rousseau', 'Karim Benali'],
      participants: [
        { id: 'p4', name: 'Omar Rachidi', email: 'omar.rachidi@design.co' },
        { id: 'p5', name: 'Nadia Benali', email: 'nadia.benali@creative.fr' }
      ],
      resources: [
        { id: 'r5', name: 'Principes UX Design.pdf', url: '#principes-ux' },
        { id: 'r6', name: 'Wireframes Templates.sketch', url: '#wireframes' },
        { id: 'r7', name: 'Guide Personas.pptx', url: '#guide-personas' }
      ],
      feedbacks: [
        { 
          id: 'f4', 
          author: 'Omar Rachidi', 
          comment: 'Formation très complète sur les fondamentaux de l\'UX. Les exercices pratiques sont bien pensés.', 
          rating: 4 
        }
      ],
      certificateAvailable: true
    },
    {
      id: 'formation-3',
      title: 'Formation DevOps & CI/CD',
      date: '2024-05-10',
      trainers: ['Youssef Alami', 'Sarah Benkirane', 'Jean-Pierre Martin'],
      participants: [
        { id: 'p6', name: 'Mohamed Tazi', email: 'mohamed.tazi@tech.ma' },
        { id: 'p7', name: 'Laila Chraibi', email: 'laila.chraibi@devops.com' },
        { id: 'p8', name: 'Antoine Dubois', email: 'antoine.dubois@cloud.fr' },
        { id: 'p9', name: 'Zineb Alaoui', email: 'zineb.alaoui@startup.ma' }
      ],
      resources: [
        { id: 'r8', name: 'Guide Docker.pdf', url: '#guide-docker' },
        { id: 'r9', name: 'Pipeline CI-CD Jenkins.yml', url: '#pipeline-jenkins' },
        { id: 'r10', name: 'Scripts Kubernetes.zip', url: '#scripts-k8s' },
        { id: 'r11', name: 'Monitoring Prometheus.json', url: '#monitoring' },
        { id: 'r12', name: 'Best Practices DevOps.pptx', url: '#best-practices' }
      ],
      feedbacks: [
        { 
          id: 'f5', 
          author: 'Mohamed Tazi', 
          comment: 'Formation technique excellente ! Les démonstrations pratiques avec Docker et Kubernetes sont très utiles.', 
          rating: 5 
        },
        { 
          id: 'f6', 
          author: 'Laila Chraibi', 
          comment: 'Contenu dense mais bien structuré. Les formateurs maîtrisent parfaitement leur sujet.', 
          rating: 5 
        },
        { 
          id: 'f7', 
          author: 'Antoine Dubois', 
          comment: 'Très bonne formation, j\'ai pu directement appliquer les concepts dans mon travail.', 
          rating: 4 
        }
      ],
      certificateAvailable: true
    },
    {
      id: 'formation-4',
      title: 'Formation Data Science & Machine Learning',
      date: '2024-06-15',
      trainers: ['Dr. Amina Benali', 'Rachid El Fassi'],
      participants: [
        { id: 'p10', name: 'Khalid Benjelloun', email: 'khalid.benjelloun@data.ma' },
        { id: 'p11', name: 'Samira Ouali', email: 'samira.ouali@ai.com' },
        { id: 'p12', name: 'Hassan Alami', email: 'hassan.alami@analytics.fr' }
      ],
      resources: [
        { id: 'r13', name: 'Introduction Python Data Science.ipynb', url: '#python-ds' },
        { id: 'r14', name: 'Datasets Exemples.csv', url: '#datasets' },
        { id: 'r15', name: 'Algorithmes ML.pdf', url: '#algo-ml' },
        { id: 'r16', name: 'Visualisation Matplotlib.py', url: '#matplotlib' }
      ],
      feedbacks: [
        { 
          id: 'f8', 
          author: 'Khalid Benjelloun', 
          comment: 'Formation de haut niveau avec des intervenants experts. Les cas d\'usage sont très pertinents.', 
          rating: 5 
        },
        { 
          id: 'f9', 
          author: 'Samira Ouali', 
          comment: 'Excellente approche pédagogique, du théorique au pratique avec de vrais projets.', 
          rating: 5 
        }
      ],
      certificateAvailable: true
    },
    {
      id: 'formation-5',
      title: 'Formation Leadership & Management',
      date: '2024-07-08',
      trainers: ['Noureddine Benali', 'Isabelle Moreau'],
      participants: [
        { id: 'p13', name: 'Aicha Bennani', email: 'aicha.bennani@management.ma' },
        { id: 'p14', name: 'Karim Ziani', email: 'karim.ziani@leadership.com' }
      ],
      resources: [
        { id: 'r17', name: 'Styles de Leadership.pdf', url: '#styles-leadership' },
        { id: 'r18', name: 'Outils Communication.pptx', url: '#outils-comm' },
        { id: 'r19', name: 'Gestion Conflits.docx', url: '#gestion-conflits' }
      ],
      feedbacks: [
        { 
          id: 'f10', 
          author: 'Aicha Bennani', 
          comment: 'Formation transformatrice ! J\'ai développé de nouvelles compétences en leadership qui m\'aident au quotidien.', 
          rating: 5 
        }
      ],
      certificateAvailable: false,
      events: []
    },
    {
      id: 'formation-6',
      title: 'Formation Cybersécurité',
      date: '2024-08-12',
      trainers: ['Mehdi Alaoui', 'Sophie Durand', 'Ahmed Tazi'],
      participants: [],
      resources: [],
      feedbacks: [],
      certificateAvailable: false,
      events: []
    }
  ];
};

/**
 * Récupère toutes les formations depuis localStorage avec support partnerId
 */
export const getFormationsCoAnimees = (partnerId?: string): FormationCoAnimee[] => {
  try {
    const storageKey = getPartnerStorageKey(partnerId);
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Si aucune donnée n'existe pour ce partenaire, retourner un tableau vide
    // (plus de données mock par défaut pour éviter la confusion)
    return [];
  } catch (error) {
    console.error('Erreur lors de la récupération des formations:', error);
    return [];
  }
};

/**
 * Récupère une formation par son ID
 */
export const getFormationById = (id: string, partnerId?: string): FormationCoAnimee | undefined => {
  const formations = getFormationsCoAnimees(partnerId);
  return formations.find(formation => formation.id === id);
};

/**
 * Sauvegarde les formations dans localStorage avec support partnerId
 */
export const saveFormationsCoAnimees = (formations: FormationCoAnimee[], partnerId?: string): void => {
  try {
    const storageKey = getPartnerStorageKey(partnerId);
    localStorage.setItem(storageKey, JSON.stringify(formations));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des formations:', error);
  }
};

/**
 * Ajoute une nouvelle formation
 */
export const addFormation = (formation: Omit<FormationCoAnimee, 'id'>): FormationCoAnimee => {
  const formations = getFormationsCoAnimees();
  const newFormation: FormationCoAnimee = {
    ...formation,
    id: `formation-${Date.now()}`
  };
  
  formations.push(newFormation);
  saveFormationsCoAnimees(formations);
  return newFormation;
};

/**
 * Met à jour une formation existante
 */
export const updateFormation = (id: string, updates: Partial<FormationCoAnimee>): FormationCoAnimee | null => {
  const formations = getFormationsCoAnimees();
  const index = formations.findIndex(f => f.id === id);
  
  if (index === -1) {
    return null;
  }
  
  formations[index] = { ...formations[index], ...updates };
  saveFormationsCoAnimees(formations);
  return formations[index];
};

/**
 * Met à jour (ou crée) les informations du certificat d'une formation
 */
export const updateCertificateInfo = (formationId: string, info: CertificateInfo): FormationCoAnimee | null => {
  const formations = getFormationsCoAnimees();
  const index = formations.findIndex(f => f.id === formationId);
  if (index === -1) return null;

  const updated: FormationCoAnimee = {
    ...formations[index],
    certificateAvailable: true,
    certificateInfo: { ...info },
  };

  formations[index] = updated;
  saveFormationsCoAnimees(formations);
  return updated;
};

/**
 * Supprime une formation
 */
export const deleteFormation = (id: string): boolean => {
  const formations = getFormationsCoAnimees();
  const filteredFormations = formations.filter(f => f.id !== id);
  
  if (filteredFormations.length === formations.length) {
    return false; // Formation non trouvée
  }
  
  saveFormationsCoAnimees(filteredFormations);
  return true;
};

/**
 * Met à jour un participant d'une formation
 */
export const updateParticipant = (
  formationId: string,
  participantId: string,
  updates: Partial<Omit<FormationCoAnimee['participants'][0], 'id'>>
): boolean => {
  const formations = getFormationsCoAnimees();
  const formation = formations.find(f => f.id === formationId);
  if (!formation) return false;
  const idx = formation.participants.findIndex(p => p.id === participantId);
  if (idx === -1) return false;
  formation.participants[idx] = { ...formation.participants[idx], ...updates };
  saveFormationsCoAnimees(formations);
  return true;
};

/**
 * Supprime un participant d'une formation
 */
export const deleteParticipant = (
  formationId: string,
  participantId: string
): boolean => {
  const formations = getFormationsCoAnimees();
  const formation = formations.find(f => f.id === formationId);
  if (!formation) return false;
  const before = formation.participants.length;
  formation.participants = formation.participants.filter(p => p.id !== participantId);
  if (formation.participants.length === before) return false;
  saveFormationsCoAnimees(formations);
  return true;
};

/**
 * Met à jour un événement d'une formation
 */
export const updateEvent = (
  formationId: string,
  eventId: string,
  updates: Partial<Omit<EventItem, 'id'>>
): boolean => {
  const formations = getFormationsCoAnimees();
  const formation = formations.find(f => f.id === formationId);
  if (!formation || !formation.events) return false;
  const idx = formation.events.findIndex(e => e.id === eventId);
  if (idx === -1) return false;
  formation.events[idx] = { ...formation.events[idx], ...updates } as EventItem;
  saveFormationsCoAnimees(formations);
  return true;
};

/**
 * Supprime un événement d'une formation
 */
export const deleteEvent = (
  formationId: string,
  eventId: string
): boolean => {
  const formations = getFormationsCoAnimees();
  const formation = formations.find(f => f.id === formationId);
  if (!formation || !formation.events) return false;
  const before = formation.events.length;
  formation.events = formation.events.filter(e => e.id !== eventId);
  if (formation.events.length === before) return false;
  saveFormationsCoAnimees(formations);
  return true;
};

/**
 * Ajoute un événement/séminaire à une formation
 */
export const addEvent = (
  formationId: string,
  eventData: Omit<EventItem, 'id'>
): boolean => {
  const formations = getFormationsCoAnimees();
  const formation = formations.find(f => f.id === formationId);
  if (!formation) return false;

  const newEvent: EventItem = { id: `event-${Date.now()}`, ...eventData };
  if (!formation.events) formation.events = [];
  formation.events.push(newEvent);
  saveFormationsCoAnimees(formations);
  return true;
};

/**
 * Ajoute un feedback à une formation
 */
export const addFeedback = (
  formationId: string, 
  feedback: Omit<FormationCoAnimee['feedbacks'][0], 'id'>
): boolean => {
  const formations = getFormationsCoAnimees();
  const formation = formations.find(f => f.id === formationId);
  
  if (!formation) {
    return false;
  }
  
  const newFeedback = {
    ...feedback,
    id: `feedback-${Date.now()}`
  };
  
  formation.feedbacks.push(newFeedback);
  saveFormationsCoAnimees(formations);
  return true;
};

/**
 * Met à jour un feedback d'une formation
 */
export const updateFeedback = (
  formationId: string,
  feedbackId: string,
  updates: Partial<Omit<FormationCoAnimee['feedbacks'][0], 'id'>>
): boolean => {
  const formations = getFormationsCoAnimees();
  const formation = formations.find(f => f.id === formationId);
  if (!formation) return false;
  const idx = formation.feedbacks.findIndex(fb => fb.id === feedbackId);
  if (idx === -1) return false;
  formation.feedbacks[idx] = { ...formation.feedbacks[idx], ...updates };
  saveFormationsCoAnimees(formations);
  return true;
};

/**
 * Supprime un feedback d'une formation
 */
export const deleteFeedback = (
  formationId: string,
  feedbackId: string
): boolean => {
  const formations = getFormationsCoAnimees();
  const formation = formations.find(f => f.id === formationId);
  if (!formation) return false;
  const before = formation.feedbacks.length;
  formation.feedbacks = formation.feedbacks.filter(fb => fb.id !== feedbackId);
  if (formation.feedbacks.length === before) return false;
  saveFormationsCoAnimees(formations);
  return true;
};

/**
 * Ajoute une ressource à une formation
 */
export const addResource = (
  formationId: string, 
  resource: Omit<FormationCoAnimee['resources'][0], 'id'>
): boolean => {
  const formations = getFormationsCoAnimees();
  const formation = formations.find(f => f.id === formationId);
  
  if (!formation) {
    return false;
  }
  
  const newResource = {
    ...resource,
    id: `resource-${Date.now()}`
  };
  
  formation.resources.push(newResource);
  saveFormationsCoAnimees(formations);
  return true;
};

/**
 * Met à jour une ressource d'une formation
 */
export const updateResource = (
  formationId: string,
  resourceId: string,
  updates: Partial<Omit<FormationCoAnimee['resources'][0], 'id'>>
): boolean => {
  const formations = getFormationsCoAnimees();
  const formation = formations.find(f => f.id === formationId);
  if (!formation) return false;
  const idx = formation.resources.findIndex(r => r.id === resourceId);
  if (idx === -1) return false;
  formation.resources[idx] = { ...formation.resources[idx], ...updates };
  saveFormationsCoAnimees(formations);
  return true;
};

/**
 * Supprime une ressource d'une formation
 */
export const deleteResource = (
  formationId: string,
  resourceId: string
): boolean => {
  const formations = getFormationsCoAnimees();
  const formation = formations.find(f => f.id === formationId);
  if (!formation) return false;
  const before = formation.resources.length;
  formation.resources = formation.resources.filter(r => r.id !== resourceId);
  if (formation.resources.length === before) return false;
  saveFormationsCoAnimees(formations);
  return true;
};

/**
 * Ajoute un participant à une formation
 */
export const addParticipant = (
  formationId: string, 
  participant: FormationCoAnimee['participants'][0]
): boolean => {
  const formations = getFormationsCoAnimees();
  const formation = formations.find(f => f.id === formationId);
  
  if (!formation) {
    return false;
  }
  
  // Vérifier si le participant n'existe pas déjà
  const exists = formation.participants.some(p => p.email === participant.email);
  if (exists) {
    return false;
  }
  
  formation.participants.push(participant);
  saveFormationsCoAnimees(formations);
  return true;
};

/**
 * Statistiques des formations
 */
export const getFormationsStats = () => {
  const formations = getFormationsCoAnimees();
  
  const totalFormations = formations.length;
  const totalParticipants = formations.reduce((sum, f) => sum + f.participants.length, 0);
  const totalResources = formations.reduce((sum, f) => sum + f.resources.length, 0);
  const totalFeedbacks = formations.reduce((sum, f) => sum + f.feedbacks.length, 0);
  const certificatesAvailable = formations.filter(f => f.certificateAvailable).length;
  
  // Calcul de la note moyenne des feedbacks
  const allRatings = formations.flatMap(f => f.feedbacks.map(fb => fb.rating));
  const averageRating = allRatings.length > 0 
    ? Math.round((allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length) * 10) / 10
    : 0;
  
  return {
    totalFormations,
    totalParticipants,
    totalResources,
    totalFeedbacks,
    certificatesAvailable,
    averageRating
  };
};
