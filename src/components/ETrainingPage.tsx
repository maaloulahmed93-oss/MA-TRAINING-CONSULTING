import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {
  Users,
  Shield,
  Lightbulb,
  CheckCircle,
  Award,
  ArrowLeft,
  ArrowRight,
  Clock,
  Star,
  BookOpen,
  TrendingUp,
  Briefcase,
  FileText,
  Mail,
  ChevronRight
} from "lucide-react";
import { testimonialsApiService, TestimonialData } from "../services/testimonialsApiService";
import CertificateVerification from "./CertificateVerification";
import FreeCourseModal from "./FreeCourseModal";
import ProgramRegistrationModal from "./ProgramRegistrationModal";
import ProgramCard from "./ProgramCard";
import ThemePackSection from "./ThemePackSection";
import InteractiveQCMModal from "./InteractiveQCMModal";
import { Program, getTrainingPrograms } from "../data/trainingPrograms";
import { getPacksWithFallback } from "../services/packsApi";

interface ETrainingPageProps {
  onBack: () => void;
}

const ETrainingPage: React.FC<ETrainingPageProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [showUnifiedCatalogModal, setShowUnifiedCatalogModal] = useState(false);
  const [showCertificateVerification, setShowCertificateVerification] = useState(false);
  const [showFreeCourseModal, setShowFreeCourseModal] = useState(false);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  
  // States pour les témoignages
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);
  
  // State for dynamic data
  const [programs, setPrograms] = useState<Program[]>([]);
  const [packs, setPacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load testimonials from API
  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        setTestimonialsLoading(true);
        console.log('🔄 Chargement des témoignages depuis l\'API...');
        
        // Vérifier la connexion API
        const connected = await testimonialsApiService.checkConnection();
        setApiConnected(connected);
        
        // Charger les témoignages
        const data = await testimonialsApiService.getPublishedTestimonials();
        setTestimonials(data);
        
        console.log(`✅ ${data.length} témoignages chargés`);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des témoignages:', error);
      } finally {
        setTestimonialsLoading(false);
      }
    };

    loadTestimonials();
  }, []);

  // Load programs, packs and categories from API on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load programs
        const apiPrograms = await getTrainingPrograms();
        setPrograms(apiPrograms as Program[]);
        
        // Load packs
        const apiPacks = await getPacksWithFallback();
        setPacks(apiPacks);
      } catch (error) {
        console.error('Error loading data:', error);
        // Keep fallback data if API fails
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Fonction pour gérer l'ouverture du modal d'inscription
  const handleProgramRegistration = (program: Program) => {
    setSelectedProgram(program);
    setShowProgramModal(true);
  };

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

    // Ajouter les packs
    packs.forEach((pack) => {
      catalogItems.push({
        id: `pack-${pack.packId}`,
        name: pack.name,
        type: "pack",
        category: pack.name.includes("Marketing")
          ? "Marketing"
          : pack.name.includes("Développement")
          ? "Technologies"
          : pack.name.includes("Data Science")
          ? "Data Science"
          : pack.name.includes("Design")
          ? "Design"
          : "Business",
        price: pack.details.price,
        originalPrice: pack.details.originalPrice,
        savings: pack.details.savings,
        description: pack.description,
        themes: pack.details.themes.length,
      });
    });

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

  // Hero Section Data
  const heroCards = [
    {
      icon: Users,
      title: "Espace Participant",
      subtitle: "Accédez à votre espace d'accompagnement",
      buttonText: "Accéder maintenant",
      color: "blue",
    },
    {
      icon: Shield,
      title: "Vérification de Participation",
      subtitle: "Confirmez l'authenticité des documents liés à un parcours d'accompagnement",
      buttonText: "Consulter maintenant",
      color: "purple",
    },
    {
      icon: Lightbulb,
      title: "Diagnostic Gratuit (Obligatoire)",
      subtitle: "Analyse complète de votre niveau avant votre parcours",
      buttonText: "Lancer le diagnostic",
      color: "yellow",
    },
  ];

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
      <section className="relative py-10 sm:py-14 lg:py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-yellow-50 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center lg:items-start">
              {/* Left Content */}
              <div className="text-center lg:text-left order-1 lg:order-1">
                <div className="relative rounded-3xl bg-white/60 backdrop-blur-xl border border-white/70 shadow-[0_24px_70px_-35px_rgba(17,24,39,0.28)] ring-1 ring-black/5 p-6 sm:p-8 lg:p-10">
                  {/* Badge */}
                  <div className="inline-flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm ring-1 ring-black/5 mb-6">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
                    <span className="text-sm font-medium text-gray-700">Diagnostic gratuit disponible</span>
                  </div>

                  <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-[1.12] tracking-tight break-words max-w-3xl mx-auto lg:mx-0">
                    Accompagnement professionnel fondé sur le diagnostic et l'expertise terrain
                  </h1>

                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 mb-6 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    Nous analysons votre situation réelle, votre manière de décider et vos compétences existantes,
                    puis nous construisons un accompagnement professionnel ciblé — sans formation classique.
                  </p>

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 mb-6 max-w-2xl mx-auto lg:mx-0">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] sm:text-xs md:text-sm font-semibold bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200/60 text-gray-900 text-center leading-snug shadow-sm">
                      Diagnostic professionnel
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] sm:text-xs md:text-sm font-semibold bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/60 text-gray-900 text-center leading-snug shadow-sm">
                      Analyse décisionnelle
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] sm:text-xs md:text-sm font-semibold bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 text-gray-900 text-center leading-snug shadow-sm">
                      Accompagnement stratégique
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] sm:text-xs md:text-sm font-semibold bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/60 text-gray-900 text-center leading-snug shadow-sm">
                      Développement en situation réelle
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
                    <button
                      onClick={() => setShowFreeCourseModal(true)}
                      className="group w-full sm:w-auto px-5 sm:px-7 py-3 sm:py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white text-sm sm:text-base font-semibold rounded-full shadow-[0_14px_30px_-18px_rgba(79,70,229,0.7)] hover:shadow-[0_20px_44px_-22px_rgba(79,70,229,0.85)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center ring-1 ring-white/10"
                    >
                      <span>🟣 Démarrer mon diagnostic professionnel</span>
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                      onClick={() => document.getElementById('domains-section')?.scrollIntoView({ behavior: 'smooth' })}
                      className="w-full sm:w-auto px-5 sm:px-7 py-3 sm:py-3.5 bg-white/85 backdrop-blur-sm text-gray-900 text-sm sm:text-base font-semibold rounded-full border border-gray-200 hover:border-purple-300 hover:bg-white transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-lg"
                    >
                      <span>Découvrir nos domaines d’intervention</span>
                    </button>
                  </div>

                  {/* Social Proof - Enhanced */}
                  <div className="mt-8 space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6">
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
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                      <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-200/70 ring-1 ring-black/5">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-semibold text-green-700">Certifié qualité</span>
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
              </div>

              {/* Right - Diagnostic Interface */}
              <div className="relative order-2 lg:order-2 w-full max-w-md mx-auto lg:max-w-none lg:mx-0">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-2xl opacity-20"></div>
                
                <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-4 sm:p-5 md:p-6 shadow-[0_24px_80px_-40px_rgba(88,28,135,0.65)] border border-purple-500/20 ring-1 ring-white/10 overflow-hidden">
                  {/* Header avec badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                    <div>
                      <h3 className="text-white font-bold text-lg sm:text-xl mb-1">
                        Diagnostic Professionnel
                      </h3>
                      <p className="text-gray-400 text-xs">Évaluation gratuite et obligatoire</p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-yellow-400 font-bold text-sm">
                          GRATUIT
                        </span>
                      </div>
                      <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold border border-red-500/30">
                        OBLIGATOIRE
                      </span>
                    </div>
                  </div>

                  {/* Expert avec message important */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 mb-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center font-bold text-white ring-4 ring-yellow-500/30 shadow-lg">
                          <Lightbulb className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-white font-bold">Expert Diagnostic</h4>
                          <p className="text-blue-200 text-sm">
                            🔍 Évaluation professionnelle personnalisée
                          </p>
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <p className="text-white text-sm font-semibold mb-2">
                          ⚠️ Point de départ obligatoire :
                        </p>
                        <p className="text-blue-100 text-xs leading-relaxed">
                          Tout commence par un <span className="font-bold text-yellow-300">diagnostic professionnel</span> afin d'analyser votre situation réelle et décider d'un accompagnement ciblé.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Étapes du diagnostic */}
                  <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 mb-4 border border-gray-700">
                    <h4 className="text-white font-bold text-sm mb-3 flex items-center">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                        <span className="text-white text-xs">1</span>
                      </div>
                      Processus du Diagnostic
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300 text-xs">Questionnaire personnalisé (15 min)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300 text-xs">Analyse de vos compétences</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300 text-xs">Avis d'expert & orientation</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-yellow-400" />
                        <span className="text-gray-300 text-xs">Décision Go / No-Go & plan d’action</span>
                      </div>
                    </div>
                  </div>

                  {/* Simulation de résultats */}
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-3 sm:p-4 mb-4 border border-purple-500/30">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-gray-900 flex-shrink-0">
                          M
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm mb-2">
                            <span className="font-bold">Expert:</span> Diagnostic terminé — analyse consolidée ✓
                          </p>
                          <div className="bg-gradient-to-r from-green-900/40 to-blue-900/40 border border-green-500/30 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-green-300 text-xs font-bold">
                                🧾 Synthèse
                              </p>
                              <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                                DÉCISION: GO
                              </span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-green-200 text-xs">
                                ✓ Contexte: <span className="font-bold">situation claire</span>
                              </p>
                              <p className="text-blue-200 text-xs">
                                ✓ Décision: <span className="font-bold">cohérence élevée</span>
                              </p>
                              <p className="text-purple-200 text-xs">
                                ✓ Priorités: <span className="font-bold">orientation & positionnement</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          C
                        </div>
                        <div>
                          <p className="text-white text-sm">
                            <span className="font-bold">Candidat:</span> Quelle est la prochaine étape après ce diagnostic ?
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-gray-900 flex-shrink-0">
                          M
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm mb-2">
                            <span className="font-bold">Expert:</span> Voici mon avis et mon orientation:
                          </p>
                          <div className="bg-blue-900/30 border border-blue-500/30 rounded p-2">
                            <p className="text-blue-200 text-xs">
                              🔎 <span className="font-bold">Go</span> — entretien stratégique + plan d’action personnalisé
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <button 
                        onClick={() => {
                          setShowFreeCourseModal(true);
                        }}
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg shadow-yellow-500/20 mb-2"
                      >
                        <Lightbulb className="w-5 h-5" />
                        <span>🎁 Passer le Diagnostic GRATUIT</span>
                      </button>
                      <button 
                        onClick={() => document.getElementById('domains-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                      >
                        <span>🔎 Découvrir nos domaines d’intervention</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <p className="text-center text-gray-400 text-xs mt-2">
                        ⚡ Diagnostic requis avant tout accompagnement
                      </p>
                    </div>
                  </div>

                  {/* Statistiques du diagnostic */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                    <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-2.5 sm:p-3 text-center transform hover:scale-105 transition-transform">
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white mx-auto mb-2" />
                      <div className="text-white font-bold text-base sm:text-lg">20</div>
                      <div className="text-purple-200 text-[11px] sm:text-xs">Questions</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-2.5 sm:p-3 text-center transform hover:scale-105 transition-transform">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white mx-auto mb-2" />
                      <div className="text-white font-bold text-base sm:text-lg">15</div>
                      <div className="text-orange-200 text-[11px] sm:text-xs">Minutes</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-2.5 sm:p-3 text-center transform hover:scale-105 transition-transform">
                      <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white mx-auto mb-2" />
                      <div className="text-white font-bold text-base sm:text-lg">100%</div>
                      <div className="text-green-200 text-[11px] sm:text-xs">Gratuit</div>
                    </div>
                  </div>

                  {/* Avantages du diagnostic */}
                  <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-white font-bold text-sm mb-3 flex items-center">
                      <span className="bg-yellow-500 text-gray-900 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2 font-bold">
                        ✓
                      </span>
                      Pourquoi passer le diagnostic ?
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <div className="w-5 h-5 bg-green-500/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        </div>
                        <p className="text-gray-300 text-xs">
                          <span className="font-semibold text-white">Identification précise</span> de votre niveau actuel
                        </p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-5 h-5 bg-green-500/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        </div>
                        <p className="text-gray-300 text-xs">
                          <span className="font-semibold text-white">Avis clair</span> et orientation stratégique
                        </p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-5 h-5 bg-green-500/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        </div>
                        <p className="text-gray-300 text-xs">
                          <span className="font-semibold text-white">Plan d’action concret</span> en situation réelle
                        </p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-5 h-5 bg-yellow-500/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        </div>
                        <p className="text-gray-300 text-xs">
                          <span className="font-semibold text-yellow-300">100% gratuit</span> et sans engagement
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-400 text-xs">+2,500 diagnostics réalisés</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-3 h-3 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm ring-1 ring-black/5">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span className="text-xs sm:text-sm font-semibold text-slate-700">Cadre méthodologique</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mt-5 mb-4 tracking-tight">
                Un parcours professionnel clair,
                <span className="block text-gradient bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  fondé sur le diagnostic — pas sur les promesses
                </span>
              </h2>
              <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Nous accompagnons des professionnels à partir d'un diagnostic rigoureux de la logique de décision,
                puis — uniquement si cela a du sens — par un accompagnement orienté transformation en situations réelles.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-8 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10" />
                <div className="relative">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200/70 text-purple-700 text-xs font-bold mb-3">
                        Phase 1 — Diagnostic & avis professionnel
                      </div>
                      <p className="text-sm font-semibold text-gray-900">Obligatoire (pré-requis)</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl bg-white/70 border border-slate-200/70 px-4 py-3 shadow-sm">
                      <FileText className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-xs font-bold text-gray-900">Décision</p>
                        <p className="text-xs text-gray-600">GO / NO-GO / réorientation</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/70 p-4">
                      <p className="text-sm font-bold text-gray-900 mb-3">Déroulé</p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="mt-1 h-5 w-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[11px] font-bold">1</span>
                          <p className="text-sm text-gray-700">Mises en situation opérationnelles</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 h-5 w-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[11px] font-bold">2</span>
                          <p className="text-sm text-gray-700">Choix et arbitrages sous contrainte</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 h-5 w-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[11px] font-bold">3</span>
                          <p className="text-sm text-gray-700">Analyse de votre logique de décision et de vos automatismes</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/70 p-4">
                      <p className="text-sm font-bold text-gray-900 mb-3">Livrables</p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                          <p className="text-sm text-gray-700">Profil professionnel objectivé</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                          <p className="text-sm text-gray-700">Forces, angles morts et facteurs de blocage</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                          <p className="text-sm text-gray-700">Avis de cadrage : acceptation, refus ou réorientation</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-purple-50/70 border border-purple-200/70 px-4 py-3">
                    <p className="text-sm text-purple-900 font-semibold">
                      Aucun cours. Aucun contenu à consommer. Un diagnostic, puis une décision.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-8 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10" />
                <div className="relative">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-xs font-bold mb-3">
                        Phase 2 — Accompagnement de Transformation
                      </div>
                      <p className="text-sm font-semibold text-gray-900">Uniquement après validation du diagnostic</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl bg-white/70 border border-slate-200/70 px-4 py-3 shadow-sm">
                      <Briefcase className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-xs font-bold text-gray-900">Objectif</p>
                        <p className="text-xs text-gray-600">Transformer la posture en contexte réel</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/70 p-4">
                      <p className="text-sm font-bold text-gray-900 mb-3">Axes de travail</p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="mt-1 h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">1</span>
                          <p className="text-sm text-gray-700">Simulations de situations terrain</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">2</span>
                          <p className="text-sm text-gray-700">Analyse de posture, de décisions et d'impact</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">3</span>
                          <p className="text-sm text-gray-700">Feedback stratégique, ajustements, répétition</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">4</span>
                          <p className="text-sm text-gray-700">Évolution de la logique de décision et des comportements</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/70 p-4">
                      <p className="text-sm font-bold text-gray-900 mb-3">Résultats attendus</p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                          <p className="text-sm text-gray-700">Décisions plus cohérentes, plus rapides, mieux assumées</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                          <p className="text-sm text-gray-700">Comportement plus stable sous pression</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                          <p className="text-sm text-gray-700">Plan d'action concret, exécutable, ancré terrain</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 px-4 py-3">
                    <p className="text-sm text-emerald-900 font-semibold">
                      Nous améliorons l'usage des compétences — nous ne les enseignons pas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 sm:mt-10">
              <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                  <div className="max-w-xl">
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      Ce qui nous différencie
                    </h3>
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                      Nous ne vendons pas des promesses. Nous produisons de la clarté, une décision, puis une transformation observable.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                    <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-b from-rose-50 to-white p-5">
                      <p className="text-sm font-bold text-rose-900 mb-3">Ce que nous ne faisons pas</p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-rose-700 font-bold">✕</span>
                          <p className="text-sm text-gray-700">Formation technique</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-rose-700 font-bold">✕</span>
                          <p className="text-sm text-gray-700">Cours ou contenus théoriques</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-rose-700 font-bold">✕</span>
                          <p className="text-sm text-gray-700">Exécuter des tâches à la place du participant</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50 to-white p-5">
                      <p className="text-sm font-bold text-emerald-900 mb-3">Ce que nous faisons</p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-emerald-700 font-bold">✓</span>
                          <p className="text-sm text-gray-700">Analyse et diagnostic de la décision</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-emerald-700 font-bold">✓</span>
                          <p className="text-sm text-gray-700">Réorientation quand c'est le meilleur choix</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-emerald-700 font-bold">✓</span>
                          <p className="text-sm text-gray-700">Changement de comportement professionnel en situation réelle</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setShowFreeCourseModal(true)}
                    className="group w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white text-sm sm:text-base font-semibold rounded-full shadow-[0_14px_30px_-18px_rgba(79,70,229,0.7)] hover:shadow-[0_20px_44px_-22px_rgba(79,70,229,0.85)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center justify-center"
                  >
                    <span>Démarrer le diagnostic (gratuit)</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-blue-50/30 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm ring-1 ring-black/5">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-xs sm:text-sm font-semibold text-slate-700">Système & traçabilité</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mt-5 mb-4 tracking-tight">
                Un système d'accompagnement professionnel,
                <span className="block text-gradient bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  officiel et vérifiable
                </span>
              </h2>
              <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Chaque participant évolue dans un système fermé garantissant le suivi, la traçabilité et la reconnaissance de la participation,
                du premier diagnostic jusqu'au dernier document.
                <span className="block mt-2 text-sm sm:text-base text-gray-600">Un dispositif adapté aux individus comme aux entreprises.</span>
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <button
                type="button"
                onClick={() => navigate("/espace-participant")}
                className="group relative text-left rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_-50px_rgba(37,99,235,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
              >
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-blue-700">1 — Espace Participant</p>
                        <h3 className="text-lg font-bold text-gray-900">Espace professionnel & traçabilité</h3>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-gray-700 bg-white/70 border border-slate-200/70 rounded-full px-3 py-1 shadow-sm">
                      Privé
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Accès aux séances, échanges et décisions associées</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Suivi d'avancement (jalons, objectifs, actions)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Journal horodaté : notes, feedback, points de décision</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Documents et livrables centralisés (téléchargement)</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-blue-50/70 border border-blue-200/70 px-4 py-3">
                    <p className="text-sm text-blue-900 font-semibold">Un espace de travail et de preuve — pas une plateforme d'apprentissage.</p>
                  </div>
                </div>
              </button>

              <div className="group relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_-50px_rgba(16,185,129,0.40)]">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-700">2 — Cadre & qualité</p>
                        <h3 className="text-lg font-bold text-gray-900">Encadré, cohérent, auditable</h3>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-gray-700 bg-white/70 border border-slate-200/70 rounded-full px-3 py-1 shadow-sm">
                      Encadré
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Critères de validation explicites (GO / NO-GO / réorientation)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Objectifs, jalons et actions suivis sur la durée</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Confidentialité et accès maîtrisé (système fermé)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Documentation cohérente : décisions, livrables, synthèses</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 px-4 py-3">
                    <p className="text-sm text-emerald-900 font-semibold">Un cadre sérieux, documenté et vérifiable.</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCertificateVerification(true)}
                className="group relative text-left rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_-50px_rgba(99,102,241,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
              >
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-indigo-700">3 — Vérification & preuves</p>
                        <h3 className="text-lg font-bold text-gray-900">Participation documentée, vérifiable</h3>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-gray-700 bg-white/70 border border-slate-200/70 rounded-full px-3 py-1 shadow-sm">
                      Vérifiable
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Toute entreprise peut vérifier l'authenticité d'une participation</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Chaque document dispose d'un identifiant unique</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Ce n'est pas une présence : ce sont des preuves et des documents</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/70 px-4 py-3">
                    <p className="text-sm text-indigo-900 font-semibold">Transparence contrôlée, utile et exploitable pour les entreprises.</p>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="rounded-xl bg-white/70 border border-slate-200/70 px-3 py-2 text-center shadow-sm">
                      <p className="text-xs font-bold text-gray-900">Document</p>
                      <p className="text-[11px] text-gray-600">de participation</p>
                    </div>
                    <div className="rounded-xl bg-white/70 border border-slate-200/70 px-3 py-2 text-center shadow-sm">
                      <p className="text-xs font-bold text-gray-900">Synthèse</p>
                      <p className="text-[11px] text-gray-600">interne</p>
                    </div>
                    <div className="rounded-xl bg-white/70 border border-slate-200/70 px-3 py-2 text-center shadow-sm">
                      <p className="text-xs font-bold text-gray-900">Avis</p>
                      <p className="text-[11px] text-gray-600">professionnel</p>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-8 sm:mt-10">
              <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                  <div className="max-w-xl">
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Ce n'est pas du coaching informel</h3>
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                      Ce dispositif est structuré, fermé, suivi et vérifiable — adapté aux individus comme aux entreprises.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                    <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-b from-rose-50 to-white p-5">
                      <p className="text-sm font-bold text-rose-900 mb-3">Ce que ce n'est pas</p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-rose-700 font-bold">✕</span>
                          <p className="text-sm text-gray-700">Certificats génériques</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-rose-700 font-bold">✕</span>
                          <p className="text-sm text-gray-700">Plateformes de cours</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-rose-700 font-bold">✕</span>
                          <p className="text-sm text-gray-700">Présence symbolique</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50 to-white p-5">
                      <p className="text-sm font-bold text-emerald-900 mb-3">Ce que c'est</p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-emerald-700 font-bold">✓</span>
                          <p className="text-sm text-gray-700">Système fermé, structuré</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-emerald-700 font-bold">✓</span>
                          <p className="text-sm text-gray-700">Documents vérifiables</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-emerald-700 font-bold">✓</span>
                          <p className="text-sm text-gray-700">Accompagnement documenté et traçable</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate("/espace-participant")}
                    className="group w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-sm sm:text-base font-semibold rounded-full shadow-[0_14px_30px_-18px_rgba(37,99,235,0.7)] hover:shadow-[0_20px_44px_-22px_rgba(37,99,235,0.85)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center justify-center"
                  >
                    <span>Accéder à l'Espace Participant</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => setShowCertificateVerification(true)}
                    className="group w-full sm:w-auto px-6 py-3 bg-white/85 backdrop-blur-sm text-gray-900 text-sm sm:text-base font-semibold rounded-full border border-gray-200 hover:border-indigo-300 hover:bg-white transition-all duration-300 inline-flex items-center justify-center shadow-sm hover:shadow-lg"
                  >
                    <span>Vérifier une participation</span>
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm ring-1 ring-black/5">
                <Briefcase className="w-4 h-4 text-purple-600" />
                <span className="text-xs sm:text-sm font-semibold text-slate-700">Positionnement & réalité métier</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mt-5 mb-4 tracking-tight">
                Un accompagnement professionnel ancré dans le réel,
                <span className="block text-gradient bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  pas dans le théorique
                </span>
              </h2>
              <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Nous proposons un accompagnement qui vous permet de comprendre le réel des métiers, de décoder les attentes du marché,
                et de construire un positionnement professionnel clair — crédible et présentable aux entreprises.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10" />
                <div className="relative">
                  <div className="flex items-start gap-3 mb-5">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Pour qui ?</h3>
                      <p className="text-sm text-gray-600">Profils en entrée de marché ou en clarification</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="mt-1 text-emerald-700 font-bold">✓</span>
                      <p className="text-sm text-gray-700">Étudiants avant l'entrée sur le marché du travail</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 text-emerald-700 font-bold">✓</span>
                      <p className="text-sm text-gray-700">Jeunes diplômés en recherche de positionnement</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 text-emerald-700 font-bold">✓</span>
                      <p className="text-sm text-gray-700">Professionnels en début de parcours</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 text-emerald-700 font-bold">✓</span>
                      <p className="text-sm text-gray-700">Personnes qui veulent tester la réalité d'un métier avant de s'engager</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-blue-50/70 border border-blue-200/70 px-4 py-3">
                    <p className="text-sm text-blue-900 font-semibold">Une expérience professionnelle structurée — pas une formation théorique.</p>
                  </div>
                </div>
              </div>

              <div className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7 overflow-hidden lg:col-span-2">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10" />
                <div className="relative">
                  <div className="flex items-start gap-3 mb-5">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/20">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Ce que nous apportons, concrètement</h3>
                      <p className="text-sm text-gray-600">Valeur haute, orientée marché</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/70 p-5">
                      <p className="text-sm font-bold text-gray-900 mb-3">Clarté & diagnostic</p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                          <p className="text-sm text-gray-700">Compréhension réaliste du métier (missions, contraintes, standards)</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                          <p className="text-sm text-gray-700">Diagnostic de niveau de préparation et de maturité professionnelle</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                          <p className="text-sm text-gray-700">Identification des forces et axes de développement</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/70 p-5">
                      <p className="text-sm font-bold text-gray-900 mb-3">Documents professionnels (utiles)</p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                          <p className="text-sm text-gray-700">Clarifier le parcours et le positionnement</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                          <p className="text-sm text-gray-700">Améliorer la présentation (CV, discours, exemples)</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                          <p className="text-sm text-gray-700">Parler avec confiance face aux entreprises</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/70 px-4 py-3">
                    <p className="text-sm text-indigo-900 font-semibold">Les documents reflètent la maturité professionnelle — pas une simple présence.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 sm:mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7">
                <div className="flex items-start gap-3 mb-5">
                  <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-rose-600 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/20">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Pour qui ce n'est pas adapté ?</h3>
                    <p className="text-sm text-gray-600">Nous filtrons volontairement</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="mt-1 text-rose-700 font-bold">✕</span>
                    <p className="text-sm text-gray-700">Ceux qui veulent des cours ou une formation académique</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-1 text-rose-700 font-bold">✕</span>
                    <p className="text-sm text-gray-700">Ceux qui cherchent une attestation sans expérience</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-1 text-rose-700 font-bold">✕</span>
                    <p className="text-sm text-gray-700">Ceux qui refusent un retour franc et une évaluation claire</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-8 overflow-hidden relative">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-purple-500/12 via-transparent to-blue-500/12" />
                <div className="relative">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Proposition de valeur</h3>
                  <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                    Nous n'enseignons pas un métier. Nous vous plaçons dans sa logique réelle, puis nous vous donnons des outils professionnels
                    pour vous présenter avec clarté, crédibilité et cohérence.
                  </p>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setShowFreeCourseModal(true)}
                      className="group w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white text-sm sm:text-base font-semibold rounded-full shadow-[0_14px_30px_-18px_rgba(79,70,229,0.7)] hover:shadow-[0_20px_44px_-22px_rgba(79,70,229,0.85)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center justify-center"
                    >
                      <span>Démarrer le diagnostic (gratuit)</span>
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                      onClick={() => navigate("/espace-participant")}
                      className="group w-full sm:w-auto px-6 py-3 bg-white/85 backdrop-blur-sm text-gray-900 text-sm sm:text-base font-semibold rounded-full border border-gray-200 hover:border-purple-300 hover:bg-white transition-all duration-300 inline-flex items-center justify-center shadow-sm hover:shadow-lg"
                    >
                      <span>Voir l'Espace Participant</span>
                      <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-emerald-50/30 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm ring-1 ring-black/5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-xs sm:text-sm font-semibold text-slate-700">Résultats concrets</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mt-5 mb-4 tracking-tight">
                Des résultats professionnels concrets,
                <span className="block text-gradient bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                  directement exploitables
                </span>
              </h2>
              <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                L'accompagnement MA Consulting ne vous donne pas du contenu à consommer.
                Il vise un changement visible dans votre façon de penser, décider et vous positionner — avec des résultats que vous pouvez présenter
                en entretien, en entreprise, ou utiliser pour progresser.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10" />
                <div className="relative">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-700">1 — Clarté professionnelle</p>
                      <h3 className="text-lg font-bold text-gray-900">Voir clair, tout de suite</h3>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Comprendre précisément votre rôle et vos responsabilités</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Identifier vos limites actuelles et vos leviers de progression</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Décider avec moins d'hésitation et plus de direction</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 px-4 py-3">
                    <p className="text-sm text-emerald-900 font-semibold">Un effet direct en entretien et en réunions professionnelles.</p>
                  </div>
                </div>
              </div>

              <div className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10" />
                <div className="relative">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-700">2 — Décisions plus solides</p>
                      <h3 className="text-lg font-bold text-gray-900">Décider avec méthode</h3>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Raisonnement plus structuré et plus stable</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Décisions fondées sur une logique — pas sur la réaction</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Capacité à assumer et défendre vos choix, même sous pression</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-blue-50/70 border border-blue-200/70 px-4 py-3">
                    <p className="text-sm text-blue-900 font-semibold">Une qualité très recherchée dans les postes à responsabilité.</p>
                  </div>
                </div>
              </div>

              <div className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10" />
                <div className="relative">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/20">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-purple-700">3 — Comportement plus mature</p>
                      <h3 className="text-lg font-bold text-gray-900">Posture professionnelle visible</h3>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Meilleure gestion de la pression et des imprévus</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Communication plus claire, plus cohérente</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Réponses plus professionnelles en contexte réel</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-purple-50/70 border border-purple-200/70 px-4 py-3">
                    <p className="text-sm text-purple-900 font-semibold">Le comportement que les entreprises observent au quotidien.</p>
                  </div>
                </div>
              </div>

              <div className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10" />
                <div className="relative">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-600/20">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-700">4 — Positionnement plus solide</p>
                      <h3 className="text-lg font-bold text-gray-900">Se présenter comme un pro</h3>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Présentation plus structurée et plus convaincante</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Capacité à parler de votre valeur et de vos preuves</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Discours professionnel cohérent pour candidatures et entretiens</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-amber-50/70 border border-amber-200/70 px-4 py-3">
                    <p className="text-sm text-amber-900 font-semibold">Différence nette entre “candidat” et “professionnel”.</p>
                  </div>
                </div>
              </div>

              <div className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7 overflow-hidden md:col-span-2 lg:col-span-1">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
                <div className="relative">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-indigo-700">5 — Documents professionnels</p>
                      <h3 className="text-lg font-bold text-gray-900">Présentables & vérifiables</h3>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="mt-1 text-emerald-700 font-bold">✓</span>
                      <p className="text-sm text-gray-700">Document de diagnostic professionnel</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 text-emerald-700 font-bold">✓</span>
                      <p className="text-sm text-gray-700">Avis professionnel structuré</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 text-emerald-700 font-bold">✓</span>
                      <p className="text-sm text-gray-700">Synthèse des compétences activées</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 text-emerald-700 font-bold">✓</span>
                      <p className="text-sm text-gray-700">Document de participation vérifiable (ID)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 text-emerald-700 font-bold">✓</span>
                      <p className="text-sm text-gray-700">Note de positionnement professionnel</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 text-emerald-700 font-bold">✓</span>
                      <p className="text-sm text-gray-700">Lettre de recommandation (si nécessaire)</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/70 px-4 py-3">
                    <p className="text-sm text-indigo-900 font-semibold">Documents consultatifs et traçables — pas des diplômes, ni des certifications.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 sm:mt-10 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Sans promesses vides</h3>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                    Nous ne promettons pas un emploi. MA Consulting n'ajoute pas une compétence “en plus” : il augmente la valeur de vos compétences
                    en vous aidant à les mobiliser correctement dans le réel.
                  </p>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-b from-rose-50 to-white p-5">
                      <p className="text-sm font-bold text-rose-900 mb-3">Ce que vous ne trouverez pas</p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-rose-700 font-bold">✕</span>
                          <p className="text-sm text-gray-700">Certificat général</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-rose-700 font-bold">✕</span>
                          <p className="text-sm text-gray-700">Promesse d'embauche</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50 to-white p-5">
                      <p className="text-sm font-bold text-emerald-900 mb-3">Ce que vous obtenez</p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-emerald-700 font-bold">✓</span>
                          <p className="text-sm text-gray-700">Résultats réalistes et utilisables</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-emerald-700 font-bold">✓</span>
                          <p className="text-sm text-gray-700">Évolution de posture et de comportement</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-emerald-700 font-bold">✓</span>
                          <p className="text-sm text-gray-700">Alignement plus fort avec les attentes du recrutement / promotion</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between">
                  <div className="rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/70 p-5">
                    <p className="text-sm font-bold text-gray-900 mb-2">CTA</p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Commencez par le diagnostic et observez le résultat par vous-même.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowFreeCourseModal(true)}
                    className="mt-4 group w-full px-6 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white text-sm sm:text-base font-semibold rounded-full shadow-[0_14px_30px_-18px_rgba(16,185,129,0.7)] hover:shadow-[0_20px_44px_-22px_rgba(16,185,129,0.85)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center justify-center"
                  >
                    <span>Commencer par le diagnostic</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm ring-1 ring-black/5">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span className="text-xs sm:text-sm font-semibold text-slate-700">Coaching stratégique</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mt-5 mb-4 tracking-tight">
                Coaching stratégique orienté décision,
                <span className="block text-gradient bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  et posture professionnelle
                </span>
              </h2>
              <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Nous proposons des sessions individuelles dédiées à l'amélioration de la pensée professionnelle, de la qualité de décision
                et d'une vision plus mature — dans vos rôles actuels ou futurs.
                <span className="font-semibold text-gray-900"> Nous n'enseignons pas des compétences techniques</span> : nous travaillons sur la façon de penser et d'agir comme un professionnel.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-8 overflow-hidden relative">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
                <div className="relative">
                  <div className="flex items-start gap-3 mb-5">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Ce qui se passe pendant la session</h3>
                      <p className="text-sm text-gray-600">Sans dérive “formation” ni consulting opérationnel</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/70 p-5">
                      <p className="text-sm font-bold text-gray-900 mb-3">Ce que nous faisons</p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-emerald-700 font-bold">✓</span>
                          <p className="text-sm text-gray-700">Analyse d'une situation professionnelle réelle</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-emerald-700 font-bold">✓</span>
                          <p className="text-sm text-gray-700">Déconstruction de votre logique de décision</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-emerald-700 font-bold">✓</span>
                          <p className="text-sm text-gray-700">Correction du raisonnement et clarification des priorités</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-emerald-700 font-bold">✓</span>
                          <p className="text-sm text-gray-700">Ouverture de perspective et réorientation stratégique</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-b from-rose-50 to-white p-5">
                      <p className="text-sm font-bold text-rose-900 mb-3">Ce que nous ne faisons pas</p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-rose-700 font-bold">✕</span>
                          <p className="text-sm text-gray-700">Expliquer des outils ou des étapes techniques</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-rose-700 font-bold">✕</span>
                          <p className="text-sm text-gray-700">Exécuter à votre place ou produire un livrable opérationnel</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-rose-700 font-bold">✕</span>
                          <p className="text-sm text-gray-700">Donner une “solution prête” comme une recette</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl bg-indigo-50/70 border border-indigo-200/70 px-5 py-4">
                    <p className="text-sm text-indigo-900 font-semibold">
                      Ces sessions ne remplacent pas un cursus de formation ni une prestation d'exécution : elles aident à prendre des décisions plus justes
                      dans le réel professionnel.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7">
                <div className="flex items-start gap-3 mb-5">
                  <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Pour qui ?</h3>
                    <p className="text-sm text-gray-600">Mentalité pro, pas “cours”</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="mt-1 text-emerald-700 font-bold">✓</span>
                    <p className="text-sm text-gray-700">Personnes qui veulent renforcer leur positionnement professionnel</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-1 text-emerald-700 font-bold">✓</span>
                    <p className="text-sm text-gray-700">Professionnels en début ou milieu de parcours</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-1 text-emerald-700 font-bold">✓</span>
                    <p className="text-sm text-gray-700">Profils qui ressentent un manque de vision ou de décision</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-1 text-emerald-700 font-bold">✓</span>
                    <p className="text-sm text-gray-700">Personnes qui veulent comprendre comment pense un professionnel dans un poste ciblé</p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 px-4 py-3">
                  <p className="text-sm text-emerald-900 font-semibold">On travaille la pensée professionnelle — pas la fonction.</p>
                </div>

                <button
                  onClick={() => setShowFreeCourseModal(true)}
                  className="mt-5 group w-full px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white text-sm sm:text-base font-semibold rounded-full shadow-[0_14px_30px_-18px_rgba(79,70,229,0.7)] hover:shadow-[0_20px_44px_-22px_rgba(79,70,229,0.85)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center justify-center"
                >
                  <span>Réserver mon diagnostic professionnel</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-200/70 px-4 py-3">
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Cadre : coaching stratégique (décision + posture) pour individus. Le consulting opérationnel s'adresse aux entreprises.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 sm:mt-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm ring-1 ring-black/5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs sm:text-sm font-semibold text-slate-700">Services additionnels</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-3">Services additionnels pour approfondir l'accompagnement</h3>
                <p className="text-sm sm:text-base text-gray-700 max-w-3xl mx-auto leading-relaxed">
                  Modules courts (sans explications longues) pour renforcer l'analyse, la crédibilité et la maturité — selon le niveau et la situation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="group relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7 overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-indigo-500/10 via-transparent to-blue-500/10" />
                  <div className="relative">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">Benchmarks professionnels</h4>
                        <p className="text-sm text-gray-600">Comparaison avec le marché</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">Renforce le discours, clarifie les écarts, et reste lisible pour les entreprises.</p>
                  </div>
                </div>

                <div className="group relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7 overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10" />
                  <div className="relative">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">Simulations professionnelles</h4>
                        <p className="text-sm text-gray-600">Pression, décisions, posture</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">Teste la préparation et fournit un signal de crédibilité en entretien.</p>
                  </div>
                </div>

                <div className="group relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7 overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10" />
                  <div className="relative">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/20">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">Comité d'experts (avancé)</h4>
                        <p className="text-sm text-gray-600">Regards multiples</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">Élargit la vision et apporte une valeur forte pour profils management.</p>
                  </div>
                </div>

                <div className="group relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7 overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10" />
                  <div className="relative">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-600/20">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">Journal de progression</h4>
                        <p className="text-sm text-gray-600">Traçabilité des décisions</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">Documente l'évolution et peut soutenir un dossier de promotion interne.</p>
                  </div>
                </div>

                <div className="group relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7 overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10" />
                  <div className="relative">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">Feedback 360°</h4>
                        <p className="text-sm text-gray-600">Self-awareness & management</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">Synthèse de retours comportementaux (quand c'est possible) pour renforcer la maturité.</p>
                  </div>
                </div>

                <div className="group relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7 overflow-hidden sm:col-span-2 lg:col-span-3">
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-500/10 via-transparent to-indigo-500/10" />
                  <div className="relative">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">Diagnostic de maturité (B2B)</h4>
                        <p className="text-sm text-gray-600">Évaluation d'équipes ou d'individus en entreprise</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Offre entreprise (consulting opérationnel). Portail naturel vers des missions à haute valeur.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  <div className="rounded-2xl bg-indigo-50/70 border border-indigo-200/70 p-5">
                    <p className="text-sm font-bold text-indigo-900 mb-2">Cadre & disponibilité</p>
                    <p className="text-sm text-gray-800 leading-relaxed">
                      Certains services sont activés selon le niveau et la préparation,
                      <span className="font-semibold text-gray-900"> après un diagnostic professionnel préalable</span>.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-200/70 p-5">
                    <p className="text-sm font-bold text-gray-900 mb-2">Résumé clair</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="mt-1 text-emerald-700 font-bold">✓</span>
                        <p className="text-sm text-gray-700">Sessions individuelles : oui</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mt-1 text-emerald-700 font-bold">✓</span>
                        <p className="text-sm text-gray-700">Coaching stratégique (décision + posture) : oui</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mt-1 text-rose-700 font-bold">✕</span>
                        <p className="text-sm text-gray-700">Formation technique : non</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mt-1 text-emerald-700 font-bold">✓</span>
                        <p className="text-sm text-gray-700">Consulting opérationnel : pour entreprises</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowFreeCourseModal(true)}
                  className="mt-6 group w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white text-sm sm:text-base font-semibold rounded-full shadow-[0_14px_30px_-18px_rgba(16,185,129,0.7)] hover:shadow-[0_20px_44px_-22px_rgba(16,185,129,0.85)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center justify-center"
                >
                  <span>Commencer par le diagnostic professionnel</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="mt-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 px-6 py-5 text-white shadow-[0_18px_50px_-28px_rgba(30,64,175,0.7)]">
                  <p className="text-sm sm:text-base font-semibold leading-relaxed">
                    Nous ne développons pas les compétences techniques,
                    <span className="text-emerald-300"> nous développons la pensée professionnelle</span> qui les pilote.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Découvrez les{" "}
                <span className="text-gradient bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  réussites
                </span>{" "}
                de nos participants
              </h2>
              <p className="text-xl text-gray-600">
                Des transformations professionnelles inspirantes qui témoignent
                de l'efficacité de notre approche
              </p>
              {import.meta.env.DEV && (
                <div className="mt-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    apiConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      apiConnected ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    {apiConnected ? 'API Connectée' : 'Mode Hors-ligne'}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Carousel des témoignages */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {testimonialsLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600">Chargement des témoignages...</span>
                </div>
              ) : testimonials.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-600">Aucun témoignage disponible pour le moment.</p>
                </div>
              ) : (
                <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={24}
                slidesPerView={1}
                navigation={{
                  nextEl: ".swiper-button-next-custom",
                  prevEl: ".swiper-button-prev-custom",
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                autoplay={{
                  delay: 4000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                loop={true}
                breakpoints={{
                  640: {
                    slidesPerView: 1,
                    spaceBetween: 20,
                  },
                  768: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                  },
                  1024: {
                    slidesPerView: 3,
                    spaceBetween: 24,
                  },
                }}
                className="testimonials-swiper"
              >
                {testimonials.map((testimonial) => {
                  // 🎯 Attribution automatique du badge TOP pour Expert et Avancé
                  const isTopParticipant = testimonial.level === "Expert" || testimonial.level === "Avancé";
                  const getLevelIcon = (level: string) => {
                    if (level === "Expert") return "🏆";
                    if (level === "Avancé") return "📈";
                    return "🎯";
                  };
                  
                  // Obtenir les initiales
                  const initials = testimonialsApiService.getInitials(testimonial.name);
                  
                  // Obtenir la couleur du niveau
                  const levelColor = testimonialsApiService.getLevelColor(testimonial.level);
                  
                  // Obtenir les étoiles
                  const stars = testimonialsApiService.getStarRating(testimonial.rating);

                  return (
                    <SwiperSlide key={testimonial.id}>
                      <div className="testimonial-card h-full relative">
                        {/* Badge TOP participant - Attribution automatique pour Expert/Avancé */}
                        {isTopParticipant && (
                          <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                            TOP des participants
                          </div>
                        )}

                        <div className="p-6">
                          {/* Avatar et informations */}
                          <div className="flex items-center space-x-4 mb-4">
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${levelColor} flex items-center justify-center text-white font-bold text-lg`}>
                              {initials}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg mb-1">
                                {testimonial.name}
                              </h4>
                              <p className="text-gray-700 font-medium mb-1">
                                {testimonial.position}
                              </p>
                              <p className="text-gray-500 text-sm">
                                {testimonial.skills}
                              </p>
                              <div className="text-yellow-500 text-sm mt-1">
                                {stars}
                              </div>
                            </div>
                          </div>

                          {/* Compétence acquise */}
                          <div className="mb-4">
                            <div className="flex items-center space-x-2 text-sm">
                              <Lightbulb className="w-4 h-4 text-yellow-500" />
                              <span className="text-gray-600 font-medium">
                                {testimonial.category}
                              </span>
                            </div>
                          </div>

                          {/* Niveau avec icône */}
                          <div className="mb-4">
                            <div
                              className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${levelColor} text-white`}
                            >
                              {getLevelIcon(testimonial.level)}
                              <span>{testimonial.level} {testimonial.progress}%</span>
                            </div>
                          </div>

                          {/* Témoignage */}
                          <blockquote className="text-gray-700 italic leading-relaxed">
                            "{testimonial.content}"
                          </blockquote>
                        </div>
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
              )}

              {/* Navigation personnalisée */}
              {!testimonialsLoading && testimonials.length > 0 && (
                <>
                  <div className="swiper-button-prev-custom absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <ChevronRight className="w-6 h-6 text-gray-600 rotate-180" />
                  </div>
                  <div className="swiper-button-next-custom absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <ChevronRight className="w-6 h-6 text-gray-600" />
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>

        {/* Styles personnalisés pour Swiper */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            .testimonials-swiper .swiper-pagination {
              bottom: -50px !important;
            }
            .testimonials-swiper .swiper-pagination-bullet {
              width: 12px;
              height: 12px;
              background: linear-gradient(135deg, #f59e0b, #f97316);
              opacity: 0.3;
            }
            .testimonials-swiper .swiper-pagination-bullet-active {
              opacity: 1;
              transform: scale(1.2);
            }
            .testimonials-swiper .swiper-slide {
              height: auto;
            }
            .testimonials-swiper .testimonial-card {
              height: 100%;
              display: flex;
              flex-direction: column;
            }
          `,
          }}
        />
      </section>
      <section id="domains-section" className="py-14 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-purple-50/40 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-14 lg:mb-16">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Nos{" "}
                <span className="text-gradient bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  domaines d’intervention
                </span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
                Nous intervenons par diagnostic, analyse décisionnelle et accompagnement stratégique — sans logique de formation classique.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="group bg-gradient-to-b from-white to-slate-50 rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ring-1 ring-black/5">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4 font-bold">1</div>
                <h3 className="font-bold text-gray-900 mb-2">Diagnostic professionnel</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Clarification de votre situation réelle, contraintes, objectifs et priorités.</p>
              </div>
              <div className="group bg-gradient-to-b from-white to-slate-50 rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ring-1 ring-black/5">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 font-bold">2</div>
                <h3 className="font-bold text-gray-900 mb-2">Analyse décisionnelle</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Lecture de vos choix, logique de décision, risques et points de blocage.</p>
              </div>
              <div className="group bg-gradient-to-b from-white to-slate-50 rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ring-1 ring-black/5">
                <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center mb-4 font-bold">3</div>
                <h3 className="font-bold text-gray-900 mb-2">Avis & orientation</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Retour d’expert + recommandation d’orientation selon votre contexte.</p>
              </div>
              <div className="group bg-gradient-to-b from-white to-slate-50 rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ring-1 ring-black/5">
                <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center mb-4 font-bold">4</div>
                <h3 className="font-bold text-gray-900 mb-2">Accompagnement stratégique</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Plan d’action concret et suivi en situation réelle (pas de LMS).</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="programs-section" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Nos{" "}
                <span className="text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Parcours Professionnels
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Découvrez nos parcours d'expertise conçus pour transformer votre carrière
              </p>
            </div>


            {/* Programs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                <div className="col-span-full text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Chargement des programmes...</p>
                </div>
              ) : programs.map((program) => (
                <div key={program.id} data-program-id={program.id}>
                  <ProgramCard
                    program={program}
                    selectedCurrency="€"
                    onRegisterClick={handleProgramRegistration}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Theme Packs Section */}
      <div id="packs-section">
        <ThemePackSection selectedCurrency="€" />
      </div>

      {/* Bottom Cards Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Nos Services d'Accompagnement
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Découvrez nos services conçus pour vous accompagner à chaque étape de votre parcours professionnel
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {heroCards.map((card, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col"
                  whileHover={{ y: -5 }}
                  onClick={() => {
                    if (card.title === "Espace Participant") {
                      navigate("/espace-participant");
                    } else if (card.title === "Vérification de Participation") {
                      setShowCertificateVerification(true);
                    } else if (card.title === "Diagnostic Gratuit (Obligatoire)") {
                      setShowFreeCourseModal(true);
                    }
                  }}
                >
                  <div className={`p-6 flex-1 flex flex-col`}>
                    <div 
                      className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                        card.color === "blue" 
                          ? "bg-blue-100 text-blue-600" 
                          : card.color === "purple" 
                            ? "bg-purple-100 text-purple-600" 
                            : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      <card.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h3>
                    <p className="text-gray-600 mb-6 flex-1">{card.subtitle}</p>
                    <button 
                      className={`mt-auto inline-flex items-center font-medium ${
                        card.color === "blue" 
                          ? "text-blue-600 hover:text-blue-700" 
                          : card.color === "purple" 
                            ? "text-purple-600 hover:text-purple-700" 
                            : "text-yellow-600 hover:text-yellow-700"
                      }`}
                    >
                      {card.buttonText}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </motion.div>
              ))}
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
      <CertificateVerification
        isOpen={showCertificateVerification}
        onClose={() => setShowCertificateVerification(false)}
      />

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
