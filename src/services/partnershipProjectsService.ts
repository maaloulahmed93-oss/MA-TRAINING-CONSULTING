import { PartnershipProject } from '../types/partnership';

// Interface étendue pour les projets avec données supplémentaires
export interface ExtendedProject extends PartnershipProject {
  documents?: ProjectDocument[];
  milestones?: ProjectMilestone[];
  teamMembers?: string[];
  contactEmail?: string;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'image' | 'other';
  url: string;
  uploadDate: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  description?: string;
}

// Clé localStorage pour les projets
const PROJECTS_STORAGE_KEY = 'partnership_projects_';

// Générer des données mock pour les projets
const generateMockProjects = (partnerId: string): ExtendedProject[] => {
  return [
    {
      id: 'PRJ001',
      title: 'Mise en place d\'un ERP',
      description: 'Déploiement d\'un système ERP complet pour la gestion interne de l\'entreprise avec modules RH, comptabilité et CRM.',
      partnerId,
      status: 'in_progress',
      progress: 60,
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      budget: 150000,
      participants: ['Ahmed Ben Salah', 'Sarah Martinez', 'Michel Dubois'],
      objectives: [
        'Automatiser les processus métier',
        'Centraliser les données',
        'Améliorer la productivité',
        'Réduire les coûts opérationnels'
      ],
      deliverables: [
        'Analyse des besoins',
        'Architecture système',
        'Développement des modules',
        'Tests et validation',
        'Formation utilisateurs',
        'Documentation complète'
      ],
      teamMembers: [
        'Chef de projet: Ahmed Ben Salah',
        'Développeur: Sarah Martinez',
        'Consultant: Michel Dubois'
      ],
      contactEmail: 'ahmed.bensalah@siteen.com',
      documents: [
        {
          id: 'doc1',
          name: 'Cahier des charges.pdf',
          type: 'pdf',
          url: '#',
          uploadDate: '2024-01-20'
        },
        {
          id: 'doc2',
          name: 'Architecture technique.doc',
          type: 'doc',
          url: '#',
          uploadDate: '2024-02-05'
        }
      ],
      milestones: [
        {
          id: 'ms1',
          title: 'Analyse des besoins',
          date: '2024-02-15',
          completed: true,
          description: 'Analyse complète des besoins fonctionnels et techniques'
        },
        {
          id: 'ms2',
          title: 'Phase de développement',
          date: '2024-04-30',
          completed: false,
          description: 'Développement des modules principaux'
        },
        {
          id: 'ms3',
          title: 'Tests et validation',
          date: '2024-06-15',
          completed: false,
          description: 'Tests complets et validation utilisateur'
        }
      ]
    },
    {
      id: 'PRJ002',
      title: 'Plateforme E-learning',
      description: 'Développement d\'une plateforme de formation en ligne avec système de gestion des cours et suivi des apprenants.',
      partnerId,
      status: 'planning',
      progress: 25,
      startDate: '2024-03-01',
      endDate: '2024-09-30',
      budget: 80000,
      participants: ['Fatima El Mansouri', 'Omar Rachidi'],
      objectives: [
        'Créer une plateforme moderne',
        'Intégrer des outils interactifs',
        'Assurer la scalabilité',
        'Optimiser l\'expérience utilisateur'
      ],
      deliverables: [
        'Maquettes UI/UX',
        'Développement frontend',
        'API backend',
        'Système de paiement',
        'Tests et déploiement'
      ],
      teamMembers: [
        'Designer: Fatima El Mansouri',
        'Développeur: Omar Rachidi'
      ],
      contactEmail: 'fatima.elmansouri@siteen.com',
      documents: [
        {
          id: 'doc3',
          name: 'Maquettes UI.pdf',
          type: 'pdf',
          url: '#',
          uploadDate: '2024-03-10'
        }
      ],
      milestones: [
        {
          id: 'ms4',
          title: 'Design et maquettes',
          date: '2024-04-15',
          completed: true,
          description: 'Création des maquettes et validation du design'
        },
        {
          id: 'ms5',
          title: 'Développement MVP',
          date: '2024-06-30',
          completed: false,
          description: 'Développement du produit minimum viable'
        }
      ]
    },
    {
      id: 'PRJ003',
      title: 'Transformation Digitale',
      description: 'Accompagnement complet dans la transformation digitale avec migration cloud et formation des équipes.',
      partnerId,
      status: 'completed',
      progress: 100,
      startDate: '2023-09-01',
      endDate: '2024-01-31',
      budget: 200000,
      participants: ['Youssef Alami', 'Nadia Benali', 'Karim Tazi'],
      objectives: [
        'Migrer vers le cloud',
        'Former les équipes',
        'Optimiser les processus',
        'Assurer la sécurité'
      ],
      deliverables: [
        'Audit existant',
        'Plan de migration',
        'Formation équipes',
        'Documentation',
        'Support post-migration'
      ],
      teamMembers: [
        'Chef de projet: Youssef Alami',
        'Architecte: Nadia Benali',
        'Formateur: Karim Tazi'
      ],
      contactEmail: 'youssef.alami@siteen.com',
      documents: [
        {
          id: 'doc4',
          name: 'Rapport final.pdf',
          type: 'pdf',
          url: '#',
          uploadDate: '2024-02-05'
        },
        {
          id: 'doc5',
          name: 'Guide utilisateur.doc',
          type: 'doc',
          url: '#',
          uploadDate: '2024-02-01'
        }
      ],
      milestones: [
        {
          id: 'ms6',
          title: 'Migration cloud',
          date: '2023-12-15',
          completed: true,
          description: 'Migration complète vers AWS'
        },
        {
          id: 'ms7',
          title: 'Formation équipes',
          date: '2024-01-20',
          completed: true,
          description: 'Formation de 50 employés'
        }
      ]
    }
  ];
};

// Fonction pour obtenir les projets depuis localStorage ou créer mock data
export const getProjects = (partnerId: string): PartnershipProject[] => {
  try {
    const savedProjects = localStorage.getItem(`partnershipProjects_${partnerId}`);
    if (savedProjects) {
      return JSON.parse(savedProjects);
    } else {
      // Plus de données mock par défaut - retourner tableau vide
      console.log(`📋 Aucun projet trouvé pour ${partnerId}`);
      return [];
    }
  } catch (error) {
    console.error('Erreur lors du chargement des projets:', error);
    return [];
  }
};

// Fonction pour sauvegarder les projets dans localStorage
export const saveProjects = (partnerId: string, projects: ExtendedProject[]): void => {
  try {
    const storageKey = `${PROJECTS_STORAGE_KEY}${partnerId}`;
    localStorage.setItem(storageKey, JSON.stringify(projects));
    console.log(`💾 Projets sauvegardés pour ${partnerId}`);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des projets:', error);
  }
};

// Fonction pour calculer les statistiques des projets
export const getProjectsStats = (partnerId: string) => {
  const projects = getProjects(partnerId);
  
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const planningProjects = projects.filter(p => p.status === 'planning').length;
  const onHoldProjects = projects.filter(p => p.status === 'on_hold').length;
  
  // Calculer la progression moyenne
  const averageProgress = totalProjects > 0 
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects)
    : 0;
  
  // Calculer le budget total
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  
  // Calculer le nombre total de participants uniques
  const allParticipants = new Set();
  projects.forEach(p => {
    p.participants.forEach(participant => {
      // participants est un array de strings dans PartnershipProject
      allParticipants.add(participant);
    });
  });
  const totalParticipants = allParticipants.size;
  
  // Projets avec échéances proches (30 prochains jours)
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  const upcomingDeadlines = projects.filter(p => {
    const endDate = new Date(p.endDate);
    return endDate >= now && endDate <= thirtyDaysFromNow && p.status !== 'completed';
  }).length;
  
  console.log(`📊 Statistiques calculées pour ${partnerId}:`, {
    totalProjects,
    activeProjects,
    completedProjects,
    averageProgress,
    totalBudget,
    totalParticipants
  });
  
  return {
    totalProjects,
    activeProjects,
    completedProjects,
    planningProjects,
    onHoldProjects,
    averageProgress,
    totalBudget,
    totalParticipants,
    upcomingDeadlines
  };
};

// Fonction pour obtenir un projet spécifique
export const getProjectById = (partnerId: string, projectId: string): ExtendedProject | null => {
  const projects = getProjects(partnerId);
  return projects.find(project => project.id === projectId) || null;
};

// Fonction pour mettre à jour un projet
export const updateProject = (partnerId: string, updatedProject: ExtendedProject): void => {
  const projects = getProjects(partnerId);
  const index = projects.findIndex(project => project.id === updatedProject.id);
  
  if (index !== -1) {
    projects[index] = updatedProject;
    saveProjects(partnerId, projects);
    console.log(`✅ Projet ${updatedProject.id} mis à jour`);
  }
};

// Type d'entrée pour créer un nouveau projet
export type NewProjectInput = {
  title: string;
  description: string;
  startDate: string; // ISO
  endDate: string;   // ISO
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  progress?: number; // 0-100
  budget?: number;
  participants?: string[];
  objectives?: string[];
  deliverables?: string[];
  teamMembers?: string[];
  contactEmail?: string;
};

// Créer un nouveau projet et le persister
export const createProject = (partnerId: string, input: NewProjectInput): ExtendedProject => {
  const projects = getProjects(partnerId);
  const id = `PRJ${Date.now()}`;
  const project: ExtendedProject = {
    id,
    partnerId,
    title: input.title.trim(),
    description: input.description.trim(),
    startDate: input.startDate,
    endDate: input.endDate,
    status: input.status,
    progress: typeof input.progress === 'number' ? Math.max(0, Math.min(100, input.progress)) : 0,
    budget: input.budget,
    participants: input.participants && input.participants.length ? input.participants : [],
    objectives: input.objectives && input.objectives.length ? input.objectives : [],
    deliverables: input.deliverables && input.deliverables.length ? input.deliverables : [],
    teamMembers: input.teamMembers,
    contactEmail: input.contactEmail,
    documents: [],
    milestones: []
  };
  projects.unshift(project);
  saveProjects(partnerId, projects);
  console.log(`🆕 Projet créé: ${project.id}`);
  return project;
};

// Supprimer un projet
export const deleteProject = (partnerId: string, projectId: string): void => {
  const projects = getProjects(partnerId);
  const next = projects.filter(p => p.id !== projectId);
  saveProjects(partnerId, next);
  console.log(`🗑️ Projet supprimé: ${projectId}`);
};
// Fonction pour générer un email de contact
export const generateContactEmail = (project: ExtendedProject, partnerName: string): string => {
  const subject = encodeURIComponent(`Projet: ${project.title}`);
  const body = encodeURIComponent(
    `Bonjour,\n\nJe souhaite discuter du projet "${project.title}".\n\nCordialement,\n${partnerName}`
  );
  
  if (project.contactEmail) {
    return `mailto:${project.contactEmail}?subject=${subject}&body=${body}`;
  }
  
  return `mailto:contact@siteen.com?subject=${subject}&body=${body}`;
};

// Fonction pour simuler le téléchargement d'un document
export const downloadDocument = (doc: ProjectDocument): void => {
  // En production, ceci ouvrirait le vrai lien de téléchargement
  console.log(`📥 Téléchargement simulé: ${doc.name}`);
  alert(`Téléchargement de: ${doc.name}`);
};
