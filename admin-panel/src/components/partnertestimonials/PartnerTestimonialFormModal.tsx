import React, { useState, useEffect } from 'react';
import { PartnerTestimonial } from '../../services/partnerTestimonialsApiService';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

interface PartnerTestimonialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (testimonialData: Omit<PartnerTestimonial, '_id' | 'testimonialId' | 'createdAt' | 'updatedAt'>) => void;
  testimonial: PartnerTestimonial | null;
}

// Reusable StarRating component
const StarRatingInput: React.FC<{ rating: number; onRatingChange: (rating: number) => void }> = ({ rating, onRatingChange }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`h-8 w-8 cursor-pointer transition-colors duration-200 ${star <= rating ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-gray-400'}`}
          onClick={() => onRatingChange(star)}
        />
      ))}
    </div>
  );
};

const PartnerTestimonialFormModal: React.FC<PartnerTestimonialFormModalProps> = ({ isOpen, onClose, onSave, testimonial }) => {
  const [formData, setFormData] = useState<Partial<PartnerTestimonial>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (testimonial) {
      setFormData({
        companyName: testimonial.companyName,
        position: testimonial.position,
        authorName: testimonial.authorName,
        testimonialText: testimonial.testimonialText,
        rating: testimonial.rating,
        initials: testimonial.initials,
        isPublished: testimonial.isPublished,
        displayOrder: testimonial.displayOrder,
        metadata: testimonial.metadata
      });
    } else {
      // Default values for a new testimonial
      setFormData({
        companyName: '',
        position: '',
        authorName: '',
        testimonialText: '',
        rating: 5,
        initials: '',
        isPublished: false,
        displayOrder: 0
      });
    }
  }, [testimonial, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.testimonialText) {
      setError('Les champs Nom de l\'entreprise et Témoignage sont obligatoires.');
      return;
    }

    // Generate initials if not provided
    let initials = formData.initials;
    if (!initials && formData.companyName) {
      const words = formData.companyName.split(' ');
      initials = words.map(word => word.charAt(0)).join('').substring(0, 3).toUpperCase();
    }

    const testimonialData: Omit<PartnerTestimonial, '_id' | 'testimonialId' | 'createdAt' | 'updatedAt'> = {
      companyName: formData.companyName!,
      position: formData.position || '',
      authorName: formData.authorName,
      testimonialText: formData.testimonialText!,
      rating: formData.rating || 5,
      initials: initials || '',
      isPublished: formData.isPublished || false,
      displayOrder: formData.displayOrder || 0,
      metadata: formData.metadata
    };

    onSave(testimonialData);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
        <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white z-10 rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-800">{testimonial ? 'Modifier le Témoignage' : 'Nouveau Témoignage Partenaire'}</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <p className="text-sm text-red-700 font-semibold">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise</label>
              <input type="text" name="companyName" id="companyName" value={formData.companyName || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Nova Market" required />
            </div>
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
              <input type="text" name="position" id="position" value={formData.position || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Directrice Marketing" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-1">Nom de l'auteur (optionnel)</label>
              <input type="text" name="authorName" id="authorName" value={formData.authorName || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Sarah Mansouri" />
            </div>
            <div>
              <label htmlFor="initials" className="block text-sm font-medium text-gray-700 mb-1">Initiales (auto-générées)</label>
              <input type="text" name="initials" id="initials" value={formData.initials || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: NM" maxLength={3} />
            </div>
          </div>

          <div>
            <label htmlFor="testimonialText" className="block text-sm font-medium text-gray-700 mb-1">Contenu du témoignage</label>
            <textarea name="testimonialText" id="testimonialText" value={formData.testimonialText || ''} onChange={handleChange} rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Décrivez l'expérience du partenaire..." required></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
              <StarRatingInput rating={formData.rating || 5} onRatingChange={(r) => setFormData(p => ({...p, rating: r}))} />
            </div>
            <div className="flex items-center justify-end h-full">
              <label htmlFor="isPublished" className="flex items-center cursor-pointer">
                <input type="checkbox" name="isPublished" id="isPublished" checked={formData.isPublished || false} onChange={handleChange} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-3 text-sm font-medium text-gray-700">Publier le témoignage</span>
              </label>
            </div>
          </div>
        </form>

        <div className="flex justify-end items-center p-5 border-t sticky bottom-0 bg-gray-50 z-10 rounded-b-xl space-x-4">
          <button type="button" onClick={onClose} className="px-6 py-2.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all">
            Annuler
          </button>
          <button type="submit" onClick={handleSubmit} className="px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all">
            {testimonial ? 'Enregistrer les modifications' : 'Créer le témoignage'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerTestimonialFormModal;
