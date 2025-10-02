import React, { useState, useEffect } from 'react';
import { formateurProgrammeService, FormateurSeance, FormateurProgramme } from '../../services/formateurProgrammeService';

interface SeanceManagerProps {
  formateurId: string;
}

const SeanceManager: React.FC<SeanceManagerProps> = ({ formateurId }) => {
  const [seances, setSeances] = useState<FormateurSeance[]>([]);
  const [programmes, setProgrammes] = useState<FormateurProgramme[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSeance, setEditingSeance] = useState<FormateurSeance | null>(null);
  const [filters, setFilters] = useState({
    programmeId: '',
    statut: 'all',
    date: ''
  });

  // État du formulaire
  const [formData, setFormData] = useState({
    programmeId: '',
    numero: '',
    module: '',
    titre: '',
    description: '',
    date: '',
    heureDebut: '09:00',
    heureFin: '12:00',
    lieu: 'En ligne',
    lienVisio: '',
    notes: ''
  });

  useEffect(() => {
    loadProgrammes();
    loadSeances();
  }, [formateurId, filters]);

  const loadProgrammes = async () => {
    try {
      const response = await formateurProgrammeService.getProgrammes(formateurId);
      setProgrammes(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des programmes:', error);
    }
  };

  const loadSeances = async () => {
    try {
      setLoading(true);
      const response = await formateurProgrammeService.getSeances(formateurId, {
        programmeId: filters.programmeId || undefined,
        statut: filters.statut === 'all' ? undefined : filters.statut,
        date: filters.date || undefined
      });
      setSeances(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des séances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingSeance) {
        // Mise à jour
        await formateurProgrammeService.updateSeance(editingSeance._id, formData);
      } else {
        // Création
        await formateurProgrammeService.createSeance({
          formateurId,
          ...formData
        });
      }
      
      resetForm();
      loadSeances();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la séance');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (seance: FormateurSeance) => {
    setEditingSeance(seance);
    setFormData({
      programmeId: seance.programmeId,
      numero: seance.numero,
      module: seance.module,
      titre: seance.titre || '',
      description: seance.description || '',
      date: seance.date.split('T')[0],
      heureDebut: seance.heureDebut,
      heureFin: seance.heureFin,
      lieu: seance.lieu,
      lienVisio: seance.lienVisio || '',
      notes: seance.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (seanceId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) return;
    
    try {
      setLoading(true);
      await formateurProgrammeService.deleteSeance(seanceId);
      loadSeances();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la séance');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      programmeId: '',
      numero: '',
      module: '',
      titre: '',
      description: '',
      date: '',
      heureDebut: '09:00',
      heureFin: '12:00',
      lieu: 'En ligne',
      lienVisio: '',
      notes: ''
    });
    setEditingSeance(null);
    setShowForm(false);
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'planifiee': return 'bg-blue-100 text-blue-800';
      case 'en_cours': return 'bg-yellow-100 text-yellow-800';
      case 'terminee': return 'bg-green-100 text-green-800';
      case 'annulee': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutText = (statut: string) => {
    switch (statut) {
      case 'planifiee': return 'Planifiée';
      case 'en_cours': return 'En cours';
      case 'terminee': return 'Terminée';
      case 'annulee': return 'Annulée';
      default: return statut;
    }
  };

  const generateNextNumero = () => {
    if (!formData.programmeId) return '';
    
    const seancesDuProgramme = seances.filter(s => s.programmeId === formData.programmeId);
    const maxNum = seancesDuProgramme.length > 0 
      ? Math.max(...seancesDuProgramme.map(s => parseInt(s.numero.replace('S', '')) || 0))
      : 0;
    
    return `S${maxNum + 1}`;
  };

  useEffect(() => {
    if (formData.programmeId && !editingSeance) {
      setFormData(prev => ({ ...prev, numero: generateNextNumero() }));
    }
  }, [formData.programmeId, seances]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Mes Séances</h2>
            <p className="text-sm text-gray-600 mt-1">
              Gérez les séances de vos programmes
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Nouvelle Séance
          </button>
        </div>

        {/* Filtres */}
        <div className="mt-4 flex flex-wrap gap-4">
          <select
            value={filters.programmeId}
            onChange={(e) => setFilters({ ...filters, programmeId: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tous les programmes</option>
            {programmes.map(prog => (
              <option key={prog._id} value={prog._id}>{prog.titre}</option>
            ))}
          </select>

          <select
            value={filters.statut}
            onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="planifiee">Planifiées</option>
            <option value="en_cours">En cours</option>
            <option value="terminee">Terminées</option>
            <option value="annulee">Annulées</option>
          </select>

          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Programme *
                </label>
                <select
                  required
                  value={formData.programmeId}
                  onChange={(e) => setFormData({ ...formData, programmeId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner un programme</option>
                  {programmes.map(prog => (
                    <option key={prog._id} value={prog._id}>{prog.titre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de Séance *
                </label>
                <input
                  type="text"
                  required
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="S1, S2, S3..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Module *
                </label>
                <input
                  type="text"
                  required
                  value={formData.module}
                  onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="SEO, Branding, Analytics..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de la Séance
                </label>
                <input
                  type="text"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Introduction au SEO..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  placeholder="En ligne, Salle A..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de Début *
                </label>
                <input
                  type="time"
                  required
                  value={formData.heureDebut}
                  onChange={(e) => setFormData({ ...formData, heureDebut: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de Fin *
                </label>
                <input
                  type="time"
                  required
                  value={formData.heureFin}
                  onChange={(e) => setFormData({ ...formData, heureFin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lien Visioconférence
              </label>
              <input
                type="url"
                value={formData.lienVisio}
                onChange={(e) => setFormData({ ...formData, lienVisio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://zoom.us/j/..."
              />
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
                placeholder="Contenu de la séance..."
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
                {loading ? 'Sauvegarde...' : editingSeance ? 'Mettre à jour' : 'Créer la Séance'}
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

      {/* Liste des séances */}
      <div className="p-6">
        {loading && !showForm ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Chargement des séances...</p>
          </div>
        ) : seances.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">🎓</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune séance</h3>
            <p className="text-gray-600 mb-4">Commencez par créer votre première séance.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer une Séance
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {seances.map((seance) => (
              <div key={seance._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                        {seance.numero}
                      </span>
                      <h3 className="font-semibold text-gray-900">{seance.module}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatutColor(seance.statut)}`}>
                        {getStatutText(seance.statut)}
                      </span>
                    </div>
                    
                    {seance.titre && (
                      <p className="text-gray-700 font-medium mb-1">{seance.titre}</p>
                    )}
                    
                    {seance.programmeId_populated && (
                      <p className="text-sm text-gray-600 mb-2">
                        📚 Programme: {seance.programmeId_populated.titre}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2">📅</span>
                    {new Date(seance.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2">⏰</span>
                    {seance.heureDebut} - {seance.heureFin}
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2">⏱️</span>
                    {seance.dureeMinutes} min
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2">📍</span>
                    {seance.lieu}
                  </div>
                </div>

                {seance.description && (
                  <p className="text-gray-600 text-sm mb-3">{seance.description}</p>
                )}

                {seance.lienVisio && (
                  <div className="mb-3">
                    <a
                      href={seance.lienVisio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      🔗 Lien de visioconférence
                    </a>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(seance)}
                    className="bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(seance._id)}
                    className="bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm"
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

export default SeanceManager;
