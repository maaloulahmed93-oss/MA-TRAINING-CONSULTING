import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

interface Participant {
  id: string;
  role: string;
  situation: string;
  documentLink: string;
}

const API_BASE = process.env.REACT_APP_API_URL || 'https://matc-backend.onrender.com/api';

const ParticipantsManagementPage: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    role: '',
    situation: '',
    documentLink: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load participants from API on mount
  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/participants-simple`);
      const result = await response.json();
      if (result.success) {
        setParticipants(result.data);
      } else {
        setError('Erreur lors du chargement des participants');
      }
    } catch (error) {
      console.error('Error loading participants:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ id: '', role: '', situation: '', documentLink: '' });
    setEditingParticipant(null);
    setIsFormOpen(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.id || !formData.role || !formData.situation) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      const url = editingParticipant 
        ? `${API_BASE}/participants-simple/${editingParticipant.id}`
        : `${API_BASE}/participants-simple`;
      
      const method = editingParticipant ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        await fetchParticipants(); // Reload list
        resetForm();
      } else {
        setError(result.message || 'Erreur lors de l\'opération');
      }
    } catch (error) {
      console.error('Error saving participant:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (participant: Participant) => {
    setEditingParticipant(participant);
    setFormData({
      id: participant.id,
      role: participant.role,
      situation: participant.situation,
      documentLink: participant.documentLink
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce participant ?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/participants-simple/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        await fetchParticipants(); // Reload list
      } else {
        setError(result.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting participant:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const openDocumentLink = (link: string) => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    } else {
      alert('Aucun lien de document configuré pour ce participant');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gestion des Participants</h1>
          <p className="text-gray-600">Gérez les participants, leurs rôles, situations et documents</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Ajouter un participant
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={resetForm}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID *
                    </label>
                    <input
                      type="text"
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 001"
                      disabled={!!editingParticipant || loading}
                      required
                    />
                    {editingParticipant && (
                      <p className="text-xs text-gray-500 mt-1">L'ID ne peut pas être modifié</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rôle *
                    </label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Assistant Marketing"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Situation *
                    </label>
                    <input
                      type="text"
                      value={formData.situation}
                      onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Situation professionnelle 1"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accès au document (URL)
                    </label>
                    <input
                      type="url"
                      value={formData.documentLink}
                      onChange={(e) => setFormData({ ...formData, documentLink: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/document.pdf"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {loading ? 'Chargement...' : (editingParticipant ? 'Mettre à jour' : 'Ajouter')}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={resetForm}
                    disabled={loading}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Participants List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-2">Chargement des participants...</p>
          </div>
        ) : participants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun participant trouvé</p>
            <p className="text-gray-400 text-sm mt-2">Ajoutez votre premier participant pour commencer</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {participants.map((participant) => (
              <li key={participant.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">ID: {participant.id}</p>
                        <p className="text-sm text-gray-500">Rôle: {participant.role}</p>
                        <p className="text-sm text-gray-500">Situation: {participant.situation}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openDocumentLink(participant.documentLink)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      title="Accéder au document"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Document
                    </button>
                    <button
                      onClick={() => handleEdit(participant)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      title="Modifier"
                      disabled={loading}
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(participant.id)}
                      className="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      title="Supprimer"
                      disabled={loading}
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ParticipantsManagementPage;
