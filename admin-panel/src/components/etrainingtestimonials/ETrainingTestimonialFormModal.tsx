import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { ETrainingTestimonial } from '../../services/eTrainingTestimonialsApiService';

interface ETrainingTestimonialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<ETrainingTestimonial, '_id' | 'createdAt' | 'updatedAt'>) => void;
  testimonial: ETrainingTestimonial | null;
}

const ETrainingTestimonialFormModal: React.FC<ETrainingTestimonialFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  testimonial,
}) => {
  const [formData, setFormData] = useState<Partial<ETrainingTestimonial>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (testimonial) {
      setFormData({
        quote: testimonial.quote,
        author: testimonial.author,
        initials: testimonial.initials,
        role: testimonial.role || '',
        domain: testimonial.domain || '',
        isPublished: testimonial.isPublished,
        displayOrder: testimonial.displayOrder || 0,
      });
    } else {
      setFormData({
        quote: '',
        author: '',
        initials: '',
        role: '',
        domain: '',
        isPublished: false,
        displayOrder: 0,
      });
    }
  }, [testimonial, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.quote || !formData.author) {
      setError('Les champs Auteur et Témoignage sont obligatoires.');
      return;
    }

    let initials = formData.initials;
    if (!initials && formData.author) {
      const parts = String(formData.author)
        .split(' ')
        .filter(Boolean);
      initials = parts
        .map((p) => p[0])
        .join('')
        .substring(0, 3)
        .toUpperCase();
    }

    const payload: Omit<ETrainingTestimonial, '_id' | 'createdAt' | 'updatedAt'> = {
      quote: formData.quote!,
      author: formData.author!,
      initials: initials || '',
      role: formData.role || '',
      domain: formData.domain || '',
      isPublished: Boolean(formData.isPublished),
      displayOrder: Number.isFinite(Number(formData.displayOrder)) ? Number(formData.displayOrder) : 0,
    };

    onSave(payload);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white z-10 rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-800">
            {testimonial ? 'Modifier le Témoignage' : 'Nouveau Témoignage E-Training'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-sm text-red-700 font-semibold">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">Auteur</label>
              <input
                type="text"
                name="author"
                id="author"
                value={formData.author || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Amine K."
                required
              />
            </div>
            <div>
              <label htmlFor="initials" className="block text-sm font-medium text-gray-700 mb-1">Initiales (auto-générées)</label>
              <input
                type="text"
                name="initials"
                id="initials"
                value={formData.initials || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: AK"
                maxLength={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Fonction</label>
              <input
                type="text"
                name="role"
                id="role"
                value={formData.role || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Marketing & Communication"
              />
            </div>
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">Domaine</label>
              <input
                type="text"
                name="domain"
                id="domain"
                value={formData.domain || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Digital / Positionnement professionnel"
              />
            </div>
          </div>

          <div>
            <label htmlFor="quote" className="block text-sm font-medium text-gray-700 mb-1">Témoignage</label>
            <textarea
              name="quote"
              id="quote"
              value={formData.quote || ''}
              onChange={handleChange}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Texte du témoignage..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700 mb-1">Ordre d'affichage</label>
              <input
                type="number"
                name="displayOrder"
                id="displayOrder"
                value={String(formData.displayOrder ?? 0)}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={0}
              />
            </div>

            <div className="flex items-center justify-end h-full">
              <label htmlFor="isPublished" className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isPublished"
                  id="isPublished"
                  checked={Boolean(formData.isPublished)}
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">Publier</span>
              </label>
            </div>
          </div>
        </form>

        <div className="flex justify-end items-center p-5 border-t sticky bottom-0 bg-gray-50 z-10 rounded-b-xl space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {testimonial ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ETrainingTestimonialFormModal;
