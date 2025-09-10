import { useState } from "react";
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
import { mockFormations } from "../../data/participantData";
import { Formation, Course } from "../../types/participant";

interface MesFormationsProps {
  participantId?: string;
  onNavigate: (page: string) => void;
}

const MesFormations = ({ onNavigate }: MesFormationsProps) => {
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(
    null
  );
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

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
          {/* Progress Bar */}
          <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Progression du cours</h2>
              <span className="text-2xl font-bold text-blue-600">
                {selectedCourse.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${selectedCourse.progress}%` }}
                transition={{ duration: 1 }}
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
              ></motion.div>
            </div>
          </div>

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
            <h2 className="text-xl font-semibold text-gray-900">
              Cours de la formation
            </h2>
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
              <h1 className="text-2xl font-bold text-gray-900">Mes Formations</h1>
              <p className="text-gray-600">
                Accédez à vos formations et suivez votre progression
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {mockFormations.map((formation, index) => (
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
      </div>
    </div>
  );
};

export default MesFormations;
