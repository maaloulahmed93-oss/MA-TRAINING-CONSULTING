import React, { useState, useEffect } from 'react';
import { formateurProgrammeService, FormateurEvenement, FormateurProgramme } from '../../services/formateurProgrammeService';

interface EvenementManagerProps {
  formateurId: string;
}

const EvenementManager: React.FC<EvenementManagerProps> = ({ formateurId }) => {
  const [evenements, setEvenements] = useState<FormateurEvenement[]>([]);
  const [programmes, setProgrammes] = useState<FormateurProgramme[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEvenement, setEditingEvenement] = useState<FormateurEvenement | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [filters, setFilters] = useState({
    type: 'all',
    statut: 'all',
    programmeId: '',
    dateDebut: '',
    dateFin: ''
  });

  // État du formulaire
  const [formData, setFormData] = useState({
    programmeId: '',
    sujet: '',
    description: '',
    date: '',
    heureDebut: '14:00',
    heureFin: '15:30',
    type: 'reunion' as 'reunion' | 'formation' | 'conference' | 'webinaire' | 'entretien' | 'autre',
    lieu: 'En ligne',
    priorite: 'normale' as 'basse' | 'normale' | 'haute' | 'urgente',
    couleur: '#3B82F6',
    notes: ''
  });

  useEffect(() => {
    loadProgrammes();
    loadEvenements();
  }, [formateurId, filters]);

  const loadProgrammes = async () => {
    try {
      const response = await formateurProgrammeService.getProgrammes(formateurId);
      setProgrammes(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des programmes:', error);
    }
  };

  const loadEvenements = async () => {
    try {
      setLoading(true);
      const response = await formateurProgrammeService.getEvenements(formateurId, {
        type: filters.type === 'all' ? undefined : filters.type,
        statut: filters.statut === 'all' ? undefined : filters.statut,
        programmeId: filters.programmeId || undefined,
        dateDebut: filters.dateDebut || undefined,
        dateFin: filters.dateFin || undefined
      });
      setEvenements(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingEvenement) {
        // Mise à jour
        await formateurProgrammeService.updateEvenement(editingEvenement._id, formData);
      } else {
        // Création
        await formateurProgrammeService.createEvenement({
          formateurId,
          ...formData
        });
      }
      
      resetForm();
      loadEvenements();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de l\'événement');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (evenement: FormateurEvenement) => {
    setEditingEvenement(evenement);
    setFormData({
      programmeId: evenement.programmeId || '',
      sujet: evenement.sujet,
      description: evenement.description || '',
      date: evenement.date.split('T')[0],
      heureDebut: evenement.heureDebut,
      heureFin: evenement.heureFin,
      type: evenement.type,
      lieu: evenement.lieu,
      priorite: evenement.priorite,
      couleur: evenement.couleur,
      notes: evenement.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (evenementId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;
    
    try {
      setLoading(true);
      await formateurProgrammeService.deleteEvenement(evenementId);
      loadEvenements();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'événement');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      programmeId: '',
      sujet: '',
      description: '',
      date: '',
      heureDebut: '14:00',
      heureFin: '15:30',
      type: 'reunion',
      lieu: 'En ligne',
      priorite: 'normale',
      couleur: '#3B82F6',
      notes: ''
    });
    setEditingEvenement(null);
    setShowForm(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reunion': return 'bg-blue-100 text-blue-800';
      case 'formation': return 'bg-green-100 text-green-800';
      case 'conference': return 'bg-purple-100 text-purple-800';
      case 'webinaire': return 'bg-indigo-100 text-indigo-800';
      case 'entretien': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'reunion': return 'Réunion';
      case 'formation': return 'Formation';
      case 'conference': return 'Conférence';
      case 'webinaire': return 'Webinaire';
      case 'entretien': return 'Entretien';
      case 'autre': return 'Autre';
      default: return type;
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'planifie': return 'bg-blue-100 text-blue-800';
      case 'en_cours': return 'bg-yellow-100 text-yellow-800';
      case 'termine': return 'bg-green-100 text-green-800';
      case 'annule': return 'bg-red-100 text-red-800';
      case 'reporte': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutText = (statut: string) => {
    switch (statut) {
      case 'planifie': return 'Planifié';
      case 'en_cours': return 'En cours';
      case 'termine': return 'Terminé';
      case 'annule': return 'Annulé';
      case 'reporte': return 'Reporté';
      default: return statut;
    }
  };

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'urgente': return 'text-red-600';
      case 'haute': return 'text-orange-600';
      case 'normale': return 'text-blue-600';
      case 'basse': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getPrioriteIcon = (priorite: string) => {
    switch (priorite) {
      case 'urgente': return '🔴';
      case 'haute': return '🟠';
      case 'normale': return '🔵';
      case 'basse': return '⚪';
      default: return '⚪';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Mes Événements</h2>
            <p className="text-sm text-gray-600 mt-1">
              Gérez votre agenda et vos événements
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Liste
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === 'calendar' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Calendrier
              </button>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Nouvel Événement
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="mt-4 flex flex-wrap gap-4">
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tous les types</option>
            <option value="reunion">Réunions</option>
            <option value="formation">Formations</option>
            <option value="conference">Conférences</option>
            <option value="webinaire">Webinaires</option>
            <option value="entretien">Entretiens</option>
            <option value="autre">Autres</option>
          </select>

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
            <option value="reporte">Reportés</option>
          </select>

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

          <input
            type="date"
            value={filters.dateDebut}
            onChange={(e) => setFilters({ ...filters, dateDebut: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Date début"
          />

          <input
            type="date"
            value={filters.dateFin}
            onChange={(e) => setFilters({ ...filters, dateFin: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Date fin"
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
                  Sujet *
                </label>
                <input
                  type="text"
                  required
                  value={formData.sujet}
                  onChange={(e) => setFormData({ ...formData, sujet: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Réunion de suivi, Formation SEO..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="reunion">Réunion</option>
                  <option value="formation">Formation</option>
                  <option value="conference">Conférence</option>
                  <option value="webinaire">Webinaire</option>
                  <option value="entretien">Entretien</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Programme (optionnel)
                </label>
                <select
                  value={formData.programmeId}
                  onChange={(e) => setFormData({ ...formData, programmeId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Aucun programme</option>
                  {programmes.map(prog => (
                    <option key={prog._id} value={prog._id}>{prog.titre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priorité
                </label>
                <select
                  value={formData.priorite}
                  onChange={(e) => setFormData({ ...formData, priorite: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="basse">Basse</option>
                  <option value="normale">Normale</option>
                  <option value="haute">Haute</option>
                  <option value="urgente">Urgente</option>
                </select>
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
                  placeholder="En ligne, Salle de réunion..."
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur
                </label>
                <input
                  type="color"
                  value={formData.couleur}
                  onChange={(e) => setFormData({ ...formData, couleur: e.target.value })}
                  className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                placeholder="Détails de l'événement..."
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
                {loading ? 'Sauvegarde...' : editingEvenement ? 'Mettre à jour' : 'Créer l\'Événement'}
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

      {/* Liste des événements */}
      <div className="p-6">
        {loading && !showForm ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Chargement des événements...</p>
          </div>
        ) : evenements.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun événement</h3>
            <p className="text-gray-600 mb-4">Commencez par créer votre premier événement.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer un Événement
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {evenements.map((evenement) => (
              <div 
                key={evenement._id} 
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                style={{ borderLeftColor: evenement.couleur, borderLeftWidth: '4px' }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{evenement.sujet}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(evenement.type)}`}>
                        {getTypeText(evenement.type)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatutColor(evenement.statut)}`}>
                        {getStatutText(evenement.statut)}
                      </span>
                      <span className={`text-sm ${getPrioriteColor(evenement.priorite)}`}>
                        {getPrioriteIcon(evenement.priorite)} {evenement.priorite}
                      </span>
                    </div>
                    
                    {evenement.description && (
                      <p className="text-gray-600 text-sm mb-2">{evenement.description}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2">📅</span>
                    {new Date(evenement.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2">⏰</span>
                    {evenement.heureDebut} - {evenement.heureFin}
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2">⏱️</span>
                    {evenement.dureeMinutes} min
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2">📍</span>
                    {evenement.lieu}
                  </div>
                </div>

                {evenement.notes && (
                  <p className="text-gray-600 text-sm mb-3 italic">{evenement.notes}</p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(evenement)}
                    className="bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(evenement._id)}
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

export default EvenementManager;
