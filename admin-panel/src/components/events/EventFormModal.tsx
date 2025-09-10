import React, { useState, useEffect } from 'react';
import { X, Link } from 'lucide-react';
import { Event, EventCategory } from '../../types';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Event) => void;
  event: Event | null;
}

const EventFormModal: React.FC<EventFormModalProps> = ({ isOpen, onClose, onSave, event }) => {
  const [formData, setFormData] = useState<Partial<Event>>({});

  useEffect(() => {
    if (event) {
      setFormData(event);
    } else {
      setFormData({
        title: '',
        category: 'formation',
        date: new Date(),
        format: { type: 'Présentiel', details: '' },
        duration: '',
        price: 0,
        places: { registered: 0, total: 10 },
        isPublished: false,
        description: '',
        url: '',
      });
    }
  }, [event, isOpen]);

  if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add more robust validation
    if (!formData.title) {
      alert('Le titre est requis.');
      return;
    }
    onSave(formData as Event);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6">{event ? 'Modifier l\'événement' : 'Nouvel Événement'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Titre</label>
            <input
              type="text"
              id="title"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Catégorie</label>
            <select
              id="category"
              value={formData.category || 'formation'}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            >
              <option value="formation">Formation</option>
              <option value="webinaire">Webinaire</option>
              <option value="conference">Conférence</option>
              <option value="team-building">Team Building</option>
              <option value="voyage">Voyage</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              id="date"
              value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
              onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>

                    {/* Format & Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="formatType" className="block text-sm font-medium text-gray-700">Format</label>
              <select
                id="formatType"
                value={formData.format?.type || 'Présentiel'}
                onChange={(e) => setFormData({ ...formData, format: { ...formData.format!, type: e.target.value as Event['format']['type'] } })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              >
                <option>Présentiel</option>
                <option>En ligne</option>
                <option>Hybride</option>
                <option>Voyage</option>
              </select>
            </div>
            <div>
              <label htmlFor="formatDetails" className="block text-sm font-medium text-gray-700">Détails (Lieu, Lien...)</label>
              <input
                type="text"
                id="formatDetails"
                value={formData.format?.details || ''}
                onChange={(e) => setFormData({ ...formData, format: { ...formData.format!, details: e.target.value } })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>

          {/* Duration & Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Durée</label>
              <input
                type="text"
                id="duration"
                placeholder="Ex: 2 jours, 3h"
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">Prix (TND)</label>
              <input
                type="number"
                id="price"
                value={formData.price || 0}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>

          {/* Places */}
          <div>
            <label htmlFor="totalPlaces" className="block text-sm font-medium text-gray-700">Nombre total de places</label>
            <input
              type="number"
              id="totalPlaces"
              value={formData.places?.total || 10}
              onChange={(e) => setFormData({ ...formData, places: { ...formData.places!, total: Number(e.target.value) } })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              rows={4}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>

          {/* URL */}
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">Lien de l'événement (URL)</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Link className="text-gray-400" size={16} />
              </div>
              <input
                type="url"
                id="url"
                value={formData.url || ''}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm pl-10"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Published Status */}
          <div className="flex items-center">
            <label htmlFor="isPublished" className="text-sm font-medium text-gray-700 mr-4">Statut</label>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}
              className={`${formData.isPublished ? 'bg-primary-600' : 'bg-gray-200'} relative inline-flex items-center h-6 rounded-full w-11`}
            >
              <span className={`${formData.isPublished ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}/>
            </button>
            <span className="ml-3 text-sm text-gray-600">{formData.isPublished ? 'Publié' : 'Brouillon'}</span>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormModal;
