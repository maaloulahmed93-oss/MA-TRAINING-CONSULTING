import React, { useState, useEffect } from 'react';
import { formateurProgrammeService, FormateurProgramme } from '../../services/formateurProgrammeService';

interface ProgrammeManagerProps {
  formateurId: string;
}

const ProgrammeManager: React.FC<ProgrammeManagerProps> = ({ formateurId }) => {
  const [programmes, setProgrammes] = useState<FormateurProgramme[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProgramme, setEditingProgramme] = useState<FormateurProgramme | null>(null);
  const [filters, setFilters] = useState({
    statut: 'all'
  });

  // État du formulaire
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    prix: 0,
    maxParticipants: 20,
    lieu: 'En ligne',
    notes: ''
  });

  useEffect(() => {
    loadProgrammes();
  }, [formateurId, filters]);

  const loadProgrammes = async () => {
    try {
      setLoading(true);
      const response = await formateurProgrammeService.getProgrammes(formateurId, {
        statut: filters.statut === 'all' ? undefined : filters.statut
      });
      setProgrammes(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des programmes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingProgramme) {
        // Mise à jour
        await formateurProgrammeService.updateProgramme(editingProgramme._id, formData);
      } else {
        // Création
        await formateurProgrammeService.createProgramme({
          formateurId,
          ...formData
        });
      }
      
      resetForm();
      loadProgrammes();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du programme');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (programme: FormateurProgramme) => {
    setEditingProgramme(programme);
    setFormData({
      titre: programme.titre,
      description: programme.description || '',
      dateDebut: programme.dateDebut.split('T')[0],
      dateFin: programme.dateFin.split('T')[0],
      prix: programme.prix,
      maxParticipants: programme.maxParticipants,
      lieu: programme.lieu,
      notes: programme.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (programmeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce programme ?')) return;
    
    try {
      setLoading(true);
      await formateurProgrammeService.deleteProgramme(programmeId);
      loadProgrammes();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du programme');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      titre: '',
      description: '',
      dateDebut: '',
      dateFin: '',
      prix: 0,
      maxParticipants: 20,
      lieu: 'En ligne',
      notes: ''
    });
    setEditingProgramme(null);
    setShowForm(false);
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'planifie': return 'bg-blue-100 text-blue-800';
      case 'en_cours': return 'bg-green-100 text-green-800';
      case 'termine': return 'bg-gray-100 text-gray-800';
      case 'annule': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutText = (statut: string) => {
    switch (statut) {
      case 'planifie': return 'Planifié';
      case 'en_cours': return 'En cours';
      case 'termine': return 'Terminé';
      case 'annule': return 'Annulé';
      default: return statut;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Mes Programmes</h2>
            <p className="text-sm text-gray-600 mt-1">
              Gérez vos programmes de formation
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Nouveau Programme
          </button>
        </div>

        {/* Filtres */}
        <div className="mt-4 flex gap-4">
          <select
            value={filters.statut}
            onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="planifie">Planifiés</option>
            <option value="en_cours">En cours</option>
            <option value="termine">Terminés</option>
            <option value="annule">Annulés</option>
          </select>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du Programme *
                </label>
                <input
                  type="text"
                  required
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Marketing Digital Avancé"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu
                </label>
                <input
                  type="text"
                  value={formData.lieu}
                  onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="En ligne, Salle de formation..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de Début *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateDebut}
                  onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de Fin *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateFin}
                  onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix (€)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.prix}
                  onChange={(e) => setFormData({ ...formData, prix: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Max de Participants
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 20 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Description détaillée du programme..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Notes internes..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Sauvegarde...' : editingProgramme ? 'Mettre à jour' : 'Créer le Programme'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des programmes */}
      <div className="p-6">
        {loading && !showForm ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Chargement des programmes...</p>
          </div>
        ) : programmes.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun programme</h3>
            <p className="text-gray-600 mb-4">Commencez par créer votre premier programme de formation.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer un Programme
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programmes.map((programme) => (
              <div key={programme._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg">{programme.titre}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatutColor(programme.statut)}`}>
                    {getStatutText(programme.statut)}
                  </span>
                </div>

                {programme.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{programme.description}</p>
                )}

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2">📅</span>
                    {new Date(programme.dateDebut).toLocaleDateString()} → {new Date(programme.dateFin).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2">⏱️</span>
                    {programme.duree.jours} jour(s)
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2">💰</span>
                    {programme.prix}€
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2">👥</span>
                    Max {programme.maxParticipants} participants
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2">📍</span>
                    {programme.lieu}
                  </div>
                </div>

                {programme.statistiques && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-blue-600">{programme.statistiques.totalSeances}</div>
                        <div className="text-xs text-gray-600">Séances</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">{programme.statistiques.totalParticipants}</div>
                        <div className="text-xs text-gray-600">Participants</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(programme)}
                    className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(programme._id)}
                    className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgrammeManager;
