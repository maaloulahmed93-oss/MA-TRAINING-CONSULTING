import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Globe,
  Star,
  Target,
  Lightbulb,
  Users,
  Handshake,
  Rocket,
  Brain,
  MapPin,
  BarChart3,
  Sparkles,
  Award,
  TrendingUp,
} from "lucide-react";

interface AboutPageProps {
  onBack: () => void;
  onNavigateToPartner?: () => void;
  onContact?: () => void;
}

type Language = "fr" | "ar" | "en";

const AboutPage: React.FC<AboutPageProps> = ({
  onBack,
  onNavigateToPartner,
  onContact,
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("fr");
  const [showServices, setShowServices] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Gestionnaire pour naviguer vers le footer
  const handleContactClick = () => {
    if (onContact) {
      onContact();
    } else {
      // Essayer de faire défiler vers le footer dans la page actuelle d'abord
      const footer = document.querySelector("footer");
      if (footer) {
        footer.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        // Si pas de footer, faire défiler vers le bas de la page actuelle
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });

        // Puis naviguer vers la page d'accueil après un délai
        setTimeout(() => {
          window.location.href = "/#contact";
        }, 1000);
      }
    }
  };

  const translations = {
    fr: {
      // Navigation
      back: "Retour",

      // Hero Section
      heroTitle: "MATC, votre partenaire pour atteindre l'excellence.",
      heroSubtitle:
        "Nous connectons la formation pratique, la transformation digitale et l'exploitation professionnelle — pour libérer les compétences vers le succès.",
      heroCta: "Découvrez nos services",

      // Vision & Mission
      visionMissionTitle: "Notre Vision et Mission",
      visionTitle: "Vision",
      visionText:
        "Créer un impact tangible sur le marché du travail en autonomisant les compétences et en fournissant des solutions intelligentes et intégrées.",
      missionTitle: "Mission",
      missionText:
        "Nous proposons des programmes de formation-conseil pratiques et des solutions numériques qui répondent précisément et professionnellement aux besoins des individus et des organisations.",

      // Values
      valuesTitle: "Nos Valeurs",
      excellence: "Excellence",
      impact: "Impact",
      innovation: "Innovation",
      inclusion: "Inclusion",
      commitment: "Engagement Communautaire",

      // Our Story
      storyTitle: "Notre Histoire",
      storySubtitle:
        "Un voyage vers le changement et l'innovation, étape par étape.",
      story2023Title: "Le Lancement",
      story2023Text:
        "Nous avons commencé notre voyage en Tunisie, dans le but de fournir une formation-conseil pratique orientée vers le marché du travail réel.",
      story2024Title: "Construction de Partenariats",
      story2024Text:
        "Nous avons signé des accords de coopération stratégique avec des institutions d'Europe, du Golfe et d'Afrique.",
      story2025Title: "Transformation Digitale Complète",
      story2025Text:
        "Nous avons lancé notre plateforme numérique de formation-conseil et commencé à offrir des parcours flexibles personnalisés pour les entreprises.",
      storyFutureTitle: "L'Avenir Proche",
      storyFutureText:
        "Nous continuons à innover, nous étendons les accréditations internationales et développons des programmes mondiaux pour soutenir les compétences de demain.",

      // Team
      teamTitle: "Notre Équipe",
      teamIntro:
        "L'équipe MA-TRAINING-CONSULTING est composée de professionnels unis par une passion commune : fournir des solutions efficaces pour la formation, la numérisation et l'exploitation professionnelle.",
      founderTitle: "Fondateur Principal",
      founderName: "Ahmed Maaloul",
      founderRole:
        "Fondateur et créateur de la plateforme MA-TRAINING-CONSULTING",
      founderDesc:
        "Consultant stratégique en formation, innovation pédagogique et marketing numérique",
      founderStory:
        "A lancé le projet en 2023 dans le but de connecter les compétences au marché du travail de manière pratique et intelligente, à travers la formation-conseil et les solutions numériques.",
      founderLocation: "Tunisie – Partenariats mondiaux",

      // Management Team
      managementTitle: "Équipe de Direction Exécutive",
      programsManager: "Directrice des Programmes",
      programsDesc:
        "Supervise la planification et la gestion du contenu de formation pour assurer la qualité et l'adéquation au marché.",
      digitalManager: "Responsable Transformation Digitale",
      digitalDesc:
        "Dirige le développement des plateformes numériques et transforme le contenu en expériences interactives innovantes.",
      partnershipsManager: "Responsable Relations",
      partnershipsDesc:
        "Gère le réseau de partenaires locaux et internationaux, coordonne les projets transfrontaliers.",
      marketingManager: "Directeur Marketing",
      marketingDesc:
        "Développe l'image numérique de l'institution et dirige les campagnes de communication avec le marché cible.",

      // Expert Network
      expertNetworkTitle: "Réseau d'Experts",
      expertNetworkText:
        "Nous ne travaillons pas seuls. Nous avons un réseau de partenaires et d'experts indépendants en Europe, dans le Golfe et en Afrique travaillant dans les domaines :",
      consultingTraining: "Formation-conseil",
      projectManagement: "Gestion de projets",
      contentProduction: "Production de contenu",
      technicalSkills: "Développement des compétences techniques",

      // CTA
      ctaTitle: "Souhaitez-vous travailler avec nous ou collaborer ?",
      ctaDiscover: "Découvrir les opportunités",
      ctaContact: "Nous contacter",

      // Services
      servicesTitle: "Nos Services",
      servicesSubtitle: "Découvrez nos solutions professionnelles",
      service1Title: "Formation Pratique",
      service1Desc:
        "Programmes de formation spécialisés axés sur l'application pratique et les compétences réelles nécessaires au marché du travail moderne.",
      service2Title: "Transformation Digitale",
      service2Desc:
        "Solutions technologiques avancées pour moderniser les processus, améliorer l'efficacité opérationnelle et accélérer la croissance.",
      service3Title: "Exploitation Professionnelle",
      service3Desc:
        "Stratégies éprouvées pour développer les performances institutionnelles, optimiser les ressources et atteindre les objectifs stratégiques.",
      backToAbout: "Retour à À propos",
    },
    ar: {
      // Navigation
      back: "العودة",

      // Hero Section
      heroTitle: "MATC، شريكك لتحقيق التميز والنجاح",
      heroSubtitle:
        "نربط بين التدريب التطبيقي والتحول الرقمي والتشغيل الاحترافي — لنطلق الكفاءات نحو النجاح",
      heroCta: "اكتشف خدماتنا",

      // Vision & Mission
      visionMissionTitle: "رؤيتنا ورسالتنا",
      visionTitle: "الرؤية",
      visionText:
        "إحداث تأثير ملموس في سوق العمل من خلال تمكين الكفاءات وتقديم حلول ذكية ومتكاملة",
      missionTitle: "الرسالة",
      missionText:
        "نقدم برامج تدريب استشاري تطبيقية وحلول رقمية تلبي احتياجات الأفراد والمؤسسات بدقة واحترافية",

      // Values
      valuesTitle: "قيمنا",
      excellence: "التميز",
      impact: "التأثير",
      innovation: "الابتكار",
      inclusion: "الشمول",
      commitment: "الالتزام المجتمعي",

      // Our Story
      storyTitle: "قصتنا",
      storySubtitle: "رحلة نحو التغيير والإبداع، خطوة بخطوة",
      story2023Title: "الانطلاقة",
      story2023Text:
        "بدأنا رحلتنا في تونس بهدف تقديم تدريب استشاري تطبيقي موجه لسوق العمل الحقيقي",
      story2024Title: "بناء الشراكات",
      story2024Text:
        "وقعنا اتفاقيات تعاون استراتيجي مع مؤسسات من أوروبا والخليج وأفريقيا",
      story2025Title: "التحول الرقمي الكامل",
      story2025Text:
        "أطلقنا منصتنا الرقمية للتدريب الاستشاري وبدأنا تقديم مسارات مرنة مخصصة للشركات",
      storyFutureTitle: "المستقبل القريب",
      storyFutureText:
        "نواصل الابتكار ونتوسع في الاعتمادات الدولية ونطور برامج عالمية تدعم كفاءات الغد",

      // Team
      teamTitle: "فريقنا",
      teamIntro:
        "يتكون فريق MA-TRAINING-CONSULTING من محترفين يجمعهم شغف واحد: تقديم حلول فعالة للتدريب والرقمنة والتشغيل الاحترافي",
      founderTitle: "المؤسس الرئيسي",
      founderName: "أحمد المعلول",
      founderRole: "مؤسس ومبدع منصة MA-TRAINING-CONSULTING",
      founderDesc:
        "مستشار استراتيجي في التدريب والابتكار التربوي والتسويق الرقمي",
      founderStory:
        "أطلق المشروع عام 2023 بهدف ربط الكفاءات بسوق العمل بطريقة تطبيقية وذكية من خلال التدريب الاستشاري والحلول الرقمية",
      founderLocation: "تونس – شراكات عالمية",

      // Management Team
      managementTitle: "فريق الإدارة التنفيذية",
      programsManager: "مديرة البرامج",
      programsDesc:
        "تشرف على تخطيط وإدارة المحتوى التدريبي لضمان الجودة والملاءمة للسوق",
      digitalManager: "مسؤول التحول الرقمي",
      digitalDesc:
        "يقود تطوير المنصات الرقمية وتحويل المحتوى إلى تجارب تفاعلية مبتكرة",
      partnershipsManager: "مسؤولة العلاقات",
      partnershipsDesc:
        "تدير شبكة الشركاء المحليين والدوليين وتنسق المشاريع العابرة للحدود",
      marketingManager: "مدير التسويق",
      marketingDesc:
        "يطور الصورة الرقمية للمؤسسة ويقود حملات التواصل مع السوق المستهدف",

      // Expert Network
      expertNetworkTitle: "شبكة الخبراء",
      expertNetworkText:
        "لا نعمل وحدنا. لدينا شبكة من الشركاء والخبراء المستقلين في أوروبا والخليج وأفريقيا يعملون في مجالات:",
      consultingTraining: "التدريب الاستشاري",
      projectManagement: "إدارة المشاريع",
      contentProduction: "إنتاج المحتوى",
      technicalSkills: "تطوير المهارات التقنية",

      // CTA
      ctaTitle: "هل ترغب في العمل معنا أو التعاون؟",
      ctaDiscover: "اكتشف الفرص",
      ctaContact: "اتصل بنا",

      // Services
      servicesTitle: "خدماتنا",
      servicesSubtitle: "اكتشف حلولنا المهنية",
      service1Title: "التدريب التطبيقي",
      service1Desc:
        "برامج تدريبية متخصصة تركز على التطبيق العملي والمهارات الحقيقية المطلوبة في سوق العمل الحديث",
      service2Title: "التحول الرقمي",
      service2Desc:
        "حلول تقنية متطورة لتحديث العمليات وتحسين الكفاءة التشغيلية وتسريع النمو",
      service3Title: "التشغيل الاحترافي",
      service3Desc:
        "استراتيجيات مجربة لتطوير الأداء المؤسسي وتحسين الموارد وتحقيق الأهداف الاستراتيجية",
      backToAbout: "العودة إلى من نحن",
    },
    en: {
      // Navigation
      back: "Back",

      // Hero Section
      heroTitle: "MATC, your partner to achieve excellence",
      heroSubtitle:
        "We connect practical training, digital transformation, and professional operations — to unleash skills towards success",
      heroCta: "Discover our services",

      // Vision & Mission
      visionMissionTitle: "Our Vision and Mission",
      visionTitle: "Vision",
      visionText:
        "Create a tangible impact on the job market by empowering skills and providing intelligent and integrated solutions",
      missionTitle: "Mission",
      missionText:
        "We provide practical consulting-training programs and digital solutions that meet the needs of individuals and organizations with precision and professionalism",

      // Values
      valuesTitle: "Our Values",
      excellence: "Excellence",
      impact: "Impact",
      innovation: "Innovation",
      inclusion: "Inclusion",
      commitment: "Community Commitment",

      // Our Story
      storyTitle: "Our Story",
      storySubtitle: "A journey towards change and innovation, step by step",
      story2023Title: "The Launch",
      story2023Text:
        "We started our journey in Tunisia, aiming to provide practical consulting training oriented towards the real job market",
      story2024Title: "Building Partnerships",
      story2024Text:
        "We signed strategic cooperation agreements with institutions from Europe, the Gulf, and Africa",
      story2025Title: "Complete Digital Transformation",
      story2025Text:
        "We launched our digital consulting-training platform and began offering flexible customized paths for companies",
      storyFutureTitle: "The Near Future",
      storyFutureText:
        "We continue to innovate, expand international accreditations, and work on developing global programs to support tomorrow's skills",

      // Team
      teamTitle: "Our Team",
      teamIntro:
        "The MA-TRAINING-CONSULTING team consists of professionals united by one passion: providing effective solutions for training, digitization, and professional operations",
      founderTitle: "Main Founder",
      founderName: "Ahmed Maaloul",
      founderRole: "Founder and creator of the MA-TRAINING-CONSULTING platform",
      founderDesc:
        "Strategic consultant in training, educational innovation, and digital marketing",
      founderStory:
        "Launched the project in 2023 with the goal of connecting skills to the job market in a practical and intelligent way, through consulting training and digital solutions",
      founderLocation: "Tunisia – Global partnerships",

      // Management Team
      managementTitle: "Executive Management Team",
      programsManager: "Programs Director",
      programsDesc:
        "Oversees planning and management of training content to ensure quality and market relevance",
      digitalManager: "Digital Transformation Manager",
      digitalDesc:
        "Leads the development of digital platforms and transforms content into innovative interactive experiences",
      partnershipsManager: "Relations Manager",
      partnershipsDesc:
        "Manages the network of local and international partners, coordinates cross-border projects",
      marketingManager: "Marketing Director",
      marketingDesc:
        "Develops the institution's digital image and leads communication campaigns with the target market",

      // Expert Network
      expertNetworkTitle: "Expert Network",
      expertNetworkText:
        "We don't work alone. We have a network of partners and independent experts in Europe, the Gulf, and Africa working in the fields of:",
      consultingTraining: "Consulting training",
      projectManagement: "Project management",
      contentProduction: "Content production",
      technicalSkills: "Technical skills development",

      // CTA
      ctaTitle: "Would you like to work with us or collaborate?",
      ctaDiscover: "Discover opportunities",
      ctaContact: "Contact us",

      // Services
      servicesTitle: "Our Services",
      servicesSubtitle: "Discover our professional solutions",
      service1Title: "Practical Training",
      service1Desc:
        "Specialized training programs focused on practical application and real skills required in the modern job market",
      service2Title: "Digital Transformation",
      service2Desc:
        "Advanced technical solutions to modernize processes, improve operational efficiency, and accelerate growth",
      service3Title: "Professional Operations",
      service3Desc:
        "Proven strategies to develop institutional performance, optimize resources, and achieve strategic objectives",
      backToAbout: "Back to About",
    },
  };

  const t = translations[currentLanguage];
  const isRTL = currentLanguage === "ar";

  const values = [
    { icon: Star, key: "excellence" },
    { icon: Target, key: "impact" },
    { icon: Lightbulb, key: "innovation" },
    { icon: Users, key: "inclusion" },
    { icon: Handshake, key: "commitment" },
  ];

  const storyItems = [
    {
      year: "2023",
      icon: Brain,
      titleKey: "story2023Title",
      textKey: "story2023Text",
    },
    {
      year: "2024",
      icon: Handshake,
      titleKey: "story2024Title",
      textKey: "story2024Text",
    },
    {
      year: "2025",
      icon: Globe,
      titleKey: "story2025Title",
      textKey: "story2025Text",
    },
    {
      year: "Future",
      icon: Rocket,
      titleKey: "storyFutureTitle",
      textKey: "storyFutureText",
    },
  ];

  const managementTeam = [
    {
      icon: Target,
      titleKey: "programsManager",
      descKey: "programsDesc",
      color: "blue",
    },
    {
      icon: Globe,
      titleKey: "digitalManager",
      descKey: "digitalDesc",
      color: "purple",
    },
    {
      icon: Handshake,
      titleKey: "partnershipsManager",
      descKey: "partnershipsDesc",
      color: "green",
    },
    {
      icon: Star,
      titleKey: "marketingManager",
      descKey: "marketingDesc",
      color: "orange",
    },
  ];

  const services = [
    {
      icon: Target,
      titleKey: "service1Title",
      descKey: "service1Desc",
      gradient: "from-blue-500 to-blue-700",
    },
    {
      icon: Globe,
      titleKey: "service2Title",
      descKey: "service2Desc",
      gradient: "from-purple-500 to-purple-700",
    },
    {
      icon: BarChart3,
      titleKey: "service3Title",
      descKey: "service3Desc",
      gradient: "from-green-500 to-green-700",
    },
  ];

  if (showServices) {
    return (
      <div
        className={`min-h-screen bg-white ${isRTL ? "rtl font-arabic" : "ltr"}`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Language Switcher */}
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-white rounded-full shadow-lg p-2 flex gap-2">
            {(["fr", "ar", "en"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setCurrentLanguage(lang)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                  currentLanguage === lang
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                }`}
              >
                {lang === "ar"
                  ? "عربي"
                  : lang === "fr"
                  ? "Français"
                  : "English"}
              </button>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="container mx-auto px-6 pt-8">
          <button
            onClick={() => setShowServices(false)}
            className={`flex items-center ${
              isRTL ? "space-x-reverse" : ""
            } space-x-2 text-blue-600 hover:text-blue-700 transition-colors font-medium`}
          >
            <ArrowLeft className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
            <span className="font-medium">{t.backToAbout}</span>
          </button>
        </div>

        {/* Services Section */}
        <section className="relative py-24 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-100 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-br from-purple-200/20 to-indigo-200/20 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div
              className={`max-w-7xl mx-auto text-center ${
                isRTL ? "font-arabic" : ""
              }`}
            >
              {/* Section header */}
              <div className="mb-20">
                <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-md rounded-full px-6 py-3 mb-8 border border-white/40 shadow-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span
                    className={`${
                      isRTL ? "font-arabic" : ""
                    } text-blue-600 font-semibold text-sm`}
                  >
                    Solutions Professionnelles
                  </span>
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>

                <h1
                  className={`${
                    isRTL ? "font-arabic" : "font-display"
                  } text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-8 ${
                    isRTL ? "" : "tracking-tight"
                  } leading-tight`}
                >
                  {t.servicesTitle}
                </h1>

                <p
                  className={`${
                    isRTL ? "font-arabic" : "font-sans"
                  } text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed font-medium`}
                >
                  {t.servicesSubtitle}
                </p>

                <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {services.map((service, index) => (
                  <div
                    key={index}
                    className="group relative bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-700 overflow-hidden border border-gray-100 hover:border-blue-200 hover:-translate-y-4 hover:scale-105"
                  >
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="p-10 relative z-10">
                      {/* Icon with enhanced design */}
                      <div className="relative mb-8">
                        <div
                          className={`w-24 h-24 bg-gradient-to-br ${service.gradient} rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                        >
                          <service.icon className="w-12 h-12 text-white" />
                        </div>
                        {/* Floating badge */}
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                          <Star className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      <h3
                        className={`${
                          isRTL ? "font-arabic" : "font-display"
                        } text-2xl md:text-3xl font-bold text-gray-900 mb-6 group-hover:text-blue-800 transition-colors duration-300`}
                      >
                        {t[service.titleKey as keyof typeof t]}
                      </h3>

                      <p
                        className={`${
                          isRTL ? "font-arabic" : ""
                        } text-gray-600 leading-relaxed text-lg font-medium`}
                      >
                        {t[service.descKey as keyof typeof t]}
                      </p>


                    </div>

                    {/* Bottom gradient line */}
                    <div
                      className={`absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r ${service.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left`}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-white ${isRTL ? "rtl font-arabic" : "ltr"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Language Switcher */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white rounded-full shadow-lg p-2 flex gap-2">
          {(["fr", "ar", "en"] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setCurrentLanguage(lang)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                currentLanguage === lang
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
              }`}
            >
              {lang === "ar" ? "عربي" : lang === "fr" ? "Français" : "English"}
            </button>
          ))}
        </div>
      </div>

      {/* Back Button */}
      <div className="container mx-auto px-6 pt-8">
        <button
          onClick={onBack}
          className={`flex items-center ${
            isRTL ? "space-x-reverse" : ""
          } space-x-2 text-blue-600 hover:text-blue-700 transition-colors font-medium`}
        >
          <ArrowLeft className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
          <span className="font-medium">{t.back}</span>
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div
            className={`max-w-5xl mx-auto text-center ${
              isRTL ? "font-arabic" : ""
            } transform transition-all duration-1000 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            {/* Premium badge */}
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-md rounded-full px-6 py-3 mb-8 border border-white/40 shadow-lg">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span
                className={`${
                  isRTL ? "font-arabic" : ""
                } text-blue-600 font-semibold text-sm`}
              >
                Excellence & Innovation
              </span>
              <Award className="w-5 h-5 text-purple-600" />
            </div>

            <h1
              className={`${
                isRTL ? "font-arabic" : "font-display"
              } text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-8 ${
                isRTL ? "" : "tracking-tight"
              } leading-tight`}
            >
              {t.heroTitle}
            </h1>

            <p
              className={`${
                isRTL ? "font-arabic" : "font-sans"
              } text-xl md:text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed font-medium`}
            >
              {t.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setShowServices(true)}
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white font-bold py-4 px-10 rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:scale-105 hover:-translate-y-1"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>{t.heroCta}</span>
                  <TrendingUp className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-blue-50 rounded-full px-6 py-2 mb-6">
                <Star className="w-5 h-5 text-blue-600" />
                <span
                  className={`${
                    isRTL ? "font-arabic" : ""
                  } text-blue-600 font-semibold text-sm`}
                >
                  Notre Fondation
                </span>
              </div>
              <h2
                className={`${
                  isRTL ? "font-arabic" : "font-display"
                } text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-6`}
              >
                {t.visionMissionTitle}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="p-10 relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Star className="w-10 h-10 text-white" />
                  </div>
                  <h3
                    className={`${
                      isRTL ? "font-arabic" : "font-display"
                    } text-3xl font-bold text-gray-900 mb-6 group-hover:text-blue-800 transition-colors duration-300`}
                  >
                    {t.visionTitle}
                  </h3>
                  <p
                    className={`${
                      isRTL ? "font-arabic" : ""
                    } text-gray-700 leading-relaxed text-lg font-medium`}
                  >
                    {t.visionText}
                  </p>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </div>
              </div>

              <div className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-purple-200">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="p-10 relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Target className="w-10 h-10 text-white" />
                  </div>
                  <h3
                    className={`${
                      isRTL ? "font-arabic" : "font-display"
                    } text-3xl font-bold text-gray-900 mb-6 group-hover:text-purple-800 transition-colors duration-300`}
                  >
                    {t.missionTitle}
                  </h3>
                  <p
                    className={`${
                      isRTL ? "font-arabic" : ""
                    } text-gray-700 leading-relaxed text-lg font-medium`}
                  >
                    {t.missionText}
                  </p>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-200/20 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-indigo-200/20 rounded-full blur-xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-md rounded-full px-6 py-3 mb-6 border border-white/40 shadow-lg">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span
                  className={`${
                    isRTL ? "font-arabic" : ""
                  } text-purple-600 font-semibold text-sm`}
                >
                  Nos Principes
                </span>
              </div>
              <h2
                className={`${
                  isRTL ? "font-arabic" : "font-display"
                } text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-blue-800 bg-clip-text text-transparent mb-6`}
              >
                {t.valuesTitle}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {values.map((value, index) => (
                <div key={index} className="group relative">
                  <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 text-center border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 relative overflow-hidden">
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

                    <div className="relative z-10">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        <value.icon className="w-10 h-10 text-white" />
                      </div>
                      <h3
                        className={`${
                          isRTL ? "font-arabic" : ""
                        } text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-800 transition-colors duration-300`}
                      >
                        {t[value.key as keyof typeof t]}
                      </h3>
                    </div>

                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-indigo-100/30 to-blue-100/30 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full px-6 py-3 mb-6 border border-blue-100">
                <Rocket className="w-5 h-5 text-blue-600" />
                <span
                  className={`${
                    isRTL ? "font-arabic" : ""
                  } text-blue-600 font-semibold text-sm`}
                >
                  Notre Parcours
                </span>
              </div>
              <h2
                className={`${
                  isRTL ? "font-arabic" : "font-display"
                } text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6`}
              >
                {t.storyTitle}
              </h2>
              <p
                className={`${
                  isRTL ? "font-arabic" : ""
                } text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-medium`}
              >
                {t.storySubtitle}
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full mt-6"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {storyItems.map((item, index) => (
                <div key={index} className="group relative">
                  <div className="bg-white rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 hover:-translate-y-3 hover:scale-105 relative overflow-hidden">
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

                    <div className="relative z-10">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                        <item.icon className="w-10 h-10 text-white" />
                      </div>

                      <div
                        className={`${
                          isRTL ? "font-arabic" : ""
                        } inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold px-4 py-2 rounded-full mb-4 shadow-md`}
                      >
                        {item.year}
                      </div>

                      <h3
                        className={`${
                          isRTL ? "font-arabic" : ""
                        } text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-800 transition-colors duration-300`}
                      >
                        {t[item.titleKey as keyof typeof t]}
                      </h3>

                      <p
                        className={`${
                          isRTL ? "font-arabic" : ""
                        } text-gray-600 text-sm leading-relaxed font-medium`}
                      >
                        {t[item.textKey as keyof typeof t]}
                      </p>
                    </div>

                    {/* Progress indicator */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-blue-50/40 to-purple-50/40 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-10 left-10 w-64 h-64 bg-gradient-to-br from-purple-200/20 to-indigo-200/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-md rounded-full px-6 py-3 mb-6 border border-white/40 shadow-lg">
                <Users className="w-5 h-5 text-blue-600" />
                <span
                  className={`${
                    isRTL ? "font-arabic" : ""
                  } text-blue-600 font-semibold text-sm`}
                >
                  Notre Équipe
                </span>
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <h2
                className={`${
                  isRTL ? "font-arabic" : "font-display"
                } text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6`}
              >
                {t.teamTitle}
              </h2>
              <p
                className={`${
                  isRTL ? "font-arabic" : ""
                } text-xl md:text-2xl text-gray-700 mb-8 text-center max-w-5xl mx-auto leading-relaxed font-medium`}
              >
                {t.teamIntro}
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
            </div>

            {/* Founder */}
            <div className="group relative bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-700 mb-20 overflow-hidden border border-gray-100 hover:border-blue-200">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="p-10 md:p-12 relative z-10">
                <div
                  className={`flex flex-col lg:flex-row items-center space-y-8 lg:space-y-0 ${
                    isRTL ? "lg:space-x-reverse" : ""
                  } lg:space-x-12`}
                >
                  <div className="relative">
                    <div className="w-40 h-40 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      <Brain className="w-20 h-20 text-white" />
                    </div>
                    {/* Floating badge */}
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      CEO
                    </div>
                  </div>

                  <div
                    className={`flex-1 text-center ${
                      isRTL ? "lg:text-right" : "lg:text-left"
                    } space-y-4`}
                  >
                    <div>
                      <h3
                        className={`${
                          isRTL ? "font-arabic" : "font-display"
                        } text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-3`}
                      >
                        {t.founderName}
                      </h3>
                      <div
                        className={`${
                          isRTL ? "font-arabic" : ""
                        } inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-4 py-2 rounded-full text-sm mb-4 shadow-md`}
                      >
                        {t.founderTitle}
                      </div>
                    </div>

                    <div
                      className={`${
                        isRTL ? "font-arabic" : ""
                      } text-gray-800 font-semibold text-lg mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100`}
                    >
                      {t.founderRole}
                    </div>

                    <p
                      className={`${
                        isRTL ? "font-arabic" : ""
                      } text-gray-700 text-lg leading-relaxed mb-4 font-medium`}
                    >
                      {t.founderDesc}
                    </p>

                    <p
                      className={`${
                        isRTL ? "font-arabic" : ""
                      } text-gray-600 leading-relaxed mb-6 font-medium`}
                    >
                      {t.founderStory}
                    </p>

                    <div
                      className={`flex items-center ${
                        isRTL
                          ? "justify-center lg:justify-end space-x-reverse"
                          : "justify-center lg:justify-start"
                      } space-x-3 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-2xl border border-blue-100`}
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <span
                        className={`${
                          isRTL ? "font-arabic" : ""
                        } text-blue-800 font-semibold`}
                      >
                        {t.founderLocation}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom gradient line */}
              <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
            </div>

            {/* Management Team */}
            <div className="mb-20">
              <div className="text-center mb-16">
                <h3
                  className={`${
                    isRTL ? "font-arabic" : "font-display"
                  } text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-purple-800 bg-clip-text text-transparent mb-4`}
                >
                  {t.managementTitle}
                </h3>
                <div className="w-20 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {managementTeam.map((member, index) => (
                  <div
                    key={index}
                    className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 hover:-translate-y-2 hover:scale-105 overflow-hidden"
                  >
                    {/* Gradient overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br from-${member.color}-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}
                    ></div>

                    <div className="relative z-10">
                      <div
                        className={`w-16 h-16 bg-gradient-to-br from-${member.color}-500 to-${member.color}-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                      >
                        <member.icon className="w-8 h-8 text-white" />
                      </div>

                      <h4
                        className={`${
                          isRTL ? "font-arabic" : ""
                        } text-xl font-bold text-gray-900 mb-4 group-hover:text-${
                          member.color
                        }-800 transition-colors duration-300`}
                      >
                        {t[member.titleKey as keyof typeof t]}
                      </h4>

                      <p
                        className={`${
                          isRTL ? "font-arabic" : ""
                        } text-gray-600 leading-relaxed font-medium`}
                      >
                        {t[member.descKey as keyof typeof t]}
                      </p>
                    </div>

                    {/* Bottom accent line */}
                    <div
                      className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-${member.color}-500 to-${member.color}-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-full`}
                    ></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expert Network */}
            <div className="group relative bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-700 overflow-hidden border border-gray-100 hover:border-purple-200">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="p-10 md:p-12 text-center relative z-10">
                <div className="mb-8">
                  <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-full px-6 py-3 mb-6 border border-purple-100">
                    <Globe className="w-5 h-5 text-purple-600" />
                    <span
                      className={`${
                        isRTL ? "font-arabic" : ""
                      } text-purple-600 font-semibold text-sm`}
                    >
                      Réseau Global
                    </span>
                  </div>

                  <h3
                    className={`${
                      isRTL ? "font-arabic" : "font-display"
                    } text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-purple-800 bg-clip-text text-transparent mb-6`}
                  >
                    {t.expertNetworkTitle}
                  </h3>

                  <p
                    className={`${
                      isRTL ? "font-arabic" : ""
                    } text-gray-700 leading-relaxed text-lg font-medium max-w-4xl mx-auto mb-10`}
                  >
                    {t.expertNetworkText}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="group/item bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-blue-200">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover/item:scale-110 transition-transform duration-300">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <span
                      className={`${
                        isRTL ? "font-arabic" : ""
                      } text-blue-800 font-semibold text-sm`}
                    >
                      {t.consultingTraining}
                    </span>
                  </div>

                  <div className="group/item bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-purple-200">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover/item:scale-110 transition-transform duration-300">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <span
                      className={`${
                        isRTL ? "font-arabic" : ""
                      } text-purple-800 font-semibold text-sm`}
                    >
                      {t.projectManagement}
                    </span>
                  </div>

                  <div className="group/item bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-green-200">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover/item:scale-110 transition-transform duration-300">
                      <Lightbulb className="w-6 h-6 text-white" />
                    </div>
                    <span
                      className={`${
                        isRTL ? "font-arabic" : ""
                      } text-green-800 font-semibold text-sm`}
                    >
                      {t.contentProduction}
                    </span>
                  </div>

                  <div className="group/item bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-orange-200">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover/item:scale-110 transition-transform duration-300">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <span
                      className={`${
                        isRTL ? "font-arabic" : ""
                      } text-orange-800 font-semibold text-sm`}
                    >
                      {t.technicalSkills}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom gradient line */}
              <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-10 right-10 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Premium badge */}
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md rounded-full px-6 py-3 mb-8 border border-white/30">
              <Handshake className="w-5 h-5 text-white" />
              <span
                className={`${
                  isRTL ? "font-arabic" : ""
                } text-white font-semibold text-sm`}
              >
                Rejoignez-nous
              </span>
              <Sparkles className="w-5 h-5 text-white" />
            </div>

            <h2
              className={`${
                isRTL ? "font-arabic" : "font-display"
              } text-4xl md:text-6xl font-bold text-white mb-8 leading-tight`}
            >
              {t.ctaTitle}
            </h2>

            <div className="w-24 h-1 bg-white/60 mx-auto rounded-full mb-12"></div>

            <div
              className={`flex flex-col sm:flex-row gap-6 justify-center items-center ${
                isRTL ? "space-x-reverse" : ""
              }`}
            >
              <button
                onClick={onNavigateToPartner}
                className={`${
                  isRTL ? "font-arabic" : ""
                } group relative overflow-hidden bg-white text-blue-600 font-bold py-4 px-10 rounded-full shadow-2xl hover:shadow-white/25 transition-all duration-500 hover:scale-105 hover:-translate-y-1 border-2 border-white cursor-pointer`}
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>{t.ctaDiscover}</span>
                  <TrendingUp className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
              </button>

              <button
                onClick={handleContactClick}
                className={`${
                  isRTL ? "font-arabic" : ""
                } group relative overflow-hidden bg-transparent text-white font-bold py-4 px-10 rounded-full border-2 border-white/60 hover:border-white shadow-2xl hover:shadow-white/25 transition-all duration-500 hover:scale-105 hover:-translate-y-1 backdrop-blur-md cursor-pointer`}
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>{t.ctaContact}</span>
                  <Handshake className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
              </button>
            </div>

            {/* Stats or additional info */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">50+</div>
                <div
                  className={`${
                    isRTL ? "font-arabic" : ""
                  } text-white/80 text-sm`}
                >
                  Projets Réalisés
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">15+</div>
                <div
                  className={`${
                    isRTL ? "font-arabic" : ""
                  } text-white/80 text-sm`}
                >
                  Partenaires Internationaux
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">98%</div>
                <div
                  className={`${
                    isRTL ? "font-arabic" : ""
                  } text-white/80 text-sm`}
                >
                  Satisfaction Client
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
