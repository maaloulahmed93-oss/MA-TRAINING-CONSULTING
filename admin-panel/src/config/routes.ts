/**
 * Routes configuration for the Admin Panel
 * Centralizes all route paths for easy maintenance
 */

export const ROUTES = {
  // Authentication
  LOGIN: '/login',
  
  // Main Dashboard
  DASHBOARD: '/',

  // Professional Diagnostic
  DIAGNOSTIC_SESSIONS: '/diagnostic-sessions',
  DIAGNOSTIC_SESSION_DETAIL: '/diagnostic-sessions/:id',
  DIAGNOSTIC_SESSION_EXPERT_HANDOVER: '/diagnostic-sessions/:id/expert-handover',
  DIAGNOSTIC_EXPERT_HANDOVER_S1: '/expert-handover-s1',
  DIAGNOSTIC_QUESTIONS: '/diagnostic-questions',
  
  // Content Management
  CATEGORIES: '/categories',
  PARTNERSHIPS: '/partnerships',
  PARTNERSHIPS_NEW: '/partnerships/new',
  PARTNERSHIPS_EDIT: '/partnerships/edit/:id',
  PARTNERSHIPS_VIEW: '/partnerships/view/:id',
  PARTICIPANTS_MANAGEMENT: '/participants-management',
  EVENTS: '/events',
  PARTNER_TESTIMONIALS: '/partner-testimonials',
  ETRAINING_TESTIMONIALS: '/e-training-testimonials',
  ETRAINING_PRICING: '/e-training-pricing',
  
  // User Management
  USERS: '/users',
  PARTICIPATION_VERIFICATIONS: '/participation-verifications',
  
  // Partners & Freelancers
  PARTNERS: '/partners',
  COMMERCIAL_SERVICES: '/commercial-services',
  FREELANCER_OFFERS: '/partners/freelancer-offers',
  FREELANCER_MEETINGS: '/partners/freelancer-meetings',
  
  // Static Pages Management
  STATIC_PAGES: '/static-pages',
  HERO_SECTION: '/static-pages/hero',
  ABOUT_SECTION: '/static-pages/about',
  CONTACT_SECTION: '/static-pages/contact',

  // Newsletter subscribers (new)
  NEWSLETTER: '/newsletter',
  // Admin Notifications
  NOTIFICATIONS: '/notifications',
  // Finance
  FINANCE: '/finance',
  FACTURATION: '/facturation',

  // Consulting Opérationnel (Service 2)
  CONSULTING_OPERATIONNEL_ACCOUNTS: '/consulting-operationnel-accounts',

  // Service 2 (Async)
  SERVICE2_EXAMS: '/service2/exams',
  SERVICE2_FINISH_SLOTS: '/service2/finish-slots',
  
  // Site Settings
  SETTINGS: '/settings',
  SITE_CONFIG: '/settings/site-config',
  APPEARANCE: '/settings/appearance',
  ESPACE_RESSOURCES_SETTINGS: '/settings/espace-ressources',
  
  // Digitalisation module
  DIGITALIZATION: '/digitalization',
  DIGITALIZATION_SERVICES: '/digitalization/services',
  DIGITALIZATION_PRODUCTS: '/digitalization/products',
  DIGITALIZATION_PORTFOLIO: '/digitalization/portfolio',
  DIGITALIZATION_CONTACTS: '/digitalization/contacts',
  DIGITALIZATION_TESTIMONIALS: '/digitalization/testimonials',
} as const;

/**
 * Navigation items for the sidebar
 */
import { NavigationItem } from '../types';

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: 'HomeIcon',
  },
  {
    name: 'Diagnostic Sessions',
    href: ROUTES.DIAGNOSTIC_SESSIONS,
    icon: 'DocumentTextIcon',
  },
  {
    name: 'Expert Handover (S1)',
    href: ROUTES.DIAGNOSTIC_EXPERT_HANDOVER_S1,
    icon: 'WrenchScrewdriverIcon',
  },
  {
    name: 'Diagnostic Questions',
    href: ROUTES.DIAGNOSTIC_QUESTIONS,
    icon: 'DocumentTextIcon',
  },
  {
    name: 'Catégories',
    href: ROUTES.CATEGORIES,
    icon: 'CubeIcon',
  },
  {
    name: 'Témoignages E-Training',
    href: ROUTES.ETRAINING_TESTIMONIALS,
    icon: 'ChatBubbleLeftRightIcon',
  },
  {
    name: 'Prix E-Training',
    href: ROUTES.ETRAINING_PRICING,
    icon: 'BanknotesIcon',
  },
  {
    name: 'Témoignages Partenaires',
    href: ROUTES.PARTNER_TESTIMONIALS,
    icon: 'SparklesIcon',
  },
  {
    name: 'Événements',
    href: ROUTES.EVENTS,
    icon: 'CalendarIcon',
  },
  {
    name: 'Utilisateurs',
    href: ROUTES.USERS,
    icon: 'UsersIcon',
  },
  {
    name: 'Vérification de participation',
    href: ROUTES.PARTICIPATION_VERIFICATIONS,
    icon: 'DocumentTextIcon',
  },
  {
    name: 'Service 2 — Missions',
    href: ROUTES.SERVICE2_EXAMS,
    icon: 'DocumentTextIcon',
    children: [
      { name: 'Exams', href: ROUTES.SERVICE2_EXAMS },
      { name: 'Finish Slots', href: ROUTES.SERVICE2_FINISH_SLOTS },
      { name: 'Comptes S2', href: ROUTES.CONSULTING_OPERATIONNEL_ACCOUNTS },
    ],
  },
  {
    name: 'Gestion des Participants',
    href: ROUTES.PARTICIPANTS_MANAGEMENT,
    icon: 'UsersIcon',
  },
  {
    name: 'Newsletter',
    href: ROUTES.NEWSLETTER,
    icon: 'EnvelopeIcon',
  },
  {
    name: 'Digitalisation',
    href: ROUTES.DIGITALIZATION,
    icon: 'ComputerDesktopIcon',
    children: [
      { name: 'Services', href: ROUTES.DIGITALIZATION_SERVICES },
      { name: 'Démo Produits', href: ROUTES.DIGITALIZATION_PRODUCTS },
      { name: 'Portfolio', href: ROUTES.DIGITALIZATION_PORTFOLIO },
      { name: 'Contacts', href: ROUTES.DIGITALIZATION_CONTACTS },
      { name: 'Témoignages', href: ROUTES.DIGITALIZATION_TESTIMONIALS },
    ],
  },
  {
    name: 'Autres infos partenaire',
    href: ROUTES.FINANCE,
    icon: 'BanknotesIcon',
  },
  {
    name: 'Facturation / Devis',
    href: ROUTES.FACTURATION,
    icon: 'DocumentTextIcon',
  },
  {
    name: 'Paramètres',
    href: ROUTES.SETTINGS,
    icon: 'CogIcon',
    children: [
      {
        name: 'Configuration Site',
        href: ROUTES.SITE_CONFIG,
      },
      {
        name: 'Pages du Site',
        href: ROUTES.APPEARANCE,
      },
      {
        name: 'Espace Ressources',
        href: ROUTES.ESPACE_RESSOURCES_SETTINGS,
      },
    ],
  },
];
