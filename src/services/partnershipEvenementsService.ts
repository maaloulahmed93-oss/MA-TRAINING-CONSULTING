// Service de gestion des événements et séminaires de partenariat
// Utilise localStorage pour la persistance des données

export interface EvenementPartenariat {
  id: string;
  title: string;
  date: string;
  type: "Séminaire" | "Webinaire" | "Atelier";
  location: string;
  participants: { id: string; name: string; email: string }[];
  description: string;
  resources: { id: string; name: string; url: string }[];
  postEventReport?: {
    attendanceRate: number;
    satisfactionRate: number;
    comments: string[];
  };
}

const STORAGE_KEY = 'evenementsPartenariat';

// Génération des données mock réalistes
const generateMockData = (): EvenementPartenariat[] => {
  return [
    {
      id: 'evt-001',
      title: 'Séminaire Transformation Digitale',
      date: '2024-02-15T14:00:00Z',
      type: 'Séminaire',
      location: 'Centre de Conférences Paris',
      description: 'Un séminaire complet sur les enjeux de la transformation digitale pour les entreprises modernes. Découvrez les dernières tendances, outils et stratégies pour réussir votre transition numérique.',
      participants: [
        { id: 'p1', name: 'Ahmed Ben Salah', email: 'ahmed.bensalah@techcorp.fr' },
        { id: 'p2', name: 'Sarah Martinez', email: 'sarah.martinez@innovate.com' },
        { id: 'p3', name: 'Michel Dubois', email: 'michel.dubois@consulting.fr' },
        { id: 'p4', name: 'Fatima El Mansouri', email: 'fatima.elmansouri@digital.ma' },
        { id: 'p5', name: 'Jean-Pierre Moreau', email: 'jp.moreau@entreprise.fr' }
      ],
      resources: [
        { id: 'r1', name: 'Guide Transformation Digitale.pdf', url: '/resources/guide-transformation.pdf' },
        { id: 'r2', name: 'Checklist Migration Cloud.pdf', url: '/resources/checklist-cloud.pdf' },
        { id: 'r3', name: 'Présentation Outils Digitaux.pptx', url: '/resources/outils-digitaux.pptx' }
      ],
      postEventReport: {
        attendanceRate: 85,
        satisfactionRate: 92,
        comments: [
          'Excellent séminaire, très instructif !',
          'Les outils présentés sont vraiment utiles.',
          'Merci pour cette formation de qualité.',
          'J\'aurais aimé plus de temps pour les questions.'
        ]
      }
    },
    {
      id: 'evt-002',
      title: 'Webinaire E-learning et Formation à Distance',
      date: '2024-02-28T10:00:00Z',
      type: 'Webinaire',
      location: 'En ligne (Zoom)',
      description: 'Découvrez les meilleures pratiques pour créer et gérer des formations en ligne efficaces. Ce webinaire s\'adresse aux formateurs et responsables pédagogiques.',
      participants: [
        { id: 'p6', name: 'Nadia Benali', email: 'nadia.benali@formation.fr' },
        { id: 'p7', name: 'Thomas Leroy', email: 'thomas.leroy@elearning.com' },
        { id: 'p8', name: 'Amina Khoury', email: 'amina.khoury@education.org' },
        { id: 'p9', name: 'Pierre Durand', email: 'pierre.durand@academy.fr' }
      ],
      resources: [
        { id: 'r4', name: 'Bonnes Pratiques E-learning.pdf', url: '/resources/elearning-practices.pdf' },
        { id: 'r5', name: 'Outils de Création de Contenu.pdf', url: '/resources/content-tools.pdf' }
      ]
      // Pas de rapport post-événement car événement à venir
    },
    {
      id: 'evt-003',
      title: 'Atelier Gestion de Projet Agile',
      date: '2024-03-10T09:00:00Z',
      type: 'Atelier',
      location: 'Espace Coworking Lyon',
      description: 'Atelier pratique sur les méthodologies Agile et Scrum. Apprenez à gérer vos projets de manière plus efficace avec des exercices concrets et des mises en situation.',
      participants: [
        { id: 'p10', name: 'Karim Alaoui', email: 'karim.alaoui@startup.ma' },
        { id: 'p11', name: 'Sophie Blanc', email: 'sophie.blanc@agile.fr' },
        { id: 'p12', name: 'Omar Rachidi', email: 'omar.rachidi@tech.com' }
      ],
      resources: [
        { id: 'r6', name: 'Manuel Scrum Master.pdf', url: '/resources/scrum-manual.pdf' },
        { id: 'r7', name: 'Templates Agile.zip', url: '/resources/agile-templates.zip' }
      ],
      postEventReport: {
        attendanceRate: 78,
        satisfactionRate: 88,
        comments: [
          'Atelier très pratique et bien animé.',
          'Les exercices étaient pertinents.',
          'Bonne approche pédagogique.'
        ]
      }
    },
    {
      id: 'evt-004',
      title: 'Séminaire Intelligence Artificielle et Business',
      date: '2024-03-25T13:30:00Z',
      type: 'Séminaire',
      location: 'Palais des Congrès Marseille',
      description: 'Explorez les applications concrètes de l\'IA dans le monde des affaires. De la automatisation des processus à l\'analyse prédictive, découvrez comment l\'IA peut transformer votre entreprise.',
      participants: [
        { id: 'p13', name: 'Youssef Bennani', email: 'youssef.bennani@ai-corp.ma' },
        { id: 'p14', name: 'Claire Moreau', email: 'claire.moreau@innovation.fr' },
        { id: 'p15', name: 'Hassan El Idrissi', email: 'hassan.elidrissi@tech.ma' },
        { id: 'p16', name: 'Isabelle Dubois', email: 'isabelle.dubois@consulting.fr' },
        { id: 'p17', name: 'Mehdi Alami', email: 'mehdi.alami@startup.ma' },
        { id: 'p18', name: 'Céline Petit', email: 'celine.petit@digital.fr' }
      ],
      resources: [
        { id: 'r8', name: 'Guide IA pour Entreprises.pdf', url: '/resources/ai-business-guide.pdf' },
        { id: 'r9', name: 'Cas d\'Usage IA.pdf', url: '/resources/ai-use-cases.pdf' },
        { id: 'r10', name: 'ROI de l\'IA.xlsx', url: '/resources/ai-roi-calculator.xlsx' }
      ]
      // Événement futur, pas de rapport
    },
    {
      id: 'evt-005',
      title: 'Webinaire Cybersécurité et Protection des Données',
      date: '2024-04-08T16:00:00Z',
      type: 'Webinaire',
      location: 'En ligne (Microsoft Teams)',
      description: 'Formation essentielle sur la cybersécurité moderne. Apprenez à protéger vos données et systèmes contre les menaces actuelles avec des stratégies éprouvées.',
      participants: [
        { id: 'p19', name: 'Rachid Benali', email: 'rachid.benali@security.ma' },
        { id: 'p20', name: 'Marie Lefevre', email: 'marie.lefevre@cyber.fr' },
        { id: 'p21', name: 'Samir Ouali', email: 'samir.ouali@protection.com' }
      ],
      resources: [
        { id: 'r11', name: 'Guide Cybersécurité 2024.pdf', url: '/resources/cybersecurity-guide.pdf' },
        { id: 'r12', name: 'Checklist Sécurité.pdf', url: '/resources/security-checklist.pdf' }
      ]
      // Événement futur
    }
  ];
};

// Fonctions CRUD pour les événements avec support partnerId
export const getEvenements = (partnerId?: string): EvenementPartenariat[] => {
  try {
    const storageKey = partnerId ? `${STORAGE_KEY}_${partnerId}` : STORAGE_KEY;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Plus de données mock par défaut - retourner tableau vide
    return [];
  } catch (error) {
    console.error('Erreur lors de la lecture des événements:', error);
    return [];
  }
};

export const getEvenementById = (id: string): EvenementPartenariat | null => {
  const evenements = getEvenements();
  return evenements.find(evt => evt.id === id) || null;
};

export const saveEvenements = (evenements: EvenementPartenariat[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(evenements));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des événements:', error);
  }
};

export const addEvenement = (evenement: Omit<EvenementPartenariat, 'id'>): EvenementPartenariat => {
  const evenements = getEvenements();
  const newEvenement: EvenementPartenariat = {
    ...evenement,
    id: `evt-${Date.now()}`
  };
  evenements.push(newEvenement);
  saveEvenements(evenements);
  return newEvenement;
};

export const updateEvenement = (id: string, updates: Partial<EvenementPartenariat>): EvenementPartenariat | null => {
  const evenements = getEvenements();
  const index = evenements.findIndex(evt => evt.id === id);
  
  if (index !== -1) {
    evenements[index] = { ...evenements[index], ...updates };
    saveEvenements(evenements);
    return evenements[index];
  }
  
  return null;
};

export const deleteEvenement = (id: string): boolean => {
  const evenements = getEvenements();
  const filteredEvenements = evenements.filter(evt => evt.id !== id);
  
  if (filteredEvenements.length !== evenements.length) {
    saveEvenements(filteredEvenements);
    return true;
  }
  
  return false;
};

// Fonctions utilitaires pour la gestion des participants
export const addParticipant = (evenementId: string, participant: { name: string; email: string }): EvenementPartenariat | null => {
  const evenement = getEvenementById(evenementId);
  if (!evenement) return null;

  const newParticipant = {
    id: `p-${Date.now()}`,
    name: participant.name,
    email: participant.email
  };

  evenement.participants.push(newParticipant);
  const updatedEvenement = updateEvenement(evenementId, { participants: evenement.participants });
  return updatedEvenement;
};

export const removeParticipant = (evenementId: string, participantId: string): boolean => {
  const evenement = getEvenementById(evenementId);
  if (!evenement) return false;

  const updatedParticipants = evenement.participants.filter(p => p.id !== participantId);
  return updateEvenement(evenementId, { participants: updatedParticipants }) !== null;
};

// Fonctions utilitaires pour les ressources
export const addResource = (evenementId: string, resource: { name: string; url: string }): boolean => {
  const evenement = getEvenementById(evenementId);
  if (!evenement) return false;

  const newResource = {
    id: `r-${Date.now()}`,
    name: resource.name,
    url: resource.url
  };

  evenement.resources.push(newResource);
  return updateEvenement(evenementId, { resources: evenement.resources }) !== null;
};

export const removeResource = (evenementId: string, resourceId: string): boolean => {
  const evenement = getEvenementById(evenementId);
  if (!evenement) return false;

  const updatedResources = evenement.resources.filter(r => r.id !== resourceId);
  return updateEvenement(evenementId, { resources: updatedResources }) !== null;
};

// Fonctions pour les rapports post-événement
export const addPostEventReport = (
  evenementId: string, 
  report: { attendanceRate: number; satisfactionRate: number; comments: string[] }
): boolean => {
  return updateEvenement(evenementId, { postEventReport: report }) !== null;
};

// Fonctions statistiques
export const getEvenementsStats = () => {
  const evenements = getEvenements();
  const now = new Date();
  
  const totalEvenements = evenements.length;
  const evenementsPasses = evenements.filter(evt => new Date(evt.date) < now).length;
  const evenementsAVenir = evenements.filter(evt => new Date(evt.date) >= now).length;
  const totalParticipants = evenements.reduce((sum, evt) => sum + evt.participants.length, 0);
  
  // Calcul de la satisfaction moyenne (seulement pour les événements avec rapport)
  const evenementsAvecRapport = evenements.filter(evt => evt.postEventReport);
  const satisfactionMoyenne = evenementsAvecRapport.length > 0
    ? evenementsAvecRapport.reduce((sum, evt) => sum + (evt.postEventReport?.satisfactionRate || 0), 0) / evenementsAvecRapport.length
    : 0;

  // Calcul du taux de participation moyen
  const tauxParticipationMoyen = evenementsAvecRapport.length > 0
    ? evenementsAvecRapport.reduce((sum, evt) => sum + (evt.postEventReport?.attendanceRate || 0), 0) / evenementsAvecRapport.length
    : 0;

  return {
    totalEvenements,
    evenementsPasses,
    evenementsAVenir,
    totalParticipants,
    satisfactionMoyenne: Math.round(satisfactionMoyenne),
    tauxParticipationMoyen: Math.round(tauxParticipationMoyen),
    evenementsParType: {
      seminaire: evenements.filter(evt => evt.type === 'Séminaire').length,
      webinaire: evenements.filter(evt => evt.type === 'Webinaire').length,
      atelier: evenements.filter(evt => evt.type === 'Atelier').length
    }
  };
};

// Fonction pour obtenir les événements à venir (pour le calendrier)
export const getUpcomingEvenements = (): EvenementPartenariat[] => {
  const evenements = getEvenements();
  const now = new Date();
  
  return evenements
    .filter(evt => new Date(evt.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Fonction pour obtenir les événements passés
export const getPastEvenements = (): EvenementPartenariat[] => {
  const evenements = getEvenements();
  const now = new Date();
  
  return evenements
    .filter(evt => new Date(evt.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
