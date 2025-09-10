/**
 * Shared Types
 * Centralized type definitions for the application
 */

// For Events Section
export type EventCategory = 'formation' | 'webinaire' | 'conference' | 'team-building' | 'voyage';

export interface Event {
  _id: string;
  title: string;
  category: EventCategory;
  date: Date;
  format: {
    type: 'Présentiel' | 'En ligne' | 'Hybride' | 'Voyage';
    details: string; // Ex: Hôtel, Zoom, Outdoor, Djerba
  };
  duration: string; // Ex: '2 jours', '3h'
  price?: number; // Optional, for free events
  places: {
    registered: number;
    total: number;
  };
  isPublished: boolean;
  description?: string;
  url?: string;
  createdAt: Date;
  updatedAt: Date;
}

// For Sidebar Navigation
export interface NavigationChild {
  name: string;
  href: string;
}

export interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  children?: NavigationChild[];
}

// For Testimonials Section
export interface PartnerTestimonial {
  _id: string;
  name: string;
  position: string;
  content: string;
  rating: number; // from 1 to 5
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Testimonial {
  id: string;
  name: string;
  position: string;
  company?: string; // Optional
  content: string;
  rating: number; // Kept for now, can be replaced by progress
  skills: string; // e.g., 'Figma, Design Thinking'
  category: string; // e.g., 'Conception UI/UX'
  level: 'Intermédiaire' | 'Avancé' | 'Expert';
  progress: number; // e.g., 75
  badge?: string; // e.g., 'TOP des participants', optional
  avatar?: string; // Optional
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}
