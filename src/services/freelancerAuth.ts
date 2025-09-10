import { FreelancerSession } from '../types/freelancer';

// Fonction de hachage simple (à remplacer par bcrypt en production)
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).substring(0, 8);
};

// IDs de freelancers autorisés (hashés pour la sécurité)
const VALID_FREELANCER_IDS = new Map([
  [simpleHash('FREEL123'), 'FREEL123'],
  [simpleHash('FREEL456'), 'FREEL456'],
  [simpleHash('FREELANCER789'), 'FREELANCER789'],
  [simpleHash('DEMO-FREELANCER'), 'DEMO-FREELANCER']
]);

// Clé de stockage pour la session
const SESSION_KEY = 'freelancer_session';

// Durée d'expiration de la session (24 heures en millisecondes)
const SESSION_DURATION = 24 * 60 * 60 * 1000;

/**
 * Vérifie si un ID de freelancer est valide
 */
export const verifyFreelancerId = (freelancerId: string): boolean => {
  const hashedId = simpleHash(freelancerId);
  return VALID_FREELANCER_IDS.has(hashedId);
};

/**
 * Sauvegarde la session du freelancer
 */
export const saveFreelancerSession = (freelancerId: string): void => {
  const session: FreelancerSession = {
    freelancerId: freelancerId.toUpperCase(),
    timestamp: Date.now(),
    isValid: true
  };
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

/**
 * Récupère la session du freelancer
 */
export const getFreelancerSession = (): FreelancerSession | null => {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) return null;
    
    const session: FreelancerSession = JSON.parse(sessionData);
    
    // Vérifier si la session a expiré
    const now = Date.now();
    const isExpired = (now - session.timestamp) > SESSION_DURATION;
    
    if (isExpired) {
      clearFreelancerSession();
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    clearFreelancerSession();
    return null;
  }
};

/**
 * Vérifie si le freelancer est authentifié
 */
export const isFreelancerAuthenticated = (): boolean => {
  const session = getFreelancerSession();
  return session !== null && session.isValid;
};

/**
 * Efface la session du freelancer
 */
export const clearFreelancerSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

/**
 * Authentifie un freelancer avec son ID
 */
export const authenticateFreelancer = async (freelancerId: string): Promise<boolean> => {
  // Simulation d'une vérification asynchrone
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const isValid = verifyFreelancerId(freelancerId);
  
  if (isValid) {
    saveFreelancerSession(freelancerId);
    return true;
  }
  
  return false;
};

/**
 * Fonction utilitaire pour le développement - affiche les informations de hachage
 */
export const getHashInfo = () => {
  console.log('IDs de freelancers disponibles:');
  VALID_FREELANCER_IDS.forEach((originalId, hashedId) => {
    console.log(`${originalId} -> ${hashedId}`);
  });
};
