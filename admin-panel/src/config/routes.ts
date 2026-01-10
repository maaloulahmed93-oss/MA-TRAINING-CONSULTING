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
  
  // User Management
  USERS: '/users',
  ESPACE_PRO_ACCOUNTS: '/espace-pro-accounts',
  ESPACE_PRO_EXPERT_PANEL: '/espace-pro-expert',
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

  // Registrations list (new)
  REGISTRATIONS: '/registrations',

  // Newsletter subscribers (new)
  NEWSLETTER: '/newsletter',
  // Admin Notifications
  NOTIFICATIONS: '/notifications',
  // Finance
  FINANCE: '/finance',
  FACTURATION: '/facturation',

  // Consulting Opérationnel (Service 2)
  CONSULTING_OPERATIONNEL_ACCOUNTS: '/consulting-operationnel-accounts',
  
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
    name: 'Comptes Espace Pro',
    href: ROUTES.ESPACE_PRO_ACCOUNTS,
    icon: 'UserGroupIcon',
  },
  {
    name: 'Expert Panel (Espace Pro)',
    href: ROUTES.ESPACE_PRO_EXPERT_PANEL,
    icon: 'WrenchScrewdriverIcon',
  },
  {
    name: 'Vérification de participation',
    href: ROUTES.PARTICIPATION_VERIFICATIONS,
    icon: 'DocumentTextIcon',
  },
  {
    name: 'Comptes Consulting Opérationnel (S2)',
    href: ROUTES.CONSULTING_OPERATIONNEL_ACCOUNTS,
    icon: 'UsersIcon',
  },
  {
    name: 'Gestion des Participants',
    href: ROUTES.PARTICIPANTS_MANAGEMENT,
    icon: 'UsersIcon',
  },
  {
    name: "Liste d'inscriptions",
    href: ROUTES.REGISTRATIONS,
    icon: 'DocumentTextIcon',
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
