import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/solid';
import { Participant } from '../types/participant';
import { 
  getAll as getAllParticipants, 
  getAllParticipants as getAllParticipantsAPI,
  seedIfEmpty as seedParticipantsIfEmpty, 
  seedParticipantsIfEmpty as seedParticipantsIfEmptyAPI,
  upsert as upsertParticipant, 
  upsertParticipant as upsertParticipantAPI,
  remove as removeParticipant, 
  removeParticipant as removeParticipantAPI,
  exportJSON as exportParticipantsJSON, 
  importJSON as importParticipantsJSON, 
  saveAll as saveAllParticipants 
} from '../services/participantsService';
import Modal from '../components/common/Modal';
import ParticipantForm from '../components/participants/ParticipantForm';
import ParticipantDetails from '../components/participants/ParticipantDetails';
import { mockParticipantsData } from '../data/mockParticipants';

// Add custom CSS for shine animation
const shineKeyframes = `
  @keyframes shine {
    0% { 
      transform: translateX(-100%) skewX(-12deg); 
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% { 
      transform: translateX(300%) skewX(-12deg); 
      opacity: 0;
    }
  }
  
  @keyframes progressGrow {
    0% { 
      width: 0%; 
      opacity: 0.8;
    }
    100% { 
      width: var(--target-width); 
      opacity: 1;
    }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
  }
  
  @keyframes fadeIn {
    0% { opacity: 0; transform: translateY(-5px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  .animate-shine {
    animation: shine 3s infinite ease-in-out;
  }
  
  .animate-progress-grow {
    animation: progressGrow 2s ease-out forwards;
  }
  
  .animate-pulse-custom {
    animation: pulse 2s infinite ease-in-out;
  }
  
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
  }
  
  /* Custom slider styles */
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  
  .slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`;

// Inject styles with better error handling
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('progress-bar-styles');
  if (!existingStyle) {
    try {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'progress-bar-styles';
      styleSheet.type = 'text/css';
      styleSheet.textContent = shineKeyframes;
      document.head.appendChild(styleSheet);
    } catch (error) {
      console.warn('Could not inject progress bar styles:', error);
    }
  }
}

// Animated Progress Bar Component
const AnimatedProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
      setTimeout(() => setIsAnimating(false), 2000);
    }, 300);
    return () => clearTimeout(timer);
  }, [progress]);

  const getProgressColor = (value: number) => {
    if (value >= 90) return 'from-emerald-400 via-emerald-500 to-emerald-600';
    if (value >= 80) return 'from-green-400 via-green-500 to-green-600';
    if (value >= 70) return 'from-blue-400 via-blue-500 to-blue-600';
    if (value >= 60) return 'from-cyan-400 via-cyan-500 to-cyan-600';
    if (value >= 50) return 'from-yellow-400 via-yellow-500 to-yellow-600';
    if (value >= 30) return 'from-orange-400 via-orange-500 to-orange-600';
    if (value >= 10) return 'from-red-400 via-red-500 to-red-600';
    return 'from-gray-400 via-gray-500 to-gray-600';
  };

  const getProgressLabel = (value: number) => {
    if (value >= 90) return 'Excellent';
    if (value >= 80) return 'Très bien';
    if (value >= 70) return 'Bien';
    if (value >= 60) return 'Satisfaisant';
    if (value >= 50) return 'Moyen';
    if (value >= 30) return 'En cours';
    if (value >= 10) return 'Débutant';
    return 'Non commencé';
  };

  const progressBarStyle = {
    '--target-width': `${animatedProgress}%`
  } as React.CSSProperties;

  return (
    <div 
      className="flex items-center space-x-3 cursor-pointer transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-900 font-semibold">{progress}%</span>
          {isHovered && (
            <span className="text-xs text-gray-600 font-medium animate-fade-in">
              {getProgressLabel(progress)}
            </span>
          )}
        </div>
        
        <div className={`relative w-full bg-gray-200 rounded-full overflow-hidden shadow-inner transition-all duration-300 ${isHovered ? 'h-4 shadow-lg' : 'h-3'}`}>
          {/* Background track with subtle pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
          
          {/* Main progress bar */}
          <div 
            className={`h-full rounded-full relative overflow-hidden bg-gradient-to-r ${getProgressColor(progress)} shadow-sm transition-all duration-1000 ease-out ${isHovered ? 'shadow-lg scale-y-110' : ''}`}
            style={{ 
              width: `${animatedProgress}%`,
              transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease'
            }}
          >
            {/* Animated shine effect */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-shine"
              style={{ width: '40%' }}
            ></div>
            
            {/* Pulse effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse-custom"></div>
            
            {/* Extra glow on hover */}
            {isHovered && (
              <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
            )}
          </div>
          
          {/* Progress percentage text */}
          {progress > 20 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white drop-shadow-lg">
                {progress}%
              </span>
            </div>
          )}
          
          {/* End indicator */}
          {progress > 0 && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <div className={`w-2 h-2 rounded-full bg-white shadow-sm ${isAnimating || isHovered ? 'animate-ping' : 'opacity-80'}`}></div>
            </div>
          )}
          
          {/* Progress milestones */}
          <div className="absolute inset-0 flex items-center">
            {[25, 50, 75].map((milestone) => (
              <div 
                key={milestone}
                className="absolute w-0.5 h-full bg-white opacity-30"
                style={{ left: `${milestone}%` }}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Mini progress info on hover */}
        {isHovered && progress > 0 && (
          <div className="mt-1 text-xs text-gray-500 animate-fade-in">
            <div className="flex justify-between">
              <span>Progression</span>
              <span>{progress}/100</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ParticipantsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'add' | 'edit'>('view');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [participantToDelete, setParticipantToDelete] = useState<Participant | null>(null);
  const [participantToUpdateProgress, setParticipantToUpdateProgress] = useState<Participant | null>(null);
  const [newProgressValue, setNewProgressValue] = useState<number>(0);
  const [newCompletedCourses, setNewCompletedCourses] = useState<number>(0);
  const [newStudyTime, setNewStudyTime] = useState<number>(0);
  const [newAchievedGoals, setNewAchievedGoals] = useState<number>(0);
  const [newTotalGoals, setNewTotalGoals] = useState<number>(6);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatedParticipantId, setUpdatedParticipantId] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Load participants from API on component mount
  useEffect(() => {
    const loadParticipants = async () => {
      setIsLoading(true);
      try {
        // Try to load from API first
        const apiParticipants = await getAllParticipantsAPI();
        setParticipants(apiParticipants);
        
        // Auto-seeding disabled to prevent mock data in production
        // if (apiParticipants.length === 0) {
        //   await seedParticipantsIfEmptyAPI(mockParticipantsData);
        //   const seededParticipants = await getAllParticipantsAPI();
        //   setParticipants(seededParticipants);
        // }
      } catch (error) {
        console.error('Failed to load participants from API, using localStorage:', error);
        // Fallback to localStorage
        seedParticipantsIfEmpty(mockParticipantsData);
        setParticipants(getAllParticipants());
      } finally {
        setIsLoading(false);
      }
    };

    loadParticipants();
  }, []);

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
      const matchesSearch = (participant.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (participant.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (participant.id || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || (participant.status || 'active') === statusFilter;
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
      projectUrl: p.projectUrl || '', // ✅ CRITICAL: Preserve projectUrl field
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

  const handleProgressClick = (participant: Participant) => {
    setParticipantToUpdateProgress(participant);
    setNewProgressValue(participant.totalProgress || 0);
    
    // Load current values from participant data
    setNewCompletedCourses(participant.completedCourses || 0);
    setNewStudyTime(participant.studyTime || 0);
    setNewAchievedGoals(participant.achievedGoals || 0);
    setNewTotalGoals(participant.totalGoals || 6);
    
    console.log('📊 Loading progress modal with values:', {
      totalProgress: participant.totalProgress,
      completedCourses: participant.completedCourses,
      studyTime: participant.studyTime,
      achievedGoals: participant.achievedGoals,
      totalGoals: participant.totalGoals
    });
    
    setIsProgressModalOpen(true);
  };

  const handleProgressUpdate = async () => {
    if (!participantToUpdateProgress) return;

    const updatedParticipant = {
      ...participantToUpdateProgress,
      totalProgress: newProgressValue,
      completedCourses: newCompletedCourses,
      studyTime: newStudyTime,
      achievedGoals: newAchievedGoals,
      totalGoals: newTotalGoals,
      updatedAt: new Date().toISOString()
    };

    try {
      console.log('🔄 Updating participant:', updatedParticipant.id);
      
      // Try API first
      const result = await upsertParticipantAPI(updatedParticipant);
      console.log('✅ API update successful:', result);
      
      // Force immediate update of the participants list
      setParticipants(prevParticipants => {
        return prevParticipants.map(p => 
          p.id === updatedParticipant.id ? { ...p, ...updatedParticipant } : p
        );
      });
      
      // Also update the modal participant data
      setParticipantToUpdateProgress(updatedParticipant);
      
      // Add visual feedback
      setUpdatedParticipantId(updatedParticipant.id);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setUpdatedParticipantId(null);
        setShowSuccessMessage(false);
      }, 3000);
      
      // Also reload from API to ensure consistency
      setTimeout(async () => {
        try {
          const freshParticipants = await getAllParticipantsAPI();
          setParticipants(freshParticipants);
          console.log('✅ Participants list refreshed from API');
        } catch (error) {
          console.warn('Failed to refresh from API, using current state');
        }
      }, 100);
      
      console.log('✅ Immediate UI update completed');
    } catch (error) {
      console.error('❌ API failed, using localStorage:', error);
      
      // Fallback to localStorage
      upsertParticipant(updatedParticipant);
      
      // Force immediate update of the participants list
      setParticipants(prevParticipants => {
        return prevParticipants.map(p => 
          p.id === updatedParticipant.id ? { ...p, ...updatedParticipant } : p
        );
      });
      
      // Also update the modal participant data
      setParticipantToUpdateProgress(updatedParticipant);
      
      // Add visual feedback
      setUpdatedParticipantId(updatedParticipant.id);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setUpdatedParticipantId(null);
        setShowSuccessMessage(false);
      }, 3000);
      
      console.log('✅ Updated using localStorage with immediate UI update');
    }

    // Close modal and reset
    setIsProgressModalOpen(false);
    setParticipantToUpdateProgress(null);
    setNewProgressValue(0);
    setNewCompletedCourses(0);
    setNewStudyTime(0);
    setNewAchievedGoals(0);
    setNewTotalGoals(6);
    
    console.log('✅ Progress update completed');
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

  const handleFormSubmit = async (data: Partial<Participant>) => {
    const effectiveMode: 'add' | 'edit' = modalMode === 'add' ? 'add' : 'edit';
    const base: Participant = normalizeParticipant(
      data,
      effectiveMode,
      effectiveMode === 'edit' ? (selectedParticipant as Participant) : undefined
    );

    try {
      // Try API first
      await upsertParticipantAPI(base);
      const updatedParticipants = await getAllParticipantsAPI();
      setParticipants(updatedParticipants);
    } catch (error) {
      console.error('API failed, using localStorage:', error);
      // Fallback to localStorage
      upsertParticipant(base);
      setParticipants(getAllParticipants());
    }

    // Feedback: show and copy the participant ID after save
    let copyMessage = '';
    try {
      // Focus the window first to ensure clipboard access
      window.focus();
      
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(base.id);
        copyMessage = ' (copié)';
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = base.id;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        copyMessage = ' (copié)';
      }
    } catch (err) {
      console.warn('Impossible de copier l\'ID automatiquement:', err);
      copyMessage = ' (cliquez pour copier)';
    }
    
    // Show success message with copy status
    const message = `Participant sauvegardé. ID: ${base.id}${copyMessage}`;
    window.alert(message);
    setIsModalOpen(false);
  };

  const confirmDelete = async () => {
    if (participantToDelete) {
      try {
        // Try API first
        await removeParticipantAPI(participantToDelete.id);
        const updatedParticipants = await getAllParticipantsAPI();
        setParticipants(updatedParticipants);
      } catch (error) {
        console.error('API failed, using localStorage:', error);
        // Fallback to localStorage
        removeParticipant(participantToDelete.id);
        setParticipants(getAllParticipants());
      }
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

  // Stats cards removed per request; no mock stats needed here

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des participants...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center animate-fade-in">
            <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-green-800">Mise à jour réussie!</h3>
              <p className="text-sm text-green-700">Les données du participant ont été mises à jour avec succès.</p>
            </div>
            <button 
              onClick={() => setShowSuccessMessage(false)}
              className="ml-auto text-green-600 hover:text-green-800"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

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
                  <tr 
                    key={participant.id} 
                    className={`hover:bg-gray-50 transition-all duration-300 ${
                      updatedParticipantId === participant.id 
                        ? 'bg-green-50 border-l-4 border-green-500 animate-pulse' 
                        : ''
                    }`}
                  >
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
                          <div className="text-sm font-medium text-gray-900">{participant.fullName || 'Nom non défini'}</div>
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
                      <div className="text-sm text-gray-900">{participant.email || 'Email non défini'}</div>
                      <div className="text-sm text-gray-500">{participant.phone || 'Téléphone non défini'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {(participant.formations?.length || 0)} formation{(participant.formations?.length || 0) > 1 ? 's' : ''}
                      </div>
                      <div className="text-sm text-gray-500">
                        {(participant.projects?.length || 0)} projet{(participant.projects?.length || 0) > 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <AnimatedProgressBar progress={participant.totalProgress || 0} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(participant.status || 'active')}`}>
                        {getStatusLabel(participant.status || 'active')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(participant.enrollmentDate || participant.createdAt || new Date()).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleViewDetails(participant)} 
                          className="text-gray-500 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors"
                          title="Voir les détails"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleProgressClick(participant)} 
                          className="text-gray-500 hover:text-green-600 p-1 rounded-full hover:bg-green-50 transition-colors"
                          title="Modifier le progrès"
                        >
                          <ChartBarIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditClick(participant)} 
                          className="text-gray-500 hover:text-yellow-600 p-1 rounded-full hover:bg-yellow-50 transition-colors"
                          title="Modifier"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(participant)} 
                          className="text-gray-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-4 w-4" />
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

      {/* Progress Update Modal */}
      <Modal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        title="Modifier le Progrès"
      >
        {participantToUpdateProgress && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                {participantToUpdateProgress.avatar ? (
                  <img 
                    src={participantToUpdateProgress.avatar} 
                    alt={participantToUpdateProgress.fullName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                    <UserGroupIcon className="w-8 h-8 text-gray-600" />
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {participantToUpdateProgress.fullName}
              </h3>
              <p className="text-sm text-gray-500">{participantToUpdateProgress.id}</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progrès actuel: {participantToUpdateProgress.totalProgress || 0}%
                </label>
                <AnimatedProgressBar progress={participantToUpdateProgress.totalProgress || 0} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau progrès: {newProgressValue}%
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newProgressValue}
                    onChange={(e) => setNewProgressValue(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${newProgressValue}%, #e5e7eb ${newProgressValue}%, #e5e7eb 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
                <AnimatedProgressBar progress={newProgressValue} />
              </div>

              <div className="grid grid-cols-5 gap-2 mt-4">
                {[0, 25, 50, 75, 100].map((value) => (
                  <button
                    key={value}
                    onClick={() => setNewProgressValue(value)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      newProgressValue === value
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {value}%
                  </button>
                ))}
              </div>

              {/* Additional Statistics */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Statistiques détaillées</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Cours terminés */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cours terminés
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={newCompletedCourses}
                        onChange={(e) => setNewCompletedCourses(parseInt(e.target.value) || 0)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex space-x-1">
                        {[0, 5, 10, 15].map((value) => (
                          <button
                            key={value}
                            onClick={() => setNewCompletedCourses(value)}
                            className={`px-2 py-1 text-xs rounded border transition-colors ${
                              newCompletedCourses === value
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Temps d'étude */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temps d'étude (heures)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="500"
                        value={newStudyTime}
                        onChange={(e) => setNewStudyTime(parseInt(e.target.value) || 0)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex space-x-1">
                        {[0, 25, 50, 100].map((value) => (
                          <button
                            key={value}
                            onClick={() => setNewStudyTime(value)}
                            className={`px-2 py-1 text-xs rounded border transition-colors ${
                              newStudyTime === value
                                ? 'bg-green-500 text-white border-green-500'
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {value}h
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Objectifs atteints */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Objectifs atteints
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max={newTotalGoals}
                        value={newAchievedGoals}
                        onChange={(e) => setNewAchievedGoals(Math.min(parseInt(e.target.value) || 0, newTotalGoals))}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-500">/</span>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={newTotalGoals}
                        onChange={(e) => {
                          const total = parseInt(e.target.value) || 6;
                          setNewTotalGoals(total);
                          if (newAchievedGoals > total) {
                            setNewAchievedGoals(total);
                          }
                        }}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-300"
                          style={{ width: `${newTotalGoals > 0 ? (newAchievedGoals / newTotalGoals) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {newTotalGoals > 0 ? Math.round((newAchievedGoals / newTotalGoals) * 100) : 0}% des objectifs atteints
                      </p>
                    </div>
                  </div>

                  {/* Auto-calculate button */}
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        const calculatedStudyTime = newCompletedCourses * 5;
                        setNewStudyTime(calculatedStudyTime);
                        setNewAchievedGoals(Math.min(newCompletedCourses, newTotalGoals));
                      }}
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
                    >
                      📊 Calculer automatiquement
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => setIsProgressModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleProgressUpdate}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mettre à jour
              </button>
            </div>
          </div>
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
