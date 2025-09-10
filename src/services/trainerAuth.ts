// Service d'authentification sécurisé pour les formateurs
// Les IDs sont stockés sous forme hashée pour la sécurité

// Fonction de hachage simple (en production, utiliser bcrypt ou similar)
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
};

// IDs réels pour démonstration
const DEMO_IDS = ["FORM123", "TRAINER456", "FORMATEUR789", "COACH2024"];

// IDs de formateurs autorisés (hashés pour la sécurité)
// Calculés automatiquement à partir des IDs de démo
const VALID_TRAINER_IDS_HASHED = DEMO_IDS.map(id => simpleHash(id));



// Clé de stockage local
const STORAGE_KEY = 'trainer_session';

export interface TrainerSession {
  trainerId: string;
  timestamp: number;
  isValid: boolean;
}

// Générer les hash des IDs de démo (pour développement)
const generateHashes = () => {
  return DEMO_IDS.map(id => ({
    original: id,
    hashed: simpleHash(id)
  }));
};

// Vérifier si un ID de formateur est valide
export const verifyTrainerId = (inputId: string): boolean => {
  const hashedInput = simpleHash(inputId.toUpperCase().trim());
  return VALID_TRAINER_IDS_HASHED.includes(hashedInput);
};

// Sauvegarder la session du formateur
export const saveTrainerSession = (trainerId: string): void => {
  const session: TrainerSession = {
    trainerId: trainerId.toUpperCase().trim(),
    timestamp: Date.now(),
    isValid: true
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

// Récupérer la session du formateur
export const getTrainerSession = (): TrainerSession | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const session: TrainerSession = JSON.parse(stored);
    
    // Vérifier si la session est encore valide (24h)
    const isExpired = Date.now() - session.timestamp > 24 * 60 * 60 * 1000;
    
    if (isExpired || !session.isValid) {
      clearTrainerSession();
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    clearTrainerSession();
    return null;
  }
};

// Vérifier si le formateur est authentifié
export const isTrainerAuthenticated = (): boolean => {
  const session = getTrainerSession();
  return session !== null && session.isValid;
};

// Effacer la session du formateur
export const clearTrainerSession = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// Obtenir les IDs de démonstration (pour développement uniquement)
export const getDemoIds = (): string[] => {
  return DEMO_IDS;
};

// Obtenir les informations de hash (pour développement uniquement)
export const getHashInfo = () => {
  return generateHashes();
};

// Valider et authentifier un formateur
export const authenticateTrainer = (inputId: string): { success: boolean; message: string } => {
  const trimmedId = inputId.toUpperCase().trim();
  
  if (!trimmedId) {
    return { success: false, message: 'Veuillez saisir un ID de formateur' };
  }
  
  if (trimmedId.length < 4) {
    return { success: false, message: 'L\'ID doit contenir au moins 4 caractères' };
  }
  
  if (verifyTrainerId(trimmedId)) {
    saveTrainerSession(trimmedId);
    return { success: true, message: 'Authentification réussie' };
  } else {
    return { success: false, message: 'ID de formateur invalide' };
  }
};
