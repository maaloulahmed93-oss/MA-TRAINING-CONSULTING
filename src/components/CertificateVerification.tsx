import React, { useEffect, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
  Star,
  Award,
  BookOpen,
  Code,
  Database,
  Palette,
  RefreshCw,
} from "lucide-react";
import {
  getAll as getAllCertificates,
  getById as getCertificateById,
  seedIfEmpty,
  type Certificate,
} from "../services/certificatesService";

// Using shared Certificate type from service

interface CertificateVerificationProps {
  isOpen: boolean;
  onClose: () => void;
}

// Default certificates used to seed localStorage (only if empty)
const DEFAULT_CERTIFICATES: Certificate[] = [
  {
    id: "CERT-2024-001",
    firstName: "Ahmed",
    lastName: "Benali",
    program: "Développement Web Full Stack",
    skills: ["React", "Node.js", "MongoDB", "TypeScript"],
    techniques: [
      "API REST",
      "Authentication JWT",
      "Responsive Design",
      "Git/GitHub",
    ],
    grade: 18.5,
    level: "Avancé",
    certificateUrl: "#certificate-001",
    recommendationUrl: "#recommendation-001",
    evaluationUrl: "#evaluation-001",
    completionDate: "2024-01-15",
  },
  {
    id: "CERT-2024-002",
    firstName: "Fatima",
    lastName: "El Mansouri",
    program: "Design UX/UI Professionnel",
    skills: ["Figma", "Adobe XD", "Prototypage", "User Research"],
    techniques: [
      "Design System",
      "Wireframing",
      "User Testing",
      "Design Thinking",
    ],
    grade: 16.8,
    level: "Intermédiaire",
    certificateUrl: "#certificate-002",
    recommendationUrl: "#recommendation-002",
    evaluationUrl: "#evaluation-002",
    completionDate: "2024-02-20",
  },
  {
    id: "CERT-2024-003",
    firstName: "Omar",
    lastName: "Rachidi",
    program: "Data Science & Intelligence Artificielle",
    skills: ["Python", "Machine Learning", "TensorFlow", "Pandas"],
    techniques: [
      "Data Visualization",
      "Deep Learning",
      "NLP",
      "Statistical Analysis",
    ],
    grade: 19.2,
    level: "Expert",
    certificateUrl: "#certificate-003",
    recommendationUrl: "#recommendation-003",
    evaluationUrl: "#evaluation-003",
    completionDate: "2024-03-10",
  },
];

const CertificateVerification: React.FC<CertificateVerificationProps> = ({
  isOpen,
  onClose,
}) => {
  const [certificateId, setCertificateId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [error, setError] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [allIds, setAllIds] = useState<string[]>([]);

  // Seed defaults once and load example IDs
  useEffect(() => {
    try {
      seedIfEmpty(DEFAULT_CERTIFICATES);
      const list = getAllCertificates();
      setAllIds(list.map((c) => c.id));
    } catch {
      // ignore
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === "matc_certificates") {
        const list = getAllCertificates();
        setAllIds(list.map((c) => c.id));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleVerify = async () => {
    if (!certificateId.trim()) {
      setError("Veuillez saisir un ID d'attestation");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Call the real API instead of localStorage
      const response = await fetch(`https://matc-backend.onrender.com/api/attestations/verify/${certificateId.trim()}`);
      const data = await response.json();
      
      if (response.ok && data.valid && data.data) {
        // Transform API data to match Certificate interface
        const transformedCertificate: Certificate = {
          id: data.data.attestationId,
          firstName: data.data.fullName.split(' ')[0] || data.data.fullName,
          lastName: data.data.fullName.split(' ').slice(1).join(' ') || '',
          program: data.data.program?.title || 'Programme non spécifié',
          skills: data.data.skills || [],
          techniques: data.data.techniques || [],
          grade: data.data.note || 0,
          level: data.data.niveau || 'Non spécifié',
          certificateUrl: `https://matc-backend.onrender.com/api/attestations/${data.data.attestationId}/download/attestation`,
          recommendationUrl: `https://matc-backend.onrender.com/api/attestations/${data.data.attestationId}/download/recommandation`,
          evaluationUrl: `https://matc-backend.onrender.com/api/attestations/${data.data.attestationId}/download/evaluation`,
          completionDate: new Date(data.data.dateObtention).toLocaleDateString('fr-FR')
        };
        
        setCertificate(transformedCertificate);
        setShowResult(true);
      } else {
        // Fallback to localStorage for backward compatibility
        const foundCertificate = getCertificateById(certificateId.trim());
        if (foundCertificate) {
          setCertificate(foundCertificate);
          setShowResult(true);
        } else {
          setError("Attestation non trouvée. Vérifiez l'ID saisi.");
        }
      }
    } catch (error) {
      console.error('Error verifying attestation:', error);
      // Fallback to localStorage on network error
      const foundCertificate = getCertificateById(certificateId.trim());
      if (foundCertificate) {
        setCertificate(foundCertificate);
        setShowResult(true);
      } else {
        setError("Erreur de connexion. Vérifiez votre connexion internet.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSearch = () => {
    setCertificateId("");
    setCertificate(null);
    setError("");
    setShowResult(false);
  };

  const handleDownload = async (url: string, type: string) => {
    try {
      if (url.startsWith('https://matc-backend.onrender.com/api/attestations/')) {
        // Open API URL so the browser follows 302 redirect to Cloudinary
        window.open(url, '_blank', 'noopener');
      } else {
        // Simulation du téléchargement pour les données mockées
        console.log(`Téléchargement ${type}: ${url}`);
        alert(`Téléchargement de ${type} en cours...`);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert(`Erreur lors du téléchargement du document ${type}`);
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 18) return "bg-green-500";
    if (grade >= 16) return "bg-blue-500";
    if (grade >= 14) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Expert":
        return "bg-purple-500";
      case "Avancé":
        return "bg-green-500";
      case "Intermédiaire":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getSkillIcon = (skill: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      React: <Code className="w-4 h-4" />,
      "Node.js": <Database className="w-4 h-4" />,
      MongoDB: <Database className="w-4 h-4" />,
      TypeScript: <Code className="w-4 h-4" />,
      Figma: <Palette className="w-4 h-4" />,
      "Adobe XD": <Palette className="w-4 h-4" />,
      Python: <Code className="w-4 h-4" />,
      "Machine Learning": <BookOpen className="w-4 h-4" />,
      TensorFlow: <BookOpen className="w-4 h-4" />,
      Pandas: <BookOpen className="w-4 h-4" />,
    };
    return iconMap[skill] || <Award className="w-4 h-4" />;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        {/* Inject minimal mobile CSS for modal sizing */}
        <div dangerouslySetInnerHTML={{ __html: `
          <style>
            @media (max-width: 640px) {
              .cv-modal { max-width: 90% !important; width: 100%; margin: 0 auto; }
              .cv-body { padding: 16px !important; }
              .cv-scroll { max-height: calc(90vh - 96px) !important; }
            }
          </style>
        `}} />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="cv-modal bg-white rounded-2xl shadow-2xl w-full sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Vérification de Participation
                </h2>
                <p className="text-gray-600">
                  Validez la participation d'un candidat et les documents internes délivrés dans le cadre de son parcours professionnel.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="cv-body p-4 sm:p-6">
            <AnimatePresence mode="wait">
              {!showResult ? (
                <motion.div
                  key="search-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Formulaire de recherche */}
                  <div className="text-center space-y-4">
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <Search className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Rechercher une attestation
                      </h3>
                      <p className="text-gray-600">
                        Saisissez l'ID de votre attestation pour vérifier son
                        authenticité
                      </p>
                    </div>

                    <div className="max-w-md mx-auto">
                      <div className="relative">
                        <input
                          type="text"
                          value={certificateId}
                          onChange={(e) => setCertificateId(e.target.value)}
                          placeholder="Ex: CERT-2024-001"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center font-mono text-base sm:text-lg"
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleVerify()
                          }
                        />
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center space-x-2 text-red-600 mt-3 p-3 bg-red-50 rounded-lg"
                        >
                          <AlertCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">{error}</span>
                        </motion.div>
                      )}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleVerify}
                      disabled={isLoading}
                      className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mx-auto"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Vérification en cours...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-5 h-5" />
                          <span>Vérifier</span>
                        </>
                      )}
                    </motion.button>

                    {/* Exemples d'IDs (depuis localStorage) */}
                    <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        IDs d'exemple pour test :
                      </h4>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {allIds.map((id) => (
                          <button
                            key={id}
                            onClick={() => setCertificateId(id)}
                            className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm font-mono hover:bg-blue-50 hover:border-blue-300 transition-colors"
                          >
                            {id}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                certificate && (
                  <motion.div
                    key="certificate-result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* En-tête de succès */}
                    <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                      >
                        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-green-800 mb-2">
                        Attestation Vérifiée ✓
                      </h3>
                      <p className="text-green-700">
                        Cette attestation est authentique et valide
                      </p>
                    </div>

                    {/* Informations du certificat */}
                    <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                      {/* Informations personnelles */}
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Award className="w-5 h-5 mr-2 text-blue-600" />
                          Informations du titulaire
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm text-gray-600">
                              Nom complet
                            </span>
                            <p className="font-semibold text-gray-900">
                              {certificate.firstName} {certificate.lastName}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">
                              Programme suivi
                            </span>
                            <p className="font-semibold text-gray-900">
                              {certificate.program}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">
                              Date d'obtention
                            </span>
                            <p className="font-semibold text-gray-900">
                              {new Date(
                                certificate.completionDate
                              ).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Évaluation */}
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Star className="w-5 h-5 mr-2 text-yellow-600" />
                          Évaluation
                        </h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Note obtenue
                            </span>
                            <div
                              className={`px-3 py-1 rounded-full text-white font-bold ${getGradeColor(
                                certificate.grade
                              )}`}
                            >
                              {certificate.grade}/20
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Niveau
                            </span>
                            <div
                              className={`px-3 py-1 rounded-full text-white font-semibold text-sm ${getLevelColor(
                                certificate.level
                              )}`}
                            >
                              {certificate.level}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Compétences acquises */}
                    <div className="bg-blue-50 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                        Compétences acquises
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {certificate.skills.map((skill, index) => (
                          <motion.div
                            key={skill}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center space-x-3 p-3 bg-white rounded-lg"
                          >
                            <div className="p-2 bg-blue-100 rounded-lg">
                              {getSkillIcon(skill)}
                            </div>
                            <span className="font-medium text-gray-900">
                              {skill}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Techniques apprises */}
                    <div className="bg-purple-50 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Code className="w-5 h-5 mr-2 text-purple-600" />
                        Techniques maîtrisées
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {certificate.techniques.map((technique, index) => (
                          <motion.span
                            key={technique}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="px-3 py-1 bg-white text-purple-800 rounded-full text-sm font-medium border border-purple-200"
                          >
                            {technique}
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    {/* Boutons de téléchargement */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Download className="w-5 h-5 mr-2 text-blue-600" />
                        Documents disponibles
                      </h4>
                      <div className="grid md:grid-cols-3 gap-3 sm:gap-4">
                        <motion.button
                          whileHover={{
                            scale: 1.02,
                            boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
                          }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            handleDownload(
                              certificate.certificateUrl,
                              "Attestation"
                            )
                          }
                          className="w-full flex items-center justify-center space-x-2 p-3 sm:p-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                        >
                          <Download className="w-5 h-5" />
                          <span>Attestation</span>
                        </motion.button>

                        <motion.button
                          whileHover={{
                            scale: 1.02,
                            boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)",
                          }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            handleDownload(
                              certificate.recommendationUrl,
                              "Lettre de recommandation"
                            )
                          }
                          className="w-full flex items-center justify-center space-x-2 p-3 sm:p-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                        >
                          <Download className="w-5 h-5" />
                          <span>Recommandation</span>
                        </motion.button>

                        <motion.button
                          whileHover={{
                            scale: 1.02,
                            boxShadow: "0 10px 25px rgba(168, 85, 247, 0.3)",
                          }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            handleDownload(
                              certificate.evaluationUrl,
                              "Évaluation"
                            )
                          }
                          className="w-full flex items-center justify-center space-x-2 p-3 sm:p-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                        >
                          <Download className="w-5 h-5" />
                          <span>Évaluation</span>
                        </motion.button>
                      </div>
                    </div>

                    {/* Bouton nouvelle recherche */}
                    <div className="text-center pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNewSearch}
                        className="w-full sm:w-auto px-6 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2 mx-auto"
                      >
                        <RefreshCw className="w-5 h-5" />
                        <span>Nouvelle recherche</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CertificateVerification;
