import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  BookOpen,
  X,
  Save,
  Filter,
  User
} from 'lucide-react';
import { Participant, Programme } from '../../types/trainer';
import {
  getParticipants,
  addParticipant,
  updateParticipant,
  deleteParticipant,
  generateId,
  getProgrammes,
  calculateCommission
} from '../../services/trainerStorage';

interface ParticipantsTabProps {
  onStatsUpdate: () => void;
}

const ParticipantsTab = ({ onStatsUpdate }: ParticipantsTabProps) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [filterProgramme, setFilterProgramme] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    programmeId: '',
    paymentStatus: 'Payant' as 'Payant' | 'Gratuit' | 'Annulé',
    amountPaid: 0
  });

  useEffect(() => {
    loadParticipants();
    loadProgrammes();
  }, []);

  const loadParticipants = () => {
    const data = getParticipants();
    setParticipants(data);
  };

  const loadProgrammes = () => {
    const data = getProgrammes();
    setProgrammes(data);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const commission = formData.paymentStatus === 'Payant' ? calculateCommission(formData.amountPaid) : 0;
    
    if (editingParticipant) {
      updateParticipant(editingParticipant.id, {
        ...formData,
        commission,
        status: editingParticipant.status
      });
    } else {
      const newParticipant: Participant = {
        id: generateId('participant'),
        ...formData,
        registrationDate: new Date().toISOString(),
        commission,
        status: 'Actif'
      };
      addParticipant(newParticipant);
    }
    
    resetForm();
    loadParticipants();
    onStatsUpdate();
  };

  const handleEdit = (participant: Participant) => {
    setEditingParticipant(participant);
    setFormData({
      firstName: participant.firstName,
      lastName: participant.lastName,
      email: participant.email,
      phone: participant.phone,
      programmeId: participant.programmeId,
      paymentStatus: participant.paymentStatus,
      amountPaid: participant.amountPaid
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce participant ?')) {
      deleteParticipant(id);
      loadParticipants();
      onStatsUpdate();
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      programmeId: '',
      paymentStatus: 'Payant',
      amountPaid: 0
    });
    setEditingParticipant(null);
    setShowModal(false);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Payant': return 'bg-green-100 text-green-800';
      case 'Gratuit': return 'bg-blue-100 text-blue-800';
      case 'Annulé': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Actif': return 'bg-green-100 text-green-800';
      case 'Inactif': return 'bg-gray-100 text-gray-800';
      case 'Terminé': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgrammeName = (programmeId: string) => {
    const programme = programmes.find(p => p.id === programmeId);
    return programme ? programme.title : 'Programme inconnu';
  };

  const getProgrammePrice = (programmeId: string) => {
    const programme = programmes.find(p => p.id === programmeId);
    return programme ? programme.price : 0;
  };

  const filteredParticipants = participants.filter(participant => {
    const programmeMatch = filterProgramme === 'all' || participant.programmeId === filterProgramme;
    const statusMatch = filterStatus === 'all' || participant.status === filterStatus;
    const paymentMatch = filterPayment === 'all' || participant.paymentStatus === filterPayment;
    return programmeMatch && statusMatch && paymentMatch;
  });

  // Update amount when programme changes
  const handleProgrammeChange = (programmeId: string) => {
    const programmePrice = getProgrammePrice(programmeId);
    setFormData({
      ...formData,
      programmeId,
      amountPaid: formData.paymentStatus === 'Payant' ? programmePrice : 0
    });
  };

  const handlePaymentStatusChange = (paymentStatus: 'Payant' | 'Gratuit' | 'Annulé') => {
    const programmePrice = getProgrammePrice(formData.programmeId);
    setFormData({
      ...formData,
      paymentStatus,
      amountPaid: paymentStatus === 'Payant' ? programmePrice : 0
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestion des Participants</h2>
          <p className="text-gray-600">Inscrivez et gérez vos participants</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau Participant</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filterProgramme}
            onChange={(e) => setFilterProgramme(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les programmes</option>
            {programmes.map(programme => (
              <option key={programme.id} value={programme.id}>
                {programme.title}
              </option>
            ))}
          </select>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Tous les statuts</option>
          <option value="Actif">Actif</option>
          <option value="Inactif">Inactif</option>
          <option value="Terminé">Terminé</option>
        </select>
        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Tous les paiements</option>
          <option value="Payant">Payant</option>
          <option value="Gratuit">Gratuit</option>
          <option value="Annulé">Annulé</option>
        </select>
      </div>

      {/* Participants List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredParticipants.map((participant) => (
            <motion.div
              key={participant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {participant.firstName} {participant.lastName}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(participant.paymentStatus)}`}>
                          {participant.paymentStatus}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(participant.status)}`}>
                          {participant.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>{participant.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{participant.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4" />
                      <span>{getProgrammeName(participant.programmeId)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(participant.registrationDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4" />
                      <span>
                        {participant.amountPaid} DT
                        {participant.paymentStatus === 'Payant' && (
                          <span className="text-green-600 ml-1">
                            (Commission: {participant.commission.toFixed(2)} DT)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(participant)}
                    className="flex items-center space-x-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Modifier</span>
                  </button>
                  <button
                    onClick={() => handleDelete(participant.id)}
                    className="flex items-center justify-center bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {editingParticipant ? 'Modifier le Participant' : 'Nouveau Participant'}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Programme
                    </label>
                    <select
                      value={formData.programmeId}
                      onChange={(e) => handleProgrammeChange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Sélectionner un programme</option>
                      {programmes.map(programme => (
                        <option key={programme.id} value={programme.id}>
                          {programme.title} - {programme.price} DT
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Statut de Paiement
                      </label>
                      <select
                        value={formData.paymentStatus}
                        onChange={(e) => handlePaymentStatusChange(e.target.value as 'Payant' | 'Gratuit' | 'Annulé')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="Payant">Payant</option>
                        <option value="Gratuit">Gratuit</option>
                        <option value="Annulé">Annulé</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Montant Payé (DT)
                      </label>
                      <input
                        type="number"
                        value={formData.amountPaid}
                        onChange={(e) => setFormData({ ...formData, amountPaid: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        min="0"
                        disabled={formData.paymentStatus !== 'Payant'}
                      />
                    </div>
                  </div>

                  {formData.paymentStatus === 'Payant' && formData.amountPaid > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800">
                        <strong>Commission (25%):</strong> {calculateCommission(formData.amountPaid).toFixed(2)} DT
                      </p>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 pt-4">
                    <button
                      type="submit"
                      className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      <span>{editingParticipant ? 'Mettre à jour' : 'Créer'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParticipantsTab;
