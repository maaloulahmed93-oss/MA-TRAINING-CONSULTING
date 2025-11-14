import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Mail, AlertTriangle, BookOpen, Laptop, TrendingUp, Building, ArrowLeft, Home, Plus, Rocket, type LucideIcon } from 'lucide-react';
import GlobalEmailService from '../services/globalEmailService';
import partnershipsApiService from '../services/partnershipsApiService';

interface PartnershipPageProps {
  onBack: () => void;
}
interface PartnershipType {
  id: string;
  title: string;
  icon: string;
  lucideIcon: LucideIcon;
  description: string;
  color: string;
  gradient: string;
  details: string[];      // Points de détail
  conditions: string[];   // Conditions requises
  mailSubject: string;
  contactEmail?: string;
}

interface PartnerExtraInfo {
  title: string;
  subtitle: string;
  intro: string;
  icon: string;
  color: string;
  gradient: string;
  details: string[];
  requirements: string[];
  ctaLabel: string;
  contactEmail?: string;
  mailSubject: string;
  updatedAt: string;
}

type PartnerCategoryKey = 'formateur' | 'freelance' | 'commercial' | 'entreprise';

const PartnershipPage: React.FC<PartnershipPageProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [partnershipTypes, setPartnershipTypes] = useState<PartnershipType[]>([]);
  const [globalEmail, setGlobalEmail] = useState<string>('ahmedmaalou78l@gmail.com');

  // Fonction pour lire les données depuis localStorage
  const loadPartnershipData = (): Record<PartnerCategoryKey, PartnerExtraInfo> => {
    try {
      const raw = localStorage.getItem('partner_extra_info_v1');
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Error loading partnership data:', e);
    }
    return {} as Record<PartnerCategoryKey, PartnerExtraInfo>;
  };

  // Mapping des icônes Lucide
  const getLucideIcon = (id: string): LucideIcon => {
    switch (id) {
      case 'formateur': return BookOpen;
      case 'freelance': return Laptop;
      case 'commercial': return TrendingUp;
      case 'entreprise': return Building;
      default: return BookOpen;
    }
  };

  useEffect(() => {
    const loadPartnerships = async () => {
      try {
        console.log('🔄 Loading partnerships from API...');
        const apiPartnerships = await partnershipsApiService.getPartnershipsForFrontend();
        
        if (apiPartnerships && apiPartnerships.length > 0) {
          console.log('✅ Partnerships loaded from API:', apiPartnerships.length);
          console.log('API Partnerships:', apiPartnerships);
          
          // Get visibility settings from Backend API
          let visibilitySettings: any = {};
          
          try {
            console.log('🔄 Fetching visibility settings from Backend...');
            const visibilityResponse = await fetch('https://matc-backend.onrender.com/api/partnerships/visibility');
            
            if (visibilityResponse.ok) {
              const visibilityData = await visibilityResponse.json();
              if (visibilityData.success) {
                visibilitySettings = visibilityData.data;
                console.log('👁️ Backend visibility settings:', visibilitySettings);
              }
            } else {
              console.warn('⚠️ Could not fetch visibility settings from Backend');
            }
          } catch (error) {
            console.error('❌ Error fetching visibility settings:', error);
          }
          
          // Filter partnerships based on Backend visibility settings
          const visiblePartnerships = apiPartnerships.filter(p => {
            const backendData = visibilitySettings[p.id];
            const isVisible = backendData ? backendData.isVisible !== false : true; // Default to visible if no backend data
            console.log(`Partnership ${p.id}: Backend isVisible = ${isVisible}`);
            return isVisible;
          });
          
          console.log('👁️ Visible partnerships:', visiblePartnerships.length, 'out of', apiPartnerships.length);
          console.log('Visible IDs:', visiblePartnerships.map(p => p.id));
          setPartnershipTypes(visiblePartnerships);
        } else {
          console.log('⚠️ No API data, trying localStorage...');
          const partnerData = loadPartnershipData();
          const fallbackTypes = createFallbackTypes(partnerData);
          console.log('📦 Using fallback data:', fallbackTypes.length, fallbackTypes);
          setPartnershipTypes(fallbackTypes);
        }
      } catch (error) {
        console.error('❌ Error loading partnerships:', error);
        const partnerData = loadPartnershipData();
        const fallbackTypes = createFallbackTypes(partnerData);
        setPartnershipTypes(fallbackTypes);
      }
    };

    loadPartnerships();
  }, []);

  // Load global email from backend
  useEffect(() => {
    const loadGlobalEmail = async () => {
      try {
        // Clear cache to force fresh fetch
        GlobalEmailService.clearCache();
        const email = await GlobalEmailService.getGlobalEmail();
        setGlobalEmail(email);
        console.log('📧 Global email loaded:', email);
      } catch (error) {
        console.error('❌ Error loading global email:', error);
      }
    };

    loadGlobalEmail();
    
    // Also reload email every 30 seconds to catch updates
    const interval = setInterval(loadGlobalEmail, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Create fallback types from localStorage
  const createFallbackTypes = (partnerData: Record<PartnerCategoryKey, PartnerExtraInfo>): PartnershipType[] => {
    return [
      {
        id: "formateur",
        title: partnerData.formateur?.title || "Formateur",
        icon: partnerData.formateur?.icon || "📘",
        lucideIcon: getLucideIcon("formateur"),
        description: partnerData.formateur?.intro || "Rejoignez notre équipe de formateurs experts et partagez vos connaissances avec nos apprenants.",
        color: partnerData.formateur?.color || "blue",
        gradient: partnerData.formateur?.gradient || "from-blue-500 to-blue-600",
        details: partnerData.formateur?.details || [
          "Encadrer des sessions en présentiel et à distance",
          "Concevoir des supports pédagogiques de qualité",
          "Évaluer et suivre la progression des apprenants",
        ],
        conditions: partnerData.formateur?.requirements || [
          "Minimum 3 ans d'expérience dans votre domaine",
          "Diplôme ou certifications reconnues",
          "Excellentes compétences pédagogiques",
          "Disponibilité flexible pour les formations",
          "Maîtrise des outils numériques",
        ],
        mailSubject: partnerData.formateur?.mailSubject || "Candidature Formateur - Programme de Partenariat",
        contactEmail: partnerData.formateur?.contactEmail || "ahmedmaalou78l@gmail.com",
      },
      {
        id: "freelance",
        title: partnerData.freelance?.title || "Freelance",
        icon: partnerData.freelance?.icon || "💻",
        lucideIcon: getLucideIcon("freelance"),
        description: partnerData.freelance?.intro || "Collaborez avec nous en tant que freelance pour des missions ponctuelles ou récurrentes.",
        color: partnerData.freelance?.color || "green",
        gradient: partnerData.freelance?.gradient || "from-green-500 to-green-600",
        details: partnerData.freelance?.details || [
          "Missions adaptées à votre expertise",
          "Collaboration flexible et agile",
          "Facturation simple et transparente",
        ],
        conditions: partnerData.freelance?.requirements || [
          "Portfolio démontrant vos compétences",
          "Expérience en freelancing ou projets indépendants",
          "Capacité à respecter les délais",
          "Communication professionnelle",
          "Spécialisation dans un domaine technique",
        ],
        mailSubject: partnerData.freelance?.mailSubject || "Candidature Freelance - Programme de Partenariat",
        contactEmail: partnerData.freelance?.contactEmail || "ahmedmaalou78l@gmail.com",
      },
      {
        id: "commercial",
        title: partnerData.commercial?.title || "Commercial / Affilié",
        icon: partnerData.commercial?.icon || "📈",
        lucideIcon: getLucideIcon("commercial"),
        description: partnerData.commercial?.intro || "Devenez notre partenaire commercial et bénéficiez de commissions attractives sur les ventes.",
        color: partnerData.commercial?.color || "orange",
        gradient: partnerData.commercial?.gradient || "from-orange-500 to-orange-600",
        details: partnerData.commercial?.details || [
          "Programme de commissions motivant",
          "Outils marketing fournis",
          "Suivi et reporting dédiés",
        ],
        conditions: partnerData.commercial?.requirements || [
          "Expérience en vente ou marketing",
          "Réseau professionnel développé",
          "Compétences en négociation",
          "Motivation et esprit entrepreneurial",
          "Connaissance du secteur de la formation",
        ],
        mailSubject: partnerData.commercial?.mailSubject || "Candidature Commercial/Affilié - Programme de Partenariat",
        contactEmail: partnerData.commercial?.contactEmail || "ahmedmaalou78l@gmail.com",
      },
      {
        id: "entreprise",
        title: partnerData.entreprise?.title || "Entreprise / École",
        icon: partnerData.entreprise?.icon || "🏢",
        lucideIcon: getLucideIcon("entreprise"),
        description: partnerData.entreprise?.intro || "Établissez un partenariat institutionnel pour des formations sur mesure et des collaborations durables.",
        color: partnerData.entreprise?.color || "purple",
        gradient: partnerData.entreprise?.gradient || "from-purple-500 to-purple-600",
        details: partnerData.entreprise?.details || [
          "Programmes adaptés aux objectifs",
          "Accompagnement et suivi personnalisés",
          "Modalités intra/inter-entreprise",
        ],
        conditions: partnerData.entreprise?.requirements || [
          "Entreprise ou institution éducative établie",
          "Besoin récurrent en formation",
          "Capacité de collaboration à long terme",
          "Budget dédié à la formation",
          "Engagement dans le développement des compétences",
        ],
        mailSubject: partnerData.entreprise?.mailSubject || "Partenariat Institutionnel - Programme de Partenariat",
        contactEmail: partnerData.entreprise?.contactEmail || "ahmedmaalou78l@gmail.com",
      },
    ];
  };

  const toggleCard = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const generateMailto = (partnership: PartnershipType) => {
    const body = `Bonjour,

Je souhaite rejoindre votre programme de partenariat en tant que ${partnership.title}.

Mes informations :
- Nom : [Votre nom complet]
- Email : [Votre email]
- Téléphone : [Votre numéro]

Documents joints :
- CV : [À joindre]
- Lettre de motivation : [À joindre]
- Vision/Programme : [Décrivez votre vision ou programme de partenariat]
- Portfolio : [Lien vers votre portfolio si disponible]

Cordialement,
[Votre nom]`;

    return `mailto:${globalEmail}?subject=${encodeURIComponent(
      partnership.mailSubject
    )}&body=${encodeURIComponent(body)}`;
  };

  const handleTrainerAccess = () => {
    navigate("/espace-formateur");
  };

  const handleFreelancerAccess = () => {
    navigate("/espace-freelancer");
  };

  const handleCommercialAccess = () => {
    navigate("/espace-commercial");
  };

  const handlePartnershipAccess = () => {
    navigate("/espace-partenariat");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Retour</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Accueil</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-10 sm:mb-16 animate-fade-in">
          <div className="inline-flex items-center space-x-3 bg-white rounded-full px-4 sm:px-6 py-2.5 sm:py-3 shadow-lg mb-6 sm:mb-8">
            <span className="text-3xl">🤝</span>
            <span className="text-lg font-semibold text-gray-700">
              Programme de Partenariat
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight break-words">
            Rejoignez Notre
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
              Écosystème de Partenaires
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
            Découvrez nos opportunités de collaboration et développez votre
            carrière avec nous. Choisissez le type de partenariat qui correspond
            à vos ambitions.
          </p>
        </div>

        {/* Partnership Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-20 w-full">
{/* Debug: {partnershipTypes.length} partnerships */}
          {partnershipTypes.map((partnership, index) => (
            <div
              key={partnership.id}
              className={`partnership-card bg-white rounded-3xl shadow-xl overflow-hidden transform transition-transform duration-300 hover:scale-105 opacity-100`}
              style={{ animationDelay: `${index * 0.1}s`, visibility: 'visible', display: 'block' }}
            >
              {/* Card Header */}
              <div
                className="p-6 sm:p-8 text-white relative overflow-hidden min-h-[140px] sm:min-h-[180px] lg:min-h-[200px]"
                style={{ 
                  background: partnership.id === 'formateur' ? 'linear-gradient(to right, #3b82f6, #1d4ed8)' :
                             partnership.id === 'freelance' ? 'linear-gradient(to right, #10b981, #059669)' :
                             partnership.id === 'commercial' ? 'linear-gradient(to right, #f59e0b, #d97706)' :
                             partnership.id === 'entreprise' ? 'linear-gradient(to right, #8b5cf6, #7c3aed)' :
                             'linear-gradient(to right, #3b82f6, #1d4ed8)'
                }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                    <div className="text-3xl sm:text-4xl">{partnership.icon}</div>
                    {partnership.id === 'formateur' && <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />}
                    {partnership.id === 'freelance' && <Laptop className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />}
                    {partnership.id === 'commercial' && <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />}
                    {partnership.id === 'entreprise' && <Building className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">
                    {partnership.title}
                  </h3>
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                    {partnership.description}
                  </p>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 sm:p-8">
                <button
                  onClick={() => toggleCard(partnership.id)}
                  className="w-full flex items-center justify-center space-x-2 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold transition-all duration-300 hover:shadow-2xl transform hover:scale-105 border-2 border-white/10"
                  style={{
                    background: partnership.id === 'formateur' ? 'linear-gradient(to right, #3b82f6, #1d4ed8)' :
                               partnership.id === 'freelance' ? 'linear-gradient(to right, #10b981, #059669)' :
                               partnership.id === 'commercial' ? 'linear-gradient(to right, #f59e0b, #d97706)' :
                               partnership.id === 'entreprise' ? 'linear-gradient(to right, #8b5cf6, #7c3aed)' :
                               'linear-gradient(to right, #3b82f6, #1d4ed8)',
                    boxShadow: partnership.id === 'formateur' ? '0 8px 25px rgba(59, 130, 246, 0.3)' :
                               partnership.id === 'freelance' ? '0 8px 25px rgba(16, 185, 129, 0.3)' :
                               partnership.id === 'commercial' ? '0 8px 25px rgba(245, 158, 11, 0.3)' :
                               partnership.id === 'entreprise' ? '0 8px 25px rgba(139, 92, 246, 0.3)' :
                               '0 8px 25px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <Plus
                    className={`w-5 h-5 transition-transform duration-300 ${
                      expandedCard === partnership.id ? "rotate-45" : ""
                    }`}
                  />
                  <span>Plus de détails</span>
                </button>

                {/* Expanded Content */}
                <div
                  className={`transition-all duration-500 overflow-hidden ${
                    expandedCard === partnership.id
                      ? "max-h-[600px] opacity-100 mt-6"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="bg-gray-50 rounded-xl p-5 sm:p-6">
                    {/* Points de détail */}
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                      <span className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mr-3"></span>
                      Points de détail :
                    </h4>
                    <ul className="space-y-2 mb-6">
                      {(partnership.details || []).map((detail, idx) => (
                        <li
                          key={idx}
                          className="flex items-start space-x-3 text-gray-700 text-sm sm:text-base"
                        >
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Conditions requises */}
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                      <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></span>
                      Conditions requises :
                    </h4>
                    <ul className="space-y-2 mb-6">
                      {(partnership.conditions || []).map((condition, idx) => (
                        <li
                          key={idx}
                          className="flex items-start space-x-3 text-gray-700 text-sm sm:text-base"
                        >
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>{condition}</span>
                        </li>
                      ))}
                    </ul>

                    {partnership.id === "formateur" ? (
                      <button
                        onClick={handleTrainerAccess}
                        className="w-full sm:w-auto mx-auto flex items-center justify-center space-x-2 text-white py-3.5 px-5 sm:px-8 text-base rounded-xl mt-4 font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 border-2 border-white/20"
                        style={{
                          background: 'linear-gradient(to right, #3b82f6, #1d4ed8)',
                          boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
                        }}
                      >
                        <Rocket className="w-5 h-5" />
                        <span>Accéder à l'Espace Formateur</span>
                      </button>
                    ) : partnership.id === "freelance" ? (
                      <button
                        onClick={handleFreelancerAccess}
                        className="w-full sm:w-auto mx-auto flex items-center justify-center space-x-2 text-white py-3.5 px-5 sm:px-8 text-base rounded-xl mt-4 font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 border-2 border-white/20"
                        style={{
                          background: 'linear-gradient(to right, #10b981, #059669)',
                          boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        <Rocket className="w-5 h-5" />
                        <span>Accéder à l'Espace Freelancer</span>
                      </button>
                    ) : partnership.id === "commercial" ? (
                      <button
                        onClick={handleCommercialAccess}
                        className="w-full sm:w-auto mx-auto flex items-center justify-center space-x-2 text-white py-3.5 px-5 sm:px-8 text-base rounded-xl mt-4 font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 border-2 border-white/20"
                        style={{
                          background: 'linear-gradient(to right, #f59e0b, #d97706)',
                          boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)'
                        }}
                      >
                        <Rocket className="w-5 h-5" />
                        <span>Accéder à l'Espace Commercial</span>
                      </button>
                    ) : partnership.id === "entreprise" ? (
                      <button
                        onClick={handlePartnershipAccess}
                        className="w-full sm:w-auto mx-auto flex items-center justify-center space-x-2 text-white py-3.5 px-5 sm:px-8 text-base rounded-xl mt-4 font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 border-2 border-white/20"
                        style={{
                          background: 'linear-gradient(to right, #8b5cf6, #7c3aed)',
                          boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
                        }}
                      >
                        <Rocket className="w-5 h-5" />
                        <span>Accéder à l'Espace Partenariat</span>
                      </button>
                    ) : (
                      <a
                        href={generateMailto(partnership)}
                        className={`w-full sm:w-auto mx-auto flex items-center justify-center space-x-2 bg-gradient-to-r ${partnership.gradient} text-white py-3.5 px-5 sm:px-6 text-base rounded-xl mt-4 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105`}
                      >
                        <Rocket className="w-5 h-5" />
                        <span>Accéder</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 lg:p-12 text-center animate-fade-in">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-6 sm:mb-8">
              <Mail className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                📩 Envoyer une demande d'inscription
              </h2>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-5 sm:p-8 mb-6 sm:mb-8 text-left sm:text-center">
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6">
                Pour rejoindre notre programme de partenariat, veuillez envoyer
                les documents suivants par e-mail : vos coordonnées complètes,
                votre CV, une lettre de motivation, une présentation de votre
                vision ou programme de partenariat, ainsi que votre portfolio si
                disponible.
              </p>

              <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6">
                Nous vous contacterons par e-mail sous{" "}
                <span className="font-bold text-blue-600">48 heures</span> pour
                finaliser votre inscription.
              </p>

              <div className="bg-white rounded-xl p-5 sm:p-6 shadow-md break-words">
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                  Adresse email de contact :
                </p>
                <a
                  href={`mailto:${globalEmail}`}
                  className="text-xl sm:text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200 select-text break-words"
                >
                  {globalEmail}
                </a>
              </div>
              <div className="mt-4 sm:mt-6">
                <a
                  href={`mailto:${globalEmail}`}
                  className="block w-full sm:w-auto mx-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 sm:py-4 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md"
                >
                  Envoyer une demande d'inscription
                </a>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 sm:p-6">
              <div className="flex items-center justify-center space-x-3 mb-2 sm:mb-3">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                <span className="font-bold text-yellow-800">
                  ⚠️ Remarque importante
                </span>
              </div>
              <p className="text-yellow-800 text-sm sm:text-base">
                Ce mail doit être envoyé manuellement depuis votre propre boîte
                mail. Le site n'envoie pas les e-mails automatiquement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnershipPage;
