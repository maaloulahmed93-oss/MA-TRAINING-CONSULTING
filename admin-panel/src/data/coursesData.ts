import { CoursesData } from '../types/courses';

// Données des cours gratuits
export const coursesData: CoursesData = {
  domains: [
    {
      id: 'marketing',
      title: 'Marketing',
      icon: '📊',
      description: 'Stratégies marketing modernes',
      courses: [
        {
          id: 'marketing-digital',
          title: 'Marketing Digital Avancé',
          description: 'Maîtrisez les outils du marketing digital moderne',
          modules: [
            { id: 1, title: 'Introduction au Marketing Digital', duration: '45 min' },
            { id: 2, title: 'Stratégies SEO et SEM', duration: '60 min' },
            { id: 3, title: 'Réseaux Sociaux et Community Management', duration: '50 min' },
            { id: 4, title: 'Email Marketing et Automation', duration: '40 min' },
            { id: 5, title: 'Projet Pratique : Campagne Complète', duration: '90 min' }
          ]
        },
        {
          id: 'brand-strategy',
          title: 'Stratégie de Marque',
          description: 'Construisez une identité de marque forte et mémorable',
          modules: [
            { id: 1, title: 'Fondements de l\'Identité de Marque', duration: '40 min' },
            { id: 2, title: 'Positionnement et Différenciation', duration: '55 min' },
            { id: 3, title: 'Design et Communication Visuelle', duration: '65 min' },
            { id: 4, title: 'Stratégie de Contenu de Marque', duration: '45 min' },
            { id: 5, title: 'Cas Pratique : Refonte de Marque', duration: '80 min' }
          ]
        },
        {
          id: 'analytics',
          title: 'Analytics et Performance',
          description: 'Analysez et optimisez vos performances marketing',
          modules: [
            { id: 1, title: 'Introduction aux Analytics', duration: '35 min' },
            { id: 2, title: 'Google Analytics 4 Avancé', duration: '70 min' },
            { id: 3, title: 'KPIs et Tableaux de Bord', duration: '50 min' },
            { id: 4, title: 'A/B Testing et Optimisation', duration: '60 min' },
            { id: 5, title: 'Rapport d\'Analyse Complet', duration: '75 min' }
          ]
        },
        {
          id: 'content-marketing',
          title: 'Content Marketing',
          description: 'Créez du contenu qui convertit et engage',
          modules: [
            { id: 1, title: 'Stratégie de Contenu', duration: '45 min' },
            { id: 2, title: 'Création de Contenu Viral', duration: '55 min' },
            { id: 3, title: 'Storytelling et Narration', duration: '50 min' },
            { id: 4, title: 'Distribution et Amplification', duration: '40 min' },
            { id: 5, title: 'Calendrier Editorial Complet', duration: '70 min' }
          ]
        },
        {
          id: 'ecommerce-marketing',
          title: 'E-commerce Marketing',
          description: 'Boostez vos ventes en ligne avec des stratégies éprouvées',
          modules: [
            { id: 1, title: 'Optimisation de Boutique en Ligne', duration: '50 min' },
            { id: 2, title: 'Publicité Facebook et Instagram Ads', duration: '65 min' },
            { id: 3, title: 'Google Ads pour E-commerce', duration: '60 min' },
            { id: 4, title: 'Remarketing et Fidélisation', duration: '45 min' },
            { id: 5, title: 'Projet : Campagne E-commerce Complète', duration: '85 min' }
          ]
        }
      ]
    },
    {
      id: 'management-iso',
      title: 'Management ISO',
      icon: '🏆',
      description: 'Normes et certifications ISO',
      courses: [
        {
          id: 'iso-9001',
          title: 'ISO 9001 : Management de la Qualité',
          description: 'Maîtrisez la norme ISO 9001 et ses exigences',
          modules: [
            { id: 1, title: 'Introduction à la Norme ISO 9001', duration: '40 min' },
            { id: 2, title: 'Système de Management Qualité', duration: '55 min' },
            { id: 3, title: 'Processus et Amélioration Continue', duration: '60 min' },
            { id: 4, title: 'Audit Interne et Certification', duration: '50 min' },
            { id: 5, title: 'Mise en Pratique : Plan Qualité', duration: '75 min' }
          ]
        }
      ]
    }
  ],
  
  // IDs d'accès valides pour la démo
  validAccessIds: [
    'DEMO2024',
    'FREE-ACCESS',
    'STUDENT-2024',
    'TRIAL-COURSE',
    'GRATUIT-2024',
    'STUD2025'
  ]
};
