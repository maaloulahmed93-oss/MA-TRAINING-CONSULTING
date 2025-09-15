// Import API functions
import { getProgramsWithFallback, fetchProgramById as apiFetchProgramById, fetchProgramsByCategory as apiFetchProgramsByCategory, getAvailableSessions as apiGetAvailableSessions } from '../services/programsApi';

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

// Fallback programs for immediate use
export const trainingPrograms: Program[] = [
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
    ],
    rating: 4.8
  }
];

// Function to get fresh data from API (use this in components)
export const getTrainingPrograms = getProgramsWithFallback;

// Utility functions for backward compatibility
export const getProgramById = (id: string): Program | undefined => {
  return trainingPrograms.find(program => program.id === id);
};

export const getProgramsByCategory = (category: string): Program[] => {
  return trainingPrograms.filter(program => program.category === category);
};

export const getAvailableSessions = (programId: string): { id: string; date: string }[] => {
  const program = getProgramById(programId);
  if (!program) return [];
  
  const now = new Date();
  return program.sessions.filter(session => new Date(session.startDate) > now);
};

// Export API functions with different names to avoid conflicts
export { apiFetchProgramById, apiFetchProgramsByCategory, apiGetAvailableSessions };
