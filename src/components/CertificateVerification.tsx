import React, { useEffect, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import {
  getById as getCertificateById,
  seedIfEmpty,
  type Certificate,
} from "../services/certificatesService";
import { API_BASE_URL } from "../config/api";

// Using shared Certificate type from service

interface CertificateVerificationProps {
  isOpen: boolean;
  onClose: () => void;
}

// Default certificates used to seed localStorage (only if empty)
const DEFAULT_CERTIFICATES: Certificate[] = [
  {
    id: "MTC-AP-2025-0148",
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
    id: "MTC-AP-2025-0149",
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
    id: "MTC-AP-2025-0150",
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
  const [verifiedStatus, setVerifiedStatus] = useState<string>("Complétée");
  const [verifiedServices, setVerifiedServices] = useState<{ service1: boolean; service2: boolean }>({
    service1: true,
    service2: false,
  });
  const [verifiedServicesList, setVerifiedServicesList] = useState<string[]>([
    "Diagnostic stratégique & positionnement professionnel",
    "Missions professionnelles encadrées (le cas échéant)",
  ]);
  const [error, setError] = useState("");
  const [showResult, setShowResult] = useState(false);

  // Seed defaults once
  useEffect(() => {
    try {
      seedIfEmpty(DEFAULT_CERTIFICATES);
    } catch {
      // ignore
    }
  }, []);

  const handleVerify = async () => {
    if (!certificateId.trim()) {
      setError("Veuillez saisir l’identifiant professionnel (ID)");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const cleanId = certificateId.trim();

      // Call the real API instead of localStorage
      const response = await fetch(
        `${API_BASE_URL}/participation-verifications/verify/${encodeURIComponent(cleanId)}`
      );
      const data = await response.json();
      
      if (response.ok && data.valid && data.data) {
        // Transform API data to match Certificate interface
        const fullName = String(data.data.fullName || '');
        const parts = fullName.split(' ').filter(Boolean);
        const firstName = parts[0] || fullName;
        const lastName = parts.slice(1).join(' ') || '';

        const transformedCertificate: Certificate = {
          id: String(data.data.participationId || cleanId),
          firstName,
          lastName,
          program: '',
          skills: [],
          techniques: [],
          grade: 0,
          level: 'Débutant',
          certificateUrl: '#',
          recommendationUrl: '#',
          evaluationUrl: '#',
          completionDate: String(data.data.updatedAt || new Date().toISOString()),
        };
        
        setVerifiedStatus(String(data.data.status || 'Complétée'));
        setVerifiedServicesList(
          Array.isArray(data.data.servicesList) && data.data.servicesList.length > 0
            ? data.data.servicesList
            : [
                'Diagnostic stratégique & positionnement professionnel',
                'Missions professionnelles encadrées (le cas échéant)',
              ]
        );
        setVerifiedServices({
          service1: Boolean(data.data.services?.service1 ?? true),
          service2: Boolean(data.data.services?.service2 ?? false),
        });
        setCertificate(transformedCertificate);
        setShowResult(true);
      } else {
        // Fallback to localStorage for backward compatibility
        const foundCertificate = getCertificateById(certificateId.trim());
        if (foundCertificate) {
          setVerifiedStatus('Complétée');
          setVerifiedServicesList([
            'Diagnostic stratégique & positionnement professionnel',
            'Missions professionnelles encadrées (le cas échéant)',
          ]);
          setVerifiedServices({ service1: true, service2: false });
          setCertificate(foundCertificate);
          setShowResult(true);
        } else {
          setError("Participation introuvable. Vérifiez l’identifiant saisi.");
        }
      }
    } catch (error) {
      console.error('Error verifying attestation:', error);
      // Fallback to localStorage on network error
      const foundCertificate = getCertificateById(certificateId.trim());
      if (foundCertificate) {
        setVerifiedStatus('Complétée');
        setVerifiedServicesList([
          'Diagnostic stratégique & positionnement professionnel',
          'Missions professionnelles encadrées (le cas échéant)',
        ]);
        setVerifiedServices({ service1: true, service2: false });
        setCertificate(foundCertificate);
        setShowResult(true);
      } else {
        setError("Erreur de connexion. Veuillez réessayer.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateValue: string) => {
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return dateValue;
    return d.toLocaleDateString("fr-FR");
  };

  const handleBackToSearch = () => {
    setShowResult(false);
    setCertificate(null);
    setError("");
    setVerifiedStatus("Complétée");
    setVerifiedServicesList([
      'Diagnostic stratégique & positionnement professionnel',
      'Missions professionnelles encadrées (le cas échéant)',
    ]);
    setVerifiedServices({ service1: true, service2: false });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-4 py-6 sm:py-4 overflow-y-auto z-50"
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
          className="cv-modal bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl lg:max-w-4xl max-h-[calc(100vh-3rem)] sm:max-h-[90vh] overflow-y-auto overflow-x-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 uppercase">
                  Vérification de participation au parcours professionnel
                </h2>
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
                      <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm text-orange-900 leading-relaxed">
                          <span className="font-bold">⚠️ Les informations affichées sont fournies à titre consultatif et indicatif.</span>
                        </p>
                      </div>
                    </div>

                    <div className="max-w-md mx-auto">
                      <h4 className="text-base font-bold text-gray-900 mb-2">
                        Identifiant professionnel
                      </h4>
                      <label className="block text-sm font-semibold text-gray-800 mb-2" htmlFor="professionalId">
                        Veuillez saisir l’identifiant professionnel communiqué au participant :
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="professionalId"
                          value={certificateId}
                          onChange={(e) => setCertificateId(e.target.value)}
                          placeholder=""
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
                          <span>🔍 Vérifier</span>
                        </>
                      )}
                    </motion.button>

                    <div className="mt-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm text-left">
                      <h4 className="font-bold text-gray-900 mb-3 text-base">ℹ️ Information importante</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        En cas de besoin d’informations complémentaires ou de clarification,
                        les institutions et entreprises peuvent contacter MA Training & Consulting
                        via les canaux officiels indiqués sur le site.
                      </p>
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
                    <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-200">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 break-words">
                        Vérification de participation professionnelle
                      </h3>
                      <p className="text-gray-700 font-semibold">✔️ Participation confirmée</p>
                      <p className="mt-4 text-sm text-gray-700 leading-relaxed">
                        Cette page permet de vérifier la participation effective d’une personne au sein du dispositif
                        <br />
                        MA-TRAINING-CONSULTING – Accompagnement professionnel.
                      </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
                      <div className="text-left">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          🔎 Informations de vérification
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-xl p-4">
                            <span className="text-sm text-gray-600">Nom et prénom</span>
                            <p className="font-semibold text-gray-900">
                              {certificate.firstName} {certificate.lastName}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <span className="text-sm text-gray-600">Identifiant de participation</span>
                            <p className="font-semibold text-gray-900 font-mono">{certificate.id}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <span className="text-sm text-gray-600">Statut</span>
                            <p className="font-semibold text-gray-900">{verifiedStatus}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <span className="text-sm text-gray-600">Date de dernière mise à jour</span>
                            <p className="font-semibold text-gray-900">
                              {formatDate(certificate.completionDate)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 bg-gray-50 rounded-xl p-4">
                          <span className="text-sm text-gray-600">Service(s) concerné(s)</span>
                          <ul className="mt-2 space-y-1 text-sm text-gray-800">
                            {verifiedServicesList.length > 0 ? (
                              verifiedServicesList.map((s) => (
                                <li key={s}>• {s}</li>
                              ))
                            ) : !verifiedServices.service1 && !verifiedServices.service2 ? (
                              <li>—</li>
                            ) : (
                              <>
                                {verifiedServices.service1 && (
                                  <li>• Diagnostic stratégique &amp; positionnement professionnel</li>
                                )}
                                {verifiedServices.service2 && (
                                  <li>• Missions professionnelles encadrées (le cas échéant)</li>
                                )}
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6 text-left">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">📄 Documents associés</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Les documents liés à cette participation sont transmis directement au participant via les canaux officiels
                        <br />
                      </p>
                    </div>

                    <div className="p-6 bg-orange-50 border border-orange-200 rounded-xl text-left">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">⚠️ Avertissement important</h4>
                      <p className="text-sm text-orange-900 leading-relaxed">
                        Les contenus présentés s’inscrivent dans le cadre d’une analyse professionnelle à visée consultative et ne sauraient être assimilés à une certification, une validation officielle ou une garantie de résultat.
                      </p>
                    </div>

                    <div className="pt-2 flex justify-center">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleBackToSearch}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-2"
                      >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Retour à la vérification</span>
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
