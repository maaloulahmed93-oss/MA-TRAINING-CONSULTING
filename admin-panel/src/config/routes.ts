/**
 * Routes configuration for the Admin Panel
 * Centralizes all route paths for easy maintenance
 */

export const ROUTES = {
  // Authentication
  LOGIN: '/login',
  
  // Main Dashboard
  DASHBOARD: '/',
  
  // Content Management
  PROGRAMS: '/programs',
  CATEGORIES: '/categories',
  PACKS: '/packs',
  TESTIMONIALS: '/testimonials',
  EVENTS: '/events',
  PARTNER_TESTIMONIALS: '/partner-testimonials',
  FOOTER_SETTINGS: '/footer-settings',
  FREE_COURSES: '/free-courses',
  
  // User Management
  USERS: '/users',
  PARTICIPANTS: '/participants',
  ATTESTATIONS: '/attestations',
  
  // Partners & Freelancers
  PARTNERS: '/partners',
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
  
  // Site Settings
  SETTINGS: '/settings',
  SITE_CONFIG: '/settings/site-config',
  APPEARANCE: '/settings/appearance',
  
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
    name: 'Programmes',
    href: ROUTES.PROGRAMS,
    icon: 'AcademicCapIcon',
  },
  {
    name: 'Catégories',
    href: ROUTES.CATEGORIES,
    icon: 'CubeIcon',
  },
  {
    name: 'Packs',
    href: ROUTES.PACKS,
    icon: 'CubeIcon',
  },
  {
    name: 'Cours Gratuits',
    href: ROUTES.FREE_COURSES,
    icon: 'AcademicCapIcon',
  },
  {
    name: 'Témoignages',
    href: ROUTES.TESTIMONIALS,
    icon: 'ChatBubbleLeftRightIcon',
  },
  {
    name: 'Témoignages Partenaires',
    href: ROUTES.PARTNER_TESTIMONIALS,
    icon: 'SparklesIcon',
  },
  {
    name: 'Gestion du Footer',
    href: ROUTES.FOOTER_SETTINGS,
    icon: 'WrenchScrewdriverIcon',
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
    name: 'Accès Partenaires',
    href: ROUTES.PARTNERS,
    icon: 'UserGroupIcon',
    children: [
      {
        name: 'Tous les Partenaires',
        href: ROUTES.PARTNERS,
      },
      {
        name: 'Freelancer Offers',
        href: ROUTES.FREELANCER_OFFERS,
      },
      {
        name: 'Freelancer Meetings',
        href: ROUTES.FREELANCER_MEETINGS,
      },
      {
        name: 'Notifications',
        href: ROUTES.NOTIFICATIONS,
      },
    ],
  },
  {
    name: 'Participants',
    href: ROUTES.PARTICIPANTS,
    icon: 'UsersIcon',
  },
  {
    name: 'Gestion des Attestations',
    href: ROUTES.ATTESTATIONS,
    icon: 'AcademicCapIcon',
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
    name: 'Paramètres',
    href: ROUTES.SETTINGS,
    icon: 'CogIcon',
    children: [
      {
        name: 'Configuration Site',
        href: ROUTES.SITE_CONFIG,
      },
      {
        name: 'Apparence',
        href: ROUTES.APPEARANCE,
      },
    ],
  },
];
