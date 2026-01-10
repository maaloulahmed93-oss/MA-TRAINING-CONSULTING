import React, { useEffect, useMemo, useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ETrainingTestimonialFormModal from '../components/etrainingtestimonials/ETrainingTestimonialFormModal';
import { eTrainingTestimonialsApiService, ETrainingTestimonial } from '../services/eTrainingTestimonialsApiService';

const ETrainingTestimonialsPage: React.FC = () => {
  const [testimonials, setTestimonials] = useState<ETrainingTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<ETrainingTestimonial | null>(null);

  useEffect(() => {
    loadTestimonials();
    checkApiStatus();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadTestimonials();
    }
  }, [filterStatus, searchTerm]);

  const checkApiStatus = async () => {
    try {
      const ok = await eTrainingTestimonialsApiService.checkApiHealth();
      setApiConnected(ok);
    } catch {
      setApiConnected(false);
    }
  };

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await eTrainingTestimonialsApiService.getAllTestimonials({
        status: filterStatus,
        search: searchTerm,
      });

      setTestimonials(data);
    } catch (e) {
      console.error(e);
      setError('Erreur lors du chargement des témoignages');
    } finally {
      setLoading(false);
    }
  };

  const filteredTestimonials = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return testimonials
      .filter((t) => {
        if (!term) return true;
        return (
          (t.author || '').toLowerCase().includes(term) ||
          (t.initials || '').toLowerCase().includes(term) ||
          (t.role || '').toLowerCase().includes(term) ||
          (t.domain || '').toLowerCase().includes(term) ||
          (t.quote || '').toLowerCase().includes(term)
        );
      })
      .filter((t) => {
        if (filterStatus === 'all') return true;
        if (filterStatus === 'published') return t.isPublished;
        if (filterStatus === 'unpublished') return !t.isPublished;
        return true;
      });
  }, [testimonials, searchTerm, filterStatus]);

  const openModal = (t: ETrainingTestimonial | null) => {
    setSelectedTestimonial(t);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTestimonial(null);
    setIsModalOpen(false);
  };

  const handleSave = async (data: Omit<ETrainingTestimonial, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);

      if (selectedTestimonial && selectedTestimonial._id) {
        const updated = await eTrainingTestimonialsApiService.updateTestimonial(selectedTestimonial._id, data);
        setTestimonials((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
      } else {
        const created = await eTrainingTestimonialsApiService.createTestimonial(data);
        setTestimonials((prev) => [created, ...prev]);
      }

      closeModal();
      alert('✅ Témoignage sauvegardé avec succès!');
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : 'Erreur inconnue';
      alert(`❌ Erreur lors de la sauvegarde: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce témoignage ?')) return;

    try {
      setLoading(true);
      await eTrainingTestimonialsApiService.deleteTestimonial(id);
      setTestimonials((prev) => prev.filter((t) => t._id !== id));
      alert('✅ Témoignage supprimé avec succès!');
    } catch (e) {
      console.error(e);
      alert('❌ Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      setLoading(true);
      const updated = await eTrainingTestimonialsApiService.togglePublishStatus(id);
      setTestimonials((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      alert(`✅ Témoignage ${updated.isPublished ? 'publié' : 'dépublié'} avec succès!`);
    } catch (e) {
      console.error(e);
      alert('❌ Erreur lors du changement de statut');
    } finally {
      setLoading(false);
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
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Témoignages E-Training</h1>
          <p className="text-gray-500 mt-1">Gérez les témoignages affichés dans la section E-Training du site.</p>
          <div className="flex items-center mt-2">
            <div className={`w-3 h-3 rounded-full mr-2 ${apiConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`text-sm ${apiConnected ? 'text-green-600' : 'text-red-600'}`}>
              API {apiConnected ? 'Connectée' : 'Déconnectée'}
            </span>
          </div>
          {error && (
            <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">{error}</div>
          )}
        </div>

        <button onClick={() => openModal(null)} className="btn-primary inline-flex items-center">
          <PlusIcon className="h-4 w-4 mr-2" />
          Nouveau Témoignage
        </button>
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm flex items-center space-x-4">
        <div className="relative flex-grow">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par auteur, domaine, contenu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>

        <div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="form-select">
            <option value="all">Tous les statuts</option>
            <option value="published">Publiés</option>
            <option value="unpublished">Non publiés</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auteur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fonction</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domaine</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publié</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTestimonials.map((t) => (
              <tr key={t._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.author}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.role || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.domain || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.displayOrder ?? 0}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button onClick={() => t._id && handleTogglePublish(t._id)} className="flex items-center">
                    {t.isPublished ? (
                      <EyeIcon className="h-6 w-6 text-green-500 hover:text-green-700" />
                    ) : (
                      <EyeSlashIcon className="h-6 w-6 text-red-500 hover:text-red-700" />
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => openModal(t)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => t._id && handleDelete(t._id)} className="text-red-600 hover:text-red-900">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTestimonials.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm mt-6">
          <p className="text-sm text-gray-500">Aucun témoignage trouvé.</p>
        </div>
      )}

      <ETrainingTestimonialFormModal isOpen={isModalOpen} onClose={closeModal} onSave={handleSave} testimonial={selectedTestimonial} />
    </div>
  );
};

export default ETrainingTestimonialsPage;
