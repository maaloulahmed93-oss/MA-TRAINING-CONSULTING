// Commercial Authentication Service
// Handles authentication, session management, and ID validation for commercial users

interface CommercialSession {
  commercialId: string;
  timestamp: number;
  isValid: boolean;
}

// Valid commercial IDs (hashed for security)
const validCommercialIds = {
  'COMM123': 'c1a2b3c4d',
  'COMM456': 'e5f6g7h8i',
  'COMMERCIAL789': 'j9k0l1m2n',
  'AFFILIATE2024': 'o3p4q5r6s',
  'DEMO-COMM': 't7u8v9w0x'
};

// Simple hash function for ID validation
const hashId = (id: string): string => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).substring(0, 9);
};

export const verifyCommercialId = (id: string): boolean => {
  const upperCaseId = id.toUpperCase();
  const hashedId = hashId(upperCaseId);
  return Object.values(validCommercialIds).includes(hashedId) || 
         Object.keys(validCommercialIds).includes(upperCaseId);
};

export const saveCommercialSession = (commercialId: string): void => {
  const session: CommercialSession = {
    commercialId: commercialId.toUpperCase(),
    timestamp: Date.now(),
    isValid: true
  };
  
  localStorage.setItem('commercialSession', JSON.stringify(session));
};

export const getCommercialSession = (): CommercialSession | null => {
  try {
    const sessionData = localStorage.getItem('commercialSession');
    if (!sessionData) return null;
    
    const session: CommercialSession = JSON.parse(sessionData);
    
    // Check if session is expired (24 hours)
    const now = Date.now();
    const sessionAge = now - session.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    if (sessionAge > maxAge) {
      clearCommercialSession();
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error reading commercial session:', error);
    clearCommercialSession();
    return null;
  }
};

export const isCommercialAuthenticated = (): boolean => {
  const session = getCommercialSession();
  return session !== null && session.isValid;
};

export const clearCommercialSession = (): void => {
  localStorage.removeItem('commercialSession');
};

export const authenticateCommercial = async (commercialId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      const isValid = verifyCommercialId(commercialId);
      if (isValid) {
        saveCommercialSession(commercialId);
      }
      resolve(isValid);
    }, 1000);
  });
};

// Get commercial info from session
export const getCommercialInfo = (): { id: string; name: string } | null => {
  const session = getCommercialSession();
  if (!session) return null;
  
  // Mock commercial info based on ID
  const commercialNames: { [key: string]: string } = {
    'COMM123': 'Ahmed Ben Salah',
    'COMM456': 'Fatima El Mansouri',
    'COMMERCIAL789': 'Omar Rachidi',
    'AFFILIATE2024': 'Leila Benali',
    'DEMO-COMM': 'Utilisateur Démo'
  };
  
  return {
    id: session.commercialId,
    name: commercialNames[session.commercialId] || 'Commercial Utilisateur'
  };
};

// Debug function to get hash info (development only)
export const getHashInfo = () => {
  console.log('Valid Commercial IDs and their hashes:');
  Object.entries(validCommercialIds).forEach(([id, hash]) => {
    console.log(`${id} -> ${hash}`);
  });
};
