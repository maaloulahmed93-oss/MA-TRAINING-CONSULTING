export interface Programme {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  category: string;
  maxParticipants: number;
  price: number;
  status: 'Actif' | 'Terminé' | 'Suspendu';
  createdAt: string;
}

export interface Session {
  id: string;
  programmeId: string;
  title: string;
  type: 'Formation' | 'Encadrement' | 'Conseil';
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  maxParticipants: number;
  status: 'Planifiée' | 'En cours' | 'Terminée' | 'Annulée';
}

export interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  programmeId: string;
  registrationDate: string;
  paymentStatus: 'Payant' | 'Gratuit' | 'Annulé';
  amountPaid: number;
  commission: number;
  status: 'Actif' | 'Inactif' | 'Terminé';
}

export interface Event {
  id: string;
  title: string;
  type: 'Webinaire' | 'Formation Initiation' | 'Événement';
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  maxParticipants: number;
  registeredCount: number;
  price: number;
  status: 'Planifié' | 'En cours' | 'Terminé' | 'Annulé';
}

export interface Payment {
  id: string;
  participantId: string;
  programmeId: string;
  amount: number;
  commission: number;
  paymentDate: string;
  method: 'Carte' | 'Virement' | 'Espèces' | 'Chèque';
  status: 'Payé' | 'En attente' | 'Remboursé';
}

export interface TrainerStats {
  totalProgrammes: number;
  activeProgrammes: number;
  totalParticipants: number;
  totalRevenue: number;
  totalCommission: number;
  monthlyCommission: number;
}
