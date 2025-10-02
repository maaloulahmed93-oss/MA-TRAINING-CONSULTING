import React, { useState, useEffect } from 'react';
import { formateurProgrammeService, FormateurParticipant, FormateurProgramme } from '../../services/formateurProgrammeService';

interface ParticipantManagerProps {
  formateurId: string;
}

const ParticipantManager: React.FC<ParticipantManagerProps> = ({ formateurId }) => {
  const [participants, setParticipants] = useState<FormateurParticipant[]>([]);
  const [programmes, setProgrammes] = useState<FormateurProgramme[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<FormateurParticipant | null>(null);
  const [filters, setFilters] = useState({
    programmeId: '',
    statut: 'all'
  });

  // État du formulaire
  const [formData, setFormData] = useState({
    programmeId: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    informationsSupplementaires: {
      entreprise: '',
      poste: '',
      experience: '',
      objectifs: ''
    }
  });

  useEffect(() => {
    loadProgrammes();
    loadParticipants();
  }, [formateurId, filters]);

  const loadProgrammes = async () => {
    try {
      const response = await formateurProgrammeService.getProgrammes(formateurId);
      setProgrammes(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des programmes:', error);
    }
  };

  const loadParticipants = async () => {
    try {
      setLoading(true);
      const response = await formateurProgrammeService.getParticipants(formateurId, {
        programmeId: filters.programmeId || undefined,
        statut: filters.statut === 'all' ? undefined : filters.statut
      });
      setParticipants(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingParticipant) {
        // Mise à jour
        await formateurProgrammeService.updateParticipant(editingParticipant._id, formData);
      } else {
        // Création
        await formateurProgrammeService.addParticipant({
          formateurId,
          ...formData
        });
      }
      
      resetForm();
      loadParticipants();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du participant');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (participant: FormateurParticipant) => {
    setEditingParticipant(participant);
    setFormData({
      programmeId: participant.programmeId,
      nom: participant.nom,
      prenom: participant.prenom,
      email: participant.email,
      telephone: participant.telephone || '',
      informationsSupplementaires: participant.informationsSupplementaires || {
        entreprise: '',
        poste: '',
        experience: '',
        objectifs: ''
      }
    });
    setShowForm(true);
  };

  const handleDelete = async (participantId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce participant ?')) return;
    
    try {
      setLoading(true);
      await formateurProgrammeService.deleteParticipant(participantId);
      loadParticipants();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du participant');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      programmeId: '',
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      informationsSupplementaires: {
        entreprise: '',
        poste: '',
        experience: '',
        objectifs: ''
      }
    });
    setEditingParticipant(null);
    setShowForm(false);
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'inscrit': return 'bg-blue-100 text-blue-800';
      case 'confirme': return 'bg-yellow-100 text-yellow-800';
      case 'en_cours': return 'bg-green-100 text-green-800';
      case 'termine': return 'bg-gray-100 text-gray-800';
      case 'abandonne': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutText = (statut: string) => {
    switch (statut) {
      case 'inscrit': return 'Inscrit';
      case 'confirme': return 'Confirmé';
      case 'en_cours': return 'En cours';
      case 'termine': return 'Terminé';
      case 'abandonne': return 'Abandonné';
      default: return statut;
    }
  };

  const getProgressionColor = (pourcentage: number) => {
    if (pourcentage >= 80) return 'bg-green-500';
    if (pourcentage >= 60) return 'bg-yellow-500';
    if (pourcentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Mes Participants</h2>
            <p className="text-sm text-gray-600 mt-1">
              Gérez les participants de vos programmes
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Nouveau Participant
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
            <option value="inscrit">Inscrits</option>
            <option value="confirme">Confirmés</option>
            <option value="en_cours">En cours</option>
            <option value="termine">Terminés</option>
            <option value="abandonne">Abandonnés</option>
          </select>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
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
                  Nom *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dupont"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  required
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Jean"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="jean.dupont@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entreprise
                </label>
                <input
                  type="text"
                  value={formData.informationsSupplementaires.entreprise}
                  onChange={(e) => setFormData({
                    ...formData,
                    informationsSupplementaires: {
                      ...formData.informationsSupplementaires,
                      entreprise: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nom de l'entreprise"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poste
                </label>
                <input
                  type="text"
                  value={formData.informationsSupplementaires.poste}
                  onChange={(e) => setFormData({
                    ...formData,
                    informationsSupplementaires: {
                      ...formData.informationsSupplementaires,
                      poste: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Responsable Marketing"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expérience
              </label>
              <textarea
                rows={2}
                value={formData.informationsSupplementaires.experience}
                onChange={(e) => setFormData({
                  ...formData,
                  informationsSupplementaires: {
                    ...formData.informationsSupplementaires,
                    experience: e.target.value
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Expérience professionnelle..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objectifs
              </label>
              <textarea
                rows={2}
                value={formData.informationsSupplementaires.objectifs}
                onChange={(e) => setFormData({
                  ...formData,
                  informationsSupplementaires: {
                    ...formData.informationsSupplementaires,
                    objectifs: e.target.value
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Objectifs de formation..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Sauvegarde...' : editingParticipant ? 'Mettre à jour' : 'Ajouter le Participant'}
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

      {/* Liste des participants */}
      <div className="p-6">
        {loading && !showForm ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Chargement des participants...</p>
          </div>
        ) : participants.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun participant</h3>
            <p className="text-gray-600 mb-4">Commencez par ajouter votre premier participant.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ajouter un Participant
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {participants.map((participant) => (
              <div key={participant._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {participant.prenom} {participant.nom}
                    </h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatutColor(participant.statut)}`}>
                      {getStatutText(participant.statut)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2">📧</span>
                    <a href={`mailto:${participant.email}`} className="text-blue-600 hover:text-blue-800">
                      {participant.email}
                    </a>
                  </div>
                  
                  {participant.telephone && (
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2">📞</span>
                      <a href={`tel:${participant.telephone}`} className="text-blue-600 hover:text-blue-800">
                        {participant.telephone}
                      </a>
                    </div>
                  )}

                  {participant.programmeId_populated && (
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2">📚</span>
                      {participant.programmeId_populated.titre}
                    </div>
                  )}

                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2">📅</span>
                    Inscrit le {new Date(participant.dateInscription).toLocaleDateString()}
                  </div>

                  {participant.informationsSupplementaires?.entreprise && (
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2">🏢</span>
                      {participant.informationsSupplementaires.entreprise}
                    </div>
                  )}

                  {participant.informationsSupplementaires?.poste && (
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2">💼</span>
                      {participant.informationsSupplementaires.poste}
                    </div>
                  )}
                </div>

                {/* Progression */}
                {participant.progression && participant.progression.totalSeances > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">Progression</span>
                      <span className="text-sm text-gray-600">
                        {participant.progression.seancesAssistees}/{participant.progression.totalSeances}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressionColor(participant.progression.pourcentage)}`}
                        style={{ width: `${participant.progression.pourcentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {participant.progression.pourcentage}% complété
                    </div>
                  </div>
                )}

                {/* Note finale */}
                {participant.noteFinale && (
                  <div className="mb-4 p-2 bg-gray-50 rounded">
                    <div className="text-sm font-medium text-gray-700">Note finale</div>
                    <div className="text-lg font-bold text-blue-600">{participant.noteFinale}/20</div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(participant)}
                    className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(participant._id)}
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

export default ParticipantManager;
