import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Video, 
  Users, 
  ExternalLink, 
  FileText, 
  Save,
  AlertCircle
} from 'lucide-react';
import { Meeting } from '../../types/freelancer';
import { getMeetings, addMeetingNotes, acceptMeeting, refuseMeeting, removeMeeting } from '../../services/freelancerData';

const MeetingsTab: React.FC = () => {
  // Suivi des données mock
  console.log('Meetings:', getMeetings());
  const [meetings, setMeetings] = useState<Meeting[]>(getMeetings());
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [notes, setNotes] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed'>('all');
  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [refusalReason, setRefusalReason] = useState('');

  const filteredMeetings = meetings.filter(meeting => 
    filter === 'all' || meeting.status === filter
  );

  const handleAddNotes = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setNotes(meeting.notes || '');
    setShowNotesModal(true);
  };

  const saveNotes = () => {
    if (selectedMeeting) {
      addMeetingNotes(selectedMeeting.id, notes);
      setMeetings(getMeetings());
      setShowNotesModal(false);
      setSelectedMeeting(null);
      setNotes('');
    }
  };

  const handleAccept = (meeting: Meeting) => {
    acceptMeeting(meeting.id);
    setMeetings(getMeetings());
  };

  const handleRefuse = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setRefusalReason('');
    setShowRefuseModal(true);
  };

  const confirmRefuse = () => {
    if (selectedMeeting && refusalReason.trim()) {
      refuseMeeting(selectedMeeting.id, refusalReason.trim());
      setMeetings(getMeetings());
      setShowRefuseModal(false);
      setSelectedMeeting(null);
      setRefusalReason('');
    }
  };

  const handleRemovePast = (meeting: Meeting) => {
    removeMeeting(meeting.id);
    setMeetings(getMeetings());
  };

  const joinMeeting = (meetingLink: string) => {
    window.open(meetingLink, '_blank');
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Google Meet':
        return '🟢';
      case 'Zoom':
        return '🔵';
      case 'Teams':
        return '🟣';
      default:
        return '📹';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'text-blue-600 bg-blue-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const isUpcoming = (date: string, time: string) => {
    const meetingDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    return meetingDateTime > now;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  return (
    <div className="space-y-6">
      {/* Header avec filtres */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">📋</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Réunions</h2>
        </div>
        <p className="text-gray-600">Gérez vos réunions et ajoutez des notes</p>
        
        <div className="flex gap-2">
          {(['all', 'scheduled', 'completed'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterType
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterType === 'all' ? 'Toutes' : 
               filterType === 'scheduled' ? 'Programmées' : 'Terminées'}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des réunions */}
      <div className="grid gap-4">
        {filteredMeetings.map((meeting, index) => (
          <motion.div
            key={meeting.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-8 border-green-500 mb-6 hover:shadow-2xl transition-shadow duration-200 group"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-green-100 text-green-600 rounded-full p-2 text-xl">📅</span>
              <h3 className="text-2xl font-extrabold text-green-900 group-hover:text-green-700 transition-colors">{meeting.title}</h3>
            </div>
            {/* Badge Statut */}
            <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
              meeting.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
              meeting.status === 'completed' ? 'bg-green-100 text-green-700' :
              meeting.status === 'cancelled' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {meeting.status === 'scheduled' ? 'Programmée' :
                meeting.status === 'completed' ? 'Terminée' :
                meeting.status === 'cancelled' ? 'Annulée' :
                'Inconnue'}
            </span>
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              {/* Informations principales */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <span className="text-2xl">{getPlatformIcon(meeting.platform || 'default')}</span>
                      {meeting.title}
                    </h3>
                    <div className="flex items-center gap-4 text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{formatDate(meeting.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{formatTime(meeting.time)} ({meeting.duration} min)</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                    {meeting.status === 'scheduled' ? 'Programmée' : 
                     meeting.status === 'completed' ? 'Terminée' : 'Annulée'}
                  </span>
                </div>

                {/* Participants */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Participants :</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {meeting.participants?.map((participant, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                      >
                        {participant}
                      </span>
                    )) || <span className="text-sm text-gray-500">Aucun participant spécifié</span>}
                  </div>
                </div>

                {/* Notes existantes */}
                {meeting.notes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Notes :</span>
                    </div>
                    <p className="text-sm text-gray-600">{meeting.notes}</p>
                  </div>
                )}

      {/* Modal de refus */}
      {showRefuseModal && selectedMeeting && (
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
            <div className="mb-4">
              <h3 className="text-xl font-bold">Refuser la réunion</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedMeeting.title}</p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Raison du refus *</label>
              <textarea
                value={refusalReason}
                onChange={(e) => setRefusalReason(e.target.value)}
                placeholder="Expliquez la raison du refus..."
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows={4}
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={confirmRefuse}
                disabled={!refusalReason.trim()}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Confirmer le refus
              </button>
              <button
                onClick={() => setShowRefuseModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
              </div>

              {/* Actions */}
              <div className="flex flex-col justify-center gap-3 lg:w-48">
                {meeting.status === 'scheduled' && isUpcoming(meeting.date, meeting.time) && (
                  <button
                    onClick={() => joinMeeting(meeting.meetingLink)}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Video className="w-4 h-4" />
                    Rejoindre
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
                {meeting.status === 'scheduled' && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleAccept(meeting)}
                      className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      ✅ Accepter
                    </button>
                    <button
                      onClick={() => handleRefuse(meeting)}
                      className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      ❌ Refuser
                    </button>
                  </div>
                )}

                <button
                  onClick={() => handleAddNotes(meeting)}
                  className="flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  <FileText className="w-4 h-4" />
                  {meeting.notes ? 'Modifier notes' : 'Ajouter notes'}
                </button>

                {meeting.status === 'scheduled' && !isUpcoming(meeting.date, meeting.time) && (
                  <button
                    onClick={() => handleRemovePast(meeting)}
                    className="flex items-center justify-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-lg text-sm hover:bg-orange-200"
                    title="Réunion passée - cliquer pour retirer"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Passée • Retirer
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal pour les notes */}
      {showNotesModal && selectedMeeting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold">Notes de réunion</h3>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800">{selectedMeeting.title}</h4>
              <p className="text-sm text-gray-600">
                {formatDate(selectedMeeting.date)} à {formatTime(selectedMeeting.time)}
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vos notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ajoutez vos notes de réunion..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={8}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={saveNotes}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                Sauvegarder
              </button>
              <button
                onClick={() => setShowNotesModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Annuler
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {filteredMeetings.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Aucune réunion {filter !== 'all' ? (filter === 'scheduled' ? 'programmée' : 'terminée') : ''}
          </h3>
          <p className="text-gray-500">
            Les réunions liées à vos projets apparaîtront ici
          </p>
        </div>
      )}
    </div>
  );
};

export default MeetingsTab;
