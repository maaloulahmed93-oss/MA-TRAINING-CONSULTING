import React, { useMemo, useState, useEffect } from "react";
import { motion, useReducedMotion, useScroll, useSpring, type Easing } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Shield,
  Lightbulb,
  CheckCircle,
  Search,
  Compass,
  Layers,
  Award,
  ArrowLeft,
  ArrowRight,
  Star,
  Briefcase,
  FileText,
  ChevronRight,
} from "lucide-react";
import ProgramRegistrationModal from "./ProgramRegistrationModal";
import InteractiveQCMModal from "./InteractiveQCMModal";
import { Program, getTrainingPrograms } from "../data/trainingPrograms";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";

interface ETrainingPageProps {
  onBack: () => void;
}

interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface ETrainingPricingSettings {
  totalPrice: number;
  currency: string;
  defaultDisplayCurrency?: string;
  exchangeRates?: Record<string, number>;
  service1Price: number;
  service2Price: number;
  service3Price: number;
  service1Duration: string;
  service2Duration: string;
  service3Duration: string;
}

const ETrainingPage: React.FC<ETrainingPageProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [showUnifiedCatalogModal, setShowUnifiedCatalogModal] = useState(false);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  // State for dynamic data
  const [programs, setPrograms] = useState<Program[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pricingSettings, setPricingSettings] = useState<ETrainingPricingSettings | null>(null);
  const [displayCurrency, setDisplayCurrency] = useState<string>('EUR');
  const reduceMotion = useReducedMotion();

  const allowedCurrencies = ['TND', 'EUR', 'USD', 'MAD', 'DZD'];
  const fallbackRates: Record<string, number> = {
    TND: 1,
    EUR: 0.29,
    USD: 0.31,
    MAD: 3.1,
    DZD: 43,
  };

  const easeOut: Easing = [0.16, 1, 0.3, 1];
  const easeInOut: Easing = [0.65, 0, 0.35, 1];

  const heroContainerVariants = useMemo(
    () =>
      reduceMotion
        ? undefined
        : {
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
          },
    [reduceMotion]
  );

  const heroItemVariants = useMemo(
    () =>
      reduceMotion
        ? undefined
        : {
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
          },
    [reduceMotion]
  );

  const sectionContainerVariants = useMemo(
    () =>
      reduceMotion
        ? undefined
        : {
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.08, delayChildren: 0.04 },
            },
          },
    [reduceMotion]
  );

  const sectionItemVariants = useMemo(
    () =>
      reduceMotion
        ? undefined
        : {
            hidden: { opacity: 0, y: 12 },
            show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeOut } },
          },
    [reduceMotion]
  );

  const { scrollYProgress } = useScroll();
  const scrollProgressX = useSpring(scrollYProgress, {
    stiffness: reduceMotion ? 90 : 140,
    damping: reduceMotion ? 40 : 30,
    mass: 0.2,
  });

  const quickNavItems: { id: string; label: string }[] = [
    { id: "hero-section", label: "Intro" },
    { id: "domains-section", label: "Étapes du parcours" },
    { id: "services-section", label: "Offre & services" },
    { id: "outcomes-section", label: "Bénéfices" },
  ];

  const domainOptions = useMemo(() => {
    const activeCategories = (categories || []).filter((c) => c?.isActive !== false);
    if (activeCategories.length > 0) {
      return activeCategories.map((c) => ({ label: c.name, value: c._id }));
    }
    return [
      { label: "IT / Développement", value: "it" },
      { label: "Data / IA", value: "data" },
      { label: "Marketing / Communication", value: "marketing" },
      { label: "Finance / Gestion", value: "finance" },
      { label: "Management / Opérations", value: "management" },
      { label: "RH / Organisation", value: "rh" },
    ];
  }, [categories]);

  const fallbackTestimonials = [
    {
      quote:
        "« Le diagnostic m’a permis d’identifier clairement les incohérences entre mes décisions et mon niveau réel de responsabilité.\nL’accompagnement n’a pas cherché à me rassurer, mais à structurer ma posture professionnelle. »",
      author: "Amine K.",
      initials: "AK",
      role: "Qualité, Sécurité & Process",
      domain: "Industrie / Management opérationnel",
    },
    {
      quote:
        "« Ce parcours m’a aidée à clarifier ma manière de décider et à mieux défendre mes choix face à des contraintes concrètes.\nCe n’est pas une formation, mais un cadre de réflexion appliqué à des situations professionnelles réelles. »",
      author: "Rania T.",
      initials: "RT",
      role: "Marketing & Communication",
      domain: "Digital / Positionnement professionnel",
    },
    {
      quote:
        "« L’approche est directe et exigeante.\nOn ne reçoit pas de solutions toutes faites, mais une lecture claire de ce qui est faisable — ou non — à un instant donné. »",
      author: "Sami G.",
      initials: "SG",
      role: "Développement Web",
      domain: "Environnements techniques & projets",
    },
  ];

  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [testimonialsPage, setTestimonialsPage] = useState(0);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        setTestimonialsLoading(true);
        const response = await fetch(`${API_BASE_URL}/e-training-testimonials/published`);
        const json = await response.json().catch(() => null);

        if (response.ok && json?.success && Array.isArray(json.data) && json.data.length > 0) {
          const normalized = json.data.map((t: any) => ({
            quote: String(t.quote || ''),
            author: String(t.author || ''),
            initials: String(t.initials || ''),
            role: String(t.role || ''),
            domain: String(t.domain || ''),
          }));
          setTestimonials(normalized);
        }
      } catch (error) {
        console.error('Error loading e-training testimonials:', error);
      } finally {
        setTestimonialsLoading(false);
      }
    };

    loadTestimonials();
  }, []);

  useEffect(() => {
    try {
      if (typeof localStorage !== 'undefined' && displayCurrency) {
        localStorage.setItem('e_training_display_currency', displayCurrency);
      }
    } catch {
      // ignore
    }
  }, [displayCurrency]);

  const formatCurrency = (value: number, currency: string) => {
    const amount = Number.isFinite(Number(value)) ? Number(value) : 0;
    const decimals = currency === 'EUR' || currency === 'USD' ? 2 : 0;
    try {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(amount);
    } catch {
      return `${amount.toLocaleString('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })} ${currency}`;
    }
  };

  const convertFromBase = (amount: number, fromCurrency: string, toCurrency: string) => {
    const n = Number.isFinite(Number(amount)) ? Number(amount) : 0;
    if (fromCurrency === toCurrency) return n;
    const rates = pricingSettings?.exchangeRates || fallbackRates;
    const rate = Number(rates[toCurrency]);
    if (fromCurrency !== 'TND') return n;
    if (!Number.isFinite(rate) || rate <= 0) return n;
    return n * rate;
  };

  const formatPrice = (baseAmount: number) => {
    const baseCurrency = pricingSettings?.currency ?? 'TND';
    const candidate = displayCurrency || pricingSettings?.defaultDisplayCurrency || baseCurrency;
    const target = allowedCurrencies.includes(candidate) ? candidate : baseCurrency;
    const converted = convertFromBase(baseAmount, baseCurrency, target);
    return formatCurrency(converted, target);
  };

  useEffect(() => {
    setTestimonialsPage(0);
  }, [testimonials.length]);

  const openEspaceParticipant = () => {
    navigate("/espace-participant");
  };

  const openEspaceVerification = () => {
    navigate("/verification-participant");
  };

  const openService2MissionRequest = (missionType: "reelle" | "simulee") => {
    const label = missionType === "reelle" ? "mission réelle" : "mission simulée";
    const text = `Bonjour, je souhaite démarrer une ${label} (Service 2). Pouvez-vous m’indiquer la suite et les prochaines étapes ?`;
    const url = `https://wa.me/21644172284?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Load programs, packs and categories from API on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load programs
        const apiPrograms = await getTrainingPrograms();
        setPrograms(apiPrograms as Program[]);

        const categoriesResponse = await fetch(
          `${API_BASE_URL}${API_ENDPOINTS.CATEGORIES}?activeOnly=true`
        );
        const categoriesJson = await categoriesResponse.json().catch(() => null);
        if (categoriesResponse.ok && categoriesJson?.success) {
          setCategories(Array.isArray(categoriesJson.data) ? categoriesJson.data : []);
        }

        try {
          const pricingResponse = await fetch(`${API_BASE_URL}/e-training-pricing`);
          const pricingJson = await pricingResponse.json().catch(() => null);
          if (pricingResponse.ok && pricingJson?.success && pricingJson.data) {
            const defaultCurrency = String(pricingJson.data.defaultDisplayCurrency ?? 'TND');
            const storedCurrency =
              typeof localStorage !== 'undefined' ? localStorage.getItem('e_training_display_currency') : null;
            setPricingSettings({
              totalPrice: Number(pricingJson.data.totalPrice ?? 1290),
              currency: String(pricingJson.data.currency ?? 'TND'),
              defaultDisplayCurrency: defaultCurrency,
              exchangeRates:
                pricingJson.data.exchangeRates && typeof pricingJson.data.exchangeRates === 'object'
                  ? (pricingJson.data.exchangeRates as Record<string, number>)
                  : undefined,
              service1Price: Number(pricingJson.data.service1Price ?? 290),
              service2Price: Number(pricingJson.data.service2Price ?? 590),
              service3Price: Number(pricingJson.data.service3Price ?? 490),
              service1Duration: String(pricingJson.data.service1Duration ?? '7–14 jours'),
              service2Duration: String(pricingJson.data.service2Duration ?? '2–4 semaines'),
              service3Duration: String(pricingJson.data.service3Duration ?? '2–6 semaines'),
            });

            const next = storedCurrency || defaultCurrency;
            setDisplayCurrency(allowedCurrencies.includes(next) ? next : 'TND');
          }
        } catch (error) {
          console.error('Error loading e-training pricing:', error);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Keep fallback data if API fails
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
    <div className="min-h-screen bg-white overflow-x-hidden">
      <motion.div
        style={{ scaleX: scrollProgressX }}
        className="fixed left-0 top-0 z-50 h-1 w-full origin-left bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-500"
      />
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

      <div className="sticky top-0 z-40 bg-white/75 backdrop-blur-xl border-b border-slate-200/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {quickNavItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className="shrink-0 rounded-full border border-slate-200/70 bg-white/70 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-white hover:text-slate-900 hover:border-slate-300 transition-colors"
              >
                {item.label}
              </button>
            ))}
            <div className="shrink-0 w-px h-7 bg-slate-200/70" />
            <button
              type="button"
              onClick={() => navigate("/diagnostic")}
              className="shrink-0 rounded-full bg-slate-900 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Accéder au diagnostic
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <motion.section
        id="hero-section"
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={reduceMotion ? undefined : { duration: 0.7, ease: easeOut }}
        className="relative scroll-mt-24 sm:scroll-mt-28 py-14 sm:py-20 lg:py-24 bg-gradient-to-b from-slate-50 via-white to-white overflow-hidden"
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-[0.28] [background-image:linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_78%)]" />
          <motion.div
            aria-hidden
            className="absolute -top-28 left-1/2 h-[440px] w-[440px] sm:h-[520px] sm:w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.14),transparent_60%)] blur-2xl"
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [0, 16, 0],
                    scale: [1, 1.03, 1],
                  }
            }
            transition={reduceMotion ? undefined : { duration: 10, repeat: Infinity, ease: easeInOut }}
          />
          <motion.div
            aria-hidden
            className="absolute -bottom-32 left-1/2 h-[460px] w-[460px] sm:h-[560px] sm:w-[560px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.10),transparent_62%)] blur-2xl"
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [0, -18, 0],
                    scale: [1, 1.02, 1],
                  }
            }
            transition={reduceMotion ? undefined : { duration: 12, repeat: Infinity, ease: easeInOut }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              transition={reduceMotion ? undefined : { duration: 0.75, ease: easeOut }}
              className="relative max-w-5xl mx-auto rounded-[2.5rem] sm:rounded-[3rem] border border-white/60 bg-white/75 backdrop-blur-xl shadow-[0_34px_90px_-60px_rgba(15,23,42,0.45)] ring-1 ring-black/5 overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-slate-900/[0.03] via-transparent to-indigo-600/[0.06]" />

              <div className="relative px-5 py-10 sm:px-10 sm:py-14 lg:px-14">
                <div className="flex items-center justify-center mb-7">
                  <div className="text-[11px] sm:text-xs font-semibold text-slate-600 tracking-[0.18em]">
                    MA TRAINING • CONSULTING
                  </div>
                </div>

                <motion.div
                  initial={reduceMotion ? false : "hidden"}
                  animate={reduceMotion ? "show" : "show"}
                  variants={heroContainerVariants}
                  className="text-center"
                >
                  <motion.div
                    variants={heroItemVariants}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white/75 backdrop-blur-sm border border-white/70 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-black/5"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Accompagnement professionnel appliqué</span>
                  </motion.div>

                  <motion.h1
                    variants={heroItemVariants}
                    className="font-display text-[1.8rem] sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-slate-900 mt-4 mb-4 sm:mb-6 leading-[1.08] tracking-tight break-words max-w-4xl mx-auto text-balance"
                  >
                    Clarifier votre situation professionnelle, prendre des décisions solides et les exécuter concrètement
                  </motion.h1>

                  <motion.p
                    variants={heroItemVariants}
                    className="text-sm sm:text-base md:text-lg text-slate-600 mb-7 sm:mb-8 leading-relaxed max-w-3xl mx-auto"
                  >
                    Un accompagnement structuré, basé sur des situations réelles, pour décider avec méthode et agir concrètement.
                  </motion.p>

                  <motion.div
                    variants={heroItemVariants}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-4"
                  >
                    <motion.button
                      type="button"
                      onClick={() => navigate("/diagnostic")}
                      whileHover={reduceMotion ? undefined : { y: -1 }}
                      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                      transition={reduceMotion ? undefined : { type: "spring", stiffness: 420, damping: 28 }}
                      className="group w-full sm:w-auto px-7 sm:px-9 py-3.5 sm:py-4 bg-slate-900 text-white text-sm sm:text-base font-semibold rounded-xl shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 inline-flex items-center justify-center"
                    >
                      <span>Lancer le diagnostic gratuit</span>
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-0.5 transition-transform" />
                    </motion.button>
                    <motion.a
                      href="https://wa.me/21644172284"
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={reduceMotion ? undefined : { y: -1 }}
                      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                      transition={reduceMotion ? undefined : { type: "spring", stiffness: 420, damping: 28 }}
                      className="group w-full sm:w-auto px-7 sm:px-9 py-3.5 sm:py-4 bg-transparent text-slate-700 text-sm sm:text-base font-semibold rounded-xl border border-slate-300/80 hover:bg-slate-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 inline-flex items-center justify-center"
                    >
                      <span>Parler à un consultant</span>
                      <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-0.5 transition-transform" />
                    </motion.a>
                  </motion.div>

                  <motion.p variants={heroItemVariants} className="text-xs sm:text-sm text-slate-500">
                    Diagnostic gratuit • Résultat immédiat • Confidentialité garantie
                  </motion.p>

                  <div className="hidden mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-white/80 backdrop-blur-sm border border-white/70 px-4 py-2 text-sm text-gray-800 shadow-sm ring-1 ring-black/5">
                    <span className="font-semibold">Rejoignez plus de 5000 professionnels accompagnés !</span>
                  </div>

                  {/* Social Proof - Enhanced */}
                  <div className="hidden mt-8 space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                      <div className="group flex items-center bg-white/70 backdrop-blur-sm px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/60 ring-1 ring-black/5">
                        <div className="flex -space-x-3 mr-3">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 border-3 border-white flex items-center justify-center text-white text-sm font-bold shadow-lg transform group-hover:scale-110 transition-transform"
                            >
                              {i === 1 ? "👨" : i === 2 ? "👩" : i === 3 ? "👤" : "👨‍💼"}
                            </div>
                          ))}
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-900 leading-tight">+5000</p>
                          <p className="text-xs text-gray-600 font-medium">professionnels accompagnés</p>
                        </div>
                      </div>

                      <div className="group flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-yellow-200/70 ring-1 ring-black/5">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="w-5 h-5 fill-yellow-400 text-yellow-400 transform group-hover:scale-110 transition-transform"
                              style={{ transitionDelay: `${star * 50}ms` }}
                            />
                          ))}
                        </div>
                        <div className="border-l border-yellow-300 pl-3">
                          <p className="text-lg font-bold text-gray-900 leading-tight">4.9/5</p>
                          <p className="text-xs text-gray-600 font-medium">2,500+ avis</p>
                        </div>
                      </div>
                    </div>

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
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <section className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white to-slate-50 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_38%,transparent_78%)]" />
          <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.09),transparent_60%)] blur-2xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-[960px] mx-auto">
            <motion.div
              initial={reduceMotion ? false : "hidden"}
              whileInView={reduceMotion ? undefined : "show"}
              viewport={{ once: true, amount: 0.2 }}
              variants={sectionContainerVariants}
              className="text-center mb-10 sm:mb-12"
              dir="ltr"
            >
              <motion.h2
                variants={sectionItemVariants}
                className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight"
              >
                Pour qui est conçu cet accompagnement ?
              </motion.h2>
              <motion.p
                variants={sectionItemVariants}
                className="mt-4 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed"
              >
                Cet accompagnement s’adresse à celles et ceux qui font face à une situation professionnelle floue ou complexe, et qui veulent clarifier, décider avec méthode, puis passer à l’action dans un cadre solide.
              </motion.p>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : "hidden"}
              whileInView={reduceMotion ? undefined : "show"}
              viewport={{ once: true, amount: 0.25 }}
              variants={sectionContainerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
              dir="ltr"
            >
              <motion.div
                variants={sectionItemVariants}
                whileHover={reduceMotion ? undefined : { y: -3, scale: 1.01 }}
                transition={reduceMotion ? undefined : { duration: 0.25, ease: easeOut }}
                className="group relative rounded-3xl border border-slate-200/70 bg-white/80 backdrop-blur-xl p-6 sm:p-7 shadow-[0_20px_60px_-46px_rgba(15,23,42,0.18)] ring-1 ring-black/5 overflow-hidden"
              >
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.18),transparent_45%),radial-gradient(circle_at_85%_80%,rgba(56,189,248,0.14),transparent_48%)]" />
                <div className="relative">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-900 text-white flex items-center justify-center shadow-[0_16px_34px_-18px_rgba(15,23,42,0.65)]">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-slate-900">Démarrage &amp; structuration</h3>
                      <div className="mt-2 h-px w-full bg-gradient-to-r from-slate-200 via-slate-100 to-transparent" />
                    </div>
                  </div>
                  <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                    Vous avez des compétences, mais manquez de repères clairs : niveau réel, direction, et prochaines étapes concrètes.
                  </p>
                  <p className="mt-4 text-sm text-slate-500 italic">
                    Résultat attendu : un cap clair, une stratégie réaliste, et un plan d’action.
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={sectionItemVariants}
                whileHover={reduceMotion ? undefined : { y: -3, scale: 1.01 }}
                transition={reduceMotion ? undefined : { duration: 0.25, ease: easeOut }}
                className="group relative rounded-3xl border border-slate-200/70 bg-white/80 backdrop-blur-xl p-6 sm:p-7 shadow-[0_20px_60px_-46px_rgba(15,23,42,0.18)] ring-1 ring-black/5 overflow-hidden"
              >
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.14),transparent_46%),radial-gradient(circle_at_85%_80%,rgba(99,102,241,0.12),transparent_48%)]" />
                <div className="relative">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-600 text-white flex items-center justify-center shadow-[0_16px_34px_-18px_rgba(37,99,235,0.55)]">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-slate-900">Choix &amp; repositionnement</h3>
                      <div className="mt-2 h-px w-full bg-gradient-to-r from-slate-200 via-slate-100 to-transparent" />
                    </div>
                  </div>
                  <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                    Vous êtes à un carrefour (évolution, reconversion, opportunité) et vous voulez trancher sans improviser.
                  </p>
                  <p className="mt-4 text-sm text-slate-500 italic">
                    Résultat attendu : une décision cadrée, alignée sur la réalité du rôle et du marché.
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={sectionItemVariants}
                whileHover={reduceMotion ? undefined : { y: -3, scale: 1.01 }}
                transition={reduceMotion ? undefined : { duration: 0.25, ease: easeOut }}
                className="group relative rounded-3xl border border-slate-200/70 bg-white/80 backdrop-blur-xl p-6 sm:p-7 shadow-[0_20px_60px_-46px_rgba(15,23,42,0.18)] ring-1 ring-black/5 overflow-hidden"
              >
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.12),transparent_46%),radial-gradient(circle_at_85%_80%,rgba(16,185,129,0.10),transparent_50%)]" />
                <div className="relative">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-[0_16px_34px_-18px_rgba(16,185,129,0.55)]">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-slate-900">Exécution &amp; crédibilité</h3>
                      <div className="mt-2 h-px w-full bg-gradient-to-r from-slate-200 via-slate-100 to-transparent" />
                    </div>
                  </div>
                  <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                    Vous voulez dépasser la théorie : démontrer concrètement votre capacité à décider et exécuter sur des situations réelles, encadrées.
                  </p>
                  <p className="mt-4 text-sm text-slate-500 italic">
                    Résultat attendu : des livrables concrets et une crédibilité renforcée.
                  </p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : "hidden"}
              whileInView={reduceMotion ? undefined : "show"}
              viewport={{ once: true, amount: 0.25 }}
              variants={sectionContainerVariants}
              className="mt-8 sm:mt-10 rounded-3xl border border-slate-200/70 bg-white/80 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_60px_-46px_rgba(15,23,42,0.18)] ring-1 ring-black/5"
              dir="ltr"
            >
              <motion.p variants={sectionItemVariants} className="text-sm sm:text-base font-semibold text-slate-900">
                En pratique, cet accompagnement s’adapte à votre contexte professionnel, dès lors qu’une situation réelle peut être analysée et travaillée de manière rigoureuse.
              </motion.p>

              <motion.div variants={sectionItemVariants} className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7">
                  <p className="text-xs sm:text-sm font-semibold text-slate-700">Principalement destiné aux :</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-slate-50/80 text-slate-900 border border-slate-200/70 px-3 py-1 text-xs sm:text-sm font-semibold">
                      Salariés
                    </span>
                    <span className="inline-flex items-center rounded-full bg-indigo-50/80 text-indigo-900 border border-indigo-200/70 px-3 py-1 text-xs sm:text-sm font-semibold">
                      Indépendants / Freelance
                    </span>
                    <span className="inline-flex items-center rounded-full bg-amber-50/80 text-amber-900 border border-amber-200/70 px-3 py-1 text-xs sm:text-sm font-semibold">
                      Entrepreneurs
                    </span>
                  </div>

                  <p className="mt-4 text-xs sm:text-sm font-semibold text-slate-700">Convient également aux :</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-emerald-50/80 text-emerald-900 border border-emerald-200/70 px-3 py-1 text-xs sm:text-sm font-semibold">
                      Étudiants
                    </span>
                    <span className="inline-flex items-center rounded-full bg-sky-50/80 text-sky-900 border border-sky-200/70 px-3 py-1 text-xs sm:text-sm font-semibold">
                      En recherche
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 rounded-2xl border border-slate-200/70 bg-white/70 p-4 sm:p-5">
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    Il couvre des contextes variés (poste actuel, reconversion, lancement de projet, évolution)
                    et des domaines multiples (IT, data, marketing, finance, management, RH, etc.).
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_38%,transparent_78%)]" />
          <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.09),transparent_60%)] blur-2xl" />
          <div className="absolute -bottom-28 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.06),transparent_62%)] blur-2xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-[960px] mx-auto" dir="ltr">
            <motion.div
              initial={reduceMotion ? false : "hidden"}
              whileInView={reduceMotion ? undefined : "show"}
              viewport={{ once: true, amount: 0.25 }}
              variants={sectionContainerVariants}
              className="text-center mb-10 sm:mb-12"
            >
              <motion.h2
                variants={sectionItemVariants}
                className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight"
              >
                Comment se déroule concrètement l’accompagnement ?
              </motion.h2>
              <motion.p variants={sectionItemVariants} className="mt-3 text-sm sm:text-base text-slate-500 font-medium">
                Un parcours clair, structuré et progressif
              </motion.p>
              <div className="mt-5 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed space-y-3">
                <motion.p variants={sectionItemVariants}>
                  Notre approche repose sur un parcours structuré, conçu pour clarifier les décisions professionnelles avant toute mise en œuvre.
                </motion.p>
                <motion.p variants={sectionItemVariants}>
                  Chaque étape répond à un objectif précis, sans formation classique, sans enseignement général et sans automatisme.
                </motion.p>
              </div>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : "hidden"}
              whileInView={reduceMotion ? undefined : "show"}
              viewport={{ once: true, amount: 0.22 }}
              variants={sectionContainerVariants}
              className="relative rounded-[2rem] border border-white/60 bg-white/75 backdrop-blur-xl p-6 sm:p-8 shadow-[0_26px_70px_-50px_rgba(15,23,42,0.28)] ring-1 ring-black/5 overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.10] bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.55),transparent_42%),radial-gradient(circle_at_85%_80%,rgba(56,189,248,0.35),transparent_44%)]" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
                <div>
                  <div className="relative pl-6">
                    <div className="absolute left-0 top-1 bottom-1 w-px bg-gradient-to-b from-slate-200 via-slate-200 to-slate-100" />

                    <div className="space-y-5">
                      <motion.div variants={sectionItemVariants} className="relative">
                        <div className="absolute -left-[14px] top-2 h-7 w-7 rounded-full bg-slate-900 ring-4 ring-white shadow-sm" />
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-4 ring-1 ring-black/5 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md">
                          <div className="text-sm font-semibold text-slate-900">Diagnostic général</div>
                        </div>
                      </motion.div>

                      <div className="flex items-center justify-start pl-1">
                        <ChevronRight className="w-5 h-5 text-slate-300 transform rotate-90" />
                      </div>

                      <motion.div variants={sectionItemVariants} className="relative">
                        <div className="absolute -left-[14px] top-2 h-7 w-7 rounded-full bg-indigo-600 ring-4 ring-white shadow-sm" />
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-4 ring-1 ring-black/5 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md">
                          <div className="text-sm font-semibold text-slate-900">Service 1 – Diagnostic stratégique, positionnement &amp; orientation professionnelle</div>
                        </div>
                      </motion.div>

                      <div className="flex items-center justify-start pl-1">
                        <ChevronRight className="w-5 h-5 text-slate-300 transform rotate-90" />
                      </div>

                      <motion.div variants={sectionItemVariants} className="relative">
                        <div className="absolute -left-[14px] top-2 h-7 w-7 rounded-full bg-amber-600 ring-4 ring-white shadow-sm" />
                        <div className="relative rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-4 ring-1 ring-black/5 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md">
                          <div className="text-sm font-semibold text-slate-900">Bonus associé : Espace Ressources &amp; Recommandations professionnelles</div>
                          <div className="hidden lg:flex absolute -right-10 top-1/2 -translate-y-1/2 items-center">
                            <span className="h-px w-8 bg-amber-300/70" />
                            <ArrowRight className="w-4 h-4 text-amber-400" />
                          </div>
                        </div>
                      </motion.div>

                      <div className="flex items-center justify-start pl-1">
                        <ChevronRight className="w-5 h-5 text-slate-300 transform rotate-90" />
                      </div>

                      <motion.div variants={sectionItemVariants} className="relative">
                        <div className="absolute -left-[14px] top-2 h-7 w-7 rounded-full bg-emerald-600 ring-4 ring-white shadow-sm" />
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-4 ring-1 ring-black/5 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md">
                          <div className="text-sm font-semibold text-slate-900">Service 2 – Missions professionnelles encadrées</div>
                        </div>
                      </motion.div>

                      <div className="flex items-center justify-start pl-1">
                        <ChevronRight className="w-5 h-5 text-slate-300 transform rotate-90" />
                      </div>

                      <motion.div variants={sectionItemVariants} className="relative">
                        <div className="absolute -left-[14px] top-2 h-7 w-7 rounded-full bg-amber-600 ring-4 ring-white shadow-sm" />
                        <div className="relative rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-4 ring-1 ring-black/5 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md">
                          <div className="text-sm font-semibold text-slate-900">Bonus associé : Analyse &amp; Recommandations avancées (Document d’Analyse Professionnelle)</div>
                          <div className="hidden lg:flex absolute -right-10 top-1/2 -translate-y-1/2 items-center">
                            <span className="h-px w-8 bg-amber-300/70" />
                            <ArrowRight className="w-4 h-4 text-amber-400" />
                          </div>
                        </div>
                      </motion.div>

                      <div className="flex items-center justify-start pl-1">
                        <ChevronRight className="w-5 h-5 text-slate-300 transform rotate-90" />
                      </div>

                      <motion.div variants={sectionItemVariants} className="relative">
                        <div className="absolute -left-[14px] top-2 h-7 w-7 rounded-full bg-purple-600 ring-4 ring-white shadow-sm" />
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-4 ring-1 ring-black/5 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md">
                          <div className="text-sm font-semibold text-slate-900">Service 3 – Accompagnement opérationnel</div>
                          <div className="mt-1 text-sm text-slate-600">Mise en œuvre concrète sur votre situation réelle</div>
                        </div>
                      </motion.div>

                      <div className="flex items-center justify-start pl-1">
                        <ChevronRight className="w-5 h-5 text-slate-300 transform rotate-90" />
                      </div>

                      <motion.div variants={sectionItemVariants} className="relative">
                        <div className="absolute -left-[14px] top-2 h-7 w-7 rounded-full bg-amber-600 ring-4 ring-white shadow-sm" />
                        <div className="relative rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-4 ring-1 ring-black/5 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md">
                          <div className="text-sm font-semibold text-slate-900">Bonus associé : Groupe Telegram d’échanges et développement</div>
                          <div className="hidden lg:flex absolute -right-10 top-1/2 -translate-y-1/2 items-center">
                            <span className="h-px w-8 bg-amber-300/70" />
                            <ArrowRight className="w-4 h-4 text-amber-400" />
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                <motion.div variants={sectionItemVariants} className="space-y-4">
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white/80 via-white/60 to-indigo-50/60 p-5 sm:p-6 ring-1 ring-black/5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.18),transparent_65%)] blur-2xl" />
                      <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.10),transparent_65%)] blur-2xl" />
                    </div>
                    <div className="relative text-sm font-semibold text-slate-900">📌 Note</div>
                    <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                      Aucune étape n’est automatique. À chaque étape, vous êtes accompagné par des experts métiers qualifiés (dans tous les domaines). Le nombre de sessions est ajusté selon le besoin.
                    </p>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/80 via-white/70 to-white/60 p-5 sm:p-6 ring-1 ring-black/5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.22),transparent_65%)] blur-2xl" />
                      <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.16),transparent_65%)] blur-2xl" />
                    </div>
                    <div className="relative text-xs font-semibold text-amber-900">À propos des bonus</div>
                    <p className="mt-3 text-sm sm:text-base text-slate-700 leading-relaxed">
                      Les bonus font partie intégrante du parcours et sont inclus pour renforcer chaque étape.
                    </p>
                  </div>
                </motion.div>
              </div>

              <p className="mt-6 text-sm sm:text-base text-slate-600">
                👉 Chaque étape du parcours est détaillée ci-dessous, avec ses objectifs, modalités et livrables concrets.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="outcomes-section" className="relative scroll-mt-24 sm:scroll-mt-28 py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white to-slate-50 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_38%,transparent_78%)]" />
          <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.08),transparent_60%)] blur-2xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-[1100px] mx-auto" dir="ltr">
            <motion.div
              initial={reduceMotion ? false : "hidden"}
              whileInView={reduceMotion ? undefined : "show"}
              viewport={{ once: true, amount: 0.25 }}
              variants={sectionContainerVariants}
              className="text-center"
            >
              <motion.div
                variants={sectionItemVariants}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-50/80 border border-emerald-200/70 px-4 py-2 text-xs font-semibold text-emerald-900 shadow-sm ring-1 ring-black/5"
              >
                <Award className="w-4 h-4" />
                <span>Offert (gratuit)</span>
              </motion.div>
              <motion.h2
                variants={sectionItemVariants}
                className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight"
              >
                Diagnostic général (en ligne)
              </motion.h2>
              <motion.p
                variants={sectionItemVariants}
                className="mt-4 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed"
              >
                Un questionnaire structuré, composé de questions générales à forte valeur d’analyse, permettant d’évaluer votre profil professionnel global, sans référence à un domaine ou une spécialité.
              </motion.p>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : "hidden"}
              whileInView={reduceMotion ? undefined : "show"}
              viewport={{ once: true, amount: 0.25 }}
              variants={sectionContainerVariants}
              className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <motion.div
                id="diagnostic-initial-section"
                variants={sectionItemVariants}
                whileHover={reduceMotion ? undefined : { y: -2 }}
                transition={reduceMotion ? undefined : { duration: 0.25, ease: easeOut }}
                className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/75 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_60px_-46px_rgba(15,23,42,0.25)] ring-1 ring-black/5"
                dir="ltr"
              >
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute -top-20 -right-24 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.12),transparent_62%)] blur-2xl" />
                </div>
                <div className="relative">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-900 text-white flex items-center justify-center shadow-[0_16px_34px_-18px_rgba(15,23,42,0.75)]">
                      <Search className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-slate-900">Comment ça fonctionne</h3>
                      <p className="mt-1 text-sm text-slate-600">Un diagnostic en ligne, structuré et orienté décision.</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-600 leading-relaxed">
                    <div className="rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3">
                      <div className="text-xs font-semibold text-slate-500">Étape 1</div>
                      <div className="mt-1">Vous répondez à un questionnaire général, organisé et orienté décision.</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3">
                      <div className="text-xs font-semibold text-slate-500">Étape 2</div>
                      <div className="mt-1">Nous analysons la cohérence de votre profil, votre posture professionnelle et les principaux points bloquants.</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3">
                      <div className="text-xs font-semibold text-slate-500">Étape 3</div>
                      <div className="mt-1">Nous orientons vers le parcours le plus pertinent avant tout engagement.</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={sectionItemVariants}
                whileHover={reduceMotion ? undefined : { y: -2 }}
                transition={reduceMotion ? undefined : { duration: 0.25, ease: easeOut }}
                className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/75 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_60px_-46px_rgba(15,23,42,0.25)] ring-1 ring-black/5"
                dir="ltr"
              >
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.10),transparent_64%)] blur-2xl" />
                </div>
                <div className="relative">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-600 text-white flex items-center justify-center shadow-[0_16px_34px_-18px_rgba(37,99,235,0.55)]">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-slate-900">Ce que vous recevez</h3>
                      <p className="mt-1 text-sm text-slate-600">Un rapport de diagnostic initial (lecture de cadrage).</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-200/70 bg-white/70 p-4">
                    <div className="text-sm font-semibold text-slate-900">Contenu</div>
                    <div className="mt-2 space-y-2 text-sm text-slate-600 leading-relaxed">
                      <div>1) Un rapport de diagnostic initial (lecture de cadrage).</div>
                      <div>2) Votre niveau global sur une grille à 5 niveaux.</div>
                      <div>3) Vos forces et axes d’amélioration principaux.</div>
                      <div>4) Une estimation initiale et indicative du prix du Service 1, selon le parcours recommandé.</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-xs font-semibold text-slate-500">Échelle (5 niveaux)</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-slate-50/80 border border-slate-200/70 px-3 py-1.5 text-xs font-semibold text-slate-900">Débutant</span>
                      <span className="inline-flex items-center rounded-full bg-slate-50/80 border border-slate-200/70 px-3 py-1.5 text-xs font-semibold text-slate-900">Intermédiaire</span>
                      <span className="inline-flex items-center rounded-full bg-slate-50/80 border border-slate-200/70 px-3 py-1.5 text-xs font-semibold text-slate-900">Avancé</span>
                      <span className="inline-flex items-center rounded-full bg-slate-50/80 border border-slate-200/70 px-3 py-1.5 text-xs font-semibold text-slate-900">Professionnel</span>
                      <span className="inline-flex items-center rounded-full bg-slate-50/80 border border-slate-200/70 px-3 py-1.5 text-xs font-semibold text-slate-900">Expert</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={sectionItemVariants}
                whileHover={reduceMotion ? undefined : { y: -2 }}
                transition={reduceMotion ? undefined : { duration: 0.25, ease: easeOut }}
                className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/75 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_60px_-46px_rgba(15,23,42,0.25)] ring-1 ring-black/5"
                dir="ltr"
              >
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute -top-16 -right-20 h-52 w-52 rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12),transparent_62%)] blur-2xl" />
                </div>
                <div className="relative">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-[0_16px_34px_-18px_rgba(16,185,129,0.55)]">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-slate-900">Important</h3>
                      <p className="mt-1 text-sm text-slate-600">Ce diagnostic gratuit est une lecture initiale et générale.</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-amber-200/70 bg-amber-50/60 p-4">
                    <div className="text-sm font-semibold text-amber-900">Note</div>
                    <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                      Ce diagnostic gratuit est une lecture initiale et générale.
                      Le diagnostic approfondi et la décision finale sont réalisés dans le cadre du Service 1.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              id="service1-details-section"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={reduceMotion ? undefined : { duration: 0.55, ease: easeOut }}
              className="mt-10 sm:mt-12"
              dir="ltr"
            >
              <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/70 backdrop-blur-xl p-6 sm:p-8 shadow-[0_18px_54px_-44px_rgba(15,23,42,0.28)] ring-1 ring-black/5">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.12),transparent_62%)] blur-2xl" />
                </div>

                <div className="relative">
                  <div className="flex items-center justify-center">
                    <div className="relative w-full max-w-md">
                      <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-300/70 to-transparent" />
                      <motion.div
                        animate={
                          reduceMotion
                            ? undefined
                            : {
                                boxShadow: [
                                  "0 0 0 0 rgba(79,70,229,0.0)",
                                  "0 0 0 10px rgba(79,70,229,0.10)",
                                  "0 0 0 0 rgba(79,70,229,0.0)",
                                ],
                              }
                        }
                        transition={reduceMotion ? undefined : { duration: 1.8, repeat: Infinity, ease: easeInOut }}
                        className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50/80 border border-indigo-200/70 px-4 py-2 text-xs font-semibold text-indigo-900 shadow-sm ring-1 ring-black/5">
                      <span>Étape suivante</span>
                      <motion.span
                        animate={reduceMotion ? undefined : { y: [0, 4, 0] }}
                        transition={reduceMotion ? undefined : { duration: 1.2, repeat: Infinity, ease: easeInOut }}
                        className="inline-flex"
                      >
                        <ChevronRight className="w-4 h-4 rotate-90" />
                      </motion.span>
                    </div>

                    <h3 className="mt-4 font-display text-xl sm:text-2xl font-bold text-slate-900">
                      Service 1 — Diagnostic stratégique, positionnement &amp; orientation
                    </h3>
                    <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
                      Un accompagnement professionnel destiné à clarifier votre situation réelle, évaluer votre niveau effectif et aboutir à une décision
                      professionnelle cohérente et défendable.
                    </p>

                    <div className="mt-6 max-w-4xl mx-auto">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-left">
                        <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-5">
                          <div className="text-sm font-semibold text-slate-900">À quoi ça sert ?</div>
                          <div className="mt-3 space-y-2 text-sm text-slate-700">
                            <div className="flex gap-3">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                              <span>Comprendre où vous en êtes réellement sur le plan professionnel</span>
                            </div>
                            <div className="flex gap-3">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                              <span>Identifier votre niveau réel, au-delà du titre ou du domaine</span>
                            </div>
                            <div className="flex gap-3">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                              <span>Vérifier si le positionnement ou le rôle visé est pertinent pour vous</span>
                            </div>
                            <div className="flex gap-3">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                              <span>Prendre une décision claire, réaliste et applicable</span>
                            </div>
                          </div>

                          <div className="mt-5 rounded-2xl border border-slate-200/70 bg-white p-4">
                            <div className="text-sm font-semibold text-slate-900">Comment ça fonctionne ?</div>
                            <div className="mt-3 space-y-3">
                              <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 px-3 py-3">
                                <div className="text-xs font-semibold text-slate-900">Phase 0 — Diagnostic approfondi (en ligne)</div>
                                <div className="mt-1 text-xs text-slate-600">
                                  Approfondissement du diagnostic général à travers plusieurs systèmes d’analyse. Des questions générales, non liées à un domaine,
                                  permettant d’évaluer votre posture professionnelle, votre logique de décision et votre niveau réel, puis de les confronter au contexte
                                  ou au domaine envisagé.
                                </div>
                              </div>
                              <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 px-3 py-3">
                                <div className="text-xs font-semibold text-slate-900">Phases 1 à 4 — Analyse, positionnement &amp; orientation</div>
                                <div className="mt-1 text-xs text-slate-600">
                                  Analyse de la réalité professionnelle, construction d’un positionnement cohérent, ajustement des schémas de pensée et formalisation
                                  d’une orientation claire et argumentée.
                                </div>
                              </div>
                              <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 px-3 py-3">
                                <div className="text-xs font-semibold text-slate-900">Phase 5 — Session individuelle avec un expert</div>
                                <div className="mt-1 text-xs text-slate-600">
                                  Session interactive en direct (1h) pour tester les décisions, travailler la posture professionnelle et valider le positionnement
                                  retenu à travers des situations concrètes.
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-5">
                            <div className="text-sm font-semibold text-slate-900">Ce que vous obtenez</div>
                            <div className="mt-3 space-y-2 text-sm text-slate-700">
                              <div className="flex gap-3">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span>Un rapport final de synthèse</span>
                              </div>
                              <div className="flex gap-3">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span>Un avis professionnel argumenté</span>
                              </div>
                              <div className="flex gap-3">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span>Un document de positionnement professionnel</span>
                              </div>
                              <div className="flex gap-3">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span>Une décision claire, alignée avec votre niveau et votre contexte</span>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-amber-200/70 bg-amber-50/60 p-5">
                            <div className="text-sm font-semibold text-amber-900">Points forts</div>
                            <div className="mt-3 space-y-2 text-sm text-slate-700">
                              <div>✔ Analyse approfondie, pas de conseils génériques</div>
                              <div>✔ Évaluation du niveau réel, indépendamment du domaine</div>
                              <div>✔ Décision construite, pas intuitive</div>
                              <div>✔ Accompagnement humain et personnalisé</div>
                              <div>✔ Validation finale en interaction directe avec un expert</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6" />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              id="service2-details-section"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={reduceMotion ? undefined : { duration: 0.45, ease: easeOut }}
              className="mt-8 sm:mt-10 text-center"
              dir="ltr"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50/80 border border-emerald-200/70 px-4 py-2 text-xs font-semibold text-emerald-900 shadow-sm ring-1 ring-black/5">
                <span>Étape suivante</span>
                <motion.span
                  animate={reduceMotion ? undefined : { y: [0, 4, 0] }}
                  transition={reduceMotion ? undefined : { duration: 1.2, repeat: Infinity, ease: easeInOut }}
                  className="inline-flex"
                >
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </motion.span>
              </div>
              <h3 className="mt-4 font-display text-xl sm:text-2xl font-bold text-slate-900">Service 2 — Mission Professionnelle</h3>
              <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
                <span className="font-semibold text-slate-900">Réelle ou Simulée</span>
              </p>
              <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Après le <span className="font-semibold text-slate-900">Service 1</span>, le participant ne se contente plus d’un diagnostic ou d’une orientation.
                <span className="block mt-2 font-semibold text-slate-900">Il passe à l’action.</span>
                <span className="block mt-2">
                  Le Service 2 transforme la décision prise en mise en situation professionnelle réelle ou simulée, afin d’évaluer concrètement la posture,
                  la qualité des décisions et la capacité à agir en contexte.
                </span>
              </p>

              <div className="mt-7 max-w-[1100px] mx-auto text-left">
                <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/70 backdrop-blur-xl p-6 sm:p-8 shadow-[0_18px_54px_-44px_rgba(15,23,42,0.28)] ring-1 ring-black/5">
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-20 right-10 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.10),transparent_62%)] blur-2xl" />
                    <div className="absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.10),transparent_64%)] blur-2xl" />
                  </div>

                  <div className="relative">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-slate-500">Deux formats</div>
                        <div className="mt-1 text-lg font-semibold text-slate-900">Une même exigence</div>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-4 py-2 text-xs font-semibold text-slate-700">
                        Évaluer • Corriger • Valider
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/40 p-5">
                        <div className="text-xs font-semibold text-emerald-800">🔹 Mission Réelle</div>
                        <div className="mt-2 text-base font-semibold text-slate-900">
                          Simulation à très haute fidélité, ancrée dans votre environnement professionnel
                        </div>
                        <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                          Construite à partir de votre <span className="font-semibold">poste</span>, de votre <span className="font-semibold">projet</span> ou de votre
                          <span className="font-semibold">contexte réel</span>. Situations terrain, contraintes, responsabilités et arbitrages.
                        </p>
                        <p className="mt-3 text-sm text-slate-700 leading-relaxed">
                          <span className="font-semibold">👉 Destinée</span> aux profils déjà en activité ou engagés dans un projet professionnel.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-indigo-200/70 bg-indigo-50/40 p-5">
                        <div className="text-xs font-semibold text-indigo-800">🔹 Mission Simulée</div>
                        <div className="mt-2 text-base font-semibold text-slate-900">
                          Simulation guidée, contexte fictif sécurisé et pédagogique
                        </div>
                        <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                          Situations conçues par nos experts pour s’entraîner à la décision et à la posture professionnelle, sans exposition ni risque.
                        </p>
                        <p className="mt-3 text-sm text-slate-700 leading-relaxed">
                          <span className="font-semibold">👉 Destinée</span> aux profils en phase de préparation ou de transition.
                        </p>
                      </div>
                    </div>

                    <div className="mt-7 border-t border-slate-200/70 pt-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                          <div className="text-sm font-semibold text-slate-900">Une simulation structurée, pas un simple exercice</div>
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
                            <div className="flex gap-3">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                              <span>Analyse de situations sous contraintes</span>
                            </div>
                            <div className="flex gap-3">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                              <span>Décisions à prendre sous pression</span>
                            </div>
                            <div className="flex gap-3">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                              <span>Scénarios variables et imprévus</span>
                            </div>
                            <div className="flex gap-3">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                              <span>Rôles et responsabilités clairement définis</span>
                            </div>
                            <div className="flex gap-3">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                              <span>Erreurs autorisées dans un cadre contrôlé</span>
                            </div>
                            <div className="flex gap-3">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                              <span>Correction directe et feedback actionnable</span>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-5">
                          <div className="text-sm font-semibold text-slate-900">Un accompagnement expert</div>
                          <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                            Sessions directes avec un expert (<span className="font-semibold">3 à 5</span> selon la situation), en individuel ou très petits groupes
                            (<span className="font-semibold">max 4</span>), regroupés selon niveau et diagnostic.
                          </p>
                          <div className="mt-3 rounded-xl border border-slate-200/70 bg-white px-4 py-3">
                            <div className="text-xs font-semibold text-slate-500">Objectif</div>
                            <div className="mt-1 text-sm text-slate-700">
                              Corriger le raisonnement, ajuster la posture, renforcer la qualité des décisions.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-7 border-t border-slate-200/70 pt-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="rounded-2xl border border-amber-200/70 bg-amber-50/60 p-5">
                          <div className="text-sm font-semibold text-amber-900">📌 Positionnement</div>
                          <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                            Un test professionnel réel, sans exposition externe ni risque. Il vérifie la cohérence entre :
                          </p>
                          <div className="mt-3 space-y-1 text-sm text-slate-700">
                            <div>• le niveau identifié</div>
                            <div>• le rôle visé</div>
                            <div>• la capacité effective à agir</div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-5">
                          <div className="text-sm font-semibold text-slate-900">🎯 Pourquoi le Service 2 ?</div>
                          <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                            Parce qu’un bon diagnostic n’a de valeur que s’il est testé dans l’action.
                          </p>
                          <p className="mt-3 text-sm text-slate-700 leading-relaxed">
                            Le Service 2 ne forme pas. Il <span className="font-semibold">évalue</span>, <span className="font-semibold">corrige</span> et
                            <span className="font-semibold"> valide</span> la capacité à agir professionnellement.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-7 border-t border-slate-200/70 pt-6">
                      <div className="text-sm font-semibold text-slate-900">📄 Livrables professionnels</div>
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <div className="text-xs font-semibold text-slate-500">Selon le type de mission</div>
                          <div className="mt-3 space-y-2 text-sm text-slate-700">
                            <div className="flex gap-3">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                              <span>Rapports de mission</span>
                            </div>
                            <div className="flex gap-3">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                              <span>Analyses décisionnelles</span>
                            </div>
                            <div className="flex gap-3">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                              <span>Feedbacks experts</span>
                            </div>
                            <div className="flex gap-3">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                              <span>Recommandations professionnelles</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-slate-500">Documents &amp; résultats</div>
                          <div className="mt-3 space-y-2 text-sm text-slate-700">
                            <div className="flex gap-3">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                              <span>Roadmaps d’exécution</span>
                            </div>
                            <div className="flex gap-3">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                              <span>Synthèses des décisions</span>
                            </div>
                            <div className="flex gap-3">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                              <span>Avis professionnel final</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="domains-section" className="relative scroll-mt-24 sm:scroll-mt-28 py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white to-slate-50 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_38%,transparent_78%)]" />
          <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.08),transparent_60%)] blur-2xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-[1000px] mx-auto" dir="ltr">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={reduceMotion ? undefined : { duration: 0.6, ease: easeOut }}
              className="text-center"
            >
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight">
                🎁 Bonus — Analyse &amp; Recommandations Avancées
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                <span className="font-semibold text-slate-900">Inclus après le Service 1 + le Service 2</span> — restitution professionnelle finale, livrée exclusivement sous forme
                de <span className="font-semibold text-slate-900">document écrit</span>.
              </p>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={reduceMotion ? undefined : { duration: 0.55, ease: easeOut }}
              className="mt-10 rounded-[28px] border border-white/60 bg-white/75 backdrop-blur-xl shadow-[0_22px_70px_-52px_rgba(15,23,42,0.35)] ring-1 ring-black/5 overflow-hidden"
            >
              <div className="px-6 sm:px-8 py-6 sm:py-7 bg-gradient-to-r from-indigo-50/70 via-white/70 to-emerald-50/60 border-b border-slate-200/70">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-3 py-1">Livrable final</span>
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-3 py-1">Analyse écrite</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-500">Bonus — après Service 1 + Service 2</div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="space-y-6">
                  <motion.div
                    whileHover={reduceMotion ? undefined : { y: -3, scale: 1.01 }}
                    transition={reduceMotion ? undefined : { duration: 0.25, ease: easeOut }}
                    className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 sm:p-6 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:bg-white hover:shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-slate-500">📄 Livrable final</div>
                        <div className="mt-2 text-base sm:text-lg font-semibold text-slate-900">Document d’Analyse Professionnelle</div>
                      </div>
                      <div className="inline-flex items-center self-start rounded-full bg-indigo-600/10 px-3 py-1 text-xs font-semibold text-indigo-700">Document écrit</div>
                    </div>

                    <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                      Ce document synthétise l’ensemble du parcours et formalise la position professionnelle issue :
                    </p>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-700">
                      <div className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                        <span>du diagnostic stratégique (Service 1)</span>
                      </div>
                      <div className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                        <span>des missions professionnelles et de leur évaluation (Service 2)</span>
                      </div>
                    </div>

                    <p className="mt-5 text-sm sm:text-base text-slate-600 leading-relaxed">Il comprend :</p>
                    <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-700">
                      <li className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                        <span>Analyse de la manière de travailler et des décisions prises</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                        <span>Forces professionnelles observées</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                        <span>Axes d’amélioration concrets et actionnables</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                        <span>Orientations professionnelles adaptées à la situation</span>
                      </li>
                    </ul>
                  </motion.div>

                  <motion.div
                    whileHover={reduceMotion ? undefined : { y: -3, scale: 1.01 }}
                    transition={reduceMotion ? undefined : { duration: 0.25, ease: easeOut }}
                    className="rounded-2xl border border-amber-200/70 bg-amber-50/60 p-5 sm:p-6 text-left shadow-sm ring-1 ring-black/5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-amber-900">⚖️ Précision importante</div>
                        <div className="mt-2 text-base font-semibold text-slate-900">Cadre du bonus</div>
                      </div>
                      <div className="inline-flex items-center self-start rounded-full bg-amber-900/10 px-3 py-1 text-xs font-semibold text-amber-900">Important</div>
                    </div>
                    <p className="mt-3 text-sm sm:text-base text-slate-700 leading-relaxed">
                      Ce bonus ne constitue ni une formation, ni un accompagnement, ni une session de conseil.
                      Il s’agit d’une analyse professionnelle écrite, fondée sur une évaluation réelle.
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative py-14 sm:py-16 lg:py-18 bg-gradient-to-b from-white to-slate-50 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_38%,transparent_78%)]" />
          <div className="absolute -top-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.10),transparent_60%)] blur-2xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-[1050px] mx-auto" dir="ltr">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={reduceMotion ? undefined : { duration: 0.6, ease: easeOut }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50/80 border border-emerald-200/70 px-4 py-2 text-xs font-semibold text-emerald-900 shadow-sm ring-1 ring-black/5">
                <span>Étape suivante</span>
                <span className="opacity-70">—</span>
                <span>🛠️ Accompagnement Opérationnel</span>
              </div>
              <h2 className="mt-5 font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
                De la décision à l’exécution
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-4xl mx-auto leading-relaxed">
                Lorsque l’analyse complète (diagnostic, missions et restitution finale) le justifie, nous accompagnons l’exécution réelle, directement sur votre situation professionnelle.
              </p>
              <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-4xl mx-auto leading-relaxed">
                Ce service transforme une orientation validée en actions concrètes, structurées et suivies, avec un expert.
              </p>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={reduceMotion ? undefined : { duration: 0.55, ease: easeOut }}
              className="mt-8 rounded-3xl border border-white/60 bg-white/75 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_60px_-46px_rgba(15,23,42,0.22)] ring-1 ring-black/5"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-left">
                <motion.div
                  whileHover={reduceMotion ? undefined : { y: -3, scale: 1.01 }}
                  transition={reduceMotion ? undefined : { duration: 0.25, ease: easeOut }}
                  className="lg:col-span-5 rounded-2xl border border-slate-200/70 bg-white/70 p-5 sm:p-6"
                >
                  <div className="text-sm font-semibold text-slate-900">🎯 À quoi ça sert ?</div>
                  <ul className="mt-4 space-y-2 text-sm sm:text-base text-slate-700">
                    <li>✔ Passer de la décision à l’action</li>
                    <li>✔ Structurer les priorités et les choix</li>
                    <li>✔ Corriger l’exécution en situation réelle</li>
                    <li>✔ Développer les compétences nécessaires en pratiquant</li>
                    <li>✔ Avancer de manière concrète et mesurable</li>
                  </ul>
                  <div className="mt-5 rounded-2xl border border-emerald-200/70 bg-emerald-50/40 p-4">
                    <p className="text-sm sm:text-base text-emerald-900 leading-relaxed">
                      👉 Ici, on ne vous dit pas quoi faire : on travaille avec vous, sur votre réalité.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={reduceMotion ? undefined : { y: -3, scale: 1.01 }}
                  transition={reduceMotion ? undefined : { duration: 0.25, ease: easeOut }}
                  className="lg:col-span-7 rounded-2xl border border-slate-200/70 bg-white/70 p-5 sm:p-6"
                >
                  <div className="text-sm font-semibold text-slate-900">🛠️ Comment ça se passe ?</div>
                  <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                    Un <span className="font-semibold text-slate-900">plan d’action opérationnel sur mesure</span> est construit à partir :
                  </p>
                  <ul className="mt-4 space-y-2 text-sm sm:text-base text-slate-700 list-disc pl-5">
                    <li>de votre situation réelle,</li>
                    <li>des décisions déjà validées,</li>
                    <li>des axes d’amélioration identifiés.</li>
                  </ul>
                  <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                    Ce plan devient votre feuille de route d’exécution.
                  </p>
                </motion.div>
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 text-left">
                <motion.div
                  whileHover={reduceMotion ? undefined : { y: -3, scale: 1.01 }}
                  transition={reduceMotion ? undefined : { duration: 0.25, ease: easeOut }}
                  className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 sm:p-6"
                >
                  <div className="text-sm font-semibold text-slate-900">👥 Formats</div>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl border border-slate-200/70 bg-white px-4 py-3">
                      <div className="text-sm font-semibold text-slate-900">🔹 Individuel</div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white px-4 py-3">
                      <div className="text-sm font-semibold text-slate-900">🔹 Groupe restreint filtré</div>
                      <div className="mt-1 text-sm text-slate-600">max. 5 personnes</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={reduceMotion ? undefined : { y: -3, scale: 1.01 }}
                  transition={reduceMotion ? undefined : { duration: 0.25, ease: easeOut }}
                  className="rounded-2xl border border-emerald-200/70 bg-emerald-50/40 p-5 sm:p-6"
                >
                  <div className="text-sm font-semibold text-emerald-900">👉</div>
                  <p className="mt-2 text-sm sm:text-base text-emerald-900 leading-relaxed">
                    Un accompagnement professionnel appliqué, orienté terrain et impact.
                  </p>
                </motion.div>
              </div>

              <motion.div
                whileHover={reduceMotion ? undefined : { y: -3, scale: 1.01 }}
                transition={reduceMotion ? undefined : { duration: 0.25, ease: easeOut }}
                className="mt-6 rounded-2xl border border-amber-200/70 bg-amber-50/60 p-5 sm:p-6 text-left"
              >
                <div className="text-sm font-semibold text-amber-900">⚠️ Cadre</div>
                <p className="mt-3 text-sm sm:text-base text-slate-700 leading-relaxed">Cet accompagnement :</p>
                <ul className="mt-3 space-y-2 text-sm sm:text-base text-slate-700 list-disc pl-5">
                  <li>n’est pas une formation classique,</li>
                  <li>intervient uniquement lorsqu’un besoin réel est identifié,</li>
                  <li>se fait exclusivement sur des situations concrètes,</li>
                  <li>ne comporte aucune promesse de résultat.</li>
                </ul>
                <p className="mt-4 text-sm sm:text-base text-slate-700 leading-relaxed">
                  👉 Un accompagnement professionnel appliqué, orienté terrain et impact.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="services-section" className="relative scroll-mt-24 sm:scroll-mt-28 py-12 sm:py-14 lg:py-16 bg-gradient-to-b from-white to-slate-50 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_38%,transparent_78%)]" />
          <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.08),transparent_60%)] blur-2xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-[1100px] mx-auto" dir="ltr">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={reduceMotion ? undefined : { duration: 0.6, ease: easeOut }}
              className="text-center"
            >
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight">
                Parcours d’accompagnement professionnel
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Un parcours structuré, avec services et bonus, présenté ici sous forme de résumé. Les tarifs sont indiqués <span className="font-semibold text-slate-900">à partir de</span>
                et sont confirmés <span className="font-semibold text-slate-900">après le diagnostic initial</span>.
              </p>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={reduceMotion ? undefined : { duration: 0.55, ease: easeOut }}
              className="mt-8 rounded-[2rem] border border-white/60 bg-white/75 backdrop-blur-xl shadow-[0_26px_70px_-52px_rgba(15,23,42,0.28)] ring-1 ring-black/5 overflow-hidden"
            >
              <div className="px-6 sm:px-8 py-6 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white/70">Résumé du parcours</div>
                    <div className="mt-2 text-xl sm:text-2xl font-semibold text-white tracking-tight">Prix du parcours (à partir de)</div>
                  </div>
                  <div className="text-white">
                    <div className="text-2xl sm:text-3xl font-semibold">
                      {formatPrice(pricingSettings?.totalPrice ?? 1290)}
                    </div>
                    <div className="mt-1 text-xs text-white/70">Tarif indicatif • confirmé après diagnostic initial</div>
                    <div className="mt-3">
                      <select
                        value={displayCurrency}
                        onChange={(e) => setDisplayCurrency(e.target.value)}
                        className="w-full sm:w-auto rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                      >
                        <option value="TND" className="text-slate-900">TND</option>
                        <option value="EUR" className="text-slate-900">EUR</option>
                        <option value="USD" className="text-slate-900">USD</option>
                        <option value="MAD" className="text-slate-900">MAD</option>
                        <option value="DZD" className="text-slate-900">DZD</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-5 sm:p-6 ring-1 ring-black/5">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Domaines disponibles actuellement</div>
                    <div className="mt-1 text-sm text-slate-600">La liste est limitée et évolue progressivement.</div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(domainOptions || []).map((opt) => (
                        <span
                          key={opt.value}
                          className="inline-flex items-center rounded-full bg-slate-50/80 text-slate-900 border border-slate-200/70 px-3 py-1 text-xs sm:text-sm font-semibold"
                        >
                          {opt.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
                  <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 ring-1 ring-black/5 shadow-sm flex flex-col h-full">
                    <div className="text-xs font-semibold text-emerald-700">Service 1</div>
                    <div className="mt-2 text-base font-semibold text-slate-900">Diagnostic stratégique &amp; orientation</div>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">Analyse approfondie + décision structurée + livrables.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-slate-50/80 text-slate-900 border border-slate-200/70 px-3 py-1 text-xs font-semibold">
                        Durée : {pricingSettings?.service1Duration ?? '7–14 jours'}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-slate-50/80 text-slate-900 border border-slate-200/70 px-3 py-1 text-xs font-semibold">Niveau : Débutant → Expert</span>
                    </div>
                    <div className="mt-4 rounded-2xl border border-emerald-200/70 bg-emerald-50/40 p-4">
                      <div className="text-xs font-semibold text-emerald-900">Prix (à partir de)</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        {formatPrice(pricingSettings?.service1Price ?? 290)}
                      </div>
                      <div className="mt-1 text-xs text-slate-600">Confirmé après diagnostic initial.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => scrollToSection("service1-details-section")}
                      className="mt-5 sm:mt-auto inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                    >
                      <span>Détails</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 ring-1 ring-black/5 shadow-sm flex flex-col h-full">
                    <div className="text-xs font-semibold text-amber-700">Bonus</div>
                    <div className="mt-2 text-base font-semibold text-slate-900">Espace Ressources &amp; recommandation</div>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">Ressources + recommandations pour guider la suite du parcours.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-amber-50/80 text-amber-900 border border-amber-200/70 px-3 py-1 text-xs font-semibold">Inclus</span>
                      <span className="inline-flex items-center rounded-full bg-slate-50/80 text-slate-900 border border-slate-200/70 px-3 py-1 text-xs font-semibold">Après Service 1</span>
                    </div>
                    <div className="mt-4 rounded-2xl border border-amber-200/70 bg-amber-50/60 p-4">
                      <div className="text-xs font-semibold text-amber-900">Prix</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">Inclus</div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 ring-1 ring-black/5 shadow-sm flex flex-col h-full">
                    <div className="text-xs font-semibold text-emerald-700">Service 2</div>
                    <div className="mt-2 text-base font-semibold text-slate-900">Missions professionnelles encadrées</div>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">Missions réelles ou simulées, avec feedback d’expert.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-slate-50/80 text-slate-900 border border-slate-200/70 px-3 py-1 text-xs font-semibold">
                        Durée : {pricingSettings?.service2Duration ?? '2–4 semaines'}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-slate-50/80 text-slate-900 border border-slate-200/70 px-3 py-1 text-xs font-semibold">Niveau : Intermédiaire → Expert</span>
                    </div>
                    <div className="mt-4 rounded-2xl border border-emerald-200/70 bg-emerald-50/40 p-4">
                      <div className="text-xs font-semibold text-emerald-900">Prix (à partir de)</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        {formatPrice(pricingSettings?.service2Price ?? 590)}
                      </div>
                      <div className="mt-1 text-xs text-slate-600">Confirmé après validation Service 1.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => scrollToSection("service2-details-section")}
                      className="mt-5 sm:mt-auto inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                    >
                      <span>Détails</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 ring-1 ring-black/5 shadow-sm flex flex-col h-full">
                    <div className="text-xs font-semibold text-amber-700">Bonus</div>
                    <div className="mt-2 text-base font-semibold text-slate-900">Analyse &amp; Recommandations Avancées</div>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">Document final (restitution) après Service 1 + Service 2.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-amber-50/80 text-amber-900 border border-amber-200/70 px-3 py-1 text-xs font-semibold">Inclus</span>
                      <span className="inline-flex items-center rounded-full bg-slate-50/80 text-slate-900 border border-slate-200/70 px-3 py-1 text-xs font-semibold">Après Service 2</span>
                    </div>
                    <div className="mt-4 rounded-2xl border border-amber-200/70 bg-amber-50/60 p-4">
                      <div className="text-xs font-semibold text-amber-900">Prix</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">Inclus</div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 ring-1 ring-black/5 shadow-sm flex flex-col h-full">
                    <div className="text-xs font-semibold text-purple-700">Service 3</div>
                    <div className="mt-2 text-base font-semibold text-slate-900">Accompagnement opérationnel</div>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">De la stratégie à l’exécution concrète, en sessions directes.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-slate-50/80 text-slate-900 border border-slate-200/70 px-3 py-1 text-xs font-semibold">
                        Durée : {pricingSettings?.service3Duration ?? '2–6 semaines'}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-slate-50/80 text-slate-900 border border-slate-200/70 px-3 py-1 text-xs font-semibold">Niveau : selon mission</span>
                    </div>
                    <div className="mt-4 rounded-2xl border border-purple-200/70 bg-purple-50/50 p-4">
                      <div className="text-xs font-semibold text-purple-900">Prix (à partir de)</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        {formatPrice(pricingSettings?.service3Price ?? 490)}
                      </div>
                      <div className="mt-1 text-xs text-slate-600">Ajusté selon le nombre de sessions.</div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 ring-1 ring-black/5 shadow-sm flex flex-col h-full">
                    <div className="text-xs font-semibold text-amber-700">Bonus</div>
                    <div className="mt-2 text-base font-semibold text-slate-900">Groupe Telegram</div>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">Groupe Telegram d’échanges et développement.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-amber-50/80 text-amber-900 border border-amber-200/70 px-3 py-1 text-xs font-semibold">Inclus</span>
                      <span className="inline-flex items-center rounded-full bg-slate-50/80 text-slate-900 border border-slate-200/70 px-3 py-1 text-xs font-semibold">Communauté</span>
                    </div>
                    <div className="mt-4 rounded-2xl border border-amber-200/70 bg-amber-50/60 p-4">
                      <div className="text-xs font-semibold text-amber-900">Prix</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">Inclus</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-3xl border border-indigo-200/70 bg-indigo-50/50 p-5 sm:p-6 ring-1 ring-black/5">
                  <div className="text-sm font-semibold text-indigo-900">📌 Note importante — Parcours séquentiel</div>
                  <p className="mt-2 text-sm sm:text-base text-slate-700 leading-relaxed">
                    Chaque service est <span className="font-semibold">lié au précédent</span> : vous ne pouvez pas démarrer le <span className="font-semibold">Service 2</span> sans avoir validé le
                    <span className="font-semibold"> Service 1</span>, et vous ne pouvez pas démarrer le <span className="font-semibold">Service 3</span> sans avoir validé le
                    <span className="font-semibold"> Service 1</span> et le <span className="font-semibold">Service 2</span>.
                  </p>
                  <p className="mt-3 text-sm sm:text-base text-slate-700 leading-relaxed">
                    Pour vous inscrire, vous devez d’abord compléter le <span className="font-semibold">Diagnostic général (gratuit)</span>.
                  </p>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => navigate("/diagnostic")}
                      className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                    >
                      <span>Faire le diagnostic général</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="benefits-section" className="relative scroll-mt-24 sm:scroll-mt-28 py-12 sm:py-14 lg:py-16 bg-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_38%,transparent_78%)]" />
          <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.06),transparent_60%)] blur-2xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-[900px] mx-auto" dir="ltr">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={reduceMotion ? undefined : { duration: 0.6, ease: easeOut }}
              className="text-center"
            >
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight">
                Les avantages clés du parcours
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Des livrables, des preuves et une traçabilité complète — conçus pour refléter votre niveau réel et soutenir vos décisions dans des situations concrètes.
              </p>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={reduceMotion ? undefined : { duration: 0.55, ease: easeOut, delay: 0.05 }}
              className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left"
            >
              <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 ring-1 ring-black/5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                <div className="text-xs font-semibold text-indigo-700">Avantage 01</div>
                <div className="mt-2 text-base font-semibold text-slate-900">📄 Des livrables professionnels à forte valeur</div>
                <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                  Chaque étape produit des documents d’analyse professionnelle qui reflètent votre raisonnement, vos décisions et votre capacité à agir en situation réelle — et non une simple participation.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 ring-1 ring-black/5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                <div className="text-xs font-semibold text-indigo-700">Avantage 02</div>
                <div className="mt-2 text-base font-semibold text-slate-900">🔍 Des preuves vérifiables de votre niveau réel</div>
                <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                  Les livrables permettent d’évaluer et de démontrer votre niveau effectif, votre posture professionnelle et la qualité de vos choix, sur la base de situations concrètes.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 ring-1 ring-black/5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                <div className="text-xs font-semibold text-indigo-700">Avantage 03</div>
                <div className="mt-2 text-base font-semibold text-slate-900">🧭 Une traçabilité complète du parcours</div>
                <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                  Diagnostic, missions, décisions et recommandations sont documentés et structurés, garantissant une progression claire et cohérente.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 ring-1 ring-black/5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                <div className="text-xs font-semibold text-indigo-700">Avantage 04</div>
                <div className="mt-2 text-base font-semibold text-slate-900">🧠 Des décisions argumentées et défendables</div>
                <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                  Chaque décision importante est analysée, justifiée et formalisée par écrit, développant une logique professionnelle solide et applicable.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 ring-1 ring-black/5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                <div className="text-xs font-semibold text-indigo-700">Avantage 05</div>
                <div className="mt-2 text-base font-semibold text-slate-900">🛡️ Un cadre sécurisé pour tester sans risque</div>
                <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                  Les documents issus des simulations permettent de tester, corriger et ajuster les décisions sans exposition professionnelle, avant application réelle.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 ring-1 ring-black/5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                <div className="text-xs font-semibold text-indigo-700">Avantage 06</div>
                <div className="mt-2 text-base font-semibold text-slate-900">📘 Une documentation finale de référence</div>
                <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                  À l’issue du parcours, vous disposez d’un document professionnel synthèse, exploitable sur le long terme et réutilisable dans votre évolution de carrière.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 ring-1 ring-black/5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:col-span-2 sm:justify-self-center sm:max-w-[520px] lg:col-span-1 lg:col-start-2 lg:max-w-none">
                <div className="text-xs font-semibold text-indigo-700">Avantage 07</div>
                <div className="mt-2 text-base font-semibold text-slate-900">🎯 Une valeur durable, au-delà de l’accompagnement</div>
                <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                  Les livrables restent votre propriété et constituent une base stratégique durable, bien après la fin des sessions.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white to-slate-50 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_38%,transparent_78%)]" />
          <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.08),transparent_60%)] blur-2xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-[1100px] mx-auto" dir="ltr">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={reduceMotion ? undefined : { duration: 0.6, ease: easeOut }}
              className="text-center"
            >
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight">
                Des expériences professionnelles analysées avec rigueur
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Les témoignages qui suivent reflètent des parcours réels, analysés dans un cadre professionnel exigeant.
              </p>
            </motion.div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials
                .slice(testimonialsPage * 3, testimonialsPage * 3 + 3)
                .map((t, idx) => (
                <motion.div
                  key={t.author}
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  transition={
                    reduceMotion
                      ? undefined
                      : { duration: 0.45, ease: easeOut, delay: idx * 0.03 }
                  }
                  className="rounded-3xl border border-white/60 bg-white/75 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_60px_-46px_rgba(15,23,42,0.25)] ring-1 ring-black/5"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-full bg-white/70 border border-white/60 ring-1 ring-black/5 flex items-center justify-center text-sm font-semibold text-slate-700">
                      {t.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base text-slate-700 italic leading-relaxed whitespace-pre-line">
                        {t.quote}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-200/70">
                    <p className="text-sm font-semibold text-slate-900">— {t.author}</p>
                    <p className="mt-1 text-sm text-slate-600">Fonction : {t.role}</p>
                    <p className="mt-1 text-sm text-slate-600">Domaine : {t.domain}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {testimonialsLoading && (
              <div className="mt-6 text-center text-sm text-slate-500">Chargement des témoignages…</div>
            )}

            {testimonials.length > 3 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setTestimonialsPage((p) => Math.max(0, p - 1))}
                  disabled={testimonialsPage === 0}
                  className="px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-700 text-sm font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Précédent
                </button>

                <div className="text-sm text-slate-600">
                  {testimonialsPage + 1} / {Math.ceil(testimonials.length / 3)}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setTestimonialsPage((p) =>
                      Math.min(Math.ceil(testimonials.length / 3) - 1, p + 1)
                    )
                  }
                  disabled={testimonialsPage >= Math.ceil(testimonials.length / 3) - 1}
                  className="px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-700 text-sm font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Suivant
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="relative py-14 sm:py-16 lg:py-20 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_38%,transparent_78%)]" />
          <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.08),transparent_60%)] blur-2xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-[980px] mx-auto" dir="ltr">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              whileHover={reduceMotion ? undefined : { y: -2 }}
              transition={reduceMotion ? undefined : { duration: 0.55, ease: easeOut }}
              className="relative w-full rounded-[2rem] border border-slate-200/70 bg-white/75 backdrop-blur-xl px-6 sm:px-10 py-7 sm:py-9 shadow-[0_24px_60px_-46px_rgba(15,23,42,0.22)] ring-1 ring-black/5 overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.18] bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.55),transparent_42%),radial-gradient(circle_at_85%_80%,rgba(56,189,248,0.45),transparent_44%)]" />
                <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:92px_92px] [mask-image:radial-gradient(ellipse_at_center,black_36%,transparent_78%)]" />
              </div>
              <div className="relative flex flex-col xl:flex-row xl:items-center xl:justify-between gap-7">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50/80 border border-indigo-100/80 px-3 py-1.5">
                    <span className="text-xs sm:text-sm font-semibold text-indigo-800">Avant de commencer</span>
                  </div>
                  <p className="mt-3 text-xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
                    <span className="block">L’écosystème MA-TRAINING-CONSULTING</span>
                    <span className="block">repose aussi sur des experts terrain.</span>
                  </p>
                  <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                    Vous êtes expert ? Découvrez le cadre de collaboration.
                  </p>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <motion.button
                      type="button"
                      onClick={() => navigate("/programme-partenariat")}
                      whileHover={reduceMotion ? undefined : { y: -1 }}
                      transition={reduceMotion ? undefined : { duration: 0.25, ease: easeOut }}
                      className="group inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-amber-50/70 px-4 py-2 text-xs sm:text-sm font-semibold text-amber-900 shadow-sm ring-1 ring-black/5 hover:bg-amber-50"
                    >
                      <motion.span
                        animate={reduceMotion ? undefined : { opacity: [0.7, 1, 0.7] }}
                        transition={reduceMotion ? undefined : { duration: 1.4, repeat: Infinity, ease: easeInOut }}
                        className="inline-flex"
                      >
                        ⚡
                      </motion.span>
                      <span>Découvrir le cadre de collaboration</span>
                      <ArrowRight className="w-4 h-4 text-amber-900 group-hover:translate-x-0.5 transition-transform" />
                    </motion.button>
                  </div>
                </div>

                <div className="w-full xl:w-auto shrink-0 flex flex-col sm:flex-row gap-3 sm:justify-start">
                  <button
                    type="button"
                    onClick={() => navigate("/ecosysteme")}
                    className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200 px-5 py-3 text-sm sm:text-base font-semibold text-slate-900 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-colors whitespace-normal text-center leading-snug"
                  >
                    <span>Découvrir ce parcours en détail</span>
                    <ArrowRight className="w-5 h-5 text-slate-900 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/diagnostic")}
                    className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm sm:text-base font-semibold text-white shadow-[0_16px_38px_-24px_rgba(79,70,229,0.65)] hover:shadow-[0_20px_50px_-26px_rgba(79,70,229,0.8)] transition-shadow"
                  >
                    <span>Démarrer le diagnostic</span>
                    <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {false && (
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
                <span className="text-xs sm:text-sm font-semibold text-slate-700">🧭 منظومة MA-TRAINING-CONSULTING الرقمية</span>
              </div>

              <h2 className="mt-5 font-display text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                Une plateforme professionnelle structurée
              </h2>

              <p className="mt-4 text-base sm:text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
                MA-TRAINING-CONSULTING s’appuie sur une منظومة رقمية مغلقة et organisée, construite autour du diagnostic, de l’accompagnement
                et de la vérification professionnelle — sans proposer de cours, de formation, ni de certifications éducatives.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={openEspaceParticipant}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm sm:text-base font-semibold shadow-[0_14px_34px_-22px_rgba(79,70,229,0.65)] hover:shadow-[0_18px_46px_-24px_rgba(79,70,229,0.8)] transition-all duration-300"
                >
                  <Users className="w-4 h-4" />
                  <span>Espace d’analyse & recommandations avancées</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={openEspaceVerification}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-gray-900 text-sm sm:text-base font-semibold border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300"
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
                      <h3 className="text-xl font-bold text-gray-900">Espace d’analyse & recommandations avancées</h3>
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
                    <div className="pt-2">
                      <button
                        onClick={openEspaceParticipant}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200/70 text-emerald-900 font-semibold hover:bg-emerald-100 transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span>Accéder à l’espace d’analyse & recommandations avancées</span>
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
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
                <div className="relative">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
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
                    Les documents peuvent être disponibles dans l’Espace d’analyse & recommandations avancées, vérifiables via l’Espace Vérification, ou envoyés par e-mail
                    selon le type de document, la phase du parcours et l’objectif professionnel.
                  </p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-white/90">
                    <div className="rounded-2xl bg-white/10 border border-white/10 p-4">Disponibles dans l’Espace d’analyse & recommandations avancées</div>
                    <div className="rounded-2xl bg-white/10 border border-white/10 p-4">Vérifiables via code unique</div>
                    <div className="rounded-2xl bg-white/10 border border-white/10 p-4">Envoi possible par e-mail</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="mt-10 max-w-4xl mx-auto rounded-3xl bg-slate-50 border border-slate-200/80 p-7 shadow-sm ring-1 ring-black/5">
              <h3 className="text-lg font-bold text-gray-900">Synthèse</h3>
              <p className="mt-2 text-gray-700 leading-relaxed">
                MA-TRAINING-CONSULTING fournit un système professionnel intégré : diagnostic, accompagnement et vérification.
                La documentation est gérée via l’Espace d’analyse & recommandations avancées, l’Espace Vérification ou l’e-mail, sans cours, sans formation, et sans diplômes.
              </p>
            </div>
          </div>
        </div>
      </section>
      )}

      {false && (
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
                  Après le diagnostic, certains participants ont besoin d’une mise en pratique concrète ou d’un test réaliste.
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
                    <li>Mise en pratique directe</li>
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
                  onClick={() => navigate("/diagnostic")}
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

      )}

      {false && (
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
                Nous ne nous limitons pas au diagnostic ou à l’orientation. Après être passés par les services MA-TRAINING-CONSULTING, les participants intègrent un écosystème professionnel fermé
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

      )}

      {/* Interactive QCM Modal */}
      <InteractiveQCMModal
        isOpen={showUnifiedCatalogModal}
        onClose={() => setShowUnifiedCatalogModal(false)}
        onItemSelect={handleUnifiedCatalogItemSelection}
        catalogItems={createUnifiedCatalog()}
      />

      {/* Certificate Verification Modal */}

      {/* Free Course Modal */}
      {null}

      {/* Program Registration Modal */}
      <ProgramRegistrationModal
        isOpen={showProgramModal}
        onClose={() => {
          setShowProgramModal(false);
          setSelectedProgram(null);
        }}
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
