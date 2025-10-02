const API_BASE_URL = 'http://localhost:3001/api';

export interface ApiPack {
  _id: string;
  packId: string;
  name: string;
  description: string;
  image: string;
  details: {
    price: number;
    originalPrice: number;
    savings: number;
    advantages: string[];
    themes: {
      themeId: string;
      name: string;
      startDate: string;
      endDate: string;
      modules: {
        moduleId: string;
        title: string;
      }[];
    }[];
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pack {
  packId: string;
  name: string;
  description: string;
  image: string;
  details: {
    themes: {
      themeId: string;
      name: string;
      startDate: string;
      endDate: string;
      modules: {
        moduleId: string;
        title: string;
      }[];
    }[];
    advantages: string[];
    price: number;
    originalPrice: number;
    savings: number;
  };
}

// Transform API pack to frontend format
const transformApiPack = (apiPack: ApiPack): Pack => {
  return {
    packId: apiPack.packId,
    name: apiPack.name,
    description: apiPack.description,
    image: apiPack.image,
    details: {
      themes: apiPack.details.themes,
      advantages: apiPack.details.advantages,
      price: apiPack.details.price,
      originalPrice: apiPack.details.originalPrice,
      savings: apiPack.details.savings
    }
  };
};

// Fetch all packs
export const fetchPacks = async (): Promise<Pack[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/packs`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch packs');
    }
    
    return data.data.map(transformApiPack);
  } catch (error) {
    console.error('Error fetching packs:', error);
    // Return empty array on error to prevent app crash
    return [];
  }
};

// Fetch single pack by ID
export const fetchPackById = async (id: string): Promise<Pack | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/packs/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Pack not found');
    }
    
    return transformApiPack(data.data);
  } catch (error) {
    console.error('Error fetching pack:', error);
    return null;
  }
};

// Fallback packs in case API is not available
export const fallbackPacks: Pack[] = [
  {
    packId: "marketing-digital",
    name: "Pack Marketing Digital",
    description: "Maîtrisez le marketing digital de A à Z",
    image: "/images/marketing.png",
    details: {
      price: 500,
      originalPrice: 750,
      savings: 250,
      themes: [
        {
          themeId: "seo",
          name: "SEO et Référencement",
          startDate: "2025-09-01",
          endDate: "2025-09-07",
          modules: [
            { moduleId: "m1", title: "Introduction au SEO" },
            { moduleId: "m2", title: "Optimisation On-Page" },
            { moduleId: "m3", title: "Backlinks & Autorité" },
          ],
        }
      ],
      advantages: [
        "Accès 1 an aux contenus",
        "Certificats officiels inclus",
        "Coaching personnalisé",
        "Réseau d'experts & job board",
        "Projets réels d'entreprises",
        "Support technique 24/7",
      ],
    },
  }
];

// Get packs with fallback
export const getPacksWithFallback = async (): Promise<Pack[]> => {
  try {
    const packs = await fetchPacks();
    return packs.length > 0 ? packs : fallbackPacks;
  } catch (error) {
    console.warn('Using fallback packs due to API error:', error);
    return fallbackPacks;
  }
};

// Function to convert price according to currency
export const convertPrice = (price: number, currency: string): string => {
  switch (currency) {
    case '€':
      return `${price}€`;
    case '$':
      return `$${Math.round(price * 1.08)}`;
    case 'TND':
      return `${Math.round(price * 3.35)} TND`;
    default:
      return `${price}€`;
  }
};
