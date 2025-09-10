import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  User,
  AlertTriangle
} from 'lucide-react';
import { JobOffer } from '../../types/freelancer';
import { getJobOffers, acceptJobOffer, refuseJobOffer } from '../../services/freelancerData';

type JobOffersTabProps = {
  onAccepted?: () => void;
};

const JobOffersTab: React.FC<JobOffersTabProps> = ({ onAccepted }) => {
  // Suivi des données mock
  console.log('JobOffers:', getJobOffers());
  const [jobOffers, setJobOffers] = useState<JobOffer[]>(getJobOffers());
  const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [workMode, setWorkMode] = useState<'solo' | 'team'>('solo');
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [refusalReason, setRefusalReason] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'refused'>('pending');

  const filteredOffers = jobOffers.filter(offer => 
    filter === 'all' || offer.status === filter
  );

  const handleAccept = (offer: JobOffer) => {
    setSelectedOffer(offer);
    setShowAcceptModal(true);
  };

  const handleRefuse = (offer: JobOffer) => {
    setSelectedOffer(offer);
    setShowRefuseModal(true);
  };

  const confirmAccept = () => {
    if (selectedOffer) {
      acceptJobOffer(selectedOffer.id, workMode === 'team' ? teamMembers : undefined);
      setJobOffers(getJobOffers());
      setShowAcceptModal(false);
      setSelectedOffer(null);
      setWorkMode('solo');
      setTeamMembers([]);
      // Inform parent to switch to Projects tab if provided
      if (onAccepted) {
        onAccepted();
      }
    }
  };

  const confirmRefuse = () => {
    if (selectedOffer && refusalReason.trim()) {
      refuseJobOffer(selectedOffer.id, refusalReason);
      setJobOffers(getJobOffers());
      setShowRefuseModal(false);
      setSelectedOffer(null);
      setRefusalReason('');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ISO Certification': return 'text-blue-600 bg-blue-100';
      case 'Development': return 'text-purple-600 bg-purple-100';
      case 'Marketing': return 'text-pink-600 bg-pink-100';
      case 'Design': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec filtres */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">📋</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Offres de Mission</h2>
        </div>
        <p className="text-gray-600">Découvrez et acceptez de nouvelles missions</p>
        
        <div className="flex gap-2">
          {(['all', 'pending', 'accepted', 'refused'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterType
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterType === 'all' ? 'Toutes' : 
               filterType === 'pending' ? 'En attente' :
               filterType === 'accepted' ? 'Acceptées' : 'Refusées'}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des offres */}
      <div className="grid gap-6">
        {filteredOffers.map((offer, index) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-8 border-blue-500 mb-6 hover:shadow-2xl transition-shadow duration-200 group"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-100 text-blue-600 rounded-full p-2 text-xl">📄</span>
              <h3 className="text-2xl font-extrabold text-blue-900 group-hover:text-blue-700 transition-colors">{offer.title}</h3>
            </div>
            {/* Badge Statut */}
            <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
              offer.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              offer.status === 'accepted' ? 'bg-green-100 text-green-700' :
              offer.status === 'refused' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {offer.status === 'pending' ? 'En attente' : offer.status === 'accepted' ? 'Acceptée' : 'Refusée'}
            </span>

            {/* Badge Priorité */}
            <span className={`absolute top-4 left-4 px-2 py-1 rounded text-xs font-bold border ${
              offer.priority === 'high' ? 'bg-red-200 text-red-700 border-red-400' :
              offer.priority === 'medium' ? 'bg-orange-200 text-orange-700 border-orange-400' :
              'bg-green-200 text-green-700 border-green-400'
            }`}>
              {offer.priority === 'high' ? 'Priorité Haute' : offer.priority === 'medium' ? 'Priorité Moyenne' : 'Priorité Basse'}
            </span>
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              {/* Informations principales */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{offer.title}</h3>
                    <p className="text-gray-600 mb-3">{offer.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(offer.priority)}`}>
                      {offer.priority === 'high' ? 'Urgent' : 
                       offer.priority === 'medium' ? 'Normal' : 'Flexible'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(offer.category || 'general')}`}>
                      {offer.category || 'Général'}
                    </span>
                  </div>
                </div>

                {/* Détails */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span className="text-sm">{offer.price} {offer.currency}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">{new Date(offer.deadline).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Briefcase className="w-4 h-4 mr-2" />
                    <span className="text-sm">{offer.clientName}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm">Créée le {offer.createdAt ? new Date(offer.createdAt).toLocaleDateString('fr-FR') : 'Date non disponible'}</span>
                  </div>
                </div>

                {/* Exigences */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Exigences :</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {offer.requirements?.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    )) || <li>Aucune exigence spécifiée</li>}
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col justify-center gap-3 lg:w-48">
                {offer.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleAccept(offer)}
                      className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accepter
                    </button>
                    <button
                      onClick={() => handleRefuse(offer)}
                      className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      <XCircle className="w-4 h-4" />
                      Refuser
                    </button>
                  </>
                )}
                {offer.status === 'accepted' && (
                  <div className="flex items-center justify-center gap-2 bg-green-100 text-green-700 px-4 py-3 rounded-lg font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Acceptée
                  </div>
                )}
                {offer.status === 'refused' && (
                  <div className="flex items-center justify-center gap-2 bg-red-100 text-red-700 px-4 py-3 rounded-lg font-medium">
                    <XCircle className="w-4 h-4" />
                    Refusée
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal d'acceptation */}
      {showAcceptModal && selectedOffer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold mb-4">Accepter la mission</h3>
            <p className="text-gray-600 mb-6">{selectedOffer.title}</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode de travail
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="solo"
                      checked={workMode === 'solo'}
                      onChange={(e) => setWorkMode(e.target.value as 'solo')}
                      className="mr-2"
                    />
                    <User className="w-4 h-4 mr-1" />
                    Solo
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="team"
                      checked={workMode === 'team'}
                      onChange={(e) => setWorkMode(e.target.value as 'team')}
                      className="mr-2"
                    />
                    <Users className="w-4 h-4 mr-1" />
                    En équipe
                  </label>
                </div>
              </div>

              {workMode === 'team' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Membres de l'équipe (emails)
                  </label>
                  <textarea
                    value={teamMembers.join('\n')}
                    onChange={(e) => setTeamMembers(e.target.value.split('\n').filter(Boolean))}
                    placeholder="email1@example.com&#10;email2@example.com"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmAccept}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Confirmer
              </button>
              <button
                onClick={() => setShowAcceptModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Annuler
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal de refus */}
      {showRefuseModal && selectedOffer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-xl font-bold">Refuser la mission</h3>
            </div>
            <p className="text-gray-600 mb-4">{selectedOffer.title}</p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison du refus *
              </label>
              <textarea
                value={refusalReason}
                onChange={(e) => setRefusalReason(e.target.value)}
                placeholder="Expliquez pourquoi vous refusez cette mission..."
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows={4}
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmRefuse}
                disabled={!refusalReason.trim()}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmer le refus
              </button>
              <button
                onClick={() => setShowRefuseModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Annuler
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {filteredOffers.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Aucune offre {filter !== 'all' ? (filter === 'pending' ? 'en attente' : filter === 'accepted' ? 'acceptée' : 'refusée') : ''}
          </h3>
          <p className="text-gray-500">
            {filter === 'pending' ? 'Revenez plus tard pour découvrir de nouvelles missions' : 'Changez de filtre pour voir d\'autres offres'}
          </p>
        </div>
      )}
    </div>
  );
};

export default JobOffersTab;
