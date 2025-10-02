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
  [simpleHash('DEMO-FREELANCER'), 'DEMO-FREELANCER'],
  [simpleHash('FRE-340255'), 'FRE-340255'],
  [simpleHash('FRE-289251'), 'FRE-289251']
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
 * Authentifie un freelancer avec son ID via l'API Backend
 */
export const authenticateFreelancer = async (freelancerId: string, email?: string): Promise<boolean> => {
  try {
    // Si email est fourni, utiliser la nouvelle API avec email
    if (email) {
      const response = await fetch('http://localhost:3001/api/partners/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          partnerId: freelancerId,
          email: email,
          partnerType: 'freelancer'
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        // Sauvegarder la session si l'authentification réussit
        saveFreelancerSession(freelancerId);
        return true;
      }

      return false;
    }

    // Fallback: vérification locale pour les sessions existantes
    const isValid = verifyFreelancerId(freelancerId);
    if (isValid) {
      return true; // Ne pas sauvegarder à nouveau si c'est juste une vérification
    }
    
    return false;
  } catch (error) {
    console.error('Erreur lors de l\'authentification freelancer:', error);
    
    // Fallback vers la validation locale en cas d'erreur réseau
    const isValid = verifyFreelancerId(freelancerId);
    if (isValid) {
      return true;
    }
    
    return false;
  }
};

/**
 * Authentifie et sauvegarde la session après connexion réussie
 */
export const authenticateAndSaveSession = (freelancerId: string): void => {
  console.log('💾 Saving freelancer session for:', freelancerId);
  saveFreelancerSession(freelancerId);
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
