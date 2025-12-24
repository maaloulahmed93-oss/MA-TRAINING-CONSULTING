import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronRight,
  X
} from "lucide-react";
import { testimonialsApiService, TestimonialData } from "../services/testimonialsApiService";
import CertificateVerification from "./CertificateVerification";
import FreeCourseModal from "./FreeCourseModal";
import ProgramRegistrationModal from "./ProgramRegistrationModal";
import InteractiveQCMModal from "./InteractiveQCMModal";
import { Program, getTrainingPrograms } from "../data/trainingPrograms";
import { digitalizationContactApiService } from "../services/digitalizationContactApiService";

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
  const [loading, setLoading] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [serviceExplainerTab, setServiceExplainerTab] = useState<"service1" | "service2">("service1");
  const [isParcoursInfoOpen, setIsParcoursInfoOpen] = useState(false);

  const openInitiationAccessRequest = () => {
    const url = digitalizationContactApiService.generateWhatsAppLink(
      undefined,
      "Bonjour, je souhaite demander un accès d’initiation à l’Espace Participant (accès découverte – sans accompagnement)."
    );
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const faqItems: Array<{ question: string; answer: React.ReactNode }> = [
    {
      question: "Quel est exactement le type de service ?",
      answer: (
        <div className="space-y-3">
          <p>
            Il s'agit d'un <span className="font-semibold text-gray-900">consulting professionnel</span> : consulting stratégique & comportemental.
          </p>
          <p>
            <span className="font-semibold text-gray-900">Service 1</span> est une <span className="font-semibold text-gray-900">offre unique</span> : diagnostic professionnel (point d’entrée) → avis professionnel (GO / NO-GO / réorientation) → orientation → parcours structuré (phases 0 à 5). Durée moyenne : <span className="font-semibold text-gray-900">~8 semaines</span> (variable).
          </p>
          <div>
            <p className="font-semibold text-gray-900">MA Consulting propose :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Diagnostic professionnel</li>
              <li>Analyse des modes de pensée et de prise de décision</li>
              <li>Réorientation comportementale dans un contexte professionnel réel</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Ce que ce n'est pas :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Une formation</li>
              <li>Du développement personnel motivationnel</li>
              <li>Une mission opérationnelle vendue sans diagnostic, ni validation</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      question: "Est-ce une formation ?",
      answer: (
        <div className="space-y-3">
          <p>
            Non. Nous ne proposons pas de cours, de contenu théorique, de programmes d'enseignement ni d'explication d'outils ou de techniques.
          </p>
          <p>
            Nous travaillons sur <span className="font-semibold text-gray-900">l'analyse du comportement professionnel</span> et sur la manière d'utiliser efficacement des compétences dans le réel.
          </p>
          <p>
            Le diagnostic est un <span className="font-semibold text-gray-900">point d’entrée</span> : il mène à un avis professionnel, une orientation, puis un parcours structuré (phases 0 à 5) — <span className="font-semibold text-gray-900">~8 semaines</span> en moyenne (variable).
          </p>
        </div>
      ),
    },
    {
      question: "Délivrez-vous des certificats ?",
      answer: (
        <div className="space-y-3">
          <p>Non, nous ne délivrons pas de certificats de formation.</p>
          <p>
            Nous fournissons des <span className="font-semibold text-gray-900">documents professionnels formels, vérifiables</span>, qui reflètent :
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>La participation effective</li>
            <li>Le niveau de maturité professionnelle</li>
            <li>La nature de l'accompagnement</li>
          </ul>
          <p className="text-gray-700">
            Ces documents sont destinés aux entreprises (recrutement, mobilité, promotion), et non à un usage académique.
          </p>
          <p className="text-gray-700">
            Aucune promesse d’emploi. Aucun certificat. Des documents internes utiles et vérifiables, quand c’est pertinent.
          </p>
        </div>
      ),
    },
    {
      question: "Proposez-vous des stratégies prêtes à l'emploi ?",
      answer: (
        <div className="space-y-3">
          <p>
            <span className="font-semibold text-gray-900">Non</span> dans l'accompagnement principal : nous ne livrons pas de solutions prêtes ni de “recettes”.
          </p>
          <p>
            <span className="font-semibold text-gray-900">Oui, uniquement</span> dans le cadre d'une <span className="font-semibold text-gray-900">mission de consulting opérationnel</span> (Service 2),
            contractuelle, sur validation, et toujours liée à un diagnostic préalable.
          </p>
        </div>
      ),
    },
    {
      question: "La mission de consulting opérationnel (Service 2) est-elle accessible à tous ?",
      answer: (
        <div className="space-y-3">
          <p>
            <span className="font-semibold text-gray-900">Non.</span> Cette prestation n'est pas automatique, ni ouverte au public.
          </p>
          <p>
            Elle est proposée uniquement <span className="font-semibold text-gray-900">sur validation</span>, après diagnostic,
            et dans un <span className="font-semibold text-gray-900">cadre contractuel</span> pour un projet spécifique.
          </p>
        </div>
      ),
    },
    {
      question: "Quelle différence entre vos documents et un certificat de formation ?",
      answer: (
        <div className="space-y-3">
          <p className="font-semibold text-gray-900">Un certificat de formation :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Peut être reconnu dans un pays et pas dans un autre</li>
            <li>Peut être peu valorisé par certaines entreprises</li>
            <li>Ne reflète pas toujours la posture, la maturité ou la préparation</li>
          </ul>
          <p className="font-semibold text-gray-900">Les documents MA Consulting :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Sont liés à une expérience professionnelle réelle</li>
            <li>Reflètent la pensée, la posture et le comportement</li>
            <li>Sont vérifiables</li>
            <li>Sont lisibles et utiles pour les entreprises</li>
          </ul>
          <p>
            En recrutement et en promotion, l'essentiel reste souvent : l'expérience, un diplôme officiel, et un comportement professionnel clair.
          </p>
        </div>
      ),
    },
    {
      question: "Est-ce du consulting opérationnel ?",
      answer: (
        <div className="space-y-3">
          <p>
            <span className="font-semibold text-gray-900">Service 1 :</span> non — c'est un consulting stratégique & comportemental (diagnostic → avis professionnel → orientation → parcours phases 0 à 5, ~8 semaines en moyenne), sans exécution.
          </p>
          <p>
            <span className="font-semibold text-gray-900">Service 2 :</span> oui — uniquement sous forme de <span className="font-semibold text-gray-900">mission de consulting opérationnel</span>,
            <span className="font-semibold text-gray-900"> sur validation</span>, contractuelle, et toujours liée à un diagnostic préalable.
          </p>
          <p className="font-semibold text-gray-900">Pour les particuliers, nous ne :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Fournissons pas de stratégies prêtes à l'emploi</li>
            <li>N'exécutons pas à la place de la personne</li>
            <li>Ne délivrons pas de solutions opérationnelles directes</li>
          </ul>
          <p>
            Nous proposons un <span className="font-semibold text-gray-900">consulting stratégique & comportemental</span> : analyse, orientation, correction de logique, élargissement de la vision.
          </p>
        </div>
      ),
    },
    {
      question: "Proposez-vous des sessions individuelles pour élargir les idées ?",
      answer: (
        <div className="space-y-3">
          <p>
            Oui, dans le cadre de <span className="font-semibold text-gray-900">Service 1</span> (diagnostic → avis → orientation → parcours structuré), et pas comme une prestation isolée.
            Selon la situation et <span className="font-semibold text-gray-900">le budget</span>, ces sessions peuvent être individuelles ou en <span className="font-semibold text-gray-900">petit groupe (max 5 personnes)</span>, avec une méthodologie similaire.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Élargir la vision professionnelle</li>
            <li>Développer la manière de penser</li>
            <li>Comprendre la logique d'un poste et du marché</li>
            <li>Corriger les erreurs de raisonnement</li>
          </ul>
          <p>
            Sans recettes toutes faites, et sans exécution à la place du participant.
          </p>
        </div>
      ),
    },
    {
      question: "Développez-vous les compétences professionnelles ?",
      answer: (
        <div className="space-y-3">
          <p>
            Nous n'enseignons pas des compétences à partir de zéro.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Nous analysons comment la compétence est utilisée</li>
            <li>Nous corrigeons les mauvais usages</li>
            <li>Nous faisons progresser la maturité dans la décision et le comportement</li>
          </ul>
          <p>
            La différence est majeure entre apprendre une compétence et l'utiliser efficacement en situation réelle.
          </p>
        </div>
      ),
    },
    {
      question: "Le prix est-il fixe ?",
      answer: (
        <div className="space-y-3">
          <p>
            Non. Le prix est défini après un diagnostic professionnel, selon : le niveau, l'objectif, le type d'accompagnement et le cadre temporel.
          </p>
          <p>
            Chaque accompagnement est conçu sur mesure, et non sous forme de pack standard.
          </p>
        </div>
      ),
    },
    {
      question: "Y a-t-il un contrat et une facture ?",
      answer: (
        <div className="space-y-3">
          <p>Oui, toujours.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Contrat de service clair</li>
            <li>Facture officielle</li>
            <li>Planning initial</li>
            <li>Description précise de la nature du service</li>
          </ul>
          <p>Transparence complète dès le départ.</p>
        </div>
      ),
    },
    {
      question: "Les entreprises peuvent-elles vérifier les documents ?",
      answer: (
        <div className="space-y-3">
          <p>Oui.</p>
          <p>
            Via un système de vérification : chaque document possède un <span className="font-semibold text-gray-900">ID unique</span> permettant de confirmer son authenticité.
          </p>
          <p>
            Cela renforce la crédibilité et la transparence.
          </p>
        </div>
      ),
    },
  ];

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
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
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
                    Service 1 — Diagnostic & décision (obligatoire)
                  </h1>

                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 mb-6 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    Vous ne commencez pas par « apprendre ». Vous commencez par clarifier.
                    <span className="block mt-2">
                      <span className="font-semibold text-gray-900">point d’entrée obligatoire</span>.
                    </span>
                    Il mène à un <span className="font-semibold text-gray-900">avis professionnel</span> (GO / NO-GO / réorientation), une orientation, puis un parcours structuré (phases 0 à 5).
                    <span className="block mt-2 text-sm sm:text-base text-gray-600">Service 2 est optionnel : mission opérationnelle sur demande, sur validation, contractuelle, jamais automatique.</span>
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

                  <div className="flex justify-center lg:justify-start mb-8">
                    <button
                      type="button"
                      onClick={() => navigate("/diagnostic-wonder")}
                      className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white text-sm sm:text-base font-semibold rounded-full shadow-[0_14px_30px_-18px_rgba(79,70,229,0.7)] hover:shadow-[0_20px_44px_-22px_rgba(79,70,229,0.85)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center ring-1 ring-white/10"
                    >
                      <span>Commencer par le diagnostic professionnel</span>
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
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
              </div>

              {/* Right - Diagnostic Interface */}
              <div className="relative order-2 lg:order-2 w-full max-w-md mx-auto lg:max-w-none lg:mx-0">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-2xl opacity-20"></div>
                
                <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-4 sm:p-5 md:p-6 shadow-[0_24px_80px_-40px_rgba(88,28,135,0.65)] border border-purple-500/20 ring-1 ring-white/10 max-h-[70vh] overflow-x-hidden overflow-y-auto sm:max-h-none sm:overflow-hidden">
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
                      <p className="text-center text-gray-300 text-xs leading-relaxed">
                        Le diagnostic est le point de départ obligatoire. Il démarre juste après cette section.
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
                  <p className="text-xs font-semibold text-slate-600">🧠</p>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-gray-900">
                    Comment fonctionne notre accompagnement ?
                  </h3>
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
                <div className="rounded-2xl bg-slate-50 border border-slate-200/70 p-5">
                  <p className="text-sm text-gray-800 leading-relaxed">
                    Ce parcours n’est ni une formation, ni du développement personnel.
                    <span className="block mt-2">
                      Il s’agit d’un consulting professionnel structuré, basé sur l’analyse réelle, la décision et l’exécution ciblée.
                    </span>
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-3xl bg-gradient-to-b from-emerald-50 to-white border border-emerald-200/70 p-6">
                    <p className="text-sm font-bold text-emerald-900">🟢 Service 1 — Diagnostic & Décision (obligatoire)</p>
                    <p className="mt-2 text-sm text-gray-700">C’est le point d’entrée unique.</p>

                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-900">Ce que nous faisons :</p>
                      <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-gray-700">
                        <li>Analyse de votre situation professionnelle réelle</li>
                        <li>Lecture de votre logique de décision et de votre posture</li>
                        <li>Avis clair : GO / NO-GO / réorientation</li>
                        <li>Clarification des priorités et des risques</li>
                      </ul>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-900">Ce que vous obtenez :</p>
                      <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-gray-700">
                        <li>Un avis professionnel argumenté</li>
                        <li>Une vision claire de votre positionnement</li>
                        <li>Des documents consultatifs vérifiables</li>
                        <li>Une base solide pour décider (ou non) d’aller plus loin</li>
                      </ul>
                    </div>

                    <div className="mt-4 rounded-2xl bg-white/70 border border-emerald-200/70 px-4 py-3">
                      <p className="text-sm text-emerald-900 font-semibold">📌 Aucune solution prête. Aucun contenu pédagogique.</p>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-gradient-to-b from-indigo-50 to-white border border-indigo-200/70 p-6">
                    <p className="text-sm font-bold text-indigo-900">🔵 Service 2 — Mission opérationnelle (optionnelle, sur validation)</p>
                    <p className="mt-2 text-sm text-gray-700">Uniquement si le diagnostic le justifie.</p>

                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-900">Ce que nous faisons :</p>
                      <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-gray-700">
                        <li>Construction d’une stratégie opérationnelle claire</li>
                        <li>Définition d’une roadmap de tâches</li>
                        <li>Mise à disposition d’outils adaptés</li>
                        <li>Accompagnement ciblé selon l’objectif (poste, projet, entreprise)</li>
                      </ul>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-900">Ce que vous obtenez :</p>
                      <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-gray-700">
                        <li>70–80% de la stratégie déjà construite</li>
                        <li>Un cadre prêt à être appliqué</li>
                        <li>Un gain de temps et de cohérence</li>
                        <li>Un accompagnement contractuel clair</li>
                      </ul>
                    </div>

                    <div className="mt-4 rounded-2xl bg-white/70 border border-indigo-200/70 px-4 py-3">
                      <p className="text-sm text-indigo-900 font-semibold">📌 Jamais vendue seule. Toujours liée au diagnostic.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-3xl bg-white border border-slate-200/70 p-6">
                  <p className="text-sm font-bold text-gray-900">⚖️ Cadre légal & professionnel</p>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                    <div className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✔</span><span>Contrat de service</span></div>
                    <div className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✔</span><span>Facture officielle</span></div>
                    <div className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✔</span><span>Planning défini</span></div>
                    <div className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✔</span><span>Documents traçables</span></div>
                    <div className="flex items-start gap-2"><span className="text-rose-700 font-bold">❌</span><span>Pas de diplôme</span></div>
                    <div className="flex items-start gap-2"><span className="text-rose-700 font-bold">❌</span><span>Pas de certification</span></div>
                    <div className="flex items-start gap-2"><span className="text-rose-700 font-bold">❌</span><span>Pas de promesse d’emploi</span></div>
                  </div>
                </div>

                <div className="mt-6 rounded-3xl bg-slate-50 border border-slate-200/70 p-6">
                  <p className="text-sm font-bold text-gray-900">📂 Documents possibles (selon service)</p>
                  <ul className="mt-3 list-disc pl-5 space-y-1 text-sm text-gray-700">
                    <li>Diagnostic professionnel</li>
                    <li>Avis professionnel (GO / NO-GO)</li>
                    <li>Synthèse de positionnement</li>
                    <li>Document de mission (Service 2)</li>
                    <li>Attestation de participation vérifiable</li>
                  </ul>
                  <p className="mt-3 text-sm text-gray-700">
                    🔎 Tous les documents peuvent être vérifiés par une entreprise.
                  </p>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/diagnostic-wonder")}
                    className="group w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white text-sm font-semibold shadow-[0_14px_30px_-18px_rgba(79,70,229,0.7)] hover:shadow-[0_20px_44px_-22px_rgba(79,70,229,0.85)] transition-all duration-300 inline-flex items-center justify-center"
                  >
                    <span>Commencer par le diagnostic</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <a
                    href="mailto:contact@ma-training-consulting.com?subject=Demande%20de%20diagnostic"
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white text-gray-900 text-sm font-semibold border border-slate-200/70 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 inline-flex items-center justify-center"
                  >
                    Être contacté pour le diagnostic
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section id="domains-section" className="py-14 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-purple-50/40 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-14 lg:mb-16">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Service 1{" "}
                <span className="text-gradient bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  — Diagnostic & décision (obligatoire)
                </span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
                Consulting stratégique & comportemental : <span className="font-semibold text-gray-900">diagnostic professionnel (entrée obligatoire)</span> → avis (GO / NO-GO / réorientation) → orientation → parcours structuré (phases 0 à 5).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="group bg-gradient-to-b from-white to-slate-50 rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ring-1 ring-black/5">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4 font-bold">1</div>
                <h3 className="font-bold text-gray-900 mb-2">Diagnostic professionnel</h3>
                <div className="text-sm text-gray-600 leading-relaxed">
                  <p>Clarifier la situation réelle et les enjeux.</p>
                </div>
              </div>
              <div className="group bg-gradient-to-b from-white to-slate-50 rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ring-1 ring-black/5">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 font-bold">2</div>
                <h3 className="font-bold text-gray-900 mb-2">Analyse décisionnelle</h3>
                <div className="text-sm text-gray-600 leading-relaxed">
                  <p>Identifier la logique, les risques et les leviers.</p>
                </div>
              </div>
              <div className="group bg-gradient-to-b from-white to-slate-50 rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ring-1 ring-black/5">
                <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center mb-4 font-bold">3</div>
                <h3 className="font-bold text-gray-900 mb-2">Avis & orientation</h3>
                <div className="text-sm text-gray-600 leading-relaxed">
                  <p>Décision claire et orientation : GO / NO-GO / réorientation.</p>
                </div>
              </div>
              <div className="group bg-gradient-to-b from-white to-slate-50 rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ring-1 ring-black/5">
                <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center mb-4 font-bold">4</div>
                <h3 className="font-bold text-gray-900 mb-2">Accompagnement stratégique</h3>
                <div className="text-sm text-gray-600 leading-relaxed">
                  <p>Activé si GO, en situation réelle.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-emerald-200/70 shadow-sm ring-1 ring-black/5 p-5">
                <p className="text-sm font-bold text-emerald-900">Service 1 — Diagnostic & décision</p>
                <p className="mt-2 text-sm text-gray-700">Obligatoire. Clarté, orientation, posture, sans promesses.</p>
              </div>
              <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-indigo-200/70 shadow-sm ring-1 ring-black/5 p-5">
                <p className="text-sm font-bold text-indigo-900">Service 2 — Mission opérationnelle</p>
                <p className="mt-2 text-sm text-gray-700">Optionnelle, sur validation. Contractuelle et toujours liée au diagnostic.</p>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center">
              <button
                onClick={() => navigate("/diagnostic-wonder")}
                className="group w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white text-sm sm:text-base font-semibold rounded-full shadow-[0_14px_30px_-18px_rgba(79,70,229,0.7)] hover:shadow-[0_20px_44px_-22px_rgba(79,70,229,0.85)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center justify-center"
              >
                <span>🟣 Commencer par le diagnostic professionnel (gratuit)</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="mt-3 text-sm text-gray-600 text-center max-w-2xl">
                Tout commence par une décision claire.
              </p>
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
                <span className="text-xs sm:text-sm font-semibold text-slate-700">Comment ça marche</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mt-5 mb-4 tracking-tight">
                Diagnostic → avis → orientation,
                <span className="block text-gradient bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  puis phases 0 à 5 (parcours structuré)
                </span>
              </h2>
              <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Durée moyenne : <span className="font-semibold text-gray-900">~8 semaines</span> (variable).
                Sessions possibles : individuelles ou en <span className="font-semibold text-gray-900">petit groupe (max 5)</span>, avec une méthodologie similaire.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-8 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10" />
                <div className="relative">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200/70 text-purple-700 text-xs font-bold mb-3">
                        Phases 0–2 — Diagnostic, correction, stabilisation
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

                  <div className="rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/70 p-5">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="mt-1 h-5 w-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[11px] font-bold">1</span>
                        <p className="text-sm text-gray-700">Phase 0 : cadrage, objectifs, contexte professionnel</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mt-1 h-5 w-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[11px] font-bold">2</span>
                        <p className="text-sm text-gray-700">Phase 1 : diagnostic + avis (GO / NO-GO / réorientation)</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                        <p className="text-sm text-gray-700">Phase 2 : correction + stabilisation (décision & posture)</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-purple-50/70 border border-purple-200/70 px-4 py-3">
                    <p className="text-sm text-purple-900 font-semibold">
                      Aucun cours. Aucun contenu. Une décision.
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
                        Phases 3–5 — Activation, positionnement, validation
                      </div>
                      <p className="text-sm font-semibold text-gray-900">Uniquement après avis professionnel (GO)</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl bg-white/70 border border-slate-200/70 px-4 py-3 shadow-sm">
                      <Briefcase className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-xs font-bold text-gray-900">Objectif</p>
                        <p className="text-xs text-gray-600">Transformer la posture en contexte réel</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/70 p-5">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="mt-1 h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">1</span>
                        <p className="text-sm text-gray-700">Phase 3 : activation des compétences existantes (en contexte réel)</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mt-1 h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">2</span>
                        <p className="text-sm text-gray-700">Phase 4 : positionnement professionnel (langage, attentes, crédibilité)</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                        <p className="text-sm text-gray-700">Phase 5 : validation finale (synthèse, décisions, documents si pertinents)</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 px-4 py-3">
                    <p className="text-sm text-emerald-900 font-semibold">
                      Nous n'enseignons pas des compétences. Nous améliorons l'usage des compétences existantes.
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
                      Pas du contenu. Pas du storytelling. Un diagnostic, une décision, puis une évolution visible en contexte réel.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                    <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-b from-rose-50 to-white p-5">
                      <p className="text-sm font-bold text-rose-900 mb-3">Ce que nous ne faisons pas</p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-rose-700 font-bold">✕</span>
                          <p className="text-sm text-gray-700">Cours ou formation</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-rose-700 font-bold">✕</span>
                          <p className="text-sm text-gray-700">Promesses marketing</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-rose-700 font-bold">✕</span>
                          <p className="text-sm text-gray-700">Exécuter à votre place</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50 to-white p-5">
                      <p className="text-sm font-bold text-emerald-900 mb-3">Ce que nous faisons</p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-emerald-700 font-bold">✓</span>
                          <p className="text-sm text-gray-700">Diagnostic professionnel (obligatoire)</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-emerald-700 font-bold">✓</span>
                          <p className="text-sm text-gray-700">Décision claire : GO / NO-GO / réorientation</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-emerald-700 font-bold">✓</span>
                          <p className="text-sm text-gray-700">Accompagnement stratégique (si GO)</p>
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

      <section id="parcours-section" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Orientation (selon diagnostic){" "}
                <span className="text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  — exemples de parcours
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
                Des exemples d’orientations possibles après avis professionnel.
                <span className="block mt-2 text-base text-gray-600">Ce ne sont pas des programmes d’enseignement : l’accompagnement est un consulting en situation réelle, cadré et traçable.</span>
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200/70 px-4 py-2 text-sm text-gray-700">
                <span className="font-semibold">📌</span>
                <span>Service 1 obligatoire. Service 2 optionnel, uniquement sur validation.</span>
              </div>
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
                      onClick={() => setIsParcoursInfoOpen(true)}
                      className="mt-6 w-full px-5 py-3 rounded-2xl bg-white text-gray-900 text-sm font-semibold border border-slate-200/70 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 inline-flex items-center justify-center gap-2"
                    >
                      <span>En savoir plus</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
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
                <span className="text-xs sm:text-sm font-semibold text-slate-700">Pour qui / pour qui pas</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mt-5 mb-4 tracking-tight">
                Pour qui ce consulting est pertinent —
                <span className="block text-gradient bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  et pour qui il ne l’est pas
                </span>
              </h2>
              <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Filtrage clair dès le diagnostic : on valide (ou non) un accompagnement utile, dans un cadre professionnel.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <div className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7 overflow-hidden flex flex-col">
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
                      <p className="text-sm text-gray-700">Début de carrière</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 text-emerald-700 font-bold">✓</span>
                      <p className="text-sm text-gray-700">Profils en clarification ou reconversion</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-5">
                    <div className="rounded-2xl bg-blue-50/70 border border-blue-200/70 px-4 py-3">
                      <p className="text-sm text-blue-900 font-semibold">Vous passez de candidat flou à profil crédible.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7 overflow-hidden flex flex-col">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-rose-500/10 via-transparent to-orange-500/10" />
                <div className="relative">
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

                  <div className="mt-auto pt-5">
                    <div className="rounded-2xl bg-rose-50/70 border border-rose-200/70 px-4 py-3">
                      <p className="text-sm text-rose-900 font-semibold">Filtrage clair pour protéger votre temps et votre image.</p>
                    </div>
                  </div>
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
                <span className="text-xs sm:text-sm font-semibold text-slate-700">Cadre & preuves</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mt-5 mb-4 tracking-tight">
                Traçabilité, Espace Participant,
                <span className="block text-gradient bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  vérification de participation
                </span>
              </h2>
              <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Chaque participant évolue dans un système fermé, avec suivi, traçabilité et documents exploitables.
                <span className="block mt-2 text-sm sm:text-base text-gray-600">Un espace de travail et de preuve — pas une plateforme de cours.</span>
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
                    <p className="text-sm text-blue-900 font-semibold">Un espace de travail et de preuve — pas une plateforme de cours.</p>
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
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Ce n'est pas un accompagnement informel</h3>
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                      Un cadre fermé, structuré et vérifiable — pensé pour être lisible et exploitable par les entreprises.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                    <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-b from-rose-50 to-white p-5">
                      <p className="text-sm font-bold text-rose-900 mb-3">Ce que ce n'est pas</p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-rose-700 font-bold">✕</span>
                          <p className="text-sm text-gray-700">Certificats ou diplômes</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-rose-700 font-bold">✕</span>
                          <p className="text-sm text-gray-700">Plateforme de cours</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-rose-700 font-bold">✕</span>
                          <p className="text-sm text-gray-700">Présence symbolique sans preuves</p>
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

      <section className="py-14 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-emerald-50/30 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm ring-1 ring-black/5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-xs sm:text-sm font-semibold text-slate-700">Effets observables (sans promesse)</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mt-5 mb-4 tracking-tight">
                Effets observables,
                <span className="block text-gradient bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                  décision, posture, positionnement
                </span>
              </h2>
              <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Des effets observables, <span className="font-semibold text-gray-900">variables selon profil</span>, sans promesse de résultat.
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
                      <p className="text-xs font-bold text-emerald-700">1–2 — Clarté & décisions</p>
                      <h3 className="text-lg font-bold text-gray-900">Voir clair et décider avec méthode</h3>
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
                      <p className="text-sm text-gray-700">Décisions fondées sur une logique — pas sur la réaction</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Capacité à assumer et défendre vos choix, même sous pression</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 px-4 py-3">
                    <p className="text-sm text-emerald-900 font-semibold">Clarté immédiate + décisions plus solides, sans promesses.</p>
                  </div>
                </div>
              </div>

              <div className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-purple-500/10 via-transparent to-orange-500/10" />
                <div className="relative">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/20">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-purple-700">3–4 — Posture & positionnement</p>
                      <h3 className="text-lg font-bold text-gray-900">Posture visible et positionnement plus solide</h3>
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
                      <p className="text-sm text-gray-700">Présentation plus structurée et plus convaincante</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Discours professionnel cohérent pour candidatures et entretiens</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-purple-50/70 border border-purple-200/70 px-4 py-3">
                    <p className="text-sm text-purple-900 font-semibold">Ce que les entreprises observent : posture, clarté, crédibilité.</p>
                  </div>
                </div>
              </div>

              <div className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7 overflow-hidden">
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
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Sans promesses vides</h3>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                    ⚠️ Pas de promesse d'emploi.
                    ⚠️ Pas de certificat générique.
                    MA Consulting apporte des preuves professionnelles, pas des slogans.
                  </p>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-b from-rose-50 to-white p-5">
                      <p className="text-sm font-bold text-rose-900 mb-3">Ce que vous ne trouverez pas</p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-rose-700 font-bold">✕</span>
                          <p className="text-sm text-gray-700">Certificat générique</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-rose-700 font-bold">✕</span>
                          <p className="text-sm text-gray-700">Promesse d'emploi</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50 to-white p-5">
                      <p className="text-sm font-bold text-emerald-900 mb-3">Ce que vous obtenez</p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-emerald-700 font-bold">✓</span>
                          <p className="text-sm text-gray-700">Des preuves. Pas des slogans.</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-emerald-700 font-bold">✓</span>
                          <p className="text-sm text-gray-700">Évolution de posture et de comportement</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-emerald-700 font-bold">✓</span>
                          <p className="text-sm text-gray-700">Documents vérifiables (si pertinents)</p>
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
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span className="text-xs sm:text-sm font-semibold text-slate-700">🔓 Accès expérientiel à l’Espace Participant</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mt-5 mb-4 tracking-tight">
                🔍 Découvrir l’Espace Participant
                <span className="block text-gradient bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Vivre le système — sans accompagnement
                </span>
              </h2>

              <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Accès expérientiel au système MA Consulting.
                <span className="block mt-2">Aucun diagnostic. Aucun accompagnement. Aucune validation professionnelle.</span>
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold">
                  Gratuit
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <div className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7 overflow-hidden flex flex-col">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10" />
                <div className="relative">
                  <div className="flex items-start gap-3 mb-5">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Ce que vous obtenez</h3>
                      <p className="text-sm text-gray-600">Découverte du parcours — lecture seule</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="mt-1 text-emerald-700 font-bold">✓</span>
                      <p className="text-sm text-gray-700">Accès à l’interface Espace Participant</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 text-emerald-700 font-bold">✓</span>
                      <p className="text-sm text-gray-700">Visualisation du parcours type et de la logique du système</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 text-emerald-700 font-bold">✓</span>
                      <p className="text-sm text-gray-700">Ressources internes (lecture seule)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 text-emerald-700 font-bold">✓</span>
                      <p className="text-sm text-gray-700">Parcours d’initiation gratuit</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-7 overflow-hidden flex flex-col">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-rose-500/10 via-transparent to-orange-500/10" />
                <div className="relative">
                  <div className="flex items-start gap-3 mb-5">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-rose-600 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/20">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Ce que vous n’obtenez pas</h3>
                      <p className="text-sm text-gray-600">Aucune validation, aucun support</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="mt-1 text-rose-700 font-bold">✕</span>
                      <p className="text-sm text-gray-700">Pas de diagnostic</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 text-rose-700 font-bold">✕</span>
                      <p className="text-sm text-gray-700">Pas de feedback</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 text-rose-700 font-bold">✕</span>
                      <p className="text-sm text-gray-700">Pas d’accompagnement</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 text-rose-700 font-bold">✕</span>
                      <p className="text-sm text-gray-700">Pas de documents officiels ou vérifiables</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 text-rose-700 font-bold">✕</span>
                      <p className="text-sm text-gray-700">Aucun support humain</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
                <div className="rounded-2xl bg-amber-50/70 border border-amber-200/70 p-5">
                  <p className="text-sm font-bold text-amber-900 mb-2">⚠️ Activation manuelle obligatoire</p>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    L’accès d’initiation est activé uniquement après contact avec le service commercial.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 border border-slate-200/70 p-5">
                  <p className="text-sm font-bold text-gray-900 mb-2">Cadre clair</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Cet accès ne constitue pas un accompagnement professionnel. Il ne donne lieu à aucun diagnostic, aucun avis, aucun document officiel.
                    <span className="block mt-2 font-semibold text-gray-900">Pour un parcours réel → diagnostic professionnel obligatoire.</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={openInitiationAccessRequest}
                  className="group w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white text-sm sm:text-base font-semibold rounded-full shadow-[0_14px_30px_-18px_rgba(79,70,229,0.7)] hover:shadow-[0_20px_44px_-22px_rgba(79,70,229,0.85)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center justify-center"
                >
                  <span>🟣 Demander un accès d’initiation</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
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
                Retours d’expérience{" "}
                <span className="text-gradient bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  (sans promesse)
                </span>
              </h2>
              <p className="text-xl text-gray-600">
                Des parcours réels, dans un cadre professionnel. Pas de storytelling, pas de promesse.
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

      <section className="py-14 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm ring-1 ring-black/5">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span className="text-xs sm:text-sm font-semibold text-slate-700">Services additionnels</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mt-5 mb-4 tracking-tight">
                Services additionnels —
                <span className="block text-gradient bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  activés uniquement selon pertinence
                </span>
              </h2>
              <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Des modules activés selon le niveau et la situation, après diagnostic professionnel.
              </p>
            </div>

            <div className="mt-10 sm:mt-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm ring-1 ring-black/5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs sm:text-sm font-semibold text-slate-700">Activables selon pertinence</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-3">Pour approfondir, quand c'est pertinent</h3>
                <p className="text-sm sm:text-base text-gray-700 max-w-3xl mx-auto leading-relaxed">
                  Activés uniquement selon le niveau et la situation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      ⚠️ Activés uniquement selon le niveau et la situation,
                      <span className="font-semibold text-gray-900"> après un diagnostic professionnel</span>.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-200/70 p-5">
                    <p className="text-sm font-bold text-gray-900 mb-2">Résumé clair</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="mt-1 text-emerald-700 font-bold">✓</span>
                        <p className="text-sm text-gray-700">Sessions 1:1 ou petit groupe (max 5) : oui</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mt-1 text-emerald-700 font-bold">✓</span>
                        <p className="text-sm text-gray-700">Consulting stratégique (décision + posture) : oui</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mt-1 text-rose-700 font-bold">✕</span>
                        <p className="text-sm text-gray-700">Formation technique : non</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mt-1 text-emerald-700 font-bold">✓</span>
                        <p className="text-sm text-gray-700">Service 2 (mission opérationnelle) : sur validation + contractuel</p>
                      </div>
                    </div>
                  </div>
                </div>

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

      <section id="packs-section" className="py-20 bg-gradient-to-b from-white via-slate-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm ring-1 ring-black/5">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span className="text-xs sm:text-sm font-semibold text-slate-700">Service 2 — Mission opérationnelle (sur demande)</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6 mt-5">
                Passer de la décision à l’exécution maîtrisée
                <span className="block text-2xl sm:text-3xl md:text-4xl font-bold text-gradient bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mt-3">
                  Service 2 — Mission opérationnelle (sur demande)
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
                Après clarification et prise de décision (Service 1), certaines personnes ou organisations préfèrent ne pas repartir de zéro.
                <span className="block mt-2">
                  Ici, nous passons — <span className="font-semibold text-gray-900">sur demande</span> — à une mission opérationnelle : transformer la décision en stratégie prête à exécuter,
                  avec des outils et des tâches clairement cadrés.
                </span>
              </p>

              <div className="mt-6 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  <div className="flex items-start gap-2 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/70 ring-1 ring-black/5 px-4 py-3">
                    <span className="text-emerald-700 font-bold">✔</span>
                    <p className="text-sm text-gray-700">Objectifs professionnels précis</p>
                  </div>
                  <div className="flex items-start gap-2 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/70 ring-1 ring-black/5 px-4 py-3">
                    <span className="text-emerald-700 font-bold">✔</span>
                    <p className="text-sm text-gray-700">Stratégie concrète</p>
                  </div>
                  <div className="flex items-start gap-2 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/70 ring-1 ring-black/5 px-4 py-3">
                    <span className="text-emerald-700 font-bold">✔</span>
                    <p className="text-sm text-gray-700">Outils & plan d’action</p>
                  </div>
                  <div className="flex items-start gap-2 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/70 ring-1 ring-black/5 px-4 py-3">
                    <span className="text-emerald-700 font-bold">✔</span>
                    <p className="text-sm text-gray-700">Cadre contractuel spécifique</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/70 px-5 py-4">
                  <p className="text-sm text-indigo-900 font-semibold">📌 Ce n’est ni une étape automatique, ni une offre grand public.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Ce que c’est vraiment</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm sm:text-base text-gray-700">Transformer un objectif professionnel clair en plan d’action exécutable.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm sm:text-base text-gray-700">Construire une stratégie d’entrée, de positionnement et d’organisation du travail.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm sm:text-base text-gray-700">Livrer une roadmap personnalisée, une liste de tâches et des outils couvrant 70–80% du terrain.</p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-indigo-50/70 border border-indigo-200/70 p-5">
                  <p className="text-sm font-bold text-indigo-900 mb-2">Conditions (non négociables)</p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="mt-1 text-rose-700 font-bold">✕</span>
                      <p className="text-sm text-gray-800">Pas vendue seule</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 text-rose-700 font-bold">✕</span>
                      <p className="text-sm text-gray-800">Pas d'accès sans diagnostic</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 text-rose-700 font-bold">✕</span>
                      <p className="text-sm text-gray-800">Pas automatique / pas pour tout le monde</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 text-emerald-700 font-bold">✓</span>
                      <p className="text-sm text-gray-800">Sur validation + projet spécifique + contractuel</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 p-6 sm:p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Différence vs Service 1</h3>

                <div className="rounded-2xl bg-white/70 border border-slate-200/70 p-4 sm:p-5 shadow-sm ring-1 ring-black/5">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => setServiceExplainerTab("service1")}
                      className={`w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                        serviceExplainerTab === "service1"
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white/80 text-gray-900 border-slate-200 hover:border-emerald-300"
                      }`}
                    >
                      Service 1 — Décision & posture
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceExplainerTab("service2")}
                      className={`w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                        serviceExplainerTab === "service2"
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white/80 text-gray-900 border-slate-200 hover:border-indigo-300"
                      }`}
                    >
                      Service 2 — Exécution maîtrisée
                    </button>
                  </div>

                  <div className="mt-4">
                    <AnimatePresence mode="wait">
                      {serviceExplainerTab === "service1" ? (
                        <motion.div
                          key="service1"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.25 }}
                          className="rounded-2xl bg-gradient-to-b from-emerald-50 to-white border border-emerald-200/70 p-4"
                        >
                          <p className="text-sm font-bold text-gray-900 mb-2">But</p>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            Clarifier la situation, améliorer la logique de décision et stabiliser la posture en contexte réel.
                          </p>
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="flex items-start gap-2">
                              <span className="mt-1 text-emerald-700 font-bold">✓</span>
                              <p className="text-sm text-gray-700">Diagnostic professionnel (obligatoire)</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="mt-1 text-emerald-700 font-bold">✓</span>
                              <p className="text-sm text-gray-700">Avis GO / NO-GO / réorientation</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="mt-1 text-emerald-700 font-bold">✓</span>
                              <p className="text-sm text-gray-700">Feedback + clarification + posture</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="mt-1 text-rose-700 font-bold">✕</span>
                              <p className="text-sm text-gray-700">Pas d’exécution à votre place</p>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="service2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.25 }}
                          className="rounded-2xl bg-gradient-to-b from-indigo-50 to-white border border-indigo-200/70 p-4"
                        >
                          <p className="text-sm font-bold text-gray-900 mb-2">But</p>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            Transformer la décision en plan d’action exécutable : roadmap, tâches, outils — dans un cadre contractuel, sur demande.
                          </p>
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="flex items-start gap-2">
                              <span className="mt-1 text-indigo-700 font-bold">✓</span>
                              <p className="text-sm text-gray-700">Roadmap stratégique personnalisée</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="mt-1 text-indigo-700 font-bold">✓</span>
                              <p className="text-sm text-gray-700">Liste de tâches & outils validés</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="mt-1 text-indigo-700 font-bold">✓</span>
                              <p className="text-sm text-gray-700">70–80% du terrain cadré</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="mt-1 text-rose-700 font-bold">✕</span>
                              <p className="text-sm text-gray-700">Pas disponible sans diagnostic validé</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>

                <div className="mb-5 rounded-2xl bg-slate-50 border border-slate-200/70 px-4 py-3">
                  <p className="text-sm text-gray-800 font-semibold">
                    👉 Service 1 change votre manière de penser. Service 2 vous fait gagner du temps.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/70 p-5">
                    <p className="text-sm font-bold text-gray-900 mb-3">Service 1 (principal)</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-emerald-700 font-bold">✓</span>
                        <p className="text-sm text-gray-700">Correction du raisonnement</p>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-emerald-700 font-bold">✓</span>
                        <p className="text-sm text-gray-700">Analyse comportementale</p>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-emerald-700 font-bold">✓</span>
                        <p className="text-sm text-gray-700">Feedback, clarification, posture</p>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-emerald-700 font-bold">✓</span>
                        <p className="text-sm text-gray-700">Sans solutions prêtes</p>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-b from-indigo-50 to-white border border-indigo-200/70 p-5">
                    <p className="text-sm font-bold text-gray-900 mb-3">Service 2 (complémentaire)</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-indigo-700 font-bold">✓</span>
                        <p className="text-sm text-gray-700">Stratégie opérationnelle</p>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-indigo-700 font-bold">✓</span>
                        <p className="text-sm text-gray-700">Roadmap + tâches + outils</p>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-indigo-700 font-bold">✓</span>
                        <p className="text-sm text-gray-700">Solutions personnalisées</p>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-indigo-700 font-bold">✓</span>
                        <p className="text-sm text-gray-700">70–80% de stratégie prête (mission)</p>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200/70 p-5">
                  <p className="text-sm font-bold text-gray-900 mb-2">Exemple (projet validé)</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Objectif : <span className="font-semibold text-gray-900">Responsable Marketing — Parapharmacie</span>.
                    Nous pouvons construire : stratégie d'entrée, positionnement, roadmap de tâches, outils, préparation interview,
                    et accompagnement après intégration (sur demande).
                  </p>
                </div>

                <div className="mt-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 px-6 py-5 text-white shadow-[0_18px_50px_-28px_rgba(30,64,175,0.7)]">
                  <p className="text-sm sm:text-base font-semibold leading-relaxed">
                    Livrables (Service 2) : <span className="text-emerald-300">mission opérationnelle</span> cadrée et contractuelle.
                    <span className="block mt-2 text-white/90 text-sm font-medium">
                      Documents possibles : Document de mission opérationnelle, Roadmap stratégique personnalisée, Liste de tâches & outils validés,
                      Synthèse de stratégie opérationnelle.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm ring-1 ring-black/5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-xs sm:text-sm font-semibold text-slate-700">FAQ</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mt-5 mb-4 tracking-tight">
                Questions fréquentes
              </h2>
              <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Comprendre clairement le cadre de MA Consulting : ce que nous faisons, et ce que nous ne faisons pas.
              </p>
            </div>

            <div className="space-y-3">
              {faqItems.map((item, idx) => {
                const isOpen = openFaqIndex === idx;

                return (
                  <div
                    key={item.question}
                    className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_22px_60px_-38px_rgba(17,24,39,0.35)] ring-1 ring-black/5 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex items-start justify-between gap-4 px-5 sm:px-6 py-4 text-left"
                    >
                      <span className="text-sm sm:text-base font-semibold text-gray-900 leading-snug">
                        {item.question}
                      </span>
                      <span
                        className={`mt-0.5 flex-shrink-0 h-8 w-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center transition-transform ${
                          isOpen ? "rotate-90" : "rotate-0"
                        }`}
                      >
                        <ChevronRight className="w-4 h-4 text-gray-700" />
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-5 text-sm text-gray-700 leading-relaxed">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 px-6 py-5 text-white shadow-[0_18px_50px_-28px_rgba(30,64,175,0.7)]">
              <p className="text-sm sm:text-base font-semibold leading-relaxed">
                MA Consulting n'est pas une formation. C'est une démarche professionnelle qui fait évoluer la pensée et le comportement dans le réel,
                et apporte une clarté crédible et présentable aux entreprises.
              </p>
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
