import React, { useState, useEffect } from 'react';
import { PartnerTestimonial } from '../types';
import PartnerTestimonialFormModal from '../components/partnertestimonials/PartnerTestimonialFormModal';
import { PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const PartnerTestimonialsPage: React.FC = () => {
  const [testimonials, setTestimonials] = useState<PartnerTestimonial[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<PartnerTestimonial | null>(null);

  // Mock data - replace with API call
  useEffect(() => {
    const mockData: PartnerTestimonial[] = [
      {
        _id: '1',
        name: 'Nova Market',
        position: 'Directrice Marketing',
        content: 'Des solutions concrètes et efficaces pour nos projets.',
        rating: 5,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: '2',
        name: 'SmartConsult',
        position: 'Consultante Senior',
        content: 'Une équipe à l\'écoute et réactive à chaque étape.',
        rating: 5,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    setTestimonials(mockData);
  }, []);

  const handleSave = (testimonial: PartnerTestimonial) => {
    if (selectedTestimonial) {
      setTestimonials(testimonials.map(t => t._id === testimonial._id ? testimonial : t));
    } else {
      setTestimonials([...testimonials, { ...testimonial, _id: `${Date.now()}` }]);
    }
    setIsModalOpen(false);
    setSelectedTestimonial(null);
  };

  const handleDelete = (id: string) => {
    // Implement confirmation modal before deleting
    setTestimonials(testimonials.filter(t => t._id !== id));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Témoignages Partenaires</h1>
        <button
          onClick={() => {
            setSelectedTestimonial(null);
            setIsModalOpen(true);
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Ajouter un Témoignage
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poste</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Évaluation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publié</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {testimonials.map(testimonial => (
              <tr key={testimonial._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{testimonial.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{testimonial.position}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-500">{'★'.repeat(testimonial.rating)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {testimonial.isPublished ? (
                    <CheckCircleIcon className="h-6 w-6 text-green-500" />
                  ) : (
                    <XCircleIcon className="h-6 w-6 text-red-500" />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => {
                      setSelectedTestimonial(testimonial);
                      setIsModalOpen(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(testimonial._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PartnerTestimonialFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        testimonial={selectedTestimonial}
      />
    </div>
  );
};

export default PartnerTestimonialsPage;
