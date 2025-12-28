import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Shield,
  Lightbulb,
  CheckCircle,
  Map,
  Search,
  Compass,
  Rocket,
  BadgeCheck,
  Layers,
  Award,
  ArrowLeft,
  ArrowRight,
  Clock,
  Star,
  BookOpen,
  TrendingUp,
  Briefcase,
  FileText,
  ChevronRight,
  X
} from "lucide-react";
import FreeCourseModal from "./FreeCourseModal";
import ProgramRegistrationModal from "./ProgramRegistrationModal";
import InteractiveQCMModal from "./InteractiveQCMModal";
import { Program, getTrainingPrograms } from "../data/trainingPrograms";
import { digitalizationContactApiService } from "../services/digitalizationContactApiService";
import { downloadMatcConditionsPdf } from "../utils/matcConditionsPdf";

interface ETrainingPageProps {
  onBack: () => void;
}

const ETrainingPage: React.FC<ETrainingPageProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [showUnifiedCatalogModal, setShowUnifiedCatalogModal] = useState(false);
  const [showFreeCourseModal, setShowFreeCourseModal] = useState(false);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  
  // State for dynamic data
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [isParcoursInfoOpen, setIsParcoursInfoOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const openService2MissionRequest = (type: "reelle" | "simulee") => {
    const message =
      type === "reelle"
        ? "Bonjour, je souhaite démarrer une Mission Opérationnelle (Mission Réelle). J’ai compris que le service est disponible uniquement après diagnostic validé (Service 1)."
        : "Bonjour, je souhaite démarrer une Mission Opérationnelle (Mission Simulée). J’ai compris que le service est disponible uniquement après diagnostic validé (Service 1).";

    const url = digitalizationContactApiService.generateWhatsAppLink(undefined, message);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const openEspaceParticipant = () => {
    navigate("/espace-participant");
  };

  const openEspaceVerification = () => {
    navigate("/verification-participant");
  };

  // Load programs, packs and categories from API on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load programs
        const apiPrograms = await getTrainingPrograms();
        setPrograms(apiPrograms as Program[]);
      } catch (error) {
        console.error('Error loading data:', error);
        // Keep fallback data if API fails
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Interface pour les éléments du catalogue unifié
  interface CatalogItem {
    id: string;
    name: string;
    type: "pack" | "programme";
    category: string;
    price: number;
    originalPrice?: number;
    savings?: number;
    description: string;
    level?: string;
    duration?: string;
    instructor?: string;
    themes?: number;
    modules?: number;
  }

  // Fonction pour créer le catalogue unifié
  const createUnifiedCatalog = (): CatalogItem[] => {
    const catalogItems: CatalogItem[] = [];

    // Ajouter les programmes
    programs.forEach((program) => {
      catalogItems.push({
        id: `programme-${program.id}`,
        name: program.title,
        type: "programme",
        category: typeof program.category === 'object' && program.category?.name 
          ? program.category.name 
          : typeof program.category === 'string' 
            ? program.category 
            : 'Autre',
        price: program.price || 0,
        description: program.description,
        level: program.level,
        duration: program.duration,
        instructor: program.instructor,
        modules: program.modules.length,
      });
    });

    // Trier par catégorie puis par prix
    return catalogItems.sort((a, b) => {
      if (a.category !== b.category) {
        // Gérer le cas où category peut être un objet ou une string
        const categoryA = typeof a.category === 'string' ? a.category : '';
        const categoryB = typeof b.category === 'string' ? b.category : '';
        return categoryA.localeCompare(categoryB);
      }
      return a.price - b.price;
    });
  };

  // Fonction pour gérer la sélection d'un élément du catalogue
  const handleUnifiedCatalogItemSelection = (item: CatalogItem) => {
    // Fermer le modal
    setShowUnifiedCatalogModal(false);

    // Attendre un peu pour que le modal se ferme
    setTimeout(() => {
      let targetElement: HTMLElement | null = null;

      if (item.type === "pack") {
        // Chercher l'élément pack correspondant
        const packId = item.id.replace("pack-", "");
        targetElement = document.querySelector(
          `[data-pack-id="${packId}"]`
        ) as HTMLElement;

        // Si pas trouvé, chercher la section des packs
        if (!targetElement) {
          targetElement = document.getElementById("packs-section");
        }
      } else {
        // Chercher l'élément programme correspondant
        const programId = item.id.replace("programme-", "");
        targetElement = document.querySelector(
          `[data-program-id="${programId}"]`
        ) as HTMLElement;

        // Si pas trouvé, chercher la section des programmes
        if (!targetElement) {
          targetElement = document.getElementById("programs-section");
        }
      }

      if (targetElement) {
        // Faire défiler vers l'élément
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        // Ajouter un effet de surbrillance temporaire
        targetElement.style.transition = "all 0.3s ease";
        targetElement.style.boxShadow = "0 0 20px rgba(59, 130, 246, 0.5)";
        targetElement.style.transform = "scale(1.02)";

        // Retirer l'effet après 3 secondes
        setTimeout(() => {
          targetElement!.style.boxShadow = "";
          targetElement!.style.transform = "";
        }, 3000);
      }
    }, 300);
  };

  const scrollToSection = (sectionId: string) => {
    const targetElement = document.getElementById(sectionId);
    if (!targetElement) return;

    targetElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    targetElement.style.transition = "all 0.3s ease";
    targetElement.style.boxShadow = "0 0 20px rgba(99, 102, 241, 0.35)";
    targetElement.style.transform = "scale(1.01)";

    setTimeout(() => {
      targetElement.style.boxShadow = "";
      targetElement.style.transform = "";
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>
      </div>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative py-10 sm:py-14 lg:py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-yellow-50 overflow-hidden"
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="relative rounded-[2.5rem] sm:rounded-[3rem] bg-gradient-to-br from-white/70 via-indigo-200/35 to-purple-200/35 p-[1px] shadow-[0_40px_110px_-60px_rgba(15,23,42,0.55)] transition-shadow duration-500 hover:shadow-[0_52px_140px_-78px_rgba(15,23,42,0.65)]">
              <div className="relative rounded-[2.45rem] sm:rounded-[2.95rem] bg-white/45 backdrop-blur-2xl border border-white/60 ring-1 ring-black/5 px-5 py-6 sm:px-8 sm:py-9 lg:px-10">
                <div className="flex items-center justify-between mb-6 sm:mb-7">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400/90 shadow-sm" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90 shadow-sm" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90 shadow-sm" />
                  </div>
                  <div className="hidden sm:block text-xs font-semibold text-slate-600 tracking-wide">
                    MA TRAINING • CONSULTING
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
                  className="grid grid-cols-1 gap-8 lg:gap-12 items-center"
                >
                  {/* Left Content */}
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                    className="text-center order-1 w-full max-w-5xl mx-auto"
                  >
                    <div className="relative rounded-3xl bg-white/55 backdrop-blur-xl border border-white/70 shadow-[0_24px_70px_-35px_rgba(17,24,39,0.28)] ring-1 ring-black/5 p-6 sm:p-10 lg:p-12">
                      {/* Badge */}
                      <div className="inline-flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm ring-1 ring-black/5 mb-6 max-w-full">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2 flex-shrink-0"></span>
                        <span className="text-[11px] sm:text-xs font-medium text-gray-700 leading-tight break-words">
                          Cabinet de Conseil : Accompagnement & Transformation Digitale
                        </span>
                      </div>

                      <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 sm:mb-6 leading-[1.02] tracking-tight break-words max-w-4xl mx-auto">
                        <span className="block">Commencez votre parcours professionnel</span>
                        <span className="block mt-2">
                          avec un{" "}
                          <span className="text-gradient bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                            diagnostic gratuit
                          </span>
                          {" "}et personnalisé !
                        </span>
                      </h1>

                      <p className="text-sm sm:text-base md:text-lg text-gray-700/90 mb-7 leading-relaxed max-w-3xl mx-auto">
                        Faites un diagnostic professionnel gratuit pour analyser votre situation actuelle et définir le meilleur parcours pour votre carrière. Recevez des conseils pratiques et des recommandations claires adaptées à votre domaine.
                      </p>

                      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 max-w-3xl mx-auto">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200/60 text-gray-900 text-center leading-snug shadow-sm">
                          Diagnostic professionnel
                        </span>
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/60 text-gray-900 text-center leading-snug shadow-sm">
                          Analyse décisionnelle
                        </span>
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 text-gray-900 text-center leading-snug shadow-sm">
                          Accompagnement stratégique
                        </span>
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/60 text-gray-900 text-center leading-snug shadow-sm">
                          Développement en situation réelle
                        </span>
                      </div>

                      <div className="flex justify-center mb-8">
                        <button
                          type="button"
                          onClick={() => navigate("/diagnostic-wonder")}
                          className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white text-sm sm:text-base font-semibold rounded-full shadow-[0_14px_30px_-18px_rgba(79,70,229,0.7)] hover:shadow-[0_20px_44px_-22px_rgba(79,70,229,0.85)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center ring-1 ring-white/10"
                        >
                          <span>Commencez maintenant votre diagnostic gratuit</span>
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>

                      <div className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-white/80 backdrop-blur-sm border border-white/70 px-4 py-2 text-sm text-gray-800 shadow-sm ring-1 ring-black/5">
                        <span className="font-semibold">Rejoignez plus de 5000 professionnels accompagnés !</span>
                      </div>

                      {/* Social Proof - Enhanced */}
                      <div className="mt-8 space-y-4">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                          {/* Professionals Count */}
                          <div className="group flex items-center bg-white/70 backdrop-blur-sm px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/60 ring-1 ring-black/5">
                            <div className="flex -space-x-3 mr-3">
                              {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 border-3 border-white flex items-center justify-center text-white text-sm font-bold shadow-lg transform group-hover:scale-110 transition-transform">
                                  {i === 1 ? '👨' : i === 2 ? '👩' : i === 3 ? '👤' : '👨‍💼'}
                                </div>
                              ))}
                            </div>
                            <div>
                              <p className="text-lg font-bold text-gray-900 leading-tight">+5000</p>
                              <p className="text-xs text-gray-600 font-medium">professionnels accompagnés</p>
                            </div>
                          </div>

                          {/* Rating */}
                          <div className="group flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-yellow-200/70 ring-1 ring-black/5">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400 transform group-hover:scale-110 transition-transform" style={{transitionDelay: `${star * 50}ms`}} />
                              ))}
                            </div>
                            <div className="border-l border-yellow-300 pl-3">
                              <p className="text-lg font-bold text-gray-900 leading-tight">4.9/5</p>
                              <p className="text-xs text-gray-600 font-medium">2,500+ avis</p>
                            </div>
                          </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center justify-center gap-3">
                          <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-200/70 ring-1 ring-black/5">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-semibold text-green-700">Processus qualité</span>
                          </div>
                          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200/70 ring-1 ring-black/5">
                            <Shield className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-semibold text-blue-700">100% sécurisé</span>
                          </div>
                          <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200/70 ring-1 ring-black/5">
                            <Award className="w-4 h-4 text-purple-600" />
                            <span className="text-xs font-semibold text-purple-700">Experts reconnus</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="py-14 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-12" dir="ltr">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm ring-1 ring-black/5">
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="text-xs sm:text-sm font-semibold text-slate-700">👥 À qui s’adresse notre activité ?</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mt-5 mb-4 tracking-tight">
                Notre activité s’adresse aux personnes qui veulent comprendre leur positionnement professionnel réel
              </h2>
              <p className="text-base sm:text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
                Et construire un profil professionnel opérationnel — sans apprentissage théorique ni certifications.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch" dir="ltr">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7 overflow-hidden"
              >
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
                <div className="relative">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-gray-900">🔹 Profils en début de parcours professionnel</h3>
                      <p className="text-sm text-gray-600 mt-1">Pour bien démarrer, avant de perdre du temps dans du contenu sans résultat.</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p>Étudiants avant l’entrée sur le marché du travail</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p>Jeunes diplômés qui se sentent perdus professionnellement</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p>Profils Junior / Assistant</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p>Personnes qui ont des compétences mais ne savent pas comment les présenter ou les utiliser correctement</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, ease: "easeOut", delay: 0.03 }}
                className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7 overflow-hidden"
              >
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10" />
                <div className="relative">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-gray-900">🔹 Profils en phase de clarification ou de repositionnement</h3>
                      <p className="text-sm text-gray-600 mt-1">Quand vous cherchez une décision claire : que faire, pourquoi, et comment ?</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p>Personnes ayant un peu travaillé mais sans direction claire</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p>Profils souhaitant faire une reconversion</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p>Personnes qui ont constaté que leurs choix professionnels ne sont pas cohérents</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p>Personnes qui veulent savoir : que puis-je faire, pourquoi, et comment ?</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, ease: "easeOut", delay: 0.06 }}
                className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7 overflow-hidden"
              >
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10" />
                <div className="relative">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-600/20">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-gray-900">🔹 Profils en recherche de sérieux et de crédibilité</h3>
                      <p className="text-sm text-gray-600 mt-1">Pas une formation classique, mais une évaluation réaliste et des décisions claires.</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p>Personnes qui n’aiment pas la formation classique</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p>Personnes fatiguées des cours théoriques</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p>Profils qui veulent une évaluation réaliste, des décisions claires et une orientation professionnelle directe</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p>Ceux qui veulent de vrais documents professionnels, pas des certificats de façade</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6" dir="ltr">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7 overflow-hidden"
              >
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-rose-500/10 via-transparent to-orange-500/10" />
                <div className="relative">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-rose-600 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/20">
                      <X className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-gray-900">❌ Pour qui ne travaillons-nous pas ?</h3>
                      <p className="text-sm text-gray-600 mt-1">Pour que tout soit clair dès le départ.</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 font-bold text-rose-700">✗</span>
                      <p>Ceux qui recherchent un diplôme ou une attestation de formation</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 font-bold text-rose-700">✗</span>
                      <p>Ceux qui veulent des cours prêts à l’emploi ou des recettes miracles</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 font-bold text-rose-700">✗</span>
                      <p>Ceux qui veulent apprendre une compétence sans contexte professionnel</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 font-bold text-rose-700">✗</span>
                      <p>Ceux qui ne veulent pas se confronter à leur niveau réel</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, ease: "easeOut", delay: 0.03 }}
                className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 border border-white/10 shadow-[0_18px_60px_-38px_rgba(15,23,42,0.8)] p-6 sm:p-7"
              >
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/15 text-white flex items-center justify-center">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-emerald-300">🧭 La valeur fondamentale</p>
                    <h3 className="mt-1 text-xl font-bold text-white">Nous n’enseignons pas.</h3>
                    <p className="mt-2 text-sm text-slate-200 leading-relaxed">
                      Nous évaluons, nous corrigeons le raisonnement, et nous orientons.
                      <span className="block mt-3 text-white font-semibold">
                        Notre objectif : transformer une personne sans clarté professionnelle en un profil compréhensible, structuré et exploitable dans la réalité professionnelle.
                      </span>
                    </p>
                    <div className="mt-5 flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => navigate("/diagnostic-wonder")}
                        className="group inline-flex items-center justify-center gap-2 rounded-full bg-white text-slate-900 px-5 py-2.5 text-sm font-semibold shadow-sm hover:shadow-md transition-all"
                      >
                        <span>Commencer le diagnostic</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollToSection("parcours-section")}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 text-white border border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-white/15 transition-all"
                      >
                        <span>Voir le parcours</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-indigo-50/30 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-12" dir="ltr">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm ring-1 ring-black/5">
                <BadgeCheck className="w-4 h-4 text-indigo-600" />
                <span className="text-xs sm:text-sm font-semibold text-slate-700">🧠 Supervision par des experts métiers</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mt-5 mb-4 tracking-tight">
                Un résultat professionnel clair — sans compromis ni complaisance
              </h2>
              <p className="text-base sm:text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
                L’ensemble du service (Service 1 et Service 2) est supervisé par des experts métiers selon votre domaine. Nous vous apportons une évaluation réaliste qui révèle votre niveau réel, afin que vous puissiez vous appuyer dessus et progresser par vous-même avec un plan juste.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch" dir="ltr">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7 overflow-hidden"
              >
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-purple-500/10 via-transparent to-indigo-500/10" />
                <div className="relative">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/20">
                      <Search className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-gray-900">Service 1 — Diagnostic (Individuel)</h3>
                      <p className="text-sm text-gray-600 mt-1">C’est le point de départ obligatoire, car sans lui nous ne pouvons ni définir le parcours ni estimer le tarif.</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p>Individuel via la plateforme : questions / scénarios / analyse selon le domaine.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p>Une session en direct avec un expert est possible (selon le cas) pour clarifier la décision ou confirmer l’orientation.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p>Livrables : évaluation claire du niveau + recommandation GO/NO-GO + proposition de parcours adapté.</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/70 px-5 py-4">
                    <p className="text-sm font-semibold text-indigo-900">
                      Pourquoi le Service 1 est-il essentiel ?
                      <span className="block mt-2 text-sm text-gray-800 font-normal">
                        Parce que le diagnostic « filtre » et précise exactement ce dont vous avez besoin, quand le Service 2 est pertinent, et sous quelle forme.
                      </span>
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, ease: "easeOut", delay: 0.03 }}
                className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7 overflow-hidden"
              >
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10" />
                <div className="relative">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-gray-900">Service 2 — Mise en œuvre / accompagnement (Individuel ou Groupe)</h3>
                      <p className="text-sm text-gray-600 mt-1">S’active uniquement après le diagnostic, et avec des profils « compatibles » sur l’objectif et la méthodologie.</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p>Soit en individuel, soit en petit groupe ne dépassant pas 5 personnes.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p>Le groupe est soigneusement filtré : même objectif et même mode de pensée (même méthodologie).</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p>Priorité au résultat professionnel : décisions, documents et exécution en contexte métier (pas une formation théorique).</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-amber-50/70 border border-amber-200/70 px-5 py-4">
                    <p className="text-sm font-semibold text-amber-900">
                      💬 La tarification ne se fixe pas avant le diagnostic
                      <span className="block mt-2 text-sm text-gray-800 font-normal">
                        Les tarifs du Service 1 comme du Service 2 varient selon le « challenge » et la situation. Nous ne pouvons donc pas annoncer un prix avant la fin du diagnostic gratuit.
                      </span>
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="mt-10 flex flex-col items-center" dir="ltr">
              <button
                type="button"
                onClick={() => navigate("/diagnostic-wonder")}
                className="group w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white text-sm sm:text-base font-semibold rounded-full shadow-[0_14px_30px_-18px_rgba(79,70,229,0.7)] hover:shadow-[0_20px_44px_-22px_rgba(79,70,229,0.85)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center justify-center"
              >
                <span>Commencer le diagnostic gratuit</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="mt-3 text-sm text-gray-600 text-center max-w-2xl">
                Après le diagnostic : nous définissons le format le plus pertinent (Individuel ou Groupe) et proposons une tarification cohérente selon le cas.
              </p>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {isParcoursInfoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-white/60"
            >
              <div className="sticky top-0 z-10 bg-white/85 backdrop-blur-md border-b border-slate-200/70 px-6 sm:px-8 py-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-600">📌</p>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-gray-900">
                    Conditions générales des services MA Consulting
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Applicables au Diagnostic Professionnel (Service 1) et aux Missions Opérationnelles (Service 2)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsParcoursInfoOpen(false)}
                  className="h-10 w-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5 text-slate-700" />
                </button>
              </div>

              <div className="px-6 sm:px-8 py-6">
                <div className="rounded-3xl bg-white border border-slate-200/70 p-6" dir="ltr">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Résumé des conditions (Readable)</p>
                      <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                        Ces conditions sont fournies à titre explicatif ; la référence juridique est le fichier PDF.
                      </p>
                    </div>
                    <div className="h-11 w-11 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-slate-700" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4" dir="ltr">
                  <div className="rounded-3xl bg-gradient-to-b from-emerald-50 to-white border border-emerald-200/70 p-6">
                    <p className="text-sm font-bold text-emerald-900">🔹 Service 1 — Diagnostic & Parcours</p>
                    <p className="mt-2 text-sm text-gray-700">Service d’analyse, d’orientation et d’accompagnement professionnel</p>

                    <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-gray-700">
                      <div className="flex items-start gap-2"><span className="text-rose-700 font-bold">❌</span><span>Ce n’est pas une formation</span></div>
                      <div className="flex items-start gap-2"><span className="text-rose-700 font-bold">❌</span><span>Ce n’est pas une certification</span></div>
                      <div className="flex items-start gap-2"><span className="text-rose-700 font-bold">❌</span><span>Ce n’est pas une promesse d’emploi</span></div>
                    </div>

                    <div className="mt-4 rounded-2xl bg-white/70 border border-emerald-200/70 px-4 py-3">
                      <p className="text-sm text-emerald-900 font-semibold">Livrables : documents professionnels d’analyse et de conseil</p>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-900">Les résultats dépendent de :</p>
                      <ul className="mt-2 space-y-1 text-sm text-gray-700">
                        <li>L’implication du participant</li>
                        <li>La qualité des informations fournies</li>
                      </ul>
                    </div>

                    <div className="mt-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/70 px-4 py-3">
                      <p className="text-sm text-indigo-900 font-semibold">Il n’existe pas de NO-GO : le participant est toujours orienté vers un niveau ou un parcours adapté</p>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-gradient-to-b from-indigo-50 to-white border border-indigo-200/70 p-6">
                    <p className="text-sm font-bold text-indigo-900">🔹 Service 2 — Mission Opérationnelle (Sur demande)</p>
                    <p className="mt-2 text-sm text-gray-700">Activé uniquement après diagnostic validé</p>

                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-900">Deux formats :</p>
                      <ul className="mt-2 space-y-1 text-sm text-gray-700">
                        <li>Mission réelle</li>
                        <li>Mission simulée</li>
                      </ul>
                    </div>

                    <div className="mt-4 rounded-2xl bg-white/70 border border-indigo-200/70 px-4 py-3">
                      <p className="text-sm text-indigo-900 font-semibold">Cadre contractuel distinct + livrables d’exécution clairs et définis</p>
                    </div>

                    <div className="mt-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 px-4 py-3">
                      <p className="text-sm text-amber-900 font-semibold">Ce n’est pas un remplacement d’un employé ou d’une équipe interne</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-3xl bg-slate-50 border border-slate-200/70 p-6" dir="ltr">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900">📄 Télécharger les conditions (Justificatif)</p>
                      <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                        Ce document précise : la nature des services, les limites de responsabilité, le cadre des documents, les modalités de paiement (le cas échéant), ainsi que les conditions d’activation ou d’arrêt.
                        <span className="block mt-2 font-semibold text-gray-900">📌 Il s’agit de votre référence juridique.</span>
                      </p>

                      <div className="mt-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 px-4 py-3">
                        <p className="text-sm text-amber-900 font-semibold">Note obligatoire avant de poursuivre le parcours</p>
                        <p className="mt-2 text-sm text-gray-800 leading-relaxed">
                          Veuillez télécharger le document
                          <span className="font-semibold text-gray-900"> 📄 CONDITIONS GÉNÉRALES DE SERVICE — MA-TRAINING-CONSULTING ( MATC )</span>
                          , car nous vous demanderons ensuite
                          <span className="font-semibold text-gray-900"> de joindre une copie</span>
                          des conditions générales téléchargées dans l’e-mail confirmant votre participation et le démarrage de votre parcours dans le réel professionnel.
                        </p>
                        <div className="mt-3 rounded-xl bg-white/70 border border-amber-200/70 px-4 py-3">
                          <p className="text-xs font-semibold text-gray-900">Réponse obligatoire dans l’e-mail :</p>
                          <p className="mt-2 text-sm font-semibold text-slate-900">
                            "Je confirme avoir lu et accepté l’ensemble des conditions de service MA Consulting."
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={downloadMatcConditionsPdf}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200/70 px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
                    >
                      <FileText className="w-4 h-4" />
                      <span>📄 CONDITIONS GÉNÉRALES DE SERVICE — MA-TRAINING-CONSULTING ( MATC )</span>
                    </button>
                  </div>
                </div>

                <div className="mt-6 rounded-3xl bg-white border border-slate-200/70 p-6" dir="ltr">
                  <p className="text-sm font-bold text-gray-900">✅ Acceptation</p>
                  <label className="mt-3 flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700 leading-relaxed">
                      Je déclare avoir pris connaissance des conditions de service, avoir compris la nature du Service 1 et du Service 2, et accepter l’ensemble des conditions, sans exception.
                    </span>
                  </label>

                  <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      disabled={!termsAccepted}
                      onClick={() => navigate("/diagnostic-wonder")}
                      className={`group w-full sm:w-auto px-6 py-3 rounded-2xl text-white text-sm font-semibold shadow-[0_14px_30px_-18px_rgba(79,70,229,0.7)] transition-all duration-300 inline-flex items-center justify-center ${termsAccepted ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:shadow-[0_20px_44px_-22px_rgba(79,70,229,0.85)]" : "bg-slate-300 cursor-not-allowed shadow-none"}`}
                    >
                      <span>✔️ Continuer vers le diagnostic</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTermsAccepted(false);
                        setIsParcoursInfoOpen(false);
                      }}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white text-gray-900 text-sm font-semibold border border-slate-200/70 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 inline-flex items-center justify-center"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section id="domains-section" className="py-14 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-purple-50/40 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="relative rounded-2xl bg-white/80 backdrop-blur-sm border border-emerald-200/70 shadow-sm ring-1 ring-black/5 p-5">
              <h2 className="text-sm font-bold text-emerald-900">Diagnostic Professionnel & Décision (obligatoire + Avis + Orientation + Parcours (5 phases))</h2>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="rounded-3xl bg-white/80 backdrop-blur-sm border border-slate-200/70 shadow-sm ring-1 ring-black/5 p-6">
                <p className="text-xs font-bold text-slate-700">SERVICE 1</p>
                <h3 className="mt-2 text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  Diagnostic Professionnel & Décision (obligatoire + Avis + Orientation + Parcours (5 phases))
                </h3>
                <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                  Service 1 = une évaluation professionnelle structurée + une décision + une intégration dans un parcours adapté.
                  <span className="block">Diagnostic, orientation et accompagnement professionnel organisé.</span>
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                  <div className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✔</span><span>Diagnostic + décision</span></div>
                  <div className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✔</span><span>Orientation + parcours</span></div>
                </div>

                <div className="mt-4 rounded-2xl bg-indigo-50 border border-indigo-200/70 px-4 py-3">
                  <p className="text-sm text-indigo-900 font-semibold">
                    Pas de NO-GO définitif : même un niveau débutant peut intégrer un parcours de fondations.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl bg-white/80 backdrop-blur-sm border border-slate-200/70 shadow-sm ring-1 ring-black/5 p-6">
                <p className="text-sm font-bold text-gray-900">En bref</p>
                <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                  Une logique simple : diagnostic → avis → intégration dans un parcours (phases 0 à 5).
                </p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3" dir="ltr">
                  <div className="rounded-2xl bg-slate-50 border border-slate-200/70 p-4">
                    <p className="text-xs font-bold text-slate-700">Diagnostic</p>
                    <p className="mt-1 text-sm text-gray-700">Évaluation approfondie</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 border border-slate-200/70 p-4">
                    <p className="text-xs font-bold text-slate-700">Avis</p>
                    <p className="mt-1 text-sm text-gray-700">Décision professionnelle claire</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 border border-slate-200/70 p-4">
                    <p className="text-xs font-bold text-slate-700">Parcours</p>
                    <p className="mt-1 text-sm text-gray-700">Intégration directe dans les phases 0→5</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-white border border-slate-200/70 px-3 py-1 text-xs font-semibold text-slate-700">Diagnostic : 5–7 jours</span>
                  <span className="inline-flex items-center rounded-full bg-white border border-slate-200/70 px-3 py-1 text-xs font-semibold text-slate-700">Parcours : ~7 semaines</span>
                  <span className="inline-flex items-center rounded-full bg-white border border-slate-200/70 px-3 py-1 text-xs font-semibold text-slate-700">100% online</span>
                </div>

                <p className="mt-4 text-xs font-semibold text-slate-700">Intitulé facture : Diagnostic professionnel & parcours d’orientation marketing</p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl bg-white/80 backdrop-blur-sm border border-slate-200/70 shadow-sm ring-1 ring-black/5 p-6" dir="ltr">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-700">🧭 Parcours Marketing — 5 Phases</p>
                  <h3 className="mt-2 text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                    (Même structure, quel que soit le niveau)
                  </h3>
                </div>
                <div className="rounded-full bg-slate-50 border border-slate-200/70 px-4 py-2 text-xs font-semibold text-slate-700 w-fit">
                  Des livrables clairs à chaque phase (documents)
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-gradient-to-b from-white to-slate-50 p-5 shadow-sm border border-gray-100 ring-1 ring-black/5">
                  <p className="text-xs font-bold text-purple-700">🟣 Phase 0 — Onboarding & Cadrage</p>
                  <p className="mt-3 text-sm text-gray-700">Définition du rôle cible + périmètre de responsabilité + méthode d’évaluation.</p>
                  <p className="mt-3 text-xs font-semibold text-gray-900">📄 Note de cadrage</p>
                </div>

                <div className="rounded-2xl bg-gradient-to-b from-white to-slate-50 p-5 shadow-sm border border-gray-100 ring-1 ring-black/5">
                  <p className="text-xs font-bold text-indigo-700">🟣 Phase 1 — Correction de la logique de réflexion</p>
                  <p className="mt-3 text-sm text-gray-700">Situations réalistes + décisions + analyse des erreurs.</p>
                  <p className="mt-3 text-xs font-semibold text-gray-900">📄 Fiche logique</p>
                </div>

                <div className="rounded-2xl bg-gradient-to-b from-white to-slate-50 p-5 shadow-sm border border-gray-100 ring-1 ring-black/5">
                  <p className="text-xs font-bold text-slate-700">🟣 Phase 2 — Stabilisation du comportement professionnel</p>
                  <p className="mt-3 text-sm text-gray-700">Pression + Budget + Deadlines.</p>
                  <p className="mt-3 text-xs font-semibold text-gray-900">📄 Analyse comportementale</p>
                </div>

                <div className="rounded-2xl bg-gradient-to-b from-white to-slate-50 p-5 shadow-sm border border-gray-100 ring-1 ring-black/5">
                  <p className="text-xs font-bold text-emerald-700">🟣 Phase 3 — Activation des compétences</p>
                  <p className="mt-3 text-sm text-gray-700">Les mêmes compétences, mais utilisation intelligente, sans enseignement.</p>
                  <p className="mt-3 text-xs font-semibold text-gray-900">📄 Synthèse d’activation</p>
                </div>

                <div className="rounded-2xl bg-gradient-to-b from-white to-slate-50 p-5 shadow-sm border border-gray-100 ring-1 ring-black/5">
                  <p className="text-xs font-bold text-amber-700">🟣 Phase 4 — Positionnement</p>
                  <p className="mt-3 text-sm text-gray-700">Comment communiquer, comment expliquer vos décisions, comment vous présenter.</p>
                  <p className="mt-3 text-xs font-semibold text-gray-900">📄 Note de positionnement</p>
                </div>

                <div className="rounded-2xl bg-gradient-to-b from-white to-slate-50 p-5 shadow-sm border border-gray-100 ring-1 ring-black/5">
                  <p className="text-xs font-bold text-rose-700">🟣 Phase 5 — Validation finale</p>
                  <p className="mt-3 text-sm text-gray-700">Comparaison avant/après + niveau de préparation + décision finale.</p>
                  <div className="mt-3 space-y-1 text-xs font-semibold text-gray-900">
                    <p>📄 Rapport final</p>
                    <p>📄 Avis professionnel</p>
                    <p>📄 Document de participation</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-indigo-200/70 shadow-sm ring-1 ring-black/5 p-6" dir="ltr">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-indigo-900">Bonus de compréhension métier — Ressources</p>
                  <p className="mt-2 text-sm text-gray-700">
                    Des ressources conçues pour accélérer la compréhension du domaine (réflexion + logique + responsabilité), pas des « cours » et pas des explications techniques.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-gradient-to-b from-white to-slate-50 border border-slate-200/70 p-5">
                  <p className="text-xs font-bold text-gray-900">1️⃣ 🧠 Jeux de réflexion métier (jeux de réflexion)</p>
                  <p className="mt-2 text-sm text-gray-700">Exercices de décision réalistes : sans correction directe, avec comparaison ensuite à une logique professionnelle.</p>
                </div>

                <div className="rounded-2xl bg-gradient-to-b from-white to-slate-50 border border-slate-200/70 p-5">
                  <p className="text-xs font-bold text-gray-900">2️⃣ 📚 Articles de cadrage professionnel</p>
                  <p className="mt-2 text-sm text-gray-700">Articles qui expliquent « comment pense une équipe professionnelle » (responsabilité de décision, rôles, logique d’évaluation des résultats).</p>
                </div>

                <div className="rounded-2xl bg-gradient-to-b from-white to-slate-50 border border-slate-200/70 p-5">
                  <p className="text-xs font-bold text-gray-900">3️⃣ 🧭 Domain Overview (vue d’ensemble du domaine)</p>
                  <p className="mt-2 text-sm text-gray-700">Une cartographie claire des rôles et des interactions : où se prend la décision et où commence le risque.</p>
                  <div className="mt-3 rounded-xl bg-indigo-50 border border-indigo-200/70 px-4 py-3">
                    <p className="text-xs font-semibold text-indigo-900">Exemple : Marketing ≠ Ads — Marketing = choix + priorités + arbitrage</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-white/10 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.7)] p-6" dir="ltr">
              <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                Nous ne sommes pas un centre de formation ni une usine à certificats.
                <span className="block mt-2 text-slate-200 font-normal">
                  Nous sommes une plateforme de diagnostic et d’accompagnement professionnel : nous construisons votre manière de penser et de décider, et nous transformons votre expérience en documents professionnels présentables sur le marché — plus solides que n’importe quel certificat appris par cœur.
                </span>
              </p>
            </div>

            <div className="mt-10 flex flex-col items-center">
              <button
                onClick={() => navigate("/diagnostic-wonder")}
                className="group w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white text-sm sm:text-base font-semibold rounded-full shadow-[0_14px_30px_-18px_rgba(79,70,229,0.7)] hover:shadow-[0_20px_44px_-22px_rgba(79,70,229,0.85)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center justify-center"
              >
                <span>Commencer le diagnostic</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="mt-3 text-sm text-gray-600 text-center max-w-2xl">
                Ensuite : accéder aux ressources bonus.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="parcours-section" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                🟣 Diagnostic &amp; Professional Transformation
              </h2>
              <p className="text-lg sm:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
                Clarity, positioning, and real operational missions — not training.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                <div className="col-span-full text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-3 text-gray-600">Chargement des parcours...</p>
                </div>
              ) : programs.length === 0 ? (
                <div className="col-span-full text-center py-10">
                  <p className="text-gray-600">Aucun parcours disponible pour le moment.</p>
                </div>
              ) : (
                programs.map((program) => (
                  <div
                    key={program.id}
                    data-program-id={program.id}
                    className="group rounded-3xl bg-white border border-slate-200/70 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ring-1 ring-black/5 p-6"
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200/70 px-3 py-1 text-xs font-semibold text-slate-700">
                        <span>
                          {typeof program.category === "string"
                            ? program.category
                            : program.category?.name || "Parcours"}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-800 border border-amber-200/70 px-3 py-1 text-[11px] font-semibold">
                          Prix après diagnostic
                        </span>
                        <span className="text-[11px] text-gray-500">Estimation personnalisée</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{program.title}</h3>
                    <div className="h-2" />

                    <button
                      type="button"
                      onClick={() => {
                        setTermsAccepted(false);
                        setIsParcoursInfoOpen(true);
                      }}
                      className="mt-6 w-full px-5 py-3 rounded-2xl bg-white text-gray-900 text-sm font-semibold border border-slate-200/70 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 inline-flex items-center justify-center gap-2"
                    >
                      <span>Plus d’informations</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                🗣️ Témoignages — Expériences professionnelles
              </h2>
              <p className="text-lg text-gray-700">Des parcours analysés avec rigueur.</p>
              <p className="text-lg text-gray-700">Des décisions prises en connaissance de cause.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className="rounded-3xl bg-white/80 backdrop-blur-sm border border-slate-200/80 shadow-[0_18px_55px_-38px_rgba(15,23,42,0.35)] ring-1 ring-black/5 p-7"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold">
                    AK
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900">Amine K.</p>
                    <p className="text-sm text-gray-700">Fonction : Qualité, Sécurité &amp; Process</p>
                    <p className="text-sm text-gray-600">Domaine : Industrie / Management opérationnel</p>
                  </div>
                </div>
                <div className="mt-5">
                  <blockquote className="text-gray-800 leading-relaxed italic">
                    « Le diagnostic m’a permis de comprendre pourquoi certaines décisions étaient incohérentes avec mon niveau réel de responsabilité.
                    L’accompagnement n’a pas cherché à me rassurer, mais à structurer ma posture professionnelle. »
                  </blockquote>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="rounded-3xl bg-white/80 backdrop-blur-sm border border-slate-200/80 shadow-[0_18px_55px_-38px_rgba(15,23,42,0.35)] ring-1 ring-black/5 p-7"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold">
                    RT
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900">Rania T.</p>
                    <p className="text-sm text-gray-700">Fonction : Marketing &amp; Communication</p>
                    <p className="text-sm text-gray-600">Domaine : Digital / Positionnement professionnel</p>
                  </div>
                </div>
                <div className="mt-5">
                  <blockquote className="text-gray-800 leading-relaxed italic">
                    « Ce parcours m’a aidée à clarifier ma manière de décider et à mieux défendre mes choix face à des contraintes réelles.
                    Ce n’est pas une formation, c’est un cadre de réflexion appliqué à des situations concrètes. »
                  </blockquote>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="rounded-3xl bg-white/80 backdrop-blur-sm border border-slate-200/80 shadow-[0_18px_55px_-38px_rgba(15,23,42,0.35)] ring-1 ring-black/5 p-7"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-600 to-amber-600 text-white flex items-center justify-center font-bold">
                    SG
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900">Sami G.</p>
                    <p className="text-sm text-gray-700">Fonction : Développement Web</p>
                    <p className="text-sm text-gray-600">Domaine : Environnements techniques &amp; projets</p>
                  </div>
                </div>
                <div className="mt-5">
                  <blockquote className="text-gray-800 leading-relaxed italic">
                    « L’approche est directe et exigeante.
                    On ne reçoit pas de solutions toutes faites, mais une lecture claire de ce qui est faisable ou non à un instant donné. »
                  </blockquote>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200 shadow-sm ring-1 ring-black/5">
                <Compass className="w-4 h-4 text-indigo-700" />
                <span className="text-xs sm:text-sm font-semibold text-slate-700">🧭 منظومة MA Consulting الرقمية</span>
              </div>

              <h2 className="mt-5 font-display text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                Une plateforme professionnelle structurée
              </h2>

              <p className="mt-4 text-base sm:text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
                MA Consulting s’appuie sur une منظومة رقمية مغلقة et organisée, construite autour du diagnostic, de l’accompagnement
                et de la vérification professionnelle — sans proposer de cours, de formation, ni de certifications éducatives.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={openEspaceParticipant}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm sm:text-base font-semibold shadow-[0_14px_34px_-22px_rgba(79,70,229,0.65)] hover:shadow-[0_18px_46px_-24px_rgba(79,70,229,0.8)] transition-all duration-300"
                >
                  <Users className="w-4 h-4" />
                  <span>Espace Participant</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={openEspaceVerification}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white text-gray-900 text-sm sm:text-base font-semibold border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300"
                >
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Espace Vérification</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className="relative rounded-3xl bg-slate-50 border border-slate-200/80 shadow-sm ring-1 ring-black/5 p-7 overflow-hidden"
              >
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-violet-500/10 via-transparent to-indigo-500/10" />
                <div className="relative">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-violet-600/20">
                      <Search className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Espace Diagnostic</h3>
                      <p className="text-sm font-semibold text-gray-700">Porte d’entrée unique de la منظومة</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4 text-sm text-gray-700 leading-relaxed">
                    <div>
                      <p className="font-semibold text-gray-900">Contient</p>
                      <ul className="mt-2 space-y-1">
                        <li>Diagnostic professionnel gratuit (4 systèmes d’évaluation)</li>
                        <li>Questionnaires et scénarios réalistes selon le domaine</li>
                        <li>Analyse du raisonnement, de la décision et de la préparation professionnelle</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Objectif</p>
                      <ul className="mt-2 space-y-1">
                        <li>Déterminer le niveau réel</li>
                        <li>Proposer un parcours adapté</li>
                        <li>Orienter avant tout engagement</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Sorties</p>
                      <ul className="mt-2 space-y-1">
                        <li>Rapport préliminaire (PDF)</li>
                        <li>Niveau estimé</li>
                        <li>Orientation générale + suggestion de parcours</li>
                      </ul>
                    </div>
                    <p className="pt-2 text-xs text-gray-600">
                      Aucune documentation professionnelle validée n’est émise à cette étape.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative rounded-3xl bg-white border border-slate-200/80 shadow-sm ring-1 ring-black/5 p-7 overflow-hidden"
              >
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10" />
                <div className="relative">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Espace Participant</h3>
                      <p className="text-sm font-semibold text-gray-700">Accès après acceptation en parcours (Service 1)</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4 text-sm text-gray-700 leading-relaxed">
                    <div>
                      <p className="font-semibold text-gray-900">Contient</p>
                      <ul className="mt-2 space-y-1">
                        <li>Parcours complet (5 phases)</li>
                        <li>Situations professionnelles et questions d’analyse</li>
                        <li>Journal de progression</li>
                        <li>Ressources de compréhension métier (non éducatives)</li>
                        <li>Rapports intermédiaires et finaux</li>
                        <li>Enregistrements des séances (si Service 2)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Objectif</p>
                      <ul className="mt-2 space-y-1">
                        <li>Développer un raisonnement et une posture professionnels</li>
                        <li>Suivre la progression réelle</li>
                        <li>Construire une valeur présentable dans un cadre entreprise</li>
                      </ul>
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={openEspaceParticipant}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200/70 text-emerald-900 font-semibold hover:bg-emerald-100 transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span>Accéder à l’espace participant</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="relative rounded-3xl bg-slate-50 border border-slate-200/80 shadow-sm ring-1 ring-black/5 p-7 overflow-hidden"
              >
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-indigo-500/10 via-transparent to-blue-500/10" />
                <div className="relative">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Espace Vérification</h3>
                      <p className="text-sm font-semibold text-gray-700">Destiné aux entreprises et institutions</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4 text-sm text-gray-700 leading-relaxed">
                    <div>
                      <p className="font-semibold text-gray-900">Permet</p>
                      <ul className="mt-2 space-y-1">
                        <li>Vérifier l’authenticité des documents professionnels</li>
                        <li>Confirmer la participation, le parcours et la période</li>
                        <li>Consulter la nature du document</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Mécanisme</p>
                      <ul className="mt-2 space-y-1">
                        <li>Identifiant unique</li>
                        <li>Code de vérification</li>
                        <li>Résultat immédiat après saisie</li>
                      </ul>
                    </div>
                    <p className="pt-2 text-xs text-gray-600">
                      Les documents ne sont pas des diplômes ni des certificats de formation, mais des documents professionnels vérifiables.
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={openEspaceVerification}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-gray-900 font-semibold hover:border-slate-300 hover:shadow-sm transition-all"
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span>Accéder à la vérification</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-10 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-7 shadow-[0_26px_70px_-46px_rgba(2,6,23,0.75)] ring-1 ring-white/10"
            >
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-2xl bg-white/10 text-white flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold">Gestion des documents professionnels</h3>
                  <p className="mt-2 text-white/90 leading-relaxed">
                    Les documents peuvent être disponibles dans l’Espace Participant, vérifiables via l’Espace Vérification, ou envoyés par e-mail
                    selon le type de document, la phase du parcours et l’objectif professionnel.
                  </p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-white/90">
                    <div className="rounded-2xl bg-white/10 border border-white/10 p-4">Disponibles dans l’Espace Participant</div>
                    <div className="rounded-2xl bg-white/10 border border-white/10 p-4">Vérifiables via code unique</div>
                    <div className="rounded-2xl bg-white/10 border border-white/10 p-4">Envoi possible par e-mail</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="mt-10 max-w-4xl mx-auto rounded-3xl bg-slate-50 border border-slate-200/80 p-7 shadow-sm ring-1 ring-black/5">
              <h3 className="text-lg font-bold text-gray-900">Synthèse</h3>
              <p className="mt-2 text-gray-700 leading-relaxed">
                MA Consulting fournit un système professionnel intégré : diagnostic, accompagnement et vérification.
                La documentation est gérée via l’Espace Participant, l’Espace Vérification ou l’e-mail, sans cours, sans formation, et sans diplômes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="packs-section" className="py-20 bg-gradient-to-b from-white via-slate-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm ring-1 ring-black/5">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span className="text-xs sm:text-sm font-semibold text-slate-700">📌 Service 2 — Mission Opérationnelle</span>
              </div>

              <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4 mt-5 tracking-tight">
                Mission Opérationnelle
                <span className="block text-xl sm:text-2xl md:text-3xl font-bold text-gradient bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mt-3">
                  Appliquer dans le réel. Tester sans risque.
                </span>
              </h2>

              <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Service activé uniquement après diagnostic validé (Service 1).
              </p>

              <div className="mt-6 max-w-4xl mx-auto rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-8" dir="ltr">
                <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                  Nous transformons l’analyse et le diagnostic en décisions, actions et résultats évaluables.
                </p>
                <p className="mt-3 text-sm sm:text-base text-gray-700 leading-relaxed">
                  Après le diagnostic, certains participants ont besoin d’une mise en application concrète ou d’un test réaliste.
                  <span className="font-semibold text-gray-900"> Le Service 2</span> propose deux trajectoires claires :
                  <span className="font-semibold text-gray-900"> Mission Réelle</span> ou
                  <span className="font-semibold text-gray-900"> Mission Simulée</span> — selon votre situation professionnelle.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <div className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-8 overflow-hidden flex flex-col">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10" />
                <div className="relative">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Mission Réelle</h3>
                      <p className="text-sm font-semibold text-emerald-900">🟢 Travail réel dans votre contexte professionnel</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/70 p-4" dir="ltr">
                      <p className="text-sm font-bold text-emerald-900 mb-2">Pour qui ?</p>
                      <ul className="space-y-1 text-sm text-gray-800">
                        <li>Vous travaillez déjà sur un poste ou un projet</li>
                        <li>Vous avez des missions réelles et des responsabilités</li>
                        <li>Vous souhaitez améliorer votre manière de décider et d’exécuter</li>
                      </ul>
                    </div>

                    <div className="rounded-2xl bg-white/70 border border-slate-200/70 p-4" dir="ltr">
                      <p className="text-sm font-bold text-gray-900 mb-2">Que se passe-t-il ?</p>
                      <ul className="space-y-1 text-sm text-gray-800">
                        <li>Nous travaillons sur votre situation réelle</li>
                        <li>Les mêmes défis, la même pression</li>
                        <li>Analyse de la décision + orientation stratégique</li>
                      </ul>
                    </div>

                    <div className="rounded-2xl bg-slate-50/70 border border-slate-200/70 p-4" dir="ltr">
                      <p className="text-sm font-bold text-gray-900 mb-2">Livrables professionnels</p>
                      <ul className="space-y-1 text-sm text-gray-800">
                        <li>Document de mission réelle</li>
                        <li>Roadmap opérationnelle</li>
                        <li>Synthèse stratégique</li>
                        <li>Documents présentables dans un cadre professionnel</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200/70 px-4 py-2 text-sm text-emerald-900 font-semibold">
                    <Shield className="w-4 h-4" />
                    <span>🔒 Disponible après diagnostic validé</span>
                  </div>
                </div>

                <div className="relative mt-6 pt-6 border-t border-slate-200/70 flex items-center justify-between gap-3">
                  <div className="text-sm text-gray-700 font-semibold">👉 Bouton :</div>
                  <button
                    type="button"
                    onClick={() => openService2MissionRequest("reelle")}
                    className="group w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold shadow-[0_14px_34px_-22px_rgba(16,185,129,0.75)] hover:shadow-[0_18px_46px_-24px_rgba(16,185,129,0.9)] transition-all duration-300 inline-flex items-center justify-center gap-2"
                  >
                    <span>Commencer votre mission réelle</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              <div className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-8 overflow-hidden flex flex-col">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
                <div className="relative">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Mission Simulée</h3>
                      <p className="text-sm font-semibold text-indigo-900">🟣 Simulation réaliste sans risque</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-2xl bg-indigo-50/70 border border-indigo-200/70 p-4" dir="ltr">
                      <p className="text-sm font-bold text-indigo-900 mb-2">Pour qui ?</p>
                      <ul className="space-y-1 text-sm text-gray-800">
                        <li>Vous ne travaillez pas encore dans le domaine</li>
                        <li>Vous voulez tester le rôle avant de vous engager</li>
                        <li>Vous souhaitez évaluer sérieusement votre niveau de préparation</li>
                      </ul>
                    </div>

                    <div className="rounded-2xl bg-white/70 border border-slate-200/70 p-4" dir="ltr">
                      <p className="text-sm font-bold text-gray-900 mb-2">Que se passe-t-il ?</p>
                      <ul className="space-y-1 text-sm text-gray-800">
                        <li>Scénario professionnel 100% réaliste</li>
                        <li>Décisions réelles dans un environnement sécurisé</li>
                        <li>Analyse de la pensée et du comportement professionnel</li>
                      </ul>
                    </div>

                    <div className="rounded-2xl bg-slate-50/70 border border-slate-200/70 p-4" dir="ltr">
                      <p className="text-sm font-bold text-gray-900 mb-2">Livrables professionnels</p>
                      <ul className="space-y-1 text-sm text-gray-800">
                        <li>Document de mission simulée</li>
                        <li>Analyse décisionnelle</li>
                        <li>Avis de préparation</li>
                        <li>Rapport téléchargeable</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-200/70 px-4 py-2 text-sm text-indigo-900 font-semibold">
                    <Shield className="w-4 h-4" />
                    <span>🔒 Disponible après diagnostic validé</span>
                  </div>
                </div>

                <div className="relative mt-6 pt-6 border-t border-slate-200/70 flex items-center justify-between gap-3">
                  <div className="text-sm text-gray-700 font-semibold">👉 Bouton :</div>
                  <button
                    type="button"
                    onClick={() => openService2MissionRequest("simulee")}
                    className="group w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow-[0_14px_34px_-22px_rgba(79,70,229,0.75)] hover:shadow-[0_18px_46px_-24px_rgba(79,70,229,0.9)] transition-all duration-300 inline-flex items-center justify-center gap-2"
                  >
                    <span>Commencer la mission simulée</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-8" dir="ltr">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Mission Réelle ou Mission Simulée — comment choisir ?</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/70 p-5" dir="ltr">
                  <p className="text-sm font-bold text-emerald-900 mb-3">Mission Réelle</p>
                  <ul className="space-y-2 text-sm text-gray-800">
                    <li>Situation professionnelle réelle</li>
                    <li>Application directe</li>
                    <li>Liée à votre poste</li>
                    <li>Décisions réelles</li>
                  </ul>
                </div>

                <div className="rounded-2xl bg-indigo-50/70 border border-indigo-200/70 p-5" dir="ltr">
                  <p className="text-sm font-bold text-indigo-900 mb-3">Mission Simulée</p>
                  <ul className="space-y-2 text-sm text-gray-800">
                    <li>Situation professionnelle simulée</li>
                    <li>Test sans risque</li>
                    <li>Préparation avant l’entrée</li>
                    <li>Décisions encadrées</li>
                  </ul>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-200/70 px-5 py-4" dir="ltr">
                <p className="text-sm text-gray-800 font-semibold">
                  Le diagnostic professionnel détermine la trajectoire la plus adaptée.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 px-6 py-6 text-white shadow-[0_18px_50px_-28px_rgba(30,64,175,0.7)]" dir="ltr">
              <p className="text-sm sm:text-base font-semibold leading-relaxed">
                Nous ne proposons ni formation technique ni cours. Ce service se concentre sur la décision, la méthode et la pensée professionnelle, en contexte réel ou simulé.
              </p>
            </div>

            <div className="mt-10 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-8 text-center" dir="ltr">
              <p className="text-sm sm:text-base text-gray-900 font-bold">Vous ne pouvez pas accéder directement.</p>
              <p className="mt-2 text-sm sm:text-base text-gray-700">Commencez toujours par le diagnostic professionnel.</p>

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => navigate("/diagnostic-wonder")}
                  className="group w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white text-sm sm:text-base font-semibold shadow-[0_14px_30px_-18px_rgba(79,70,229,0.7)] hover:shadow-[0_20px_44px_-22px_rgba(79,70,229,0.85)] transition-all duration-300 inline-flex items-center justify-center gap-2"
                >
                  <span>Commencer par le diagnostic professionnel</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="professional-simulation-section" className="py-14 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm ring-1 ring-black/5" dir="ltr">
                <Lightbulb className="w-4 h-4 text-indigo-600" />
                <span className="text-xs sm:text-sm font-semibold text-slate-700">🧠 Écosystème de situations professionnelles & projets quasi-réels</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mt-5 mb-4 tracking-tight" dir="ltr">
                Un espace professionnel pour penser et appliquer — pas pour former, ni exécuter
              </h2>
              <p className="text-base sm:text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed" dir="ltr">
                Nous ne nous limitons pas au diagnostic ou à l’orientation. Après être passés par les services MA Consulting, les participants intègrent un écosystème professionnel fermé
                conçu pour simuler le réel métier sans le transformer en formation classique, ni en exploitation commerciale.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <div className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-8 overflow-hidden" dir="ltr">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
                <div className="relative">
                  <p className="text-sm font-bold text-gray-900">Qu’est-ce que cet écosystème ?</p>
                  <p className="mt-3 text-sm sm:text-base text-gray-700 leading-relaxed">
                    C’est un espace de mise en situation professionnelle qui vous place dans des cas proches de l’environnement de travail réel, selon votre niveau, le rôle visé et les résultats du diagnostic que vous avez réalisé.
                  </p>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-slate-50 border border-slate-200/70 p-4">
                      <p className="text-sm font-bold text-gray-900 mb-1">✅ Ce n’est pas une formation</p>
                      <p className="text-sm text-gray-700">Aucun cours, aucun contenu pédagogique.</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 border border-slate-200/70 p-4">
                      <p className="text-sm font-bold text-gray-900 mb-1">✅ Ce n’est pas de l’exécution commerciale</p>
                      <p className="text-sm text-gray-700">Aucune vente de prestations, aucun engagement client.</p>
                    </div>
                    <div className="rounded-2xl bg-indigo-50/70 border border-indigo-200/70 p-4">
                      <p className="text-sm font-bold text-indigo-900 mb-1">🧠 Simulation intelligente</p>
                      <p className="text-sm text-gray-700">Un réel professionnel analysé avec lucidité.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-8 overflow-hidden" dir="ltr">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10" />
                <div className="relative">
                  <p className="text-sm font-bold text-gray-900">🎯 Objectif de l’écosystème</p>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/70 border border-slate-200/70 p-4">
                      <p className="text-sm font-bold text-gray-900">Ancrer une méthode de pensée professionnelle</p>
                      <p className="mt-1 text-sm text-gray-700">Pas des informations… mais une logique de décision.</p>
                    </div>
                    <div className="rounded-2xl bg-white/70 border border-slate-200/70 p-4">
                      <p className="text-sm font-bold text-gray-900">Tester les décisions dans des situations réalistes</p>
                      <p className="mt-1 text-sm text-gray-700">Expérimenter sans risque.</p>
                    </div>
                    <div className="rounded-2xl bg-white/70 border border-slate-200/70 p-4">
                      <p className="text-sm font-bold text-gray-900">Développer le comportement et le positionnement dans le rôle</p>
                      <p className="mt-1 text-sm text-gray-700">Comment agir… et comment justifier.</p>
                    </div>
                    <div className="rounded-2xl bg-white/70 border border-slate-200/70 p-4">
                      <p className="text-sm font-bold text-gray-900">Relier les compétences à leur bon usage</p>
                      <p className="mt-1 text-sm text-gray-700">Pas par mémorisation, ni par cours.</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 px-5 py-4 text-white">
                    <p className="text-sm font-semibold leading-relaxed">
                      Des situations professionnelles intelligentes, sans cours, sans exploitation — uniquement un réel professionnel pensé avec lucidité.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-8" dir="ltr">
              <div className="flex items-start gap-3 mb-6">
                <div className="h-11 w-11 rounded-2xl bg-indigo-50 border border-indigo-200/70 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-indigo-700" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-gray-900">🧩 Comment cela se passe concrètement ?</h3>
                  <p className="text-sm text-gray-700 mt-1">Selon votre domaine et votre niveau… nous vous plaçons dans des situations proches du réel métier.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-slate-50 border border-slate-200/70 p-5">
                  <p className="text-sm font-bold text-gray-900 mb-2">Vous recevez des situations</p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>Des situations professionnelles quasi-réelles</li>
                    <li>Des scénarios de décision</li>
                    <li>Des tâches qui représentent ce qui se passe réellement dans un poste ou une équipe</li>
                  </ul>
                </div>

                <div className="rounded-2xl bg-white/70 border border-slate-200/70 p-5">
                  <p className="text-sm font-bold text-gray-900 mb-2">Chaque situation exige</p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="mt-1 text-emerald-700 font-bold">✓</span>
                      <p className="text-sm text-gray-700">Réflexion</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 text-emerald-700 font-bold">✓</span>
                      <p className="text-sm text-gray-700">Décision</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 text-emerald-700 font-bold">✓</span>
                      <p className="text-sm text-gray-700">Justification</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-amber-50/70 border border-amber-200/70 p-5">
                  <p className="text-sm font-bold text-amber-900 mb-2">📌 Important</p>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    C’est un espace de simulation et de développement professionnel…
                    <span className="font-semibold text-gray-900"> pas une formation classique</span>,
                    et pas de l’exécution commerciale.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-3xl bg-white/70 border border-slate-200/70 p-6">
                  <p className="text-sm font-bold text-gray-900">Exemple 1 — Assistant marketing</p>
                  <ul className="mt-3 space-y-2 text-sm text-gray-700">
                    <li>Comment gérer une demande non claire ?</li>
                    <li>Comment préparer un plan simple ?</li>
                    <li>Comment justifier votre décision ?</li>
                  </ul>
                </div>
                <div className="rounded-3xl bg-white/70 border border-slate-200/70 p-6">
                  <p className="text-sm font-bold text-gray-900">Exemple 2 — Développement web / support technique</p>
                  <ul className="mt-3 space-y-2 text-sm text-gray-700">
                    <li>Comment recevoir l’information du client ?</li>
                    <li>Comment la traduire techniquement pour l’équipe ?</li>
                    <li>Comment réagir face au flou ou à la pression ?</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch" dir="ltr">
              <div className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-8 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10" />
                <div className="relative">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">1️⃣ 💬 Espace d’interaction professionnelle (WhatsApp / Telegram)</h3>
                      <p className="text-sm text-gray-700 mt-1">Groupe professionnel fermé, filtré et orienté.</p>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-gray-900">Quel est son rôle ?</p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-700">
                    <li>Partager des situations professionnelles réelles</li>
                    <li>Discuter des décisions et des trajectoires</li>
                    <li>Partager des ressources sélectionnées</li>
                    <li>Orientation générale par les experts (non pédagogique)</li>
                  </ul>

                  <div className="mt-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 px-4 py-3">
                    <p className="text-sm text-emerald-900 font-semibold">📌 Ce n’est pas un groupe de discussion, ni un espace d’enseignement, ni du coaching gratuit</p>
                    <p className="mt-1 text-sm text-gray-800">C’est un espace : réflexion + échange + maturité professionnelle.</p>
                  </div>
                </div>
              </div>

              <div className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-8 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
                <div className="relative">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">2️⃣ 🧩 Espace opérationnel numérique (Espace Opérationnel)</h3>
                      <p className="text-sm text-gray-700 mt-1">Un espace dans la plateforme comparable à des espaces de travail professionnels… mais ce n’est ni du freelance, ni de l’exécution commerciale.</p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/70 border border-slate-200/70 p-4">
                    <p className="text-sm font-bold text-gray-900">Nom proposé</p>
                    <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                      <span className="font-semibold text-gray-900">Espace Opérationnel Professionnel</span> (proposition), ou : Espace de Mise en Situation / Espace Pratique Métier.
                    </p>
                  </div>

                  <p className="mt-4 text-sm font-semibold text-gray-900">🎯 Que se passe-t-il dans l’espace opérationnel ?</p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-700">
                    <li>Le participant est placé dans des situations quasi-réelles</li>
                    <li>Il réalise des tâches liées à son rôle et à son niveau</li>
                    <li>Il apprend : décider, justifier et agir sous pression</li>
                  </ul>

                  <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-200/70 px-4 py-3">
                    <p className="text-sm text-gray-900 font-semibold">📌 Il n’y a pas :</p>
                    <ul className="mt-2 space-y-1 text-sm text-gray-700">
                      <li>❌ Exécution réelle avec des clients</li>
                      <li>❌ Vente de services</li>
                      <li>❌ Engagement commercial</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-8" dir="ltr">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-slate-50 border border-slate-200/70 p-5">
                  <p className="text-sm font-bold text-gray-900 mb-2">🧑‍💼 Rôle des experts</p>
                  <p className="text-sm text-gray-700">Interne : crée les situations + analyse la décision et le comportement + propose des améliorations.</p>
                  <p className="mt-2 text-sm text-gray-700">Externe : intervient si nécessaire et propose des sessions en direct (optionnelles + payantes).</p>
                </div>

                <div className="rounded-2xl bg-white/70 border border-slate-200/70 p-5">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-indigo-700 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">📁 Propriété & transparence</p>
                      <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                        Tous les projets et situations sont fictifs ou quasi-réels, et ont pour seul objectif le développement professionnel.
                        <span className="font-semibold text-gray-900"> Ils restent la propriété du participant</span>, ne sont pas exploités commercialement, ne sont pas vendus et ne sont pas attribués à l’entreprise.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/70 p-5">
                  <p className="text-sm font-bold text-emerald-900 mb-2">🎁 Accès à l’espace (Bonus exclusif)</p>
                  <ul className="space-y-1 text-sm text-gray-800">
                    <li>✔ Réservé uniquement aux participants</li>
                    <li>✔ Conditionné par l’achat de Service 1 et Service 2</li>
                    <li>✔ Offert comme valeur ajoutée</li>
                    <li>✔ Non ouvert au public</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 px-6 py-5 text-white">
                <p className="text-sm sm:text-base font-semibold leading-relaxed">
                  Nous ne créons pas des freelances… et nous ne vendons pas de l’exécution. Nous construisons des <span className="text-emerald-300">esprits professionnels</span> capables de penser et d’agir dans n’importe quel environnement de travail.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive QCM Modal */}
      <InteractiveQCMModal
        isOpen={showUnifiedCatalogModal}
        onClose={() => setShowUnifiedCatalogModal(false)}
        onItemSelect={handleUnifiedCatalogItemSelection}
        catalogItems={createUnifiedCatalog()}
      />

      {/* Certificate Verification Modal */}

      {/* Free Course Modal */}
      <FreeCourseModal
        isOpen={showFreeCourseModal}
        onClose={() => setShowFreeCourseModal(false)}
      />

      {/* Program Registration Modal */}
      <ProgramRegistrationModal
        isOpen={showProgramModal}
        onClose={() => setShowProgramModal(false)}
        program={selectedProgram}
        selectedCurrency="€"
      />

      {/* Custom CSS for animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          
          @keyframes gradient {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          
          @keyframes pulse-glow {
            0%, 100% {
              box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
            }
            50% {
              box-shadow: 0 0 40px rgba(147, 51, 234, 0.5);
            }
          }
          
          .animate-blob {
            animation: blob 7s infinite;
          }
          
          .animate-gradient {
            animation: gradient 3s ease infinite;
          }
          
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          
          /* Smooth scrolling */
          html {
            scroll-behavior: smooth;
          }
          
          /* Custom scrollbar */
          ::-webkit-scrollbar {
            width: 10px;
          }
          
          ::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #2563eb, #9333ea);
            border-radius: 5px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #1d4ed8, #7e22ce);
          }
          
          /* Enhanced focus states for accessibility */
          *:focus-visible {
            outline: 2px solid #2563eb;
            outline-offset: 2px;
          }
          
          /* Smooth transitions for all interactive elements */
          button, a, input, select, textarea {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
        `
      }} />
    </div>
  );
};

export default ETrainingPage;
