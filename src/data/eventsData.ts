import React from 'react';
import { MapPin, Video, Users, Calendar as CalendarIcon } from 'lucide-react';

export interface Event {
  id: string;
  date: string;
  title: string;
  format: string;
  duration: string;
  icon: React.ComponentType<any>;
  color: 'blue' | 'purple' | 'green' | 'orange';
  type: 'webinaire' | 'formation' | 'team-building' | 'conference';
  description?: string;
  location?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  price?: number;
  isUpcoming: boolean;
  registrationOpen: boolean;
  url?: string; // رابط الحدث للعين
}

// Fonction pour générer des dates futures aléatoirement
const generateFutureDate = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
};

// Données d'événements dynamiques
export const eventsData: Event[] = [
  {
    id: 'evt-001',
    date: generateFutureDate(45), // 45 jours à partir d'aujourd'hui
    title: 'Leadership & Transformation',
    format: 'Présentiel – Hôtel',
    duration: '2 jours',
    icon: MapPin,
    color: 'blue',
    type: 'formation',
    description: 'Formation intensive sur les techniques de leadership moderne',
    location: 'Hôtel Golden Tulip, Tunis',
    maxParticipants: 30,
    currentParticipants: 18,
    price: 850,
    isUpcoming: true,
    registrationOpen: true,
    url: 'https://matc.tn/formations/leadership-transformation'
  },
  {
    id: 'evt-002',
    date: generateFutureDate(25), // 25 jours à partir d'aujourd'hui
    title: 'Digitalisation RH',
    format: 'En ligne – Zoom',
    duration: '3h',
    icon: Video,
    color: 'purple',
    type: 'webinaire',
    description: 'Webinaire sur les outils digitaux pour les RH',
    maxParticipants: 100,
    currentParticipants: 67,
    price: 0, // Gratuit
    isUpcoming: true,
    registrationOpen: true,
    url: 'https://zoom.us/j/123456789'
  },
  {
    id: 'evt-003',
    date: generateFutureDate(60),
    title: 'Team Building Innovation',
    format: 'Présentiel – Outdoor',
    duration: '1 jour',
    icon: Users,
    color: 'green',
    type: 'team-building',
    description: 'Journée de team building axée sur l\'innovation',
    location: 'Centre de loisirs, Hammamet',
    maxParticipants: 50,
    currentParticipants: 32,
    price: 120,
    isUpcoming: true,
    registrationOpen: true,
    url: 'https://matc.tn/events/team-building-innovation'
  },
  {
    id: 'evt-004',
    date: generateFutureDate(90),
    title: 'Conférence Data Science',
    format: 'Hybride – Présentiel + En ligne',
    duration: '4h',
    icon: CalendarIcon,
    color: 'orange',
    type: 'conference',
    description: 'Conférence sur les dernières tendances en Data Science',
    location: 'Centre de conférences UTICA',
    maxParticipants: 200,
    currentParticipants: 145,
    price: 50,
    isUpcoming: true,
    registrationOpen: true,
    url: 'https://matc.tn/conferences/data-science-2024'
  },
  {
    id: 'evt-005',
    date: generateFutureDate(15),
    title: 'Atelier Agilité',
    format: 'En ligne – Teams',
    duration: '2h',
    icon: Video,
    color: 'blue',
    type: 'formation',
    description: 'Atelier pratique sur les méthodes agiles',
    maxParticipants: 40,
    currentParticipants: 28,
    price: 75,
    isUpcoming: true,
    registrationOpen: true,
    url: 'https://teams.microsoft.com/l/meetup-join/agilite-workshop'
  },
  {
    id: 'evt-006',
    date: generateFutureDate(120), // 4 mois à partir d'aujourd'hui
    title: 'Voyage Team Building & Découverte',
    format: 'Voyage – Djerba',
    duration: '3 jours',
    icon: Users,
    color: 'green',
    type: 'team-building',
    description: 'Voyage de team building avec activités de découverte et cohésion d\'équipe',
    location: 'Île de Djerba, Tunisie',
    maxParticipants: 25,
    currentParticipants: 12,
    price: 450,
    isUpcoming: true,
    registrationOpen: true,
    url: 'https://matc.tn/voyages/djerba-team-building'
  }
];

// Fonctions utilitaires
export const getUpcomingEvents = (): Event[] => {
  return eventsData
    .filter(event => event.isUpcoming)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const getEventsByType = (type: Event['type']): Event[] => {
  return eventsData.filter(event => event.type === type);
};

export const getFreeEvents = (): Event[] => {
  return eventsData.filter(event => event.price === 0);
};

export const getEventById = (id: string): Event | undefined => {
  return eventsData.find(event => event.id === id);
};

// Fonction pour simuler la mise à jour des participants
export const updateEventParticipants = (eventId: string): Event[] => {
  return eventsData.map(event => {
    if (event.id === eventId && event.currentParticipants && event.maxParticipants) {
      // Augmentation aléatoire de 1-3 participants
      const increase = Math.floor(Math.random() * 3) + 1;
      const newCount = Math.min(
        event.currentParticipants + increase,
        event.maxParticipants
      );
      
      return {
        ...event,
        currentParticipants: newCount,
        registrationOpen: newCount < event.maxParticipants
      };
    }
    return event;
  });
};

export default eventsData;
