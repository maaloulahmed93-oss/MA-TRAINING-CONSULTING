const API_BASE_URL = 'https://matc-backend.onrender.com/api';

export interface ApiProgram {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  price: number;
  duration: string;
  maxParticipants: number;
  sessionsPerYear: number;
  modules: { title: string }[];
  sessions: { title: string; date: string }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  sessions: { id: string; date: string; startDate: string; endDate: string }[];
  modules: string[];
  price?: number;
  duration: string;
  level: string;
  category: string;
  instructor: string;
  maxStudents: number;
  features: string[];
  rating?: number;
}

// Transform API program to frontend format
const transformApiProgram = (apiProgram: ApiProgram): Program => {
  return {
    id: apiProgram._id,
    title: apiProgram.title,
    description: apiProgram.description,
    sessions: apiProgram.sessions.map((session, index) => ({
      id: `${apiProgram._id}-session-${index + 1}`,
      date: session.date,
      startDate: session.date.split(' - ')[0] || session.date,
      endDate: session.date.split(' - ')[1] || session.date
    })),
    modules: apiProgram.modules.map(module => module.title),
    price: apiProgram.price,
    duration: apiProgram.duration,
    level: apiProgram.level,
    category: apiProgram.category,
    instructor: getInstructorByCategory(apiProgram.category),
    maxStudents: apiProgram.maxParticipants,
    features: getFeaturesByCategory(apiProgram.category),
    rating: 4.5 // Default rating for API programs
  };
};

// Get instructor based on category (fallback data)
const getInstructorByCategory = (category: string): string => {
  const instructors: { [key: string]: string } = {
    'Technologies': 'Ahmed Benali',
    'Data Science': 'Dr. Fatima El Mansouri',
    'Business': 'Mohamed Kharrat',
    'Design': 'Leila Trabelsi',
    'Marketing': 'Youssef Hadj'
  };
  return instructors[category] || 'Instructeur MATC';
};

// Get features based on category (fallback data)
const getFeaturesByCategory = (category: string): string[] => {
  const features: { [key: string]: string[] } = {
    'Technologies': [
      'Projets pratiques',
      'Mentorat personnalisé',
      'Certificat de fin de formation',
      'Accès à vie aux ressources'
    ],
    'Data Science': [
      'Projets sur données réelles',
      'Accès aux outils cloud',
      'Portfolio de projets',
      'Certification IBM/Google'
    ],
    'Business': [
      'Études de cas réels',
      'Coaching individuel',
      'Certification PMI',
      'Réseau professionnel'
    ],
    'Design': [
      'Portfolio professionnel',
      'Projets clients réels',
      'Mentorat design senior',
      'Certification Adobe'
    ],
    'Marketing': [
      'Campagnes marketing réelles',
      'Outils premium inclus',
      'Certification Google/Facebook',
      'Suivi ROI personnalisé'
    ]
  };
  return features[category] || [
    'Formation certifiante',
    'Support pédagogique',
    'Suivi personnalisé',
    'Accès aux ressources'
  ];
};

// Fetch all programs
export const fetchPrograms = async (filters?: {
  category?: string;
  level?: string;
  search?: string;
}): Promise<Program[]> => {
  try {
    const params = new URLSearchParams();
    
    // Always filter for active programs only in frontend
    params.append('activeOnly', 'true');
    
    if (filters?.category && filters.category !== 'Tous') {
      params.append('category', filters.category);
    }
    if (filters?.level && filters.level !== 'Tous niveaux') {
      params.append('level', filters.level);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const url = `${API_BASE_URL}/programs${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch programs');
    }
    
    return data.data.map(transformApiProgram);
  } catch (error) {
    console.error('Error fetching programs:', error);
    // Return empty array on error to prevent app crash
    return [];
  }
};

// Fetch single program by ID
export const fetchProgramById = async (id: string): Promise<Program | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/programs/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Program not found');
    }
    
    return transformApiProgram(data.data);
  } catch (error) {
    console.error('Error fetching program:', error);
    return null;
  }
};

// Fetch programs by category
export const fetchProgramsByCategory = async (category: string): Promise<Program[]> => {
  return fetchPrograms({ category });
};

// Get available sessions for a program
export const getAvailableSessions = (program: Program): { id: string; date: string }[] => {
  const now = new Date();
  return program.sessions.filter(session => {
    const sessionStart = new Date(session.startDate);
    return sessionStart > now;
  });
};

// Fallback data in case API is not available
export const fallbackPrograms: Program[] = [
  {
    id: "react-advanced",
    title: "Formation React Avancée",
    description: "Maîtrisez React avec les hooks avancés, la gestion d'état moderne et l'optimisation des performances pour créer des applications web robustes et évolutives.",
    sessions: [
      {
        id: "react-session-1",
        date: "20 Juin - 20 Septembre 2024",
        startDate: "2024-06-20",
        endDate: "2024-09-20"
      }
    ],
    modules: [
      "React Hooks Avancés",
      "Gestion d'état avec Redux Toolkit",
      "Optimisation des performances"
    ],
    price: 2400,
    duration: "12 semaines",
    level: "Avancé",
    category: "Technologies",
    instructor: "Ahmed Benali",
    maxStudents: 25,
    features: [
      "Projets pratiques",
      "Mentorat personnalisé",
      "Certificat de fin de formation"
    ]
  }
];

// Get programs with fallback
export const getProgramsWithFallback = async (filters?: {
  category?: string;
  level?: string;
  search?: string;
}): Promise<Program[]> => {
  try {
    const programs = await fetchPrograms(filters);
    return programs.length > 0 ? programs : fallbackPrograms;
  } catch (error) {
    console.warn('Using fallback programs due to API error:', error);
    return fallbackPrograms;
  }
};

// Fetch categories from API
export const fetchCategories = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch categories');
    }
    
    // Extract category names from API response
    const categoryNames = data.data
      .filter((cat: any) => cat.isActive !== false) // Only active categories
      .map((cat: any) => cat.name);
    
    return ['Tous', ...categoryNames];
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return fallback categories
    return ['Tous', 'Technologies', 'Marketing', 'Data Science', 'Design', 'Business'];
  }
};
