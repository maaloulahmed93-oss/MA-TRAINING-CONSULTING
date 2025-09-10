import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  BookOpenIcon,
  BellIcon,
  ClockIcon,
  DocumentIcon,
  LinkIcon,
  PlayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { Participant } from '../../types/participant';

interface ParticipantDetailsEnhancedProps {
  participant: Participant;
}

const ParticipantDetailsEnhanced: React.FC<ParticipantDetailsEnhancedProps> = ({ participant }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'formations' | 'projects' | 'coaching' | 'notifications'>('overview');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'graduated': return 'text-blue-600 bg-blue-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'graduated': return 'Diplômé';
      case 'suspended': return 'Suspendu';
      default: return status;
    }
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'submitted': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      case 'not_started': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
      case 'success': return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'warning': return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'error': return <XMarkIcon className="w-5 h-5 text-red-500" />;
      case 'job': return <BriefcaseIcon className="w-5 h-5 text-purple-500" />;
      default: return <InformationCircleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: UserIcon },
    { id: 'formations', label: 'Formations', icon: AcademicCapIcon },
    { id: 'projects', label: 'Projets', icon: BriefcaseIcon },
    { id: 'coaching', label: 'Coaching', icon: BookOpenIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header with participant info */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-6">
        <div className="flex items-center space-x-4">
          {participant.avatar ? (
            <img
              src={participant.avatar}
              alt={participant.fullName}
              className="w-20 h-20 rounded-full border-4 border-white object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
              <UserIcon className="w-10 h-10 text-white" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{participant.fullName}</h1>
            <p className="text-blue-100">{participant.email}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(participant.status)}`}>
                {getStatusLabel(participant.status)}
              </span>
              <span className="text-blue-100">ID: {participant.id}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{participant.totalProgress}%</div>
            <div className="text-blue-100">Progression globale</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{participant.email}</span>
                </div>
                {participant.phone && (
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{participant.phone}</span>
                  </div>
                )}
                {participant.address && (
                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{participant.address}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">
                    Inscrit le {new Date(participant.enrollmentDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <ClockIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">
                    Dernière activité: {new Date(participant.lastActivity).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques rapides</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{participant.formations.length}</div>
                  <div className="text-sm text-gray-600">Formations</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{participant.projects.length}</div>
                  <div className="text-sm text-gray-600">Projets</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{participant.coachingResources.length}</div>
                  <div className="text-sm text-gray-600">Ressources</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {participant.notifications.filter(n => !n.isRead).length}
                  </div>
                  <div className="text-sm text-gray-600">Non lues</div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {participant.notes && (
              <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                <p className="text-gray-700">{participant.notes}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'formations' && (
          <div className="space-y-6">
            {participant.formations.map((formation) => (
              <div key={formation.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{formation.title}</h3>
                    <p className="text-gray-600">{formation.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-gray-500">{formation.domain}</span>
                      <span className="text-sm text-gray-500">{formation.level}</span>
                      <span className="text-sm text-gray-500">{formation.duration}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{formation.progress}%</div>
                    <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${formation.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Courses */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Cours ({formation.courses.length})</h4>
                  {formation.courses.map((course) => (
                    <div key={course.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{course.title}</h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {course.isCompleted ? 'Terminé' : 'En cours'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                      
                      {/* Modules */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">
                          Modules ({course.modules.length})
                        </div>
                        {course.modules.map((module) => (
                          <div key={module.id} className="flex items-center justify-between bg-white rounded p-2">
                            <div className="flex items-center space-x-2">
                              {module.isCompleted ? (
                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                              ) : module.isLocked ? (
                                <ClockIcon className="w-4 h-4 text-gray-400" />
                              ) : (
                                <PlayIcon className="w-4 h-4 text-blue-500" />
                              )}
                              <span className="text-sm text-gray-900">{module.title}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">{module.duration}</span>
                              {module.dataLinks.length > 0 && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {module.dataLinks.length} lien{module.dataLinks.length > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6">
            {participant.projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                    <p className="text-gray-600">{project.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-gray-500">Formation: {project.formationTitle}</span>
                      <span className="text-sm text-gray-500">
                        Échéance: {new Date(project.dueDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getProjectStatusColor(project.status)}`}>
                      {project.status === 'accepted' ? 'Accepté' :
                       project.status === 'rejected' ? 'Refusé' :
                       project.status === 'submitted' ? 'Soumis' :
                       project.status === 'in_progress' ? 'En cours' : 'Non commencé'}
                    </span>
                    {project.grade && (
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">{project.grade}/20</div>
                        <div className="text-xs text-gray-500">Note</div>
                      </div>
                    )}
                  </div>
                </div>

                {project.feedback && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Feedback</h4>
                    <p className="text-gray-700">{project.feedback}</p>
                  </div>
                )}

                {project.files.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Fichiers ({project.files.length})</h4>
                    <div className="space-y-2">
                      {project.files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between bg-gray-50 rounded p-2">
                          <div className="flex items-center space-x-2">
                            <DocumentIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{file.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">{file.size}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(file.uploadDate).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'coaching' && (
          <div className="space-y-6">
            {participant.coachingResources.map((resource) => (
              <div key={resource.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
                    <p className="text-gray-600">{resource.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{resource.type}</span>
                      <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">{resource.category}</span>
                      {resource.duration && (
                        <span className="text-sm text-gray-500">{resource.duration}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      resource.isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {resource.isCompleted ? 'Terminé' : 'En cours'}
                    </span>
                    <div className="text-xs text-gray-500">
                      Assigné le {new Date(resource.assignedDate).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>

                {resource.dataLinks.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Liens de données ({resource.dataLinks.length})</h4>
                    <div className="space-y-2">
                      {resource.dataLinks.map((link) => (
                        <div key={link.id} className="flex items-center justify-between bg-gray-50 rounded p-2">
                          <div className="flex items-center space-x-2">
                            <LinkIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{link.title}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{link.type}</span>
                            {link.fileSize && (
                              <span className="text-xs text-gray-500">{link.fileSize}</span>
                            )}
                            {link.duration && (
                              <span className="text-xs text-gray-500">{link.duration}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            {participant.notifications.map((notification) => (
              <div key={notification.id} className={`bg-white rounded-lg border p-4 ${
                notification.isRead ? 'border-gray-200' : 'border-blue-200 bg-blue-50'
              }`}>
                <div className="flex items-start space-x-3">
                  {getNotificationTypeIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{notification.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {new Date(notification.date).toLocaleDateString('fr-FR')}
                        </span>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 mt-1">{notification.message}</p>
                    
                    {notification.type === 'job' && (
                      <div className="mt-2 p-3 bg-purple-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {notification.company && (
                            <div><span className="font-medium">Entreprise:</span> {notification.company}</div>
                          )}
                          {notification.position && (
                            <div><span className="font-medium">Poste:</span> {notification.position}</div>
                          )}
                          {notification.salary && (
                            <div><span className="font-medium">Salaire:</span> {notification.salary}</div>
                          )}
                          {notification.contract && (
                            <div><span className="font-medium">Contrat:</span> {notification.contract}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {notification.dataLinks && notification.dataLinks.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm font-medium text-gray-700 mb-2">Actions disponibles</div>
                        <div className="space-y-1">
                          {notification.dataLinks.map((link) => (
                            <div key={link.id} className="flex items-center space-x-2">
                              <LinkIcon className="w-3 h-3 text-gray-400" />
                              <span className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                                {link.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ParticipantDetailsEnhanced;
