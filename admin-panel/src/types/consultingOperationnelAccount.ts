export type ConsultingOperationnelSituation = {
  posteIntitule?: string;
  entrepriseSecteur?: string;
  element1?: string;
  element2?: string;
  difficulte1?: string;
  difficulte2?: string;
  demandeDirection?: string;
  session1DateTime?: string;
  session1VideoUrl?: string;
  session2DateTime?: string;
  session2VideoUrl?: string;
  session3DateTime?: string;
  session3VideoUrl?: string;
};

export type ConsultingOperationnelAccount = {
  id: string;
  participantId: string;
  isActive: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  entreprise?: string;
  notesAdmin?: string;
  situation?: ConsultingOperationnelSituation;
  createdAt: string;
  updatedAt: string;
};
