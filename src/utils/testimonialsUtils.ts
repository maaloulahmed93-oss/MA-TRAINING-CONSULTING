// Interface TypeScript pour le typage strict
export interface Testimonial {
  id: number;
  text: string;
  initials: string;
  name: string;
  position: string;
}

// Mock data par défaut
export const defaultTestimonials: Testimonial[] = [
  { 
    id: 1, 
    text: "Grâce à MATC, notre équipe RH a progressé rapidement dans la digitalisation.", 
    initials: "BXZ", 
    name: "Banque XYZ", 
    position: "DRH" 
  },
  { 
    id: 2, 
    text: "Leurs formateurs sont excellents : clairs, concrets.", 
    initials: "TP", 
    name: "TECHPRO", 
    position: "Directeur Général" 
  },
  { 
    id: 3, 
    text: "MATC a apporté une vraie valeur ajoutée à notre organisation.", 
    initials: "EG", 
    name: "ÉDUCA Group", 
    position: "Responsable formation" 
  },
  { 
    id: 4, 
    text: "Un partenariat qui a transformé notre approche du digital.", 
    initials: "BC", 
    name: "BIZCONNECT", 
    position: "CEO" 
  },
  { 
    id: 5, 
    text: "Des solutions concrètes et efficaces pour nos projets.", 
    initials: "NM", 
    name: "Nova Market", 
    position: "Directrice Marketing" 
  },
  { 
    id: 6, 
    text: "Une équipe à l'écoute et réactive à chaque étape.", 
    initials: "SC", 
    name: "SmartConsult", 
    position: "Consultante Senior" 
  },
  { 
    id: 7, 
    text: "Des formations co-animées qui ont vraiment motivé nos équipes.", 
    initials: "PL", 
    name: "ProLearn", 
    position: "Directeur Formation" 
  }
];

// Fonction pour charger les témoignages depuis localStorage
export const loadTestimonialsFromLocalStorage = (): Testimonial[] => {
  try {
    const stored = localStorage.getItem('matc-testimonials');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Erreur lors du chargement des témoignages:', error);
  }
  return defaultTestimonials;
};

// Fonction pour sauvegarder les témoignages dans localStorage
export const saveTestimonialsToLocalStorage = (testimonials: Testimonial[]): void => {
  try {
    localStorage.setItem('matc-testimonials', JSON.stringify(testimonials));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des témoignages:', error);
  }
};

// Fonction pour ajouter un nouveau témoignage
export const addTestimonial = (testimonial: Omit<Testimonial, 'id'>): void => {
  const testimonials = loadTestimonialsFromLocalStorage();
  const newId = Math.max(...testimonials.map(t => t.id)) + 1;
  const newTestimonial: Testimonial = { ...testimonial, id: newId };
  const updatedTestimonials = [...testimonials, newTestimonial];
  saveTestimonialsToLocalStorage(updatedTestimonials);
};

// Fonction pour supprimer un témoignage
export const removeTestimonial = (id: number): void => {
  const testimonials = loadTestimonialsFromLocalStorage();
  const filteredTestimonials = testimonials.filter(t => t.id !== id);
  saveTestimonialsToLocalStorage(filteredTestimonials);
};

// Fonction pour mettre à jour un témoignage
export const updateTestimonial = (id: number, updates: Partial<Omit<Testimonial, 'id'>>): void => {
  const testimonials = loadTestimonialsFromLocalStorage();
  const updatedTestimonials = testimonials.map(t => 
    t.id === id ? { ...t, ...updates } : t
  );
  saveTestimonialsToLocalStorage(updatedTestimonials);
};

// Fonction pour réinitialiser aux données par défaut
export const resetTestimonialsToDefault = (): void => {
  saveTestimonialsToLocalStorage(defaultTestimonials);
};
