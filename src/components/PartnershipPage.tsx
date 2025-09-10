import { useState } from "react";
import {
  ArrowLeft,
  Home,
  BookOpen,
  Laptop,
  TrendingUp,
  Building2,
  Plus,
  Rocket,
  Mail,
  AlertTriangle,
  LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  conditions: string[];
  mailSubject: string;
}

const PartnershipPage: React.FC<PartnershipPageProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const partnershipTypes: PartnershipType[] = [
    {
      id: "formateur",
      title: "Formateur",
      icon: "📘",
      lucideIcon: BookOpen,
      description:
        "Rejoignez notre équipe de formateurs experts et partagez vos connaissances avec nos apprenants.",
      color: "blue",
      gradient: "from-blue-500 to-blue-600",
      conditions: [
        "Minimum 3 ans d'expérience dans votre domaine",
        "Diplôme ou certifications reconnues",
        "Excellentes compétences pédagogiques",
        "Disponibilité flexible pour les formations",
        "Maîtrise des outils numériques",
      ],
      mailSubject: "Candidature Formateur - Programme de Partenariat",
    },
    {
      id: "freelance",
      title: "Freelance",
      icon: "💻",
      lucideIcon: Laptop,
      description:
        "Collaborez avec nous en tant que freelance pour des missions ponctuelles ou récurrentes.",
      color: "green",
      gradient: "from-green-500 to-green-600",
      conditions: [
        "Portfolio démontrant vos compétences",
        "Expérience en freelancing ou projets indépendants",
        "Capacité à respecter les délais",
        "Communication professionnelle",
        "Spécialisation dans un domaine technique",
      ],
      mailSubject: "Candidature Freelance - Programme de Partenariat",
    },
    {
      id: "commercial",
      title: "Commercial / Affilié",
      icon: "📈",
      lucideIcon: TrendingUp,
      description:
        "Devenez notre partenaire commercial et bénéficiez de commissions attractives sur les ventes.",
      color: "orange",
      gradient: "from-orange-500 to-orange-600",
      conditions: [
        "Expérience en vente ou marketing",
        "Réseau professionnel développé",
        "Compétences en négociation",
        "Motivation et esprit entrepreneurial",
        "Connaissance du secteur de la formation",
      ],
      mailSubject: "Candidature Commercial/Affilié - Programme de Partenariat",
    },
    {
      id: "entreprise",
      title: "Entreprise / École",
      icon: "🏢",
      lucideIcon: Building2,
      description:
        "Établissez un partenariat institutionnel pour des formations sur mesure et des collaborations durables.",
      color: "purple",
      gradient: "from-purple-500 to-purple-600",
      conditions: [
        "Entreprise ou institution éducative établie",
        "Besoin récurrent en formation",
        "Capacité de collaboration à long terme",
        "Budget dédié à la formation",
        "Engagement dans le développement des compétences",
      ],
      mailSubject: "Partenariat Institutionnel - Programme de Partenariat",
    },
  ];

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

    return `mailto:ahmedmaalou78l@gmail.com?subject=${encodeURIComponent(
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
        <div className="container mx-auto px-6 py-4">
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
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center space-x-3 bg-white rounded-full px-6 py-3 shadow-lg mb-8">
            <span className="text-3xl">🤝</span>
            <span className="text-lg font-semibold text-gray-700">
              Programme de Partenariat
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Rejoignez Notre
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
              Écosystème de Partenaires
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Découvrez nos opportunités de collaboration et développez votre
            carrière avec nous. Choisissez le type de partenariat qui correspond
            à vos ambitions.
          </p>
        </div>

        {/* Partnership Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {partnershipTypes.map((partnership, index) => (
            <div
              key={partnership.id}
              className={`partnership-card bg-white rounded-3xl shadow-xl overflow-hidden transform transition-all duration-500 hover:scale-105 hover:-rotate-1 animate-slide-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Card Header */}
              <div
                className={`bg-gradient-to-r ${partnership.gradient} p-8 text-white relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="text-4xl">{partnership.icon}</div>
                    <partnership.lucideIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    {partnership.title}
                  </h3>
                  <p className="text-white/90 leading-relaxed">
                    {partnership.description}
                  </p>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-8">
                <button
                  onClick={() => toggleCard(partnership.id)}
                  className={`w-full flex items-center justify-center space-x-2 bg-gradient-to-r ${partnership.gradient} text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-105`}
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
                      ? "max-h-96 opacity-100 mt-6"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                      <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></span>
                      Conditions requises :
                    </h4>
                    <ul className="space-y-2 mb-6">
                      {partnership.conditions.map((condition, idx) => (
                        <li
                          key={idx}
                          className="flex items-start space-x-3 text-gray-700"
                        >
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>{condition}</span>
                        </li>
                      ))}
                    </ul>

                    {partnership.id === "formateur" ? (
                      <button
                        onClick={handleTrainerAccess}
                        className={`inline-flex items-center space-x-2 bg-gradient-to-r ${partnership.gradient} text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-105`}
                      >
                        <Rocket className="w-5 h-5" />
                        <span>Accéder à l'Espace Formateur</span>
                      </button>
                    ) : partnership.id === "freelance" ? (
                      <button
                        onClick={handleFreelancerAccess}
                        className={`inline-flex items-center space-x-2 bg-gradient-to-r ${partnership.gradient} text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-105`}
                      >
                        <Rocket className="w-5 h-5" />
                        <span>Accéder à l'Espace Freelancer</span>
                      </button>
                    ) : partnership.id === "commercial" ? (
                      <button
                        onClick={handleCommercialAccess}
                        className={`inline-flex items-center space-x-2 bg-gradient-to-r ${partnership.gradient} text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-105`}
                      >
                        <Rocket className="w-5 h-5" />
                        <span>Accéder à l'Espace Commercial</span>
                      </button>
                    ) : partnership.id === "entreprise" ? (
                      <button
                        onClick={handlePartnershipAccess}
                        className={`inline-flex items-center space-x-2 bg-gradient-to-r ${partnership.gradient} text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-105`}
                      >
                        <Rocket className="w-5 h-5" />
                        <span>Accéder à l'Espace Partenariat</span>
                      </button>
                    ) : (
                      <a
                        href={generateMailto(partnership)}
                        className={`inline-flex items-center space-x-2 bg-gradient-to-r ${partnership.gradient} text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-105`}
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
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center animate-fade-in">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <Mail className="w-8 h-8 text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-900">
                📩 Envoyer une demande d'inscription
              </h2>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-8">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Pour rejoindre notre programme de partenariat, veuillez envoyer
                les documents suivants par e-mail : vos coordonnées complètes,
                votre CV, une lettre de motivation, une présentation de votre
                vision ou programme de partenariat, ainsi que votre portfolio si
                disponible.
              </p>

              <p className="text-lg text-gray-700 mb-6">
                Nous vous contacterons par e-mail sous{" "}
                <span className="font-bold text-blue-600">48 heures</span> pour
                finaliser votre inscription.
              </p>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <p className="text-sm text-gray-600 mb-3">
                  Adresse email de contact :
                </p>
                <a
                  href="mailto:entreprise@gmail.com"
                  className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200"
                >
                  entreprise@gmail.com
                </a>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
                <span className="font-bold text-yellow-800">
                  ⚠️ Remarque importante
                </span>
              </div>
              <p className="text-yellow-800">
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
