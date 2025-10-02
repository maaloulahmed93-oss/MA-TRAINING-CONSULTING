import { PartnershipSession } from '../types/partnership';

// Clé pour le stockage local
const PARTNERSHIP_SESSION_KEY = 'partnership_session';

// URL de l'API backend
const API_BASE_URL = 'http://localhost:3001';

// Vérifier si un ID de partenaire est valide via l'API
export const verifyPartnerId = async (partnerId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/partners/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ partnerId: partnerId.toUpperCase() }),
    });

    const data = await response.json();
    return response.ok && data.success;
  } catch (error) {
    console.error('Erreur lors de la vérification du partenaire:', error);
    return false;
  }
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
  try {
    const isValid = await verifyPartnerId(partnerId);
    
    if (isValid) {
      savePartnershipSession(partnerId);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Erreur lors de l\'authentification:', error);
    return false;
  }
};

// Fonction utilitaire pour obtenir l'ID du partenaire connecté
export const getCurrentPartnerId = (): string | null => {
  const session = getPartnershipSession();
  return session ? session.partnerId : null;
};

// Fonction de debug pour obtenir les informations de session (développement uniquement)
export const getSessionInfo = () => {
  const session = getPartnershipSession();
  return {
    hasSession: !!session,
    partnerId: session?.partnerId || null,
    timestamp: session?.timestamp || null,
    isValid: session?.isValid || false
  };
};
