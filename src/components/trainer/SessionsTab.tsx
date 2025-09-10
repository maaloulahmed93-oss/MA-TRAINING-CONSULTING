import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Users,
  BookOpen,
  X,
  Save,
  Filter
} from 'lucide-react';
import { Session, Programme } from '../../types/trainer';
import {
  getSessions,
  addSession,
  updateSession,
  deleteSession,
  generateId,
  getProgrammes
} from '../../services/trainerStorage';

interface SessionsTabProps {
  onStatsUpdate: () => void;
}

const SessionsTab = ({ onStatsUpdate }: SessionsTabProps) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [filterProgramme, setFilterProgramme] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [formData, setFormData] = useState({
    programmeId: '',
    title: '',
    type: 'Formation' as 'Formation' | 'Encadrement' | 'Conseil',
    date: '',
    startTime: '',
    endTime: '',
    description: '',
    maxParticipants: 20
  });

  useEffect(() => {
    loadSessions();
    loadProgrammes();
  }, []);

  const loadSessions = () => {
    const data = getSessions();
    setSessions(data);
  };

  const loadProgrammes = () => {
    const data = getProgrammes();
    setProgrammes(data);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSession) {
      updateSession(editingSession.id, {
        ...formData,
        status: editingSession.status
      });
    } else {
      const newSession: Session = {
        id: generateId('session'),
        ...formData,
        status: 'Planifiée'
      };
      addSession(newSession);
    }
    
    resetForm();
    loadSessions();
    onStatsUpdate();
  };

  const handleEdit = (session: Session) => {
    setEditingSession(session);
    setFormData({
      programmeId: session.programmeId,
      title: session.title,
      type: session.type,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      description: session.description,
      maxParticipants: session.maxParticipants
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) {
      deleteSession(id);
      loadSessions();
      onStatsUpdate();
    }
  };

  const resetForm = () => {
    setFormData({
      programmeId: '',
      title: '',
      type: 'Formation',
      date: '',
      startTime: '',
      endTime: '',
      description: '',
      maxParticipants: 20
    });
    setEditingSession(null);
    setShowModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planifiée': return 'bg-blue-100 text-blue-800';
      case 'En cours': return 'bg-green-100 text-green-800';
      case 'Terminée': return 'bg-gray-100 text-gray-800';
      case 'Annulée': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Formation': return 'bg-purple-100 text-purple-800';
      case 'Encadrement': return 'bg-orange-100 text-orange-800';
      case 'Conseil': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgrammeName = (programmeId: string) => {
    const programme = programmes.find(p => p.id === programmeId);
    return programme ? programme.title : 'Programme inconnu';
  };

  const filteredSessions = sessions.filter(session => {
    const programmeMatch = filterProgramme === 'all' || session.programmeId === filterProgramme;
    const typeMatch = filterType === 'all' || session.type === filterType;
    return programmeMatch && typeMatch;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestion des Séances</h2>
          <p className="text-gray-600">Planifiez vos séances de formation, encadrement et conseil</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle Séance</span>
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
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Tous les types</option>
          <option value="Formation">Formation</option>
          <option value="Encadrement">Encadrement</option>
          <option value="Conseil">Conseil</option>
        </select>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredSessions.map((session) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-bold text-gray-900">{session.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(session.type)}`}>
                      {session.type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">{session.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4" />
                      <span>{getProgrammeName(session.programmeId)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(session.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{session.startTime} - {session.endTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>Max {session.maxParticipants} participants</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(session)}
                    className="flex items-center space-x-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Modifier</span>
                  </button>
                  <button
                    onClick={() => handleDelete(session.id)}
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
                    {editingSession ? 'Modifier la Séance' : 'Nouvelle Séance'}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Programme
                    </label>
                    <select
                      value={formData.programmeId}
                      onChange={(e) => setFormData({ ...formData, programmeId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Sélectionner un programme</option>
                      {programmes.map(programme => (
                        <option key={programme.id} value={programme.id}>
                          {programme.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titre de la Séance
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de Séance
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Formation' | 'Encadrement' | 'Conseil' })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="Formation">Formation</option>
                        <option value="Encadrement">Encadrement</option>
                        <option value="Conseil">Conseil</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Heure de Début
                      </label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Heure de Fin
                      </label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Maximum de Participants
                    </label>
                    <input
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData({ ...formData, maxParticipants: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      min="1"
                    />
                  </div>

                  <div className="flex items-center space-x-4 pt-4">
                    <button
                      type="submit"
                      className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      <span>{editingSession ? 'Mettre à jour' : 'Créer'}</span>
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

export default SessionsTab;
