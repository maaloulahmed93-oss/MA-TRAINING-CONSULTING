import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  UserGroupIcon
} from '@heroicons/react/24/solid';
import { Participant } from '../types/participant';
import { getAll as getAllParticipants, seedIfEmpty as seedParticipantsIfEmpty, upsert as upsertParticipant, remove as removeParticipant, exportJSON as exportParticipantsJSON, importJSON as importParticipantsJSON, saveAll as saveAllParticipants } from '../services/participantsService';
import Modal from '../components/common/Modal';
import ParticipantForm from '../components/participants/ParticipantForm';
import ParticipantDetails from '../components/participants/ParticipantDetails';
import { mockParticipantsData } from '../data/mockParticipants';

const ParticipantsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'add' | 'edit'>('view');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [participantToDelete, setParticipantToDelete] = useState<Participant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([]);

  // Generate unique participant ID: PART-XXXXXX (6 digits)
  const generateParticipantId = (existingIds: Set<string>): string => {
    let id = '';
    do {
      const six = Math.floor(100000 + Math.random() * 900000); // 6 digits
      id = `PART-${six}`;
    } while (existingIds.has(id));
    return id;
  };

  // Seed localStorage from mocks if empty, then load
  useEffect(() => {
    seedParticipantsIfEmpty(mockParticipantsData);
    setParticipants(getAllParticipants());
  }, []);

  // Filter participants based on search and status
  useEffect(() => {
    const filtered = participants.filter(participant => {
      const matchesSearch = participant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           participant.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || participant.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setFilteredParticipants(filtered);
  }, [participants, searchTerm, statusFilter]);

  // Normalize Partial<Participant> into a complete Participant aligned with admin types and mocks
  const normalizeParticipant = (
    input: Partial<Participant>,
    mode: 'add' | 'edit',
    existing?: Participant
  ): Participant => {
    const nowIso = new Date().toISOString();

    // Name fields
    const fullName = input.fullName
      || (input.firstName || existing?.firstName || '') + (input.lastName || existing?.lastName ? ` ${input.lastName ?? existing?.lastName}` : '')
      || existing?.fullName
      || '';

    const status: Participant['status'] = (input.status as Participant['status']) || existing?.status || 'active';

    const formations = (input.formations ?? existing?.formations ?? []).map((f) => ({
      id: f.id || `FORM-${Date.now()}`,
      title: f.title || 'Formation',
      description: f.description || '',
      domain: f.domain || 'Général',
      level: f.level || 'Débutant',
      duration: f.duration || '0 heures',
      progress: typeof f.progress === 'number' ? f.progress : 0,
      status: f.status || 'not_started',
      enrollmentDate: f.enrollmentDate || nowIso,
      completionDate: f.completionDate,
      courses: (f.courses ?? []).map((c) => ({
        id: c.id || `COURSE-${Date.now()}`,
        title: c.title || 'Cours',
        description: c.description || '',
        progress: typeof c.progress === 'number' ? c.progress : 0,
        isCompleted: !!c.isCompleted,
        duration: c.duration || '0',
        modules: (c.modules ?? []).map((m) => ({
          id: m.id || `MOD-${Date.now()}`,
          title: m.title || 'Module',
          description: m.description || '',
          duration: m.duration || '0',
          isCompleted: !!m.isCompleted,
          isLocked: !!m.isLocked,
          type: m.type || 'video',
          content: m.content,
          dataLinks: m.dataLinks ?? [],
        })),
        sessions: c.sessions ? c.sessions : [],
      })),
      thumbnail: f.thumbnail,
      links: f.links ?? [],
    }));

    const projects = (input.projects ?? existing?.projects ?? []).map((p) => ({
      id: p.id || `PROJ-${Date.now()}`,
      title: p.title || 'Projet',
      description: p.description || '',
      formationId: p.formationId || formations[0]?.id || '',
      formationTitle: p.formationTitle || formations.find(ff => ff.id === p.formationId)?.title || formations[0]?.title || 'Non spécifiée',
      status: p.status || 'not_started',
      submittedDate: p.submittedDate,
      dueDate: p.dueDate || '',
      feedback: p.feedback,
      grade: p.grade,
      files: (p.files ?? []).map((f) => ({
        id: f.id || `FILE-${Date.now()}`,
        name: f.name || 'file',
        size: f.size || '',
        type: f.type || '',
        uploadDate: f.uploadDate || nowIso,
        url: f.url,
      })),
      createdAt: p.createdAt || nowIso,
      updatedAt: p.updatedAt || nowIso,
    }));

    const coachingResources = (input.coachingResources ?? existing?.coachingResources ?? []).map((r) => ({
      id: r.id || `RES-${Date.now()}`,
      title: r.title || 'Ressource',
      description: r.description || '',
      type: r.type || 'Guide',
      category: r.category || 'Ressources',
      thumbnail: r.thumbnail,
      downloadUrl: r.downloadUrl,
      duration: r.duration,
      dataLinks: r.dataLinks ?? [],
      assignedDate: r.assignedDate || nowIso,
      accessedDate: r.accessedDate,
      isCompleted: r.isCompleted ?? false,
    }));

    const notifications = (input.notifications ?? existing?.notifications ?? []).map((n) => ({
      id: n.id || `NOTIF-${Date.now()}`,
      title: n.title || (n.type === 'job' ? `Offre d'emploi` : 'Information'),
      message: n.message || '',
      type: n.type || 'info',
      date: n.date || nowIso,
      isRead: n.isRead ?? false,
      actionUrl: n.actionUrl,
      company: n.company,
      jobTitle: n.jobTitle,
      salary: n.salary,
      contractType: n.contractType,
      contact: n.contact,
      environment: n.environment,
      benefits: n.benefits,
      description: n.description,
      uploadLink: n.uploadLink,
      dataLinks: n.dataLinks,
    }));

    // Compute total progress if possible
    const totalProgress = typeof input.totalProgress === 'number'
      ? input.totalProgress
      : existing?.totalProgress ?? (
        formations.length > 0
          ? Math.round(
              formations.reduce((acc, f) => acc + (f.progress || 0), 0) / formations.length
            )
          : 0
        );

    const enrollmentDate = input.enrollmentDate || existing?.enrollmentDate || nowIso;
    const lastActivity = input.lastActivity || existing?.lastActivity || nowIso;

    const participant: Participant = {
      id: input.id || existing?.id || generateParticipantId(new Set(participants.map(p => p.id))),
      fullName,
      firstName: input.firstName || existing?.firstName || (fullName ? fullName.split(' ')[0] : ''),
      lastName: input.lastName || existing?.lastName || (fullName ? fullName.split(' ').slice(1).join(' ') : ''),
      email: input.email || existing?.email || '',
      phone: input.phone || existing?.phone || '',
      address: input.address || existing?.address || '',
      avatar: input.avatar || existing?.avatar,
      status,
      enrollmentDate,
      lastActivity,
      totalProgress,
      formations,
      projects,
      coachingResources,
      notifications,
      notes: input.notes || existing?.notes,
      createdAt: mode === 'add' ? nowIso : existing?.createdAt || nowIso,
      updatedAt: nowIso,
    };

    return participant;
  };

  const handleViewDetails = (participant: Participant) => {
    setModalMode('view');
    setSelectedParticipant(participant);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setModalMode('add');
    setSelectedParticipant(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (participant: Participant) => {
    setModalMode('edit');
    setSelectedParticipant(participant);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (participant: Participant) => {
    setParticipantToDelete(participant);
    setIsDeleteModalOpen(true);
  };

  // Utility: copy participant ID to clipboard
  const copyIdToClipboard = (id: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(id).then(() => {
          // Optional: feedback
          window.alert('ID copié dans le presse-papiers');
        });
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = id;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
        window.alert('ID copié dans le presse-papiers');
      }
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const handleFormSubmit = (data: Partial<Participant>) => {
    const effectiveMode: 'add' | 'edit' = modalMode === 'add' ? 'add' : 'edit';
    const base: Participant = normalizeParticipant(
      data,
      effectiveMode,
      effectiveMode === 'edit' ? (selectedParticipant as Participant) : undefined
    );

    upsertParticipant(base);
    setParticipants(getAllParticipants());
    // Feedback: show and copy the participant ID after save
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(base.id);
      }
    } catch (err) {
      console.warn('Impossible de copier l\'ID automatiquement:', err);
    }
    window.alert(`Participant sauvegardé. ID: ${base.id} (copié)`);
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (participantToDelete) {
      removeParticipant(participantToDelete.id);
      setParticipants(getAllParticipants());
      setIsDeleteModalOpen(false);
      setParticipantToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'graduated': return 'bg-blue-100 text-blue-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Stats cards removed per request; no mock stats needed here

  return (
    <>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Participants</h1>
            <p className="text-gray-600">Gérez les participants et leurs formations</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddClick}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Ajouter</span>
            </button>
            <button
              onClick={() => {
                const json = exportParticipantsJSON();
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `participants-export-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              }}
              className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              Exporter JSON
            </button>
            <label className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              Importer JSON
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const text = await file.text();
                  const overwrite = window.confirm('Remplacer les données existantes? OK = Remplacer, Annuler = Fusionner');
                  importParticipantsJSON(text, { overwrite });
                  setParticipants(getAllParticipants());
                  e.currentTarget.value = '';
                }}
              />
            </label>
            <button
              onClick={() => {
                if (!window.confirm('Réinitialiser les participants depuis les mocks? Cette action est irréversible.')) return;
                saveAllParticipants(mockParticipantsData);
                setParticipants(getAllParticipants());
              }}
              className="border border-red-300 text-red-700 px-3 py-2 rounded-lg hover:bg-red-50"
            >
              Reset (Mocks)
            </button>
          </div>
        </div>

        {/* Stats Cards removed */}

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou ID..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="graduated">Diplômé</option>
                <option value="suspended">Suspendu</option>
              </select>
            </div>
          </div>
        </div>

        {/* Participants Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formations</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progression</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'inscription</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredParticipants.map((participant) => (
                  <tr key={participant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {participant.avatar ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={participant.avatar} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <UserGroupIcon className="h-6 w-6 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{participant.fullName}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <span>{participant.id}</span>
                            <button
                              type="button"
                              onClick={() => copyIdToClipboard(participant.id)}
                              className="text-blue-600 hover:text-blue-800 text-xs px-2 py-0.5 border border-blue-200 rounded"
                              title="Copier l'ID"
                            >
                              Copier
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{participant.email}</div>
                      <div className="text-sm text-gray-500">{participant.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {participant.formations.length} formation{participant.formations.length > 1 ? 's' : ''}
                      </div>
                      <div className="text-sm text-gray-500">
                        {participant.projects.length} projet{participant.projects.length > 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-900">{participant.totalProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getProgressColor(participant.totalProgress)}`}
                              style={{ width: `${participant.totalProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(participant.status)}`}>
                        {getStatusLabel(participant.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(participant.enrollmentDate).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button onClick={() => handleViewDetails(participant)} className="text-gray-500 hover:text-blue-600">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleEditClick(participant)} className="text-gray-500 hover:text-yellow-600">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDeleteClick(participant)} className="text-gray-500 hover:text-red-600">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Participant Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === 'view' 
            ? "Détails du Participant" 
            : modalMode === 'add' 
              ? 'Ajouter un Participant' 
              : 'Modifier le Participant'
        }
      >
        {modalMode === 'view' && selectedParticipant && (
          <ParticipantDetails participant={selectedParticipant} />
        )}
        {(modalMode === 'add' || modalMode === 'edit') && (
          <ParticipantForm 
            onSubmit={handleFormSubmit} 
            onCancel={() => setIsModalOpen(false)} 
            initialData={selectedParticipant}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmer la Suppression"
      >
        <div className="p-4">
          <p className="text-gray-700">
            Êtes-vous sûr de vouloir supprimer le participant <strong>{participantToDelete?.fullName}</strong> ?
          </p>
          <p className="text-sm text-gray-500 mt-2">Cette action est irréversible.</p>
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Annuler
            </button>
            <button 
              onClick={confirmDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Supprimer
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ParticipantsPage;
