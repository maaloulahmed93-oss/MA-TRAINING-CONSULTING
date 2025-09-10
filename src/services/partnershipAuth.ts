import { PartnershipSession } from '../types/partnership';

// Clé pour le stockage local
const PARTNERSHIP_SESSION_KEY = 'partnership_session';

// IDs de partenaires autorisés (hashés pour la sécurité)
const AUTHORIZED_PARTNER_IDS = new Map([
  ['PARTNER123', 'p1a2r3t4n5e6r'],
  ['ENTREPRISE456', 'e1n2t3r4e5p6r7i8s9e'],
]);

// Fonction de hachage simple (pour la démo)
const hashPartnerId = (id: string): string => {
  return id.split('').map((char, index) => 
    char.charCodeAt(0).toString(16) + (index % 3)
  ).join('').substring(0, 12);
};

// Vérifier si un ID de partenaire est valide
export const verifyPartnerId = (partnerId: string): boolean => {
  const hashedId = hashPartnerId(partnerId);
  return Array.from(AUTHORIZED_PARTNER_IDS.values()).includes(hashedId) ||
         AUTHORIZED_PARTNER_IDS.has(partnerId);
};

// Sauvegarder la session du partenaire
export const savePartnershipSession = (partnerId: string): void => {
  const session: PartnershipSession = {
    partnerId: partnerId.toUpperCase(),
    timestamp: Date.now(),
    isValid: true
  };
  localStorage.setItem(PARTNERSHIP_SESSION_KEY, JSON.stringify(session));
};

// Récupérer la session du partenaire
export const getPartnershipSession = (): PartnershipSession | null => {
  try {
    const sessionData = localStorage.getItem(PARTNERSHIP_SESSION_KEY);
    if (!sessionData) return null;

    const session: PartnershipSession = JSON.parse(sessionData);
    
    // Vérifier si la session n'a pas expiré (24 heures)
    const isExpired = Date.now() - session.timestamp > 24 * 60 * 60 * 1000;
    
    if (isExpired) {
      clearPartnershipSession();
      return null;
    }

    return session;
  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    return null;
  }
};

// Vérifier si le partenaire est authentifié
export const isPartnerAuthenticated = (): boolean => {
  const session = getPartnershipSession();
  return session !== null && session.isValid;
};

// Nettoyer la session du partenaire
export const clearPartnershipSession = (): void => {
  localStorage.removeItem(PARTNERSHIP_SESSION_KEY);
};

// Authentifier un partenaire
export const authenticatePartner = async (partnerId: string): Promise<boolean> => {
  // Simulation d'un délai d'API
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (verifyPartnerId(partnerId)) {
    savePartnershipSession(partnerId);
    return true;
  }
  
  return false;
};

// Fonction utilitaire pour obtenir l'ID du partenaire connecté
export const getCurrentPartnerId = (): string | null => {
  const session = getPartnershipSession();
  return session ? session.partnerId : null;
};

// Fonction de debug pour obtenir les informations de hachage (développement uniquement)
export const getHashInfo = () => {
  return {
    'PARTNER123': hashPartnerId('PARTNER123'),
    'ENTREPRISE456': hashPartnerId('ENTREPRISE456')
  };
};
