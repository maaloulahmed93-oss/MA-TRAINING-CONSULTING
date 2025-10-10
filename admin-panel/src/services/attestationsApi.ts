import { API_BASE_URL } from '../config/api';

export interface Attestation {
  _id?: string;
  attestationId: string;
  fullName: string;
  programId: string;
  program?: {
    _id: string;
    title: string;
    category: string;
    level: string;
  };
  dateObtention: string;
  note: number;
  niveau: 'Débutant' | 'Intermédiaire' | 'Avancé';
  skills: string[];
  techniques: string[];
  documents: {
    attestation: string;
    recommandation?: string;
    evaluation?: string;
  };
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Program {
  _id: string;
  title: string;
  category: string;
  level: string;
}

class AttestationsApi {
  // Get all attestations
  async getAll(): Promise<Attestation[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/attestations`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération des attestations');
      }
      
      return data.data || [];
    } catch (error) {
      console.error('Error fetching attestations:', error);
      throw error;
    }
  }

  // Get all programs for dropdown
  async getPrograms(): Promise<Program[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/programs`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération des programmes');
      }
      
      return data.data || [];
    } catch (error) {
      console.error('Error fetching programs:', error);
      throw error;
    }
  }

  // Create new attestation
  async create(attestationData: {
    fullName: string;
    programId: string;
    dateObtention?: string;
    note: number;
    niveau: string;
    skills: string[];
    techniques: string[];
  }, files: {
    attestation: File | null;
    recommandation: File | null;
    evaluation: File | null;
  }): Promise<Attestation> {
    try {
      const formData = new FormData();
      
      // Add form fields
      formData.append('fullName', attestationData.fullName);
      formData.append('programId', attestationData.programId);
      formData.append('dateObtention', attestationData.dateObtention || new Date().toISOString());
      formData.append('note', attestationData.note.toString());
      formData.append('niveau', attestationData.niveau);
      formData.append('skills', JSON.stringify(attestationData.skills));
      formData.append('techniques', JSON.stringify(attestationData.techniques));
      
      // Add files
      if (files.attestation) {
        formData.append('attestation', files.attestation);
      }
      if (files.recommandation) {
        formData.append('recommandation', files.recommandation);
      }
      if (files.evaluation) {
        formData.append('evaluation', files.evaluation);
      }

      const response = await fetch(`${API_BASE_URL}/attestations`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la création de l\'attestation');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error creating attestation:', error);
      throw error;
    }
  }

  // Get specific attestation
  async getById(attestationId: string): Promise<Attestation> {
    try {
      const response = await fetch(`${API_BASE_URL}/attestations/${attestationId}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Attestation non trouvée');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching attestation:', error);
      throw error;
    }
  }

  // Verify attestation
  async verify(attestationId: string): Promise<{
    valid: boolean;
    data?: Attestation;
    message?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/attestations/verify/${attestationId}`);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Error verifying attestation:', error);
      return {
        valid: false,
        message: 'Erreur lors de la vérification'
      };
    }
  }

  // Download specific document type
  async download(attestationId: string, type: 'attestation' | 'recommandation' | 'evaluation' = 'attestation'): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE_URL}/attestations/${attestationId}/download/${type}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  }

  // Delete attestation (soft delete)
  async delete(attestationId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/attestations/${attestationId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting attestation:', error);
      throw error;
    }
  }
}

export const attestationsApi = new AttestationsApi();
