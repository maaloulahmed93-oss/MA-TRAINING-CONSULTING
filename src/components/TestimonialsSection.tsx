import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import { partnerTestimonialsWebsiteService } from '../services/partnerTestimonialsApiService';

// Interface TypeScript pour le typage strict
interface Testimonial {
  id: number;
  text: string;
  initials: string;
  name: string;
  position: string;
}

// Mock data par défaut
const defaultTestimonials: Testimonial[] = [
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

// Couleurs pour les cercles d'initiales
const avatarColors = [
  'bg-gradient-to-br from-blue-500 to-blue-600',
  'bg-gradient-to-br from-green-500 to-green-600',
  'bg-gradient-to-br from-purple-500 to-purple-600',
  'bg-gradient-to-br from-orange-500 to-orange-600',
  'bg-gradient-to-br from-pink-500 to-pink-600',
  'bg-gradient-to-br from-indigo-500 to-indigo-600',
  'bg-gradient-to-br from-teal-500 to-teal-600'
];

// Fonction pour charger les témoignages depuis localStorage
const loadTestimonialsFromLocalStorage = (): Testimonial[] => {
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
const saveTestimonialsToLocalStorage = (testimonials: Testimonial[]): void => {
  try {
    localStorage.setItem('matc-testimonials', JSON.stringify(testimonials));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des témoignages:', error);
  }
};

const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected'>('disconnected');

  // Charger les témoignages au montage du composant
  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading testimonials from API...');
      
      // Try to load from API first
      const apiTestimonials = await partnerTestimonialsWebsiteService.getTestimonialsWithCache();
      
      // Convert API format to component format
      const convertedTestimonials: Testimonial[] = apiTestimonials.map((testimonial, index) => ({
        id: parseInt(testimonial.id) || index + 1,
        text: testimonial.text,
        initials: testimonial.initials,
        name: testimonial.name,
        position: testimonial.position
      }));
      
      setTestimonials(convertedTestimonials);
      setApiStatus('connected');
      
      console.log(`✅ ${convertedTestimonials.length} testimonials loaded from API`);
      
      // Save to localStorage as backup
      saveTestimonialsToLocalStorage(convertedTestimonials);
      
    } catch (error) {
      console.error('❌ Error loading testimonials from API:', error);
      setApiStatus('disconnected');
      
      // Fallback to localStorage
      console.log('📦 Falling back to localStorage...');
      const localTestimonials = loadTestimonialsFromLocalStorage();
      setTestimonials(localTestimonials);
      
      // If localStorage is also empty, use defaults
      if (localTestimonials.length === 0) {
        setTestimonials(defaultTestimonials);
        saveTestimonialsToLocalStorage(defaultTestimonials);
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-play carousel toutes les 5 secondes
  useEffect(() => {
    if (testimonials.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Obtenir les témoignages visibles (3 sur desktop, 1 sur mobile)
  const getVisibleTestimonials = () => {
    if (testimonials.length === 0) return [];
    
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % testimonials.length;
      visible.push(testimonials[index]);
    }
    return visible;
  };

  const visibleTestimonials = getVisibleTestimonials();

  // Animations simplifiées pour éviter les erreurs TypeScript

  if (testimonials.length === 0) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Éléments décoratifs de fond */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Titre et sous-titre */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Témoignages de nos{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              partenaires
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez l'expérience de nos clients et partenaires qui nous font confiance
          </p>
          
          {/* API Status Indicator (Development Mode) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="flex items-center justify-center mt-4">
              <div className={`w-2 h-2 rounded-full mr-2 ${apiStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`text-sm ${apiStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                API {apiStatus === 'connected' ? 'Connectée' : 'Déconnectée'}
              </span>
            </div>
          )}
          
          {/* Ligne décorative */}
          <div className="flex items-center justify-center mt-8">
            <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            <div className="h-2 w-2 bg-blue-500 rounded-full mx-4"></div>
            <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
          </div>
        </motion.div>

        {/* Carousel des témoignages */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, staggerChildren: 0.2 }}
          key={currentIndex} // Force re-animation à chaque changement
        >
          {visibleTestimonials.map((testimonial, index) => (
            <motion.div
              key={`${testimonial.id}-${currentIndex}-${index}`}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ 
                y: -8, 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 relative group"
            >
              {/* Effet de brillance au hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Avatar avec initiales */}
              <div className="flex items-center mb-6">
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg
                  ${avatarColors[testimonial.id % avatarColors.length]}
                `}>
                  {testimonial.initials}
                </div>
                <div className="ml-4">
                  <h3 className="font-bold text-gray-900 text-lg">{testimonial.name}</h3>
                  <p className="text-gray-600 text-sm">{testimonial.position}</p>
                </div>
              </div>

              {/* Texte du témoignage */}
              <blockquote className="text-gray-700 italic leading-relaxed relative">
                <span className="text-4xl text-blue-500/30 absolute -top-2 -left-2">"</span>
                <p className="relative z-10">{testimonial.text}</p>
                <span className="text-4xl text-blue-500/30 absolute -bottom-4 -right-2">"</span>
              </blockquote>

              {/* Étoiles décoratives */}
              <div className="flex justify-center mt-6 space-x-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-yellow-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Indicateurs de pagination */}
        <div className="flex justify-center mt-12 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`
                w-3 h-3 rounded-full transition-all duration-300
                ${index === currentIndex 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
                }
              `}
              aria-label={`Aller au témoignage ${index + 1}`}
            />
          ))}
        </div>

        {/* Statistiques en bas */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">+{testimonials.length}</div>
              <div className="text-gray-600">Partenaires satisfaits</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
              <div className="text-gray-600">Taux de satisfaction</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">5 ans</div>
              <div className="text-gray-600">D'expérience moyenne</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;