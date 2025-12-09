import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Play,
  CheckCircle,
  Lock,
  Clock,
  ArrowLeft,
  FileText,
  Video,
  HelpCircle,
  Folder,
  Download,
  PlayCircle,
  PenTool,
} from "lucide-react";
import { Formation, Course } from "../../types/participant";
import { participantApiService, ApiFormation } from "../../services/participantApiService";

interface MesFormationsProps {
  participantId?: string;
  onNavigate: (page: string) => void;
}

const MesFormations = ({ participantId, onNavigate }: MesFormationsProps) => {
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(
    null
  );
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to transform API formation to frontend format
  const transformApiFormation = (apiFormation: ApiFormation): Formation => {
    // Transform courses to include sessions
    const transformedCourses = (apiFormation.courses || []).map((course: any) => ({
      ...course,
      sessions: course.sessions || [] // Ensure sessions are included
    }));

    return {
      id: apiFormation._id,
      title: apiFormation.title,
      description: apiFormation.description,
      domain: apiFormation.domain,
      level: apiFormation.level as 'Débutant' | 'Intermédiaire' | 'Avancé',
      duration: apiFormation.duration,
      progress: apiFormation.progress || 0,
      totalCourses: transformedCourses.length || 0,
      completedCourses: transformedCourses.filter((course: any) => course.isCompleted).length || 0,
      courses: transformedCourses,
      thumbnail: apiFormation.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop'
    };
  };

  // Load formations from API
  useEffect(() => {
    const loadFormations = async () => {
      if (!participantId) {
        console.warn('🚨 MesFormations: participantId manquant');
        setError('ID participant manquant');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log('🔄 MesFormations: Chargement formations pour participant:', participantId);
        
        // Try to get formations directly
        const apiFormations = await participantApiService.getFormations(participantId);
        console.log('📚 MesFormations: Formations reçues de l\'API:', apiFormations);

        if (apiFormations && apiFormations.length > 0) {
          const transformedFormations = apiFormations.map(transformApiFormation);
          setFormations(transformedFormations);
          console.log('✅ MesFormations: Formations transformées:', transformedFormations);
        } else {
          // Fallback: try to get participant data and extract formations
          console.log('🔄 MesFormations: Tentative récupération via participant data...');
          const participant = await participantApiService.getParticipant(participantId);
          
          if (participant && participant.formations && participant.formations.length > 0) {
            const transformedFormations = participant.formations.map(transformApiFormation);
            setFormations(transformedFormations);
            console.log('✅ MesFormations: Formations extraites du participant:', transformedFormations);
          } else {
            console.log('⚠️ MesFormations: Aucune formation trouvée pour ce participant');
            setFormations([]);
          }
        }
      } catch (error) {
        console.error('❌ MesFormations: Erreur lors du chargement des formations:', error);
        setError('Erreur lors du chargement des formations');
        setFormations([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFormations();
  }, [participantId]);

  const getModuleIcon = (type: string) => {
    switch (type) {
      case "video":
        return Video;
      case "document":
        return FileText;
      case "quiz":
        return HelpCircle;
      case "project":
        return Folder;
      default:
        return Play;
    }
  };

  const getStatusColor = (isCompleted: boolean, isLocked: boolean) => {
    if (isLocked) return "text-gray-400";
    if (isCompleted) return "text-green-600";
    return "text-blue-600";
  };

  const getStatusBg = (isCompleted: boolean, isLocked: boolean) => {
    if (isLocked) return "bg-gray-100";
    if (isCompleted) return "bg-green-50";
    return "bg-blue-50";
  };

  // Vue des modules d'un cours
  if (selectedCourse) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedCourse(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedCourse.title}
                </h1>
                <p className="text-gray-600">{selectedCourse.description}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Sessions List */}
          {selectedCourse.sessions && selectedCourse.sessions.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg border border-blue-100 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  🎯 Votre Parcours
                </h2>
                <div className="bg-white px-4 py-2 rounded-full shadow-sm border">
                  <span className="text-sm font-medium text-gray-600">
                    {selectedCourse.sessions.length} session{selectedCourse.sessions.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              <div className="space-y-6">
                {selectedCourse.sessions.map((session, sessionIndex) => (
                  <motion.div 
                    key={session.id || sessionIndex} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: sessionIndex * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300"
                    style={{ perspective: 1000 }}
                    whileHover={{ rotateX: 1, rotateY: -1, translateZ: 0 }}
                  >
                    {/* Session Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">S{sessionIndex + 1}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{session.title}</h3>
                        </div>
                      </div>
                    </div>
                    
                    {session.description && (
                      <div className="bg-gray-50 rounded-xl p-4 mb-4 border-l-4 border-blue-400">
                        <p className="text-gray-700 leading-relaxed">{session.description}</p>
                      </div>
                    )}
                    
                    {/* Session Links */}
                    {session.links && session.links.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-800">Contenus disponibles</h4>
                          <div className="bg-blue-100 px-3 py-1 rounded-full">
                            <span className="text-xs font-medium text-blue-700">{session.links.length} lien{session.links.length > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {session.links.map((link, linkIndex) => (
                            <motion.a
                              key={link.id || linkIndex}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: linkIndex * 0.1 }}
                              whileHover={{ scale: 1.03, rotateY: 2 }}
                              whileTap={{ scale: 0.97 }}
                              className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 hover:from-blue-50 hover:to-indigo-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-lg"
                            >
                              <div className="flex items-center space-x-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110 ${
                                  link.type === 'video' ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                                  link.type === 'document' ? 'bg-gradient-to-r from-orange-500 to-yellow-500' :
                                  link.type === 'resource' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                                  link.type === 'exercise' ? 'bg-gradient-to-r from-purple-500 to-indigo-500' :
                                  'bg-gradient-to-r from-blue-500 to-cyan-500'
                                }`}>
                                  {link.type === 'video' && <PlayCircle className="w-6 h-6 text-white" />}
                                  {link.type === 'document' && <FileText className="w-6 h-6 text-white" />}
                                  {link.type === 'resource' && <Download className="w-6 h-6 text-white" />}
                                  {link.type === 'exercise' && <PenTool className="w-6 h-6 text-white" />}
                                  {!['video', 'document', 'resource', 'exercise'].includes(link.type) && (
                                    <Play className="w-6 h-6 text-white" />
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors truncate mb-1">
                                    {link.title || 'Lien de session'}
                                  </h5>
                                  <div className="flex items-center space-x-2">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      link.type === 'video' ? 'bg-red-100 text-red-700' :
                                      link.type === 'document' ? 'bg-orange-100 text-orange-700' :
                                      link.type === 'resource' ? 'bg-green-100 text-green-700' :
                                      link.type === 'exercise' ? 'bg-purple-100 text-purple-700' :
                                      'bg-blue-100 text-blue-700'
                                    }`}>
                                      {link.type === 'video' ? '🎥 Vidéo' :
                                       link.type === 'document' ? '📄 Document' :
                                       link.type === 'resource' ? '📚 Ressource' :
                                       link.type === 'exercise' ? '✏️ Exercice' :
                                       '🔗 Lien'}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </div>
                              </div>
                              
                              {/* Hover overlay */}
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                            </motion.a>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Modules List */}
          <div className="space-y-4">
            {selectedCourse.modules.map((module, index) => {
              const ModuleIcon = getModuleIcon(module.type);

              return (
                <div key={module.id} style={{ perspective: 1000 }}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    whileHover={module.isLocked ? undefined : { rotateX: 2.5, rotateY: -2.5 }}
                    whileTap={module.isLocked ? undefined : { scale: 0.99 }}
                    style={{ transformStyle: 'preserve-3d' }}
                    className={`bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-all duration-300 ${
                      module.isLocked ? "opacity-60" : "cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatusBg(
                            module.isCompleted,
                            module.isLocked
                          )}`}
                          style={{ transform: 'translateZ(18px)' }}
                        >
                          {module.isLocked ? (
                            <Lock className="w-6 h-6 text-gray-400" />
                          ) : module.isCompleted ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <ModuleIcon
                              className={`w-6 h-6 ${getStatusColor(
                                module.isCompleted,
                                module.isLocked
                              )}`}
                            />
                          )}
                        </div>
                        <div className="flex-1" style={{ transform: 'translateZ(16px)' }}>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {module.title}
                          </h3>
                        </div>
                      </div>

                      {!module.isLocked && (
                        <div className="flex flex-col sm:flex-row items-end space-y-2 sm:space-y-0 sm:space-x-3" style={{ transform: 'translateZ(14px)' }}>
                          {/* Bouton principal Accéder/Résumer */}
                          <motion.button
                            whileHover={{ scale: 1.04, x: 1 }}
                            whileTap={{ scale: 0.97 }}
                            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                              module.isCompleted
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                            }`}
                          >
                            {module.isCompleted ? "Résumer" : "Accéder"}
                          </motion.button>

                          {/* Boutons ressources */}
                          <div className="flex items-center space-x-2">
                            {/* Enregistrement vidéo */}
                            <motion.button
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors group relative"
                              title="Enregistrement vidéo"
                              style={{ transform: 'translateZ(12px)' }}
                            >
                              <PlayCircle className="w-5 h-5" />
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Enregistrement vidéo
                              </span>
                            </motion.button>

                            {/* Support PDF */}
                            <motion.button
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors group relative"
                              title="Support PDF"
                              style={{ transform: 'translateZ(12px)' }}
                            >
                              <Download className="w-5 h-5" />
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Support PDF
                              </span>
                            </motion.button>

                            {/* Exercices (QCM / Étude de cas) */}
                            <motion.button
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors group relative"
                              title="Exercices (QCM / Étude de cas)"
                              style={{ transform: 'translateZ(12px)' }}
                            >
                              <PenTool className="w-5 h-5" />
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Exercices
                              </span>
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Vue des cours d'une formation
  if (selectedFormation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedFormation(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedFormation.title}
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Courses List */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Vos Modules
              </h2>
              <p className="text-gray-600">
                Retrouvez ici toutes les étapes de votre parcours
              </p>
            </div>
            {selectedFormation.courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.06 }}
                onClick={() => setSelectedCourse(course)}
                className="bg-white rounded-xl p-5 border hover:bg-gray-50 hover:border-blue-200 transition-colors duration-200 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center">
                      {/* Unified icon for all courses */}
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {course.title}
                      </h3>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-4 py-2 rounded-lg font-medium border border-blue-200 text-blue-700 bg-white hover:bg-blue-50 transition-colors"
                  >
                    Accéder
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Vue principale des formations
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mes Parcours</h1>
              <p className="text-gray-600">
                Accédez à vos parcours personnalisés et suivez votre progression étape par étape
              </p>
            </div>
            <button
              onClick={() => onNavigate("dashboard")}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Chargement des formations...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* No Formations State */}
        {!isLoading && !error && formations.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune formation</h3>
            <p className="mt-1 text-sm text-gray-500">
              Vous n'avez pas encore de formations assignées.
            </p>
          </div>
        )}

        {/* Formations Grid */}
        {!isLoading && !error && formations.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {formations.map((formation, index) => (
              <div key={formation.id} style={{ perspective: 1000 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
                  whileHover={{ rotateX: 3, rotateY: -3, translateZ: 0 }}
                  whileTap={{ scale: 0.99, rotateX: 0 }}
                  onClick={() => setSelectedFormation(formation)}
                  style={{ transformStyle: 'preserve-3d' }}
                  className="bg-white rounded-xl shadow-sm border hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
              >
                <div className="h-48 relative overflow-hidden" style={{ transform: 'translateZ(20px)' }}>
                  <img
                    src={formation.thumbnail}
                    alt={formation.title}
                    className="w-full h-full object-cover opacity-85 group-hover:scale-110 transition-transform duration-500 will-change-transform"
                  />
                  <div className="absolute top-4 right-4" style={{ transform: 'translateZ(30px)' }}>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        formation.level === 'Débutant'
                          ? 'bg-green-100 text-green-800'
                          : formation.level === 'Intermédiaire'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {formation.level}
                    </span>
                  </div>
                </div>

                <div className="p-6" style={{ transform: 'translateZ(25px)' }}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {formation.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 truncate">
                    {formation.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                        {formation.domain}
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formation.duration}</span>
                      </span>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.06, x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center space-x-1 text-blue-600 font-medium transition-transform duration-200"
                      style={{ transform: 'translateZ(25px)' }}
                    >
                      <span>Continuer</span>
                      <Play className="w-4 h-4" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MesFormations;
