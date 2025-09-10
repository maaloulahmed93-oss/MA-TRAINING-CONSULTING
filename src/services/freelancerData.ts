import {
  JobOffer,
  Meeting,
  Project,
  Deliverable,
  FreelancerStats,
  TeamInvitation,
  ProjectStatus,
} from "../types/freelancer";
// Admin notifications store (mock)
import { addAdminNotification } from "../../admin-panel/src/data/adminNotifications";

// Email de l'administrateur pour les communications
const ADMIN_EMAIL = "admin@siteen.com";

// Données mock pour les offres d'emploi
export const mockJobOffers: JobOffer[] = [
  {
    id: "1",
    title: "Développement Site E-commerce",
    description: "Création d'un site e-commerce complet avec React et Node.js",
    client: "TechCorp Solutions",
    budget: 5000,
    deadline: "2024-03-15",
    status: "pending",
    skills: ["React", "Node.js", "MongoDB", "Stripe"],
    workMode: "remote",
    estimatedHours: 120,
    priority: "high",
  },
  {
    id: "2",
    title: "Application Mobile React Native",
    description: "Développement d'une application mobile de gestion de tâches",
    client: "StartupInnovate",
    budget: 3500,
    deadline: "2024-04-01",
    status: "pending",
    skills: ["React Native", "Firebase", "Redux"],
    workMode: "hybrid",
    estimatedHours: 80,
    priority: "medium",
  },
  {
    id: "3",
    title: "Refonte Site Web Corporate",
    description: "Modernisation du site web d'entreprise avec animations",
    client: "Corporate Ltd",
    budget: 2800,
    deadline: "2024-03-30",
    status: "accepted",
    skills: ["HTML/CSS", "JavaScript", "GSAP", "WordPress"],
    workMode: "remote",
    estimatedHours: 60,
    priority: "low",
  },
];

// Historique des projets terminés (après livraison)
const mockProjectHistory: Project[] = [];

// Exports utilitaires pour le panneau admin (lecture seule)
export const getFreelancerSnapshot = () => ({
  offers: [...mockJobOffers],
  meetings: [...mockMeetings],
  projects: [...mockProjects],
  completedProjects: [...mockProjectHistory],
  deliverables: [...mockDeliverables],
});

// Données mock pour les réunions
export const mockMeetings: Meeting[] = [
  {
    id: "1",
    title: "Réunion de lancement - E-commerce",
    client: "TechCorp Solutions",
    date: "2024-02-20",
    time: "14:00",
    duration: 60,
    type: "project_kickoff",
    status: "scheduled",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    agenda: "Présentation du projet, définition des objectifs, planning",
    notes: "",
  },
  {
    id: "2",
    title: "Point d'avancement hebdomadaire",
    client: "StartupInnovate",
    date: "2024-02-22",
    time: "10:30",
    duration: 30,
    type: "progress_review",
    status: "completed",
    meetingLink: "https://zoom.us/j/123456789",
    agenda: "Revue des fonctionnalités développées, prochaines étapes",
    notes: "Progression satisfaisante, quelques ajustements à prévoir sur l'UI",
  },
  {
    id: "3",
    title: "Formation technique - GSAP",
    client: "Corporate Ltd",
    date: "2024-02-25",
    time: "16:00",
    duration: 90,
    type: "training",
    status: "scheduled",
    meetingLink: "https://teams.microsoft.com/l/meetup-join/xyz",
    agenda: "Formation sur les animations GSAP pour le projet",
    notes: "",
  },
];

// Données mock pour les projets
export const mockProjects: Project[] = [
  {
    id: "1",
    title: "Site E-commerce TechCorp",
    client: "TechCorp Solutions",
    status: "in_progress",
    progress: 65,
    startDate: "2024-01-15",
    endDate: "2024-03-15",
    budget: 5000,
    description: "Développement complet d'une plateforme e-commerce",
    teamMembers: ["Alice Martin", "Bob Dupont"],
    milestones: [
      { name: "Maquettes", completed: true, date: "2024-01-30" },
      { name: "Backend API", completed: true, date: "2024-02-15" },
      { name: "Frontend", completed: false, date: "2024-02-28" },
      { name: "Tests & Déploiement", completed: false, date: "2024-03-15" },
    ],
  },
  {
    id: "2",
    title: "App Mobile TaskManager",
    client: "StartupInnovate",
    status: "planning",
    progress: 20,
    startDate: "2024-02-01",
    endDate: "2024-04-01",
    budget: 3500,
    description: "Application mobile de gestion de tâches collaboratives",
    teamMembers: ["Charlie Leroy"],
    milestones: [
      { name: "Analyse des besoins", completed: true, date: "2024-02-10" },
      { name: "Architecture", completed: false, date: "2024-02-20" },
      { name: "Développement", completed: false, date: "2024-03-20" },
      { name: "Tests", completed: false, date: "2024-03-30" },
    ],
  },
  {
    id: "3",
    title: "Refonte Corporate Website",
    client: "Corporate Ltd",
    status: "completed",
    progress: 100,
    startDate: "2024-01-01",
    endDate: "2024-02-15",
    budget: 2800,
    description: "Modernisation complète du site web corporate",
    teamMembers: ["Diana Moreau", "Eva Bernard"],
    milestones: [
      { name: "Design", completed: true, date: "2024-01-15" },
      { name: "Développement", completed: true, date: "2024-02-01" },
      { name: "Intégration", completed: true, date: "2024-02-10" },
      { name: "Mise en ligne", completed: true, date: "2024-02-15" },
    ],
  },
];

// Données mock pour les livrables
export const mockDeliverables: Deliverable[] = [
  {
    id: "1",
    title: "Maquettes UI/UX E-commerce",
    projectId: "1",
    type: "design",
    status: "approved",
    dueDate: "2024-01-30",
    submittedDate: "2024-01-28",
    description: "Maquettes complètes de l'interface utilisateur",
    fileUrl: "https://drive.google.com/file/d/abc123",
    feedback: "Excellent travail, maquettes approuvées sans modification",
    rating: 5,
  },
  {
    id: "2",
    title: "Documentation API Backend",
    projectId: "1",
    type: "documentation",
    status: "pending",
    dueDate: "2024-02-20",
    submittedDate: "2024-02-18",
    description: "Documentation technique complète de l'API",
    fileUrl: "https://docs.google.com/document/d/xyz789",
    feedback: "",
    rating: 0,
  },
  {
    id: "3",
    title: "Prototype Mobile v1.0",
    projectId: "2",
    type: "prototype",
    status: "revision_requested",
    dueDate: "2024-02-25",
    submittedDate: "2024-02-24",
    description: "Premier prototype fonctionnel de l'application",
    fileUrl: "https://expo.dev/@user/taskmanager",
    feedback:
      "Bon travail global, quelques ajustements nécessaires sur la navigation",
    rating: 3,
  },
];

// Statistiques mock du freelancer
export const mockFreelancerStats: FreelancerStats = {
  totalProjects: 12,
  activeProjects: 3,
  completedProjects: 9,
  totalEarnings: 45000,
  monthlyEarnings: 8500,
  averageRating: 4.7,
  totalHours: 890,
  successRate: 95,
  responseTime: "2h",
  clientSatisfaction: 98,
};

// Fonctions CRUD pour les offres d'emploi
export const getJobOffers = (): JobOffer[] => {
  return mockJobOffers;
};

export const acceptJobOffer = (
  offerId: string,
  /* selectedWorkMode: 'solo' | 'team', */
  teamMembers?: string[]
): void => {
  const offerIndex = mockJobOffers.findIndex((o) => o.id === offerId);
  if (offerIndex !== -1) {
    const offer = mockJobOffers[offerIndex];

    // 1) Créer un projet à partir de l'offre
    const newProject: Project = {
      id: Date.now().toString(),
      title: offer.title,
      client: offer.client,
      status: 'planning',
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: offer.deadline,
      budget: offer.budget,
      description: offer.description,
      teamMembers: teamMembers && teamMembers.length ? teamMembers : [],
      milestones: [],
    };
    mockProjects.push(newProject);

    // 2) Retirer l'offre de la liste des offres
    mockJobOffers.splice(offerIndex, 1);

    // 3) Simulation d'envoi d'email de confirmation
    sendAcceptanceEmail({ ...offer, status: 'accepted' }, teamMembers);

    // 4) Notification admin
    addAdminNotification({
      title: "Offre acceptée",
      message: `Le freelancer a accepté l'offre "${offer.title}" pour ${offer.client}. Projet créé: ${newProject.title}.`,
      type: 'job',
      actionUrl: '/projects',
      payload: {
        event: 'offer_accepted',
        projectId: newProject.id,
        projectTitle: newProject.title,
        client: newProject.client,
        budget: newProject.budget,
      }
    });
  }
};

export const refuseJobOffer = (offerId: string, reason: string): void => {
  const offer = mockJobOffers.find((o) => o.id === offerId);
  if (offer) {
    offer.status = "refused";

    // Simulation d'envoi d'email de refus
    sendRefusalEmail(offer, reason);

    // Notification admin
    addAdminNotification({
      title: "Offre refusée",
      message: `Offre "${offer.title}" (${offer.client}) refusée. Raison: ${reason}.`,
      type: 'job',
      actionUrl: '/offers'
    });
  }
};

// Fonctions CRUD pour les réunions
export const getMeetings = (): Meeting[] => {
  return mockMeetings;
};

export const updateMeetingNotes = (meetingId: string, notes: string): void => {
  const meeting = mockMeetings.find((m) => m.id === meetingId);
  if (meeting) {
    meeting.notes = notes;

    // Notification admin
    addAdminNotification({
      title: "Notes de réunion mises à jour",
      message: `Notes ajoutées pour la réunion "${meeting.title}" (${meeting.client}).`,
      type: 'info',
      actionUrl: '/meetings'
    });
  }
};

// Alias pour addMeetingNotes (utilisé dans MeetingsTab)
export const addMeetingNotes = updateMeetingNotes;

// Accepter une réunion (marquage simple, on conserve le statut scheduled)
export const acceptMeeting = (meetingId: string): void => {
  const meeting = mockMeetings.find((m) => m.id === meetingId);
  if (meeting) {
    // Optionnel: ajouter une note d'acceptation légère
    meeting.notes = meeting.notes
      ? meeting.notes
      : "Acceptée par le freelancer.";

    addAdminNotification({
      title: "Réunion acceptée",
      message: `La réunion "${meeting.title}" avec ${meeting.client} a été acceptée.`,
      type: 'info',
      actionUrl: '/meetings'
    });
  }
};

// Refuser une réunion: on enregistre la raison dans notes et on annule la réunion
export const refuseMeeting = (meetingId: string, reason: string): void => {
  const meeting = mockMeetings.find((m) => m.id === meetingId);
  if (meeting) {
    meeting.status = "cancelled";
    const prefix = meeting.notes ? `${meeting.notes}\n` : "";
    meeting.notes = `${prefix}Refusée: ${reason}`;

    addAdminNotification({
      title: "Réunion refusée",
      message: `La réunion "${meeting.title}" (${meeting.client}) a été refusée. Raison: ${reason}.`,
      type: 'info',
      actionUrl: '/meetings'
    });
  }
};

// Supprimer une réunion (ex: réunion programmée mais date dépassée → archivage)
export const removeMeeting = (meetingId: string): void => {
  const index = mockMeetings.findIndex((m) => m.id === meetingId);
  if (index !== -1) {
    const removed = mockMeetings[index];
    mockMeetings.splice(index, 1);

    addAdminNotification({
      title: "Réunion retirée (passée)",
      message: `La réunion "${removed.title}" (${removed.client}) a été retirée car elle est passée.`,
      type: 'info',
      actionUrl: '/meetings'
    });
  }
};

// Fonctions CRUD pour les projets
export const getProjects = (): Project[] => {
  return mockProjects;
};

export const getProjectStatus = (): ProjectStatus[] => {
  return mockProjects.map((project) => ({
    id: project.id,
    title: project.title,
    client: project.client,
    status:
      project.status === "planning"
        ? "planning"
        : project.status === "in_progress"
        ? "in_progress"
        : project.status === "review"
        ? "review"
        : project.status === "completed"
        ? "completed"
        : project.status === "on_hold"
        ? "on_hold"
        : "cancelled",
    progress: project.progress,
    startDate: project.startDate,
    endDate: project.endDate,
    budget: project.budget,
    description: project.description,
    teamMembers: project.teamMembers,
  }));
};

// Fonctions CRUD pour les livrables
export const getDeliverables = (): Deliverable[] => {
  return mockDeliverables;
};

export const submitDeliverable = (
  projectId: string,
  title: string,
  description: string,
  type: "design" | "code" | "documentation" | "prototype" | "file" | "link",
  fileUrl?: string,
  linkUrl?: string
): void => {
  const project = mockProjects.find(p => p.id === projectId);
  const newDeliverable: Deliverable = {
    id: Date.now().toString(),
    title,
    projectId,
    type,
    status: "pending",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    submittedDate: new Date().toISOString().split("T")[0],
    description,
    fileUrl: fileUrl || linkUrl || "",
    feedback: "",
    rating: 0,
  };

  mockDeliverables.push(newDeliverable);

  // Retirer le projet lié des projets actifs
  const projectIndex = mockProjects.findIndex(p => p.id === projectId);
  if (projectIndex !== -1) {
    const removed = mockProjects.splice(projectIndex, 1)[0];
    if (removed) {
      mockProjectHistory.unshift(removed);
    }
  }

  // Simulation d'envoi d'email de notification
  sendDeliverableNotification(newDeliverable);

  // Notifications admin
  addAdminNotification({
    title: "Livrable soumis",
    message: `Livrable "${title}" soumis pour le projet "${project?.title ?? projectId}".`,
    type: 'info',
    actionUrl: '/deliverables',
    payload: {
      event: 'deliverable_submitted',
      projectId,
      projectTitle: project?.title ?? '',
    }
  });

  if (project) {
    addAdminNotification({
      title: "Projet retiré après livraison",
      message: `Le projet "${project.title}" a été retiré de la liste des projets actifs suite à la livraison.`,
      type: 'info',
      actionUrl: '/projects',
      payload: {
        event: 'project_removed',
        projectId: project.id,
        projectTitle: project.title,
        client: project.client,
        budget: project.budget,
      }
    });
  }
};

// Fonctions de simulation d'envoi d'email
export const sendAcceptanceEmail = (
  offer: JobOffer,
  teamMembers?: string[]
): void => {
  const subject = `Acceptation de l'offre: ${offer.title}`;
  const body = `Bonjour,

Je confirme l'acceptation de l'offre "${offer.title}" pour le client ${
    offer.client
  }.

Détails:
- Budget: ${offer.budget}€
- Mode de travail: ${offer.workMode}
- Échéance: ${offer.deadline}
${
  teamMembers && teamMembers.length > 0
    ? `- Équipe: ${teamMembers.join(", ")}`
    : ""
}

Cordialement,
Freelancer`;

  window.open(
    `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`
  );
};

export const sendRefusalEmail = (offer: JobOffer, reason: string): void => {
  const subject = `Refus de l'offre: ${offer.title}`;
  const body = `Bonjour,

Je dois malheureusement décliner l'offre "${offer.title}" pour le client ${offer.client}.

Raison du refus:
${reason}

Merci de votre compréhension.

Cordialement,
Freelancer`;

  window.open(
    `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`
  );
};

export const sendDeliverableNotification = (deliverable: Deliverable): void => {
  const subject = `Nouveau livrable soumis: ${deliverable.title}`;
  const body = `Bonjour,

Un nouveau livrable a été soumis:

Titre: ${deliverable.title}
Type: ${deliverable.type}
Description: ${deliverable.description}
Date de soumission: ${deliverable.submittedDate}
${deliverable.fileUrl ? `Lien: ${deliverable.fileUrl}` : ""}

Cordialement,
Freelancer`;

  window.open(
    `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`
  );
};

export const sendTeamInvitation = (invitation: TeamInvitation): void => {
  const subject = `Invitation à rejoindre l'équipe: ${invitation.projectTitle}`;
  const body = `Bonjour ${invitation.memberName},

Vous êtes invité(e) à rejoindre l'équipe pour le projet "${invitation.projectTitle}".

Rôle: ${invitation.role}
Client: ${invitation.client}
Description: ${invitation.message}

Merci de confirmer votre participation.

Cordialement,
Freelancer`;

  window.open(
    `mailto:${invitation.memberEmail}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`
  );
};
