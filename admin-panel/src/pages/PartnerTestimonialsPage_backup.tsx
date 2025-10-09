import React, { useState, useEffect } from 'react';
import { partnerTestimonialsApiService, PartnerTestimonial } from '../services/partnerTestimonialsApiService';
import PartnerTestimonialFormModal from '../components/partnertestimonials/PartnerTestimonialFormModal';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const PartnerTestimonialsPage: React.FC = () => {
  const [testimonials, setTestimonials] = useState<PartnerTestimonial[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<PartnerTestimonial | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected'>('disconnected');

  // Load testimonials from API
  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading partner testimonials...');
      
      const data = await partnerTestimonialsApiService.getAllTestimonials();
      setTestimonials(data);
      setApiStatus('connected');
      
      console.log('✅ Partner testimonials loaded successfully');
    } catch (error) {
      console.error('❌ Error loading testimonials:', error);
      setApiStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (testimonialData: Omit<PartnerTestimonial, '_id' | 'testimonialId' | 'createdAt' | 'updatedAt'>) => {
    try {
      let result: PartnerTestimonial;
      
      if (selectedTestimonial && selectedTestimonial._id) {
        // Update existing testimonial
        console.log('🔄 Updating testimonial with ID:', selectedTestimonial._id);
        result = await partnerTestimonialsApiService.updateTestimonial(selectedTestimonial._id, testimonialData);
        
        // Update the testimonials list
        setTestimonials(testimonials.map(t => t._id === result._id ? result : t));
        
        console.log('✅ Testimonial updated successfully');
      } else {
        // Create new testimonial
        console.log('🔄 Creating new testimonial');
        result = await partnerTestimonialsApiService.createTestimonial(testimonialData);
        
        // Add to testimonials list
        setTestimonials([...testimonials, result]);
        
        console.log('✅ Testimonial created successfully');
      }
      
      setIsModalOpen(false);
      setSelectedTestimonial(null);
      
      // Show success message
      alert(selectedTestimonial ? 'Témoignage modifié avec succès!' : 'Témoignage ajouté avec succès!');
      
    } catch (error) {
      console.error('❌ Error saving testimonial:', error);
      
      // More detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      alert(`Erreur lors de la sauvegarde du témoignage: ${errorMessage}`);
      
      // Don't close modal on error so user can retry
      console.log('ℹ️ Modal kept open for user to retry');
    }
  };

  const handleDelete = async (id: string, companyName: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le témoignage de ${companyName} ?`)) {
      try {
        await partnerTestimonialsApiService.deleteTestimonial(id);
        setTestimonials(testimonials.filter(t => t._id !== id));
        alert('Témoignage supprimé avec succès!');
      } catch (error) {
        console.error('Error deleting testimonial:', error);
        alert('Erreur lors de la suppression du témoignage');
      }
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      const updated = await partnerTestimonialsApiService.togglePublishStatus(id);
      setTestimonials(testimonials.map(t => t._id === updated._id ? updated : t));
      alert(`Témoignage ${updated.isPublished ? 'publié' : 'dépublié'} avec succès!`);
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Erreur lors du changement de statut');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Chargement des témoignages...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestion des Témoignages Partenaires</h1>
          <div className="flex items-center mt-2">
            <div className={`w-3 h-3 rounded-full mr-2 ${apiStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`text-sm ${apiStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
              API {apiStatus === 'connected' ? 'Connectée' : 'Déconnectée'}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedTestimonial(null);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Ajouter un Témoignage
          </button>
          
          {apiStatus === 'disconnected' && (
            <button
              onClick={() => {
                if (window.confirm('Êtes-vous sûr de vouloir vider le cache local ? Cela supprimera toutes les données non synchronisées.')) {
                  localStorage.removeItem('partner-testimonials');
                  loadTestimonials();
                  alert('Cache local vidé. Rechargement des données...');
                }
              }}
              className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 flex items-center text-sm"
            >
              🗑️ Vider Cache
            </button>
          )}
        </div>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{testimonial.companyName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{testimonial.position}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-500">{'★'.repeat(testimonial.rating)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => testimonial._id && handleTogglePublish(testimonial._id)}
                    className="flex items-center"
                  >
                    {testimonial.isPublished ? (
                      <EyeIcon className="h-6 w-6 text-green-500 hover:text-green-700" />
                    ) : (
                      <EyeSlashIcon className="h-6 w-6 text-red-500 hover:text-red-700" />
                    )}
                  </button>
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
                    onClick={() => testimonial._id && handleDelete(testimonial._id, testimonial.companyName)}
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
