import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {
  StarIcon,
  CheckIcon,
  PlayIcon,
  BookOpenIcon,
  UserGroupIcon,
  ClockIcon,
  TrophyIcon,
  AcademicCapIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";
import {
  Mail,
  Users,
  Shield,
  Lightbulb,
  TrendingUp,
  UserCheck,
  Clock,
  Video,
  Target,
  Briefcase,
  BookOpen,
  Code,
  CheckCircle,
  Award,
  Globe,
  ArrowLeft,
  ChevronRight,
  MessageCircle,
  Search,
  Filter,
  X
} from "lucide-react";
import { testimonialsApiService, TestimonialData } from "../services/testimonialsApiService";
import CertificateVerification from "./CertificateVerification";
import FreeCourseModal from "./FreeCourseModal";
import ProgramRegistrationModal from "./ProgramRegistrationModal";
import ProgramCard from "./ProgramCard";
import ThemePackSection from "./ThemePackSection";
import CurrencySelector from "./CurrencySelector";
import InteractiveQCMModal from "./InteractiveQCMModal";
import { Program, getTrainingPrograms } from "../data/trainingPrograms";
import { getPacksWithFallback } from "../services/packsApi";
import { fetchCategories } from "../services/programsApi";

interface ETrainingPageProps {
  onBack: () => void;
}

const ETrainingPage: React.FC<ETrainingPageProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [showUnifiedCatalogModal, setShowUnifiedCatalogModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCertificateVerification, setShowCertificateVerification] =
    useState(false);
  const [showFreeCourseModal, setShowFreeCourseModal] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [durationFilter, setDurationFilter] = useState<string[]>([]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("€");
  
  // States pour les témoignages
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);
  
  // State for dynamic categories
  const [categories, setCategories] = useState<string[]>(['Tous', 'Technologies', 'Marketing', 'Data Science', 'Design', 'Business']);
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
        // Load categories first
        const apiCategories = await fetchCategories();
        setCategories(apiCategories);
        console.log('📂 Categories loaded:', apiCategories);
        
        // Load programs
        const apiPrograms = await getTrainingPrograms();
        setPrograms(apiPrograms);
        
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
      subtitle: "Accédez à vos sessions d'accompagnement",
      buttonText: "Accéder maintenant",
      color: "blue",
    },
    {
      icon: Shield,
      title: "Vérifier Certification",
      subtitle: "Validez votre certificat professionnel",
      buttonText: "Vérifier maintenant",
      color: "purple",
    },
    {
      icon: Lightbulb,
      title: "Session Gratuite",
      subtitle: "Initiation offerte",
      buttonText: "Commencer gratuitement",
      color: "yellow",
    },
  ];

  // Stats Data
  const stats = [
    {
      icon: Users,
      number: "5,000+",
      label: "Participants actifs",
      color: "blue",
    },
    {
      icon: TrendingUp,
      number: "200+",
      label: "Classes virtuelles/mois",
      color: "purple",
    },
    {
      icon: UserCheck,
      number: "98%",
      label: "Taux de satisfaction",
      color: "green",
    },
    {
      icon: Clock,
      number: "24/7",
      label: "Support disponible",
      color: "orange",
    },
  ];

  // Pillars Data
  const pillars = [
    {
      icon: Video,
      title: "Classes interactives en direct",
      description:
        "Sessions live avec interaction temps réel et engagement maximum",
      color: "blue",
    },
    {
      icon: Target,
      title: "Coaching individuel personnalisé",
      description:
        "Accompagnement sur-mesure adapté à vos objectifs professionnels",
      color: "purple",
    },
    {
      icon: Briefcase,
      title: "Ateliers pratiques et concrets",
      description:
        "Mise en pratique immédiate avec des projets réels du marché",
      color: "green",
    },
    {
      icon: TrendingUp,
      title: "Consulting stratégique par des experts",
      description:
        "Conseils d'experts expérimentés pour accélérer votre croissance",
      color: "orange",
    },
  ];

  // Journey Steps
  const journeySteps = [
    {
      step: 1,
      icon: BookOpen,
      title: "Contenu de base",
      description:
        "Acquisition des fondamentaux théoriques et concepts clés de votre domaine",
      color: "blue",
    },
    {
      step: 2,
      icon: Video,
      title: "Ateliers en direct",
      description:
        "Sessions interactives live avec nos experts pour approfondir vos connaissances",
      color: "purple",
    },
    {
      step: 3,
      icon: Code,
      title: "Applications pratiques",
      description:
        "Mise en pratique immédiate avec des projets concrets et cas d'usage réels",
      color: "green",
    },
    {
      step: 4,
      icon: CheckCircle,
      title: "Évaluations continues",
      description:
        "Suivi personnalisé de vos progrès avec feedback constructif et adaptatif",
      color: "orange",
    },
    {
      step: 5,
      icon: Users,
      title: "Coaching personnalisé",
      description:
        "Accompagnement individuel pour optimiser votre parcours et atteindre vos objectifs",
      color: "pink",
    },
  ];

  // Benefits Data
  const benefits = [
    {
      icon: Award,
      title: "Certificat professionnel de compétences",
      description:
        "Délivré à l'issue du parcours d'accompagnement, attestant des compétences développées et validées pendant les ateliers pratiques et les sessions interactives.",
    },
    {
      icon: Mail,
      title: "Lettre de recommandation",
      description:
        "Lettre personnalisée basée sur la participation et l'évolution du candidat",
    },
    {
      icon: Globe,
      title: "Accès au réseau d'experts",
      description:
        "Intégrez notre communauté exclusive de professionnels et développez votre réseau",
    },
    {
      icon: TrendingUp,
      title: "Priorité aux opportunités",
      description:
        "Bénéficiez d'un accès privilégié aux offres d'emploi et missions de nos partenaires",
    },
  ];

  // Removed hardcoded programs data - now using API data from MongoDB
  // Categories are now loaded dynamically from API in useEffect
  const levels = ["Tous niveaux", "Débutant", "Intermédiaire", "Avancé"];
  const durations = [
    "Moins de 8 semaines",
    "8-12 semaines",
    "12-16 semaines",
    "Plus de 16 semaines",
  ];

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch =
      program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (program.description && program.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const programCategory = typeof program.category === 'object' && program.category?.name 
      ? program.category.name 
      : typeof program.category === 'string' 
        ? program.category 
        : '';
    
    const matchesFilters =
      selectedFilters.length === 0 ||
      selectedFilters.includes(programCategory) ||
      selectedFilters.includes(program.level);

    // Price filter - program.price is now a number from MongoDB
    const programPrice = typeof program.price === 'number' ? program.price : parseInt(String(program.price).replace(" DT", ""));
    const matchesPrice =
      programPrice >= priceRange[0] && programPrice <= priceRange[1];

    // Duration filter
    const matchesDuration =
      durationFilter.length === 0 ||
      durationFilter.some((duration) => {
        const weeks = parseInt(program.duration.split(" ")[0]);
        switch (duration) {
          case "Moins de 8 semaines":
            return weeks < 8;
          case "8-12 semaines":
            return weeks >= 8 && weeks <= 12;
          case "12-16 semaines":
            return weeks >= 12 && weeks <= 16;
          case "Plus de 16 semaines":
            return weeks > 16;
          default:
            return true;
        }
      });

    // Rating filter
    const matchesRating = ratingFilter === 0 || (program.rating && program.rating >= ratingFilter);

    return (
      matchesSearch &&
      matchesFilters &&
      matchesPrice &&
      matchesDuration &&
      matchesRating
    );
  });

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const toggleDurationFilter = (duration: string) => {
    setDurationFilter((prev) =>
      prev.includes(duration)
        ? prev.filter((d) => d !== duration)
        : [...prev, duration]
    );
  };

  const clearAllFilters = () => {
    setSelectedFilters([]);
    setSearchTerm("");
    setPriceRange([0, 5000]);
    setDurationFilter([]);
    setRatingFilter(0);
  };

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
      <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-yellow-50">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div>
                <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Boostez{" "}
                  <span className="text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    votre carrière
                  </span>{" "}
                  avec un accompagnement sur-mesure
                </h1>

                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  <span className="text-blue-600 font-semibold">
                    Coaching personnalisé
                  </span>{" "}
                  •
                  <span className="text-purple-600 font-semibold">
                    {" "}
                    Expertise à la demande
                  </span>{" "}
                  •
                  <span className="text-orange-600 font-semibold">
                    {" "}
                    Suivi sur-mesure
                  </span>
                </p>

                {/* Hero Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {heroCards.map((card, index) => (
                    <div
                      key={index}
                      className="navigation-card group cursor-pointer"
                      onClick={() => {
                        if (card.title === "Espace Participant") {
                          navigate("/espace-participant");
                        } else if (card.title === "Vérifier Certification") {
                          setShowCertificateVerification(true);
                        } else if (card.title === "Session Gratuite") {
                          setShowFreeCourseModal(true);
                        }
                      }}
                    >
                      <div
                        className={`navigation-card-icon bg-gradient-to-br ${
                          card.color === "blue"
                            ? "from-blue-500 to-blue-700"
                            : card.color === "purple"
                            ? "from-purple-500 to-purple-700"
                            : "from-yellow-500 to-yellow-700"
                        }`}
                      >
                        <card.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {card.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {card.subtitle}
                        </p>
                        <button className="navigation-card-button text-sm">
                          <span>{card.buttonText}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right - Virtual Class Interface */}
              <div className="relative">
                <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white font-bold text-lg">
                      Parcours Marketing Digital
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-400 font-bold text-sm">
                        REC
                      </span>
                    </div>
                  </div>

                  {/* Instructor */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center font-bold text-gray-900">
                        M
                      </div>
                      <div>
                        <h4 className="text-white font-bold">MAALOUL AHMED</h4>
                        <p className="text-blue-200 text-sm">
                          🎯 Expert Marketing • 15 ans d'expérience
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-green-300 text-xs">
                            Partage d'écran actif
                          </span>
                          <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold ml-2">
                            LIVE
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="space-y-2 mb-6">
                    <div className="bg-purple-600 rounded-lg p-3 flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        M
                      </div>
                      <span className="text-white font-medium">Marie D.</span>
                    </div>
                    <div className="bg-teal-600 rounded-lg p-3 flex items-center space-x-3">
                      <div className="w-8 h-8 bg-teal-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        P
                      </div>
                      <span className="text-white font-medium">Pierre L.</span>
                    </div>
                    <div className="bg-pink-600 rounded-lg p-3 flex items-center space-x-3">
                      <div className="w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        S
                      </div>
                      <span className="text-white font-medium">Sophie R.</span>
                    </div>
                  </div>

                  {/* Chat */}
                  <div className="bg-gray-800 rounded-lg p-4 mb-6">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-gray-900">
                          M
                        </div>
                        <div>
                          <p className="text-white text-sm">
                            <span className="font-bold">MAALOUL AHMED:</span>{" "}
                            Avez-vous des questions sur cette stratégie ?
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                          M
                        </div>
                        <div>
                          <p className="text-white text-sm">
                            <span className="font-bold">Marie:</span> Oui,
                            comment mesurer le ROI ?
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                          P
                        </div>
                        <div>
                          <p className="text-white text-sm">
                            <span className="font-bold">Pierre:</span>{" "}
                            Excellente question Marie ! 👍
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                      <div className="flex items-center space-x-4 text-gray-400 text-sm">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>24 participants</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>12 questions</span>
                        </div>
                      </div>
                      <button className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Session Interactive
                      </button>
                    </div>
                  </div>

                  {/* Progress Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-purple-600 rounded-lg p-3 text-center">
                      <BookOpen className="w-6 h-6 text-white mx-auto mb-2" />
                      <div className="text-white font-bold text-lg">12/15</div>
                      <div className="text-purple-200 text-xs">Cours</div>
                    </div>
                    <div className="bg-orange-600 rounded-lg p-3 text-center">
                      <Target className="w-6 h-6 text-white mx-auto mb-2" />
                      <div className="text-white font-bold text-lg">8/10</div>
                      <div className="text-orange-200 text-xs">Objectifs</div>
                    </div>
                    <div className="bg-green-600 rounded-lg p-3 text-center">
                      <Award className="w-6 h-6 text-white mx-auto mb-2" />
                      <div className="text-white font-bold text-lg">3</div>
                      <div className="text-green-200 text-xs">Attestations</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-sm font-medium">
                        Progression:
                      </span>
                      <span className="text-white text-sm font-bold">
                        80% complété
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                        style={{ width: "80%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats & Approach Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Notre Approche{" "}
                <span className="text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  &
                </span>{" "}
                Nos Valeurs
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                Apprentissage interactif et personnalisé pour une transformation
                professionnelle réussie
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
              {stats.map((stat, index) => (
                <div key={index} className="key-point-card text-center">
                  <div
                    className={`key-point-icon mx-auto bg-gradient-to-br ${
                      stat.color === "blue"
                        ? "from-blue-500 to-blue-700"
                        : stat.color === "purple"
                        ? "from-purple-500 to-purple-700"
                        : stat.color === "green"
                        ? "from-green-500 to-green-700"
                        : "from-orange-500 to-orange-700"
                    }`}
                  >
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Pillars */}
            <div className="mb-16">
              <h3 className="font-display text-2xl font-bold text-gray-900 mb-8 text-center">
                Nos Piliers
              </h3>
              <p className="text-gray-600 text-center mb-12">
                Les fondements de notre excellence pédagogique
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {pillars.map((pillar, index) => (
                  <div key={index} className="services-card text-center">
                    <div
                      className={`services-icon mx-auto bg-gradient-to-br ${
                        pillar.color === "blue"
                          ? "from-blue-500 to-blue-700"
                          : pillar.color === "purple"
                          ? "from-purple-500 to-purple-700"
                          : pillar.color === "green"
                          ? "from-green-500 to-green-700"
                          : "from-orange-500 to-orange-700"
                      }`}
                    >
                      <pillar.icon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-3">
                      {pillar.title}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal & Pedagogical Information Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            {/* Main Title */}
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                📌 Mentions officielles{" "}
                <span className="text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  &
                </span>{" "}
                positionnement professionnel
              </h2>
            </div>

            {/* About MATC Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
                  <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-3">
                    <span className="text-2xl">🎯</span>
                    Qui sommes-nous ?
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    <strong>MA Training Consulting</strong> est une structure internationale spécialisée dans le développement des compétences professionnelles, l'accompagnement personnalisé et les programmes pratiques destinés à renforcer l'employabilité et la performance opérationnelle des participants.
                    <br/><br/>
                    Nos formations sont conçues selon les standards internationaux et dispensées par des experts intervenant sur des marchés variés.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border border-purple-200">
                  <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-3">
                    <span className="text-2xl">💼</span>
                    Nature et portée de nos attestations
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    À l'issue de chaque programme, MA Training Consulting délivre une attestation professionnelle de compétences, document officiel propre à notre organisme, reconnue dans le marché comme preuve d'un parcours de formation structuré et de compétences pratiques acquises.
                    <br/><br/>
                    <strong>Ces attestations sont utilisées largement dans le milieu professionnel pour :</strong>
                    <ul className="mt-3 space-y-2 text-sm">
                      <li>✓ renforcer un CV,</li>
                      <li>✓ démontrer une expertise opérationnelle,</li>
                      <li>✓ compléter un dossier de recrutement,</li>
                      <li>✓ appuyer une évolution interne ou une reconversion.</li>
                    </ul>
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200">
                  <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-3">
                    <span className="text-2xl">⚖️</span>
                    Important — Mention légale
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    Les attestations délivrées par MA Training Consulting ne constituent pas des diplômes d'État et ne confèrent pas une équivalence académique (BTP, BTS, Licence, Certifications officielles…).
                    <br/><br/>
                    Elles sont classées dans la catégorie des attestations professionnelles privées, utilisées sur le marché international pour valoriser des compétences techniques et pratiques.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 border border-orange-200">
                  <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-3">
                    <span className="text-2xl">🎯</span>
                    Objectifs de nos attestations
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    Elles ont pour objectif de :
                    <ul className="mt-3 space-y-2">
                      <li>✓ certifier des acquis réels,</li>
                      <li>✓ attester d'un parcours de formation encadré,</li>
                      <li>✓ soutenir l'évolution professionnelle,</li>
                    </ul>
                    <br/>
                    sans se substituer aux titres universitaires ou certifications réglementées.
                  </p>
                </div>
              </div>
            </div>

            {/* Legal Notice - Highlighted */}
            <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 rounded-2xl p-10 border-2 border-amber-300 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🔎</div>
                <div className="flex-1">
                  <h3 className="font-bold text-2xl text-gray-900 mb-6">
                    Pour plus d'informations
                  </h3>
                  
                  <div className="space-y-4 text-gray-800">
                    <p className="leading-relaxed">
                      Veuillez consulter la rubrique <strong>"FAQ"</strong> disponible dans le bas de page pour toute question supplémentaire concernant nos attestations, nos programmes et notre positionnement professionnel.
                    </p>

                    <div className="mt-6 pt-6 border-t border-amber-300">
                      <h4 className="font-bold text-gray-900 mb-3">Avantages Marketing & Carrière</h4>
                      <p className="text-sm text-gray-700">
                        ✓ Attestation professionnelle à forte valeur ajoutée<br/>
                        ✓ Positionnement crédible sur le marché international<br/>
                        ✓ Mise en avant de vos compétences techniques & opérationnelles<br/>
                        ✓ Document valorisable auprès des employeurs, cabinets et entreprises
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Parcours Structuré
              </h2>
              <p className="text-xl text-gray-600">
                Un apprentissage progressif et méthodique pour garantir votre
                réussite
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {journeySteps.map((step, index) => (
                <div key={index} className="relative">
                  <div
                    className={`testimonial-card text-center ${
                      step.step === 3 ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br ${
                        step.color === "blue"
                          ? "from-blue-500 to-blue-700"
                          : step.color === "purple"
                          ? "from-purple-500 to-purple-700"
                          : step.color === "green"
                          ? "from-green-500 to-green-700"
                          : step.color === "orange"
                          ? "from-orange-500 to-orange-700"
                          : "from-pink-500 to-pink-700"
                      }`}
                    >
                      <div className="absolute -top-2 -left-2 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-gray-900 text-sm shadow-lg">
                        {step.step}
                      </div>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  {index < journeySteps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ChevronRight className="w-6 h-6 text-blue-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Vos{" "}
                <span className="text-gradient bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  Résultats
                </span>{" "}
                & Avantages ⭐
              </h2>
              <p className="text-xl text-gray-600">
                Des bénéfices concrets et durables pour accélérer votre
                évolution professionnelle
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {benefits.map((benefit, index) => (
                <div key={index} className="navigation-card text-center">
                  <div className="navigation-card-icon bg-gradient-to-br from-yellow-500 to-orange-600 mx-auto">
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
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

      {/* Programs Section */}
      <section id="programs-section" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Nos{" "}
                <span className="text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Programmes
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Découvrez nos formations expertes conçues pour transformer votre
                carrière
              </p>

              {/* Currency Selector */}
              <div className="flex justify-center mb-8">
                <CurrencySelector
                  selectedCurrency={selectedCurrency}
                  onCurrencyChange={setSelectedCurrency}
                />
              </div>

              <button
                onClick={() => setShowUnifiedCatalogModal(true)}
                className="cta-button mb-12"
              >
                🎯 Trouvez votre parcours idéal
              </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-12">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher un programme..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-colors ${
                    showAdvancedFilters
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Filter className="w-5 h-5" />
                  <span>Filtres avancés</span>
                </button>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {[...categories, ...levels].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => toggleFilter(filter)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedFilters.includes(filter)
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Advanced Filters Panel */}
              {showAdvancedFilters && (
                <div className="mt-6 p-6 bg-white rounded-xl border border-gray-200 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">
                      Filtres Avancés
                    </h3>
                    <button
                      onClick={clearAllFilters}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Effacer tout
                    </button>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Prix ({selectedCurrency}): {priceRange[0]} - {priceRange[1]}
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="0"
                        max="5000"
                        step="100"
                        value={priceRange[0]}
                        onChange={(e) =>
                          setPriceRange([
                            parseInt(e.target.value),
                            priceRange[1],
                          ])
                        }
                        className="flex-1"
                      />
                      <input
                        type="range"
                        min="0"
                        max="5000"
                        step="100"
                        value={priceRange[1]}
                        onChange={(e) =>
                          setPriceRange([
                            priceRange[0],
                            parseInt(e.target.value),
                          ])
                        }
                        className="flex-1"
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>0 {selectedCurrency}</span>
                      <span>5000 {selectedCurrency}</span>
                    </div>
                  </div>

                  {/* Duration Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Durée
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {durations.map((duration) => (
                        <button
                          key={duration}
                          onClick={() => toggleDurationFilter(duration)}
                          className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                            durationFilter.includes(duration)
                              ? "bg-purple-600 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {duration}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Note minimum:{" "}
                      {ratingFilter > 0 ? `${ratingFilter}+ étoiles` : "Toutes"}
                    </label>
                    <div className="flex items-center space-x-2">
                      {[0, 3, 4, 4.5, 4.8].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setRatingFilter(rating)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            ratingFilter === rating
                              ? "bg-yellow-500 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {rating === 0 ? "Toutes" : `${rating}+`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Filters Summary */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {filteredPrograms.length} programme(s) trouvé(s)
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedFilters.map((filter) => (
                          <span
                            key={filter}
                            className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                          >
                            <span>{filter}</span>
                            <button
                              onClick={() => toggleFilter(filter)}
                              className="hover:bg-blue-200 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                        {durationFilter.map((duration) => (
                          <span
                            key={duration}
                            className="inline-flex items-center space-x-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs"
                          >
                            <span>{duration}</span>
                            <button
                              onClick={() => toggleDurationFilter(duration)}
                              className="hover:bg-purple-200 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                        {ratingFilter > 0 && (
                          <span className="inline-flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                            <span>{ratingFilter}+ étoiles</span>
                            <button
                              onClick={() => setRatingFilter(0)}
                              className="hover:bg-yellow-200 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                    selectedCurrency={selectedCurrency}
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
        <ThemePackSection selectedCurrency={selectedCurrency} />
      </div>

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
        selectedCurrency={selectedCurrency}
      />
    </div>
  );
};

export default ETrainingPage;
