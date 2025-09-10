import React, { useState } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { Event, EventCategory } from '../types';
import EventFormModal from '../components/events/EventFormModal';

const EventsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

  const handleOpenModal = (event: Event | null) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(false);
  };

    const handleSaveEvent = (eventData: Event) => {
    if (selectedEvent) {
      // Update existing event
      setEvents(events.map(e => 
        e._id === selectedEvent._id 
        ? { ...eventData, _id: e._id, updatedAt: new Date() } 
        : e
      ));
    } else {
      // Create new event
      const newEvent: Event = {
        ...eventData,
        _id: new Date().toISOString(), // Use a simple unique ID for now
        createdAt: new Date(),
        updatedAt: new Date(),
        places: {
          total: eventData.places?.total || 0,
          registered: 0, // New events start with 0 registered
        },
      };
      setEvents([newEvent, ...events]);
    }
    handleCloseModal();
  };

  // Mock data for events - Replace with API calls
  const [events, setEvents] = useState<Event[]>([
    {
      _id: 'evt1',
      title: 'Webinaire sur la Transformation Digitale',
      category: 'webinaire',
      date: new Date('2024-09-15T18:00:00'),
      format: { type: 'En ligne', details: 'Zoom' },
      duration: '1h 30m',
      price: 0,
      places: { registered: 78, total: 100 },
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'evt2',
      title: 'Formation Complète React & TypeScript',
      category: 'formation',
      date: new Date('2024-10-01T09:00:00'),
      format: { type: 'Présentiel', details: 'Co-working Space, Tunis' },
      duration: '5 jours',
      price: 1200,
      places: { registered: 12, total: 20 },
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'evt3',
      title: 'Team Building Aventure en Plein Air',
      category: 'team-building',
      date: new Date('2024-09-28T10:00:00'),
      format: { type: 'Hybride', details: 'Parc & Virtuel' },
      duration: '1 jour',
      places: { registered: 35, total: 40 },
      isPublished: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'evt4',
      title: 'Conférence Annuelle sur l\'IA',
      category: 'conference',
      date: new Date('2024-11-05T09:00:00'),
      format: { type: 'Présentiel', details: 'Palais des Congrès' },
      duration: '2 jours',
      price: 250,
      places: { registered: 150, total: 200 },
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadge = (category: EventCategory) => {
    switch (category) {
      case 'formation': return 'bg-blue-100 text-blue-800';
      case 'webinaire': return 'bg-purple-100 text-purple-800';
      case 'conference': return 'bg-green-100 text-green-800';
      case 'team-building': return 'bg-yellow-100 text-yellow-800';
      case 'voyage': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (isPublished: boolean) => {
    return isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Événements</h1>
          <p className="mt-2 text-gray-600">Créez et gérez vos événements, webinaires, et formations.</p>
        </div>
                <button onClick={() => handleOpenModal(null)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          Nouvel Événement
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un événement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Toutes les catégories</option>
              <option value="formation">Formation</option>
              <option value="webinaire">Webinaire</option>
              <option value="conference">Conférence</option>
              <option value="team-building">Team Building</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Événement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Places</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.map((event) => (
                <tr key={event._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                        <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${getCategoryBadge(event.category)}`}>{event.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(event.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{`${event.places.registered} / ${event.places.total}`}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(event.isPublished)}`}>
                      {event.isPublished ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-4">
                      <button className="text-gray-400 hover:text-primary-600"><EyeIcon className="h-5 w-5" /></button>
                      <button onClick={() => handleOpenModal(event)} className="text-gray-400 hover:text-primary-600"><PencilIcon className="h-5 w-5" /></button>
                      <button className="text-gray-400 hover:text-red-600"><TrashIcon className="h-5 w-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EventFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEvent}
        event={selectedEvent}
      />
    </div>
  );
};

export default EventsPage;
