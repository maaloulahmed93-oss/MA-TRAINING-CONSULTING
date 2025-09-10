import React from 'react';
import { motion } from 'framer-motion';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { Participant } from '../../types/participant';

interface ParticipantTableEnhancedProps {
  participants: Participant[];
  onView: (participant: Participant) => void;
  onEdit: (participant: Participant) => void;
  onDelete: (participant: Participant) => void;
}

const ParticipantTableEnhanced: React.FC<ParticipantTableEnhancedProps> = ({
  participants,
  onView,
  onEdit,
  onDelete
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'graduated':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'inactive':
        return 'Inactif';
      case 'graduated':
        return 'Diplômé';
      case 'suspended':
        return 'Suspendu';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Participant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Formations
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Projets
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progression
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Inscription
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {participants.map((participant, index) => (
              <motion.tr
                key={participant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                {/* Participant Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      {participant.avatar ? (
                        <img
                          className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                          src={participant.avatar}
                          alt={participant.fullName}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg border-2 border-gray-200">
                          {participant.fullName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {participant.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {participant.id}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Contact Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-900">
                      <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="truncate max-w-[200px]" title={participant.email}>
                        {participant.email}
                      </span>
                    </div>
                    {participant.phone && (
                      <div className="flex items-center text-sm text-gray-500">
                        <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                        {participant.phone}
                      </div>
                    )}
                  </div>
                </td>

                {/* Formations */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <AcademicCapIcon className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="text-sm font-medium text-gray-900">
                      {participant.formations.length}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      formation{participant.formations.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </td>

                {/* Projects */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <BriefcaseIcon className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-sm font-medium text-gray-900">
                      {participant.projects.length}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      projet{participant.projects.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </td>

                {/* Progress */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(participant.totalProgress, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round(participant.totalProgress)}%
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(participant.status)}`}>
                    {getStatusLabel(participant.status)}
                  </span>
                </td>

                {/* Enrollment Date */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                    {formatDate(participant.enrollmentDate)}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onView(participant)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-50 transition-colors duration-150"
                      title="Voir les détails"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(participant)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded-lg hover:bg-indigo-50 transition-colors duration-150"
                      title="Modifier"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(participant)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-lg hover:bg-red-50 transition-colors duration-150"
                      title="Supprimer"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {participants.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <AcademicCapIcon className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun participant trouvé
          </h3>
          <p className="text-gray-500">
            Commencez par ajouter des participants à votre système.
          </p>
        </div>
      )}
    </div>
  );
};

export default ParticipantTableEnhanced;
