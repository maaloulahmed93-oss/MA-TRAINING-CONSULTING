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
  RefreshCw,
} from "lucide-react";
import {
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
    id: "PART-2024-001",
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
    id: "PART-2024-002",
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
    id: "PART-2024-003",
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
          completionDate: data.data.dateObtention
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
          setError("Participation introuvable. Vérifiez l’identifiant saisi.");
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

  const getAutonomyObserved = (level: string) => {
    switch (level) {
      case "Expert":
      case "Avancé":
        return "Autonomie fonctionnelle avec périmètre clair";
      case "Intermédiaire":
        return "Autonomie partielle dans un cadre défini";
      default:
        return "Sous supervision directe";
    }
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
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Page 1 — Vérification de participation
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Vérification de participation professionnelle
                </h2>
                <p className="text-gray-600">
                  Cette page permet de vérifier la participation d’une personne au sein du dispositif
                  <br />
                  MA Training & Consulting, et d’accéder à un résumé professionnel consultatif,
                  <br />
                  issu d’un processus de diagnostic et d’évaluation mené par nos experts.
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
                        Vérification de participation professionnelle
                      </h3>
                      <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm text-orange-900 leading-relaxed">
                          <span className="font-bold">⚠️ Les informations affichées sont fournies à titre consultatif et indicatif.</span>
                          <br />
                          Elles ne constituent ni une promesse d’emploi, ni une certification de recrutement,
                          ni une validation officielle de poste ou de fonction.
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
                    {/* En-tête de succès */}
                    <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-200">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                      >
                        <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                      </motion.div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 break-words">
                        Page de vérification — Synthèse de participation professionnelle
                      </h3>
                      <p className="text-gray-700">
                        Participation confirmée ✓
                      </p>
                    </div>

                    {/* Informations du certificat */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
                      {/* Informations personnelles */}
                      <div className="text-left">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Award className="w-5 h-5 mr-2 text-blue-600" />
                          1️⃣ Informations de vérification
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-xl p-4">
                            <span className="text-sm text-gray-600">Nom et prénom</span>
                            <p className="font-semibold text-gray-900">
                              {certificate.firstName} {certificate.lastName}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <span className="text-sm text-gray-600">Identifiant professionnel</span>
                            <p className="font-semibold text-gray-900 font-mono">{certificate.id}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <span className="text-sm text-gray-600">Statut de participation</span>
                            <p className="font-semibold text-gray-900">Complétée</p>
                            <p className="text-xs text-gray-500">Active / Complétée / En cours</p>
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
                          <div className="mt-2 space-y-1 text-sm text-gray-800">
                            <p>Service 1 : Diagnostic et parcours professionnel</p>
                            <p>Service 2 : Accompagnement professionnel avec experts (le cas échéant)</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Axes travaillés (compétences) */}
                    <div className="bg-blue-50 rounded-xl p-6 text-left">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                        2️⃣ Synthèse professionnelle (cadre consultatif)
                      </h4>
                      <p className="text-sm text-gray-800 leading-relaxed">
                        <span className="font-semibold">Synthèse à visée strictement consultative</span>
                        <br />
                        Ce profil a été évalué dans le cadre d’un dispositif professionnel de conseil,
                        basé sur des situations professionnelles réelles et/ou quasi réelles,
                        incluant l’analyse des capacités opérationnelles,
                        du raisonnement professionnel et de la posture en contexte de travail.
                      </p>
                      <p className="mt-3 text-sm text-gray-800 leading-relaxed">
                        Cette synthèse ne constitue ni une fiche de poste, ni une certification.
                      </p>
                    </div>

                    {/* Axes travaillés (techniques) */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 text-left">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <Code className="w-5 h-5 mr-2 text-indigo-600" />
                        3️⃣ Champs de contribution professionnelle potentiels
                      </h4>
                      <p className="text-sm text-gray-700 mb-3">
                        Domaines d’intervention possibles selon l’évaluation
                      </p>
                      <ul className="space-y-2 text-sm text-gray-800 leading-relaxed">
                        <li className="flex items-start gap-2"><span className="font-bold text-indigo-700">•</span><span>Appui à l’exécution de missions opérationnelles</span></li>
                        <li className="flex items-start gap-2"><span className="font-bold text-indigo-700">•</span><span>Coordination fonctionnelle au sein d’équipes</span></li>
                        <li className="flex items-start gap-2"><span className="font-bold text-indigo-700">•</span><span>Analyse et structuration d’informations professionnelles</span></li>
                        <li className="flex items-start gap-2"><span className="font-bold text-indigo-700">•</span><span>Exécution de tâches dans un cadre défini</span></li>
                        <li className="flex items-start gap-2"><span className="font-bold text-indigo-700">•</span><span>Contribution à des projets encadrés</span></li>
                      </ul>
                      <p className="mt-3 text-xs text-gray-600">
                        Ces champs sont indicatifs et ne constituent pas un engagement contractuel.
                      </p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6 text-left">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <Star className="w-5 h-5 mr-2 text-yellow-600" />
                        4️⃣ Niveau d’autonomie professionnelle (indicatif)
                      </h4>
                      <p className="text-sm text-gray-700 mb-3">
                        Niveau d’autonomie observé
                      </p>
                      <div className="space-y-2 text-sm">
                        {[
                          "Sous supervision directe",
                          "Autonomie partielle dans un cadre défini",
                          "Autonomie fonctionnelle avec périmètre clair",
                        ].map((label) => {
                          const selected = getAutonomyObserved(certificate.level) === label;
                          return (
                            <div
                              key={label}
                              className={`p-3 rounded-lg border ${selected ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200"}`}
                            >
                              <span className={selected ? "font-semibold text-gray-900" : "text-gray-800"}>
                                {label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <p className="mt-3 text-xs text-gray-600">
                        Le niveau est établi à partir de situations professionnelles analysées.
                      </p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6 text-left">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                        5️⃣ Contextes professionnels évalués
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-800 leading-relaxed">
                        <li className="flex items-start gap-2"><span className="font-bold text-blue-700">•</span><span>Travail en environnement structuré</span></li>
                        <li className="flex items-start gap-2"><span className="font-bold text-blue-700">•</span><span>Collaboration au sein d’équipes pluridisciplinaires</span></li>
                        <li className="flex items-start gap-2"><span className="font-bold text-blue-700">•</span><span>Gestion de projets sous contraintes réalistes</span></li>
                        <li className="flex items-start gap-2"><span className="font-bold text-blue-700">•</span><span>Prise de décision en contexte professionnel encadré</span></li>
                      </ul>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6 text-left">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <Award className="w-5 h-5 mr-2 text-emerald-600" />
                        6️⃣ Compétences comportementales observées
                      </h4>
                      <p className="text-xs text-gray-600 mb-3">(Sans notation ni classement chiffré)</p>
                      <ul className="space-y-2 text-sm text-gray-800 leading-relaxed">
                        <li className="flex items-start gap-2"><span className="font-bold text-emerald-700">•</span><span>Communication professionnelle</span></li>
                        <li className="flex items-start gap-2"><span className="font-bold text-emerald-700">•</span><span>Capacité d’analyse</span></li>
                        <li className="flex items-start gap-2"><span className="font-bold text-emerald-700">•</span><span>Gestion des priorités</span></li>
                        <li className="flex items-start gap-2"><span className="font-bold text-emerald-700">•</span><span>Sens des responsabilités</span></li>
                        <li className="flex items-start gap-2"><span className="font-bold text-emerald-700">•</span><span>Discipline et engagement professionnel</span></li>
                      </ul>
                    </div>

                    {/* Boutons de téléchargement */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6 text-left">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                        <Download className="w-5 h-5 mr-2 text-blue-600" />
                        7️⃣ Documents disponibles au téléchargement
                      </h4>
                      <p className="text-sm text-gray-700 mb-4">
                        Documents accessibles via cette page :
                      </p>
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
                              "Attestation de participation professionnelle"
                            )
                          }
                          className="w-full flex items-center justify-center space-x-2 p-3 sm:p-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                        >
                          <Download className="w-5 h-5" />
                          <span>Attestation de participation</span>
                        </motion.button>

                        <motion.button
                          whileHover={{
                            scale: 1.02,
                            boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)",
                          }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            handleDownload(
                              certificate.evaluationUrl,
                              "Note de positionnement professionnel"
                            )
                          }
                          className="w-full flex items-center justify-center space-x-2 p-3 sm:p-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                        >
                          <Download className="w-5 h-5" />
                          <span>Note de positionnement</span>
                        </motion.button>

                        <motion.button
                          whileHover={{
                            scale: 1.02,
                            boxShadow: "0 10px 25px rgba(168, 85, 247, 0.3)",
                          }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            handleDownload(
                              certificate.recommendationUrl,
                              "Mémo contextuel (entreprises & RH)"
                            )
                          }
                          className="w-full flex items-center justify-center space-x-2 p-3 sm:p-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                        >
                          <Download className="w-5 h-5" />
                          <span>Mémo contextuel RH</span>
                        </motion.button>
                      </div>
                      <p className="mt-4 text-sm text-gray-700 leading-relaxed">
                        Les documents détaillés sont transmis directement au participant par e-mail ou canal officiel.
                      </p>
                    </div>

                    <div className="p-6 bg-orange-50 border border-orange-200 rounded-xl text-left">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">8️⃣ Avertissement légal</h4>
                      <p className="text-sm text-orange-900 leading-relaxed">
                        <span className="font-bold">⚠️ Les informations affichées sur cette page :</span>
                      </p>
                      <ul className="mt-3 space-y-2 text-sm text-orange-900 leading-relaxed">
                        <li className="flex items-start gap-2"><span className="font-bold">•</span><span>ne constituent pas une certification</span></li>
                        <li className="flex items-start gap-2"><span className="font-bold">•</span><span>ne garantissent ni emploi, ni promotion</span></li>
                        <li className="flex items-start gap-2"><span className="font-bold">•</span><span>n’engagent aucune entreprise ou recruteur</span></li>
                      </ul>
                      <p className="mt-4 text-sm text-orange-900 leading-relaxed">
                        Toute décision de recrutement, d’évolution ou d’attribution de missions
                        relève exclusivement de la responsabilité de l’organisation concernée.
                      </p>
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
                        <span>🟣 Nouvelle vérification</span>
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
