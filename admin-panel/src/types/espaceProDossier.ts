export type EspaceProPhaseStatus = 'A_VENIR' | 'EN_COURS' | 'TERMINEE';

export type EspaceProDocumentCategory = 'DIAGNOSTIC' | 'PHASE';

export type EspaceProDocumentVisibility = 'PARTICIPANT' | 'INTERNAL';

export interface EspaceProPhase {
  phaseId: number;
  status: EspaceProPhaseStatus;
  shortDescription: string;
  externalLinkUrl: string;
}

export interface EspaceProDecision {
  id: string;
  date: string;
  decisionType: string;
  phaseId: number;
  noteInternal?: string;
}

export interface EspaceProDocumentLink {
  id: string;
  title: string;
  category: EspaceProDocumentCategory;
  phaseId?: number;
  documentUrl: string;
  visibility: EspaceProDocumentVisibility;
  addedAt: string;
}

export interface EspaceProDossier {
  id: string;
  ownerAccountId: string;
  situationCurrent: {
    levelLabel: string;
    statusLabel: string;
  };
  notesVisibleToParticipant: string;
  currentPhaseId: number;
  phases: EspaceProPhase[];
  decisionsHistory: EspaceProDecision[];
  documents: EspaceProDocumentLink[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}
