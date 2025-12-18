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
      <div className="container mx-auto px-6 pt-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-yellow-50 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left order-2 lg:order-1">
                {/* Badge */}
                <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm mb-6">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
                  <span className="text-sm font-medium text-gray-700">Diagnostic gratuit disponible</span>
                </div>

                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-[1.15] tracking-tight">
                  <span className="block mb-2">Accompagnement professionnel</span>
                  <span className="relative inline-block">
                    <span className="relative z-10 text-gradient bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                      sur mesure
                    </span>
                    <svg className="absolute -bottom-2 left-0 w-full h-3 opacity-80" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 10C50 2 150 2 198 10" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round"/>
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#2563eb" />
                          <stop offset="100%" stopColor="#9333ea" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </span>
                  <span className="block mt-2">basé sur le diagnostic et l'expertise</span>
                </h1>

                <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  <span className="inline-flex items-center text-blue-600 font-semibold">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Analyse
                  </span>{" "}
                  <span className="text-gray-400">•</span>{" "}
                  <span className="inline-flex items-center text-purple-600 font-semibold">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Orientation
                  </span>{" "}
                  <span className="text-gray-400">•</span>{" "}
                  <span className="inline-flex items-center text-orange-600 font-semibold">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Structuration
                  </span>{" "}
                  <span className="text-gray-400">•</span>{" "}
                  <span className="inline-flex items-center text-green-600 font-semibold">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Positionnement
                  </span>
                </p>

                {/* Social Proof - Enhanced */}
                <div className="mt-8 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6">
                    {/* Professionals Count */}
                    <div className="group flex items-center bg-white/60 backdrop-blur-sm px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
                      <div className="flex -space-x-3 mr-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 border-3 border-white flex items-center justify-center text-white text-sm font-bold shadow-lg transform group-hover:scale-110 transition-transform">
                            {i === 1 ? '👨' : i === 2 ? '👩' : i === 3 ? '👤' : '👨‍💼'}
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900 leading-tight">+5000</p>
                        <p className="text-xs text-gray-600 font-medium">professionnels formés</p>
                      </div>
                    </div>
                    
                    {/* Rating */}
                    <div className="group flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-yellow-200 hover:border-yellow-300">
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
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-semibold text-green-700">Certifié qualité</span>
                    </div>
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-700">100% sécurisé</span>
                    </div>
                    <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200">
                      <Award className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-semibold text-purple-700">Experts reconnus</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right - Diagnostic Interface */}
              <div className="relative order-1 lg:order-2">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-2xl opacity-20"></div>
                
                <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 shadow-2xl border border-purple-500/20">
                  {/* Header avec badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-white font-bold text-xl mb-1">
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
                          ⚠️ Condition d'accès aux parcours:
                        </p>
                        <p className="text-blue-100 text-xs leading-relaxed">
                          Le diagnostic gratuit est <span className="font-bold text-yellow-300">obligatoire</span> pour identifier 
                          le parcours professionnel adapté à votre profil et vos objectifs.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Étapes du diagnostic */}
                  <div className="bg-gray-800/50 rounded-lg p-4 mb-4 border border-gray-700">
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
                        <span className="text-gray-300 text-xs">Recommandation de parcours</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-yellow-400" />
                        <span className="text-gray-300 text-xs">Accès aux programmes adaptés</span>
                      </div>
                    </div>
                  </div>

                  {/* Simulation de résultats */}
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 mb-4 border border-purple-500/30">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-gray-900 flex-shrink-0">
                          M
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm mb-2">
                            <span className="font-bold">Expert:</span> Diagnostic complété avec succès ! ✓
                          </p>
                          <div className="bg-gradient-to-r from-green-900/40 to-blue-900/40 border border-green-500/30 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-green-300 text-xs font-bold">
                                📊 Profil Identifié
                              </p>
                              <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                                NIVEAU: AVANCÉ
                              </span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-green-200 text-xs">
                                ✓ Compétences techniques: <span className="font-bold">85%</span>
                              </p>
                              <p className="text-blue-200 text-xs">
                                ✓ Leadership: <span className="font-bold">92%</span>
                              </p>
                              <p className="text-purple-200 text-xs">
                                ✓ Communication: <span className="font-bold">88%</span>
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
                            <span className="font-bold">Candidat:</span> Quels parcours me correspondent ?
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-gray-900 flex-shrink-0">
                          M
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm mb-2">
                            <span className="font-bold">Expert:</span> Basé sur votre diagnostic:
                          </p>
                          <div className="bg-blue-900/30 border border-blue-500/30 rounded p-2">
                            <p className="text-blue-200 text-xs">
                              ✨ <span className="font-bold">3 parcours recommandés</span> vous attendent
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
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-3 rounded-lg text-sm font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg shadow-yellow-500/20 mb-2"
                      >
                        <Lightbulb className="w-5 h-5" />
                        <span>🎁 Passer le Diagnostic GRATUIT</span>
                      </button>
                      <button 
                        onClick={() => document.getElementById('programs-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg text-sm font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                      >
                        <span>📚 Voir Nos Parcours Professionnels</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <p className="text-center text-gray-400 text-xs mt-2">
                        ⚡ Diagnostic requis pour l'inscription
                      </p>
                    </div>
                  </div>

                  {/* Statistiques du diagnostic */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-3 text-center transform hover:scale-105 transition-transform">
                      <BookOpen className="w-6 h-6 text-white mx-auto mb-2" />
                      <div className="text-white font-bold text-lg">20</div>
                      <div className="text-purple-200 text-xs">Questions</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-3 text-center transform hover:scale-105 transition-transform">
                      <Clock className="w-6 h-6 text-white mx-auto mb-2" />
                      <div className="text-white font-bold text-lg">15</div>
                      <div className="text-orange-200 text-xs">Minutes</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-3 text-center transform hover:scale-105 transition-transform">
                      <Award className="w-6 h-6 text-white mx-auto mb-2" />
                      <div className="text-white font-bold text-lg">100%</div>
                      <div className="text-green-200 text-xs">Gratuit</div>
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
                          <span className="font-semibold text-white">Recommandations personnalisées</span> de parcours
                        </p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-5 h-5 bg-green-500/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        </div>
                        <p className="text-gray-300 text-xs">
                          <span className="font-semibold text-white">Accès direct</span> aux programmes adaptés
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

      {/* Notre Identité Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Notre{" "}
                <span className="text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Identité
                </span>
              </h2>
              <p className="text-2xl font-semibold text-gray-800 mb-8">
                Cabinet de consulting spécialisé en accompagnement professionnel
              </p>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              {/* Left Column - Text Content */}
              <div className="space-y-8">
                <div>
                  <p className="text-lg text-gray-700 leading-relaxed mb-6">
                    <span className="font-bold text-gray-900">MA Training Consulting</span> est un cabinet de consulting international spécialisé dans :
                  </p>
                  
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white mr-4 flex-shrink-0 mt-1">
                        <span className="text-sm font-bold">•</span>
                      </span>
                      <span className="text-gray-700">l'accompagnement professionnel</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white mr-4 flex-shrink-0 mt-1">
                        <span className="text-sm font-bold">•</span>
                      </span>
                      <span className="text-gray-700">le développement des compétences opérationnelles</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white mr-4 flex-shrink-0 mt-1">
                        <span className="text-sm font-bold">•</span>
                      </span>
                      <span className="text-gray-700">et les parcours pratiques orientés métiers</span>
                    </li>
                  </ul>
                </div>

                {/* Important Note */}
                <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-l-4 border-orange-500 rounded-lg">
                  <p className="text-sm font-bold text-orange-900 mb-3">
                    ⚠️ Règle fondamentale
                  </p>
                  <p className="text-gray-800 leading-relaxed">
                    <span className="font-semibold">Nous ne sommes pas un centre de formation.</span> Notre mission est d'offrir un accompagnement sur-mesure basé sur des pratiques professionnelles modernes et directement applicables dans le marché actuel.
                  </p>
                </div>
              </div>

              {/* Right Column - Visual Element */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl blur-3xl"></div>
                <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Expertise</h4>
                        <p className="text-sm text-gray-600">Accompagnement professionnel de haut niveau basé sur des années d'expérience</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Approche Pratique</h4>
                        <p className="text-sm text-gray-600">Solutions directement applicables dans votre environnement professionnel</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-teal-600">
                          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Parcours Personnalisés / en groupe</h4>
                        <p className="text-sm text-gray-600">Accompagnement sur-mesure adapté à vos besoins spécifiques</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notre Approche Section */}
      <section className="py-20 bg-gradient-to-b from-white via-blue-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Notre{" "}
                <span className="text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Approche
                </span>
              </h2>
              <p className="text-2xl font-semibold text-gray-800 mb-8">
                Une méthodologie d'accompagnement moderne et orientée résultats
              </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              {/* Left Column - Methodology */}
              <div className="space-y-8">
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-6">
                    Notre accompagnement repose sur :
                  </p>
                  
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white mr-4 flex-shrink-0 mt-1 font-bold text-sm">
                        ✓
                      </span>
                      <span className="text-gray-700">l'analyse de votre profil et de vos objectifs</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white mr-4 flex-shrink-0 mt-1 font-bold text-sm">
                        ✓
                      </span>
                      <span className="text-gray-700">des rencontres professionnelles structurées</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white mr-4 flex-shrink-0 mt-1 font-bold text-sm">
                        ✓
                      </span>
                      <span className="text-gray-700">des études de cas issues du marché</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white mr-4 flex-shrink-0 mt-1 font-bold text-sm">
                        ✓
                      </span>
                      <span className="text-gray-700">l'application pratique et opérationnelle</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white mr-4 flex-shrink-0 mt-1 font-bold text-sm">
                        ✓
                      </span>
                      <span className="text-gray-700">un suivi continu assuré par des experts</span>
                    </li>
                  </ul>
                </div>

                {/* Summary Box */}
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <p className="text-gray-800 leading-relaxed">
                    <span className="font-semibold text-gray-900">Chaque étape vise à renforcer vos compétences réelles et votre autonomie professionnelle</span>
                  </p>
                </div>
              </div>

              {/* Right Column - Visual Stats */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl blur-3xl"></div>
                <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                  <div className="space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600 mb-2">5,000+</div>
                        <p className="text-sm text-gray-700 font-medium">Professionnels accompagnés</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                        <div className="text-3xl font-bold text-purple-600 mb-2">200+</div>
                        <p className="text-sm text-gray-700 font-medium">cycles accompagnement</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                        <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
                        <p className="text-sm text-gray-700 font-medium">Taux de satisfaction</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                        <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                        <p className="text-sm text-gray-700 font-medium">Support disponible</p>
                      </div>
                    </div>

                    {/* Key Points */}
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Résultats Mesurables</p>
                          <p className="text-xs text-gray-600">Accompagnement basé sur des objectifs clairs</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Flexibilité Totale</p>
                          <p className="text-xs text-gray-600">Adapté à votre rythme et vos contraintes</p>
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

      {/* Positionnement Professionnel Section */}
      <section className="py-20 bg-gradient-to-b from-white via-blue-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Positionnement{" "}
                <span className="text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Professionnel
                </span>
              </h2>
              <p className="text-2xl font-semibold text-gray-800 mb-8">
                Ce que nous faisons — et ce que nous ne faisons pas
              </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              {/* Left Column - What We Do */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
                  <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-3">
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                      ✔
                    </span>
                    Ce que nous faisons
                  </h3>
                  
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-500 text-white flex-shrink-0 mt-1 font-bold text-sm">
                        ✓
                      </span>
                      <span className="text-gray-700 font-medium">Accompagnement professionnel</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-500 text-white flex-shrink-0 mt-1 font-bold text-sm">
                        ✓
                      </span>
                      <span className="text-gray-700 font-medium">Développement de compétences pratiques</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-500 text-white flex-shrink-0 mt-1 font-bold text-sm">
                        ✓
                      </span>
                      <span className="text-gray-700 font-medium">Coaching orienté objectifs</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-500 text-white flex-shrink-0 mt-1 font-bold text-sm">
                        ✓
                      </span>
                      <div>
                        <p className="text-gray-700 font-medium">Dossiers professionnels privés</p>
                        <p className="text-sm text-gray-600 mt-1">complètent un parcours professionnel, mais ne remplacent pas les titres officiels</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-500 text-white flex-shrink-0 mt-1 font-bold text-sm">
                        ✓
                      </span>
                      <span className="text-gray-700 font-medium">Valorisation du parcours</span>
                    </li>
                  </ul>
                </div>

                {/* Key Differentiator */}
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded-lg">
                  <p className="text-gray-800 leading-relaxed">
                    <span className="font-semibold text-gray-900">Notre force :</span> Une approche centrée sur l'application pratique et immédiate des compétences dans votre contexte professionnel.
                  </p>
                </div>
              </div>

              {/* Right Column - Visual Summary */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl blur-3xl"></div>
                <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                  <div className="space-y-8">
                    {/* Professional Positioning */}
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Reconnaissance Professionnelle</h4>
                          <p className="text-sm text-gray-600">Valorisé par les entreprises et recruteurs internationaux</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-teal-600">
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Complémentarité</h4>
                          <p className="text-sm text-gray-600">Complète diplômes et certifications officiels</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Transparence Totale</h4>
                          <p className="text-sm text-gray-600">Documents professionnels privés, clairement identifiés</p>
                        </div>
                      </div>
                    </div>

                    {/* Highlight Box */}
                    <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-900 font-medium">
                        <span className="font-bold">💡 Important :</span> Nous ne délivrons pas de diplômes ou certifications officiels, mais des documents professionnels reconnus.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nature des Documents Délivrés Section */}
      <section className="py-20 bg-gradient-to-b from-white via-blue-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Nature des{" "}
                <span className="text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Documents Délivrés
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Documents professionnels internes et privés
              </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
              {/* Left Column - Documents */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">
                    À l'issue d'un parcours d'accompagnement
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    Nous délivrons des documents professionnels propres à MA Training Consulting :
                  </p>
                  
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-500 text-white flex-shrink-0 mt-1 font-bold text-sm">
                        •
                      </span>
                      <span className="text-gray-700 font-medium">Document de participation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-500 text-white flex-shrink-0 mt-1 font-bold text-sm">
                        •
                      </span>
                      <span className="text-gray-700 font-medium">Dossier professionnel individuel</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-500 text-white flex-shrink-0 mt-1 font-bold text-sm">
                        •
                      </span>
                      <span className="text-gray-700 font-medium">Synthèse des compétences travaillées</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-500 text-white flex-shrink-0 mt-1 font-bold text-sm">
                        •
                      </span>
                      <span className="text-gray-700 font-medium">Lettre de recommandation du consultant</span>
                    </li>
                  </ul>

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">Statut légal :</span> Ces documents sont internes, privés, et utilisés comme éléments de valorisation professionnelle. Ils ne relèvent pas du régime des diplômes ni des certifications contrôlées par l'État.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Utilité */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-8 border border-purple-200">
                  <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-3">
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold">
                      ✓
                    </span>
                    Utilité des Documents
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-6 font-medium">
                    Comment ils vous aident dans votre carrière
                  </p>
                  
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-500 text-white flex-shrink-0 mt-1 font-bold text-sm">
                        ✓
                      </span>
                      <span className="text-gray-700">renforcer votre CV</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-500 text-white flex-shrink-0 mt-1 font-bold text-sm">
                        ✓
                      </span>
                      <span className="text-gray-700">démontrer vos compétences opérationnelles</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-500 text-white flex-shrink-0 mt-1 font-bold text-sm">
                        ✓
                      </span>
                      <span className="text-gray-700">présenter vos projets ou exercices appliqués</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-500 text-white flex-shrink-0 mt-1 font-bold text-sm">
                        ✓
                      </span>
                      <span className="text-gray-700">appuyer une candidature ou évolution interne</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-500 text-white flex-shrink-0 mt-1 font-bold text-sm">
                        ✓
                      </span>
                      <span className="text-gray-700">enrichir votre profil LinkedIn</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-500 text-white flex-shrink-0 mt-1 font-bold text-sm">
                        ✓
                      </span>
                      <span className="text-gray-700">monter un dossier professionnel complet</span>
                    </li>
                  </ul>

                  <div className="mt-6 p-4 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-900 font-medium">
                      <span className="font-bold">💡</span> Ils représentent une preuve de participation, d'engagement et de travail effectif.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Processus d'Accompagnement Section */}
      <section className="py-20 bg-gradient-to-b from-white via-blue-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Processus{" "}
                <span className="text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  d'Accompagnement
                </span>
              </h2>
              <p className="text-xl text-gray-600">
                Les étapes clés du parcours
              </p>
            </div>

            {/* 6 Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {/* Step 1 */}
              <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">1️⃣</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 pt-1">Analyse & diagnostic professionnel</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed ml-16">
                  Évaluation complète de votre profil, vos objectifs et vos besoins spécifiques
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow border-l-4 border-purple-500">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">2️⃣</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 pt-1">Rencontres d'accompagnement (en ligne)</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed ml-16">
                  Sessions interactives régulières avec nos experts pour explorer vos défis
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">3️⃣</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 pt-1">Études et cas pratiques du marché</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed ml-16">
                  Analyse de situations réelles et tendances actuelles de votre secteur
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow border-l-4 border-orange-500">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">4️⃣</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 pt-1">Exercices opérationnels appliqués</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed ml-16">
                  Mise en pratique immédiate à travers des projets concrets et exercices professionnels
                </p>
              </div>

              {/* Step 5 */}
              <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow border-l-4 border-pink-500">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-pink-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">5️⃣</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 pt-1">Feedback professionnel et ajustements</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed ml-16">
                  Retours détaillés et recommandations personnalisées pour votre progression
                </p>
              </div>

              {/* Step 6 */}
              <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow border-l-4 border-indigo-500">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">6️⃣</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 pt-1">Validation interne et remise du dossier</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed ml-16">
                  Validation de vos compétences et remise du dossier professionnel complet
                </p>
              </div>
            </div>

            {/* Summary Box */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-10 shadow-lg text-white">
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0">✨</div>
                <div>
                  <h3 className="font-bold text-2xl mb-3">Un parcours complet et structuré</h3>
                  <p className="text-blue-50 leading-relaxed">
                    Chaque étape est conçue pour renforcer vos compétences, valider votre progression et vous préparer à réussir dans votre contexte professionnel. Notre approche garantit un accompagnement personnalisé et des résultats mesurables.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Résultats & Avantages Section */}
      <section className="py-20 bg-gradient-to-b from-white via-blue-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Résultats{" "}
                <span className="text-gradient bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  & Avantages
                </span>
              </h2>
              <p className="text-xl text-gray-600">
                Ce que vous gagnez à la fin du parcours
              </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Visual Element */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl blur-3xl"></div>
                <div className="relative bg-white rounded-2xl p-10 shadow-xl border border-gray-100">
                  <div className="space-y-6">
                    {/* Benefit Item 1 */}
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700">
                          <Award className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Vision claire de votre domaine</h4>
                        <p className="text-sm text-gray-600">Compréhension approfondie des enjeux et tendances</p>
                      </div>
                    </div>

                    {/* Benefit Item 2 */}
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700">
                          <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Compétences pratiques renforcées</h4>
                        <p className="text-sm text-gray-600">Maîtrise opérationnelle et immédiatement applicable</p>
                      </div>
                    </div>

                    {/* Benefit Item 3 */}
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-green-700">
                          <Briefcase className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Projet ou exercice appliqué selon votre niveau</h4>
                        <p className="text-sm text-gray-600">Travail concret à valoriser dans votre portfolio</p>
                      </div>
                    </div>

                    {/* Benefit Item 4 */}
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Dossier professionnel finalisé</h4>
                        <p className="text-sm text-gray-600">Document complet attestant votre parcours</p>
                      </div>
                    </div>

                    {/* Benefit Item 5 */}
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-pink-500 to-pink-700">
                          <Mail className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Recommandation personnalisée</h4>
                        <p className="text-sm text-gray-600">Lettre valorisant votre engagement et progression</p>
                      </div>
                    </div>

                    {/* Benefit Item 6 */}
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Intégration dans notre réseau professionnel</h4>
                        <p className="text-sm text-gray-600">Accès à une communauté d'experts et d'opportunités</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Benefits List */}
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-10 border border-yellow-200">
                  <h3 className="font-bold text-2xl text-gray-900 mb-8 flex items-center gap-3">
                    <span className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 text-white font-bold text-lg">
                      ✨
                    </span>
                    Vos Avantages
                  </h3>

                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-yellow-500 text-white flex-shrink-0 mt-1 font-bold text-sm">
                        ✓
                      </span>
                      <span className="text-gray-700 font-medium">Vision claire de votre domaine</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-yellow-500 text-white flex-shrink-0 mt-1 font-bold text-sm">
                        ✓
                      </span>
                      <span className="text-gray-700 font-medium">Compétences pratiques renforcées</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-yellow-500 text-white flex-shrink-0 mt-1 font-bold text-sm">
                        ✓
                      </span>
                      <span className="text-gray-700 font-medium">Projet ou exercice appliqué selon votre niveau</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-yellow-500 text-white flex-shrink-0 mt-1 font-bold text-sm">
                        ✓
                      </span>
                      <span className="text-gray-700 font-medium">Dossier professionnel finalisé</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-yellow-500 text-white flex-shrink-0 mt-1 font-bold text-sm">
                        ✓
                      </span>
                      <span className="text-gray-700 font-medium">Recommandation personnalisée</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-yellow-500 text-white flex-shrink-0 mt-1 font-bold text-sm">
                        ✓
                      </span>
                      <span className="text-gray-700 font-medium">Intégration dans notre réseau professionnel</span>
                    </li>
                  </ul>
                </div>

                {/* Highlight Box */}
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg">
                  <p className="text-gray-800 leading-relaxed">
                    <span className="font-semibold text-gray-900">Résultat final :</span> Un parcours complet qui vous transforme professionnellement avec des preuves tangibles de votre progression et des opportunités concrètes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mentions Légales Section */}
      <section className="py-20 bg-gradient-to-b from-white via-blue-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                📝 Mentions Légales
              </h2>
              <p className="text-xl text-gray-600">
                <span className="text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                  Documents Professionnels
                </span>
              </p>
            </div>

            {/* Legal Notice Box */}
            <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100">
              {/* Disclaimer Box */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-10 border-l-4 border-blue-600">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white text-xl font-bold">
                      ⚠️
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-4">Important à retenir</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white flex-shrink-0 mt-0.5 font-bold text-sm">
                          1
                        </span>
                        <p className="text-gray-800 leading-relaxed">
                          <span className="font-semibold text-gray-900">Accompagnement professionnel uniquement :</span> MA Training Consulting propose uniquement de l'accompagnement professionnel, pas de formations réglementées.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white flex-shrink-0 mt-0.5 font-bold text-sm">
                          2
                        </span>
                        <p className="text-gray-800 leading-relaxed">
                          <span className="font-semibold text-gray-900">Documents privés :</span> Les documents délivrés (dossier professionnel, recommandation, preuves de participation) sont privés et attestent du suivi du parcours, sans équivalence à un diplôme ou certification officielle.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-700 leading-relaxed">
                  Ces documents complètent votre profil professionnel et sont reconnus par les entreprises et recruteurs comme preuve de votre engagement et de vos compétences acquises, sans remplacer les qualifications officielles.
                </p>
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
